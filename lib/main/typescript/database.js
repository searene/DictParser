"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite3 = require("sqlite3");
var constant_1 = require("./constant");
var log_1 = require("./util/log");
var DatabaseManager = (function () {
    function DatabaseManager(dbFile) {
        if (dbFile === void 0) { dbFile = constant_1.Constant.defaultDbPath; }
        this.initDatabase(dbFile);
    }
    DatabaseManager.prototype.initDatabase = function (dbFile) {
        if (DatabaseManager.db == null) {
            DatabaseManager.db = new sqlite3.Database(dbFile);
        }
    };
    DatabaseManager.prototype.getDb = function () {
        if (DatabaseManager.db == null) {
            throw new Error("Database is not initialized yet.");
        }
        else {
            return DatabaseManager.db;
        }
    };
    DatabaseManager.prototype.createDictTableIfNotExists = function () {
        var db = this.getDb();
        var resource = constant_1.Constant.dictTableName;
        return new Promise(function (resolve, reject) {
            db.parallelize(function () {
                db.run("CREATE TABLE IF NOT EXISTS " + resource + " (\n                        DICT_ID INTEGER PRIMARY KEY,\n                        DICT_FILE TEXT,\n                        RESOURCE TEXT\n                        )", function (err) {
                    if (err != null) {
                        DatabaseManager.logger.info("Error occurred while creating table " + resource);
                        reject(err);
                    }
                    else {
                        DatabaseManager.logger.info("Created table " + resource + " successfully");
                        resolve();
                    }
                });
            });
        });
    };
    DatabaseManager.prototype.close = function () {
        if (DatabaseManager.db == null) {
            throw new Error("Database is not initialized yet.");
        }
        else {
            DatabaseManager.db.close();
        }
    };
    return DatabaseManager;
}());
DatabaseManager.logger = log_1.Log.getLogger();
exports.DatabaseManager = DatabaseManager;
//# sourceMappingURL=database.js.map