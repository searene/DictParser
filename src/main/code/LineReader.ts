import { BufferReader, SimpleBufferReader, DzBufferReader } from './BufferReader';
import { getEncodingInBuffer, EncodingStat } from './EncodingDetector';
import { DictZipParser } from './dsl/dictzip/DictZipParser';
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
    constructor(filePath: string, len: number = 64 * 1024) {
        super();
        this._filePath = filePath;
        this._len = len;
    }

    process() {
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
    }

    private async run(): Promise<void> {
        await this.init();

        let encodingStat = await this._bufferReader.getEncodingStat(this._filePath);
        this._encoding = encodingStat.encoding;

        let dataProcessTotally: number = encodingStat.posAfterBom;

        // buffer read each time from file
        let bufferRead: Buffer = await this._bufferReader.read(this._filePath, dataProcessTotally, this._len);

        // data to be processed
        let data = bufferRead;

        // the number of bytes that are processed each time
        let dataProcessedEachTime: number;

        let i = 1;
        while(bufferRead.length != 0) {
            dataProcessedEachTime = this.emitLines(data, dataProcessTotally);
            dataProcessTotally += dataProcessedEachTime;

            // read 64KB
            bufferRead = await this._bufferReader.read(this._filePath, encodingStat.posAfterBom + i * this._len, this._len);

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
        this.emit('end');
    }

    private emitLines(buffer: Buffer, previousBytesRead: number): number {
        let s = buffer.toString(this._encoding);
        let pos = 0;
        let line: string = "";
        for(let i = 0; i < s.length; i++) {
            line += s[i];
            if(s[i] == '\r' && i + 1 < s.length && s[i + 1] == '\n') {
                i++;
                line = line + '\n';
                this.emit('line', {
                    line: line, 
                    pos: pos + previousBytesRead,
                    len: Buffer.from(line, this._encoding).length
                });
                pos += Buffer.from(line, this._encoding).length;
                line = "";
            } else if((s[i] == '\r' && i + 1 < s.length && s[i + 1] != '\n') || s[i] == '\n') {
                this.emit('line', {
                    line: line, 
                    pos: pos + previousBytesRead,
                    len: Buffer.from(line, this._encoding).length
                });
                pos += Buffer.from(line, this._encoding).length;
                line = "";
            }
        }
        return pos;
    }

    static register(ext: string, BufferReaderConstructor: new () => BufferReader): void {
        this._bufferReaders.set(ext, new BufferReaderConstructor());
    }
}


export interface LineStats {
    line: string;
    pos: number; // in binary instead of string
    len: number; // in binary instead of string
}

// register default BufferReaders
LineReader.register('.dsl', SimpleBufferReader);
LineReader.register('.dz', DzBufferReader);