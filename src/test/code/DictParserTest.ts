import { assert } from 'chai';
import { ROOT_PATH } from '../../main/code/constant';
import { Log } from '../../main/code/util/log';
import { DictZipParser } from '../../main/code/dsl/dictzip/DictZipParser';
import * as path from 'path';
import { DictParser } from "../../main/code/DictParser";

describe('Test DictParser', () => {

    let logger = Log.getLogger();

    let scanFolder = path.join(ROOT_PATH, 'src/test/resources/scan');
    let dbPath = path.join(ROOT_PATH, 'src/test/resources/dictParser.db');

    it("#getWordDefinition", async () => {
        let dictParser = new DictParser(dbPath);
        await dictParser.scan(scanFolder);
        let wordDefinitionList = await dictParser.getWordDefinition('card');
        console.log(wordDefinitionList);
    });

    it("#guessWord", async() => {
        let dictParser = new DictParser(dbPath);
        await dictParser.scan(scanFolder);
        let wordCandidates = await dictParser.getWordCandidates('trivi');
        console.log(wordCandidates);
    })
});