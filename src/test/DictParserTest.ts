import { assert } from 'chai';
import { ROOT_PATH } from '../constant';
import { Log } from '../util/log';
import { DictZipParser } from '../dictionaries/dsl/dictzip/DictZipParser';
import * as path from 'path';
import { DictParser } from "../DictParser";

describe('Test DictParser', () => {

    let logger = Log.getLogger();

    let scanFolder = path.join(ROOT_PATH, 'src/test/resources/scan');
    let dbPath = path.join(ROOT_PATH, 'src/test/resources/dictParser.db');

    it("#getWordDefinition", async () => {
        let dictParser = new DictParser(dbPath);
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