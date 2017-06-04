import { DEFAULT_DB_PATH, ROOT_PATH } from './constant';
import { Log } from './util/log';
import { Dictionary, Index } from "./Dictionary";
import { readdirRecursivelyWithStat } from "./util/os";
import { Option, option, some, none } from 'ts-option';
import * as fsp from "fs-promise";
import * as path from "path";
import * as log4js from 'log4js';

/**
 * Created by searene on 17-1-23.
 */

let logger = Log.getLogger();

export class DictionaryFinder {

    private logger = Log.getLogger();

    private _dictionaries: Dictionary[] = [];

    private _dictMapList: DictMap[];

    addDictionary(dictionary: Dictionary): void {
        this._dictionaries.push(dictionary);
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

            let isDir: boolean = (await fsp.stat(resourceFile)).isDirectory();
            let isSameDir: boolean = path.dirname(dictFilePath) == path.dirname(resourceFile);
            let isSameBaseName: boolean = path.basename(resourceFile).split(".")[0] == dictFileBaseName;
            let isResourceHolder: boolean = !isDir && resourceHolderSuffixes.indexOf(path.extname(resourceFile)) > -1;
            let isResourceFile: boolean = await (async (): Promise<boolean> => {
                if(!isDir) return false;
                let files: string[] = await fsp.readdir(resourceFile);
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

    /** Walk through all files in <i>dir</i> recursively, and look for
     * dictionary definition files(e.g. dz, dsl), add it along with
     * its {@code Dictionary} and resource to the result array.
     */
    async scan(dir: string,
               dictionaries: Dictionary[] = this._dictionaries,
               dbPath: string = DEFAULT_DB_PATH): Promise<DictMap[]> {

        // DictMap without resource
        let dictMapList: DictMap[] = [];
        let files = await readdirRecursivelyWithStat(dir);
        for(let file of files) {
            if(file.stat.isDirectory()) continue;

            let ext = path.extname(file.filePath);
            for(let dict of dictionaries) {

                if(dict.dictionarySuffixes.indexOf(ext) > -1) {

                    // get resource
                    let resource: Option<string> = await this.getResource(
                        file.filePath, 
                        files.map(file => file.filePath),
                        dict.resourceHolderSuffixes,
                        dict.resourceFileSuffixes
                    );

                    // build index
                    let indexList: Index[] = await dict.buildIndex(file.filePath);

                    // add it to dictMapList
                    dictMapList.push(<DictMap> {
                        dictPath: file.filePath,
                        dictName: dict.dictName,
                        resource: resource.isEmpty ? "" : resource.get,
                        indexList: indexList
                    });
                }
            }
        }

        // save to db
        await fsp.writeFile(dbPath, JSON.stringify(dictMapList), {encoding: 'utf8'});

        this._dictMapList = dictMapList;
        return dictMapList;
    }
}

export interface DictMap {

    // absolute path to the main dictionary file
    dictPath: string;
    dictName: string;
    resource: string;
    indexList: Index[];
}