'use strict'

Object.defineProperty(exports, '__esModule', {
  value: true
})
exports.default = Parser

function Parser(parsingMethods) {
  const queue = parsingMethods.getMethods()
  return {
    finished() {
      return queue.length === 0
    },

    next() {
      if (this.finished()) {
        return false
      }

      return queue.shift()(...arguments)
    }
  }
}
