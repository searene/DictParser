import { EventEmitter } from 'events';
import { SRC_RESOURCE_PATH } from './Constant';
import { Log } from './util/log';
import { WordTree, Node } from './Tree';
import { Meta, IndexMap } from "./DictionaryFinder";
import * as fse from 'fs-extra';
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

    // get meta data and index
    async abstract getDictionaryStats(dictFile: string): Promise<DictionaryStats>;

    // get the definition of the word, represented by a WordTree
    async abstract getWordTree(dictFile: string, pos: number, len: number): Promise<WordTree>;

    async abstract getWordTreeHTML(dictFile: string, pos: number, len: number): Promise<WordTreeHTML>;

    async getHTML(dictName: string = "Unknown", dictFile: string, pos: number, len: number): Promise<string> {
        let wordTreeHTML: WordTreeHTML = await this.getWordTreeHTML(dictFile, pos, len);
        return `<div class="container><div class="dict_title">${dictName}</div><div class="dp_entry">${wordTreeHTML.entry}</div><div class="dp_definition">${wordTreeHTML.definition}</div></div>`;
    }

    // get resource contents
    async getResource(resourceHolder: string, resourceName: string): Promise<Buffer> {
        let isResourceHolderExists = await fse.pathExists(resourceHolder);
        if(!isResourceHolderExists) {
            throw new Error(`Resource Holder ${resourceHolder} doesn't exist`);
        }
        let resourceHolderStats: fse.Stats = await fse.stat(resourceHolder);
        if(resourceHolderStats.isDirectory()) {
            let fullResourceFilePath = path.join(resourceHolder, resourceName);
            if(!(await fse.pathExists(fullResourceFilePath))) {
                throw new Error(`Resource file ${fullResourceFilePath} doesn't exist`);
            }
            return fse.readFile(fullResourceFilePath);
        } else if(resourceHolderStats.isFile()) {
            let ext = path.extname(resourceHolder);
            if(ext == '.zip') {
                throw new Error(`zip resource is not supported yet`);
            }
        }
        throw new Error(`resource is not supported: ${resourceHolder}`);
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
