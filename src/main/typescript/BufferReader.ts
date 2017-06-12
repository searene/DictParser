import { DictZipParser } from './dictzip/DictZipParser';
import { getEncodingInBuffer, getEncodingInFile, EncodingStat } from './EncodingDetector';
import * as fsp from 'fs-promise';

export interface BufferReader {
    read(filePath: string, start: number, len: number): Promise<Buffer>;
    getEncodingStat(filePath: string): Promise<EncodingStat>;
}

export class SimpleBufferReader implements BufferReader {

    async read(filePath: string, start: number, len: number): Promise<Buffer> {
        let fd: number = await fsp.open(filePath, 'r');
        let buffer = Buffer.alloc(len);
        let readContents = await fsp.read(fd, buffer, 0, len, start);
        await fsp.close(fd);
        if(buffer.length > readContents[0]) {
            buffer = buffer.slice(0, readContents[0]);
        }
        return buffer;
    }

    async getEncodingStat(filePath: string): Promise<EncodingStat> {
        return await getEncodingInFile(filePath);
    }
}

export class DzBufferReader extends SimpleBufferReader {

    async read(filePath: string, start: number, len: number): Promise<Buffer> {
        let dictZipParser = new DictZipParser(filePath);
        return await dictZipParser.parse(start, len);
    }

    async getEncodingStat(filePath: string): Promise<EncodingStat> {
        let dictZipParser = new DictZipParser(filePath);
        let buffer: Buffer = await dictZipParser.parse(0, 4);
        if(buffer.length < 4) {
            throw new Error(`The size of file ${filePath} cannot be less than 4 bytes.`);
        }
        return await getEncodingInBuffer(buffer);
    }
}