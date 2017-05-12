import { Log } from './util/log';
import { Constant } from './universal';
import * as fsp from 'fs-promise';
import * as path from 'path';
import * as EventEmitter from 'events';

class MyEmitter extends EventEmitter {
    constructor() {
        super();
        let a: number = 1;
        process.nextTick(() => {
            this.emit('event', a)
        });
    }
}

let myEmitter = new MyEmitter();
myEmitter.on('event', (a: MyEmitter) => {
    console.log(a);
});