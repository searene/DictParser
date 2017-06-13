import * as fsp from 'fs-promise';
import { DictZipFile } from './dictzip';
import { inflateBuffer } from './inflate';

export class DictZipParser {

    private _dzFile: string;

    constructor(dzFile: string) {
        this._dzFile = dzFile;
    }

    /** Parse given certain part of {@code _dzFile} back to its original contents
     * 
     * @param pos starting position in the original file
     * @param len length to be parsed in the original file, the whole file will
     *      be parsed if this parameter is omitted
     */
    async parse(pos: number, len?: number): Promise<Buffer> {
        let dictZipFile = new DictZipFile(this._dzFile, inflateBuffer);
        await dictZipFile.load();

        let parsedArrayBuffer: ArrayBuffer = len == undefined ? 
                await dictZipFile.read(pos)
              : await dictZipFile.read(pos, len);

        return Buffer.from(parsedArrayBuffer);
    }
}
