import { Log } from './util/log';
import * as fsp from 'fs-promise';

export const UTF_8_BOM: string = "utf8";
export const UTF_8: string = "utf8";
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
 * @param fileContents file contents represented as Buffer, at least 4 bytes are needed
 * @return an object, containing two keys: 
 *          {@code encoding: string}
 *          {@code posAfterBom: pos of the real contents, excluding the bom at the beginning}
 */
export async function getEncodingInBuffer(fileContents: Buffer): Promise<EncodingStat> {
    if(fileContents.length < 4) {
        throw new Error("at least 4 bytes are needed");
    }
    let bom: Buffer = fileContents.slice(0, 4);

    if(bom.equals(Buffer.from("0000FEFF", "hex"))) {
        return {encoding: UTF_32_BE, posAfterBom: 4};
    } else if(bom.equals(Buffer.from("FFFE0000", "hex"))) {
        return {encoding: UTF_32_LE, posAfterBom: 4};
    } else if(bom.slice(0, 2).equals(Buffer.from("FEFF", "hex"))) {
        return {encoding: UTF_16_BE, posAfterBom: 2};
    } else if(bom.slice(0, 2).equals(Buffer.from("FFFE", "hex"))) {
        return {encoding: UTF_16_LE, posAfterBom: 2};
    } else if(bom.slice(0, 3).equals(Buffer.from("EFBBBF", "hex"))) {
        return {encoding: UTF_8_BOM, posAfterBom: 3};
    } else {
        return {encoding: UTF_8, posAfterBom: 0};
    }
}

export async function getEncodingInFile(filePath: string): Promise<EncodingStat> {
    let fd: number = await fsp.open(filePath, 'r');
    let buffer = Buffer.alloc(4);
    let bytesRead = (await fsp.read(fd, buffer, 0, 4, 0))[0];
    if(bytesRead < 4) {
        throw new Error(`at least 4 bytes are required to detect encoding in file ${filePath}`);
    }
    return await getEncodingInBuffer(buffer);
}

export interface EncodingStat {
    encoding: string;
    posAfterBom: number;
}