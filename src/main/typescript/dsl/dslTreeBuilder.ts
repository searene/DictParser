import { DSLStateMachine } from './../DSLStateMachine';
import { StateMachine } from './../StateMachine';
import { WordTree } from './../Tree';
import { Dictionary, Index } from "../treeBuilder";
import { DSLCharState } from "./dslCharState";
import { DSLIndexManager } from "./dslIndexBuilder";
import jschardet from 'jschardet';
import fsp from 'fs-promise';
import path from 'path';
/**
 * Created by searene on 17-1-23.
 */

export class DSLDictionary extends Dictionary {

    protected _dictionarySuffixes: string[] = ['dsl', 'dz '];

    parse(contents: string): WordTree {
        let stateMachine: StateMachine = new DSLStateMachine(contents);
        return stateMachine.run();
    }

    async buildIndex(dictFile: string): Promise<Index[]> {
        let dictBinaryContents: Buffer;
        if(path.extname(dbFile) == 'dz') {
            dictBinaryContents = uncompressDictzip(dbFile);
        } else {
            dictBinaryContents = await fsp.readFile(dbFile);
        }

        let charset: string = jschardet.detect(dictBinaryContents).encoding;

        dictContents = dictContents.replace("\r", "");

        // read line by line
        let lines: string[] = dictContents.split("\n");
        let isInMetaData = true;
        for(let line of lines) {

            // skip meta data if we are in it
            if(line.startsWith("#") && isInMetaData) {
                continue;
            } else {
                isInMetaData = false;
            }


        }
    }
}
