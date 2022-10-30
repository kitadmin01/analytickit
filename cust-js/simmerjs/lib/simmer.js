'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = createSimmer

var _queryEngine = _interopRequireWildcard(require('./queryEngine'))

var _methods = _interopRequireDefault(require('./methods'))

var _validateSelector = _interopRequireDefault(require('./validateSelector'))

var _convertSelectorStateIntoCSSSelector = _interopRequireDefault(
  require('./convertSelectorStateIntoCSSSelector')
)

var _parser = _interopRequireDefault(require('./parser'))

var _stackHierarchy = _interopRequireDefault(require('./stackHierarchy'))

var _configuration = require('./configuration')

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

function _getRequireWildcardCache(nodeInterop) {
  if (typeof WeakMap !== 'function') return null
  var cacheBabelInterop = new WeakMap()
  var cacheNodeInterop = new WeakMap()
  return (_getRequireWildcardCache = function (nodeInterop) {
    return nodeInterop ? cacheNodeInterop : cacheBabelInterop
  })(nodeInterop)
}

function _interopRequireWildcard(obj, nodeInterop) {
  if (!nodeInterop && obj && obj.__esModule) {
    return obj
  }
  if (obj === null || (typeof obj !== 'object' && typeof obj !== 'function')) {
    return { default: obj }
  }
  var cache = _getRequireWildcardCache(nodeInterop)
  if (cache && cache.has(obj)) {
    return cache.get(obj)
  }
  var newObj = {}
  var hasPropertyDescriptor =
    Object.defineProperty && Object.getOwnPropertyDescriptor
  for (var key in obj) {
    if (key !== 'default' && Object.prototype.hasOwnProperty.call(obj, key)) {
      var desc = hasPropertyDescriptor
        ? Object.getOwnPropertyDescriptor(obj, key)
        : null
      if (desc && (desc.get || desc.set)) {
        Object.defineProperty(newObj, key, desc)
      } else {
        newObj[key] = obj[key]
      }
    }
  }
  newObj.default = obj
  if (cache) {
    cache.set(obj, newObj)
  }
  return newObj
}

function createSimmer() {
  let windowScope =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window
  let customConfig =
    arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {}
  let customQuery =
    arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false
  const config = (0, _configuration.configure)(customConfig)
  const query =
    customQuery || (0, _queryEngine.default)(windowScope, config.queryEngine)
  /**
   * Handle errors in accordance with what is specified in the configuration
   * @param {object/string} ex. The exception object or message
   * @param {object} element. The element Simmer was asked to process
   */

  function onError(ex, element) {
    // handle error
    if (config.errorHandling === true) {
      throw ex
    }

    if (typeof config.errorHandling === 'function') {
      config.errorHandling(ex, element)
    }
  } // Initialize the Simmer object and set it over the reference on the window

  /**
   * The main Simmer action - parses an element on the page to produce a CSS selector for it.
   * This function will be returned into the global Simmer object.
   * @param {object} element. A DOM element you wish to create a selector for.
   * @example
   <code><pre>
   var cssSelectorForDonJulio = Simmer(document.getElementByID('DonJulio'));
   </pre></code>
   */

  const simmer = function (element) {
    if (!element) {
      // handle error
      onError.call(
        simmer,
        new Error('Simmer: No element was specified for parsing.'),
        element
      )
      return null
    } // The parser cycles through a set of parsing methods specified in an order optimal
    // for creating as specific as possible a selector

    const parser = new _parser.default(_methods.default) // get the element's ancestors

    const hierarchy = (0, _stackHierarchy.default)(
      (0, _queryEngine.wrap)(element),
      config.depth
    ) // initialize the state of the selector

    let selectorState = {
      // the stack is used to build a layer of selectors, each layer coresponding to a specific element in the heirarchy
      // for each level we create a private stack of properties, so that we can then merge them
      // comfortably and allow all methods to see the level at which existing properties have been set
      stack: Array(hierarchy.length)
        .fill()
        .map(() => []),
      // follow the current specificity level of the selector - the higher the better
      specificity: 0
    }
    const validator = (0, _validateSelector.default)(
      element,
      config,
      query,
      onError
    ) // cycle through the available parsing methods and while we still have yet to find the requested element's one-to-one selector
    // we keep calling the methods until we are either satisfied or run out of methods

    while (!parser.finished() && !selectorState.verified) {
      try {
        selectorState = parser.next(
          hierarchy,
          selectorState,
          validator,
          config,
          query
        ) // if we have reached a satisfactory level of specificity, try the selector, perhaps we have found our selector?

        if (
          selectorState.specificity >= config.specificityThreshold &&
          !selectorState.verified
        ) {
          selectorState.verified = validator(selectorState)
        }
      } catch (ex) {
        // handle error
        onError.call(simmer, ex, element)
      }
    } // if we were not able to produce a one-to-one selector, return false

    if (
      selectorState.verified === undefined ||
      selectorState.specificity < config.specificityThreshold
    ) {
      // if it is undefined then verfication has never been run!
      // try and verify, and if verification fails - return false
      // if it is false and the specificity is too low to actually try and find the element in the first place, then we may simply have not run
      // an up to date verification - try again
      selectorState.verified = validator(selectorState)
    }

    if (!selectorState.verified) {
      return null
    }

    if (selectorState.verificationDepth) {
      return (0, _convertSelectorStateIntoCSSSelector.default)(
        selectorState,
        selectorState.verificationDepth
      )
    }

    return (0, _convertSelectorStateIntoCSSSelector.default)(selectorState)
  }
  /**
   * Get/Set the configuration for the Simmer object
   * @param config (Object) A configuration object with any of the properties tweeked (none/depth/minimumSpecificity)
   * @example
   <code><pre>
   configuration({
            depth: 3
         });
   </pre></code>
   */

  simmer.configure = function () {
    let configValues =
      arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
    let scope =
      arguments.length > 1 && arguments[1] !== undefined
        ? arguments[1]
        : windowScope
    const newConfig = (0, _configuration.configure)({
      ...config,
      ...configValues
    })
    return createSimmer(
      scope,
      newConfig,
      (0, _queryEngine.default)(scope, newConfig.queryEngine)
    )
  }

  return simmer
}
