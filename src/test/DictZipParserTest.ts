import { assert } from 'chai';
import { ROOT_PATH } from '../constant';
import { Log } from '../util/log';
import { DictZipParser } from '../dictionaries/dsl/dictzip/DictZipParser';
import * as path from 'path';

describe('DictZipParser test', () => {

    let logger = Log.getLogger();

    let simpleDictFile = path.join(ROOT_PATH, 'src/test/resources/dz/simple_dict_file.txt.dz');

    it("#parse", async () => {
        let dictZipParser = new DictZipParser(simpleDictFile);
        let parsedBuffer = await dictZipParser.parse(2);

        let parsedString = parsedBuffer.toString('utf8');
        assert.equal(parsedString, 'st\n');
    });
});