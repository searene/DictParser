"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var DSLStateMachine_1 = require("./DSLStateMachine");
var Dictionary_1 = require("./Dictionary");
var DictZipParser_1 = require("./dictzip/DictZipParser");
var DetectEncoding_1 = require("./DetectEncoding");
var fsp = require("fs-promise");
var path = require("path");
/**
 * Created by searene on 17-1-23.
 */
var DSLDictionary = (function (_super) {
    __extends(DSLDictionary, _super);
    function DSLDictionary() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._dictName = 'dsl';
        _this._dictionarySuffixes = ['.dsl', '.dz '];
        return _this;
    }
    DSLDictionary.prototype.parse = function (contents) {
        var stateMachine = new DSLStateMachine_1.DSLStateMachine(contents);
        return stateMachine.run();
    };
    DSLDictionary.prototype.getDictContents = function (dictFile) {
        return __awaiter(this, void 0, void 0, function () {
            var dictBinaryContents, dictZipParser, encoding, dictContents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(path.extname(dictFile) == 'dz')) return [3 /*break*/, 2];
                        dictZipParser = new DictZipParser_1.DictZipParser(dictFile);
                        return [4 /*yield*/, dictZipParser.parse(0)];
                    case 1:
                        dictBinaryContents = _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, fsp.readFile(dictFile)];
                    case 3:
                        dictBinaryContents = _a.sent();
                        _a.label = 4;
                    case 4: return [4 /*yield*/, DetectEncoding_1.detectEncodingInBuffer(dictBinaryContents)];
                    case 5:
                        encoding = _a.sent();
                        dictContents = dictBinaryContents.slice(encoding.posAfterBom).toString(encoding.encoding);
                        return [2 /*return*/, dictContents];
                }
            });
        });
    };
    DSLDictionary.prototype.getStartingLineOfDefinitionPart = function (dictContents) {
        var i = 0;
        // read line by line
        var lines = dictContents.split("\n");
        for (; i < lines.length; i++) {
            var line = lines[i];
            if (!line.startsWith("#") && line.trim().length != 0) {
                break;
                ;
            }
        }
        return i;
    };
    DSLDictionary.prototype.buildIndex = function (dictFile) {
        return __awaiter(this, void 0, void 0, function () {
            var indexList, dictContents, lines, definitionStartingLineNumber, i, line;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        indexList = [];
                        return [4 /*yield*/, this.getDictContents(dictFile)];
                    case 1:
                        dictContents = _a.sent();
                        dictContents = dictContents.replace(/\r?\n|\r/g, "\n");
                        lines = dictContents.split("\n");
                        definitionStartingLineNumber = this.getStartingLineOfDefinitionPart(dictContents);
                        for (i = definitionStartingLineNumber; i < lines.length; i++) {
                            line = lines[i];
                            // line is not empty and doesn't start with spaces
                            if (line.trim().length != 0 && [" ", "\t"].indexOf(line.substring(0, 1)) == -1) {
                                indexList.push({ word: this.getIndexableWord(line), line: i });
                            }
                        }
                        return [2 /*return*/, indexList];
                }
            });
        });
    };
    /**
     * Get word without texts surrounded with {}, texts surrounded with {}
     * should not be indexed.
     */
    DSLDictionary.prototype.getIndexableWord = function (line) {
        var isInUnindexablePart = false;
        var indexableWord = "";
        for (var i = 0; i < line.length; i++) {
            if (line.charAt(i) == '\\') {
                if (i == line.length - 1) {
                    indexableWord += "\\";
                    break;
                }
                else if (['{', '}'].indexOf(line.charAt(i + 1)) > -1) {
                    indexableWord += line.charAt(i + 1);
                    i++;
                }
            }
            else if (line.charAt(i) == '{') {
                isInUnindexablePart = true;
            }
            else if (line.charAt(i) == '}') {
                isInUnindexablePart = false;
            }
            else if (!isInUnindexablePart) {
                indexableWord += line.charAt(i);
            }
        }
        return indexableWord;
    };
    return DSLDictionary;
}(Dictionary_1.Dictionary));
exports.DSLDictionary = DSLDictionary;
//# sourceMappingURL=DSLDictionary.js.map