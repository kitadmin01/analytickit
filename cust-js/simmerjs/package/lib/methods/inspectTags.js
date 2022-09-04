"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _validationHelpers = require("./validationHelpers");

/**
/**
 * Inspect the elements' Tag names and add them to the calculates CSS selector
 * @param {array} hierarchy. The hierarchy of elements
 * @param {object} state. The current calculated CSS selector
 */
function _default(hierarchy, state) {
  return hierarchy.reduce((selectorState, currentElem, index) => {
    ;
    [currentElem.el.nodeName].filter(_validationHelpers.tagName).forEach(tagName => {
      selectorState.stack[index].splice(0, 0, tagName); // custom elements get a few more points

      if (tagName.includes('-')) {
        selectorState.specificity += 30;
      } else {
        selectorState.specificity += 10;
      }
    });
    return selectorState;
  }, state);
}