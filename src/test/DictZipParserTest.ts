import { TEST_RESOURCE_PATH } from './../Constant';
import { assert } from 'chai';
import { Log } from '../util/log';
import { DictZipParser } from '../dictionaries/dsl/DictZipParser';
import * as path from 'path';
import * as fsp from 'fs-promise';

describe('DictZipParser test', () => {

    let logger = Log.getLogger();

    let simpleDictFile = path.join(TEST_RESOURCE_PATH, 'dz/simple_dict_file.txt.dz');

    it("#parse", async () => {
        let fd: number = await fsp.open(simpleDictFile, 'r');

        let dictZipParser = new DictZipParser(fd);

        let parsedBuffer = await dictZipParser.parse(1, 2);

        let parsedString = parsedBuffer.toString('utf8');
        assert.equal(parsedString, 'es');
    });
});
