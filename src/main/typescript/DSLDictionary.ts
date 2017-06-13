import { Option, some } from 'ts-option';
import { DictMap, IndexMap, Meta } from './DictionaryFinder';
import { DSLWordTreeToHTMLConverter } from './DSLWordTreeToHTMLConverter';
import { LineReader, LineStats } from './LineReader';
import { BufferReader, DzBufferReader, SimpleBufferReader } from './BufferReader';
import { DSLStateMachine } from './DSLStateMachine';
import { StateMachine } from './StateMachine';
import { WordTree } from './Tree';
import { Dictionary, WordPosition, DictionaryStats, WordTreeHTML } from "./Dictionary";
import { DictZipParser } from "./dictzip/DictZipParser";
import { getEncodingInFile, getEncodingInBuffer } from "./EncodingDetector";
import * as fsp from 'fs-promise';
import * as path from 'path';
/**
 * Created by searene on 17-1-23.
 */

export class DSLDictionary extends Dictionary {

    protected _dictionarySuffixes: string[] = ['.dsl', '.dz'];

    private wordTreeHTMLConverter: DSLWordTreeToHTMLConverter = new DSLWordTreeToHTMLConverter();

    async getWordTree(dictFile: string, pos: number, len: number): Promise<WordTree> {
        let input: string = await this.getFileContents(dictFile, pos, len);
        let stateMachine: StateMachine = new DSLStateMachine(input);
        return stateMachine.run();
    }

    async getHTML(dictFile: string, pos: number, len: number): Promise<WordTreeHTML> {
        let wordTree: WordTree = await this.getWordTree(dictFile, pos, len);
        return this.wordTreeHTMLConverter.convertWordTreeToHTML(wordTree);
    }

    async getDictionaryStats(dictFile: string): Promise<DictionaryStats> {
        return new Promise<DictionaryStats>((resolve, reject) => {
            let indexMap: IndexMap = {};
            let meta: Meta = {};
            let isInDefinition = false;

            let lineReader = new LineReader(dictFile);
            let previousLine: string;

            // used to track the bytes of the current entry + definition block
            let wordTreeLength: number = 0;

            // word list of the current block
            let entryList: string[] = [];

            lineReader.on('line', (lineStats: LineStats) => {
                let line = lineStats.line;

                if(!isInDefinition && line.startsWith('#')) {
                    // meta data
                    let header: string[] = line.substring(1).split(/\s(.+)/);
                    meta[header[0]] = header[1].substring(1, header[1].length - 1);
                } else if(!isInDefinition && !line.startsWith('#')) {
                    isInDefinition = true;
                } else if(isInDefinition && !/^\s/.test(line)) {
                    // entry
                    if(previousLine.trim() == '' || /^\s/.test(previousLine)) {
                        // previous line is empty or definition,
                        // which means the current line is the beginning of a new entry
                        wordTreeLength = 0;
                        entryList = [];
                    }
                    wordTreeLength += lineStats.len;
                    let word: string = this.getIndexableWord(lineStats.line.trim());
                    entryList.push(word);
                    indexMap[word] = {pos: lineStats.pos, len: -1};
                } else if(isInDefinition && /^\s/.test(line)) {
                    wordTreeLength += lineStats.len;
                    entryList.forEach((entry) => {
                        indexMap[entry].len = wordTreeLength + indexMap[entryList[0]].pos - indexMap[entry].pos;
                    });
                }
                previousLine = line;
            });
            lineReader.on('end', () => {
                resolve({meta: meta, indexMap: indexMap});
            });
            lineReader.process();
        });
    }

    /**
     * Get word without texts surrounded with {}, texts surrounded with {}
     * should not be indexed.
     */
    private getIndexableWord(line: string): string {
        let isInUnindexablePart = false;
        let indexableWord = "";
        for(let i = 0; i < line.length; i++) {
            if(line.charAt(i) == '\\') {
                if(i == line.length - 1) {
                    indexableWord += "\\";
                    break;
                } else if(['{', '}'].indexOf(line.charAt(i + 1)) > -1) {
                    indexableWord += line.charAt(i + 1);
                    i++;
                }
            } else if(line.charAt(i) == '{') {
                isInUnindexablePart = true;
            } else if(line.charAt(i) == '}') {
                isInUnindexablePart = false;
            } else if(!isInUnindexablePart) {
                indexableWord += line.charAt(i);
            }
        }
        return indexableWord;
    }

    private getBufferReader(dictFile: string): BufferReader {
        let bufferReader: BufferReader;
        let ext = path.extname(dictFile);
        if(ext == '.dsl') {
            bufferReader = new SimpleBufferReader();
        } else if(ext == '.dz') {
            bufferReader = new DzBufferReader();
        } else {
            throw new Error(`${ext} file is not supported`);
        }
        return bufferReader;
    }
    private async getFileContents(dictFile: string, pos: number, len: number): Promise<string> {
        let bufferReader: BufferReader = this.getBufferReader(dictFile);
        let buffer: Buffer = await bufferReader.read(dictFile, pos, len);
        let encoding = (await bufferReader.getEncodingStat(dictFile)).encoding;
        return buffer.toString(encoding);
    }
}
