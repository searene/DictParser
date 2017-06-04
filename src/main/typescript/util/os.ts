import { Log } from './log';
import * as EventEmitter from 'events';
import * as fsp from 'fs-promise';
import * as path from 'path';
import * as log4js from 'log4js';

export class Walk extends EventEmitter {
    private log = Log.getLogger();
    constructor(dir: string) {
        super();
        process.nextTick(() => {
            this.walkthrough(dir, true);
        });
    }
    private async walkthrough(dir: string, topLevel: boolean): Promise<void> {
        try {
            let root: string;
            let files: string[];
            let stat = await fsp.stat(dir);
            if(stat.isDirectory) {
                files = await readdirRecursively(dir);
            } else {
                throw new Error(`File ${dir} should be a directory.`);
            }
            for(let i = 0; i < files.length; i++) {
                let file = files[i];
                let stat = await fsp.stat(file);
                if (stat.isDirectory()) {
                    this.emit('dir', file, stat);
                    process.nextTick(() => {
                        this.walkthrough(file, false);
                    })
                } else if (stat.isFile()) {
                    this.emit('file', file, stat);
                }
            }
            if(topLevel) {
                this.emit('end');
            }
        } catch(err) {
            this.emit('error', err);
            this.emit('end');
        }
    }
}

async function readdirRecursivelyInternal(dir: string): Promise<string[]> {
    let stat = await fsp.stat(dir);
    let files: string[] = [];
    if(stat.isDirectory()) {
        files.push(dir);
        let subFiles: string[] = await fsp.readdir(dir);
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
    let subFiles: string[] = await fsp.readdir(dir);
    for(let subFile of subFiles) {
        subFile = path.join(dir, subFile);
        (await readdirRecursivelyInternal(subFile)).forEach(file => files.push(file));
    }
    return files;
}

export async function readdirRecursivelyWithStat(dir: string): Promise<{filePath: string, stat: fsp.Stats}[]> {
    let result: {filePath: string, stat: fsp.Stats}[] = [];
    let files: string[] = await readdirRecursively(dir);
    for(let file of files) {
        let stat = await fsp.stat(file);
        result.push({filePath: file, stat: stat});
    }
    return result;
}

export class FSHelper {
    public static removeFileIfExists(filename: string): Promise<void> {
        let logger = Log.getLogger();
        return new Promise<void>((resolve, reject) => {
            fsp.unlink(filename)
                .then(() => {
                    logger.debug(`File ${filename} is removed`);
                })
                .catch((err) => {
                    if (err.code == 'ENOENT') {
                        // file doens't exist, ignore the error.
                        logger.debug(`File ${filename} doesn't exist, won't remove it.`);
                    } else {
                        // maybe we don't have enough permission
                        reject(`Error occurred while trying to remove file ${filename}: ${err.message}`);
                    }
                });
        });
    }
}

