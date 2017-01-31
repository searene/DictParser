import fs = require("fs");
import readline = require("readline");
import {ReadLine} from "readline";
import {Constant} from "./universal";
import sqlite3 = require('sqlite3');
import {WordIndexIterator} from "./wordIndexIterator";
import DictIndex = WordIndexIterator.DictIndex;
/**
 * Created by searene on 17-1-29.
 */

class DSLIndexIterator extends WordIndexIterator {

    private _lineReader: ReadLine;

    // path to the db file
    private _sqlFile: string;

    private buildIndex(): WordIndexIterator {

        /** For dsl files, there are some meta data at the beginning
         * of the dsl file, we are not interested in the meta part,
         * the variable is used to denote whether we have passed through
         * the meta part and reached the definition part.
         */
        let hasReachedDefinitionOrNot: boolean = false;

        let currentLineNumber: number = 0;

        let lineReader = readline.createInterface({
            input: fs.createReadStream(Constant.pathToDbFile)
        });
        lineReader.on('line', line => {
            currentLineNumber++;
            if(line.trim().length > 0 && !line.startsWith('#')) {
                // the beginning of the definition section
                lineReader.removeAllListeners();
                lineReader.on('line', line => {
                    if(!line.startsWith(' ') && !line.startsWith('\t')) {
                        // entry word
                        this.addIndexToDatabase(line.trim(), currentLineNumber);
                    }
                });
            }
        });
    }


    private addIndexToDatabase(word: string, lineNumber: number): void {
        this.prepareIndexTable();
    }

    public next(): DictIndex {
    }
}

