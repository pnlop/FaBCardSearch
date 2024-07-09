import express from "express";
import cors from "cors";
import Search, {SearchCard} from "@flesh-and-blood/search";
import {DoubleSidedCard} from "@flesh-and-blood/types";
import {cards} from "@flesh-and-blood/cards";
import bodyParser from "body-parser";
import puppeteer from "puppeteer";

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.listen(5000, () => {
    console.log('Server running on port 5000');
});

app.post('/searchCard', (req, res) => {
    console.log(req.body);
    const searchQuery = req.body;
    //console.log(req);
    //from @flesh-and-blood/search search.tests.ts
    const doubleSidedCards: DoubleSidedCard[] = cards.map((card) => {
        if (card.oppositeSideCardIdentifier) {
            const oppositeSideCard = cards.find(
                ({cardIdentifier}) => cardIdentifier === card.oppositeSideCardIdentifier
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

app.post('/searchListings', (req, res) => {
    const requestData = req.body;
    const cardData = requestData.cardData;
    const storeUrls = requestData.storeUrls;
    console.log(cardData);
    console.log(storeUrls);
    scrapeListings(cardData, storeUrls).then((listings) => {
        res.send(JSON.stringify(listings));
    });
});

async function scrapeListings(card: SearchCard, storeUrls: string[]){
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let listings: { [storeUrl: string]: { products: any[] } } = {};
    for (let i = 0; i < storeUrls.length; i++) {
        await page.goto(storeUrls[i]);
        let products = await page.evaluate(() => {
            const productElements = document.querySelectorAll('.product-grid-item');
            const productData = [];
            productElements.forEach(product => {
                //if the product title includes any of the strings in the array set identifiers
                if (card.setIdentifiers.some(setIdentifier => product.querySelector('.product-title').textContent.includes(setIdentifier))) {
                    const title = product.querySelector('.product-title').textContent;
                    const url = product.querySelector('a').href;
                    //const imageUrl = product.querySelector('img').src;
                    const price = product.querySelector('.price').textContent;
                    productData.push({title, url, price});
                }
            });
            return productData;
        });
        listings[storeUrls[i]] = {products: products};
    }
    await browser.close();
    return listings;
}