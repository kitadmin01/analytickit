/// <reference types="cypress" />

describe('identify()', () => {
    beforeEach(() => {
        cy.visit('./playground/cypress')
        cy.analytickitInit({})

        cy.wait('@decide')
    })

    it('opt_out_capturing() does not fail after identify()', () => {
        cy.analytickit().invoke('identify', 'some-id')
        cy.analytickit().invoke('opt_out_capturing')
    })
})
