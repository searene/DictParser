import { DictZipParser } from "./dictionaries/dsl/DictZipParser";
import { EncodingStat, getEncodingInBuffer } from "./EncodingDetector";
import { BufferReader } from "./BufferReader";
import { OSSpecificImplementationGetter } from "./os-specific/OSSpecificImplementationGetter";

export class DzBufferReader extends BufferReader {
  private _fd: number;
  private _dictZipParser: DictZipParser;

  public async open(filePath: string): Promise<number> {
    const fdOrFilePath = await OSSpecificImplementationGetter.fs.open(filePath, "r");
    this._dictZipParser = new DictZipParser(fdOrFilePath);
    return this._fd;
  }

  public async read(start: number, len: number): Promise<Buffer> {
    return await this._dictZipParser.parse(start, len);
  }

  public async getEncodingStat(): Promise<EncodingStat> {
    const buffer: Buffer = await this._dictZipParser.parse(0, 4);
    if (buffer.length < 4) {
      throw new Error(`The size of file cannot be less than 4 bytes.`);
    }
    return await getEncodingInBuffer(buffer);
  }

  public async close(): Promise<void> {
    if (this._fd !== undefined) {
      await OSSpecificImplementationGetter.fs.close(this._fd);
    }
  }
}
