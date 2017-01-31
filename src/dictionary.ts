import {TreeBuilder} from "./tree_builders/treeBuilder";
import fs = require("fs");
import path = require("path");
import sqlite3 = require('sqlite3');
import DictMap = Dictionary.DictMap;
import {Constant, Option} from "./universal";
import {Statement} from "sqlite3";
import {WordIndexIterator} from "./wordIndexIterator";

/**
 * Created by searene on 17-1-23.
 */

export class Dictionary {
    private treeBuilders: TreeBuilder[] = [];

    public addTreeBuilder(treeBuilder: TreeBuilder): void {
        this.treeBuilders.push(treeBuilder);
    }

    // get the tree_builders which can process the dictionary file
    public getTreeBuilderForFile(dictFile: string,
                                 treeBuilders: TreeBuilder[] = this.treeBuilders): Option<TreeBuilder> {

        if(fs.existsSync(dictFile) && fs.lstatSync(dictFile).isFile()) {
            let ext: string = path.extname(dictFile);
            for(let treeBuilder of treeBuilders) {
                if(ext in treeBuilder.dictionarySuffixes) {
                    return new Option<TreeBuilder>(true, treeBuilder);
                }
            }
        }
        return new Option<TreeBuilder>(false);
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
     * @return path to the resource archive/directory represented in string
     */
    private getResource(definitionFileName: string,
                        baseDirectory: string,
                        resourceHolderSuffixes: string[],
                        resourceFileSuffixes: string[]): Option<string> {
        let resources = [];
        let files: string[] = fs.readdirSync(baseDirectory);
        files.forEach(file => {
            let fullPath: string = path.join(baseDirectory, file);
            if(fs.statSync(fullPath).isDirectory() &&
               this.doesContainResources(fullPath, resourceFileSuffixes)) {

                // we have a resource directory, I'm not sure
                // whether this is the one we want, just add it
                // to the list so we can check later
                resources.push(fullPath);
            } else if(fs.statSync(fullPath).isFile()) {
                if(path.extname(file) in resourceHolderSuffixes) {

                    if(definitionFileName.split('.')[0] == file.split('.')[0]) {
                        // correct suffix, correct filename, this is exactly
                        // the file we want, just return it
                        return fullPath;
                    } else {
                        // correct suffix, incorrect filename, this may be
                        // the file we want, add it to the list so we chan
                        // check later
                        resources.push(fullPath);
                    }
                }
            }
        });

        // pick a file instead of directory from resources
        for(let resource of resources) {
            if(fs.statSync(resource).isFile()) {
                return new Option<string>(true, resource);
            }
        }

        // it seemed that we only found directory, let's return one
        if(resources.length > 0) {
            return new Option<string>(true, resources[0]);
        } else {
            // we found nothing
            return new Option<string>(false);
        }
    }

    private doesContainResources(dir: string,
                                 resourceFileSuffixes: string[]): boolean {
        fs.readdirSync(dir).forEach(file => {
            if(path.extname(file) in resourceFileSuffixes) {
                return true;
            }
        });
        return false;
    }

    /** Walk through all files in <i>dir</i> recursively, and look for
     * the dictionary definition file(e.g. dz, dsl), add it along with
     * its TreeBuilder to the result array.
     */
    private searchForDictionaryFiles(
                dir: string,
                treeBuilders: TreeBuilder[] = this.treeBuilders,
                initialArray: Array<DictMap> = []): Array<DictMap> {

        // DictMap without resource
        let partialDictMaps: Array<DictMap> = [];

        fs.readdirSync(dir).forEach(file => {
            let fullPath: string = path.join(dir, file);
            if(fs.statSync(fullPath).isFile()) {
                let optionTreeBuilder = this.getTreeBuilderForFile(file);
                if(optionTreeBuilder.isValid) {
                    partialDictMaps.push(<DictMap> {
                        dict: fullPath,
                        treeBuilder: optionTreeBuilder.value,
                        resource: ""
                    })
                }
            } else if(fs.statSync(fullPath).isDirectory()) {
                this.searchForDictionaryFiles(dir, treeBuilders, partialDictMaps);
            }
        });
        return partialDictMaps;
    }


    /** Scan the directory and look for dictionaries/resources
     * supported by one of treeBuilders in <i>this.treeBuilders</i> list
     *
     * @param dir directory to search in
     * @param buildIndex whether we should build index
     *        after scanning is completed, which may
     *        take a while
     * @param sqlFile path to the sql file, which is used to store information of
     *        dictionaries, it's only useful when <i>buildIndex</i> is set to true.
     */
    public scan(dir: string,
                buildIndex: boolean = true,
                sqlFile: string = "./dictParser.db"): void {
        let dictMap: Array<DictMap> = this.searchForDictionaryFiles(dir);
        dictMap.forEach(map => {
            let resourceOption = this.getResource(map.dict,
                                                  path.dirname(map.dict),
                                                  map.treeBuilder.resourceHolderSuffixes,
                                                  map.treeBuilder.resourceFileSuffixes);
            if(resourceOption.isValid) {
                map.resource = resourceOption.value;
            }
        });

        this.prepareDictTable();
        this.insertDictInfoIntoDb(dictMap);

        if(buildIndex) {
            let wordIndexIterator = WordIndexIterator();
            wordIndexIterator.prepareIndexTable();
        }
    }

    private insertDictInfoIntoDb(dictMap: Array<DictMap>) {
        let db = new sqlite3.Database(Constant.pathToDbFile);
        let resource = Constant.resourceTableName;
        db.parallelize(() => {
            let insertSQL = `INSERT INTO ${resource} 
                             (DICT_ID, DICT_FILE, RESOURCE)
                             VALUES (NULL, ?, ?)`;
            let stmt: Statement = db.prepare(insertSQL);
            for(let map of dictMap) {
                stmt.run(map.dict, map.resource)
            }
        });
        db.close();
    }

    private prepareDictTable(): void {
        let db = new sqlite3.Database(Constant.pathToDbFile);
        let resource = Constant.resourceTableName;
        db.parallelize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS ${resource} (
                      DICT_ID INTEGER PRIMARY KEY,
                      DICT_FILE TEXT,
                      RESOURCE TEXT
                      )`);
        });
        db.close();
    }
}

declare module Dictionary {
    interface DictMap {
        // absolute path to the main dictionary file
        dict: string;

        treeBuilder: TreeBuilder;

        resource: string;
    }
}