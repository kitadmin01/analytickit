"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _inspectDataAttributes = _interopRequireDefault(require("./inspectDataAttributes"));

var _inspectElementID = _interopRequireDefault(require("./inspectElementID"));

var _inspectTags = _interopRequireDefault(require("./inspectTags"));

var _inspectSiblings = _interopRequireDefault(require("./inspectSiblings"));

var _inspectNthChild = _interopRequireDefault(require("./inspectNthChild"));

var _inspectSpecialAttributes = _interopRequireDefault(require("./inspectSpecialAttributes"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The ParsingMethods are the key methods for the parsing process. They provide the various ways by which we analyze an element.
 * This object is a wrapper for building the list of available parsing methods and managing the context in which they are run so
 * that they all have access to basic parsing helper methods
 * */
const parsingMethods = {
  methods: [],
  getMethods: function () {
    return this.methods.slice(0);
  },
  addMethod: function (fn) {
    this.methods.push(fn);
  }
};
parsingMethods.addMethod(_inspectDataAttributes.default);
parsingMethods.addMethod(_inspectElementID.default);
parsingMethods.addMethod(_inspectTags.default);
parsingMethods.addMethod(_inspectSpecialAttributes.default);
parsingMethods.addMethod(_inspectSiblings.default);
parsingMethods.addMethod(_inspectNthChild.default);
var _default = parsingMethods;
exports.default = _default;