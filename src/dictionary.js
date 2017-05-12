"use strict";
var log_1 = require("./util/log");
var fsp = require("fs-promise");
var path = require("path");
var universal_1 = require("./universal");
var os_1 = require("./util/os");
var database_1 = require("./database");
/**
 * Created by searene on 17-1-23.
 */
var DictionaryManager = (function () {
    function DictionaryManager(dbFile) {
        if (dbFile === void 0) { dbFile = universal_1.Constant.defaultDbPath; }
        this.logger = log_1.Log.getLogger();
        database_1.DatabaseFactory.initDatabase(dbFile);
    }
    /** You have to call the method after you have done everything
     * with DictionaryManager in order to release resources.
     */
    DictionaryManager.prototype.close = function () {
        return new Promise(function (resolve, reject) {
            database_1.DatabaseFactory.close();
        });
    };
    DictionaryManager.prototype.addTreeBuilder = function (treeBuilder) {
        this.treeBuilders.push(treeBuilder);
    };
    /** Classify files to directories and normal files non-recursively.
     *
     * @param baseDirectory baseDirectory of all the files in the parameter <i>files</i>
     * @param files an array of files with relative paths to be classified
     * @returns a Promise, whose type is a tuple, where the first item
     *          is the array of directories, the second item is the array of normal files
     */
    DictionaryManager.prototype.classifyFilesNonRecursively = function (baseDirectory, files) {
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
                })["catch"](function (err) {
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
    DictionaryManager.prototype.getResource = function (definitionFileName, baseDirectory, resourceHolderSuffixes, resourceFileSuffixes) {
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
            })["catch"](function (err) { reject(err); });
        });
    };
    DictionaryManager.prototype.getResourceDirectory = function (dirs, resourceFileSuffixes) {
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
                        // all dirs looped, resource not found
                        resolve('');
                    }
                })["catch"](function (err) { reject(err); });
            });
        });
    };
    /** Walk through all files in <i>dir</i> recursively, and look for
     * the dictionary definition file(e.g. dz, dsl), add it along with
     * its TreeBuilder to the result array.
     */
    DictionaryManager.prototype.searchForDictionaryFiles = function (dir, treeBuilders) {
        if (treeBuilders === void 0) { treeBuilders = this.treeBuilders; }
        // DictMap without resource
        var dictMap = [];
        return new Promise(function (resolve, reject) {
            var walk = new os_1.Walk(dir);
            walk.on('error', function (err) {
                reject(err);
            });
            walk.on('file', function (file, stat) {
                var ext = path.extname(file);
                for (var _i = 0, treeBuilders_1 = treeBuilders; _i < treeBuilders_1.length; _i++) {
                    var treeBuilder = treeBuilders_1[_i];
                    if (ext in treeBuilder.dictionarySuffixes) {
                        dictMap.push({
                            dict: file,
                            treeBuilder: treeBuilder,
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
    DictionaryManager.prototype.getResources = function (dictMap) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            dictMap.forEach(function (map, index) {
                _this.getResource(map.dict, path.dirname(map.dict), map.treeBuilder.resourceHolderSuffixes, map.treeBuilder.resourceFileSuffixes)
                    .then(function (res) {
                    map.resource = res;
                    if (index == dictMap.length - 1) {
                        resolve();
                    }
                })["catch"](function (err) {
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
    DictionaryManager.prototype.scan = function (dir) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.searchForDictionaryFiles(dir)
                .then(function (dictMap) {
                _this.dictMap = dictMap;
                return _this.getResources(dictMap);
            })
                .then(function () {
                return _this.prepareDictTable();
            })
                .then(function () {
                return _this.insertDictInfoIntoDb(_this.dictMap);
            })
                .then(function () {
                return _this.buildIndexWithDictMap(_this.dictMap);
            })["catch"](function (err) {
                reject(err);
            });
        });
    };
    DictionaryManager.prototype.buildIndexWithDictMap = function (dictMap) {
        return new Promise(function (resolve, reject) {
            dictMap.forEach(function (map, index) {
                map.treeBuilder.getIndexBuilder(map.dict).buildIndex()
                    .then(function () {
                    if (index = dictMap.length - 1) {
                        resolve();
                    }
                })["catch"](function (err) {
                    reject(err);
                });
            });
        });
    };
    // TODO change public back
    DictionaryManager.prototype.insertDictInfoIntoDb = function (dictMap) {
        var db = database_1.DatabaseFactory.getDb();
        var dictTable = universal_1.Constant.dictTableName;
        var insertSQL = "INSERT OR UPDATE INTO " + dictTable + " \n                        (DICT_ID, DICT_FILE, RESOURCE)\n                        VALUES (NULL, ?, ?)";
        return new Promise(function (resolve, reject) {
            db.parallelize(function () {
                var _loop_1 = function (index, map) {
                    db.run(insertSQL, {
                        1: map.dict,
                        2: map.resource
                    }, function (err) {
                        if (err != null) {
                            reject(err);
                        }
                        else if (index == dictMap.length - 1) {
                            resolve();
                        }
                    });
                };
                for (var _i = 0, _a = dictMap.entries(); _i < _a.length; _i++) {
                    var _b = _a[_i], index = _b[0], map = _b[1];
                    _loop_1(index, map);
                }
            });
        });
    };
    DictionaryManager.prototype.prepareDictTable = function () {
        var _this = this;
        var db = database_1.DatabaseFactory.getDb();
        var resource = universal_1.Constant.dictTableName;
        return new Promise(function (resolve, reject) {
            db.parallelize(function () {
                db.run("CREATE TABLE IF NOT EXISTS " + resource + " (\n                        DICT_ID INTEGER PRIMARY KEY,\n                        DICT_FILE TEXT,\n                        RESOURCE TEXT\n                        )", function (err) {
                    if (err != null) {
                        _this.logger.info("Error occurred while creating table " + resource);
                        reject(err);
                    }
                    else {
                        _this.logger.info("Created table " + resource + " successfully");
                        resolve();
                    }
                });
            });
        });
    };
    return DictionaryManager;
}());
exports.DictionaryManager = DictionaryManager;
