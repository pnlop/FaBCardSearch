import express from "express";
import cors from "cors";
import Search from "@flesh-and-blood/search";
import { DoubleSidedCard } from "@flesh-and-blood/types";
import { cards } from "@flesh-and-blood/cards";
import bodyParser from "body-parser";
import { execFile, spawn } from "child_process";
import axios from "axios";
import { chromium } from 'playwright';
import loki from 'lokijs';
import { MongoClient } from 'mongodb';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ok } from "assert";

// with this new architecture, we will leverage MongoDB to store website information for more efficient parsing
// the schema will be as follows:
// {
//     "name": "Card Kingdom",
//     "url": "https://www.cardkingdom.com",
//     "parsable": "true",
//     "hasSearchURL": "true",
//     "searchURL": "https://www.cardkingdom.com/catalog/search?search=",
//     "isShopify": "false",
//     "hasFAB": "false",
//     "hasMTG": "true"
// }
// the existing Rust parser will be used to parse FaB data from the websites using Shopify backends
// the new parser will ideally be used to parse all other websites
// the new parser will be written in TypeScript and use Playwright for scraping
// the new parser will use Playwright (or the stored search URL) to search for the card and then scrape the listings
// the listings HTML will be passed to an LLM model to extract the relevant information as structured JSON
// the structured JSON will be returned to the frontend for display

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

const client = new MongoClient(process.env.URI);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});




app.post('/api/searchCard', (req, res) => {
    const searchQuery = req.body;
    //from @flesh-and-blood/search search.tests.ts
    const doubleSidedCards: DoubleSidedCard[] = cards.map((card) => {
        if (card.oppositeSideCardIdentifier) {
            const oppositeSideCard = cards.find(
                ({ cardIdentifier }) => cardIdentifier === card.oppositeSideCardIdentifier
            );
            if (oppositeSideCard) {

                (card as DoubleSidedCard).oppositeSideCard = oppositeSideCard;
            }
        }
        return card;
    });

    const search = new Search(doubleSidedCards);
    const searchResults = search.search(searchQuery.query);

    res.contentType('application/json')
    res.send(JSON.stringify(searchResults, function(key, value) {
        if(key == 'oppositeSideCard') { 
          return "Double Sided Card (broken behaviour)";
        } else {
          return value;
        };
      }));

});

async function ExecuteRequest(query, page): Promise<[]> {
    let response = await axios.get('https://api.scryfall.com/cards/search?page='+page+'&q='+query);
    let data = response.data;
    //if (response.data.has_more === true) {
    //    return data.concat(await ExecuteRequest(query, page++));
    //} else {
        return data;
    //}
}

app.post('/api/searchCardMTG', (req, res) => {
    const searchQuery = req.body;
    ExecuteRequest(searchQuery.query, 1).then((searchResults) => {
        console.log(searchResults);
        res.contentType('application/json');
        res.send(searchResults);
    });
});



app.post('/api/searchListings', (req, res) => {
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
        res.contentType('application/json');
        res.send(results);
    });

});

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
                    return shopifyScrape(url, cardIdentifier, tcg, tcgAbbr, color);
                } else {
                    //no result for this shop, use playwright
                    return playwrightScrape(url, cardIdentifier, tcg, tcgAbbr, color);
                }
            } else if (result.parsable === false) {
                //cannot be parsed, return null
                return null;
            } else if (tcgAbbr === "fab" && result.shopify === true) {
                //use the Rust parser
                return shopifyScrape(url, cardIdentifier, tcg, tcgAbbr, color);
            } else if (result.has_search_url === true) {
                //use playwright to search for the card and LLM to parse the listings
                return searchURLScrape(url, cardIdentifier, tcg, tcgAbbr, color, result.search_url);
            } else {
                //use playwright to scrape the listings
                return playwrightScrape(url, cardIdentifier, tcg, tcgAbbr, color);
            }
        }));
        console.log(results);
        return {listings: results};
    } finally {
        await client.close();
    }
}

async function shopifyScrape(url, cardIdentifier, tcg, tcgAbbr, color) {
       let proc = execFile("/home/admin/apps/FaBCardSearch/backend/parser/target/release/parser", [url, cardIdentifier, tcg, tcgAbbr, color]);
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
                        resolve(spaceholder);
                    } else {
                        reject(error);
                    }
                });
            });
}

async function playwrightScrape(url, cardIdentifier, tcg, tcgAbbr, color) {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    const template = "You are an HTML parser. Transform the following HTML store search results for the card " + cardIdentifier + " into structured JSON for storing product information with the following schema:\n" +
"{\n" +
"    title: String,\n" +
"    variants: [\n" +
"        {\n" +
"            name: String,\n" +
"            price: Number,\n" +
"            available: Boolean,\n" +
"        }\n" +
"    ]\n" +
"}\n" +
"HTML: ";
    try {
        await page.goto(url);
        await page.getByPlaceholder("Search").first().fill(cardIdentifier);
        await page.keyboard.press('Enter');
        // return the page content and scrape with LLM
        const page_body = await page.evaluate('document.body.innerHTML');
        console.log(page_body);
        const result = await model.generateContent(template+page_body);
        // return the structured JSON
        console.log(result.response.text());
        return {listings: JSON.parse(result.response.text()), url: url};
    } catch (error) {
        console.error('Error scraping site:', url, error);
    } finally {
        await browser.close();
    }
}

async function searchURLScrape(url, cardIdentifier, tcg, tcgAbbr, color, searchURL) {
    let response = await axios.get(searchURL+cardIdentifier);
    const template = "You are an HTML parser. Transform the following HTML store search results for the card " + cardIdentifier + " into structured JSON for storing product information with the following schema:\n" +
"{\n" +
"    title: String,\n" +
"    variants: [\n" +
"        {\n" +
"            name: String,\n" +
"            price: Number,\n" +
"            available: Boolean,\n" +
"        }\n" +
"    ]\n" +
"}\n" +
"HTML: ";
    const result = await model.generateContent(template+response.data);
    return {listings: JSON.parse(result.response.text()), url: url};
}


