describe('Search for card listings', () => {

    scrapeSite(Cypress.env('storeUrls'));
});

function scrapeSite(urls) {
    const saleInfo =[];
    after(() => {
        cy.task('getStoreData').then((storeData) => {
            cy.writeFile('backend/saleInfo.json', storeData);
        });
    });
    for (const url in urls) {
        it('Scrape site: '+url, () => {
            Cypress.on('uncaught:exception', (err, runnable) => {
                // returning false here prevents Cypress from
                // failing the test
                return false
            });
            cy.intercept('GET', '/cart.js').as('load');
            cy.visit(urls[url]);
            cy.wait('@load');
            cy.get('form[action="/search"][method="get"][class*="search-header"]').should('exist').first().within(() => {
                cy.get('input[type="search"]').should('be.visible').type(Cypress.env('cardData').cardIdentifier);
                cy.get('button[type="submit"]').should('be.visible').click();
            });
            cy.wait('@load');
            cy.get('.list-view-items').should('exist').children().each(($item, index, $list) => {
                if ($item.html().length === 0) {
                    cy.wrap($item).invoke('attr', 'data-product-variants').then((variants) => {
                        cy.task('setListingData', JSON.parse(variants));
                    });
                }
            }).then(() => {
                cy.task('getListingData').then((listingData) => {
                    let storeData = {url: urls[url], listings: listingData};
                    cy.task('setStoreData', storeData);
                });
                cy.task('resetListingData');
            });
        });
    }

}
