import { assert } from 'chai';
import { DictZipParser } from '../dictionaries/dsl/DictZipParser';
import * as path from 'path';
import * as fse from 'fs-extra';

describe('DictZipParser test', () => {

    const simpleDictFile = path.join("", 'dz/simple_dict_file.txt.dz');

    it("#parse", async () => {
        const fd: number = await fse.open("/home/searene/Public/dz/longman.dsl.dz", 'r');
        const dictZipParser = new DictZipParser(fd);
        const parsedBuffer = await dictZipParser.parse(120000, 10000);
        const parsedString = parsedBuffer.toString('utf16le');
        console.log(parsedString);
    });
});
