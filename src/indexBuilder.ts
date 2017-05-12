import {Constant} from "./universal";
import {DatabaseManager} from './database';
/**
 * Created by searene on 17-1-31.
 */

export abstract class IndexBuilder {

    protected databaseManager = new DatabaseManager();

    protected dictFile: string = "";
    protected dictId: number = 0;

    // absolute path to db file
    protected dbFile: string = "";

    /** Build index and write it into database */
    abstract buildIndex(): Promise<void>;

    public constructor(dictFile: string) {
        this.dictFile = dictFile;
    }

    public init(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.getDictIdFromFileName(this.dictFile)
                .then((dictId) => {
                    this.dictId = dictId;
                    return this.prepareIndexTable();
                })
                .then(() => {
                    return this.buildIndex();
                })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    public getDictIdFromFileName(dictFile: string): Promise<number> {
        let dictTable = Constant.dictTableName;
        let dictId;
        let db = this.databaseManager.getDb();
        return new Promise<number>((resolve, reject) => {
            db.serialize(() => {
                db.all(`SELECT DICT_ID AS id ${dictTable} WHERE DICT_FILE = ${dictFile}`, (err, rows) => {
                    if(rows.length > 0) {
                        reject(new Error(`Couldn't find the dict_id of table ${dictTable}}`));
                    } else {
                        resolve(rows[0].id);
                    }
                });
            });
        });
    }

    public prepareIndexTable(): Promise<void> {
        let db = this.databaseManager.getDb();

        let wordIndex = Constant.indexTableName;

        return new Promise<void>((resolve, reject) => {
            db.serialize(() => {
                db.run(`CREATE TABLE IF NOT EXISTS ${wordIndex} (
                    DICT_ID INTEGER,
                    WORD TEXT,
                    LINE INTEGER
                    )`, (err) => {
                        if(err) {
                            reject(err);
                        } else {
                            resolve();
                        }
                });
            });
        })
    }
}

declare module WordIndexIterator {
    export interface DictIndex {
        word: string;
        lineNumber: number;
    }
}
