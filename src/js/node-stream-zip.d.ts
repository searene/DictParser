import { Stream } from "stream";
declare class StreamZip {
  public on: on;
  public stream: (entry: ZipEntry | string, cb: (err: Error, stm: Stream) => void) => void;
  public setEntries: (entries: ZipEntry[]) => ZipEntry[];
  constructor(options: StreamZipOptions);
}
interface StreamZipOptions {
  file: string;
  storeEntries?: boolean;
  buildEntries: boolean;
}
declare class ZipEntry {
  // version made by
  public verMade: number;
  // version needed to extract
  public version: number;
  // encrypt, decrypt flags
  public flags: number;
  // compression method
  public method: number;
  // modification time (2 bytes time, 2 bytes date)
  public time: number;
  // uncompressed file crc-32 value
  public crc: number;
  // compressed size
  public compressedSize: number;
  // uncompressed size
  public size: number;
  // filename length
  public fnameLen: number;
  // extra field length
  public extraLen: number;
  // file comment length
  public comLen: number;
  // volume number start
  public diskStart: number;
  // internal file attributes
  public inattr: number;
  // external file attributes
  public attr: number;
  // LOC header offset
  public offset: number;
  public headerOffset: number;
  public name: string;
  public isDirectory: boolean;
  public comment: string;
}
interface on {
  (event: "entry", cb: (entry: ZipEntry) => void): void;
  (event: "on", cb: () => void): void;
  (event: "error", cb: (error: Error) => void): void;
  (event: "ready", cb: () => void): void;
}
export { StreamZip, ZipEntry };
