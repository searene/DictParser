"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var constant_1 = require("./constant");
var database_1 = require("./database");
/**
 * Created by searene on 17-1-31.
 */
var IndexBuilder = (function () {
    function IndexBuilder(dictFile) {
        this.databaseManager = new database_1.DatabaseManager();
        this.dictFile = "";
        this.dictId = 0;
        // absolute path to db file
        this.dbFile = "";
        this.dictFile = dictFile;
    }
    IndexBuilder.prototype.init = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.getDictIdFromFileName(_this.dictFile)
                .then(function (dictId) {
                _this.dictId = dictId;
                return _this.prepareIndexTable();
            })
                .then(function () {
                return _this.buildIndex();
            })
                .then(function () {
                resolve();
            })
                .catch(function (err) {
                reject(err);
            });
        });
    };
    IndexBuilder.prototype.getDictIdFromFileName = function (dictFile) {
        var dictTable = constant_1.Constant.dictTableName;
        var dictId;
        var db = this.databaseManager.getDb();
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.all("SELECT DICT_ID AS id " + dictTable + " WHERE DICT_FILE = " + dictFile, function (err, rows) {
                    if (rows.length > 0) {
                        reject(new Error("Couldn't find the dict_id of table " + dictTable + "}"));
                    }
                    else {
                        resolve(rows[0].id);
                    }
                });
            });
        });
    };
    IndexBuilder.prototype.prepareIndexTable = function () {
        var db = this.databaseManager.getDb();
        var wordIndex = constant_1.Constant.indexTableName;
        return new Promise(function (resolve, reject) {
            db.serialize(function () {
                db.run("CREATE TABLE IF NOT EXISTS " + wordIndex + " (\n                    DICT_ID INTEGER,\n                    WORD TEXT,\n                    LINE INTEGER\n                    )", function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    };
    return IndexBuilder;
}());
exports.IndexBuilder = IndexBuilder;
