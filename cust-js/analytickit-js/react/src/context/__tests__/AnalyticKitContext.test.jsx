import * as React from 'react'
import { render } from '@testing-library/react'
import { useAnalyticKitContext, AnalyticKitProvider } from '../'

describe('useAnalyticKitContext hook', () => {
    function App() {
        const context = useAnalyticKitContext()
        expect(context.client).toEqual(given.analytickit)
        return null
    }

    given('render', () => () =>
        render(
            <AnalyticKitProvider client={given.analytickit}>
                <App />
            </AnalyticKitProvider>
        )
    )
    given('analytickit', () => ({}))

    it('should return a client instance from the context if available', () => {
        given.render()
    })

    it("should error if a client instance can't be found in the context", () => {
        given('analytickit', () => undefined)
        console.error = jest.fn()

        expect(() => given.render()).toThrow()
    })
})
