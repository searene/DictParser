import { UTF_8, UTF_8_BOM, UTF_16_LE, UTF_16_BE, UTF_32_BE, UTF_32_LE } from './../../main/typescript/DetectEncoding';
import { ROOT_PATH } from './../../main/typescript/constant';
import { Log } from './../../main/typescript/util/log';
import { Reader } from "../../main/typescript/Reader";
import { LOG_CONFIG_LOCATION } from "../../main/typescript/constant";
import { detectEncodingInBuffer } from '../../main/typescript/DetectEncoding';
import { assert } from "chai";
import * as path from 'path';
import * as fsp from 'fs-promise';

describe('detect encoding test', () => {

    let logger = Log.getLogger();

    let pathToEncodingsDirectory = path.join(ROOT_PATH, 'src/test/resources/encodings');
    
    let utf32be_file = path.join(pathToEncodingsDirectory, 'utf32be.txt');
    let utf32le_file = path.join(pathToEncodingsDirectory, 'utf32le.txt');
    let utf16be_file = path.join(pathToEncodingsDirectory, 'utf16be.txt');
    let utf16le_file = path.join(pathToEncodingsDirectory, 'utf16le.txt');
    let utf8withBom_file = path.join(pathToEncodingsDirectory, 'utf8withBom.txt');
    let utf8_file = path.join(pathToEncodingsDirectory, 'utf8.txt');

    it("#detectEncodingInBuffer", async () => {
        let utf32be_encoding = await detectEncodingInBuffer(await fsp.readFile(utf32be_file));
        let utf32le_encoding = await detectEncodingInBuffer(await fsp.readFile(utf32le_file));
        let utf16be_encoding = await detectEncodingInBuffer(await fsp.readFile(utf16be_file));
        let utf16le_encoding = await detectEncodingInBuffer(await fsp.readFile(utf16le_file));
        let utf8withBom_encoding = await detectEncodingInBuffer(await fsp.readFile(utf8withBom_file));
        let utf8_encoding = await detectEncodingInBuffer(await fsp.readFile(utf8_file));
        
        assert.deepEqual(utf32be_encoding, {encoding: UTF_32_BE, posAfterBom: 4});
        assert.deepEqual(utf32le_encoding, {encoding: UTF_32_LE, posAfterBom: 4});
        assert.deepEqual(utf16be_encoding, {encoding: UTF_16_BE, posAfterBom: 2});
        assert.deepEqual(utf16le_encoding, {encoding: UTF_16_LE, posAfterBom: 2});
        assert.deepEqual(utf8withBom_encoding, {encoding: UTF_8_BOM, posAfterBom: 3});
        assert.deepEqual(utf8_encoding, {encoding: UTF_8, posAfterBom: 0});
    });
});