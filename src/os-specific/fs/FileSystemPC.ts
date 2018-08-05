import * as fse from "fs-extra";
import { IFileSystem } from "./IFileSystem";

export class FileSystemPC implements IFileSystem {
  public isDir = async (filePath: string): Promise<boolean> => {
    return (await fse.lstat(filePath)).isDirectory();
  }
}
