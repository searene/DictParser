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
var fsp = require("fs-promise");
var path = require("path");
/**
 * Created by searene on 17-1-23.
 */
var DictionaryFinder = (function () {
    function DictionaryFinder() {
        this.logger = log_1.Log.getLogger();
    }
    DictionaryFinder.prototype.addDictionary = function (dictionary) {
        this._dictionaries.push(dictionary);
    };
    /** Classify files to directories and normal files non-recursively.
     *
     * @param baseDirectory baseDirectory of all the files in the parameter <i>files</i>
     * @param files an array of files with relative paths to be classified
     * @returns a Promise, whose type is a tuple, where the first item
     *          is the array of directories, the second item is the array of normal files
     */
    DictionaryFinder.prototype.classifyFilesNonRecursively = function (baseDirectory, files) {
        var len = files.length;
        var dirs = [];
        var normalFiles = [];
        return new Promise(function (resolve, reject) {
            files.forEach(function (file, index) {
                var fullPath = path.join(baseDirectory, file);
                fsp.stat(fullPath)
                    .then(function (stat) {
                    if (stat.isDirectory) {
                        dirs.push(fullPath);
                    }
                    else if (stat.isFile) {
                        normalFiles.push(fullPath);
                    }
                    if (index == len - 1) {
                        // we have processed all files, resolve now
                        resolve([dirs, normalFiles]);
                    }
                })
                    .catch(function (err) {
                    reject(err);
                });
            });
        });
    };
    /** <p>Look for resource file/directory in <i>baseDirectory</i>, the rules are as follows.</p>
     * 1. If we find a file whose extension is in <i>resourceHolderSuffixes</i>
     *    and its basename(filename without extension) is the same as
     *    <i>definitionFileName</i>'s basename, this is exactly the resource
     *    we need, return it.
     * 2. If we cannot find such a file mentioned above, try to find the first file
     *    whose extension is in <i>resourceHolderSuffixes</i>, return it.
     * 3. If we still cannot find it, try to find a subfolder in <i>baseDirectory</i>
     *    containing at least one file with the extension in <i>resourceFileSuffixes</i>
     *    return the directory
     *
     * @param definitionFileName name of the definition file, such as wordnet.dsl.dz
     * @param baseDirectory the directory where the dictionary definition file
     *        (such as .dsl) lies
     * @param resourceHolderSuffixes extensions of the archived resource file(e.g. zip)
     * @param resourceFileSuffixes resource extensions(e.g. wmv)
     * @returns path to the resource archive/directory represented in string
     */
    DictionaryFinder.prototype.getResource = function (definitionFileName, baseDirectory, resourceHolderSuffixes, resourceFileSuffixes) {
        var _this = this;
        var candidate;
        var dirs = [];
        var normalFiles = [];
        return new Promise(function (resolve, reject) {
            fsp.readdir(baseDirectory)
                .then(function (files) {
                return _this.classifyFilesNonRecursively(baseDirectory, files);
            })
                .then(function (_a) {
                var dirs = _a[0], normalFiles = _a[1];
                normalFiles.forEach(function (file) {
                    if (path.extname(file) in resourceHolderSuffixes) {
                        if (definitionFileName.split('.')[0] == file.split('.')[0]) {
                            // correct suffix, correct filename, this is exactly
                            // the file we want, just return it
                            resolve(file);
                        }
                        else {
                            // correct suffix, incorrect filename, this may be
                            // the file we want, add it to the list so we chan
                            // check later
                            candidate = file;
                        }
                    }
                });
                if (candidate != null) {
                    resolve(candidate);
                }
                else {
                    var resDir = _this.getResourceDirectory(dirs, resourceFileSuffixes);
                    resolve(resDir);
                }
            })
                .catch(function (err) { reject(err); });
        });
    };
    DictionaryFinder.prototype.getResourceDirectory = function (dirs, resourceFileSuffixes) {
        return new Promise(function (resolve, reject) {
            dirs.forEach(function (dir, index) {
                fsp.readdir(dir)
                    .then(function (files) {
                    files.forEach(function (file) {
                        if (path.extname(file) in resourceFileSuffixes) {
                            resolve(dir);
                        }
                    });
                    if (index == dirs.length - 1) {
                        // all dirs looped, resource not isFound
                        resolve('');
                    }
                })
                    .catch(function (err) { reject(err); });
            });
        });
    };
    /** Walk through all files in <i>dir</i> recursively, and look for
     * dictionary definition files(e.g. dz, dsl), add it along with
     * its TreeBuilder to the result array.
     */
    DictionaryFinder.prototype.searchForDictionaryFiles = function (dir, dictionaries) {
        if (dictionaries === void 0) { dictionaries = this._dictionaries; }
        // DictMap without resource
        var dictMap = [];
        return new Promise(function (resolve, reject) {
            var walk = new os_1.Walk(dir);
            walk.on('error', function (err) {
                reject(err);
            });
            walk.on('file', function (file, stat) {
                var ext = path.extname(file);
                for (var _i = 0, dictionaries_1 = dictionaries; _i < dictionaries_1.length; _i++) {
                    var dictionary = dictionaries_1[_i];
                    if (ext in dictionary.dictionarySuffixes) {
                        dictMap.push({
                            dictPath: file,
                            dictionary: dictionary,
                            resource: ''
                        });
                        break;
                    }
                }
            });
            walk.on('end', function () {
                resolve(dictMap);
            });
        });
    };
    /** Get resource file for each dictionary in dictMap, and
     * store the resource path back in dictMap.
     */
    DictionaryFinder.prototype.getResources = function (dictMap) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            dictMap.forEach(function (map, index) {
                _this.getResource(map.dictPath, path.dirname(map.dictPath), map.dictionary.resourceHolderSuffixes, map.dictionary.resourceFileSuffixes)
                    .then(function (res) {
                    map.resource = res;
                    if (index == dictMap.length - 1) {
                        resolve();
                    }
                })
                    .catch(function (err) {
                    reject(err);
                });
            });
        });
    };
    /** Scan the directory and look for dictionaries/resources
     * supported by one of treeBuilders in <i>this.treeBuilders</i> list
     *
     * @param dir directory to search in
     */
    DictionaryFinder.prototype.scan = function (dir) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.searchForDictionaryFiles(dir)
                .then(function (dictMap) {
                _this.dictMap = dictMap;
                return _this.getResources(dictMap);
            })
                .then(function () {
                return _this.saveDictMap(_this.dictMap);
            })
                .then(function () {
                return _this.buildIndexWithDictMap(_this.dictMap);
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    DictionaryFinder.prototype.buildIndexWithDictMap = function (dictMapList, dbFile) {
        if (dbFile === void 0) { dbFile = constant_1.DEFAULT_DB_PATH; }
        return __awaiter(this, void 0, void 0, function () {
            var _i, dictMapList_1, dictMap, dictionary, indexList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _i = 0, dictMapList_1 = dictMapList;
                        _a.label = 1;
                    case 1:
                        if (!(_i < dictMapList_1.length)) return [3 /*break*/, 5];
                        dictMap = dictMapList_1[_i];
                        dictionary = dictMap.dictionary;
                        return [4 /*yield*/, dictionary.buildIndex(dictMap.dictPath)];
                    case 2:
                        indexList = _a.sent();
                        return [4 /*yield*/, dictionary.saveIndex(indexList, dbFile)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DictionaryFinder.prototype.saveDictMap = function (dictMaps, dbFile) {
        if (dbFile === void 0) { dbFile = constant_1.DEFAULT_DB_PATH; }
        return __awaiter(this, void 0, void 0, function () {
            var dbContents, dbJson, newDictMaps, _i, dictMaps_1, dictMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fsp.readFile(dbFile, { encoding: "utf-8" })];
                    case 1:
                        dbContents = _a.sent();
                        dbJson = JSON.parse(dbContents);
                        newDictMaps = [];
                        for (_i = 0, dictMaps_1 = dictMaps; _i < dictMaps_1.length; _i++) {
                            dictMap = dictMaps_1[_i];
                            newDictMaps.push({
                                dict: dictMap.dictPath,
                                resource: dictMap.resource
                            });
                        }
                        dbJson['dictionary'] = newDictMaps;
                        return [4 /*yield*/, fsp.writeFile(dbFile, dbJson, { encoding: 'utf8' })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return DictionaryFinder;
}());
exports.DictionaryFinder = DictionaryFinder;
//# sourceMappingURL=DictionaryFinder.js.map