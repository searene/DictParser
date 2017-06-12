import { assert } from 'chai';
import { ROOT_PATH } from './../../main/typescript/constant';
import { Log } from './../../main/typescript/util/log';
import { DictZipParser } from '../../main/typescript/dictzip/DictZipParser';
import * as path from 'path';
import { DictParser } from "../../main/typescript/DictParser";

describe('Test DictParser', () => {

    let logger = Log.getLogger();

    let scanFolder = path.join(ROOT_PATH, 'src/test/resources/scan');
    let dbPath = path.join(ROOT_PATH, 'src/test/resources/dictParser.db');

    it("#getWordDefinition", async () => {
        let dictParser = new DictParser(scanFolder, dbPath);
        let wordDefinitionList = await dictParser.getWordDefinition('trivial card');
    });
});