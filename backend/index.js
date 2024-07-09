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
const puppeteer_1 = __importDefault(require("puppeteer"));
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
    scrapeListings(cardData, storeUrls).then((listings) => {
        res.send(JSON.stringify(listings));
    });
});
function scrapeListings(card, storeUrls) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer_1.default.launch();
        const page = yield browser.newPage();
        let listings = {};
        for (let i = 0; i < storeUrls.length; i++) {
            yield page.goto(storeUrls[i]);
            let products = yield page.evaluate(() => {
                const productElements = document.querySelectorAll('.product-grid-item');
                const productData = [];
                productElements.forEach(product => {
                    //if the product title includes any of the strings in the array set identifiers
                    if (card.setIdentifiers.some(setIdentifier => product.querySelector('.product-title').textContent.includes(setIdentifier))) {
                        const title = product.querySelector('.product-title').textContent;
                        const url = product.querySelector('a').href;
                        //const imageUrl = product.querySelector('img').src;
                        const price = product.querySelector('.price').textContent;
                        productData.push({ title, url, price });
                    }
                });
                return productData;
            });
            listings[storeUrls[i]] = { products: products };
        }
        yield browser.close();
        return listings;
    });
}
//# sourceMappingURL=index.js.map