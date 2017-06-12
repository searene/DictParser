import { assert } from 'chai';
import { ROOT_PATH } from './../../main/typescript/constant';
import { DSLDictionary } from './../../main/typescript/DSLDictionary';
import { Dictionary, WordPosition, DictionaryStats } from './../../main/typescript/Dictionary';
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

        assert.equal(indexableWord, "abcf{g}h");
    });
    it("#getDictionaryStats", async () => {
        let dzFile: string = path.join(ROOT_PATH, 'src/test/resources/dsl/sample.dsl');
        let dictionary: Dictionary = new DSLDictionary();
        let dictionaryStats: DictionaryStats = await dictionary.getDictionaryStats(dzFile);

        assert.deepEqual(dictionaryStats, {
            meta: {
                'NAME': 'Sample DSL Dictionary',
                'INDEX_LANGUAGE': 'English',
                'CONTENTS_LANGUAGE': 'English'
            },
            indexMap: {
                'trivial card': {pos: 182, len: 206},
                'sample entry': {pos: 388, len: 29476},
                'example': {pos: 388, len: 29476},
                'sample  card': {pos: 388, len: 29476},
                'sample headword': {pos: 388, len: 29476},
                'typical card': {pos: 29864, len: 3762},
                'resourceCard': {pos: 33626, len: 180}
            }
        });
    });
});