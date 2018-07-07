import { BufferReader } from "./BufferReader";
import * as fse from "fs-extra";
import { EncodingStat, getEncodingInFile } from "./EncodingDetector";

export class SimpleBufferReader extends BufferReader {
  private _filePath: string;
  private _fd: number;

  public async open(filePath: string): Promise<number> {
    this._filePath = filePath;
    this._fd = await fse.open(this._filePath, "r");
    return this._fd;
  }

  public async read(start: number, len: number): Promise<Buffer> {
    let buffer = Buffer.alloc(len);
    const readContents = await fse.read(this._fd, buffer, 0, len, start);
    if (buffer.length > readContents.bytesRead) {
      buffer = buffer.slice(0, readContents.bytesRead);
    }
    return buffer;
  }

  public async close(): Promise<void> {
    if (this._fd !== undefined) {
      await fse.close(this._fd);
    }
  }

  public async getEncodingStat(): Promise<EncodingStat> {
    return await getEncodingInFile(this._filePath);
  }
}
