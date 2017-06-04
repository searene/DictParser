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
var constant_1 = require("./constant");
var log_1 = require("./util/log");
var os_1 = require("./util/os");
var ts_option_1 = require("ts-option");
var fsp = require("fs-promise");
var path = require("path");
/**
 * Created by searene on 17-1-23.
 */
var logger = log_1.Log.getLogger();
var DictionaryFinder = (function () {
    function DictionaryFinder() {
        this.logger = log_1.Log.getLogger();
        this._dictionaries = [];
    }
    DictionaryFinder.prototype.addDictionary = function (dictionary) {
        this._dictionaries.push(dictionary);
    };
    /** <p>Look for resource file/directory in <i>baseDirectory</i>, the rules are as follows.</p>
     * 1. If we find a file whose extension is in <i>resourceHolderSuffixes</i>
     *    and its basename(filename without extension) is the same as
     *    <i>dictFileName</i>'s basename, this is exactly the resource
     *    we need, return it.
     * 2. If we cannot find such a file mentioned above, try to find the first file
     *    whose extension is in <i>resourceHolderSuffixes</i>, return it.
     * 3. If we still cannot find it, try to find a subfolder in <i>baseDirectory</i>
     *    containing at least one file with the extension in <i>resourceFileSuffixes</i>
     *    return the directory
     *
     * @param dictFilePath absolute path to the dictionary file
     * @param baseDirectory the directory where the dictionary definition file
     *        (such as .dsl) lies
     * @param resourceHolderSuffixes extensions of the archived resource file(e.g. zip)
     * @param resourceFileSuffixes resource extensions(e.g. wmv)
     * @returns path to the resource archive/directory represented in string
     */
    DictionaryFinder.prototype.getResource = function (dictFilePath, resourceFiles, resourceHolderSuffixes, resourceFileSuffixes) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var candidates, dictFileBaseName, baseDir, _loop_1, _i, resourceFiles_1, resourceFile, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        candidates = [];
                        dictFileBaseName = path.basename(dictFilePath).split(".")[0];
                        baseDir = path.dirname(dictFilePath);
                        _loop_1 = function (resourceFile) {
                            var isDir, isSameDir, isSameBaseName, isResourceHolder, isResourceFile;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (resourceFile == dictFilePath)
                                            return [2 /*return*/, "continue"];
                                        return [4 /*yield*/, fsp.stat(resourceFile)];
                                    case 1:
                                        isDir = (_a.sent()).isDirectory();
                                        isSameDir = path.dirname(dictFilePath) == path.dirname(resourceFile);
                                        isSameBaseName = path.basename(resourceFile).split(".")[0] == dictFileBaseName;
                                        isResourceHolder = !isDir && resourceHolderSuffixes.indexOf(path.extname(resourceFile)) > -1;
                                        return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                                                var files, _i, files_1, file;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!isDir)
                                                                return [2 /*return*/, false];
                                                            return [4 /*yield*/, fsp.readdir(resourceFile)];
                                                        case 1:
                                                            files = _a.sent();
                                                            for (_i = 0, files_1 = files; _i < files_1.length; _i++) {
                                                                file = files_1[_i];
                                                                if (resourceFileSuffixes.indexOf(path.extname(file)) > -1)
                                                                    return [2 /*return*/, true];
                                                            }
                                                            return [2 /*return*/, false];
                                                    }
                                                });
                                            }); })()];
                                    case 2:
                                        isResourceFile = _a.sent();
                                        if (isSameDir && isSameBaseName && isResourceHolder) {
                                            candidates.push({ file: resourceFile, priority: 1 });
                                            return [2 /*return*/, "break"];
                                        }
                                        else if (isSameDir && isResourceHolder) {
                                            candidates.push({ file: resourceFile, priority: 2 });
                                        }
                                        else if (isSameDir && isResourceFile) {
                                            candidates.push({ file: resourceFile, priority: 3 });
                                        }
                                        return [2 /*return*/];
                                }
                            });
                        };
                        _i = 0, resourceFiles_1 = resourceFiles;
                        _a.label = 1;
                    case 1:
                        if (!(_i < resourceFiles_1.length)) return [3 /*break*/, 4];
                        resourceFile = resourceFiles_1[_i];
                        return [5 /*yield**/, _loop_1(resourceFile)];
                    case 2:
                        state_1 = _a.sent();
                        if (state_1 === "break")
                            return [3 /*break*/, 4];
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        candidates.sort(function (a, b) {
                            return a.priority - b.priority;
                        });
                        return [2 /*return*/, candidates.length == 0 ? ts_option_1.none : ts_option_1.option(candidates[0].file)];
                }
            });
        });
    };
    /** Walk through all files in <i>dir</i> recursively, and look for
     * dictionary definition files(e.g. dz, dsl), add it along with
     * its {@code Dictionary} and resource to the result array.
     */
    DictionaryFinder.prototype.scan = function (dir, dictionaries, dbPath) {
        if (dictionaries === void 0) { dictionaries = this._dictionaries; }
        if (dbPath === void 0) { dbPath = constant_1.DEFAULT_DB_PATH; }
        return __awaiter(this, void 0, void 0, function () {
            var dictMapList, files, _i, files_2, file, ext, _a, dictionaries_1, dict, resource, indexList;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        dictMapList = [];
                        return [4 /*yield*/, os_1.readdirRecursivelyWithStat(dir)];
                    case 1:
                        files = _b.sent();
                        _i = 0, files_2 = files;
                        _b.label = 2;
                    case 2:
                        if (!(_i < files_2.length)) return [3 /*break*/, 8];
                        file = files_2[_i];
                        if (file.stat.isDirectory())
                            return [3 /*break*/, 7];
                        ext = path.extname(file.filePath);
                        _a = 0, dictionaries_1 = dictionaries;
                        _b.label = 3;
                    case 3:
                        if (!(_a < dictionaries_1.length)) return [3 /*break*/, 7];
                        dict = dictionaries_1[_a];
                        if (!(dict.dictionarySuffixes.indexOf(ext) > -1)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getResource(file.filePath, files.map(function (file) { return file.filePath; }), dict.resourceHolderSuffixes, dict.resourceFileSuffixes)];
                    case 4:
                        resource = _b.sent();
                        return [4 /*yield*/, dict.buildIndex(file.filePath)];
                    case 5:
                        indexList = _b.sent();
                        // add it to dictMapList
                        dictMapList.push({
                            dictPath: file.filePath,
                            dictName: dict.dictName,
                            resource: resource.isEmpty ? "" : resource.get,
                            indexList: indexList
                        });
                        _b.label = 6;
                    case 6:
                        _a++;
                        return [3 /*break*/, 3];
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8: 
                    // save to db
                    return [4 /*yield*/, fsp.writeFile(dbPath, JSON.stringify(dictMapList), { encoding: 'utf8' })];
                    case 9:
                        // save to db
                        _b.sent();
                        this._dictMapList = dictMapList;
                        return [2 /*return*/, dictMapList];
                }
            });
        });
    };
    return DictionaryFinder;
}());
exports.DictionaryFinder = DictionaryFinder;
//# sourceMappingURL=DictionaryFinder.js.map