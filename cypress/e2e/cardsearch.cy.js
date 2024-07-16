describe('Search for card listings', () => {

    scrapeSite(Cypress.env('storeUrls'));
});

function scrapeSite(urls) {
    const saleInfo =[];
    after(() => {
        cy.writeFile('backend/saleInfo.json', saleInfo);
    });
    for (const url in urls) {
        it('Scrape site', () => {
            cy.intercept('GET', '/cart.js').as('load');
            cy.visit(urls[url]).then(() => {
                saleInfo.push(urls[url])
            });
            cy.wait('@load');
            cy.wait(1000);
            cy.get('form[action="/search"][method="get"][class*="search-header"]').should('exist').first().within(() => {
                cy.get('input[type="search"]').should('be.visible').type(Cypress.env('cardData').cardIdentifier);
                cy.get('button[type="submit"]').should('be.visible').click();
            });
            cy.wait('@load');
            cy.wait(1000);
            cy.get('.list-view-items').should('exist').children().each(($item, index, $list) => {
                if ($item.html().length === 0) {
                    cy.wrap($item).invoke('attr', 'data-product-variants').then((variants) => {
                        saleInfo.push(JSON.parse(variants));
                    });
                }
            });
        });
    }
}
