import { assert } from 'chai';
import { DSLDictionary } from '../../../dictionaries/dsl/DSLDictionary';
import { Dictionary } from '../../../Dictionary';

describe('DSLDictionaryTest', () => {

    it("#getIndexableWord", () => {
        const word = "abc{de}f\\{g\\}h";
        const dictionary: Dictionary = new DSLDictionary();
        const indexableWord = (dictionary as any).getIndexableWord(word);

        assert.equal(indexableWord, "abcf{g}h");
    });
});