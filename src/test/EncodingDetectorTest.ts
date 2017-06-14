import { UTF_8, UTF_16_LE, UTF_16_BE, UTF_32_BE, UTF_32_LE, getEncodingInBuffer } from '../EncodingDetector';
import { TEST_RESOURCE_PATH } from '../Constant';
import { Log } from '../util/log';
import { assert } from "chai";
import * as path from 'path';
import * as fsp from 'fs-promise';

describe('get encoding test', () => {

    let logger = Log.getLogger();

    let pathToEncodingsDirectory = path.join(TEST_RESOURCE_PATH, 'encodings');
    
    let utf32be_file = path.join(pathToEncodingsDirectory, 'utf32be.txt');
    let utf32le_file = path.join(pathToEncodingsDirectory, 'utf32le.txt');
    let utf16be_file = path.join(pathToEncodingsDirectory, 'utf16be.txt');
    let utf16le_file = path.join(pathToEncodingsDirectory, 'utf16le.txt');
    let utf8_file = path.join(pathToEncodingsDirectory, 'utf8.txt');

    it("#getEncodingInBuffer", async () => {
        let utf32be_encoding = await getEncodingInBuffer(await fsp.readFile(utf32be_file));
        let utf32le_encoding = await getEncodingInBuffer(await fsp.readFile(utf32le_file));
        let utf16be_encoding = await getEncodingInBuffer(await fsp.readFile(utf16be_file));
        let utf16le_encoding = await getEncodingInBuffer(await fsp.readFile(utf16le_file));
        let utf8_encoding = await getEncodingInBuffer(await fsp.readFile(utf8_file));
        
        assert.deepEqual(utf32be_encoding, {encoding: UTF_32_BE, posAfterBom: 4});
        assert.deepEqual(utf32le_encoding, {encoding: UTF_32_LE, posAfterBom: 4});
        assert.deepEqual(utf16be_encoding, {encoding: UTF_16_BE, posAfterBom: 2});
        assert.deepEqual(utf16le_encoding, {encoding: UTF_16_LE, posAfterBom: 2});
        assert.deepEqual(utf8_encoding, {encoding: UTF_8, posAfterBom: 0});
    });
});