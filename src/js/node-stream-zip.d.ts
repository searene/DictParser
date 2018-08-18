// import { Stream } from "stream";
declare class StreamZip {
  public on: on;
  public inflate: (entry: ZipEntry) => Promise<Buffer>;
  constructor(options: StreamZipOptions);
}
interface StreamZipOptions {
  file: string;
  storeEntries?: boolean;
  buildEntries: boolean;
}
declare class ZipEntry {
  // LOC header offset
  public offset: number;
  // name of the file inside zip
  public name: string;
  // is it a file or directory
  public isDirectory: boolean;
}
interface on {
  (event: "entry", cb: (entry: ZipEntry) => void): void;
  (event: "on", cb: () => void): void;
  (event: "error", cb: (error: Error) => void): void;
  (event: "ready", cb: () => void): void;
}
export { StreamZip, ZipEntry };
