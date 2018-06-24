import {TEST_RESOURCE_PATH} from "../Constant";
import {assert} from 'chai';
import {DictZipParser} from '../dictionaries/dsl/DictZipParser';
import * as path from 'path';
import {DictParser} from "../index";
import * as fse from "fs-extra";
import * as os from 'os';
import { describe, it } from "mocha";

// tslint:disable:no-console

describe('Test DictParser', () => {

  const scanFolder1 = path.join(TEST_RESOURCE_PATH, 'scan');
  const scanFolder2 = path.join('/home/searene/Public/dictionaries');
  const dbPath = path.join(TEST_RESOURCE_PATH, 'dictParser.db');
  // const dbPath = "/tmp/dict-parser.db";

  it("#scanAndGetWordDefinition", async () => {
    await fse.remove(dbPath);
    const dictParser = new DictParser(dbPath);
    await dictParser.init();
    dictParser.on('name', (dictionaryName: string) => {
      console.log(`scanning ${dictionaryName}...`);
    });
    await dictParser.scan([scanFolder2]);
    // let wordDefinitionList = await dictParser.getWordDefinition('trivial card');
    const wordDefinitionList = await dictParser.getWordDefinitions('long');
    console.log(wordDefinitionList);
  });
  it("#scan only", async () => {
    const dictParser = new DictParser(dbPath);
    dictParser.on('name', (dictionaryName: string) => {
      console.log(`scanning ${dictionaryName}...`);
    });
    await dictParser.scan([scanFolder2]);
  });

  it("#guessWord", async () => {
    const dictParser = new DictParser(dbPath);
    await dictParser.init();
    await dictParser.scan([scanFolder2]);
    const wordCandidates = await dictParser.getWordCandidates('trivi');
    console.log(wordCandidates);
  });

  it("#getWordDefinition", async () => {
    const dictParser = new DictParser(dbPath);
    await dictParser.init();
    const wordDefinitionList = await dictParser.getWordDefinitions('long');
    console.log(wordDefinitionList);
  });
});
