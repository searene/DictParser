import { AccentConverter } from './AccentConverter';
import { Log } from './util/log';
import { WordTree } from './Tree';
import { Meta, IndexMap } from "./DictionaryFinder";
/**
 * Created by searene on 17-1-23.
 */

let logger = Log.getLogger();

export abstract class Dictionary {

    // e.g. dsl, main definition file
    protected abstract _dictionarySuffixes: string[];

    // e.g. zip, dz, containing all the resources such as images/audios
    protected _resourceHolderSuffixes: string[] = ['.zip'];

    // e.g. jpg, wmv, which are the actual resource files
    protected _resourceFileSuffixes: string[] = ['.jpg', '.wmv', '.bmp', '.mp3'];

    // get meta data and index
    async abstract getDictionaryStats(dictFile: string): Promise<DictionaryStats>;

    // get the definition of the word, represented by a WordTree
    async abstract getWordTree(dictFile: string, pos: number, len: number): Promise<WordTree>;

    async abstract getHTML(dictFile: string, pos: number, len: number): Promise<WordTreeHTML>;

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

export interface WordPosition {
    pos: number;
    len: number;
}

export interface DictionaryStats {
    meta: Meta;
    indexMap: IndexMap;
}

export interface WordTreeHTML {
    entry: string;
    definition: string;
}