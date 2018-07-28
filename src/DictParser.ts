import { EventEmitter } from "events";
import { AccentConverter } from "./AccentConverter";
import { DictionaryFinder } from "./DictionaryFinder";
import { WORD_FORMS_PATH, SRC_RESOURCE_PATH, SQLITE_DB_PATH } from "./Constant";
import { ResourceManager } from "./ResourceManager";
import { registerResourceManagers } from "./DictionaryRegister";
import { IWordDefinition } from "./model/IWordDefinition";
import { Sqlite } from "./util/Sqlite";
import { IgnorableTrie } from "./IgnorableTrie";
import { HTMLCreator } from "./HTMLCreator";
import { IIndex } from "./model/IIndex";

export class DictParser extends EventEmitter {
  private _sqliteDbPath: string;
  private _wordFormsFolder: string;
  private _dictionaryFinder = new DictionaryFinder();
  private _dictionaries = this._dictionaryFinder.dictionaries;
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
    await this._dictionaryFinder.scan(Array.isArray(scanFolder) ? scanFolder : [scanFolder]);
    await this.init();
  }

  /**
   * Guess what word the user wants based on the word input
   */
  public async getWordCandidates(input: string, resultCount = 30): Promise<string[]> {
    // input = this.normalize(input);

    if (input.trim() === "") {
      return [];
    }

    const candidates = this._vocabulary.findWordsStartWith(input, resultCount);
    this._vocabulary.findWordsStartWithExcludeIgnoreCharacters(input, resultCount, candidates);
    return Array.from(candidates);
  }

  public async getWordDefinitions(word: string): Promise<IWordDefinition[]> {
    const wordDefinitionList: IWordDefinition[] = [];
    const wordIndexList = await this.queryWordIndexes(word);
    for (const wordIndex of wordIndexList) {
      const dictionary = this._dictionaries.get(wordIndex.dictionary.type);
      if (dictionary === undefined) {
        continue;
      }
      try {
        const html = await dictionary.getDefinition(wordIndex.dictionary, wordIndex.word, wordIndex.pos, wordIndex.len);
        wordDefinitionList.push({ word, html, dict: wordIndex.dictionary });
      } catch (e) {
        wordDefinitionList.push({
          word,
          html: HTMLCreator.getFailedToFetchDefinitionFromDictionaryHTML(word, wordIndex.dictionary.name),
          dict: wordIndex.dictionary
        });
      }
    }
    return wordDefinitionList;
  }

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
    const queryResultList = await Sqlite.db.all("SELECT DISTINCT word FROM word_index");
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
  private queryWordIndexes = async (word: string): Promise<IIndex[]> => {
    const queryResultList = await Sqlite.db.all(
      `
      SELECT
        word_index.id                 AS id,
        word_index.word               AS word,            
        word_index.pos                AS pos,             
        word_index.len                AS len,             
        dictionary.id                 AS dictionary_id,   
        dictionary.name               AS name,            
        dictionary.word_count         AS word_count,
        dictionary.syn_path           AS syn_path,
        dictionary.index_path         AS index_path,
        dictionary.resource_path      AS resource_path, 
        dictionary.dict_path          AS dict_path,       
        dictionary.ann_path           AS ann_path,       
        dictionary.bmp_path           AS bmp_path,       
        dictionary.same_type_sequence AS same_type_sequence,       
        dictionary.type               AS type
      FROM word_index INNER JOIN dictionary
        ON word_index.dictionary_id = dictionary.id
      WHERE word = ?
    `,
      [word]
    );
    const wordIndexList: IIndex[] = [];
    for (const queryResult of queryResultList) {
      wordIndexList.push({
        id: queryResult.id,
        dictionary: {
          id: parseInt(queryResult.dictionary_id, 10),
          name: queryResult.name,
          wordCount: parseInt(queryResult.word_count, 10),
          synPath: queryResult.syn_path,
          indexPath: queryResult.index_path,
          resourcePath: queryResult.resource_path,
          dictPath: queryResult.dict_path,
          annPath: queryResult.ann_path,
          bmpPath: queryResult.bmp_path,
          sameTypeSequence: queryResult.same_type_sequence,
          type: queryResult.type
        },
        word: queryResult.word,
        len: parseInt(queryResult.len, 10),
        pos: parseInt(queryResult.pos, 10)
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
