import { TEST_RESOURCE_PATH } from './../Constant';
import { assert } from 'chai';
import { Log } from '../util/log';
import { DictZipParser } from '../dictionaries/dsl/DictZipParser';
import * as path from 'path';
import { DictParser } from "../index";

describe('Test DictParser', () => {

    let logger = Log.getLogger();

    let scanFolder = path.join(TEST_RESOURCE_PATH, 'scan');
    let dbPath = path.join(TEST_RESOURCE_PATH, 'dictParser.db');

    it("#getWordDefinition", async () => {
        let dictParser = new DictParser(dbPath);
        dictParser.on('name', (dictionaryName: string) => {
            logger.info(`scanning ${dictionaryName}...`);
        });
        await dictParser.scan(scanFolder);
        let wordDefinitionList = await dictParser.getWordDefinition('trivial card');
        console.log(wordDefinitionList);
    });

    it("#guessWord", async() => {
        let dictParser = new DictParser(dbPath);
        await dictParser.scan(scanFolder);
        let wordCandidates = await dictParser.getWordCandidates('trivi');
        console.log(wordCandidates);
    });
});
