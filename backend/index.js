"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const search_1 = __importDefault(require("@flesh-and-blood/search"));
const cards_1 = require("@flesh-and-blood/cards");
const body_parser_1 = __importDefault(require("body-parser"));
const cypress_1 = __importDefault(require("cypress"));
const fs_1 = require("fs");
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.listen(5000, () => {
    console.log('Server running on port 5000');
});
app.post('/searchCard', (req, res) => {
    console.log(req.body);
    const searchQuery = req.body;
    //console.log(req);
    //from @flesh-and-blood/search search.tests.ts
    const doubleSidedCards = cards_1.cards.map((card) => {
        if (card.oppositeSideCardIdentifier) {
            const oppositeSideCard = cards_1.cards.find(({ cardIdentifier }) => cardIdentifier === card.oppositeSideCardIdentifier);
            if (oppositeSideCard) {
                card.oppositeSideCard = oppositeSideCard;
            }
        }
        return card;
    });
    const search = new search_1.default(doubleSidedCards);
    const searchResults = search.search(searchQuery.query);
    console.log(searchResults);
    res.contentType('application/json');
    res.send(JSON.stringify(searchResults));
});
app.post('/searchListings', (req, res) => {
    const requestData = req.body;
    const cardData = requestData.cardData;
    const storeUrls = requestData.storeUrls;
    console.log(cardData);
    console.log(storeUrls);
    let runResult = cypress_1.default.run({
        spec: 'cypress/e2e/cardsearch.cy.js', // Path to your test file
        browser: 'chrome', // Optional: Specify browser (default is Electron)
        headless: false, // Optional: Run headlessly (default is true));
        env: {
            cardData: cardData,
            storeUrls: storeUrls
        }
    }).then(() => {
        //read .json file called saleInfo.json and send its contents
        (0, fs_1.readFile)(__dirname + '/saleInfo.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            res.contentType('application/json');
            res.send(data);
        });
    });
});
app.post('/scrapeReturn', (req, res) => {
    res.send(req.body);
});
//# sourceMappingURL=index.js.map