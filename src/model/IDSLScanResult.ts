import { IWordPos } from "./IWordPos";
import { IBaseIndex } from "./IBaseIndex";

export interface IDSLScanResult {
  dictName: string;
  wordIndex: IBaseIndex[];
}