import express from "express";
import cors from "cors";
import Search, {SearchCard} from "@flesh-and-blood/search";
import {DoubleSidedCard} from "@flesh-and-blood/types";
import {cards} from "@flesh-and-blood/cards";
import bodyParser from "body-parser";
import cypress from "cypress";

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
    let runResult = cypress.run({
        spec: 'cypress/e2e/cardsearch.cy.js', // Path to your test file
        browser: 'chrome',  // Optional: Specify browser (default is Electron)
        headless: false,      // Optional: Run headlessly (default is true));
        env: {
            cardData: cardData,
            storeUrls: storeUrls,
            listingData: []
        }
      }).then((results) => {
        console.log(results);
        res.send(JSON.stringify(results));
        });
    
});

app.post('/scrapeReturn', (req, res) => {
    res.send(req.body);
});

