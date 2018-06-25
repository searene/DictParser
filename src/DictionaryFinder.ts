import { ResourceManager } from "./ResourceManager";
import { DSLDictionary } from "./dictionaries/dsl/DSLDictionary";
import { DictionaryStats } from "./Dictionary";
import { JSON_DB_PATH, ROOT_PATH, WORD_FORMS_PATH } from "./Constant";
import { Dictionary, WordPosition } from "./Dictionary";
import { readdirRecursivelyWithStat, IFileWithStats } from "./util/FileUtil";
import { Option, option, some, none } from "ts-option";
import * as fse from "fs-extra";
import * as path from "path";
import * as ReadLine from "readline";
import { EventEmitter } from "events";
import { ZipReader } from "./util/ZipReader";
import { Sqlite } from "./util/Sqlite";
import { IFileCategory } from "./model/IFileCategory";
import { StarDict } from "./dictionaries/stardict/StarDict";

/**
 * Created by searene on 17-1-23.
 */

export class DictionaryFinder extends EventEmitter {

  private _dictionaries: Dictionary[] = [
    new DSLDictionary(),
    new StarDict()
  ];

  constructor() {
    super();

    // emit dictionary name being scanned
    for (const dict of this._dictionaries) {
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
      const files = (await fse.readdir(dir)).map(f => path.resolve(dir, f));
      if (files.length === 0) {
        continue;
      }

      // split files into dirs and normal files
      const fileCategory = await this.categorizeFiles(files);

      const directories = fileCategory.dirs;
      const normalFiles = fileCategory.normalFiles;

      for (const dict of this._dictionaries) {
        const mainDictFiles = dict.getMainDictFiles(normalFiles);
        await this.addDictionaries(dict, mainDictFiles);
      }
    }
  };

  /** Walk through all files in <i>dir</i> recursively, and look for
   * dictionary definition files(e.g. dz, dsl), add it along with
   * its {@code Dictionary} and resourcePath to the result array.
   */
  public async scan(
    dirs: string | string[],
    wordFormsFolder: string
  ): Promise<void> {
    // DictMap without resourcePath
    let files: IFileWithStats[] = [];
    for (const dir of Array.isArray(dirs) ? dirs : [dirs]) {
      files = files.concat(await readdirRecursivelyWithStat(dir));
    }
    for (const file of files) {
      if (file.stat.isDirectory()) {
        continue;
      }

      const ext = path.extname(file.filePath);
      for (const [dictName, dictionary] of Array.from(
        DictionaryFinder._dictionaries.entries()
      )) {
        // we find a dictionary
        if (dictionary.dictionarySuffixes.indexOf(ext) > -1) {
          // get resourcePath
          const resource: Option<string> = await this.getResource(
            file.filePath,
            files.map(f => f.filePath),
            dictionary.resourceHolderSuffixes,
            dictionary.resourceFileSuffixes
          );

          // build index
          const dictStats: DictionaryStats = await dictionary.getDictionaryStats(
            file.filePath
          );
          const dictId = await this.saveDictToDb(
            dictStats.meta.NAME,
            resource.isEmpty ? "" : resource.get,
            file.filePath,
            dictName
          );
          await this.saveWordsToDb(dictId, dictStats.indexMap);
          if (!resource.isEmpty) {
            await this.buildResourceIndex(resource.get);
          }

          // add it to dictMapList
          // dictMapList.push({
          //   dict: {
          //     dictPath: file.filePath,
          //     dictType: dictName,
          //     resourcePath: resource.isEmpty ? "" : resource.get
          //   },
          //   meta: dictStats.meta,
          //   originalWords: dictStats.indexMap,
          //   transformedWords: {}
          // });
        }
      }
    }

    // add word transformations
    // await this.addTransformedWords(dictMapList, wordFormsFolder);

    // save to db
    // await fse.writeFile(jsonDbPath, JSON.stringify(dictMapList), {
    //   encoding: "utf8"
    // });

  }

  // private async addTransformedWords(
  //   dictMapList: DictMap[],
  //   wordFormsFolder: string
  // ): Promise<void> {
  //   // word forms
  //   const wordFormsFiles = await fse.readdir(wordFormsFolder);
  //   for (let i = 0; i < wordFormsFiles.length; i++) {
  //     const wordFormsFile = path.join(wordFormsFolder, wordFormsFiles[i]);
  //     if (!(await fse.pathExists(wordFormsFile))) {
  //       console.log(`${wordFormsFile} doesn't exist, skip`);
  //       continue;
  //     }
  //     const lineReader = ReadLine.createInterface({
  //       input: fse.createReadStream(wordFormsFile)
  //     });
  //     lineReader.on("line", line => {
  //       const words: string[] = line.split(/[\s,:]+/);
  //
  //       const originalWord = words[0];
  //       const transformedWords = words.slice(1);
  //
  //       for (const transformedWord of transformedWords) {
  //         // check each dictionary
  //         for (const dictMap of dictMapList) {
  //           if (
  //             dictMap.originalWords.hasOwnProperty(originalWord) &&
  //             !dictMap.transformedWords.hasOwnProperty(transformedWord)
  //           ) {
  //             dictMap.transformedWords[transformedWord] =
  //               dictMap.originalWords[originalWord];
  //           }
  //         }
  //       }
  //     });
  //     return new Promise<void>((resolve, reject) => {
  //       lineReader.on("close", () => {
  //         resolve();
  //       });
  //     });
  //   }
  // }

  static get dictionaries(): Map<string, Dictionary> {
    return DictionaryFinder._dictionaries;
  }

  /** <p>Look for resourcePath file/directory in <i>baseDirectory</i>, the rules are as follows.</p>
   * 1. If we find a file whose extension is in <i>resourceHolderSuffixes</i>
   *    and its basename(filename without extension) is the same as
   *    <i>dictFileName</i>'s basename, this is exactly the resourcePath
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
   * @param resourceHolderSuffixes extensions of the archived resourcePath file(e.g. zip)
   * @param resourceFileSuffixes resourcePath extensions(e.g. wmv)
   * @returns path to the resourcePath archive/directory represented in string
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
      if (resourceFile === dictFilePath) {
        continue;
      }

      const isDir: boolean = (await fse.stat(resourceFile)).isDirectory();
      const isSameDir: boolean =
        path.dirname(dictFilePath) === path.dirname(resourceFile);
      const isSameBaseName: boolean =
        path.basename(resourceFile).split(".")[0] === dictFileBaseName;
      const isResourceHolder: boolean =
        !isDir &&
        resourceHolderSuffixes.indexOf(path.extname(resourceFile)) > -1;
      const isResourceFile: boolean = await (async (): Promise<boolean> => {
        if (!isDir) {
          return false;
        }
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
    return candidates.length === 0 ? none : option(candidates[0].file);
  }
  private buildResourceIndex = async (
    resourceHolder: string,
  ) => {
    if (path.extname(resourceHolder) === ".zip") {
      const zipReader = new ZipReader(resourceHolder);
      await zipReader.buildZipIndex();
    }
  };
  private saveDictToDb = async (
    dictName: string,
    resourceHolder: string,
    dictPath: string,
    dictType: string
  ): Promise<number> => {
   await Sqlite.db.run(`
     INSERT INTO dictionary (name, resource_path, dict_path, type)
     VALUES (?, ?, ?, ?)
   `, [dictName, resourceHolder, dictPath, dictType]);
   const queryResult = await Sqlite.db.get(`SELECT id FROM dictionary WHERE dict_path = ?`, [dictPath]);
   return queryResult.id;
  };
  private saveWordsToDb = async (dictId: number, indexMap: IndexMap): Promise<void> => {
    let insertStatement = `INSERT INTO word_index (dictionary_id, word, pos, len) VALUES`;
    const parameters = [];
    for (const word in indexMap) {
      if (indexMap.hasOwnProperty(word)) {
        parameters.push(`(
                       ${Sqlite.getSQLParam(dictId)},
                       ${Sqlite.getSQLParam(word)},
                       ${Sqlite.getSQLParam(indexMap[word].pos)},
                       ${Sqlite.getSQLParam(indexMap[word].len)}
        )`);
      }
    }
    insertStatement = insertStatement + parameters.join(",\n");
    await Sqlite.db.exec(insertStatement);
  }
  private categorizeFiles = async (files: string[]): Promise<IFileCategory> => {
    const result = { dirs: [], normalFiles: [] } as IFileCategory;
    for (const f of files) {
      const isDir = (await fse.lstat(f)).isDirectory();
      if (isDir) {
        result.dirs.push(f);
      } else {
        result.normalFiles.push(f);
      }
    }
    return result;
  };
  private addDictionaries = async (dict: Dictionary, mainDictFiles: string[]) => {
    for (const mainDictFile of mainDictFiles) {
      await dict.addDictionary(mainDictFile);
    }
  }
}

DictionaryFinder.register("dsl", DSLDictionary);

export interface IndexMap {
  [word: string]: WordPosition;
}

export interface Meta {
  [metaKey: string]: string;
}

export interface WordForms {
  [word: string]: WordPosition;
}
