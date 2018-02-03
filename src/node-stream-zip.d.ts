declare interface StreamZipOptions {
  file: string,
  storeEntries: boolean
}
declare class StreamZip {
  constructor(streamZipOptions: StreamZipOptions);
  on(event: string, callback: Function): void;
  stream(fileName: string, callback: Function): void;
  close(): void;
}
declare module 'node-stream-zip' {
  export = StreamZip
}