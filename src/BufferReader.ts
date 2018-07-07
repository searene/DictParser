import { DictZipParser } from "./dictionaries/dsl/DictZipParser";
import { getEncodingInBuffer, getEncodingInFile, EncodingStat } from "./EncodingDetector";
import * as fse from "fs-extra";

export abstract class BufferReader {
  // call this method first before calling any other methods
  public abstract open(filePath: string): Promise<number>;

  public abstract read(start: number, len: number): Promise<Buffer>;
  public abstract getEncodingStat(): Promise<EncodingStat>;

  // call this method after you have done with all the work
  public abstract close(): Promise<void>;
}


