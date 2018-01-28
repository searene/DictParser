import { Log } from './log';
import * as EventEmitter from 'events';
import * as fse from 'fs-extra';
import * as path from 'path';
import * as log4js from 'log4js';

export interface FileWithStats {
  filePath: string,
  stat: fse.Stats,
}

async function readdirRecursivelyInternal(dir: string): Promise<string[]> {
    let stat = await fse.stat(dir);
    let files: string[] = [];
    if(stat.isDirectory()) {
        files.push(dir);
        let subFiles: string[] = await fse.readdir(dir);
        for(let subFile of subFiles) {
            subFile = path.join(dir, subFile);
            (await readdirRecursivelyInternal(subFile)).forEach((file) => {
                files.push(file);
            });
        }
    } else if(stat.isFile()) {
        files.push(dir);
    }
    return files;
}
async function readdirRecursively(dir: string): Promise<string[]> {
    let files: string[] = [];
    let subFiles: string[] = await fse.readdir(dir);
    for(let subFile of subFiles) {
        subFile = path.join(dir, subFile);
        (await readdirRecursivelyInternal(subFile)).forEach(file => files.push(file));
    }
    return files;
}

export async function readdirRecursivelyWithStat(dir: string): Promise<FileWithStats[]> {
    let result: {filePath: string, stat: fse.Stats}[] = [];
    let files: string[] = await readdirRecursively(dir);
    for(let file of files) {
        let stat = await fse.stat(file);
        result.push({filePath: file, stat: stat});
    }
    return result;
}

export class FSHelper {
    public static removeFileIfExists(filename: string): Promise<void> {
        let logger = Log.getLogger();
        return new Promise<void>((resolve, reject) => {
            fse.unlink(filename)
                .then(() => {
                    logger.debug(`File ${filename} is removed`);
                })
                .catch((err) => {
                    if (err.code == 'ENOENT') {
                        // file doesn't exist, ignore the error.
                        logger.debug(`File ${filename} doesn't exist, won't remove it.`);
                    } else {
                        // maybe we don't have enough permission
                        reject(`Error occurred while trying to remove file ${filename}: ${err.message}`);
                    }
                });
        });
    }
}

