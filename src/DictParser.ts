import { AccentConverter } from './AccentConverter';
import { DictMap, DictionaryFinder, IDictionary, IndexMap } from './DictionaryFinder';
import { Option, none, some } from 'ts-option';
import { DEFAULT_DB_PATH } from './constant';
import * as fsp from 'fs-promise';
import { WordTree } from "./Tree";
import { Dictionary } from "./Dictionary";

export class DictParser {

    private _dbPath: string;
    private _dictionaryFinder = new DictionaryFinder();
    private _dictMapList: DictMap[];
    private _dictionaries: Map<string, Dictionary> = DictionaryFinder.dictionaries;

    constructor(dbPath: string = DEFAULT_DB_PATH) {
        this._dbPath = dbPath;
    }

    async scan(scanFolder: string): Promise<DictMap[]> {
        this._dictMapList = await this._dictionaryFinder.scan(scanFolder, this._dbPath);
        return this._dictMapList;
    }

    /**
     * Guess what word the user wants based on the word input
     */
    async getWordCandidates(input: string, resultCount = 30): Promise<WordCandidate[]> {
        let wordSuggestions: {input: string, word: string, posInFullWord: number, dict: IDictionary}[] = [];
        let transformedInput = this.transform(input);
        if(this._dictMapList == undefined) this._dictMapList = await this.getFullDictMapList();
        for(let dictMap of this._dictMapList) {
            for(let word in dictMap.indexMap) {
                if(dictMap.indexMap.hasOwnProperty(word)) {
                    // a word is found
                    let transformedWord = this.transform(word);
                    let posInFullWord = transformedWord.indexOf(transformedInput);
                    if(posInFullWord > -1) {
                        wordSuggestions.push({
                            input: input,
                            word: word,
                            posInFullWord: posInFullWord,
                            dict: dictMap.dict
                        });
                    }
                }
            }
        }
        wordSuggestions.sort((a, b) => {
            let lenDifferenceA = a.word.length - a.input.length;
            let lenDifferenceB = b.word.length - b.input.length;
            if(a.posInFullWord < b.posInFullWord || (a.posInFullWord == b.posInFullWord && lenDifferenceA < lenDifferenceB)) {
                return -1
            } else if(a.posInFullWord > b.posInFullWord || (a.posInFullWord == b.posInFullWord && lenDifferenceA > lenDifferenceB)) {
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

    async getWordDefinition(word: string): Promise<WordDefinition[]> {
        let wordDefinitionList: WordDefinition[] = [];
        if(this._dictMapList == undefined) {
            this._dictMapList = await this.getFullDictMapList();
        }
        for(let dictMap of this._dictMapList) {
            let wordPosition = dictMap.indexMap[word];
            if(wordPosition != undefined) {
                let dictionary = this._dictionaries.get(dictMap.dict.dictType);
                if(dictionary == undefined) {
                    continue;
                }
                let wordTree: WordTree = await dictionary.getWordTree(dictMap.dict.dictPath, wordPosition.pos, wordPosition.len);
                let html: string = await dictionary.getHTML(dictMap.meta['NAME'], dictMap.dict.dictPath, wordPosition.pos, wordPosition.len);
                let dictName = dictMap.meta['NAME'];
                wordDefinitionList.push({
                    word: word,
                    wordTree: wordTree,
                    html: html,
                    dict: dictMap.dict
                });
            }
        }
        return wordDefinitionList;
    }

    private async getFullDictMapList(): Promise<DictMap[]> {
        let dbContents: string = await fsp.readFile(this._dbPath, {encoding: 'utf8'});
        let dictMapList: DictMap[] = JSON.parse(dbContents) as DictMap[];
        return dictMapList;
    }

    private transform(word: string): string {
        let transformedWord: string = "";
        for(let c of word) {
            transformedWord += AccentConverter.removeAccent(c).toLowerCase();
        }
        return transformedWord;
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