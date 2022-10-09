'use strict'

var _convertSelectorStateIntoCSSSelector = _interopRequireDefault(
  require('./convertSelectorStateIntoCSSSelector')
)

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

describe.only('convertSelectorStateIntoCSSSelector', () => {
  test(`converts an empty stack into a "select all" selector`, function () {
    expect(
      (0, _convertSelectorStateIntoCSSSelector.default)({
        stack: [[]]
      })
    ).toBe('*')
  })
  test(`converts an one level stack with one selector into that selector`, function () {
    expect(
      (0, _convertSelectorStateIntoCSSSelector.default)({
        stack: [['DIV']]
      })
    ).toBe('DIV')
  })
  test(`converts an one level stack with multiple selectors into a merged selector`, function () {
    expect(
      (0, _convertSelectorStateIntoCSSSelector.default)({
        stack: [['DIV', '.className']]
      })
    ).toBe('DIV.className')
  })
  test(`converts an multi level stack with multiple selectors into a merged selector`, function () {
    expect(
      (0, _convertSelectorStateIntoCSSSelector.default)({
        stack: [['span'], ['DIV', '#someId'], ['DIV', '.className']]
      })
    ).toBe('DIV.className > DIV#someId > span')
  })
  test(`converts an empty selector in a multi level stack into a "select all" selector`, function () {
    expect(
      (0, _convertSelectorStateIntoCSSSelector.default)({
        stack: [['span'], [], ['DIV', '.className']]
      })
    ).toBe('DIV.className > * > span')
  })
  test(`omits "select all" selectors from the parent levels`, function () {
    expect(
      (0, _convertSelectorStateIntoCSSSelector.default)({
        stack: [['span'], [], ['DIV', '.className'], [], []]
      })
    ).toBe('DIV.className > * > span')
  })
  test(`takes a depth level which will omit any selectors beyond that depth`, function () {
    expect(
      (0, _convertSelectorStateIntoCSSSelector.default)(
        {
          stack: [
            ['span'],
            [],
            ['DIV', '.className'],
            [],
            ['DIV', '#someId'],
            ['ARTICLE'],
            []
          ]
        },
        3
      )
    ).toBe('DIV.className > * > span')
  })
})
