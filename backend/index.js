"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const search_1 = __importDefault(require("@flesh-and-blood/search"));
const cards_1 = require("@flesh-and-blood/cards");
const body_parser_1 = __importDefault(require("body-parser"));
const playwright_1 = require("playwright");
const lokijs_1 = __importDefault(require("lokijs"));
const app = (0, express_1.default)();
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
app.post('/api/searchCard', (req, res) => {
    const searchQuery = req.body;
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
    res.contentType('application/json');
    res.send(JSON.stringify(searchResults, function (key, value) {
        if (key == 'oppositeSideCard') {
            return "Double Sided Card (broken behaviour)";
        }
        else {
            return value;
        }
        ;
    }));
});
app.post('/api/searchCardMTG', (req, res) => {
    const searchQuery = req.body;
});
app.post('/api/searchListings', (req, res) => {
    const requestData = req.body;
    const cardData = requestData.cardData;
    const storeUrls = requestData.storeUrls;
    let db = new lokijs_1.default("listinginfo.db");
    let listings = db.addCollection("listings");
    scrapeSite(storeUrls, cardData.cardIdentifier, listings).then(() => {
        res.contentType('application/json');
        let results = listings.chain().data();
        res.send(JSON.stringify(results));
    });
});
function scrapeSite(urls, cardIdentifier, listings) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield playwright_1.chromium.launch();
        // Perform scraping for each URL
        for (const url of urls) {
            const context = yield browser.newContext();
            const page = yield context.newPage();
            try {
                yield page.goto(url);
                // Perform search action
                yield page.waitForSelector('form[action="/search"][method="get"][class*="search-header"]');
                yield page.fill('form[action="/search"][method="get"][class*="search-header"] input[type="search"]', cardIdentifier);
                yield page.click('form[action="/search"][method="get"][class*="search-header"] button[type="submit"]');
                yield page.waitForSelector('.list-view-items');
                // Extract listing data
                const listingData = yield page.$$eval('.list-view-items > div', items => {
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
            }
            catch (error) {
                console.error('Error scraping site:', url, error);
            }
        }
        yield browser.close();
    });
}
//# sourceMappingURL=index.js.map