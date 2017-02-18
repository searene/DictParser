import EventEmitter = require('events');
import fsp = require('fs-promise');
import path = require('path');

export class Walk extends EventEmitter {
    constructor(dir: string) {
        super();
        process.nextTick(() => {
            this.walkthrough(dir, true);
        });
    }
    private walkthrough(dir: string, topLevel: boolean): void {
        let root: string;
        fsp.exists(dir)
            .then((exist) => {
                if(exist) {
                    return fsp.stat(dir);
                } else {
                    this.emit('error', new Error(`File ${dir} doesn't exist.`));
                    this.emit('end');
                }
            })
            .then((stat) => {
                if(stat.isDirectory) {
                    return fsp.readdir(dir);
                } else {
                    this.emit('error', new Error(`File ${dir} should be a directory.`));
                    this.emit('end');
                }
            })
            .then(files => {
                files.forEach((file, index) => {
                    fsp.stat(file)
                        .then((stat) => {
                            if(stat.isDirectory) {
                                this.emit('dir', file, stat);
                                process.nextTick(() => {
                                    this.walkthrough(file, false);
                                })
                            } else if(stat.isFile) {
                                this.emit('file', file, stat);
                            }
                            if(index == files.length - 1 && topLevel) {
                                this.emit('end');
                            }
                        })
                });
            })
            .catch((err) => {
                this.emit('error', err);
            });
    }
}