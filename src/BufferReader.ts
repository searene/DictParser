import { IEncodingStat } from "./model/IEncodingStat";
import { Buffer } from "buffer";

export abstract class BufferReader {
  // call this method first before calling any other methods
  public abstract open(filePath: string): Promise<string | number>;

  public abstract read(start: number, len: number): Promise<Buffer>;
  public abstract getEncodingStat(): Promise<IEncodingStat>;

  // call this method after you have finished everything
  public abstract close(): Promise<void>;
}


