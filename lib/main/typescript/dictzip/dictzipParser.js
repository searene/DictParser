"use strict";
/// <reference path="inflate.d.ts"/>
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
var fsp = require("fs-promise");
var inflate_1 = require("inflate");
/**
 * Created by searene on 2/9/17.
 */
var DictZipParser = (function () {
    function DictZipParser(dzFile) {
        this.dzFile = "";
        // the length of a chunk of data before compression
        // given in the dictzip header
        this.chlen = 0;
        // how many chunck are preset before compression
        // given in the dictzip header
        this.chcnt = 0;
        /* Each element in chunks consists of two parts:
         *   1. chpos: position of the i-th chunk after compression
         *   2. chsize: length of the i-th chunk after compression
         */
        this.chunks = [];
        this.dzFile = dzFile;
    }
    /** Same as {@link #readFromFile(string, number, number, Function, [number, number][])},
     * only that it tries to use(or get) the default dzFile, gunzip and chunks.
     */
    DictZipParser.prototype.read = function (pos, len) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.chunks.length == 0)) return [3 /*break*/, 2];
                        // we haven't read the header
                        return [4 /*yield*/, this.readDictZipHeader(this.dzFile)];
                    case 1:
                        // we haven't read the header
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.readFromFile(this.dzFile, pos, len, inflate_1.jszlib_inflate_buffer, this.chunks)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /** Read `len` bytes from position `pos`, return the read contents.
     *
     * @param dzFile dictzip file to be read
     * @param pos position(in the uncompressed file) to read from
     * @param len length(in the uncompressed file) to read
     * @param gunzip: function to unzip the compressed buffer
     * @param chunks: each element in chunks consists of two parts:
     *          1. chpos: position of the i-th chunk after compression
     *          2. chsize: length of the i-th chunk after compression
     */
    DictZipParser.prototype.readFromFile = function (dzFile, pos, len, gunzip, chunks) {
        return __awaiter(this, void 0, void 0, function () {
            var firstChunk, lastChunk, offset, finish, inflatedBuffers, i, buffer, startOfChunk, sizeOfChunk, fd, _a, bytesRead, contentsRead;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        firstChunk = Math.min(Math.floor(pos / this.chlen), this.chunks.length - 1);
                        lastChunk = Math.min(Math.floor((pos + len) / this.chlen), this.chunks.length - 1);
                        offset = pos - firstChunk * this.chlen;
                        finish = offset + len;
                        inflatedBuffers = [];
                        i = firstChunk;
                        _b.label = 1;
                    case 1:
                        if (!(i <= lastChunk)) return [3 /*break*/, 5];
                        buffer = Buffer.allocUnsafeSlow(this.chunks[i][1]);
                        startOfChunk = 0;
                        sizeOfChunk = 0;
                        return [4 /*yield*/, fsp.open(dzFile, 'r')];
                    case 2:
                        fd = _b.sent();
                        startOfChunk = this.chunks[i][0];
                        sizeOfChunk = this.chunks[i][1];
                        return [4 /*yield*/, fsp.read(fd, buffer, 0, sizeOfChunk, startOfChunk)];
                    case 3:
                        _a = _b.sent(), bytesRead = _a[0], contentsRead = _a[1];
                        inflatedBuffers.push(gunzip(buffer.slice(0, bytesRead), 0, bytesRead));
                        if (i == lastChunk) {
                            return [2 /*return*/, Buffer.concat(inflatedBuffers).slice(offset, finish)];
                        }
                        _b.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /** Read the header of dzFile, return an array, each element of the array
     * consists of two parts:
     *
     *   1. chpos: position of the i-th chunk after compression
     *   2. chsize: length of the i-th chunk after compression
     */
    DictZipParser.prototype.readDictZipHeader = function (dzFile) {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, fd, FLG, SI1, SI2, LEN, DATA;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        buffer = Buffer.allocUnsafeSlow(65547);
                        return [4 /*yield*/, fsp.open(dzFile, 'r')];
                    case 1:
                        fd = _a.sent();
                        return [4 /*yield*/, fsp.read(fd, buffer, 0, buffer.length, 0)];
                    case 2:
                        _a.sent();
                        if (buffer[0] != 0x1F || buffer[1] != 0x8B) {
                            throw new Error("Not a gzip header");
                        }
                        FLG = buffer[3];
                        // check if FEXTRA bit is set
                        if ((FLG & 4) == 0x00) {
                            throw new Error("FEXTRA bit is not set, not a dictzip file!");
                        }
                        SI1 = buffer[12];
                        SI2 = buffer[13];
                        LEN = buffer[14];
                        DATA = buffer.slice(15, 15 + LEN);
                        if (SI1 != 82 || SI2 != 65) {
                            throw new Error("Not a dictzip header! SI1 or SI2 is not correct, expected: SI1 == 82, SI2 == 65, got SI1 == " + SI1 + ", SI2 == " + SI2);
                        }
                        return [2 /*return*/, this.buildChunks(DATA)];
                }
            });
        });
    };
    DictZipParser.prototype.buildChunks = function (metadata) {
        var chunks = [];
        // chpos: position of the i-th chunk after dictzip
        var chpos = 0;
        // length of the i-th chunck after compression
        var tmpChlen = 0;
        var CHLEN = metadata.slice(2, 4).readInt16LE(0);
        var CHCNT = metadata.slice(4, 6).readInt16LE(0);
        for (var i = 0; i < CHCNT; i++) {
            tmpChlen = metadata.slice(2 * i + 6, 2 * i + 8).readInt16LE(0);
            chunks.push([chpos, tmpChlen]);
            chpos += tmpChlen;
        }
        return chunks;
    };
    return DictZipParser;
}());
exports.DictZipParser = DictZipParser;
