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
exports.TaskOptionFromTE = void 0;
var function_1 = require("fp-ts/lib/function");
var O = __importStar(require("fp-ts/lib/Option"));
var T = __importStar(require("fp-ts/lib/Task"));
var TE = __importStar(require("fp-ts/lib/TaskEither"));
/**
 * Convert a TaskEither to a Task composing an Option
 * @param taskEither
 */
var TaskOptionFromTE = function (taskEither) {
    return TE.fold(function () { return T.of(O.none); }, function_1.flow(O.some, T.of))(taskEither);
};
exports.TaskOptionFromTE = TaskOptionFromTE;
//# sourceMappingURL=fpTsUtils.js.map