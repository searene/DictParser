import { UTF_8, UTF_16_LE, UTF_16_BE, UTF_32_BE, UTF_32_LE, getEncodingInBuffer } from '../EncodingDetector';
import { TEST_RESOURCE_PATH } from '../Constant';
import { assert } from "chai";
import * as path from 'path';
import * as fse from 'fs-extra';

describe('get encoding test', () => {

    const pathToEncodingsDirectory = path.join(TEST_RESOURCE_PATH, 'encodings');
    
    const utf32be_file = path.join(pathToEncodingsDirectory, 'utf32be.txt');
    const utf32le_file = path.join(pathToEncodingsDirectory, 'utf32le.txt');
    const utf16be_file = path.join(pathToEncodingsDirectory, 'utf16be.txt');
    const utf16le_file = path.join(pathToEncodingsDirectory, 'utf16le.txt');
    const utf8_file = path.join(pathToEncodingsDirectory, 'utf8.txt');

    it("#getEncodingInBuffer", async () => {
        const utf32be_encoding = await getEncodingInBuffer(await fse.readFile(utf32be_file));
        const utf32le_encoding = await getEncodingInBuffer(await fse.readFile(utf32le_file));
        const utf16be_encoding = await getEncodingInBuffer(await fse.readFile(utf16be_file));
        const utf16le_encoding = await getEncodingInBuffer(await fse.readFile(utf16le_file));
        const utf8_encoding = await getEncodingInBuffer(await fse.readFile(utf8_file));
        
        assert.deepEqual(utf32be_encoding, {encoding: UTF_32_BE, posAfterBom: 4});
        assert.deepEqual(utf32le_encoding, {encoding: UTF_32_LE, posAfterBom: 4});
        assert.deepEqual(utf16be_encoding, {encoding: UTF_16_BE, posAfterBom: 2});
        assert.deepEqual(utf16le_encoding, {encoding: UTF_16_LE, posAfterBom: 2});
        assert.deepEqual(utf8_encoding, {encoding: UTF_8, posAfterBom: 0});
    });
});