"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var database_1 = require("./../src/database");
var os_1 = require("./../src/util/os");
var constant_1 = require("../../main/typescript/constant");
var dictionary_1 = require("./../src/dictionary");
var assert = require("assert");
var path = require("path");
describe('Test private methods in DictionaryManager', function () {
    var pathToDb;
    var dictionaryManager;
    var db;
    var dictTable;
    var databaseManager;
    beforeEach(function () {
        // prepare database
        pathToDb = path.join(constant_1.Constant.rootPathOfModule, 'resources/test.db');
        os_1.FSHelper.removeFileIfExists(pathToDb);
        databaseManager = new database_1.DatabaseManager(pathToDb);
        db = databaseManager.getDb();
        dictionaryManager = new dictionary_1.DictionaryManager();
        dictTable = constant_1.Constant.dictTableName;
    });
    afterEach(function () {
        // clean test files
        os_1.FSHelper.removeFileIfExists(pathToDb);
    });
    it('Test insertDictInfoIntoDb with single insertion', function () {
        var dictMap = [];
        dictMap.push({
            dict: 'dict1',
            resource: 'resource1'
        });
        return databaseManager.createDictTableIfNotExists()
            .then(function () {
            dictionaryManager.insertDictInfoIntoDb(dictMap)
                .then(function () {
                return new Promise(function (resolve, reject) {
                    db.serialize(function () {
                        db.run("SELECT DICT_ID as dictID,\n                                   DICT_FILE as dictFile,\n                                   RESOURCE as resource\n                                   FROM " + dictTable, function (err, rows) {
                            assert.equal(rows.length, 1);
                            assert.equal(rows[0].dictID, 1);
                            assert.equal(rows[0].dictFile, 'dict1');
                            assert.equal(rows[0].resource, 'resource1');
                        });
                    });
                });
            });
        });
    });
});
describe('test unknown functions', function () {
    it('sqlite3', function () {
        var databaseManager = new database_1.DatabaseManager('test.db');
        var db = databaseManager.getDb();
        console.log("creating table");
        return databaseManager.createDictTableIfNotExists()
            .then(function () {
            console.log('creating table is completed');
            return new Promise(function (resolve, reject) {
                db.serialize(function () {
                    db.run("INSERT OR REPLACE INTO " + constant_1.Constant.dictTableName + "\n                            (DICT_ID, DICT_FILE, RESOURCE)\n                            VALUES (2, 'name', 'resource')", function (err) {
                        if (err != null) {
                            reject(err);
                        }
                    });
                    db.run("INSERT OR REPLACE INTO " + constant_1.Constant.dictTableName + "\n                            (DICT_ID, DICT_FILE, RESOURCE)\n                            VALUES (2, 'name1', 'resource1')", function (err) {
                        if (err != null) {
                            reject(err);
                        }
                    }, function (err) {
                        if (err != null) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            });
        })
            .then(function () {
            return new Promise(function (resolve, reject) {
                db.close(function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(err);
                    }
                });
            });
        })
            .catch(function (err) {
            throw err;
        });
    });
});
