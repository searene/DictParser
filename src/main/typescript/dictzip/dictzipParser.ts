/// <reference path="inflate.d.ts"/>

import * as fsp from "fs-promise";
import {jszlib_inflate_buffer} from "inflate";

/**
 * Created by searene on 2/9/17.
 */
export class DictZipParser {
    private dzFile = "";

    // the length of a chunk of data before compression
    // given in the dictzip header
    private chlen = 0;

    // how many chunck are preset before compression
    // given in the dictzip header
    private chcnt = 0;

    /* Each element in chunks consists of two parts:
     *   1. chpos: position of the i-th chunk after compression
     *   2. chsize: length of the i-th chunk after compression
     */
    private chunks: [number, number][] = [];

    constructor(dzFile: string) {
    	this.dzFile = dzFile;
    }

    /** Same as {@link #readFromFile(string, number, number, Function, [number, number][])},
     * only that it tries to use(or get) the default dzFile, gunzip and chunks.
     */
    public async read(pos: number, len: number): Promise<Buffer> {
        if (this.chunks.length == 0) {
            // we haven't read the header
            await this.readDictZipHeader(this.dzFile);
        }
        return await this.readFromFile(this.dzFile, pos, len, jszlib_inflate_buffer, this.chunks);
    }

    /** Read `len` bytes from position `pos`, return the read contents.
     *
     * @param dzFile dictzip file to be read
     * @param pos position(in the uncompressed file) to read from
     * @param len length(in the uncompressed file) to read
     * @param gunzip: function to unzip the compressed buffer
     * @param chunks: each element in chunks consists of two parts:
     *          1. chpos: position of the i-th chunk after compression
     *          2. chsize: length of the i-th chunk after compression
     */
    private async readFromFile(dzFile: string, pos: number, len: number, gunzip: Function, chunks: [number, number][]): Promise<Buffer> {

        // index of the first chunk to be read
        let firstChunk = Math.min(Math.floor(pos / this.chlen), this.chunks.length - 1);

        // index of the last chunk to be read
        let lastChunk = Math.min(Math.floor((pos + len) / this.chlen), this.chunks.length - 1);

        // offset of the beginning of the given position
        // relative to firstChunk before compression
        let offset = pos - firstChunk * this.chlen;

        let finish = offset + len;

        let inflatedBuffers: Buffer[] = [];

        for(let i = firstChunk; i <= lastChunk; i++) {
            let buffer = Buffer.allocUnsafeSlow(this.chunks[i][1]);

            let startOfChunk = 0;
            let sizeOfChunk = 0;

            let fd: number = await fsp.open(dzFile, 'r');
            startOfChunk = this.chunks[i][0];
            sizeOfChunk = this.chunks[i][1];
            let [bytesRead, contentsRead]: [number, Buffer] = await fsp.read(fd, buffer, 0, sizeOfChunk, startOfChunk);
            inflatedBuffers.push(gunzip(buffer.slice(0, bytesRead), 0, bytesRead));
            if(i == lastChunk) {
                return Buffer.concat(inflatedBuffers).slice(offset, finish);
            }
        }
    }

    /** Read the header of dzFile, return an array, each element of the array
     * consists of two parts:
     * 
     *   1. chpos: position of the i-th chunk after compression
     *   2. chsize: length of the i-th chunk after compression
     */
    private async readDictZipHeader(dzFile: string): Promise<[number, number][]> {

        // There are at most 65547 bytes from start to the end of the FEXTRA section
        let buffer: Buffer = Buffer.allocUnsafeSlow(65547);
        let fd: number = await fsp.open(dzFile, 'r');
        await fsp.read(fd, buffer, 0, buffer.length, 0);
        if(buffer[0] != 0x1F || buffer[1] != 0x8B) {
            throw new Error("Not a gzip header");
        }

        // get the FLG byte
        let FLG: number = buffer[3];

        // check if FEXTRA bit is set
        if((FLG & 4) == 0x00) {
            throw new Error("FEXTRA bit is not set, not a dictzip file!");
        }

        // check if SI1 and SI2 bits are correct
        const SI1: number = buffer[12];
        const SI2: number = buffer[13];
        const LEN: number = buffer[14];
        const DATA: Buffer = buffer.slice(15, 15 + LEN);
        if(SI1 != 82 || SI2 != 65) {
            throw new Error(`Not a dictzip header! SI1 or SI2 is not correct, expected: SI1 == 82, SI2 == 65, got SI1 == ${SI1}, SI2 == ${SI2}`);
        }
        return this.buildChunks(DATA);
    }

    private buildChunks(metadata: Buffer): [number, number][] {

        let chunks: [number, number][] = [];

        // chpos: position of the i-th chunk after dictzip
        let chpos = 0;

        // length of the i-th chunck after compression
        let tmpChlen = 0;

        const CHLEN = metadata.slice(2, 4).readInt16LE(0);
        const CHCNT = metadata.slice(4, 6).readInt16LE(0);
        for(let i = 0; i < CHCNT; i++) {
            tmpChlen = metadata.slice(2 * i + 6, 2 * i + 8).readInt16LE(0);
            chunks.push([chpos, tmpChlen]);
            chpos += tmpChlen;
        }
        return chunks;
    }
}