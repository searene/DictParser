import { Log } from './util/log';
import * as fsp from 'fs-promise';

export const UTF_8_BOM: string = "utf8";
export const UTF_16_BE: string = "utf16be";
export const UTF_16_LE: string = "utf16le";
export const UTF_32_BE: string = "utf32be";
export const UTF_32_LE: string = "utf32le";

let logger = Log.getLogger();

/**
 * Detect file encoding using BOM(Byte Order Mark) at the beginning of the file,
 * the following encodings are supported:
 * 
 *      utf32be
 *      utf32le
 *      utf16be
 *      utf16le
 *      utf8
 * 
 * Notice that a lot of UTF-8 files are deemed indetectable by the function because they don't
 * have a BOM header.
 * 
 * @param fileContents file contents represented as Buffer
 * @return an object, containing two keys: 
 *          {@code isDetectionSuccessful: boolean},
 *          {@code encoding: string}
 * 
 *      1) If the function finds the encoding of {@code fileContents}, {@code isDetectionSuccessful}
 *         would be set to true, and {@code encoding} would be set to the detected encoding.
 *         Possible values of {@code encoding} is listed above. It is recommended to use
 *         encoding constants exported by this file instead of writing them manually to avoid
 *         possible typo.
 *      2) If the function can't find the encoding of {@code fileContents}, return
 *         {@code {isDetectionSuccessful: false, encoding: ""}}
 */
export async function detectEncodingByBOM(fileContents: Buffer): Promise<{isDetectionSuccessful: boolean, encoding: string}> {
    if(fileContents.length < 4) {
        throw new Error("at least 4 bytes are needed");
    }
    let bom: Buffer = fileContents.slice(0, 4);

    if(bom.equals(Buffer.from("0000FEFF", "hex"))) {
        return {isDetectionSuccessful: true, encoding: UTF_32_BE};
    } else if(bom.equals(Buffer.from("FFFE0000", "hex"))) {
        return {isDetectionSuccessful: true, encoding: UTF_32_LE};
    } else if(bom.slice(0, 2).equals(Buffer.from("FEFF", "hex"))) {
        return {isDetectionSuccessful: true, encoding: UTF_16_BE};
    } else if(bom.slice(0, 2).equals(Buffer.from("FFFE", "hex"))) {
        return {isDetectionSuccessful: true, encoding: UTF_16_LE};
    } else if(bom.slice(0, 3).equals(Buffer.from("EFBBBF", "hex"))) {
        return {isDetectionSuccessful: true, encoding: UTF_8_BOM};
    } else {
        return {isDetectionSuccessful: false, encoding: ""};
    }
}

/**
 * Get the position right after the BOM header, starting from 0. For example,
 * if we have a file with encoding utf16be, whose BOM is 0xFEFF, taking two bytes,
 * we would get the result {@code 2} if we feed the file to the function
 * 
 * @param filePath path to the file to be checked
 */
export async function getPosAfterBOM(filePath: string): Promise<number> {
    let encodingDetectionResult = await detectEncodingByBOM(await fsp.readFile(filePath));
    let isDetected = encodingDetectionResult.isDetectionSuccessful;
    let encoding = encodingDetectionResult.encoding;
    if(isDetected && [UTF_32_BE, UTF_32_LE].indexOf(encoding) > -1) {
        return 4;
    } else if(isDetected && [UTF_16_BE, UTF_16_LE].indexOf(encoding) > -1) {
        return 2;
    } else if(isDetected && UTF_8_BOM == encoding) {
        return 3;
    } else {
        return 0;
    }
}