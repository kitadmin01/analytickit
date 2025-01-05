'use strict'

var _simmer = _interopRequireDefault(require('./simmer'))

var _exposeOnWindow = _interopRequireDefault(require('./exposeOnWindow'))

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj }
}

/* global window, document */
;(0, _exposeOnWindow.default)(window, (0, _simmer.default)(window))
