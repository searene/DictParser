import * as fse from "fs-extra";
import * as zlib from "zlib";
import { IFileCategory } from "../model/IFileCategory";
import { LineReader } from "../LineReader";
import { SimpleBufferReader } from "../SimpleBufferReader";
import { IBaseIndex } from "../model/IBaseIndex";
import { OSSpecificImplementationGetter } from "../os-specific/OSSpecificImplementationGetter";

export class FileUtil {
  public static readFileAsLines = async (filename: string): Promise<string[]> => {
    return new Promise<string[]>((resolve, reject) => {
      if (FileUtil.fileCache.has(filename)) {
        resolve(FileUtil.fileCache.get(filename));
        return;
      }
      const lines: string[] = [];
      const lineReader = new LineReader(filename, new SimpleBufferReader());
      lineReader.on("line", (line: IBaseIndex) => {
        lines.push(line.contents);
      }).on("end", () => {
        FileUtil.fileCache.set(filename, lines);
        resolve(lines);
      });
      lineReader.process();
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
  const result = { dirPaths: [], normalFilePaths: [] } as IFileCategory;
  for (const f of files) {
    const isDir = await OSSpecificImplementationGetter.fs.isDir(f);
    if (isDir) {
      result.dirPaths.push(f);
    } else {
      result.normalFilePaths.push(f);
    }
  }
  return result;
};

export const getNormalFiles = async (absoluteFiles: string[]): Promise<string[]> => {
  const dirsAndNormalFiles = await classifyFiles(absoluteFiles);
  return dirsAndNormalFiles.normalFilePaths;
}

