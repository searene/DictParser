import { UTF_8_BOM, UTF_16_LE, UTF_16_BE, UTF_32_BE, UTF_32_LE } from './../../main/typescript/DetectEncoding';
import { ROOT_PATH } from './../../main/typescript/constant';
import { Log } from './../../main/typescript/util/log';
import { Reader } from "../../main/typescript/Reader";
import { LOG_CONFIG_LOCATION } from "../../main/typescript/constant";
import { getPosAfterBOM, detectEncodingByBOM } from '../../main/typescript/DetectEncoding';
import { assert } from "chai";
import * as mocha from 'mocha';
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

    it("#detectEncoding", async () => {
        let utf32be_encoding = await detectEncodingByBOM(await fsp.readFile(utf32be_file));
        let utf32le_encoding = await detectEncodingByBOM(await fsp.readFile(utf32le_file));
        let utf16be_encoding = await detectEncodingByBOM(await fsp.readFile(utf16be_file));
        let utf16le_encoding = await detectEncodingByBOM(await fsp.readFile(utf16le_file));
        let utf8withBom_encoding = await detectEncodingByBOM(await fsp.readFile(utf8withBom_file));
        let utf8_encoding = await detectEncodingByBOM(await fsp.readFile(utf8_file));
        
        assert.deepEqual(utf32be_encoding, {isDetectionSuccessful: true, encoding: UTF_32_BE});
        assert.deepEqual(utf32le_encoding, {isDetectionSuccessful: true, encoding: UTF_32_LE});
        assert.deepEqual(utf16be_encoding, {isDetectionSuccessful: true, encoding: UTF_16_BE});
        assert.deepEqual(utf16le_encoding, {isDetectionSuccessful: true, encoding: UTF_16_LE});
        assert.deepEqual(utf8withBom_encoding, {isDetectionSuccessful: true, encoding: UTF_8_BOM});
        assert.deepEqual(utf8_encoding, {isDetectionSuccessful: false, encoding: ""});
    });

    it("#getPosAfterBOM", async () => {
        assert.equal(await getPosAfterBOM(utf32be_file), 4);
        assert.equal(await getPosAfterBOM(utf32le_file), 4);
        assert.equal(await getPosAfterBOM(utf16be_file), 2);
        assert.equal(await getPosAfterBOM(utf16le_file), 2);
        assert.equal(await getPosAfterBOM(utf8withBom_file), 3);
        assert.equal(await getPosAfterBOM(utf8_file), 0);
    });
});