import { Log } from './../../main/typescript/util/log';
import { WordTree } from './../../main/typescript/Tree';
import { DSLStateMachine } from './../../main/typescript/DSLStateMachine';
import {StateMachine} from "../../main/typescript/StateMachine";
import * as mocha from 'mocha';

let logger = Log.getLogger();

describe("Test DSLStateMachine", () => {
    describe("Test run", () => {
        it.only("Simple entry test", () => {

            let simpleEntryContents = `trivial card
  Trivially simple card. The body of the card starts with spaces or TABs, that's all.`

            let stateMachine: StateMachine = new DSLStateMachine(simpleEntryContents);
            let wordTree: WordTree = stateMachine.run();

            wordTree.entry.forEach(entry => {
                logger.debug(entry);
            })
        });
    });
});