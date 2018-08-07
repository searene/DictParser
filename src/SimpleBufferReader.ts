import { BufferReader } from "./BufferReader";
import { EncodingStat, getEncodingInFile } from "./EncodingDetector";
import { OSSpecificImplementationGetter } from "./os-specific/OSSpecificImplementationGetter";

export class SimpleBufferReader extends BufferReader {
  private _fdOrFilePath: string | number;

  public async open(filePath: string): Promise<number | string> {
    this._fdOrFilePath = await OSSpecificImplementationGetter.fs.open(filePath, "r");
    return this._fdOrFilePath;
  }

  public async read(start: number, len: number): Promise<Buffer> {
    const readContents = await OSSpecificImplementationGetter.fs.read(this._fdOrFilePath, len, start);
    return readContents.buffer.slice(0, readContents.bytesRead);
  }

  public async close(): Promise<void> {
    if (typeof this._fdOrFilePath === "number") {
      await OSSpecificImplementationGetter.fs.close(this._fdOrFilePath);
    }
  }

  public async getEncodingStat(): Promise<EncodingStat> {
    return await getEncodingInFile(this._fdOrFilePath);
  }
}
