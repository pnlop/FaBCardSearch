describe('Search for card listings', () => {
    scrapeSite(Cypress.env('storeUrls'));
});

async function scrapeSite(urls) {
    let scrapeInfo = [];
    for (let i = 0; i < urls.length; i++) {
        it('Scrape site', () => {
            let saleInfo = {url: urls[i], data: []};
            cy.intercept('GET', '/cart.js').as('load');
            cy.visit(urls[i]);
            cy.wait('@load');
            cy.wait(1000);
            cy.get('form[action="/search"][method="get"][class*="search-header"]').should('exist').first().within(() => {
                cy.get('input[type="search"]').should('be.visible').type(Cypress.env('cardData').cardIdentifier);
                cy.get('button[type="submit"]').should('be.visible').click();
            });
            cy.wait('@load');
            cy.wait(1000);
            let skipNext = false;
            cy.get('.list-view-items').should('exist').children().each(($item, index, $list) => {
                if ($item.html().length === 0) {
                    if (!skipNext) {
                        cy.wrap($item).invoke('attr', 'data-product-variants').then((variants) => {
                            saleInfo.data.push(JSON.parse(variants));
                        });
                    }
                    skipNext = false;
                } else if ($item.hasClass('product-price--sold-out')) {
                    skipNext = true;
                } else {
                    skipNext = false;
                }
            }).then(() => {
                scrapeInfo.push(saleInfo);
            }).then(() => {
                if (i === urls.length - 1) {
                    cy.writeFile('backend/saleInfo.json', JSON.stringify(scrapeInfo));
                }
            });
        });
    }
}
