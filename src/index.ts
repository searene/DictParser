import { WordCandidate } from './index';
import {EventEmitter} from 'events';
import {AccentConverter} from './AccentConverter';
import {DictMap, DictionaryFinder, IDictionary, IndexMap, WordForms} from './DictionaryFinder';
import {DB_PATH, WORD_FORMS_PATH, SRC_RESOURCE_PATH} from './Constant';
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

  private _dbPath: string;
  private _wordFormsFolder: string;
  private _dictionaryFinder = new DictionaryFinder();
  private _dictMapList: DictMap[];
  private _dictionaries: Map<string, Dictionary> = DictionaryFinder.dictionaries;

  private _wordformsMap: { [lang: string]: WordForms } = {};
  private _resourcePath: string;
  private _wordMap: Map<string, Set<string>>;

  constructor(dbPath: string = DB_PATH,
              wordFormsFolder: string = WORD_FORMS_PATH,
              commonResourceDirectory: string = SRC_RESOURCE_PATH) {
    super();

    registerResourceManagers();
    ResourceManager.commonResourceDirectory = commonResourceDirectory;

    this._dbPath = dbPath;
    this._wordFormsFolder = wordFormsFolder;
  }

  init = async (): Promise<void> => {
    await this.buildWordList();
  };

  buildWordList = async (dictMapList?: DictMap[]) => {
    if(dictMapList === undefined) {
      dictMapList = await this.readDictMapListFromFile();
    }
    this._wordMap = this.getWordMap(dictMapList); 
  };

  async scan(scanFolder: string | string[]): Promise<DictMap[]> {
    this._dictionaryFinder.on('name', (dictionaryName: string) => {
      this.emit('name', dictionaryName);
    });
    this._dictMapList = await this._dictionaryFinder.scan(
      scanFolder,
      this._dbPath,
      this._wordFormsFolder);
    await this.buildWordList(this._dictMapList);
    return this._dictMapList;
  }

  /**
   * Guess what word the user wants based on the word input
   */
  async getWordCandidates(input: string, resultCount = 30): Promise<string[]> {
    let result: Set<string> = new Set<string>();
    const BreakError = {};
    input = this.normalize(input);
    if(this._wordMap.has(input)) {
      this._wordMap.get(input)!.forEach(originalWord => {
        result.add(originalWord);
      })
    }
    for(const normalizedWord of Array.from(this._wordMap.keys())) {
        if(normalizedWord.startsWith(input)) {
          const originalWords = this._wordMap.get(normalizedWord);
          originalWords!.forEach((w: string) => result.add(w));
        }
    }
    try {
      this._wordMap.forEach((originalWords, normalizedWord) => {
        if(result.size >= resultCount) {
          throw BreakError;
        }
      });
    } catch(e) {
      if(e !== BreakError) throw e;
    }
    return Array.from(result).slice(0, resultCount);
  }

  async getWordDefinitions(word: string): Promise<WordDefinition[]> {
    let wordDefinitionList: WordDefinition[] = [];
    if (this._dictMapList === undefined) {
      this._dictMapList = await this.readDictMapListFromFile();
    }
    for (let dictMap of this._dictMapList) {
      let wordPosition: WordPosition;
      if (dictMap.originalWords.hasOwnProperty(word)) {
        wordPosition = dictMap.originalWords[word];
      } else if (dictMap.transformedWords.hasOwnProperty(word)) {
        wordPosition = dictMap.transformedWords[word];
      } else {
        continue;
      }
      let dictionary = this._dictionaries.get(dictMap.dict.dictType);
      if (dictionary == undefined) {
        continue;
      }
      let wordTree: WordTree = await dictionary.getWordTree(dictMap, wordPosition);
      const resourceManager = getResourceManagerByDictType(dictMap.dict.dictType);
      let html: string = await dictionary.getHTML(dictMap, wordPosition);
      let dictName = dictMap.meta['NAME'];
      wordDefinitionList.push({
        word: word,
        wordTree: wordTree,
        html: html,
        dict: dictMap.dict,
      });
    }
    return wordDefinitionList;
  }

  async readDictMapListFromFile(): Promise<DictMap[]> {
    if(await fse.pathExists(this._dbPath)) {
      let dbContents = await fse.readFile(this._dbPath, {encoding: 'utf8'});
      const dictMapList = JSON.parse(dbContents) as DictMap[];
      return dictMapList;
    } else {
      return [];
    }
  }

  setDictMapList = (dictMapList: DictMap[]): void => {
    this._dictMapList = dictMapList;
  };

  private normalize(word: string): string {
    let normalizedWord: string = "";
    for (let c of word) {
      normalizedWord += AccentConverter.removeAccent(c).toLowerCase();
    }
    return normalizedWord;
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
