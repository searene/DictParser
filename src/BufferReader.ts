import { DictZipParser } from './dictionaries/dsl/DictZipParser';
import { getEncodingInBuffer, getEncodingInFile, EncodingStat } from './EncodingDetector';
import * as fsp from 'fs-promise';

export interface BufferReader {

    // call this method first before calling any other methods
    open(filePath: string): Promise<number>;

    read(start: number, len: number): Promise<Buffer>;
    getEncodingStat(): Promise<EncodingStat>;

    // call this method after you have done with all the work
    close(): Promise<void>;
}

export class SimpleBufferReader implements BufferReader {

    private _filePath: string;
    private _fd: number;

    async open(filePath: string): Promise<number> {
        this._filePath = filePath;
        this._fd = await fsp.open(this._filePath, 'r');
        return this._fd;
    }

    async read(start: number, len: number): Promise<Buffer> {
        let buffer = Buffer.alloc(len);
        let readContents = await fsp.read(this._fd, buffer, 0, len, start);
        if(buffer.length > readContents[0]) {
            buffer = buffer.slice(0, readContents[0]);
        }
        return buffer;
    }

    async close(): Promise<void> {
        if(this._fd != undefined) {
            await fsp.close(this._fd);
        }
    }

    async getEncodingStat(): Promise<EncodingStat> {
        return await getEncodingInFile(this._filePath);
    }
}

export class DzBufferReader implements BufferReader {

    private _fd: number;
    private _filePath: string
    private _dictZipParser: DictZipParser;

    async open(filePath: string): Promise<number> {
        this._filePath = filePath;
        this._fd = await fsp.open(filePath, 'r');
        this._dictZipParser = new DictZipParser(this._fd);
        return this._fd;
    }

    async read(start: number, len: number): Promise<Buffer> {
        return await this._dictZipParser.parse(start, len);
    }

    async getEncodingStat(): Promise<EncodingStat> {
        let buffer: Buffer = await this._dictZipParser.parse(0, 4);
        if(buffer.length < 4) {
            throw new Error(`The size of file ${this._filePath} cannot be less than 4 bytes.`);
        }
        return await getEncodingInBuffer(buffer);
    }

    async close(): Promise<void> {
        if(this._fd != undefined) {
            await fsp.close(this._fd);
        }
    }
}
