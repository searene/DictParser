/* tslint:disable:no-bitwise */
import { OSSpecificImplementationGetter } from "../../os-specific/OSSpecificImplementationGetter";
import { Buffer } from "buffer";
import * as pako from "pako";

export class DictZipParser {
  // read 64KB each time
  private _readLen: number = 64 * 1024;

  private _header: DzHeader;
  private _fdOrFilePath: string | number;

  constructor(fdOrFilePath: number | string) {
    this._fdOrFilePath = fdOrFilePath;
  }

  public async parse(pos: number, len: number): Promise<Buffer> {
    if (this._header === undefined) {
      this._header = await this.getHeader();
    }
    const headerLength = this.getHeaderLen(this._header);

    const CHLEN: number = this._header.FEXTRA.FIELD.SUBFIELD.CHLEN.readUInt16LE(0);
    const CHCNT: number = this._header.FEXTRA.FIELD.SUBFIELD.CHCNT.readUInt16LE(0);
    const CHUNKS: Buffer = this._header.FEXTRA.FIELD.SUBFIELD.CHUNKS;

    const startChunkIndex = ~~(pos / CHLEN);
    const endChunkIndex = ~~((pos + len) / CHLEN);

    // startDecompressPos: headerLength + CHUNKS.readUInt16LE(0) + CHUNKS.readUInt16LE(1) + ... + CHUNKS.readUInt16LE(offset / CHLEN - 1)
    // endDecompressPos: headerLength + CHUNKS.readUInt16LE(0) + CHUNKS.readUInt16LE(1) + ... + CHUNKS.readUInt16LE((offset + size) / CHLEN)
    // include startDecompressPos, exclude endDecompressPos
    let startDecompressPos = headerLength;
    let endDecompressPos = headerLength;
    for (let i = 0; i <= ~~((pos + len) / CHLEN); i++) {
      if (CHUNKS.length <= i * 2) {
        // the specified length has surpassed the end of the
        // original file
        break;
      }
      if (i <= ~~(pos / CHLEN) - 1) {
        startDecompressPos += CHUNKS.readUInt16LE(i * 2);
      }
      endDecompressPos += CHUNKS.readUInt16LE(i * 2);
    }

    const compressedData = (await OSSpecificImplementationGetter.fs.read(this._fdOrFilePath, endDecompressPos - startDecompressPos, startDecompressPos)).buffer;
    if (compressedData.length === 0) {
      // no contents left
      return Buffer.alloc(0);
    }
    const decompressedData = new Buffer(pako.inflateRaw(new Uint8Array(compressedData)));
    return decompressedData.slice(pos - ~~(pos / CHLEN) * CHLEN, pos + len - ~~(pos / CHLEN) * CHLEN);
  }

  private async getHeader(): Promise<DzHeader> {
    const header = {} as DzHeader;

    // read the first 10 bytes
    const buffer: Buffer = (await OSSpecificImplementationGetter.fs.read(this._fdOrFilePath, 10, 0)).buffer;
    header.ID1 = buffer.slice(0, 1);
    header.ID2 = buffer.slice(1, 2);
    header.CM = buffer.slice(2, 3);
    header.FLG = buffer.slice(3, 4);
    header.MTIME = buffer.slice(4, 8);
    header.XFL = buffer.slice(8, 9);
    header.OS = buffer.slice(9, 10);
    if (header.ID1.readUInt8(0) !== parseInt("0x1F", 16) || header.ID2.readUInt8(0) !== parseInt("0x8B", 16)) {
      throw new Error(`Not a dictzip file`);
    }

    let pos = 10;

    // read FEXTRA if exists
    if ((header.FLG.readUInt8(0) & 4) !== 0) {
      // FEXTRA bit is set 1
      const XLEN: Buffer = (await OSSpecificImplementationGetter.fs.read(this._fdOrFilePath, 2, pos)).buffer;

      // read field in FEXTRA
      const field = (await OSSpecificImplementationGetter.fs.read(this._fdOrFilePath, XLEN.readUInt16LE(0), pos + 2)).buffer;
      const SI1 = field.slice(0, 1);
      const SI2 = field.slice(1, 2);
      const LEN = field.slice(2, 4);
      const subfield = field.slice(4, 4 + LEN.readUInt16LE(0));
      const VER = subfield.slice(0, 2);
      const CHLEN = subfield.slice(2, 4);
      const CHCNT = subfield.slice(4, 6);
      const CHUNKS = subfield.slice(6, CHCNT.readUInt16LE(0) * 2 + 7);
      if (String.fromCharCode(SI1.readUInt8(0)) !== "R" || String.fromCharCode(SI2.readUInt8(0)) !== "A") {
        throw new Error("Not a dictzip File, SI1 or SI2 doesn't match.");
      }
      header.FEXTRA = {
        XLEN,
        FIELD: {
          SI1,
          SI2,
          LEN,
          SUBFIELD: {
            VER,
            CHLEN,
            CHCNT,
            CHUNKS
          }
        }
      };
      pos = pos + XLEN.readUInt16LE(0) + 2;
    } else {
      throw new Error("FEXTRA field in the dictzip header is not set, maybe not a dictzip file?");
    }
    // read FNAME
    if ((header.FLG.readUInt8(0) & 8) !== 0) {
      header.FNAME = await this.readToZero(pos);
      pos += header.FNAME.length;
    } else {
      header.FNAME = Buffer.alloc(0);
    }
    // read FCOMMENTS
    if ((header.FLG.readUInt8(0) & 16) !== 0) {
      header.FCOMMENTS = await this.readToZero(pos);
      pos += header.FCOMMENTS.length;
    } else {
      header.FCOMMENTS = Buffer.alloc(0);
    }
    // read FHCRC
    if ((header.FLG.readUInt8(0) & 1) !== 0) {
      header.FHCRC = (await OSSpecificImplementationGetter.fs.read(this._fdOrFilePath, 2, pos)).buffer;
    } else {
      header.FHCRC = Buffer.alloc(0);
    }
    return header;
  }

  private async readToZero(startPos: number): Promise<Buffer> {
    const fnameStartPos = startPos;
    let buffer: Buffer = Buffer.alloc(0);
    while (true) {
      const bytes = await OSSpecificImplementationGetter.fs.read(this._fdOrFilePath, 16 * 1024, startPos);
      if (bytes.bytesRead === 0) {
        throw new Error("Cannot find zero bit");
      }
      let i;
      for (i = 0; i < bytes.bytesRead; i++) {
        startPos++;
        if (bytes.buffer.readUInt8(i) === 0) {
          // we find zero bit
          break;
        }
      }
      buffer = Buffer.concat([buffer, bytes.buffer.slice(0, i + 1)]);
      if (i < bytes.bytesRead) {
        // we found zero bit
        break;
      }
    }
    return buffer;
  }

  private getHeaderLen(header: DzHeader): number {
    return (
      header.ID1.length +
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
      header.FHCRC.length
    );
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
