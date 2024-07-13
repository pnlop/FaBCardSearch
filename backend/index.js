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
require("cypress");
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
// Define your Cypress test
//turn this into async function with promise return
function scrapeListings(cardData, storeUrls) {
    return __awaiter(this, void 0, void 0, function* () {
        let results = [];
        for (const storeUrl of storeUrls) {
            let storeResults = [];
            describe('Listing scraper', () => {
                it('Should search for a card', () => {
                    // Visit the webpage containing the search bar
                    cy.visit(storeUrl);
                    // Find the search input element and type a search term
                    cy.get('input[type="search"]').type(cardData.cardIdentifier)
                        .then(() => {
                        // Find the submit button (if any) and click it to perform the search
                        cy.get('button[type="submit"]').click();
                        // Assert that the search results are displayed or verify the expected behavior
                        cy.get('.list-view-items').as('listings').then(() => {
                            cy.get('div[id*="ProductCardList2"][hidden]').each((listing) => {
                                if (cy.wrap(listing).prev('div').children().contains('sold-out')) {
                                    console.log('Sold out');
                                }
                                else {
                                    cy.wrap(listing).get('.data-product-variants').invoke('text').then(($variants) => {
                                        //TODO: fix url find
                                        //Note: URL is only encoded for first sublisting
                                        //change structure of listing return?
                                        //Store[StoreURL]{Listing[ListingURL]{Sublistings[Price]}}
                                        let listingUrl = cy.wrap(listing).prev('div').children().get('a').invoke('attr', 'href');
                                        let sublistings = JSON.parse($variants);
                                        console.log(sublistings);
                                        storeResults.push({ url: listingUrl, variants: sublistings });
                                    });
                                }
                            });
                        });
                    });
                });
            });
            results.push({ storeUrl, storeResults });
        }
        return results;
    });
}
//# sourceMappingURL=index.js.map