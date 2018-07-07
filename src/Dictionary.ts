import { EventEmitter } from "events";
import { IDictionary } from "./model/IDictionary";

/**
 * Created by searene on 17-1-23.
 */

export abstract class Dictionary {
  protected _dictionaryScanProgressReporter: EventEmitter = new EventEmitter();

  public abstract async getDefinition(
    dictionary: IDictionary,
    pos: number,
    len: number
  ): Promise<string>;

  // all the files have to be absolute paths
  public abstract async addDictionary(absoluteFiles: string[]): Promise<string[]>;

  get dictionaryScanProgressReporter(): EventEmitter {
    return this._dictionaryScanProgressReporter;
  }
  protected isFileEndsWith = (f: string, suffixes: string[]): boolean => {
    for (const suffix of suffixes) {
      if (f.endsWith(suffix)) {
        return true;
      }
    }
    return false;
  };
}

export interface WordPosition {
  pos: number;
  len: number;
}

export interface WordTreeHTML {
  entry: string;
  definition: string;
}
