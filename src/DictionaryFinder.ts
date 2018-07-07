import { DSLDictionary } from "./dictionaries/dsl/DSLDictionary";
import { Dictionary, WordPosition } from "./Dictionary";
import { classifyFiles } from "./util/FileUtil";
import * as fse from "fs-extra";
import * as path from "path";
import { EventEmitter } from "events";
import { StarDict } from "./dictionaries/stardict/StarDict";
import { DictionaryType } from "./model/DictionaryType";

/**
 * Created by searene on 17-1-23.
 */

export class DictionaryFinder extends EventEmitter {

  // type => Dictionary
  private _dictionaries = new Map<string, Dictionary>();

  constructor() {
    super();

    this._dictionaries.set(DictionaryType.DSL, new DSLDictionary());
    this._dictionaries.set(DictionaryType.STAR_DICT, new StarDict());

    // emit dictionary contents being scanned
    for (const dict of this._dictionaries.values()) {
      dict.dictionaryScanProgressReporter.on(
        "name",
        (dictionaryName: string) => {
          this.emit("name", dictionaryName);
        }
      );
    }
  }

  public scan = async (dirs: string[]): Promise<void> => {
    for (const dir of dirs) {
      await this.scanSingleDir(dir);
    }
  };

  get dictionaries(): Map<string, Dictionary> {
    return this._dictionaries;
  }
  private scanSingleDir = async (dir: string): Promise<void> => {
    let absoluteFiles = (await fse.readdir(dir)).map(f => path.resolve(dir, f));
    if (absoluteFiles.length === 0) {
      return;
    }
    for (const dict of this._dictionaries.values()) {
      const dictionaryFiles = await dict.addDictionary(absoluteFiles);
      absoluteFiles = absoluteFiles.filter(f => dictionaryFiles.indexOf(f) === -1)
    }
    // scan other directories
    const dirs = await this.getDirs(absoluteFiles);
    await this.scan(dirs);
  }
  private getDirs = async (files: string[]): Promise<string[]> => {
    const dirsAndFiles = await classifyFiles(files);
    return dirsAndFiles.dirs;
  }
}

export interface WordForms {
  [word: string]: WordPosition;
}
