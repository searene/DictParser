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
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var DetectEncoding_1 = require("./../../main/typescript/DetectEncoding");
var constant_1 = require("./../../main/typescript/constant");
var log_1 = require("./../../main/typescript/util/log");
var DetectEncoding_2 = require("../../main/typescript/DetectEncoding");
var chai_1 = require("chai");
var path = require("path");
describe('detect encoding test', function () {
    var logger = log_1.Log.getLogger();
    var pathToEncodingsDirectory = path.join(constant_1.ROOT_PATH, 'src/test/resources/encodings');
    var utf32be_file = path.join(pathToEncodingsDirectory, 'utf32be.txt');
    var utf32le_file = path.join(pathToEncodingsDirectory, 'utf32le.txt');
    var utf16be_file = path.join(pathToEncodingsDirectory, 'utf16be.txt');
    var utf16le_file = path.join(pathToEncodingsDirectory, 'utf16le.txt');
    var utf8withBom_file = path.join(pathToEncodingsDirectory, 'utf8withBom.txt');
    var utf8_file = path.join(pathToEncodingsDirectory, 'utf8.txt');
    it("#detectEncoding", function () { return __awaiter(_this, void 0, void 0, function () {
        var utf32be_encoding, utf32le_encoding, utf16be_encoding, utf16le_encoding, utf8withBom_encoding, utf8_encoding;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, DetectEncoding_2.detectEncodingByBOM(utf32be_file)];
                case 1:
                    utf32be_encoding = _a.sent();
                    return [4 /*yield*/, DetectEncoding_2.detectEncodingByBOM(utf32le_file)];
                case 2:
                    utf32le_encoding = _a.sent();
                    return [4 /*yield*/, DetectEncoding_2.detectEncodingByBOM(utf16be_file)];
                case 3:
                    utf16be_encoding = _a.sent();
                    return [4 /*yield*/, DetectEncoding_2.detectEncodingByBOM(utf16le_file)];
                case 4:
                    utf16le_encoding = _a.sent();
                    return [4 /*yield*/, DetectEncoding_2.detectEncodingByBOM(utf8withBom_file)];
                case 5:
                    utf8withBom_encoding = _a.sent();
                    return [4 /*yield*/, DetectEncoding_2.detectEncodingByBOM(utf8_file)];
                case 6:
                    utf8_encoding = _a.sent();
                    chai_1.assert.deepEqual(utf32be_encoding, { isDetectionSuccessful: true, encoding: DetectEncoding_1.UTF_32_BE });
                    chai_1.assert.deepEqual(utf32le_encoding, { isDetectionSuccessful: true, encoding: DetectEncoding_1.UTF_32_LE });
                    chai_1.assert.deepEqual(utf16be_encoding, { isDetectionSuccessful: true, encoding: DetectEncoding_1.UTF_16_BE });
                    chai_1.assert.deepEqual(utf16le_encoding, { isDetectionSuccessful: true, encoding: DetectEncoding_1.UTF_16_LE });
                    chai_1.assert.deepEqual(utf8withBom_encoding, { isDetectionSuccessful: true, encoding: DetectEncoding_1.UTF_8_BOM });
                    chai_1.assert.deepEqual(utf8_encoding, { isDetectionSuccessful: false, encoding: "" });
                    return [2 /*return*/];
            }
        });
    }); });
    it("#getPosAfterBOM", function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    _b = (_a = chai_1.assert).equal;
                    return [4 /*yield*/, DetectEncoding_2.getPosAfterBOM(utf32be_file)];
                case 1:
                    _b.apply(_a, [_o.sent(), 4]);
                    _d = (_c = chai_1.assert).equal;
                    return [4 /*yield*/, DetectEncoding_2.getPosAfterBOM(utf32le_file)];
                case 2:
                    _d.apply(_c, [_o.sent(), 4]);
                    _f = (_e = chai_1.assert).equal;
                    return [4 /*yield*/, DetectEncoding_2.getPosAfterBOM(utf16be_file)];
                case 3:
                    _f.apply(_e, [_o.sent(), 2]);
                    _h = (_g = chai_1.assert).equal;
                    return [4 /*yield*/, DetectEncoding_2.getPosAfterBOM(utf16le_file)];
                case 4:
                    _h.apply(_g, [_o.sent(), 2]);
                    _k = (_j = chai_1.assert).equal;
                    return [4 /*yield*/, DetectEncoding_2.getPosAfterBOM(utf8withBom_file)];
                case 5:
                    _k.apply(_j, [_o.sent(), 3]);
                    _m = (_l = chai_1.assert).equal;
                    return [4 /*yield*/, DetectEncoding_2.getPosAfterBOM(utf8_file)];
                case 6:
                    _m.apply(_l, [_o.sent(), 0]);
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=DetectEncodingTest.js.map