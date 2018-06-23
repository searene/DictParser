import { ResourceManager } from "./ResourceManager";
import { DSLDictionary } from "./dictionaries/dsl/DSLDictionary";
import { DictionaryStats } from "./Dictionary";
import { JSON_DB_PATH, ROOT_PATH, WORD_FORMS_PATH } from "./Constant";
import { Dictionary, WordPosition } from "./Dictionary";
import { readdirRecursivelyWithStat, FileWithStats } from "./util/FileUtil";
import { Option, option, some, none } from "ts-option";
import * as fse from "fs-extra";
import * as path from "path";
import * as ReadLine from "readline";
import { EventEmitter } from "events";
import {ZipReader} from "./util/ZipReader";

/**
 * Created by searene on 17-1-23.
 */

export class DictionaryFinder extends EventEmitter {
  constructor() {
    super();

    // emit dictionary name being scanned
    for (const [dictName, dictionary] of Array.from(
      DictionaryFinder._dictionaries.entries()
    )) {
      dictionary.dictionaryScanProgressReporter.on(
        "name",
        (dictionaryName: string) => {
          this.emit("name", dictionaryName);
        }
      );
    }
  }


  private static _dictionaries: Map<string, Dictionary> = new Map<
    string,
    Dictionary
  >();

  private _dictMapList: DictMap[];

  public static register(dictName: string, Dictionary: new () => Dictionary): void {
    const dictionary = new Dictionary();
    this._dictionaries.set(dictName, new Dictionary());
  }

  /** Walk through all files in <i>dir</i> recursively, and look for
   * dictionary definition files(e.g. dz, dsl), add it along with
   * its {@code Dictionary} and resourceHolder to the result array.
   */
  public async scan(
    dirs: string | string[],
    jsonDbPath: string,
    sqliteDbPath: string,
    wordFormsFolder: string
  ): Promise<DictMap[]> {
    // DictMap without resourceHolder
    const dictMapList: DictMap[] = [];
    let files: FileWithStats[] = [];
    for (const dir of Array.isArray(dirs) ? dirs : [dirs]) {
      files = files.concat(await readdirRecursivelyWithStat(dir));
    }
    for (const file of files) {
      if (file.stat.isDirectory()) { continue; }

      const ext = path.extname(file.filePath);
      for (const [dictName, dictionary] of Array.from(
        DictionaryFinder._dictionaries.entries()
      )) {
        // we find a dictionary
        if (dictionary.dictionarySuffixes.indexOf(ext) > -1) {
          // get resourceHolder
          const resource: Option<string> = await this.getResource(
            file.filePath,
            files.map(file => file.filePath),
            dictionary.resourceHolderSuffixes,
            dictionary.resourceFileSuffixes
          );

          // build index
          const dictStats: DictionaryStats = await dictionary.getDictionaryStats(
            file.filePath
          );

          // add it to dictMapList
          dictMapList.push({
            dict: {
              dictPath: file.filePath,
              dictType: dictName,
              resourceHolder: resource.isEmpty ? "" : resource.get
            },
            meta: dictStats.meta,
            originalWords: dictStats.indexMap,
            transformedWords: {}
          });
        }
      }
    }

    // add word transformations
    await this.addTransformedWords(dictMapList, wordFormsFolder);

    // save to db
    await fse.writeFile(jsonDbPath, JSON.stringify(dictMapList), {
      encoding: "utf8"
    });

    // build index for resource holders
    for (const dictMap of dictMapList) {
      await this.buildResourceIndex(dictMap.dict.resourceHolder, sqliteDbPath);
    }

    this._dictMapList = dictMapList;
    return dictMapList;
  }

  private async addTransformedWords(
    dictMapList: DictMap[],
    wordFormsFolder: string
  ): Promise<void> {
    // word forms
    const wordFormsFiles = await fse.readdir(wordFormsFolder);
    for (let i = 0; i < wordFormsFiles.length; i++) {
      const wordFormsFile = path.join(wordFormsFolder, wordFormsFiles[i]);
      if (!(await fse.pathExists(wordFormsFile))) {
        console.log(`${wordFormsFile} doesn't exist, skip`);
        continue;
      }
      const lineReader = ReadLine.createInterface({
        input: fse.createReadStream(wordFormsFile)
      });
      lineReader.on("line", line => {
        const words: string[] = line.split(/[\s,:]+/);

        const originalWord = words[0];
        const transformedWords = words.slice(1);

        for (const transformedWord of transformedWords) {
          // check each dictionary
          for (const dictMap of dictMapList) {
            if (
              dictMap.originalWords.hasOwnProperty(originalWord) &&
              !dictMap.transformedWords.hasOwnProperty(transformedWord)
            ) {
              dictMap.transformedWords[transformedWord] =
                dictMap.originalWords[originalWord];
            }
          }
        }
      });
      return new Promise<void>((resolve, reject) => {
        lineReader.on("close", () => {
          resolve();
        });
      });
    }
  }

  static get dictionaries(): Map<string, Dictionary> {
    return DictionaryFinder._dictionaries;
  }

  /** <p>Look for resourceHolder file/directory in <i>baseDirectory</i>, the rules are as follows.</p>
   * 1. If we find a file whose extension is in <i>resourceHolderSuffixes</i>
   *    and its basename(filename without extension) is the same as
   *    <i>dictFileName</i>'s basename, this is exactly the resourceHolder
   *    we need, return it.
   * 2. If we cannot find such a file mentioned above, try to find the first file
   *    whose extension is in <i>resourceHolderSuffixes</i>, return it.
   * 3. If we still cannot find it, try to find a subfolder in <i>baseDirectory</i>
   *    containing at least one file with the extension in <i>resourceFileSuffixes</i>
   *    return the directory
   *
   * @param dictFilePath absolute path to the dictionary file
   * @param baseDirectory the directory where the dictionary definition file
   *        (such as .dsl) lies
   * @param resourceHolderSuffixes extensions of the archived resourceHolder file(e.g. zip)
   * @param resourceFileSuffixes resourceHolder extensions(e.g. wmv)
   * @returns path to the resourceHolder archive/directory represented in string
   */
  private async getResource(
    dictFilePath: string,
    resourceFiles: string[],
    resourceHolderSuffixes: string[],
    resourceFileSuffixes: string[]
  ): Promise<Option<string>> {
    const candidates: Array<{ file: string; priority: number }> = [];

    const dictFileBaseName: string = path.basename(dictFilePath).split(".")[0];
    const baseDir: string = path.dirname(dictFilePath);

    for (const resourceFile of resourceFiles) {
      if (resourceFile == dictFilePath) { continue; }

      const isDir: boolean = (await fse.stat(resourceFile)).isDirectory();
      const isSameDir: boolean =
        path.dirname(dictFilePath) == path.dirname(resourceFile);
      const isSameBaseName: boolean =
        path.basename(resourceFile).split(".")[0] == dictFileBaseName;
      const isResourceHolder: boolean =
        !isDir &&
        resourceHolderSuffixes.indexOf(path.extname(resourceFile)) > -1;
      const isResourceFile: boolean = await (async (): Promise<boolean> => {
        if (!isDir) { return false; }
        const files: string[] = await fse.readdir(resourceFile);
        for (const file of files) {
          if (resourceFileSuffixes.indexOf(path.extname(file)) > -1) {
            return true;
          }
        }
        return false;
      })();

      if (isSameDir && isSameBaseName && isResourceHolder) {
        candidates.push({ file: resourceFile, priority: 1 });
        break;
      } else if (isSameDir && isResourceHolder) {
        candidates.push({ file: resourceFile, priority: 2 });
      } else if (isSameDir && isResourceFile) {
        candidates.push({ file: resourceFile, priority: 3 });
      }
    }
    candidates.sort((a, b) => {
      return a.priority - b.priority;
    });
    return candidates.length == 0 ? none : option(candidates[0].file);
  }
  private buildResourceIndex = async (resourceHolder: string, sqliteDbPath: string) => {
    if (path.extname(resourceHolder) === ".zip") {
      const zipReader = new ZipReader(sqliteDbPath, resourceHolder);
      await zipReader.buildZipIndex()
    }
  };
}

DictionaryFinder.register("dsl", DSLDictionary);

export interface IDictionary {
  // absolute path to main dictionary file
  dictPath: string;

  // e.g. dsl
  dictType: string;

  // path to resourceHolder file
  resourceHolder: string;
}

export interface DictMap {
  // basic dictionary information
  dict: IDictionary;

  // meta data
  meta: Meta;

  // pos of words in the dictionary
  originalWords: IndexMap;

  // pos of transformed words in the dictionary
  transformedWords: IndexMap;
}

export interface IndexMap {
  [word: string]: WordPosition;
}

export interface Meta {
  [metaKey: string]: string;
}

export interface WordForms {
  [word: string]: WordPosition;
}
