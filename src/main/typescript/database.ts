import * as sqlite3 from 'sqlite3';
import * as fsp from 'fs-promise';
import {Constant} from "./constant";
import {Log} from "./util/log";

export class DatabaseManager {

    private static logger = Log.getLogger();

    private static db: sqlite3.Database;

    constructor(dbFile: string = Constant.defaultDbPath) {
        this.initDatabase(dbFile);
    }

    private initDatabase(dbFile: string): void {
        if(DatabaseManager.db == null) {
            DatabaseManager.db = new sqlite3.Database(dbFile);
        }
    }

    public getDb(): sqlite3.Database {
        if(DatabaseManager.db == null) {
            throw new Error("Database is not initialized yet.");
        } else {
            return DatabaseManager.db;
        }
    }

    public createDictTableIfNotExists(): Promise<void> {
        let db = this.getDb();
        let resource = Constant.dictTableName;
        return new Promise<void>((resolve, reject) => {
            db.parallelize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS ${resource} (
                        DICT_ID INTEGER PRIMARY KEY,
                        DICT_FILE TEXT,
                        RESOURCE TEXT
                        )`, (err) => {
                    if(err != null) {
                        DatabaseManager.logger.info(`Error occurred while creating table ${resource}`);
                        reject(err);
                    } else {
                        DatabaseManager.logger.info(`Created table ${resource} successfully`);
                        resolve();
                    }
                });
            });
        });
    }

    public close(): void {
        if(DatabaseManager.db == null) {
            throw new Error("Database is not initialized yet.");
        } else {
            DatabaseManager.db.close();
        }
    }
}