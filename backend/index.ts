import express from "express";
import cors from "cors";
import Search, {SearchCard} from "@flesh-and-blood/search";
import {DoubleSidedCard} from "@flesh-and-blood/types";
import {cards} from "@flesh-and-blood/cards";
import bodyParser from "body-parser";
import "cypress";

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
        res.send(JSON.stringify(listings))
    });
});

// Define your Cypress test
//turn this into async function with promise return
async function scrapeListings(cardData: SearchCard, storeUrls: string[]): Promise<any[]> {
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
                        } else {
                            cy.wrap(listing).get('.data-product-variants').invoke('text').then(($variants) => {
                                //TODO: fix url find
                                //Note: URL is only encoded for first sublisting
                                //change structure of listing return?
                                //Store[StoreURL]{Listing[ListingURL]{Sublistings[Price]}}
                                let listingUrl = cy.wrap(listing).prev('div').children().get('a').invoke('attr', 'href');
                                let sublistings = JSON.parse($variants);
                                console.log(sublistings);
                                storeResults.push({url: listingUrl, variants: sublistings});
                            });
                        }
                    });
                });
            });
            });
        });
        results.push({storeUrl, storeResults});
    }

    return results;
}