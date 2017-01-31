import {Constant} from "./universal";
import sqlite3 = require('sqlite3');
/**
 * Created by searene on 17-1-31.
 */

export abstract class WordIndexIterator {
    abstract hasNext(): boolean;
    abstract next(): WordIndexIterator.DictIndex;

    public prepareIndexTable(): void {
        let db = new sqlite3.Database(Constant.pathToDbFile);

        let wordIndex = Constant.indexTableName;

        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS ${wordIndex} (
                      DICT_ID INTEGER,
                      WORD TEXT,
                      LINE INTEGER
                      )`);
        });
        db.close();
    }
}

declare module WordIndexIterator {
    export interface DictIndex {
        word: string;
        lineNumber: number;
    }
}
