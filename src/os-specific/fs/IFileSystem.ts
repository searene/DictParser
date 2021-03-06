import { ReadResult } from "fs-extra";

export interface IFileSystem {
  isDir: (filePath: string) => Promise<boolean>;
  getSize: (filePath: string) => Promise<number>;
  pathExists: (filePath: string) => Promise<boolean>;
  createFile: (filePath: string) => Promise<void>;
  open: (path: string, flags: string | number, mode?: number) => Promise<number | string>;
  close: (fd: number) => Promise<void>;
  read: (fdOrFilePath: number | string, length: number, position: number) => Promise<ReadResult>;
  readWithBufferOffset: (fileId: number | string, buffer: Buffer, offset: number, length: number, position: number) => Promise<ReadResult>;
  readFile: (filePath: string) => Promise<Buffer>;
  readdir: (dir: string) => Promise<string[]>;
  writeFile: (filePath: string, contents: string) => Promise<void>;
  exists: (filePath: string) => Promise<boolean>;
}