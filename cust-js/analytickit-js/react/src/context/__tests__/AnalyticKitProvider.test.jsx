import * as React from 'react'
import { render } from '@testing-library/react'
import { AnalyticKitProvider, getAnalyticKitContext } from '..'

describe('AnalyticKitProvider component', () => {
    given('render', () => () =>
        render(<AnalyticKitProvider client={given.analytickit}>{given.childComponent}</AnalyticKitProvider>)
    )
    given('childComponent', () => <div>Test</div>)
    given('analytickit', () => ({}))

    it('should render children components', () => {
        expect(given.render().getByText('Test')).toBeTruthy()
    })

    it('should require a client', () => {
        given('analytickit', () => undefined)
        console.error = jest.fn()

        expect(() => given.render()).toThrow()
    })

    it('should make the context consumable by the children', () => {
        function TestChild() {
            const context = React.useContext(getAnalyticKitContext())
            expect(context.client).toEqual(given.analytickit)
            return null
        }

        given('childComponent', () => (
            <>
                <TestChild />
                <TestChild />
            </>
        ))

        given.render()
    })
})
