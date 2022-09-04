/**
 * @jest-environment jsdom
 */

import { AnalyticKit } from '../lib'

describe('AnalyticKitWeb', () => {
  let fetch: jest.Mock
  jest.useFakeTimers()

  beforeEach(() => {
    ;(global as any).window.fetch = fetch = jest.fn(() =>
      Promise.resolve({
        status: 200,
        json: () => Promise.resolve({ status: 'ok' }),
      })
    ) as any
  })

  describe('init', () => {
    it('should initialise', () => {
      const analytickit = new AnalyticKit('TEST_API_KEY', {
        flushAt: 1,
      })
      expect(analytickit.optedOut).toEqual(false)

      analytickit.capture('test')

      expect(fetch).toHaveBeenCalledTimes(1)
    })
  })
})
