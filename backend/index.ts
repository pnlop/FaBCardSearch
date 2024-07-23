import express, { query } from "express";
import cors from "cors";
import Search, { SearchCard } from "@flesh-and-blood/search";
import { DoubleSidedCard } from "@flesh-and-blood/types";
import { cards } from "@flesh-and-blood/cards";
import bodyParser from "body-parser";
import { chromium } from 'playwright';
import loki from "lokijs";
import axios from "axios";
import _ from "lodash.chunk";

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

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

function customizer(objValue, srcValue) {
    if (_.isArray(objValue)) {
        return objValue.concat(srcValue);
    }
}

async function ExecuteRequest(url, data, page) {
    // As this is a recursive function, we need to be able to pass it the prevous data. Here we either used the passed in data, or we create a new objet to hold our data.
    data = data || {};
    await axios.get(url+page+'&q='+data).then(response => {
        // We merge the returned data with the existing data
        console.log(data)
        _.mergeWith(data, response.data, customizer);
        // We check if there is more paginated data to be obtained
        if (response.data.has_more) {
            // If nextPageUrl is not null, we have more data to grab
            return ExecuteRequest(url, data, page++);
        }
    });

    return data;
}

app.post('/api/searchCardMTG', (req, res) => {
    const searchQuery = req.body;
    ExecuteRequest('https://api.scryfall.com/cards/search?page=', searchQuery.query, 1).then((searchResults) => {
        console.log(searchResults);
        res.contentType('application/json');
        res.send(JSON.stringify(searchResults));
    });
});



app.post('/api/searchListings', (req, res) => {
    const requestData = req.body;
    const cardData = requestData.cardData;
    const storeUrls = requestData.storeUrls;
    let db = new loki("listinginfo.db");
    let listings = db.addCollection("listings");
    scrapeSite(storeUrls, cardData.cardIdentifier, listings).then(() => {
        res.contentType('application/json');
	let results = listings.chain().data();
        res.send(JSON.stringify(results));
    });

});

async function scrapeSite(urls, cardIdentifier, listings) {
    const browser = await chromium.launch();
    // Perform scraping for each URL
    let listingReturn
    for (const url of urls) {
        const context = await browser.newContext();
        const page = await context.newPage();
        try {
            await page.goto(url);

            // Perform search action
            await page.waitForSelector('form[action="/search"][method="get"][class*="search-header"]');
            await page.fill('form[action="/search"][method="get"][class*="search-header"] input[type="search"]', cardIdentifier);
            await page.click('form[action="/search"][method="get"][class*="search-header"] button[type="submit"]');
            await page.waitForSelector('.list-view-items');

            // Extract listing data
            const listingData = await page.$$eval('.list-view-items > div', items => {
                const data = [];
                items.forEach(item => {
                    if (item.innerHTML.length === 0) {
                        const variants = item.getAttribute('data-product-variants');
                        data.push(JSON.parse(variants));
                    }
                });
                return data;
            });

            const storeData = {
                url: url,
                listings: listingData
            };
	        listings.insert(storeData);
        } catch (error) {
            console.error('Error scraping site:', url, error);
        }
    }
    await browser.close();
}

