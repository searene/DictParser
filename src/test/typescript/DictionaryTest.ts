import { assert } from 'chai';
import { ROOT_PATH } from './../../main/typescript/constant';
import { DSLDictionary } from './../../main/typescript/dsl/DSLDictionary';
import {Dictionary, Index} from './../../main/typescript/Dictionary';
import { Log } from './../../main/typescript/util/log';
import * as mocha from 'mocha';
import * as path from 'path';
import * as fsp from 'fs-promise';
import {WordTree} from "../../main/typescript/Tree";

describe('Dictionary test', () => {

    let logger = Log.getLogger();

    it("#saveIndex", async () => {
        let testDb = path.join(ROOT_PATH, 'src/test/resources/saveIndexTest.db');
        let index: Index[] = [
            {word: 'foo', line: 3},
            {word: 'bar', line: 10}
        ];

        // remove db contents
        await fsp.writeFile(testDb, '', {encoding: 'utf8', flag: 'w'});

        let dictionary: Dictionary = new DSLDictionary();
        await dictionary.saveIndex(index, testDb);

        // validate
        let dbContents = JSON.parse(await fsp.readFile(testDb, {encoding: 'utf8'}));
        assert.deepEqual(dbContents, {'index': index});
    });
});