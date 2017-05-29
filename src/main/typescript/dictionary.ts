import { Log } from './util/log';
import {TreeBuilder} from "./treeBuilder";
import * as fsp from "fs-promise";
import * as path from "path";
import * as sqlite3 from 'sqlite3';
import DictMap = DictionaryManager.DictMap;
import {Constant} from "./constant";
import {Statement} from "sqlite3";
import {IndexBuilder} from "./indexBuilder";
import {Walk} from "./util/os";
import {DatabaseManager} from './database';
import * as log4js from 'log4js';

/**
 * Created by searene on 17-1-23.
 */

export class DictionaryManager {

    private databaseManager = new DatabaseManager();

    private logger = Log.getLogger();

    private treeBuilders: TreeBuilder[];

    private dictMap: DictMap[];

    /** You have to call the method after you have done everything
     * with DictionaryManager in order to release resources.
     */
    public close(): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this.databaseManager.close();
        });
    }

    public addTreeBuilder(treeBuilder: TreeBuilder): void {
        this.treeBuilders.push(treeBuilder);
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
     * the dictionary definition file(e.g. dz, dsl), add it along with
     * its TreeBuilder to the result array.
     */
    private searchForDictionaryFiles(
                dir: string,
                treeBuilders: TreeBuilder[] = this.treeBuilders): Promise<DictMap[]> {

        // DictMap without resource
        let dictMap: DictMap[] = [];
        return new Promise<DictMap[]>((resolve, reject) => {
            let walk = new Walk(dir);
            walk.on('error', (err: Error) => {
                reject(err);
            });
            walk.on('file', (file: string, stat: fsp.Stats) => {
                let ext = path.extname(file);
                for(let treeBuilder of treeBuilders) {
                    if(ext in treeBuilder.dictionarySuffixes) {
                        dictMap.push(<DictMap> {
                            dict: file,
                            treeBuilder: treeBuilder,
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
                this.getResource(map.dict,
                                path.dirname(map.dict),
                                map.treeBuilder.resourceHolderSuffixes,
                                map.treeBuilder.resourceFileSuffixes)
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
                    return this.insertDictInfoIntoDb(this.dictMap);
                })
                .then(() => {
                    return this.buildIndexWithDictMap(this.dictMap);
                })
                .catch((err) => {
                    reject(err)
                });
            });
    }

    private buildIndexWithDictMap(dictMap: DictMap[]): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            dictMap.forEach((map, index) => {
                map.treeBuilder.getIndexBuilder(map.dict).buildIndex()
                    .then(() => {
                        if(index = dictMap.length - 1) {
                            resolve();
                        }
                    })
                    .catch((err) => {
                        reject(err);
                    });
            })
        });
    }

    // TODO change public back to private
    public insertDictInfoIntoDb(dictMap: DictMap[]): Promise<void> {
        let db = this.databaseManager.getDb();
        let dictTable = Constant.dictTableName;
        let insertSQL = `INSERT OR REPLACE INTO ${dictTable} 
                        (DICT_ID, DICT_FILE, RESOURCE)
                        VALUES (NULL, ?, ?)`;
        return new Promise<void>((resolve, reject) => {
            db.parallelize(() => {
                dictMap.forEach((map, index) => {
                    db.run(insertSQL, {
                        1: map.dict,
                        2: map.resource
                    }, (err) => {
                        if(err != null) {
                            reject(err);
                        } else if(index == dictMap.length - 1) {
                            resolve();
                        }
                    });
                });
            });
        });
    }
}

export declare module DictionaryManager {
    interface DictMap {

        // absolute path to the main dictionary file
        dict: string;

        treeBuilder: TreeBuilder;
        resource: string;
    }
}
