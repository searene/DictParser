import {DatabaseManager} from './../src/database';
import {FSHelper} from './../src/util/os';
import {Constant} from '../../main/typescript/constant';
import {DictionaryManager} from './../src/dictionary';
import * as assert from 'assert';
import * as expect from 'expect';
import * as should from 'should';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import DictMap = DictionaryManager.DictMap;

describe('Test private methods in DictionaryManager', () => {

    let pathToDb: string;
    let dictionaryManager: DictionaryManager;
    let db: sqlite3.Database;
    let dictTable: string;
    let databaseManager: DatabaseManager;

    beforeEach(() => {
        // prepare database
        pathToDb = path.join(Constant.rootPathOfModule, 'resources/test.db');
        FSHelper.removeFileIfExists(pathToDb);
        databaseManager = new DatabaseManager(pathToDb);
        db = databaseManager.getDb();

        dictionaryManager = new DictionaryManager();
        dictTable = Constant.dictTableName;
    });

    afterEach(() => {
        // clean test files
        FSHelper.removeFileIfExists(pathToDb);
    });


    it('Test insertDictInfoIntoDb with single insertion', () => {
        let dictMap: DictMap[] = [];
        dictMap.push(<DictMap> {
            dict: 'dict1',
            resource: 'resource1'
        });
        return databaseManager.createDictTableIfNotExists()
            .then(() => {
                dictionaryManager.insertDictInfoIntoDb(dictMap)
                    .then(() => {
                        return new Promise((resolve, reject) => {
                            db.serialize(() => {
                                db.run(`SELECT DICT_ID as dictID,
                                   DICT_FILE as dictFile,
                                   RESOURCE as resource
                                   FROM ${dictTable}`, (err, rows) => {
                                    assert.equal(rows.length, 1);
                                    assert.equal(rows[0].dictID, 1);
                                    assert.equal(rows[0].dictFile, 'dict1');
                                    assert.equal(rows[0].resource, 'resource1');
                                });
                            });
                        });
                    });
            });
    });
});

describe('test unknown functions', () => {
    it('sqlite3', () => {
        let databaseManager = new DatabaseManager('test.db');
        let db = databaseManager.getDb();
        console.log("creating table");
        return databaseManager.createDictTableIfNotExists()
            .then(() => {
                console.log('creating table is completed');
                return new Promise<void>((resolve, reject) => {
                    db.serialize(() => {
                        db.run(`INSERT OR REPLACE INTO ${Constant.dictTableName}
                            (DICT_ID, DICT_FILE, RESOURCE)
                            VALUES (2, 'name', 'resource')`, (err) => {
                            if (err != null) {
                                reject(err);
                            }
                        });
                        db.run(`INSERT OR REPLACE INTO ${Constant.dictTableName}
                            (DICT_ID, DICT_FILE, RESOURCE)
                            VALUES (2, 'name1', 'resource1')`, (err) => {
                            if (err != null) {
                                reject(err);
                            }
                        }, err => {
                            if(err != null) {
                                reject(err);
                            } else {
                                resolve();
                            }
                        });
                    });
                });
            })
            .then(() => {
                return new Promise<void>((resolve, reject) => {
                    db.close(err => {
                        if(err) {
                            reject(err);
                        } else {
                            resolve(err);
                        }
                    });
                });
            })
            .catch((err) => {
                throw err;
            });
    });
});
