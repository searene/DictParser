import { DictZipParser } from './dictzip/DictZipParser';
import { ROOT_PATH } from './constant';
import * as fsp from 'fs-promise';
import * as path from 'path';

let filePath = path.join(ROOT_PATH, 'src/test/resources/simple_dict_file.txt.dz');

async function test() {
    let dictZipParser = new DictZipParser(filePath);
    let fd = await fsp.open(filePath, 'r');
    let buffer = await dictZipParser.parse(8, 10);
    console.log(buffer.toString('hex'));
}

test();