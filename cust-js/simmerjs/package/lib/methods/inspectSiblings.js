"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _lodash = _interopRequireDefault(require("lodash.take"));

var _validationHelpers = require("./validationHelpers");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
/**
 * Inspect the element's siblings by CSS Class names and compare them to the analyzed element.
 * @param {array} hierarchy. The hierarchy of elements
 * @param {object} state. The current calculated CSS selector
 */
function _default(hierarchy, state) {
  return hierarchy.reduce((selectorState, currentElem, index) => {
    const validClasses = (0, _lodash.default)(currentElem.getClasses(), 10).filter(_validationHelpers.className).map(className => `.${(0, _validationHelpers.escapeClassName)(className)}`);

    if (validClasses.length) {
      // limit to 10 classes
      selectorState.stack[index].push(validClasses.join(''));
      selectorState.specificity += 10 * validClasses.length;
    }

    return selectorState;
  }, state);
}