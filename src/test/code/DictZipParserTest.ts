import { assert } from 'chai';
import { ROOT_PATH } from '../../main/code/constant';
import { Log } from '../../main/code/util/log';
import { DictZipParser } from '../../main/code/dsl/dictzip/DictZipParser';
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