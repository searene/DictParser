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
var DSLWordTreeToHTMLConverter_1 = require("./DSLWordTreeToHTMLConverter");
var LineReader_1 = require("./LineReader");
var BufferReader_1 = require("./BufferReader");
var DSLStateMachine_1 = require("./DSLStateMachine");
var Dictionary_1 = require("./Dictionary");
var path = require("path");
/**
 * Created by searene on 17-1-23.
 */
var DSLDictionary = (function (_super) {
    __extends(DSLDictionary, _super);
    function DSLDictionary() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._dictionarySuffixes = ['.dsl', '.dz'];
        _this.wordTreeHTMLConverter = new DSLWordTreeToHTMLConverter_1.DSLWordTreeToHTMLConverter();
        return _this;
    }
    DSLDictionary.prototype.getWordTree = function (dictFile, pos, len) {
        return __awaiter(this, void 0, void 0, function () {
            var input, stateMachine;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getFileContents(dictFile, pos, len)];
                    case 1:
                        input = _a.sent();
                        stateMachine = new DSLStateMachine_1.DSLStateMachine(input);
                        return [2 /*return*/, stateMachine.run()];
                }
            });
        });
    };
    DSLDictionary.prototype.getHTML = function (dictFile, pos, len) {
        return __awaiter(this, void 0, void 0, function () {
            var wordTree;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getWordTree(dictFile, pos, len)];
                    case 1:
                        wordTree = _a.sent();
                        return [2 /*return*/, this.wordTreeHTMLConverter.convertWordTreeToHTML(wordTree)];
                }
            });
        });
    };
    DSLDictionary.prototype.getDictionaryStats = function (dictFile) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var indexMap = {};
                        var meta = {};
                        var isInDefinition = false;
                        var lineReader = new LineReader_1.LineReader(dictFile);
                        var previousLine;
                        var wordTreeLength = 0;
                        var firstEntryPos;
                        var entryList = [];
                        lineReader.on('line', function (lineStats) {
                            var line = lineStats.line;
                            if (!isInDefinition && line.startsWith('#')) {
                                // meta data
                                var header = line.substring(1).split(/\s(.+)/);
                                meta[header[0]] = header[1].substring(1, header[1].length - 1);
                            }
                            else if (!isInDefinition && !line.startsWith('#')) {
                                isInDefinition = true;
                            }
                            else if (isInDefinition && !/^\s/.test(line)) {
                                // entry
                                if (previousLine.trim() == '' || /^\s/.test(previousLine)) {
                                    // previous line is empty or definition,
                                    // which means the current line is the beginning of a new entry
                                    wordTreeLength = 0;
                                    entryList = [];
                                    firstEntryPos = lineStats.pos;
                                }
                                wordTreeLength += lineStats.len;
                                var word = _this.getIndexableWord(lineStats.line.trim());
                                entryList.push(word);
                                indexMap[word] = { pos: firstEntryPos, len: -1 };
                            }
                            else if (isInDefinition && /^\s/.test(line)) {
                                wordTreeLength += lineStats.len;
                                entryList.forEach(function (entry) {
                                    indexMap[entry].len = wordTreeLength;
                                });
                            }
                            previousLine = line;
                        });
                        lineReader.on('end', function () {
                            resolve({ meta: meta, indexMap: indexMap });
                        });
                        lineReader.process();
                    })];
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
    DSLDictionary.prototype.getBufferReader = function (dictFile) {
        var bufferReader;
        var ext = path.extname(dictFile);
        if (ext == '.dsl') {
            bufferReader = new BufferReader_1.SimpleBufferReader();
        }
        else if (ext == '.dz') {
            bufferReader = new BufferReader_1.DzBufferReader();
        }
        else {
            throw new Error(ext + " file is not supported");
        }
        return bufferReader;
    };
    DSLDictionary.prototype.getFileContents = function (dictFile, pos, len) {
        return __awaiter(this, void 0, void 0, function () {
            var bufferReader, buffer, encoding;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bufferReader = this.getBufferReader(dictFile);
                        return [4 /*yield*/, bufferReader.read(dictFile, pos, len)];
                    case 1:
                        buffer = _a.sent();
                        return [4 /*yield*/, bufferReader.getEncodingStat(dictFile)];
                    case 2:
                        encoding = (_a.sent()).encoding;
                        return [2 /*return*/, buffer.toString(encoding)];
                }
            });
        });
    };
    return DSLDictionary;
}(Dictionary_1.Dictionary));
exports.DSLDictionary = DSLDictionary;
//# sourceMappingURL=DSLDictionary.js.map