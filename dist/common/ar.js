"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseStringARParam = exports.StringAspectRatio = void 0;
var t = __importStar(require("io-ts"));
var R = __importStar(require("ramda"));
var number_1 = require("./number");
exports.StringAspectRatio = t.brand(t.string, function (v) { return aspectRatioIsValid(v); }, 'StringAspectRatio');
/**
 * Validates that an aspect ratio is in the format w:h. If false is returned, the aspect ratio is in the wrong format.
 */
function aspectRatioIsValid(aspectRatio) {
    if (typeof aspectRatio !== 'string') {
        return false;
    }
    return /^\d+(\.\d+)?:\d+(\.\d+)?$/.test(aspectRatio);
}
var parseStringARParam = function (ar) {
    return R.pipe(function (v) { return v.split(':'); }, R.map(function (part) { return parseFloat(part); }), function (_a) {
        var width = _a[0], height = _a[1];
        return width / height;
    }, function (v) { return number_1.roundToDP(3, v); })(ar);
};
exports.parseStringARParam = parseStringARParam;
//# sourceMappingURL=ar.js.map