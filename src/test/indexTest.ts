import { TEST_RESOURCE_PATH } from './../Constant';
import { assert } from 'chai';
import { Log } from '../util/log';
import { DictZipParser } from '../dictionaries/dsl/DictZipParser';
import * as path from 'path';
import { DictParser } from "../index";

describe('Test DictParser', () => {

    let logger = Log.getLogger();

    // let scanFolder = path.join(TEST_RESOURCE_PATH, 'scan');
    let scanFolder = path.join('/home/searene/Public/dsl');
    let dbPath = path.join(TEST_RESOURCE_PATH, 'dictParser.db');

    it("#getWordDefinition", async () => {
        let dictParser = new DictParser(dbPath);
        dictParser.on('name', (dictionaryName: string) => {
            logger.info(`scanning ${dictionaryName}...`);
        });
        console.log(`scanFolder: ${scanFolder}`);
        await dictParser.scan(scanFolder);
        // let wordDefinitionList = await dictParser.getWordDefinition('trivial card');
        let wordDefinitionList = await dictParser.getWordDefinition('artefact');
        console.log(wordDefinitionList);
    });

    it("#guessWord", async() => {
        let dictParser = new DictParser(dbPath);
        await dictParser.scan(scanFolder);
        let wordCandidates = await dictParser.getWordCandidates('trivi');
        console.log(wordCandidates);
    });
});
