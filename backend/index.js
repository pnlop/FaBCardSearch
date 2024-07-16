"use strict";
exports.__esModule = true;
var express_1 = require("express");
var cors_1 = require("cors");
var search_1 = require("@flesh-and-blood/search");
var cards_1 = require("@flesh-and-blood/cards");
var body_parser_1 = require("body-parser");
var cypress_1 = require("cypress");
var fs_1 = require("fs");
var app = (0, express_1["default"])();
app.use(body_parser_1["default"].json());
app.use((0, cors_1["default"])());
app.listen(5000, function () {
    console.log('Server running on port 5000');
});
app.post('/searchCard', function (req, res) {
    console.log(req.body);
    var searchQuery = req.body;
    //console.log(req);
    //from @flesh-and-blood/search search.tests.ts
    var doubleSidedCards = cards_1.cards.map(function (card) {
        if (card.oppositeSideCardIdentifier) {
            var oppositeSideCard = cards_1.cards.find(function (_a) {
                var cardIdentifier = _a.cardIdentifier;
                return cardIdentifier === card.oppositeSideCardIdentifier;
            });
            if (oppositeSideCard) {
                card.oppositeSideCard = oppositeSideCard;
            }
        }
        return card;
    });
    var search = new search_1["default"](doubleSidedCards);
    var searchResults = search.search(searchQuery.query);
    console.log(searchResults);
    res.contentType('application/json');
    res.send(JSON.stringify(searchResults));
});
app.post('/searchListings', function (req, res) {
    var requestData = req.body;
    var cardData = requestData.cardData;
    var storeUrls = requestData.storeUrls;
    console.log(cardData);
    console.log(storeUrls);
    var runResult = cypress_1["default"].run({
        spec: 'cypress/e2e/cardsearch.cy.js',
        browser: 'chrome',
        headless: false,
        env: {
            cardData: cardData,
            storeUrls: storeUrls,
            listingData: []
        }
    }).then(function () {
        //read .json file called saleInfo.json and send its contents
        (0, fs_1.readFile)(__dirname + '/saleInfo.json', 'utf8', function (err, data) {
            if (err) {
                console.error(err);
                return;
            }
            res.contentType('application/json');
            res.send(data);
        });
    });
});
app.post('/scrapeReturn', function (req, res) {
    res.send(req.body);
});
