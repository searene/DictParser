declare interface StreamZipOptions {
  file: string,
  storeEntries: boolean
}
declare class StreamZip {
  constructor(streamZipOptions: StreamZipOptions);
  public on(event: string, callback: Function): void;
  public stream(fileName: string, callback: Function): void;
  public close(): void;
}
declare module 'node-stream-zip' {
  export = StreamZip
}