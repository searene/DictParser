import * as fse from "fs-extra";
import { pathExists, ReadResult } from "fs-extra";
import { IFileSystem } from "../..";

export class FileSystemPC implements IFileSystem {
  public isDir = async (filePath: string): Promise<boolean> => {
    return (await fse.lstat(filePath)).isDirectory();
  };
  public createFile = async (filePath: string): Promise<void> => {
    await fse.createFile(filePath);
  };
  public pathExists = async (filePath: string): Promise<boolean> => {
    return await pathExists(filePath);
  };
  public open = async (path: string, flags: string | number, mode?: number): Promise<number> => {
    return await fse.open(path, flags, mode);
  };
  public close = async (fd: number): Promise<void> => {
    return await fse.close(fd);
  };
  public read = async (fdOrFilePath: number | string, length: number, position: number): Promise<ReadResult> => {
    if (typeof fdOrFilePath === "string") {
      throw new Error("fdOrFilePath must be a number on PC");
    }
    return await fse.read(fdOrFilePath, Buffer.alloc(length), 0, length, position);
  };
  public readFile = async (filePath: string): Promise<Buffer> => {
    return await fse.readFile(filePath);
  };
  public readdir = async (dir: string): Promise<string[]> => {
    return await fse.readdir(dir);
  };
  public exists = async (filePath: string): Promise<boolean> => {
    return await fse.pathExists(filePath);
  };
  public getSize = async (filePath: string): Promise<number> => {
    const stat = await fse.lstat(filePath);
    return stat.size;
  };
  public readWithBufferOffset = async (
    fd: number,
    buffer: Buffer,
    offset: number,
    length: number,
    position: number
  ): Promise<ReadResult> => {
    return await fse.read(fd, buffer, offset, length, position);
  };
}
