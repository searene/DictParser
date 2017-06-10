import { Log } from './util/log';
import { DEFAULT_DB_PATH } from './constant';
import { WordTree } from './Tree';
import { DictionaryFinder, DictMap } from "./DictionaryFinder";
import * as fsp from "fs-promise";
/**
 * Created by searene on 17-1-23.
 */

let logger = Log.getLogger();

export abstract class Dictionary {

    protected abstract _dictName: string;

    // e.g. dsl, main definition file
    protected abstract _dictionarySuffixes: string[];

    // e.g. zip, dz, containing all the resources such as images/audios
    protected _resourceHolderSuffixes: string[] = ['.zip'];

    // e.g. jpg, wmv, which are the actual resource files
    protected _resourceFileSuffixes: string[] = ['.jpg', '.wmv', '.bmp', '.mp3'];

    /** 
     * Build the index of the given dictionary file, return it as an array
     * @param dictFile path to dictionary
     */
    async abstract buildIndex(dictFile: string): Promise<Index[]>;

    async loadIndex(dictPath: string, dbFile = DEFAULT_DB_PATH): Promise<Index[]> {
        let dbContents: string = await fsp.readFile(dbFile, {encoding: "utf-8"});
        let dbJson: DictMap[] = JSON.parse(dbContents);
        let indexList: Index[] = [];
        for(let dict of dbJson) {
            if(dict.dictPath != dictPath) {
                continue;
            }
            indexList = dict.indexList;
        }
        if(indexList == undefined || indexList == null || indexList == []) {
            throw new Error("Cannot find any index for " + dictPath);
        }
        return indexList;
    }

    abstract parse(contents: string): WordTree;

    get dictionarySuffixes(): string[] {
        return this._dictionarySuffixes;
    }
    get resourceHolderSuffixes(): string[] {
        return this._resourceHolderSuffixes;
    }
    get resourceFileSuffixes(): string[] {
        return this._resourceFileSuffixes;
    }
    get dictName(): string {
        return this._dictName;
    }
}

export interface Index {
    word: string,
    pos: number;
}