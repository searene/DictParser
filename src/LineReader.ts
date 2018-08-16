import * as EventEmitter from "events";
import { BufferReader } from "./BufferReader";
import { IBaseIndex } from "./model/IBaseIndex";
import { SimpleBufferReader } from "./SimpleBufferReader";
import { DzBufferReader } from "./DzBufferReader";

export class LineReader extends EventEmitter {
  private _filePath: string;
  private _bufferReader: BufferReader;

  // how many bytes to be read each time
  private _len: number;

  /**
   * @param filePath: path to file
   * @param bufferReader: BufferReader to use, SimpleBufferReader/DzBufferReader
   * @param len: how many bytes to be read each time
   */
  constructor(filePath: string, bufferReader?: BufferReader, len: number = 64 * 1024) {
    super();
    this._bufferReader = filePath.endsWith(".dz") ? new DzBufferReader() : new SimpleBufferReader();
    this._filePath = filePath;
    this._len = len;
  }

  public process() {
    setImmediate(() => {
      this.run();
    });
  }

  private async run(): Promise<void> {
    await this._bufferReader.open(this._filePath);

    const encodingStat = await this._bufferReader.getEncodingStat();
    const encoding: string = encodingStat.encoding;

    let dataProcessTotally: number = encodingStat.posAfterBom;

    // buffer read each time from file
    let bufferRead: Buffer = await this._bufferReader.read(dataProcessTotally, this._len);

    // data to be processed
    let data: Buffer = bufferRead;

    // the number of bytes that are processed each time
    let dataProcessedEachTime: number;

    let i = 1;
    while (bufferRead.length !== 0) {
      dataProcessedEachTime = this.emitLines(data, encoding, dataProcessTotally);
      dataProcessTotally += dataProcessedEachTime;

      // read 64KB
      bufferRead = await this._bufferReader.read(encodingStat.posAfterBom + i * this._len, this._len);

      // concat data that is not processed last time and data read this time
      data = Buffer.concat([data.slice(dataProcessedEachTime), bufferRead]);

      i++;
    }
    if (data.length > 0) {
      if (!data.toString(encoding).endsWith("\n")) {
        data = Buffer.concat([data, Buffer.from("\n", encoding)]);
      }
      this.emitLines(data, encoding, dataProcessTotally);
    }
    await this._bufferReader.close();
    this.emit("end");
  }

  private emitLines(buffer: Buffer, encoding: string, previousBytesRead: number): number {
    const s = buffer.toString(encoding);
    let pos = 0;
    let line: string = "";
    for (let i = 0; i < s.length; i++) {
      line += s[i];
      if (s[i] === "\r" && i + 1 < s.length && s[i + 1] === "\n") {
        i++;
        this.emit("line", {
          contents: this.removeCarriageReturn(line),
          offset: pos + previousBytesRead,
          size: Buffer.from(line, encoding).length
        } as IBaseIndex);
        pos += Buffer.from(line, encoding).length;
        line = "";
      } else if ((s[i] === "\r" && i + 1 < s.length && s[i + 1] !== "\n") || s[i] === "\n") {
        this.emit("line", {
          contents: this.removeCarriageReturn(line),
          offset: pos + previousBytesRead,
          size: Buffer.from(line, encoding).length
        } as IBaseIndex);
        pos += Buffer.from(line, encoding).length;
        line = "";
      }
    }
    return pos;
  }
  private removeCarriageReturn = (line: string): string => {
    return line.replace(/[\n\r]+$/g, "");
  };
}
