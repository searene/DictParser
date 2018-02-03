import {ResourceManager} from './ResourceManager';
import { DSLDictionary } from './dictionaries/dsl/DSLDictionary';
import { DictionaryStats } from './Dictionary';
import { DB_PATH, ROOT_PATH, WORD_FORMS_PATH } from './Constant';
import { Log } from './util/log';
import { Dictionary, WordPosition } from "./Dictionary";
import { readdirRecursivelyWithStat, FileWithStats } from "./util/FileUtil";
import { Option, option, some, none } from 'ts-option';
import * as fse from "fs-extra";
import * as path from "path";
import * as log4js from 'log4js';
import * as ReadLine from "readline";
import { EventEmitter } from "events";

/**
 * Created by searene on 17-1-23.
 */

let logger = Log.getLogger();

export class DictionaryFinder extends EventEmitter {

    constructor() {
        super();

        // emit dictionary name being scanned
        for(let [dictName, dictionary] of Array.from(DictionaryFinder._dictionaries.entries())) {
            dictionary.dictionaryScanProgressReporter.on('name', (dictionaryName: string) => {
                this.emit('name', dictionaryName);
            });
        }
    }

    private logger = Log.getLogger();

    private static _dictionaries: Map<string, Dictionary> = new Map<string, Dictionary>();

    private _dictMapList: DictMap[];

    static register(dictName: string, Dictionary: new () => Dictionary): void {
        let dictionary = new Dictionary();
        this._dictionaries.set(dictName, new Dictionary());
    }

    /** Walk through all files in <i>dir</i> recursively, and look for
     * dictionary definition files(e.g. dz, dsl), add it along with
     * its {@code Dictionary} and resource to the result array.
     */
    async scan(dirs: string | string[],
               dbPath: string,
               wordFormsFolder: string): Promise<DictMap[]> {

        // DictMap without resource
        let dictMapList: DictMap[] = [];
        let files: FileWithStats[] = [];
        for(const dir of Array.isArray(dirs) ? dirs : [dirs]) {
          files = files.concat(await readdirRecursivelyWithStat(dir));
        }
        for(let file of files) {
            if(file.stat.isDirectory()) continue;

            let ext = path.extname(file.filePath);
            for(let [dictName, dictionary] of Array.from(DictionaryFinder._dictionaries.entries())) {

                // we find a dictionary
                if(dictionary.dictionarySuffixes.indexOf(ext) > -1) {

                    // get resource
                    let resource: Option<string> = await this.getResource(
                        file.filePath,
                        files.map(file => file.filePath),
                        dictionary.resourceHolderSuffixes,
                        dictionary.resourceFileSuffixes
                    );

                    // build index
                    let dictStats: DictionaryStats = await dictionary.getDictionaryStats(file.filePath);

                    // add it to dictMapList
                    dictMapList.push({
                        dict: {
                            dictPath: file.filePath,
                            dictType: dictName,
                            resource: resource.isEmpty ? "" : resource.get,
                        },
                        meta: dictStats.meta,
                        originalWords: dictStats.indexMap,
                        transformedWords: {}
                    });
                }
            }
        }

        // add word transformations
        await this.addTransformedWords(dictMapList, wordFormsFolder);

        // save to db
        await fse.writeFile(dbPath, JSON.stringify(dictMapList), {encoding: 'utf8'});

        this._dictMapList = dictMapList;
        return dictMapList;
    }

    private async addTransformedWords(dictMapList: DictMap[], wordFormsFolder: string): Promise<void> {
        // word forms
        let wordFormsFiles = await fse.readdir(wordFormsFolder);
        for(let i = 0; i < wordFormsFiles.length; i++) {
            let wordFormsFile = path.join(wordFormsFolder, wordFormsFiles[i]);
            if(!await fse.pathExists(wordFormsFile)) {
                console.log(`${wordFormsFile} doesn't exist, skip`);
                continue;
            }
            let lineReader = ReadLine.createInterface({
                input: fse.createReadStream(wordFormsFile)
            });
            lineReader.on('line', line => {
                let words: string[] = line.split(/[\s,:]+/);

                let originalWord = words[0];
                let transformedWords = words.slice(1);

                for(let transformedWord of transformedWords) {
                    // check each dictionary
                    for(let dictMap of dictMapList) {
                        if(dictMap.originalWords.hasOwnProperty(originalWord) && !dictMap.transformedWords.hasOwnProperty(transformedWord)) {
                            dictMap.transformedWords[transformedWord] = dictMap.originalWords[originalWord];                        }
                    }
                }
            });
            return new Promise<void>((resolve, reject) => {
                lineReader.on('close', () => {
                    resolve();
                });
            });
        }
    }

    static get dictionaries(): Map<string, Dictionary> {
        return DictionaryFinder._dictionaries;
    }

    /** <p>Look for resource file/directory in <i>baseDirectory</i>, the rules are as follows.</p>
     * 1. If we find a file whose extension is in <i>resourceHolderSuffixes</i>
     *    and its basename(filename without extension) is the same as
     *    <i>dictFileName</i>'s basename, this is exactly the resource
     *    we need, return it.
     * 2. If we cannot find such a file mentioned above, try to find the first file
     *    whose extension is in <i>resourceHolderSuffixes</i>, return it.
     * 3. If we still cannot find it, try to find a subfolder in <i>baseDirectory</i>
     *    containing at least one file with the extension in <i>resourceFileSuffixes</i>
     *    return the directory
     *
     * @param dictFilePath absolute path to the dictionary file
     * @param baseDirectory the directory where the dictionary definition file
     *        (such as .dsl) lies
     * @param resourceHolderSuffixes extensions of the archived resource file(e.g. zip)
     * @param resourceFileSuffixes resource extensions(e.g. wmv)
     * @returns path to the resource archive/directory represented in string
     */
    private async getResource(dictFilePath: string,
                              resourceFiles: string[],
                              resourceHolderSuffixes: string[],
                              resourceFileSuffixes: string[]): Promise<Option<string>> {

        let candidates: {file: string, priority: number}[] = [];

        let dictFileBaseName: string = path.basename(dictFilePath).split(".")[0];
        let baseDir: string = path.dirname(dictFilePath);

        for(let resourceFile of resourceFiles) {
            if(resourceFile == dictFilePath) continue;

            let isDir: boolean = (await fse.stat(resourceFile)).isDirectory();
            let isSameDir: boolean = path.dirname(dictFilePath) == path.dirname(resourceFile);
            let isSameBaseName: boolean = path.basename(resourceFile).split(".")[0] == dictFileBaseName;
            let isResourceHolder: boolean = !isDir && resourceHolderSuffixes.indexOf(path.extname(resourceFile)) > -1;
            let isResourceFile: boolean = await (async (): Promise<boolean> => {
                if(!isDir) return false;
                let files: string[] = await fse.readdir(resourceFile);
                for(let file of files) {
                    if(resourceFileSuffixes.indexOf(path.extname(file)) > -1) return true;
                }
                return false;
            })();

            if(isSameDir && isSameBaseName && isResourceHolder) {
                candidates.push({file: resourceFile, priority: 1});
                break;
            } else if(isSameDir && isResourceHolder) {
                candidates.push({file: resourceFile, priority: 2});
            } else if(isSameDir && isResourceFile) {
                candidates.push({file: resourceFile, priority: 3});
            }
        }
        candidates.sort((a, b) => {
            return a.priority - b.priority;
        });
        return candidates.length == 0 ? none : option(candidates[0].file);
    }

}

DictionaryFinder.register('dsl', DSLDictionary);

export interface IDictionary {
    // absolute path to main dictionary file
    dictPath: string;

    // e.g. dsl
    dictType: string;

    // path to resource file
    resource: string;
}

export interface DictMap {

    // basic dictionary information
    dict: IDictionary

    // meta data
    meta: Meta;

    // pos of words in the dictionary
    originalWords: IndexMap;

    // pos of transformed words in the dictionary
    transformedWords: IndexMap;
}

export interface IndexMap {
    [word: string]: WordPosition;
}

export interface Meta {
    [metaKey: string]: string;
}

export interface WordForms {
    [word: string]: WordPosition;
}
