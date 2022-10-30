'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = _default

var _queryEngine = require('../queryEngine')

var _validationHelpers = require('./validationHelpers')

/**
 * Inspect the elements' IDs and add them to the CSS Selector
 * @param {array} hierarchy. The hierarchy of elements
 * @param {object} state. The current selector state (has the stack and specificity sum)
 */
function _default(hierarchy, state, validateSelector, config, query) {
  return hierarchy.reduce((selectorState, currentElem, index) => {
    if (!selectorState.verified) {
      const allAttributes = Array.from(currentElem.el.attributes)
        .map((a) => a.name)
        .filter((key) => key !== 'id' && key !== 'class')
      const matchingAttributes = new Set()

      for (const selector of config.dataAttributes) {
        const regexp = selector
          .replace(/[.+?^${}()|[\]\\]/g, '') // remove all regexp symbols
          .replace(/\*/g, '.*') // except for '*', change that to '.*'

        for (const attribute of allAttributes) {
          if (new RegExp(`^${regexp}$`).test(attribute)) {
            matchingAttributes.add(attribute)
          }
        }
      }

      const [validatedState] = Array.from(matchingAttributes)
        .map((key) => {
          return [key, currentElem.el.getAttribute(key)]
        })
        .filter(
          (_ref) => {
            let [key, value] = _ref
            return (0, _validationHelpers.attr)(value) || key.match(/^data-/)
          } // data- can be empty
        )
        .map((_ref2) => {
          let [key, value] = _ref2
          const isUnique = (0, _queryEngine.isUniqueDataAttr)(query, key, value)
          selectorState.stack[index].push(
            value === '' ? `[${key}]` : `[${key}='${value}']`
          )
          selectorState.specificity += isUnique ? 100 : 50

          if (selectorState.specificity >= config.specificityThreshold) {
            // we have reached the minimum specificity, lets try verifying now, as this will save us having to add more IDs to the selector
            if (validateSelector(selectorState)) {
              // The ID worked like a charm - mark this state as verified and move on!
              selectorState.verified = true
            }
          }

          if (!selectorState.verified && index === 0) {
            // if the index is 0 then this is the data-attr of the actual element! Which means we have found our selector!
            // The ID wasn't enough, this means the page, this should never happen as we tested for the data-attr's uniquness, but just incase
            // we will pop it from the stack as it only adds noise
            selectorState.stack[index].pop()
            selectorState.specificity -= isUnique ? 100 : 50
          }

          return selectorState
        })
      return validatedState || selectorState
    }

    return selectorState
  }, state)
}
