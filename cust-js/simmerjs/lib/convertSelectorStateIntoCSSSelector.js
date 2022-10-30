'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = _default

var _lodash = _interopRequireDefault(require('lodash.takeright'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

/**
 * Conver the Selector State into a merged CSS selector
 * @param state (object) The current selector state (has the stack and specificity sum)
 * @param depth (int) The number of levels to merge (1..state.stack.length)
 */
function _default(state) {
  let depth =
    arguments.length > 1 && arguments[1] !== undefined
      ? arguments[1]
      : state.stack.length
  return (
    (0, _lodash.default)(
      state.stack.reduceRight((selectorSegments, elementState) => {
        if (elementState.length) {
          selectorSegments.push(elementState.join(''))
        } else if (selectorSegments.length) {
          selectorSegments.push('*')
        }

        return selectorSegments
      }, []),
      depth
    ).join(' > ') || '*'
  )
}
