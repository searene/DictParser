import { assert } from 'chai';
import { ROOT_PATH } from './../../main/typescript/constant';
import { DSLDictionary } from './../../main/typescript/DSLDictionary';
import {Dictionary, Index} from './../../main/typescript/Dictionary';
import { Log } from './../../main/typescript/util/log';
import * as mocha from 'mocha';
import * as path from 'path';
import * as fsp from 'fs-promise';
import {WordTree} from "../../main/typescript/Tree";

describe('DSLDictionaryTest', () => {

    let logger = Log.getLogger();

    it("#getIndexableWord", () => {
        let word = "abc{de}f\\{g\\}h";
        let dictionary: Dictionary = new DSLDictionary();
        let indexableWord = (dictionary as any).getIndexableWord(word);

        assert.equal(indexableWord, "abcf\\{g\\}h");
    });
    it("#buildIndex", async () => {
        let dzFile: string = path.join(ROOT_PATH, 'src/main/resources/dsl/sample.dsl');
        let dictionary: Dictionary = new DSLDictionary();
        let indexList: Index[] = await dictionary.buildIndex(dzFile);
        assert.deepEqual(indexList, [
            { word: 'trivial card', line: 4},
            { word: 'sample entry', line: 7},
            { word: 'example', line: 8},
            { word: 'sample  card', line: 9},
            { word: 'sample headword', line: 10},
            { word: 'typical card', line: 191},
            { word: 'resourceCard', line: 213}
        ]);
    });
});