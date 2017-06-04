"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("./util/log");
exports.UTF_8_BOM = "utf8";
exports.UTF_8 = "utf8";
exports.UTF_16_BE = "utf16be";
exports.UTF_16_LE = "utf16le";
exports.UTF_32_BE = "utf32be";
exports.UTF_32_LE = "utf32le";
var logger = log_1.Log.getLogger();
/**
 * Detect file encoding using BOM(Byte Order Mark) at the beginning of the file,
 * the following encodings are supported:
 *
 *      utf32be
 *      utf32le
 *      utf16be
 *      utf16le
 *      utf8
 *
 * Notice that a lot of UTF-8 files are deemed indetectable by the function because they don't
 * have a BOM header.
 *
 * @param fileContents file contents represented as Buffer, at least 4 bytes are needed
 * @return an object, containing two keys:
 *          {@code encoding: string}
 *          {@code posAfterBom: pos of the real contents, excluding the bom at the beginning}
 */
function detectEncodingInBuffer(fileContents) {
    return __awaiter(this, void 0, void 0, function () {
        var bom;
        return __generator(this, function (_a) {
            if (fileContents.length < 4) {
                throw new Error("at least 4 bytes are needed");
            }
            bom = fileContents.slice(0, 4);
            if (bom.equals(Buffer.from("0000FEFF", "hex"))) {
                return [2 /*return*/, { encoding: exports.UTF_32_BE, posAfterBom: 4 }];
            }
            else if (bom.equals(Buffer.from("FFFE0000", "hex"))) {
                return [2 /*return*/, { encoding: exports.UTF_32_LE, posAfterBom: 4 }];
            }
            else if (bom.slice(0, 2).equals(Buffer.from("FEFF", "hex"))) {
                return [2 /*return*/, { encoding: exports.UTF_16_BE, posAfterBom: 2 }];
            }
            else if (bom.slice(0, 2).equals(Buffer.from("FFFE", "hex"))) {
                return [2 /*return*/, { encoding: exports.UTF_16_LE, posAfterBom: 2 }];
            }
            else if (bom.slice(0, 3).equals(Buffer.from("EFBBBF", "hex"))) {
                return [2 /*return*/, { encoding: exports.UTF_8_BOM, posAfterBom: 3 }];
            }
            else {
                return [2 /*return*/, { encoding: exports.UTF_8, posAfterBom: 0 }];
            }
            return [2 /*return*/];
        });
    });
}
exports.detectEncodingInBuffer = detectEncodingInBuffer;
//# sourceMappingURL=DetectEncoding.js.map