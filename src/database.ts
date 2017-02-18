import sqlite3 = require('sqlite3');

export class DatabaseFactory {

    private static db;
    
    public static init(dbFile: string): void {
        this.db = new sqlite3.Database(dbFile);
    }

    public static getDb(): sqlite3.Database {
        if(this.db == null) {
            throw new Error("Database is not initialized yet.");
        } else {
            return this.db;
        }
    }

    public static close(): void {
        if(this.db == null) {
            throw new Error("Database is not initialized yet.");
        } else {
            this.db.close();
        }
    }
}