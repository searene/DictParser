import * as EventEmitter from "events";
import * as path from "path";
import { BufferReader } from "./BufferReader";
import { IBaseIndex } from "./model/IBaseIndex";
import { SimpleBufferReader } from "./SimpleBufferReader";
import { DzBufferReader } from "./DzBufferReader";

export class LineReader extends EventEmitter {
  public static register(ext: string, bufferReader: BufferReader): void {
    this._bufferReaders.set(ext, bufferReader);
  }

  private static _bufferReaders: Map<string, BufferReader> = new Map<string, BufferReader>();
  private _filePath: string;

  // how many bytes to be read each time
  private _len: number;

  /**
   * @param filePath: path to file
   * @param len: how many bytes to be read each time
   */
  constructor(filePath: string, len: number = 64 * 1024) {
    super();
    this._filePath = filePath;
    this._len = len;
  }

  public process() {
    process.nextTick(() => {
      this.run();
    });
  }

  private async run(): Promise<void> {
    const ext: string = path.extname(this._filePath);
    const bufferReader = LineReader._bufferReaders.get(ext);
    if (bufferReader === undefined) {
      throw new Error(`No BufferReader is not registered for ${ext}.`);
    }

    await bufferReader.open(this._filePath);

    const encodingStat = await bufferReader.getEncodingStat();
    const encoding: string = encodingStat.encoding;

    let dataProcessTotally: number = encodingStat.posAfterBom;

    // buffer read each time from file
    let bufferRead: Buffer = await bufferReader.read(dataProcessTotally, this._len);

    // data to be processed
    let data: Buffer = bufferRead;

    // the number of bytes that are processed each time
    let dataProcessedEachTime: number;

    let i = 1;
    while (bufferRead.length !== 0) {
      dataProcessedEachTime = this.emitLines(data, encoding, dataProcessTotally);
      dataProcessTotally += dataProcessedEachTime;

      // read 64KB
      bufferRead = await bufferReader.read(encodingStat.posAfterBom + i * this._len, this._len);

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
    await bufferReader.close();
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

// register default BufferReaders
LineReader.register(".dsl", new SimpleBufferReader());
LineReader.register(".dz", new DzBufferReader());
