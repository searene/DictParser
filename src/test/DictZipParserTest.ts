import { TEST_RESOURCE_PATH } from './../Constant';
import { assert } from 'chai';
import { Log } from '../util/log';
import { DictZipParser } from '../dictionaries/dsl/DictZipParser';
import * as path from 'path';
import * as fse from 'fs-extra';

describe('DictZipParser test', () => {

    let logger = Log.getLogger();

    let simpleDictFile = path.join(TEST_RESOURCE_PATH, 'dz/simple_dict_file.txt.dz');

    it("#parse", async () => {
        let fd: number = await fse.open("/home/searene/Public/dz/longman.dsl.dz", 'r');
        let dictZipParser = new DictZipParser(fd);
        let parsedBuffer = await dictZipParser.parse(120000, 10000);
        let parsedString = parsedBuffer.toString('utf16le');
        console.log(parsedString);
    });
});
