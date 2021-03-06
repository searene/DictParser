import { DSLDictionary } from "./dictionaries/dsl/DSLDictionary";
import { Dictionary, WordPosition } from "./Dictionary";
import { classifyFiles } from "./util/FileUtil";
import { OSSpecificImplementationGetter } from "./os-specific/OSSpecificImplementationGetter";
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
    for (const dict of Array.from(this._dictionaries.values())) {
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
      try {
        await this.scanSingleDir(dir);
      } catch (e) {
        console.error(e);
      }
    }
  };

  get dictionaries(): Map<string, Dictionary> {
    return this._dictionaries;
  }
  private scanSingleDir = async (dir: string): Promise<void> => {
    let absoluteFiles = (await OSSpecificImplementationGetter.fs.readdir(dir)).map(f => OSSpecificImplementationGetter.path.resolve(dir, f));
    if (absoluteFiles.length === 0) {
      return;
    }
    for (const dict of Array.from(this._dictionaries.values())) {
      const dictionaryFiles = await dict.addDictionary(absoluteFiles);
      absoluteFiles = absoluteFiles.filter(f => dictionaryFiles.indexOf(f) === -1)
    }
    // scan sub-directories
    const dirs = await this.getDirs(absoluteFiles);
    await this.scan(dirs);
  }
  private getDirs = async (files: string[]): Promise<string[]> => {
    const dirsAndFiles = await classifyFiles(files);
    return dirsAndFiles.dirPaths;
  }
}

export interface WordForms {
  [word: string]: WordPosition;
}
