import { EventEmitter } from "events";
import { AccentConverter } from "./AccentConverter";
import { DictionaryFinder } from "./DictionaryFinder";
import {
  JSON_DB_PATH,
  WORD_FORMS_PATH,
  SRC_RESOURCE_PATH,
  SQLITE_DB_PATH
} from "./Constant";
import { WordTree } from "./Tree";
import { Dictionary, WordPosition } from "./Dictionary";
import { ResourceManager } from "./ResourceManager";
import { registerResourceManagers } from "./DictionaryRegister";
import { IWordDefinition } from "./model/IWordDefinition";
import { Trie } from "./Trie";
import { Sqlite } from "./util/Sqlite";
import { IWordIndex } from "./model/IWordIndex";
import { IgnorableTrie } from "./IgnorableTrie";

export class DictParser extends EventEmitter {
  private _jsonDbPath: string;
  private _sqliteDbPath: string;
  private _wordFormsFolder: string;
  private _dictionaryFinder = new DictionaryFinder();
  private _dictionaries: Map<string, Dictionary> =
    DictionaryFinder.dictionaries;

  private _vocabulary: IgnorableTrie;

  constructor(
    sqliteDbPath: string = SQLITE_DB_PATH,
    wordFormsFolder: string = WORD_FORMS_PATH,
    commonResourceDirectory: string = SRC_RESOURCE_PATH
  ) {
    super();

    registerResourceManagers();
    ResourceManager.commonResourceDirectory = commonResourceDirectory;

    this._sqliteDbPath = sqliteDbPath;
    this._wordFormsFolder = wordFormsFolder;
  }

  public init = async (): Promise<void> => {
    // this._dictMapList = await this.loadDictMapList();
    await Sqlite.init(this._sqliteDbPath);
    this._vocabulary = await this.loadVocabulary();
  };

  public async scan(scanFolder: string | string[]): Promise<void> {
    await Sqlite.reset();
    this._dictionaryFinder.on("name", (dictionaryName: string) => {
      this.emit("name", dictionaryName);
    });
    await this._dictionaryFinder.scan(scanFolder, this._wordFormsFolder);
    await this.init();
  }

  /**
   * Guess what word the user wants based on the word input
   */
  public async getWordCandidates(
    input: string,
    resultCount = 30
  ): Promise<string[]> {
    // input = this.normalize(input);

    if (input.trim() === "") {
      return [];
    }

    const candidates = this._vocabulary.findWordsStartWith(
      input,
      resultCount
    );
    this._vocabulary.findWordsStartWithExcludeIgnoreCharacters(
      input,
      resultCount,
      candidates
    );
    return Array.from(candidates);
  }

  public async getWordDefinitions(word: string): Promise<IWordDefinition[]> {
    const wordDefinitionList: IWordDefinition[] = [];
    // if (this._dictMapList === undefined) {
    //   this._dictMapList = await this.readDictMapListFromFile();
    // }
    const wordIndexList = await this.queryWordIndexes(word);
    for (const wordIndex of wordIndexList) {
      const wordPosition = {
        pos: wordIndex.pos,
        len: wordIndex.len
      };
      const dictionary = this._dictionaries.get(wordIndex.dictionary.type);
      if (dictionary === undefined) {
        continue;
      }
      const wordTree: WordTree = await dictionary.getWordTree(
        wordIndex.dictionary.dictPath,
        wordPosition
      );
      // const resourceManager = getResourceManagerByDictType(dictMap.dict.dictType);
      const html: string = await dictionary.getHTML(
        wordIndex.dictionary.name,
        wordIndex.dictionary.dictPath,
        wordIndex.dictionary.resourcePath,
        wordPosition
      );
      // const dictName = dictMap.meta.NAME;
      wordDefinitionList.push({
        word,
        wordTree,
        html,
        dict: wordIndex.dictionary
      });
    }
    return wordDefinitionList;
  }

  // public async readDictMapListFromFile(): Promise<DictMap[]> {
  //   if (await fse.pathExists(this._jsonDbPath)) {
  //     const dbContents = await fse.readFile(this._jsonDbPath, {
  //       encoding: "utf8"
  //     });
  //     const dictMapList = JSON.parse(dbContents) as DictMap[];
  //     return dictMapList;
  //   } else {
  //     return [];
  //   }
  // }

  // public setDictMapList = (dictMapList: DictMap[]): void => {
  //   this._dictMapList = dictMapList;
  // };

  private normalize(word: string): string {
    let normalizedWord: string = "";
    for (const c of word) {
      normalizedWord += AccentConverter.removeAccent(c).toLowerCase();
    }
    return normalizedWord.trim();
  }

  // private loadDictMapList = async () => {
  //   return await this.readDictMapListFromFile();
  // };
  private loadVocabulary = async (): Promise<IgnorableTrie> => {
    const vocabulary = new IgnorableTrie();
    const queryResultList = await Sqlite.db.all(
      "SELECT DISTINCT word FROM word_index"
    );
    for (const queryResult of queryResultList) {
      vocabulary.add(queryResult.word);
    }
    return vocabulary;
  };
  // private loadAllWordsFromIndexMap = (
  //   indexMap: IndexMap,
  //   vocabulary: Trie
  // ) => {
  //   for (const word in indexMap) {
  //     if (indexMap.hasOwnProperty(word)) {
  //       vocabulary.add(word);
  //     }
  //   }
  // };
  private queryWordIndexes = async (word: string): Promise<IWordIndex[]> => {
    const queryResultList = await Sqlite.db.all(
      `
      SELECT
        word_index.id               AS id,
        word_index.word             AS word,            
        word_index.pos              AS pos,             
        word_index.len              AS len,             
        dictionary.id               AS dictionary_id,   
        dictionary.name             AS name,            
        dictionary.word_count       AS word_count;
        dictionary.syn_path         AS syn_path,
        dictionary.index_path       AS index_path,
        dictionary.resource_path    AS resource_path, 
        dictionary.dict_path        AS dict_path,       
        dictionary.type             AS type
      FROM word_index INNER JOIN dictionary
        ON word_index.dictionary_id = dictionary.id
      WHERE word = ?
    `,
      [word]
    );
    const wordIndexList: IWordIndex[] = [];
    for (const queryResult of queryResultList) {
      wordIndexList.push({
        id: queryResult.id,
        dictionary: {
          id: queryResult.dictionary_id,
          name: queryResult.name,
          wordCount: queryResult.word_count,
          synPath: queryResult.syn_path,
          indexPath: queryResult.index_path,
          resourcePath: queryResult.resource_path,
          dictPath: queryResult.dict_path,
          type: queryResult.type
        },
        word: queryResult.word,
        len: queryResult.len,
        pos: queryResult.pos
      });
    }
    return wordIndexList;
  };
  // private addSimilarWords = (
  //   input: string,
  //   vocabulary: Trie,
  //   resultCount: number,
  //   result: Set<string>
  // ) => {
  //   for (const word of Array.from(vocabulary.values())) {
  //     if (word.startsWith(input)) {
  //       result.add(word);
  //       if (result.size > resultCount) {
  //         return;
  //       }
  //     }
  //   }
  // };
}
