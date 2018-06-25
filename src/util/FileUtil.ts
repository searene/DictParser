import * as EventEmitter from "events";
import * as fse from "fs-extra";
import * as path from "path";

export interface IFileWithStats {
  filePath: string;
  stat: fse.Stats;
}

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
