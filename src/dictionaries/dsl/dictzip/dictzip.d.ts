export class DictZipFile {
    constructor(f: string, gunzip_func: Function);
    load(): Promise<void>;
    read(pos: number, len?: number): Promise<ArrayBuffer>;
}