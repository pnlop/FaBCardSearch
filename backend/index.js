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
const child_process_1 = require("child_process");
const axios_1 = __importDefault(require("axios"));
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
function ExecuteRequest(query, page) {
    return __awaiter(this, void 0, void 0, function* () {
        let response = yield axios_1.default.get('https://api.scryfall.com/cards/search?page=' + page + '&q=' + query);
        let data = response.data;
        //if (response.data.has_more === true) {
        //    return data.concat(await ExecuteRequest(query, page++));
        //} else {
        return data;
        //}
    });
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
    scrapeSite(storeUrls, cardData.name, tcg, tcgAbbr).then((results) => {
        res.contentType('application/json');
        res.send(results);
    });
});
function scrapeSite(urls, cardIdentifier, tcg, tcgAbbr) {
    return __awaiter(this, void 0, void 0, function* () {
        // Perform scraping for each URL
        let results = [];
        for (const url of urls) {
            (0, child_process_1.execFile)("/home/admin/apps/FaBCardSearch/backend/parser/target/debug/parser", [url, cardIdentifier, tcg, tcgAbbr], (error, stdout, _) => {
                if (error) {
                    throw error;
                }
                console.log("{" + stdout + ", url: " + url + "}");
                results.push("{" + stdout + ", url: " + url + "}");
            });
        }
        return results;
    });
}
//# sourceMappingURL=index.js.map