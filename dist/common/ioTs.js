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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optional = exports.typeOptional = exports.fromEnum = void 0;
var function_1 = require("fp-ts/lib/function");
var t = __importStar(require("io-ts"));
var typeOptional = function (obj, name) {
    return function_1.pipe(t.type(obj, name), fixOptionals);
};
exports.typeOptional = typeOptional;
/**
 * Fix signature by marking all fields with undefined as optional
 */
var fixOptionals = function (c) { return c; };
/**
 * Just an alias for T | undefined coded
 */
var optional = function (c) {
    return t.union([t.undefined, c]);
};
exports.optional = optional;
function fromEnum(enumName, theEnum) {
    var isEnumValue = function (input) {
        return Object.values(theEnum).includes(input);
    };
    return new t.Type(enumName, isEnumValue, function (input, context) {
        return isEnumValue(input) ? t.success(input) : t.failure(input, context);
    }, t.identity);
}
exports.fromEnum = fromEnum;
__exportStar(require("io-ts"), exports);
//# sourceMappingURL=ioTs.js.map