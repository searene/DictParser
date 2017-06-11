import { Option, some } from 'ts-option';
import { DictMap } from './DictionaryFinder';
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
            let indexMap: Map<string, WordPosition> = new Map<string, WordPosition>();
            let meta: Map<string, string> = new Map<string, string>();
            let isInDefinition = false;

            let len = 0;
            let word: Option<string>;
            let lineReader = new LineReader(dictFile);
            lineReader.on('line', (lineStats: LineStats) => {
                let line = lineStats.line;
                let pos = lineStats.pos;

                let isFirstDefinition: boolean = !isInDefinition && line.trim().length > 0 && !line.startsWith('#');
                let isFollowingDefinition: boolean = isInDefinition && line.trim().length > 0 && [' ', '\t'].indexOf(line[0]) == -1;
                if(isInDefinition && line.startsWith('#')) {
                    // meta data
                    let header: string[] = line.substring(1).split(/\s(.+)/);
                    meta.set(header[0], header[1]);
                } else if(isFirstDefinition || isFollowingDefinition) {
                    if(isFirstDefinition) isInDefinition = true;
                    if(word.exists) {
                        indexMap.get(word.get)!.len = len;
                    }
                    word = some(this.getIndexableWord(line));
                    indexMap.set(word.get, {pos: pos, len:-1});
                    len = lineStats.length;
                } else {
                    len += line.length;
                }
            });
            lineReader.on('end', () => {
                let wordPosition = indexMap.get(word.get);
                if(wordPosition != undefined) {
                    wordPosition.len = len;
                }
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
