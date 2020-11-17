"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePath = exports.parseHost = void 0;
var jsuri_1 = __importDefault(require("jsuri"));
exports.parseHost = function (uri) { return new jsuri_1.default(uri).host(); };
exports.parsePath = function (uri) { return new jsuri_1.default(uri).path(); };
//# sourceMappingURL=uri.js.map