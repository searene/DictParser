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
var chai_1 = require("chai");
var constant_1 = require("./../../main/typescript/constant");
var DSLDictionary_1 = require("./../../main/typescript/DSLDictionary");
var log_1 = require("./../../main/typescript/util/log");
var path = require("path");
describe('DSLDictionaryTest', function () {
    var logger = log_1.Log.getLogger();
    it("#getIndexableWord", function () {
        var word = "abc{de}f\\{g\\}h";
        var dictionary = new DSLDictionary_1.DSLDictionary();
        var indexableWord = dictionary.getIndexableWord(word);
        chai_1.assert.equal(indexableWord, "abcf{g}h");
    });
    it("#getDictionaryStats", function () { return __awaiter(_this, void 0, void 0, function () {
        var dzFile, dictionary, dictionaryStats;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    dzFile = path.join(constant_1.ROOT_PATH, 'src/test/resources/dsl/sample.dsl');
                    dictionary = new DSLDictionary_1.DSLDictionary();
                    return [4 /*yield*/, dictionary.getDictionaryStats(dzFile)];
                case 1:
                    dictionaryStats = _a.sent();
                    chai_1.assert.deepEqual(dictionaryStats, {
                        meta: {
                            'NAME': 'Sample DSL Dictionary',
                            'INDEX_LANGUAGE': 'English',
                            'CONTENTS_LANGUAGE': 'English'
                        },
                        indexMap: {
                            'trivial card': { pos: 182, len: 206 },
                            'sample entry': { pos: 388, len: 29476 },
                            'example': { pos: 388, len: 29476 },
                            'sample  card': { pos: 388, len: 29476 },
                            'sample headword': { pos: 388, len: 29476 },
                            'typical card': { pos: 29864, len: 3762 },
                            'resourceCard': { pos: 33626, len: 180 }
                        }
                    });
                    return [2 /*return*/];
            }
        });
    }); });
});
//# sourceMappingURL=DSLDictionaryTest.js.map