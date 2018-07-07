import * as EventEmitter from "events";
import * as fse from "fs-extra";
import * as path from "path";
import * as readline from "readline";
import * as zlib from "zlib";
import { IFileCategory } from "../model/IFileCategory";
import { IFileWithStats } from "../model/IFileWithStats";

async function readdirRecursivelyInternal(dir: string): Promise<string[]> {
  const stat = await fse.stat(dir);
  const files: string[] = [];
  if (stat.isDirectory()) {
    files.push(dir);
    const subFiles: string[] = await fse.readdir(dir);
    for (let subFile of subFiles) {
      subFile = path.join(dir, subFile);
      (await readdirRecursivelyInternal(subFile)).forEach(file => {
        files.push(file);
      });
    }
  } else if (stat.isFile()) {
    files.push(dir);
  }
  return files;
}
async function readdirRecursively(dir: string): Promise<string[]> {
  const files: string[] = [];
  const subFiles: string[] = await fse.readdir(dir);
  for (let subFile of subFiles) {
    subFile = path.join(dir, subFile);
    (await readdirRecursivelyInternal(subFile)).forEach(file =>
      files.push(file)
    );
  }
  return files;
}

export async function readdirRecursivelyWithStat(
  dir: string
): Promise<IFileWithStats[]> {
  const result: Array<{ filePath: string; stat: fse.Stats }> = [];
  const files: string[] = await readdirRecursively(dir);
  for (const file of files) {
    const stat = await fse.stat(file);
    result.push({ filePath: file, stat });
  }
  return result;
}

export class FSHelper {
  public static removeFileIfExists(filename: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      fse
        .unlink(filename)
        .then(() => {
          console.log(`File ${filename} is removed`);
        })
        .catch(err => {
          if (err.code == "ENOENT") {
            // file doesn't exist, ignore the error.
            console.log(`File ${filename} doesn't exist, won't remove it.`);
          } else {
            // maybe we don't have enough permission
            reject(
              `Error occurred while trying to remove file ${filename}: ${
                err.message
              }`
            );
          }
        });
    });
  }
}

export class FileUtil {
  public static readFileAsLines = async (filename: string): Promise<string[]> => {
    return new Promise<string[]>((resolve, reject) => {
      if (FileUtil.fileCache.has(filename)) {
        resolve(FileUtil.fileCache.get(filename));
        return;
      }
      const lines: string[] = [];
      readline.createInterface({
        input: fse.createReadStream(filename),
        terminal: false
      }).on("line", line => {
        lines.push(line);
      }).on("close", () => {
        FileUtil.fileCache.set(filename, lines);
        resolve(lines);
        return;
      });
    });
  };
  // absoluteFilePath -> file contents in lines
  private static fileCache: Map<string, string[]> = new Map<string, string[]>();
}


export const decompressGzFile = async (gzFile: string): Promise<Buffer> => {
  return new Promise<Buffer>((resolve, reject) => {
    let buffer = Buffer.alloc(0);
    const gunzip = zlib.createGunzip();
    fse.createReadStream(gzFile).pipe(gunzip);
    gunzip.on("data", (data: Buffer) => {
      buffer = Buffer.concat([buffer, data]);
    }).on("end", () => {
      resolve(buffer);
    }).on("error", e => {
      reject(e);
    });
  });
};

export const classifyFiles = async (files: string[]): Promise<IFileCategory> => {
  const result = { dirs: [], normalFiles: [] } as IFileCategory;
  for (const f of files) {
    const isDir = (await fse.lstat(f)).isDirectory();
    if (isDir) {
      result.dirs.push(f);
    } else {
      result.normalFiles.push(f);
    }
  }
  return result;
};

export const getNormalFiles = async (absoluteFiles: string[]): Promise<string[]> => {
  const dirsAndNormalFiles = await classifyFiles(absoluteFiles);
  return dirsAndNormalFiles.normalFiles;
}

