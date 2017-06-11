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
var DetectEncoding_1 = require("./DetectEncoding");
var DictZipParser_1 = require("./dictzip/DictZipParser");
var EventEmitter = require("events");
var fsp = require("fs-promise");
var path = require("path");
var LineReader = (function (_super) {
    __extends(LineReader, _super);
    /**
     * @param filePath: file to be processed
     * @param len: how many bytes to be read each time
     */
    function LineReader(filePath, len) {
        if (len === void 0) { len = 64 * 104; }
        var _this = _super.call(this) || this;
        _this._filePath = filePath;
        _this._len = len;
        process.nextTick(function () {
            _this.run();
        });
        return _this;
    }
    LineReader.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var ext, bufferReader;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ext = path.extname(this._filePath);
                        bufferReader = LineReader._bufferReaders.get(ext);
                        if (bufferReader == undefined) {
                            throw new Error("No BufferReader is not registered for " + ext + ".");
                        }
                        this._bufferReader = bufferReader;
                        return [4 /*yield*/, this._bufferReader.init(this._filePath)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    LineReader.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var encodingStat, dataProcessTotally, bufferRead, data, dataProcessedEachTime, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this._bufferReader.getEncodingStat()];
                    case 2:
                        encodingStat = _a.sent();
                        this._encoding = encodingStat.encoding;
                        dataProcessTotally = encodingStat.posAfterBom;
                        return [4 /*yield*/, this._bufferReader.read(dataProcessTotally, this._len)];
                    case 3:
                        bufferRead = _a.sent();
                        data = bufferRead;
                        i = 1;
                        _a.label = 4;
                    case 4:
                        if (!(bufferRead.length != 0)) return [3 /*break*/, 6];
                        dataProcessedEachTime = this.emitLines(data, dataProcessTotally);
                        dataProcessTotally += dataProcessedEachTime;
                        return [4 /*yield*/, this._bufferReader.read(encodingStat.posAfterBom + i * this._len, this._len)];
                    case 5:
                        // read 64KB
                        bufferRead = _a.sent();
                        // concat data that is not processed last time and data read this time
                        data = Buffer.concat([data.slice(dataProcessedEachTime), bufferRead]);
                        i++;
                        return [3 /*break*/, 4];
                    case 6:
                        if (data.length > 0) {
                            if (!data.toString(this._encoding).endsWith('\n')) {
                                data = Buffer.concat([data, Buffer.from('\n', this._encoding)]);
                            }
                            this.emitLines(data, dataProcessTotally);
                        }
                        this.destroy();
                        this.emit('end');
                        return [2 /*return*/];
                }
            });
        });
    };
    LineReader.prototype.emitLines = function (buffer, previousBytesRead) {
        var s = buffer.toString(this._encoding);
        var pos = 0;
        var line = "";
        for (var i = 0; i < s.length; i++) {
            if (s[i] == '\r' && i + 1 < s.length && s[i + 1] == '\n') {
                i++;
                this.emit('line', [line, pos + previousBytesRead]);
                pos += Buffer.from(line + '\r\n', this._encoding).length;
                line = "";
            }
            else if ((s[i] == '\r' && i + 1 < s.length && s[i + 1] != '\n') || s[i] == '\n') {
                this.emit('line', [line, pos + previousBytesRead]);
                pos += Buffer.from(line + s[i], this._encoding).length;
                line = "";
            }
            else if (['\r', '\n'].indexOf(s[i]) == -1) {
                line += s[i];
            }
        }
        return pos;
    };
    LineReader.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this._bufferReader.destroy();
                return [2 /*return*/];
            });
        });
    };
    LineReader.register = function (ext, bufferReader) {
        this._bufferReaders.set(ext, bufferReader);
    };
    return LineReader;
}(EventEmitter));
LineReader._bufferReaders = new Map();
exports.LineReader = LineReader;
var SimpleBufferReader = (function () {
    function SimpleBufferReader() {
    }
    SimpleBufferReader.prototype.init = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._filePath = filePath;
                        _a = this;
                        return [4 /*yield*/, fsp.open(filePath, 'r')];
                    case 1:
                        _a._fd = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SimpleBufferReader.prototype.read = function (start, len) {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, readContents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        buffer = Buffer.alloc(len);
                        return [4 /*yield*/, fsp.read(this._fd, buffer, 0, len, start)];
                    case 1:
                        readContents = _a.sent();
                        if (buffer.length > readContents[0]) {
                            buffer = buffer.slice(0, readContents[0]);
                        }
                        return [2 /*return*/, buffer];
                }
            });
        });
    };
    SimpleBufferReader.prototype.destroy = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fsp.close(this._fd)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    SimpleBufferReader.prototype.getEncodingStat = function () {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, bytesRead;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        buffer = Buffer.alloc(4);
                        return [4 /*yield*/, fsp.read(this._fd, buffer, 0, 4, 0)];
                    case 1:
                        bytesRead = _a.sent();
                        if (bytesRead[0] < 4) {
                            throw new Error("The size of file " + this._filePath + " cannot be less than 4 bytes.");
                        }
                        return [4 /*yield*/, DetectEncoding_1.detectEncodingInBuffer(buffer)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return SimpleBufferReader;
}());
var DzBufferReader = (function (_super) {
    __extends(DzBufferReader, _super);
    function DzBufferReader() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DzBufferReader.prototype.init = function (filePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                _super.prototype.init.call(this, filePath);
                this._dictZipParser = new DictZipParser_1.DictZipParser(filePath);
                return [2 /*return*/];
            });
        });
    };
    DzBufferReader.prototype.read = function (start, len) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._dictZipParser.parse(start, len)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    DzBufferReader.prototype.getEncodingStat = function () {
        return __awaiter(this, void 0, void 0, function () {
            var buffer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._dictZipParser.parse(0, 4)];
                    case 1:
                        buffer = _a.sent();
                        if (buffer.length < 4) {
                            throw new Error("The size of file " + this._filePath + " cannot be less than 4 bytes.");
                        }
                        return [4 /*yield*/, DetectEncoding_1.detectEncodingInBuffer(buffer)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return DzBufferReader;
}(SimpleBufferReader));
// register default BufferReaders
LineReader.register('.dsl', new SimpleBufferReader());
LineReader.register('.dz', new DzBufferReader());
//# sourceMappingURL=LineReader.js.map