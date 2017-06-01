import { DEFAULT_DB_PATH, ROOT_PATH } from './constant';
import { Log } from './util/log';
import { Dictionary, Index } from "./Dictionary";
import { Walk } from "./util/os";
import * as fsp from "fs-promise";
import * as path from "path";
import * as log4js from 'log4js';

/**
 * Created by searene on 17-1-23.
 */

export class DictionaryFinder {

    private logger = Log.getLogger();

    private _dictionaries: Dictionary[];

    private dictMap: DictMap[];

    public addDictionary(dictionary: Dictionary): void {
        this._dictionaries.push(dictionary);
    }

    /** Classify files to directories and normal files non-recursively.
     * 
     * @param baseDirectory baseDirectory of all the files in the parameter <i>files</i>
     * @param files an array of files with relative paths to be classified
     * @returns a Promise, whose type is a tuple, where the first item
     *          is the array of directories, the second item is the array of normal files
     */
    private classifyFilesNonRecursively(baseDirectory: string, files: string[]): Promise<[string[], string[]]> {
        let len = files.length;
        let dirs: string[] = [];
        let normalFiles: string[] = [];
        return new Promise<[string[], string[]]>((resolve, reject) => {
            files.forEach((file, index) => {
                let fullPath = path.join(baseDirectory, file);
                fsp.stat(fullPath)
                    .then((stat) => {
                        if(stat.isDirectory) {
                            dirs.push(fullPath);
                        } else if(stat.isFile) {
                            normalFiles.push(fullPath);
                        }
                        if(index == len - 1) {
                            // we have processed all files, resolve now
                            resolve([dirs, normalFiles]);
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        });
    }

    /** <p>Look for resource file/directory in <i>baseDirectory</i>, the rules are as follows.</p>
     * 1. If we find a file whose extension is in <i>resourceHolderSuffixes</i>
     *    and its basename(filename without extension) is the same as
     *    <i>definitionFileName</i>'s basename, this is exactly the resource
     *    we need, return it.
     * 2. If we cannot find such a file mentioned above, try to find the first file
     *    whose extension is in <i>resourceHolderSuffixes</i>, return it.
     * 3. If we still cannot find it, try to find a subfolder in <i>baseDirectory</i>
     *    containing at least one file with the extension in <i>resourceFileSuffixes</i>
     *    return the directory
     *
     * @param definitionFileName name of the definition file, such as wordnet.dsl.dz
     * @param baseDirectory the directory where the dictionary definition file
     *        (such as .dsl) lies
     * @param resourceHolderSuffixes extensions of the archived resource file(e.g. zip)
     * @param resourceFileSuffixes resource extensions(e.g. wmv)
     * @returns path to the resource archive/directory represented in string
     */
    private getResource(definitionFileName: string,
                        baseDirectory: string,
                        resourceHolderSuffixes: string[],
                        resourceFileSuffixes: string[]): Promise<string> {
        let candidate: string;

        let dirs: string[] = [];
        let normalFiles: string[] = [];

        return new Promise<string>((resolve, reject) => {
            fsp.readdir(baseDirectory)
                .then((files) => {
                    return this.classifyFilesNonRecursively(baseDirectory, files);
                })
                .then(([dirs, normalFiles]) => {
                    normalFiles.forEach(file => {
                        if(path.extname(file) in resourceHolderSuffixes) {
                            if(definitionFileName.split('.')[0] == file.split('.')[0]) {
                                // correct suffix, correct filename, this is exactly
                                // the file we want, just return it
                                resolve(file);
                            } else {
                                // correct suffix, incorrect filename, this may be
                                // the file we want, add it to the list so we chan
                                // check later
                                candidate = file;
                            }
                        }
                    });
                    if(candidate != null) {
                        resolve(candidate);
                    } else {
                        let resDir = this.getResourceDirectory(dirs, resourceFileSuffixes)
                        resolve(resDir);
                    }
                })
                .catch(err => {reject(err);});
        });
    }

    private getResourceDirectory(dirs: string[],
                                 resourceFileSuffixes: string[]): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            dirs.forEach((dir, index) => {
                fsp.readdir(dir)
                    .then(files => {
                        files.forEach(file => {
                            if(path.extname(file) in resourceFileSuffixes) {
                                resolve(dir);
                            }
                        });
                        if(index == dirs.length - 1) {
                            // all dirs looped, resource not isFound
                            resolve('');
                        }
                    })
                    .catch(err => {reject(err);});
            });
        });
    }

    /** Walk through all files in <i>dir</i> recursively, and look for
     * dictionary definition files(e.g. dz, dsl), add it along with
     * its TreeBuilder to the result array.
     */
    private searchForDictionaryFiles(
                dir: string,
                dictionaries: Dictionary[] = this._dictionaries): Promise<DictMap[]> {

        // DictMap without resource
        let dictMap: DictMap[] = [];
        return new Promise<DictMap[]>((resolve, reject) => {
            let walk = new Walk(dir);
            walk.on('error', (err: Error) => {
                reject(err);
            });
            walk.on('file', (file: string, stat: fsp.Stats) => {
                let ext = path.extname(file);
                for(let dictionary of dictionaries) {
                    if(ext in dictionary.dictionarySuffixes) {
                        dictMap.push(<DictMap> {
                            dictPath: file,
                            dictionary: dictionary,
                            resource: ''
                        });
                        break;
                    }
                }
            });
            walk.on('end', () => {
                resolve(dictMap);
            });
        });
    }

    /** Get resource file for each dictionary in dictMap, and
     * store the resource path back in dictMap.
     */
    private getResources(dictMap: DictMap[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            dictMap.forEach((map, index) => {
                this.getResource(map.dictPath,
                                path.dirname(map.dictPath),
                                map.dictionary.resourceHolderSuffixes,
                                map.dictionary.resourceFileSuffixes)
                    .then((res) => {
                        map.resource = res;
                        if(index == dictMap.length - 1) {
                            resolve();
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    });
            });
        })
    }


    /** Scan the directory and look for dictionaries/resources
     * supported by one of treeBuilders in <i>this.treeBuilders</i> list
     *
     * @param dir directory to search in
     */
    public scan(dir: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.searchForDictionaryFiles(dir)
                .then((dictMap) => {
                    this.dictMap = dictMap;
                    return this.getResources(dictMap);
                })
                .then(() => {
                    return this.saveDictMap(this.dictMap);
                })
                .then(() => {
                    return this.buildIndexWithDictMap(this.dictMap);
                })
                .catch((err) => {
                    reject(err)
                });
            });
    }

    private async buildIndexWithDictMap(dictMapList: DictMap[], dbFile = DEFAULT_DB_PATH): Promise<void> {
        for(let dictMap of dictMapList) {
            let dictionary: Dictionary = dictMap.dictionary;
            let indexList: Index[] = await dictionary.buildIndex(dictMap.dictPath);
            await dictionary.saveIndex(indexList, dbFile);
        }
    }

    private async saveDictMap(dictMaps: DictMap[], dbFile: string = DEFAULT_DB_PATH): Promise<void> {
        let dbContents: string = await fsp.readFile(dbFile, {encoding: "utf-8"});
        let dbJson: any = JSON.parse(dbContents);

        // remove the dictionary key
        let newDictMaps: {dict: string, resource: string}[] = [];
        for(let dictMap of dictMaps) {
            newDictMaps.push({
                dict: dictMap.dictPath,
                resource: dictMap.resource
            });
        }

        dbJson['dictionary'] = newDictMaps;
        await fsp.writeFile(dbFile, dbJson, {encoding: 'utf8'});
    }
}

export interface DictMap {

    // absolute path to the main dictionary file
    dictPath: string;

    dictionary: Dictionary;
    resource: string;
}