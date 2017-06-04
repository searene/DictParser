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
var log_1 = require("./log");
var EventEmitter = require("events");
var fsp = require("fs-promise");
var path = require("path");
var Walk = (function (_super) {
    __extends(Walk, _super);
    function Walk(dir) {
        var _this = _super.call(this) || this;
        _this.log = log_1.Log.getLogger();
        process.nextTick(function () {
            _this.walkthrough(dir, true);
        });
        return _this;
    }
    Walk.prototype.walkthrough = function (dir, topLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var root, files, stat, _loop_1, this_1, i, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        root = void 0;
                        files = void 0;
                        return [4 /*yield*/, fsp.stat(dir)];
                    case 1:
                        stat = _a.sent();
                        if (!stat.isDirectory) return [3 /*break*/, 3];
                        return [4 /*yield*/, readdirRecursively(dir)];
                    case 2:
                        files = _a.sent();
                        return [3 /*break*/, 4];
                    case 3: throw new Error("File " + dir + " should be a directory.");
                    case 4:
                        _loop_1 = function (i) {
                            var file, stat_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        file = files[i];
                                        return [4 /*yield*/, fsp.stat(file)];
                                    case 1:
                                        stat_1 = _a.sent();
                                        if (stat_1.isDirectory()) {
                                            this_1.emit('dir', file, stat_1);
                                            process.nextTick(function () {
                                                _this.walkthrough(file, false);
                                            });
                                        }
                                        else if (stat_1.isFile()) {
                                            this_1.emit('file', file, stat_1);
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        i = 0;
                        _a.label = 5;
                    case 5:
                        if (!(i < files.length)) return [3 /*break*/, 8];
                        return [5 /*yield**/, _loop_1(i)];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        i++;
                        return [3 /*break*/, 5];
                    case 8:
                        if (topLevel) {
                            this.emit('end');
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        err_1 = _a.sent();
                        this.emit('error', err_1);
                        this.emit('end');
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    return Walk;
}(EventEmitter));
exports.Walk = Walk;
function readdirRecursivelyInternal(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var stat, files, subFiles, _i, subFiles_1, subFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fsp.stat(dir)];
                case 1:
                    stat = _a.sent();
                    files = [];
                    if (!stat.isDirectory()) return [3 /*break*/, 7];
                    files.push(dir);
                    return [4 /*yield*/, fsp.readdir(dir)];
                case 2:
                    subFiles = _a.sent();
                    _i = 0, subFiles_1 = subFiles;
                    _a.label = 3;
                case 3:
                    if (!(_i < subFiles_1.length)) return [3 /*break*/, 6];
                    subFile = subFiles_1[_i];
                    subFile = path.join(dir, subFile);
                    return [4 /*yield*/, readdirRecursivelyInternal(subFile)];
                case 4:
                    (_a.sent()).forEach(function (file) {
                        files.push(file);
                    });
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 8];
                case 7:
                    if (stat.isFile()) {
                        files.push(dir);
                    }
                    _a.label = 8;
                case 8: return [2 /*return*/, files];
            }
        });
    });
}
function readdirRecursively(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var files, subFiles, _i, subFiles_2, subFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    files = [];
                    return [4 /*yield*/, fsp.readdir(dir)];
                case 1:
                    subFiles = _a.sent();
                    _i = 0, subFiles_2 = subFiles;
                    _a.label = 2;
                case 2:
                    if (!(_i < subFiles_2.length)) return [3 /*break*/, 5];
                    subFile = subFiles_2[_i];
                    subFile = path.join(dir, subFile);
                    return [4 /*yield*/, readdirRecursivelyInternal(subFile)];
                case 3:
                    (_a.sent()).forEach(function (file) { return files.push(file); });
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, files];
            }
        });
    });
}
function readdirRecursivelyWithStat(dir) {
    return __awaiter(this, void 0, void 0, function () {
        var result, files, _i, files_1, file, stat;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    result = [];
                    return [4 /*yield*/, readdirRecursively(dir)];
                case 1:
                    files = _a.sent();
                    _i = 0, files_1 = files;
                    _a.label = 2;
                case 2:
                    if (!(_i < files_1.length)) return [3 /*break*/, 5];
                    file = files_1[_i];
                    return [4 /*yield*/, fsp.stat(file)];
                case 3:
                    stat = _a.sent();
                    result.push({ filePath: file, stat: stat });
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5: return [2 /*return*/, result];
            }
        });
    });
}
exports.readdirRecursivelyWithStat = readdirRecursivelyWithStat;
var FSHelper = (function () {
    function FSHelper() {
    }
    FSHelper.removeFileIfExists = function (filename) {
        var logger = log_1.Log.getLogger();
        return new Promise(function (resolve, reject) {
            fsp.unlink(filename)
                .then(function () {
                logger.debug("File " + filename + " is removed");
            })
                .catch(function (err) {
                if (err.code == 'ENOENT') {
                    // file doens't exist, ignore the error.
                    logger.debug("File " + filename + " doesn't exist, won't remove it.");
                }
                else {
                    // maybe we don't have enough permission
                    reject("Error occurred while trying to remove file " + filename + ": " + err.message);
                }
            });
        });
    };
    return FSHelper;
}());
exports.FSHelper = FSHelper;
//# sourceMappingURL=os.js.map