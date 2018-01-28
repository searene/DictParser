import { TEST_RESOURCE_PATH } from './../Constant';
import { assert } from 'chai';
import { Log } from '../util/log';
import { DictZipParser } from '../dictionaries/dsl/DictZipParser';
import * as path from 'path';
import { DictParser } from "../index";

describe('Test DictParser', () => {

    let logger = Log.getLogger();

    let scanFolder1 = path.join(TEST_RESOURCE_PATH, 'scan');
    let scanFolder2 = path.join('/home/searene/Public/dz');
    let dbPath = path.join(TEST_RESOURCE_PATH, 'dictParser.db');

    it("#getWordDefinition", async () => {
        let dictParser = new DictParser(dbPath);
        dictParser.on('name', (dictionaryName: string) => {
            logger.info(`scanning ${dictionaryName}...`);
        });
        await dictParser.scan([scanFolder1, scanFolder2]);
        // let wordDefinitionList = await dictParser.getWordDefinition('trivial card');
        let wordDefinitionList = await dictParser.getWordDefinitions('example');
        console.log(wordDefinitionList);
    });

    it("#guessWord", async() => {
        let dictParser = new DictParser(dbPath);
        await dictParser.scan([scanFolder1, scanFolder2]);
        let wordCandidates = await dictParser.getWordCandidates('trivi');
        console.log(wordCandidates);
    });
});
