import { WordCandidate } from './index';
import {EventEmitter} from 'events';
import {AccentConverter} from './AccentConverter';
import {DictMap, DictionaryFinder, IDictionary, IndexMap, WordForms} from './DictionaryFinder';
import {JSON_DB_PATH, WORD_FORMS_PATH, SRC_RESOURCE_PATH, SQLITE_DB_PATH} from './Constant';
import * as fse from 'fs-extra';
import {WordTree} from "./Tree";
import {Dictionary, WordPosition} from "./Dictionary";
import {
  ResourceContents, registerResourceManager, getResourceManagerByDictType,
  ResourceManager
} from "./ResourceManager";
import { registerResourceManagers } from './DictionaryRegister';
import { DSLResourceManager } from './dictionaries/dsl/DSLResourceManager';

export class DictParser extends EventEmitter {

  private _jsonDbPath: string;
  private _sqliteDbPath: string;
  private _wordFormsFolder: string;
  private _dictionaryFinder = new DictionaryFinder();
  private _dictMapList: DictMap[];
  private _dictionaries: Map<string, Dictionary> = DictionaryFinder.dictionaries;

  private _wordformsMap: { [lang: string]: WordForms } = {};
  private _resourcePath: string;
  private _wordMap: Map<string, Set<string>>;

  constructor(jsonDbPath: string = JSON_DB_PATH,
              sqliteDbPath: string = SQLITE_DB_PATH,
              wordFormsFolder: string = WORD_FORMS_PATH,
              commonResourceDirectory: string = SRC_RESOURCE_PATH) {
    super();

    registerResourceManagers();
    ResourceManager.commonResourceDirectory = commonResourceDirectory;

    this._jsonDbPath = jsonDbPath;
    this._sqliteDbPath = sqliteDbPath;
    this._wordFormsFolder = wordFormsFolder;
  }

  public init = async (): Promise<void> => {
    await this.buildWordList();
  };

  public buildWordList = async (dictMapList?: DictMap[]) => {
    if(dictMapList === undefined) {
      this._dictMapList = await this.readDictMapListFromFile();
    }
    this._wordMap = this.getWordMap(this._dictMapList);
  };

  public async scan(scanFolder: string | string[]): Promise<DictMap[]> {
    this._dictionaryFinder.on('name', (dictionaryName: string) => {
      this.emit('name', dictionaryName);
    });
    this._dictMapList = await this._dictionaryFinder.scan(
      scanFolder,
      this._jsonDbPath,
      this._sqliteDbPath,
      this._wordFormsFolder);
    await this.buildWordList(this._dictMapList);
    return this._dictMapList;
  }

  /**
   * Guess what word the user wants based on the word input
   */
  public async getWordCandidates(input: string, resultCount = 30): Promise<string[]> {

    const result: Set<string> = new Set<string>();
    input = this.normalize(input);

    if(input === '') {
      return [];
    }

    // first add the input word if it exists in dictionaries
    if(this._wordMap.has(input)) {
      this._wordMap.get(input)!.forEach(originalWord => {
        result.add(originalWord);
      });
    }

    // check other candidates
    for(const normalizedWord of Array.from(this._wordMap.keys())) {
        if(normalizedWord.startsWith(input)) {
          const originalWords = this._wordMap.get(normalizedWord);
          originalWords!.forEach((w: string) => result.add(w));
          if (result.size >= resultCount) {
            break;
          }
        }
    }
    return Array.from(result).slice(0, resultCount);
  }

  public async getWordDefinitions(word: string): Promise<WordDefinition[]> {
    const wordDefinitionList: WordDefinition[] = [];
    if (this._dictMapList === undefined) {
      this._dictMapList = await this.readDictMapListFromFile();
    }
    for (const dictMap of this._dictMapList) {
      let wordPosition: WordPosition;
      if (dictMap.originalWords.hasOwnProperty(word)) {
        wordPosition = dictMap.originalWords[word];
      } else if (dictMap.transformedWords.hasOwnProperty(word)) {
        wordPosition = dictMap.transformedWords[word];
      } else {
        continue;
      }
      const dictionary = this._dictionaries.get(dictMap.dict.dictType);
      if (dictionary == undefined) {
        continue;
      }
      const wordTree: WordTree = await dictionary.getWordTree(dictMap, wordPosition);
      // const resourceManager = getResourceManagerByDictType(dictMap.dict.dictType);
      const html: string = await dictionary.getHTML(dictMap, wordPosition, this._sqliteDbPath);
      const dictName = dictMap.meta.NAME;
      wordDefinitionList.push({
        word,
        wordTree,
        html,
        dict: dictMap.dict,
      });
    }
    return wordDefinitionList;
  }

  public async readDictMapListFromFile(): Promise<DictMap[]> {
    if(await fse.pathExists(this._jsonDbPath)) {
      const dbContents = await fse.readFile(this._jsonDbPath, {encoding: 'utf8'});
      const dictMapList = JSON.parse(dbContents) as DictMap[];
      return dictMapList;
    } else {
      return [];
    }
  }

  public setDictMapList = (dictMapList: DictMap[]): void => {
    this._dictMapList = dictMapList;
  };

  private normalize(word: string): string {
    let normalizedWord: string = "";
    for (const c of word) {
      normalizedWord += AccentConverter.removeAccent(c).toLowerCase();
    }
    return normalizedWord.trim();
  }
  private getWordMap = (dictMapList: DictMap[]): Map<string, Set<string>> => {
    // normalized words => original words
    const wordMap = new Map<string, Set<string>>();
    for(const dictMap of dictMapList) {
      for(const words of [dictMap.originalWords, dictMap.transformedWords]) {
        for(const word in words) {
          const normalizedWord = this.normalize(word);
          if(wordMap.has(normalizedWord)) {
            wordMap.get(normalizedWord)!.add(word);
          } else {
            const originalWordSet = new Set<string>();
            originalWordSet.add(word);
            wordMap.set(normalizedWord, originalWordSet);
          }
        }
      }
    }
    return wordMap;
  }

}

export interface WordDefinition {
  word: string;
  wordTree: WordTree;
  html: string;
  dict: IDictionary,
}

export interface WordCandidate {
  word: string,
  dict: IDictionary
}
