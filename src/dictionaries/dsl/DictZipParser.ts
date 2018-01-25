import * as fsp from 'fs-promise';
import { inflateBuffer } from './inflate';

export class DictZipParser {

    // read 64KB each time
    private _readLen: number = 64 * 1024;

    private _header: DzHeader;
    private _fd: number

    constructor(fd: number) {
        this._fd = fd;
    }

    async parse(pos: number, len: number): Promise<Buffer> {
        if(this._header == undefined) {
            this._header = await this.getHeader();
        }
        let headerLength = this.getHeaderLen(this._header);

        let CHLEN: number = this._header.FEXTRA.FIELD.SUBFIELD.CHLEN.readUInt16LE(0);
        let CHCNT: number = this._header.FEXTRA.FIELD.SUBFIELD.CHCNT.readUInt16LE(0);
        let CHUNKS: Buffer = this._header.FEXTRA.FIELD.SUBFIELD.CHUNKS;

        let startChunkIndex = ~~(pos / CHLEN);
        let endChunkIndex = ~~((pos + len) / CHLEN);

        // startDecompressPos: headerLength + CHUNKS.readUInt16LE(0) + CHUNKS.readUInt16LE(1) + ... + CHUNKS.readUInt16LE(pos / CHLEN - 1)
        // endDecompressPos: headerLength + CHUNKS.readUInt16LE(0) + CHUNKS.readUInt16LE(1) + ... + CHUNKS.readUInt16LE((pos + len) / CHLEN)
        // include startDecompressPos, exclude endDecompressPos
        let startDecompressPos = headerLength;
        let endDecompressPos = headerLength;
        for(let i = 0; i <= ~~((pos + len) / CHLEN); i++) {
            if(CHUNKS.length <= i * 2) {
                // the specified length has surpassed the end of the
                // original file
                break;
             }
            if(i <= ~~(pos / CHLEN) - 1) {
                startDecompressPos += CHUNKS.readUInt16LE(i)
            }
            endDecompressPos += CHUNKS.readUInt16LE(i);
        }

        let compressedData: Buffer = Buffer.alloc(endDecompressPos - startDecompressPos);
        await fsp.read(this._fd, compressedData, 0, compressedData.length, startDecompressPos);

        let decompressedData = inflateBuffer(new Uint8Array(compressedData));
        return decompressedData.slice(pos - ~~(pos / CHLEN) * CHCNT, pos + len - ~~(pos / CHLEN) * CHCNT);
    }
    
    private async getHeader(): Promise<DzHeader> {
        let header = <DzHeader> {};
        
        // read the first 10 bytes
        let buffer = Buffer.alloc(10);
        await fsp.read(this._fd, buffer, 0, buffer.length, 0);
        header.ID1 = buffer.slice(0, 1);
        header.ID2 = buffer.slice(1, 2);
        header.CM = buffer.slice(2, 3);
        header.FLG = buffer.slice(3, 4);
        header.MTIME = buffer.slice(4, 8);
        header.XFL = buffer.slice(8, 9);
        header.OS = buffer.slice(9, 10);
        if(header.ID1.readUInt8(0) != parseInt('0x1F', 16) || header.ID2.readUInt8(0) != parseInt('0x8B', 16)) {
            throw new Error(`Not a dictzip file`);
        }

        let pos = 10;

        // read FEXTRA if exists
        if((header.FLG.readUInt8(0) & 4) != 0) {
            // FEXTRA bit is set 1
            let XLEN = Buffer.alloc(2);
            await fsp.read(this._fd, XLEN, 0, XLEN.length, pos);

            // read field in FEXTRA
            let FIELD = Buffer.alloc(XLEN.readUInt16LE(0));
            await fsp.read(this._fd, FIELD, 0, FIELD.length, pos + 2);
            let SI1 = FIELD.slice(0, 1);
            let SI2 = FIELD.slice(1, 2);
            let LEN = FIELD.slice(2, 4);
            let SUBFIELD = FIELD.slice(4, 4 + LEN.readUInt16LE(0));
            let VER = SUBFIELD.slice(0, 2);
            let CHLEN = SUBFIELD.slice(2, 4);
            let CHCNT = SUBFIELD.slice(4, 6);
            let CHUNKS = SUBFIELD.slice(6, CHCNT.readUInt16LE(0) + 7);
            if(String.fromCharCode(SI1.readUInt8(0)) != 'R' || String.fromCharCode(SI2.readUInt8(0)) != 'A') {
                throw new Error("Not a dictzip File, SI1 or SI2 don't match.");
            }
            header.FEXTRA = {
                XLEN: XLEN,
                FIELD: {
                    SI1: SI1,
                    SI2: SI2,
                    LEN: LEN,
                    SUBFIELD: {
                        VER: VER,
                        CHLEN: CHLEN,
                        CHCNT: CHCNT,
                        CHUNKS: CHUNKS
                    }
                }
            };
            pos = pos + XLEN.readUInt16LE(0) + 2;
        } else {
            throw new Error("FEXTRA field in the dictzip header is not set, maybe not a dictzip file?");
        }
        // read FNAME
        if((header.FLG.readUInt8(0) & 8) != 0) {
            header.FNAME = await this.readToZero(this._fd, pos);
            pos += header.FNAME.length;
        } else {
            header.FNAME = Buffer.alloc(0);
        }
        // read FCOMMENTS
        if((header.FLG.readUInt8(0) & 16) != 0) {
            header.FCOMMENTS = await this.readToZero(this._fd, pos);
            pos += header.FCOMMENTS.length;
        } else {
            header.FCOMMENTS = Buffer.alloc(0);
        }
        // read FHCRC
        if((header.FLG.readUInt8(0) & 1) != 0) {
            header.FHCRC = Buffer.alloc(2);
            await fsp.read(this._fd, header.FHCRC, 0, 2, pos);
        } else {
            header.FHCRC = Buffer.alloc(0);
        }
        return header;
    }

    private async readToZero(fd: number, startPos: number): Promise<Buffer> {
        let fnameStartPos = startPos;
        let buffer: Buffer = Buffer.alloc(0);
        while(true) {
            let bytes = await fsp.read(this._fd, Buffer.alloc(16 * 1024), 0, 16 * 1024, startPos);
            if(bytes[0] == 0) {
                throw new Error("Cannot find zero bit");
            }
            let i;
            for(i = 0; i < bytes[0]; i++) {
                startPos++;
                if(bytes[1].readUInt8(i) == 0) {
                    // we find zero bit
                    break;
                }
            }
            buffer = Buffer.concat([buffer, bytes[1].slice(0, i + 1)]);
            if(i < bytes[0]) {
                // we found zero bit
                break;
            }
        }
        return buffer;
    }

    private getHeaderLen(header: DzHeader): number {
        return header.ID1.length +
               header.ID2.length +
               header.CM.length +
               header.FLG.length +
               header.MTIME.length +
               header.XFL.length +
               header.OS.length +
               header.FEXTRA.XLEN.length +
               header.FEXTRA.FIELD.SI1.length +
               header.FEXTRA.FIELD.SI2.length +
               header.FEXTRA.FIELD.LEN.length +
               header.FEXTRA.FIELD.SUBFIELD.VER.length +
               header.FEXTRA.FIELD.SUBFIELD.CHCNT.length +
               header.FEXTRA.FIELD.SUBFIELD.CHLEN.length +
               header.FEXTRA.FIELD.SUBFIELD.CHUNKS.length +
               header.FNAME.length +
               header.FCOMMENTS.length +
               header.FHCRC.length;
    }
}

export interface DzHeader {
    ID1: Buffer;
    ID2: Buffer;
    CM: Buffer;
    FLG: Buffer;
    MTIME: Buffer;
    XFL: Buffer;
    OS: Buffer;
    FEXTRA: FEXTRA;
    FNAME: Buffer;
    FCOMMENTS: Buffer;
    FHCRC: Buffer;
}

export interface FEXTRA {
    XLEN: Buffer;
    FIELD: FIELD;
}

export interface FIELD {
    SI1: Buffer;
    SI2: Buffer;
    LEN: Buffer;
    SUBFIELD: SUBFIELD;
}

export interface SUBFIELD {
    VER: Buffer;
    CHLEN: Buffer;
    CHCNT: Buffer;
    CHUNKS: Buffer;
}