import { EventEmitter } from 'events';
import { AccentConverter } from './AccentConverter';
import { DictMap, DictionaryFinder, IDictionary, IndexMap, WordForms } from './DictionaryFinder';
import { Option, none, some } from 'ts-option';
import { DB_PATH, WORD_FORMS_PATH, SRC_RESOURCE_PATH } from './Constant';
import * as fse from 'fs-extra';
import { WordTree } from "./Tree";
import { Dictionary, WordPosition } from "./Dictionary";
import * as ReadLine from "readline";
import * as path from 'path';

export class DictParser extends EventEmitter {

    private _dbPath: string;
    private _wordFormsFolder: string;
    private _dictionaryFinder = new DictionaryFinder();
    private _dictMapList: DictMap[];
    private _dictionaries: Map<string, Dictionary> = DictionaryFinder.dictionaries;

    private _wordformsMap: { [lang: string]: WordForms } = {};
    private _resourcePath: string;

    constructor(
      dbPath: string = DB_PATH,
      wordFormsFolder: string = WORD_FORMS_PATH,
      resourcePath: string = SRC_RESOURCE_PATH
    ) {
      super();
      this._dbPath = dbPath;
      this._wordFormsFolder = wordFormsFolder;
      this._resourcePath = resourcePath;
      this._dictionaries.forEach((dictionary: Dictionary, dictType: string) => {
        dictionary.resourcePath = this._resourcePath;
      })
    }

    async scan(scanFolder: string | string[]): Promise<DictMap[]> {
        this._dictionaryFinder.on('name', (dictionaryName: string) => {
            this.emit('name', dictionaryName);
        });
        this._dictMapList = await this._dictionaryFinder.scan(
          scanFolder,
          this._dbPath,
          this._wordFormsFolder);
        return this._dictMapList;
    }

    /**
     * Guess what word the user wants based on the word input
     */
    async getWordCandidates(input: string, resultCount = 30): Promise<WordCandidate[]> {
        let wordSuggestions: {
            input: string, 
            word: string, 
            posInFullWord: number, 
            dict: IDictionary,
            isTransformed: boolean
        }[] = [];
        let normalizedInput = this.normalize(input);
        if(this._dictMapList == undefined) this._dictMapList = await this.getFullDictMapList();

        // check each dictionary
        for(let dictMap of this._dictMapList) {

            // check both originalWords and transformedWords
            for(let words of [dictMap.originalWords, dictMap.transformedWords]) {

                // check each word
                for(let word in words) {
                    if(words.hasOwnProperty(word)) {
                        // a word is found
                        let normalizedWord = this.normalize(word);
                        let posInFullWord = normalizedWord.indexOf(normalizedInput);
                        if(posInFullWord > -1) {
                            wordSuggestions.push({
                                input: input,
                                word: word,
                                posInFullWord: posInFullWord,
                                dict: dictMap.dict,
                                isTransformed: words == dictMap.transformedWords
                            });
                        }
                    }
                }
            }
        }
        wordSuggestions.sort((a, b) => {
            // sort originalWords before transformedWords
            if(!a.isTransformed && b.isTransformed) {
                return -1;
            } else if(a.isTransformed && !b.isTransformed) {
                return 1;
            }

            let lenDifferenceA = a.word.length - a.input.length;
            let lenDifferenceB = b.word.length - b.input.length;
            if(a.posInFullWord < b.posInFullWord || (a.posInFullWord == b.posInFullWord && lenDifferenceA < lenDifferenceB)) {
                // a comes first
                return -1
            } else if(a.posInFullWord > b.posInFullWord || (a.posInFullWord == b.posInFullWord && lenDifferenceA > lenDifferenceB)) {
                // b comes first
                return 1
            } else {
                return 0;
            }
        });
        let result: {word: string, dict: IDictionary}[] = [];
        for(let i = 0; i < wordSuggestions.length; i++) {
            if(i >= resultCount) break;
            result.push({
                word: wordSuggestions[i].word,
                dict: wordSuggestions[i].dict
            });
        }
        return result;
    }

    async getWordDefinitions(word: string): Promise<WordDefinition[]> {
        let wordDefinitionList: WordDefinition[] = [];
        if(this._dictMapList == undefined) {
            this._dictMapList = await this.getFullDictMapList();
        }
        for(let dictMap of this._dictMapList) {
            let wordPosition: WordPosition;
            if(dictMap.originalWords.hasOwnProperty(word)) {
                wordPosition = dictMap.originalWords[word];
            } else if(dictMap.transformedWords.hasOwnProperty(word)) {
                wordPosition = dictMap.transformedWords[word];
            } else {
                continue;
            }
            let dictionary = this._dictionaries.get(dictMap.dict.dictType);
            if(dictionary == undefined) {
                continue;
            }
            let wordTree: WordTree = await dictionary.getWordTree(dictMap.dict.dictPath, wordPosition.pos, wordPosition.len);
            let html: string = await dictionary.getHTML(
              dictMap.meta['NAME'],
              dictMap.dict.dictPath,
              wordPosition.pos,
              wordPosition.len
            );
            let dictName = dictMap.meta['NAME'];
            wordDefinitionList.push({
                word: word,
                wordTree: wordTree,
                html: html,
                dict: dictMap.dict
            });
        }
        return wordDefinitionList;
    }

    private async getFullDictMapList(): Promise<DictMap[]> {
        let dbContents: string = await fse.readFile(this._dbPath, {encoding: 'utf8'});
        let dictMapList: DictMap[] = JSON.parse(dbContents) as DictMap[];
        return dictMapList;
    }

    private normalize(word: string): string {
        let normalizedWord: string = "";
        for(let c of word) {
            normalizedWord += AccentConverter.removeAccent(c).toLowerCase();
        }
        return normalizedWord;
    }

}

export interface WordDefinition {
    word: string;
    wordTree: WordTree;
    html: string;
    dict: IDictionary
}

export interface WordCandidate {
    word: string,
    dict: IDictionary
}

export interface DictParserInput {
    dbPath: string;
}

