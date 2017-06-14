import { TEST_RESOURCE_PATH } from './../Constant';
import { assert } from 'chai';
import { Log } from '../util/log';
import { DictZipParser } from '../dictionaries/dsl/dictzip/DictZipParser';
import * as path from 'path';

describe('DictZipParser test', () => {

    let logger = Log.getLogger();

    let simpleDictFile = path.join(TEST_RESOURCE_PATH, 'dz/simple_dict_file.txt.dz');

    it("#parse", async () => {
        let dictZipParser = new DictZipParser(simpleDictFile);
        let parsedBuffer = await dictZipParser.parse(2);

        let parsedString = parsedBuffer.toString('utf8');
        assert.equal(parsedString, 'st\n');
    });
});