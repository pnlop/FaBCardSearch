import axios from "axios";
import { execFile } from "child_process";
import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { chromium } from 'playwright';


const client = new MongoClient(process.env.URI);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

export function onRequest(context) {
    const req = context.request;
    const requestData = req.body;
    const cardData = requestData.cardData;
    const storeUrls = requestData.storeUrls;
    const tcg = requestData.tcg;
    const tcgAbbr = requestData.tcgAbbr;
    let splitTitle;
    let color = "";
    if (tcgAbbr === "fab") {
        splitTitle = cardData.cardIdentifier.split('-');
        console.log(splitTitle);
        console.log(splitTitle[splitTitle.length - 1]);
        if (["red", "blue", "yellow"].includes(splitTitle[splitTitle.length - 1])) {
            color = splitTitle[splitTitle.length - 1];
        }
    }
    scrapeSite(storeUrls, cardData.name, tcg, tcgAbbr, color).then((results) => {
        return Response.json(results)
    });

}

async function scrapeSite(urls, cardIdentifier, tcg, tcgAbbr, color ) {
    // Perform scraping for each URL
    try {
        await client.connect();
        const database = client.db('shops');
        const shops = database.collection('shop_info');
        const results = await Promise.all( urls.map(async (url) => {
            const query = { store_url: new URL(url).hostname };
            console.log("Query: "+ JSON.stringify(query));
            const result = await shops.findOne(query);
            console.log("Query: "+ JSON.stringify(result));

            if (result === null)  {
                //try shopify request
                let response = await axios.get(url+"collections.json");
                if (response.status === 200) {
                    shops.insertOne({store_name: new URL(url).hostname, store_url:new URL(url).hostname, parsable:true, shopify:true, has_search_url: false, fab: false, mtg: false, search_url:""});
                    let scrape = await shopifyScrape(url, cardIdentifier, tcg, tcgAbbr, color);
                    let shopName = result.shop_name === "PLACEHOLDER" ? url : result.shop_name;

                    return {...scrape, shopName};
                } else {
                    //no result for this shop, use playwright
                    let scrape = playwrightScrape(url, cardIdentifier, tcg, tcgAbbr, color);
                    let shopName = result.shop_name === "PLACEHOLDER" ? url : result.shop_name;

                    return {...scrape, shopName};
                }
            } else if (result.parsable === "false") {
                //cannot be parsed, return null
                return null;
            } else if (tcgAbbr === "fab" && result.shopify === true) {
                //use the Rust parser
                let scrape = await shopifyScrape(url, cardIdentifier, tcg, tcgAbbr, color);
                let shopName = result.shop_name === "PLACEHOLDER" ? url : result.shop_name;

                return {...scrape, shopName};
            } else if (result.has_search_url === true) {
                //use playwright to search for the card and LLM to parse the listings
                let scrape = searchURLScrape(url, cardIdentifier, tcg, tcgAbbr, color, result.search_url);
                let shopName = result.shop_name === "PLACEHOLDER" ? url : result.shop_name;

                return {...scrape, shopName};
            } else {
                //use playwright to scrape the listings
                let scrape = playwrightScrape(url, cardIdentifier, tcg, tcgAbbr, color);
                let shopName = result.shop_name === "PLACEHOLDER" ? url : result.shop_name;

                return {...scrape, shopName};
            }
        }));
        console.log(results);
        return {listings: results};
    } finally {
        await client.close();
    }
}

async function shopifyScrape(url, cardIdentifier, tcg, tcgAbbr, color) : Promise<object> {
       let proc = execFile("/home/admin/apps/FaBCardSearch/frontend/functions/parser/target/release/parser", [url, cardIdentifier, tcg, tcgAbbr, color]);
         let output = "";
            let error = "";
            proc.stdout.on('data', (data) => {
                output += data;
            });
            proc.stderr.on('data', (data) => {
                error += data;
            });
            return new Promise((resolve, reject) => {
                proc.on('exit', (code) => {
                    if (code === 0) {
                        let spaceholder = { listings: output, url: url };
                        console.log(spaceholder);
                        resolve(spaceholder);
                    } else {
                        reject(error);
                    }
                });
            });
}

async function playwrightScrape(url, cardIdentifier, tcg, tcgAbbr, color) : Promise<object> {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const template = "You are an HTML parser that returns exclusively well formed JSON and nothing else, all output should begin with '[' and end with ']'. Transform the following HTML store search results for the card " + cardIdentifier + " into structured JSON for storing product information with the following schema:\n" +
`
[
    {
        title: String,
        variants: [
            {
                title: String,
                price: Number,
                available: Boolean
            }
        ]
    }
]
You should attempt to capture every product which contains the card identifier in the title, and extract the title, price, and availability.
If a product has multiple variants, you should capture each variant's title, price, and availability.
If "variants" is not applicable to the store, you should put the product's title, price, and availability in a single-element array.
HTML: `;
    try {
        if (color !== "") {
            cardIdentifier = cardIdentifier + " " + color;
        }
        await page.goto(url);
        await page.getByPlaceholder("Search").first().fill(cardIdentifier);
        await page.keyboard.press('Enter');
        // return the page content and scrape with LLM
        await page.waitForLoadState();
        await page.waitForFunction('document.readyState === "complete"');
        const page_body = await page.evaluate('document.body.innerHTML');
        console.log(page.url());
        const result = await model.generateContent(template+page_body);
        // return the structured JSON
        console.log(result.response.text());
        console.log(JSON.parse(result.response.text()));
        return {listings: result.response.text(), url: url};

    } catch (error) {
        console.error('Error scraping site:', url, error);
    } finally {
        await browser.close();
    }
}

async function searchURLScrape(url, cardIdentifier, tcg, tcgAbbr, color, searchURL) : Promise<object> {
    if (color !== "") {
        cardIdentifier = cardIdentifier + "-" + color;
    }
    let response = await axios.get(searchURL+cardIdentifier);
    const template = "You are an HTML parser that returns exclusively well formed JSON and nothing else, all output should begin with '[' and end with ']'. Transform the following HTML store search results for the card " + cardIdentifier + " into structured JSON for storing product information with the following schema:\n" +
`
[
    {
        title: String,
        variants: [
            {
                title: String,
                price: Number,
                available: Boolean
            }
        ]
    }
]
You should attempt to capture every product which contains the card identifier in the title, and extract the title, price, and availability.
If a product has multiple variants, you should capture each variant's title, price, and availability.
If "variants" is not applicable to the store, you should put the product's title, price, and availability in a single-element array.
HTML: `;
    const result = await model.generateContent(template+response.data);
    console.log(result.response.text());
    console.log(JSON.parse(result.response.text()));
    return {listings: result.response.text(), url: url};

}


