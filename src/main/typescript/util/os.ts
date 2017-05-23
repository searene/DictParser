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
    private walkthrough(dir: string, topLevel: boolean): void {
        let root: string;
        fsp.stat(dir)
            .then((stat) => {
                if (stat.isDirectory) {
                    return fsp.readdir(dir);
                } else {
                    throw new Error(`File ${dir} should be a directory.`);
                }
            })
            .then(files => {
                files.forEach((file, index) => {
                    fsp.stat(file)
                        .then((stat) => {
                            if (stat.isDirectory) {
                                this.emit('dir', file, stat);
                                process.nextTick(() => {
                                    this.walkthrough(file, false);
                                })
                            } else if (stat.isFile) {
                                this.emit('file', file, stat);
                            }
                            if (index == files.length - 1 && topLevel) {
                                this.emit('end');
                            }
                        })
                });
            })
            .catch((err) => {
                this.emit('error', err);
                this.emit('end');
            });
    }
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

