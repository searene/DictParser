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
var EncodingDetector_1 = require("./../../main/typescript/EncodingDetector");
var constant_1 = require("./../../main/typescript/constant");
var log_1 = require("./../../main/typescript/util/log");
var EncodingDetector_2 = require("../../main/typescript/EncodingDetector");
var chai_1 = require("chai");
var path = require("path");
var fsp = require("fs-promise");
describe('get encoding test', function () {
    var logger = log_1.Log.getLogger();
    var pathToEncodingsDirectory = path.join(constant_1.ROOT_PATH, 'src/test/resources/encodings');
    var utf32be_file = path.join(pathToEncodingsDirectory, 'utf32be.txt');
    var utf32le_file = path.join(pathToEncodingsDirectory, 'utf32le.txt');
    var utf16be_file = path.join(pathToEncodingsDirectory, 'utf16be.txt');
    var utf16le_file = path.join(pathToEncodingsDirectory, 'utf16le.txt');
    var utf8withBom_file = path.join(pathToEncodingsDirectory, 'utf8withBom.txt');
    var utf8_file = path.join(pathToEncodingsDirectory, 'utf8.txt');
    it("#getEncodingInBuffer", function () { return __awaiter(_this, void 0, void 0, function () {
        var utf32be_encoding, _a, utf32le_encoding, _b, utf16be_encoding, _c, utf16le_encoding, _d, utf8withBom_encoding, _e, utf8_encoding, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _a = EncodingDetector_2.getEncodingInBuffer;
                    return [4 /*yield*/, fsp.readFile(utf32be_file)];
                case 1: return [4 /*yield*/, _a.apply(void 0, [_g.sent()])];
                case 2:
                    utf32be_encoding = _g.sent();
                    _b = EncodingDetector_2.getEncodingInBuffer;
                    return [4 /*yield*/, fsp.readFile(utf32le_file)];
                case 3: return [4 /*yield*/, _b.apply(void 0, [_g.sent()])];
                case 4:
                    utf32le_encoding = _g.sent();
                    _c = EncodingDetector_2.getEncodingInBuffer;
                    return [4 /*yield*/, fsp.readFile(utf16be_file)];
                case 5: return [4 /*yield*/, _c.apply(void 0, [_g.sent()])];
                case 6:
                    utf16be_encoding = _g.sent();
                    _d = EncodingDetector_2.getEncodingInBuffer;
                    return [4 /*yield*/, fsp.readFile(utf16le_file)];
                case 7: return [4 /*yield*/, _d.apply(void 0, [_g.sent()])];
                case 8:
                    utf16le_encoding = _g.sent();
                    _e = EncodingDetector_2.getEncodingInBuffer;
                    return [4 /*yield*/, fsp.readFile(utf8withBom_file)];
                case 9: return [4 /*yield*/, _e.apply(void 0, [_g.sent()])];
                case 10:
                    utf8withBom_encoding = _g.sent();
                    _f = EncodingDetector_2.getEncodingInBuffer;
                    return [4 /*yield*/, fsp.readFile(utf8_file)];
                case 11: return [4 /*yield*/, _f.apply(void 0, [_g.sent()])];
                case 12:
                    utf8_encoding = _g.sent();
                    chai_1.assert.deepEqual(utf32be_encoding, { encoding: EncodingDetector_1.UTF_32_BE, posAfterBom: 4 });
                    chai_1.assert.deepEqual(utf32le_encoding, { encoding: EncodingDetector_1.UTF_32_LE, posAfterBom: 4 });
                    chai_1.assert.deepEqual(utf16be_encoding, { encoding: EncodingDetector_1.UTF_16_BE, posAfterBom: 2 });
                    chai_1.assert.deepEqual(utf16le_encoding, { encoding: EncodingDetector_1.UTF_16_LE, posAfterBom: 2 });
                    chai_1.assert.deepEqual(utf8withBom_encoding, { encoding: EncodingDetector_1.UTF_8_BOM, posAfterBom: 3 });
                    chai_1.assert.deepEqual(utf8_encoding, { encoding: EncodingDetector_1.UTF_8, posAfterBom: 0 });
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=DetectEncodingTest.js.map