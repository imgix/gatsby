"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roundToDP = void 0;
var ramda_1 = require("ramda");
exports.roundToDP = ramda_1.curry(function (dp, num) {
    return Math.round(num * Math.pow(10, dp)) / Math.pow(10, dp);
});
//# sourceMappingURL=number.js.map