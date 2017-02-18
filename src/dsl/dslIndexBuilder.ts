import fsp = require("fs-promise");
import readline = require("readline");
import {Constant} from "../universal";
import sqlite3 = require('sqlite3');
import {IndexBuilder} from "../indexBuilder";
import {DatabaseFactory} from '../database';
/**
 * Created by searene on 17-1-29.
 */

export class DSLIndexBuilder extends IndexBuilder {

    // path to the db file
    private _sqlFile: string;

    /** For dsl files, there are some meta data at the beginning
     * of the dsl file, we are not interested in the meta part,
     * the variable is used to denote whether we have passed through
     * the meta part and reached the definition part.
     */
    private hasReachedDefinitionSection: boolean;

    // a list of [word, pos]
    private indexArray:[string, number][];

    /** Check if the given line is the beginning of a word definition,
     * if so, add the index to this.indexArray.
     */
    private storeIndexInMemory(line: string, startPosOfLine: number) {
        if(this.hasReachedDefinitionSection && line.match('^[^\s].*$)')) {
            this.indexArray.push([line.trim(), startPosOfLine]);
        } else if(!this.hasReachedDefinitionSection && line.match('^[^#\s].*$')) {
            this.hasReachedDefinitionSection = true;
            this.indexArray.push([line.trim(), startPosOfLine]);
        }
    }

    public buildIndex(): Promise<void> {
        let pos = 0;
        let remaining = '';
        let inputStream = fsp.createReadStream(this.dictFile);
        return new Promise<void>((resolve, reject) => {
            inputStream.on('data', (data) => {
                remaining += data;
                let index = remaining.indexOf('\n');
                while(index > -1) {
                    let line = remaining.substring(0, index + 1);
                    remaining = remaining.substring(index + 1);
                    this.storeIndexInMemory(line, pos);
                    pos += index + 1;
                }
            });
            inputStream.on('end', () => {
                if(remaining.length > 0) {
                    this.storeIndexInMemory(remaining, pos);
                }
                // persist indexes to db
                this.addIndexToDb(this.dictId, this.dictFile, this.indexArray);
                resolve();
            });
        })
    }

    private addIndexToDb(dictId: number, dbFile: string, indexArray: [string, number][]) {
        let db = DatabaseFactory.getDb();
        db.parallelize(() => {
            for(let index of indexArray) {
                db.run(`INSERT INTO ${Constant.indexTableName}
                        (DICT_ID, WORD, LINE)
                        VALUES (${dictId}, ${index[0]}, ${index[1]})`);
            }
        });
    }
}

