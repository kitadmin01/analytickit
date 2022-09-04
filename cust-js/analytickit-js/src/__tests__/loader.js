/*
 * Test that basic SDK usage (init, capture, etc) does not
 * blow up in non-browser (node.js) envs. These are not
 * tests of server-side capturing functionality (which is
 * currently not supported in the browser lib).
 */

import analytickit from '../loader-module'
import sinon from 'sinon'

describe(`Module-based loader in Node env`, () => {
    beforeEach(() => {
        jest.spyOn(analytickit, '_send_request').mockReturnValue()
        jest.spyOn(window.console, 'log').mockImplementation()
    })

    it('should load and capture the pageview event', () => {
        const sandbox = sinon.createSandbox()
        let loaded = false
        analytickit._originalCapture = analytickit.capture
        analytickit.capture = sandbox.spy()
        analytickit.init(`test-token`, {
            debug: true,
            persistence: `localStorage`,
            api_host: `https://test.com`,
            loaded: function () {
                loaded = true
            },
        })

        expect(analytickit.capture.calledOnce).toBe(true)
        const captureArgs = analytickit.capture.args[0]
        const event = captureArgs[0]
        expect(event).toBe('$pageview')
        expect(loaded).toBe(true)

        analytickit.capture = analytickit._originalCapture
        delete analytickit._originalCapture
    })

    it(`supports identify()`, () => {
        expect(() => analytickit.identify(`Pat`)).not.toThrow()
    })

    it(`supports capture()`, () => {
        expect(() => analytickit.capture(`Pat`)).not.toThrow()
    })
})
