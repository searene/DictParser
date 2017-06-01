import { Log } from './util/log';
import { DEFAULT_DB_PATH } from './constant';
import { WordTree } from './Tree';
import {DictionaryFinder} from "./DictionaryFinder";
import * as fsp from "fs-promise";
/**
 * Created by searene on 17-1-23.
 */

let logger = Log.getLogger();

export abstract class Dictionary {

    protected abstract _dictionaryName: string;

    // e.g. dsl, main definition file
    protected abstract _dictionarySuffixes: string[];

    // e.g. zip, dz, containing all the resources such as images/audios
    protected _resourceHolderSuffixes: string[] = ['zip'];

    // e.g. jpg, wmv, which are the actual resource files
    protected _resourceFileSuffixes: string[] = ['jpg', 'wmv', 'bmp', 'mp3'];

    /** 
     * Build the index of the given dictionary file, return it as an array
     * @param dictFile path to dictionary
     */
    async abstract buildIndex(dictFile: string): Promise<Index[]>;

    async saveIndex(index: Index[], dbFile = DEFAULT_DB_PATH): Promise<void> {
        let dbContents: string = await fsp.readFile(dbFile, {encoding: "utf-8"});
        let dbJson: any = JSON.parse(dbContents);
        dbJson['index'] = dbJson.hasOwnProperty('index') ? dbJson['index'] : {};
        dbJson['index'][this._dictionaryName] = index;
        await fsp.writeFile(dbFile, dbJson, {encoding: 'utf8'});
    }

    async loadIndex(dbFile = DEFAULT_DB_PATH): Promise<Index[]> {
        let dbContents: string = await fsp.readFile(dbFile, {encoding: "utf-8"});
        let dbJson: any = JSON.parse(dbContents);
        dbJson['index'] = dbJson.hasOwnProperty('index') ? dbJson['index'] : {};
        let index = dbJson['index'][this._dictionaryName];
        if(index == undefined) {
            logger.info("Index hasn't been built yet, building it now...");
            index = await this.buildIndex(dbFile);
            this.saveIndex(index);
        }
        return index;
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
}

export interface Index {
    word: string,
    line: number;
}