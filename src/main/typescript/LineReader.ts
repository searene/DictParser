import { detectEncodingInBuffer, EncodingStat } from './DetectEncoding';
import { DictZipParser } from './dictzip/DictZipParser';
import * as EventEmitter from 'events';
import * as fsp from 'fs-promise';
import * as path from 'path';

export class LineReader extends EventEmitter {

    private _filePath: string;
    private _bufferReader: BufferReader;
    private static _bufferReaders: Map<string, BufferReader> = new Map<string, BufferReader>();
    private _encoding: string;

    // how many bytes to be read each time
    private _len: number;

    /**
     * @param filePath: file to be processed
     * @param len: how many bytes to be read each time
     */
    constructor(filePath: string, len: number = 64 * 104) {
        super();
        this._filePath = filePath;
        this._len = len;
        process.nextTick(() => {
            this.run();
        });
    }

    private async init(): Promise<void> {
        let ext: string = path.extname(this._filePath);
        let bufferReader = LineReader._bufferReaders.get(ext);
        if(bufferReader == undefined) {
            throw new Error(`No BufferReader is not registered for ${ext}.`);
        }
        this._bufferReader = bufferReader as BufferReader;
        await this._bufferReader.init(this._filePath);
    }

    async run(): Promise<void> {
        await this.init();

        let encodingStat = await this._bufferReader.getEncodingStat();
        this._encoding = encodingStat.encoding;

        let dataProcessTotally: number = encodingStat.posAfterBom;

        // buffer read each time from file
        let bufferRead: Buffer = await this._bufferReader.read(dataProcessTotally, this._len);

        // data to be processed
        let data = bufferRead;

        // the number of bytes that are processed each time
        let dataProcessedEachTime: number;

        let i = 1;
        while(bufferRead.length != 0) {
            dataProcessedEachTime = this.emitLines(data, dataProcessTotally);
            dataProcessTotally += dataProcessedEachTime;

            // read 64KB
            bufferRead = await this._bufferReader.read(encodingStat.posAfterBom + i * this._len, this._len);

            // concat data that is not processed last time and data read this time
            data = Buffer.concat([data.slice(dataProcessedEachTime), bufferRead]);

            i++;
        }
        if(data.length > 0) {
            if(!data.toString(this._encoding).endsWith('\n')) {
                data = Buffer.concat([data, Buffer.from('\n', this._encoding)]);
            }
            this.emitLines(data, dataProcessTotally);
        }
        this.destroy();
        this.emit('end');
    }

    private emitLines(buffer: Buffer, previousBytesRead: number): number {
        let s = buffer.toString(this._encoding);
        let pos = 0;
        let line: string = "";
        for(let i = 0; i < s.length; i++) {
            if(s[i] == '\r' && i + 1 < s.length && s[i + 1] == '\n') {
                i++;
                this.emit('line', [line, pos + previousBytesRead]);
                pos += Buffer.from(line + '\r\n', this._encoding).length;
                line = "";
            } else if((s[i] == '\r' && i + 1 < s.length && s[i + 1] != '\n') || s[i] == '\n') {
                this.emit('line', [line, pos + previousBytesRead]);
                pos += Buffer.from(line + s[i], this._encoding).length;
                line = "";
            } else if(['\r', '\n'].indexOf(s[i]) == -1) {
                line += s[i];
            }
        }
        return pos;
    }

    private async destroy(): Promise<void> {
        this._bufferReader.destroy();
    }

    static register(ext: string, bufferReader: BufferReader): void {
        this._bufferReaders.set(ext, bufferReader);
    }
}

interface BufferReader {
    init(filePath: string): void;
    read(start: number, len: number): Promise<Buffer>;
    getEncodingStat(): Promise<EncodingStat>;
    destroy(): void;
}

class SimpleBufferReader implements BufferReader {

    protected _fd: number;
    protected _filePath: string;

    async init(filePath: string): Promise<void> {
        this._filePath = filePath;
        this._fd = await fsp.open(filePath, 'r');
    }

    async read(start: number, len: number): Promise<Buffer> {
        let buffer = Buffer.alloc(len);
        let readContents = await fsp.read(this._fd, buffer, 0, len, start);
        if(buffer.length > readContents[0]) {
            buffer = buffer.slice(0, readContents[0]);
        }
        return buffer;
    }

    async destroy(): Promise<void> {
        await fsp.close(this._fd);
    }

    async getEncodingStat(): Promise<EncodingStat> {
        let buffer: Buffer = Buffer.alloc(4);
        let bytesRead: [number, Buffer] = await fsp.read(this._fd, buffer, 0, 4, 0);
        if(bytesRead[0] < 4) {
            throw new Error(`The size of file ${this._filePath} cannot be less than 4 bytes.`);
        }
        return await detectEncodingInBuffer(buffer);
    }
}

class DzBufferReader extends SimpleBufferReader {

    private _dictZipParser: DictZipParser;

    async init(filePath: string): Promise<void> {
        super.init(filePath);
        this._dictZipParser = new DictZipParser(filePath);
    }

    async read(start: number, len: number): Promise<Buffer> {
        return await this._dictZipParser.parse(start, len);
    }

    async getEncodingStat(): Promise<EncodingStat> {
        let buffer: Buffer = await this._dictZipParser.parse(0, 4);
        if(buffer.length < 4) {
            throw new Error(`The size of file ${this._filePath} cannot be less than 4 bytes.`);
        }
        return await detectEncodingInBuffer(buffer);
    }
}

// register default BufferReaders
LineReader.register('.dsl', new SimpleBufferReader());
LineReader.register('.dz', new DzBufferReader());