import express from "express";
import cors from "cors";
import Search, { SearchCard } from "@flesh-and-blood/search";
import { DoubleSidedCard } from "@flesh-and-blood/types";
import { cards } from "@flesh-and-blood/cards";
import bodyParser from "body-parser";
import { readFile } from "fs";
import { chromium } from 'playwright';
import loki from "lokijs";


const app = express();
app.use(bodyParser.json());
app.use(cors());

app.listen(3000, () => {
    console.log('Server running on port 3000');
});

app.post('/api/searchCard', (req, res) => {
    console.log(req.body);
    const searchQuery = req.body;
    //console.log(req);
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

    console.log(searchResults);

    res.contentType('application/json')
    res.send(JSON.stringify(searchResults));

});

app.post('/api/searchListings', (req, res) => {
    const requestData = req.body;
    const cardData = requestData.cardData;
    const storeUrls = requestData.storeUrls;
    console.log(cardData);
    console.log(storeUrls);
    let db = new loki("listinginfo.db");
    let listings = db.addCollection("listings");
    scrapeSite(storeUrls, cardData.cardIdentifier, listings).then((listingReturn) => {
        res.contentType('application/json');
        res.send(listings.get(listingReturn.$loki));
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

            // Save data (you may adjust how you want to save this data)
            const storeData = {
                url: url,
                listings: listingData
            };
            // You may need to adjust this part depending on how you handle saving data
            console.log('Store data:', storeData);
            listingReturn = listings.insert(storeData);

        } catch (error) {
            console.error('Error scraping site:', url, error);
        }
    }

    await browser.close();
    return listingReturn;
}

