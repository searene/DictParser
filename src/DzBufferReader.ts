import { DictZipParser } from "./dictionaries/dsl/DictZipParser";
import * as fse from "fs-extra";
import { EncodingStat, getEncodingInBuffer } from "./EncodingDetector";
import { BufferReader } from "./BufferReader";

export class DzBufferReader extends BufferReader {
  private _fd: number;
  private _filePath: string;
  private _dictZipParser: DictZipParser;

  public async open(filePath: string): Promise<number> {
    this._filePath = filePath;
    this._fd = await fse.open(filePath, "r");
    this._dictZipParser = new DictZipParser(this._fd);
    return this._fd;
  }

  public async read(start: number, len: number): Promise<Buffer> {
    return await this._dictZipParser.parse(start, len);
  }

  public async getEncodingStat(): Promise<EncodingStat> {
    const buffer: Buffer = await this._dictZipParser.parse(0, 4);
    if (buffer.length < 4) {
      throw new Error(`The size of file ${this._filePath} cannot be less than 4 bytes.`);
    }
    return await getEncodingInBuffer(buffer);
  }

  public async close(): Promise<void> {
    if (this._fd !== undefined) {
      await fse.close(this._fd);
    }
  }
}
