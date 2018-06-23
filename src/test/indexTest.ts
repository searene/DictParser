import {TEST_RESOURCE_PATH} from "../Constant";
import {assert} from 'chai';
import {DictZipParser} from '../dictionaries/dsl/DictZipParser';
import * as path from 'path';
import {DictParser} from "../index";
import * as fse from "fs-extra";
import * as os from 'os';

describe('Test DictParser', () => {

  let scanFolder1 = path.join(TEST_RESOURCE_PATH, 'scan');
  let scanFolder2 = path.join('/home/searene/Public/dictionaries');
  // let dbPath = path.join(TEST_RESOURCE_PATH, 'dictParser.db');
  const dbPath = "/tmp/dict-parser.db";

  it("#scanAndGetWordDefinition", async () => {
    let dictParser = new DictParser(dbPath);
    dictParser.on('name', (dictionaryName: string) => {
      console.log(`scanning ${dictionaryName}...`);
    });
    await dictParser.scan([scanFolder2]);
    // let wordDefinitionList = await dictParser.getWordDefinition('trivial card');
    let wordDefinitionList = await dictParser.getWordDefinitions('long');
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
    let dictParser = new DictParser(dbPath);
    await dictParser.scan([scanFolder1, scanFolder2]);
    let wordCandidates = await dictParser.getWordCandidates('trivi');
    console.log(wordCandidates);
  });

  it("#getWordDefinition", async () => {
    let dictParser = new DictParser(dbPath);
    let wordDefinitionList = await dictParser.getWordDefinitions('long');
    console.log(wordDefinitionList);
  });
});
