import { ReadResult } from "fs-extra";

export interface IFileSystem {
  isDir: (filePath: string) => Promise<boolean>;
  pathExists: (filePath: string) => Promise<boolean>;
  createFile: (filePath: string) => Promise<void>;
  open: (path: string | Buffer, flags: string | number, mode?: number) => Promise<number | string>;
  close: (fd: number) => Promise<void>;
  read: (fdOrFilePath: number | string, length: number, position: number) => Promise<ReadResult>;
  readFile: (filePath: string) => Promise<Buffer>;
  readdir: (dir: string) => Promise<string[]>;
  exists: (filePath: string) => Promise<boolean>;
}