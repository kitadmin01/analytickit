'use strict'

var _queryEngine = _interopRequireWildcard(require('./queryEngine'))

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

const { JSDOM } = require('jsdom')

const createElement = function () {
  let dom =
    arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : ''
  return new JSDOM(`<body><div></div></body>`).window.document.querySelector(
    'div'
  )
} /// HTMLElement

describe('QueryEngine', () => {
  describe('attachQueryEngine', () => {
    // // No more! Using querySelectorDeep now
    // test(`defaults to using the document.querySelectorAll as queryEngine`, function () {
    //   const returnValue = [{ tagName: 'div' }, { tagName: 'div' }]
    //   const querySelectorAll = jest.fn(() => returnValue)
    //
    //   const windowScope = {
    //     document: {
    //       querySelectorAll
    //     }
    //   }
    //
    //   const $ = initQueryEngine(windowScope)
    //
    //   expect($('div')).toBe(returnValue)
    //
    //   expect(querySelectorAll.mock.calls[0][0]).toBe('div')
    // })
    test(`takes a query engine and uses it to query`, function () {
      const returnValue = [
        {
          tagName: 'div'
        },
        {
          tagName: 'div'
        }
      ]
      const customQueryEngine = jest.fn(() => returnValue)
      const querySelectorAll = jest.fn(() => [])
      const windowScope = {
        document: {
          querySelectorAll
        }
      }
      const $ = (0, _queryEngine.default)(windowScope, customQueryEngine)
      expect($('div')).toBe(returnValue)
      expect(querySelectorAll.mock.calls.length).toBe(0)
      expect(customQueryEngine.mock.calls[0][0]).toBe('div')
    })
  })
  describe('isUniqueElementID', () => {
    test(`takes a query engine and an id and returns true if the query engine has only one result for that id`, function () {
      const query = jest.fn(() => [createElement()])
      expect((0, _queryEngine.isUniqueElementID)(query, 'uniqueId')).toBe(true)
      expect(query.mock.calls[0][0]).toBe(`[id="uniqueId"]`)
    })
    test(`takes a query engine and an id and returns false if the query engine has no result for that id`, function () {
      const query = jest.fn(() => [])
      expect((0, _queryEngine.isUniqueElementID)(query, 'uniqueId')).toBe(false)
      expect(query.mock.calls[0][0]).toBe(`[id="uniqueId"]`)
    })
    test(`takes a query engine and an id and returns false if the query engine returns multiple result for that id`, function () {
      const query = jest.fn(() => [createElement(), createElement()])
      expect((0, _queryEngine.isUniqueElementID)(query, 'uniqueId')).toBe(false)
      expect(query.mock.calls[0][0]).toBe(`[id="uniqueId"]`)
    })
  })
})
