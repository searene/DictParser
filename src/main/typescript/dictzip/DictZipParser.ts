import * as fsp from 'fs-promise';
import { DictZipFile } from './dictzip';
import { inflateBuffer } from './inflate';

export default class DictZipParser {

    private _dzFile: string;

    constructor(dzFile: string) {
        this._dzFile = dzFile;
    }

    async parse(pos: number, len: number): Promise<Buffer> {
        let fileContents: Buffer = await fsp.readFile(this._dzFile);
        let dictZipFile = new DictZipFile(fileContents., inflateBuffer);
        await dictZipFile.load();
        let parsedArrayBuffer: ArrayBuffer = await dictZipFile.read(pos, len);
        return Buffer.from(parsedArrayBuffer);
    }
}
