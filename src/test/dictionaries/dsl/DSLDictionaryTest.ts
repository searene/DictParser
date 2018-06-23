import { assert } from 'chai';
import { TEST_RESOURCE_PATH } from '../../../Constant';
import { DSLDictionary } from '../../../dictionaries/dsl/DSLDictionary';
import { Dictionary, DictionaryStats } from '../../../Dictionary';
import * as path from 'path';

describe('DSLDictionaryTest', () => {

    it("#getIndexableWord", () => {
        const word = "abc{de}f\\{g\\}h";
        const dictionary: Dictionary = new DSLDictionary();
        const indexableWord = (dictionary as any).getIndexableWord(word);

        assert.equal(indexableWord, "abcf{g}h");
    });
    it("#getDictionaryStats", async () => {
        const dzFile: string = path.join(TEST_RESOURCE_PATH, 'dsl/sample.dsl');
        const dictionary: Dictionary = new DSLDictionary();
        const dictionaryStats: DictionaryStats = await dictionary.getDictionaryStats(dzFile);

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