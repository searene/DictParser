/// <reference path="dictzip.d.ts"/>
"use strict";
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
        var _this = this;
        var headerPromise = Promise.resolve(this.chunks);
        if (this.chunks.length == 0) {
            // we haven't read the header
            var headerPromise_1 = this.readDictZipHeader(this.dzFile);
        }
        return new Promise(function (resolve, reject) {
            headerPromise
                .then(function (chunks) {
                _this.chunks = chunks;
                return _this.readFromFile(_this.dzFile, pos, len, inflate_1.jszlib_inflate_buffer, chunks);
            })
                .then(function (buffer) {
                resolve(buffer);
            })
                .catch(function (reason) {
                reject(new Error("Error occurred while read " + _this.dzFile + ", pos: " + pos + ", len: " + len + ", reason: " + reason.message));
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
        var _this = this;
        // index of the first chunk to be read
        var firstChunk = Math.min(Math.floor(pos / this.chlen), this.chunks.length - 1);
        // index of the last chunk to be read
        var lastChunk = Math.min(Math.floor((pos + len) / this.chlen), this.chunks.length - 1);
        // offset of the beginning of the given position
        // relative to firstChunk before compression
        var offset = pos - firstChunk * this.chlen;
        var finish = offset + len;
        var inflatedBuffers = [];
        return new Promise(function (resolve, reject) {
            var _loop_1 = function (i) {
                var buffer = Buffer.allocUnsafeSlow(_this.chunks[i][1]);
                var startOfChunk = 0;
                var sizeOfChunk = 0;
                var fileDescriptor;
                fsp.open(dzFile, 'r')
                    .then(function (fd) {
                    fileDescriptor = fd;
                    startOfChunk = _this.chunks[i][0];
                    sizeOfChunk = _this.chunks[i][1];
                    return fsp.read(fd, buffer, 0, sizeOfChunk, startOfChunk);
                })
                    .then(function (_a) {
                    var bytesRead = _a[0], buffer = _a[1];
                    inflatedBuffers.push(gunzip(buffer.slice(0, bytesRead), 0, bytesRead));
                    if (i == lastChunk) {
                        var inflated = Buffer.concat(inflatedBuffers).slice(offset, finish);
                        resolve(inflated);
                    }
                })
                    .catch(function (reason) {
                    reject("Error occurred while uncompressing file " + dzFile + ": " + reason);
                    if (fileDescriptor != null) {
                        fsp.close(fileDescriptor);
                    }
                });
            };
            for (var i = firstChunk; i <= lastChunk; i++) {
                _loop_1(i);
            }
        });
    };
    /** Read the header of dzFile, return an array, each element of the array
     * consists of two parts:
     *
     *   1. chpos: position of the i-th chunk after compression
     *   2. chsize: length of the i-th chunk after compression
     */
    DictZipParser.prototype.readDictZipHeader = function (dzFile) {
        var _this = this;
        // There are at most 65547 bytes from start to the end of the FEXTRA section
        var buffer = Buffer.allocUnsafeSlow(65547);
        return new Promise(function (resolve, reject) {
            var fileDescriptor;
            fsp.open(dzFile, 'r')
                .then(function (fd) {
                fileDescriptor = fd;
                return fsp.read(fd, buffer, 0, buffer.length, 0);
            })
                .then(function (_a) {
                var bytesRead = _a[0], buffer = _a[1];
                if (buffer[0] != 0x1F || buffer[1] != 0x8B) {
                    throw new Error("Not a gzip header");
                }
                // get the FLG byte
                var FLG = buffer[3];
                // check if FEXTRA bit is set
                if ((FLG & 4) == 0x00) {
                    throw new Error("FEXTRA bit is not set, not a dictzip file!");
                }
                // check if SI1 and SI2 bits are correct
                var SI1 = buffer[12];
                var SI2 = buffer[13];
                var LEN = buffer[14];
                var DATA = buffer.slice(15, 15 + LEN);
                if (SI1 != 82 || SI2 != 65) {
                    throw new Error("Not a dictzip header! SI1 or SI2 is not correct, expected: SI1 == 82, SI2 == 65, got SI1 == " + SI1 + ", SI2 == " + SI2);
                }
                var chunks = _this.buildChunks(DATA);
                resolve(chunks);
            })
                .catch(function (reason) {
                reject(new Error("Error occurred while reading dictzip header: " + reason.message));
                if (fileDescriptor != null) {
                    fsp.close(fileDescriptor);
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
