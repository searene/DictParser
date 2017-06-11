import { LineReader } from './LineReader';
import { DSLStateMachine } from './DSLStateMachine';
import { StateMachine } from './StateMachine';
import { WordTree } from './Tree';
import { Dictionary, Index } from "./Dictionary";
import { DictZipParser } from "./dictzip/DictZipParser";
import { detectEncodingInBuffer } from "./DetectEncoding";
import * as DetectEncoding from "./DetectEncoding";
import * as fsp from 'fs-promise';
import * as path from 'path';
/**
 * Created by searene on 17-1-23.
 */

export class DSLDictionary extends Dictionary {

    protected _dictName: string = 'dsl';

    protected _dictionarySuffixes: string[] = ['.dsl', '.dz '];

    parse(contents: string): WordTree {
        let stateMachine: StateMachine = new DSLStateMachine(contents);
        return stateMachine.run();
    }

    private async getDictContents(dictFile: string): Promise<string> {
        let dictBinaryContents: Buffer;
        if(path.extname(dictFile) == 'dz') {
            let dictZipParser = new DictZipParser(dictFile);
            dictBinaryContents = await dictZipParser.parse(0);
        } else {
            dictBinaryContents = await fsp.readFile(dictFile);
        }

        let encoding = await detectEncodingInBuffer(dictBinaryContents);
        let dictContents: string = dictBinaryContents.slice(encoding.posAfterBom).toString(encoding.encoding);
        return dictContents;
    }

    private getStartingLineOfDefinitionPart(dictContents: string): number {
        let i = 0;
        // read line by line
        let lines: string[] = dictContents.split("\n");
        for(; i < lines.length; i++) {
            let line = lines[i];
            if(!line.startsWith("#") && line.trim().length != 0) {
                break;;
            }
        }
        return i;
    }

    async buildIndex(dictFile: string): Promise<Index[]> {
        return new Promise<Index[]>((resolve, reject) => {
            let indexList: Index[] = [];
            let isInDefinition = false;

            let lineReader = new LineReader(dictFile);
            lineReader.on('line', (data: [string, number]) => {
                let line = data[0];
                let pos = data[1];
                if(isInDefinition && line.trim().length > 0 && [' ', '\t'].indexOf(line[0]) == -1) {
                    indexList.push({word: this.getIndexableWord(line), pos: pos});
                } else if(!isInDefinition && line.trim().length > 0 && !line.startsWith('#')) {
                    isInDefinition = true;
                    indexList.push({word: this.getIndexableWord(line), pos: pos});
                }
            });
            lineReader.on('end', () => {
                resolve(indexList);
            });
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
}
