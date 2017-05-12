"use strict";
var sqlite3 = require("sqlite3");
var fsp = require("fs-promise");
var DatabaseFactory = (function () {
    function DatabaseFactory() {
    }
    DatabaseFactory.init = function (dbFile) {
        // if database already exists, we remove and rebuild it.
        fsp.exists(dbFile)
            .then(function (exist) {
            return fsp.remove;
        });
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
