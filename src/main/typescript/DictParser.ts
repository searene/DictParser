import { DictMap, DictionaryFinder } from './DictionaryFinder';
import { Option, none, some } from 'ts-option';
import { DEFAULT_DB_PATH } from './constant';
import * as fsp from 'fs-promise';
import { WordTree } from "./Tree";
import { WordTreeHTML, Dictionary } from "./Dictionary";

export class DictParser {

    private _scanFolder: Option<string> = none;
    private _dbPath: string;
    private _dictionaryFinder = new DictionaryFinder();
    private _dictMapList: Option<DictMap[]> = none;
    private _dictionaries: Map<string, Dictionary> = DictionaryFinder.dictionaries;

    constructor(scanFolder?: string, dbPath: string = DEFAULT_DB_PATH) {
        if(scanFolder != undefined) {
            this._scanFolder = some(scanFolder);
        }
        this._dbPath = dbPath;
    }

    async getWordDefinition(word: string): Promise<WordDefinition[]> {
        let wordDefinitionList: WordDefinition[] = [];
        if(this._dictMapList.isEmpty) {
            this._dictMapList = some(await this.getFullDictMapList());
        }
        let dictMapList = this._dictMapList.get;
        for(let dictMap of dictMapList) {
            let wordPosition = dictMap.indexMap[word];
            if(wordPosition != undefined) {
                let dictionary = this._dictionaries.get(dictMap.dictType);
                if(dictionary == undefined) {
                    continue;
                }
                let wordTree: WordTree = await dictionary.getWordTree(dictMap.dictPath, wordPosition.pos, wordPosition.len);
                let wordTreeHTML: WordTreeHTML = await dictionary.getHTML(dictMap.dictPath, wordPosition.pos, wordPosition.len);
                let dictName = dictMap.meta['NAME'];
                wordDefinitionList.push({
                    word: word,
                    wordTree: wordTree,
                    wordTreeHTML: wordTreeHTML,
                    resourcePath: dictMap.resource,
                    dictPath: dictMap.dictPath,
                    dictName: dictName == undefined ? 'Unknown' : dictName
                });
            }
        }
        return wordDefinitionList;
    }

    private async getFullDictMapList(): Promise<DictMap[]> {
        if(this._scanFolder.exists) {
            let folder: string = this._scanFolder.get;
            return await this._dictionaryFinder.scan(folder, this._dbPath);
        } else {
            let dbContents: string = await fsp.readFile(this._dbPath, 'r');
            let dictMapList: DictMap[] = JSON.parse(dbContents) as DictMap[];
            return dictMapList;
        }
    }
}

export interface WordDefinition {
    word: string;
    wordTree: WordTree;
    wordTreeHTML: WordTreeHTML;
    resourcePath: string;
    dictPath: string;
    dictName: string;
}