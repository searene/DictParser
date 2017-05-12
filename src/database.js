"use strict";
var sqlite3 = require("sqlite3");
var DatabaseFactory = (function () {
    function DatabaseFactory() {
    }
    DatabaseFactory.initDatabase = function (dbFile) {
        this.db = new sqlite3.Database(dbFile);
    };
    DatabaseFactory.getDb = function () {
        if (this.db == null) {
            throw new Error("Database is not initialized yet.");
        }
        else {
            return this.db;
        }
    };
    DatabaseFactory.close = function () {
        if (this.db == null) {
            throw new Error("Database is not initialized yet.");
        }
        else {
            this.db.close();
        }
    };
    return DatabaseFactory;
}());
exports.DatabaseFactory = DatabaseFactory;
