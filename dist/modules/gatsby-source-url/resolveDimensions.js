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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveDimensions = void 0;
var Apply_1 = require("fp-ts/lib/Apply");
var O = __importStar(require("fp-ts/lib/Option"));
var pipeable_1 = require("fp-ts/lib/pipeable");
var TE = __importStar(require("fp-ts/lib/TaskEither"));
var fetchImgixMetadata_1 = require("../../api/fetchImgixMetadata");
var log_1 = require("../../common/log");
var sequenceTTE = Apply_1.sequenceT(TE.taskEither);
var sequenceSO = Apply_1.sequenceS(O.option);
var log = log_1.createLogger('resolveDimensions');
exports.resolveDimensions = function (_a) {
    var url = _a.url, manualHeight = _a.manualHeight, manualWidth = _a.manualWidth, cache = _a.cache, client = _a.client;
    var WidthHeightTE = pipeable_1.pipe(sequenceSO({ width: manualHeight, height: manualHeight }), O.fold(function () { return TE.left(new Error("Couldn't find manual width on obj")); }, TE.right));
    return pipeable_1.pipe(WidthHeightTE, TE.map(log_1.trace('manual width and height', log)), TE.orElse(function () {
        return pipeable_1.pipe(url, fetchImgixMetadata_1.fetchImgixMetadata(cache, client), TE.map(log_1.trace('fetchImgixMetadata result', log)), TE.map(function (_a) {
            var PixelWidth = _a.PixelWidth, PixelHeight = _a.PixelHeight;
            return ({
                width: PixelWidth,
                height: PixelHeight,
            });
        }));
    }));
};
//# sourceMappingURL=resolveDimensions.js.map