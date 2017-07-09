import { EventEmitter } from 'events';
import { SRC_RESOURCE_PATH } from './Constant';
import { Log } from './util/log';
import { WordTree, Node } from './Tree';
import { Meta, IndexMap } from "./DictionaryFinder";
import * as fsp from 'fs-promise';
import * as path from "path";
/**
 * Created by searene on 17-1-23.
 */

let logger = Log.getLogger();

export abstract class Dictionary {

    protected _dictionaryScanProgressReporter: EventEmitter = new EventEmitter();

    // e.g. dsl, main definition file
    protected abstract _dictionarySuffixes: string[];

    // e.g. zip, dz, containing all the resources such as images/audios
    protected _resourceHolderSuffixes: string[] = ['.zip'];

    // e.g. jpg, wmv, which are the actual resource files
    protected _resourceFileSuffixes: string[] = ['.jpg', '.wmv', '.bmp', '.mp3'];

    // path to dictionary specific css file
    protected _dictCSSFilePath: string = path.join(SRC_RESOURCE_PATH, 'style.css');

    // path to universal css file
    protected _mainCSSFilePath: string = path.join(SRC_RESOURCE_PATH, 'style.css');

    // get meta data and index
    async abstract getDictionaryStats(dictFile: string): Promise<DictionaryStats>;

    // get the definition of the word, represented by a WordTree
    async abstract getWordTree(dictFile: string, pos: number, len: number): Promise<WordTree>;

    async abstract getWordTreeHTML(dictFile: string, pos: number, len: number): Promise<WordTreeHTML>;

    async getHTML(dictName: string = "Unknown", dictFile: string, pos: number, len: number): Promise<string> {
        let wordTreeHTML: WordTreeHTML = await this.getWordTreeHTML(dictFile, pos, len);
        return `<html><head></head><body><style>${this.getCSS()}</style><div class="container><div class="dict_title">${dictName}</div><div class="dp_entry">${wordTreeHTML.entry}</div><div class="dp_definition">${wordTreeHTML.definition}</div></div></body></html>`;
    }

    async getCSS(): Promise<string> {
        let mainCSS: string = await fsp.readFile(this._mainCSSFilePath, {encoding: 'utf8'});
        let dictCSS: string = await fsp.readFile(this._dictCSSFilePath, {encoding: 'utf8'});
        return mainCSS + dictCSS;
    }

    get dictionarySuffixes(): string[] {
        return this._dictionarySuffixes;
    }
    get resourceHolderSuffixes(): string[] {
        return this._resourceHolderSuffixes;
    }
    get resourceFileSuffixes(): string[] {
        return this._resourceFileSuffixes;
    }
    get dictionaryScanProgressReporter(): EventEmitter {
        return this._dictionaryScanProgressReporter;
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
