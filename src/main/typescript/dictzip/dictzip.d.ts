export class DictZipFile {
    constructor(f: Blob, gunzip_func: Function);
    load(): Promise<void>;
    read(pos: number, len: number): Promise<ArrayBuffer>;
}