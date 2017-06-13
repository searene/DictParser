import { assert } from 'chai';
import { ROOT_PATH } from '../../../main/code/constant';
import { DSLDictionary } from '../../../main/code/dsl/DSLDictionary';
import { Dictionary, DictionaryStats } from '../../../main/code/Dictionary';
import { Log } from '../../../main/code/util/log';
import * as path from 'path';

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
                'example': {pos: 416, len: 29448},
                'sample  card': {pos: 434, len: 29430},
                'sample headword': {pos: 492, len: 29372},
                'typical card': {pos: 29864, len: 3762},
                'resourceCard': {pos: 33626, len: 180}
            }
        });
    });
});