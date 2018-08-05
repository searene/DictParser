import {PathPC} from "../os-specific/path/PathPC";
import {OSSpecificImplementationGetter} from "../os-specific/OSSpecificImplementationGetter";
OSSpecificImplementationGetter.path = new PathPC();
import {assert} from 'chai';
import {DictZipParser} from '../dictionaries/dsl/DictZipParser';
import * as path from 'path';
import {DictParser} from "../index";
import * as fse from "fs-extra";
import * as os from 'os';
import { describe, it } from "mocha";
import { FileSystemPC } from "../os-specific/fs/FileSystemPC";

// tslint:disable:no-console

describe('Test DictParser', () => {

  const scanFolder2 = path.join('/home/searene/Public/dictionaries');
  // const scanFolder2 = path.join('/home/searene/Documents/dictionaries');
  // const dbPath = path.join(TEST_RESOURCE_PATH, 'dictParser.db');
  const dbPath = "/tmp/dict-parser.db";

  it("#scanAndGetWordDefinition", async () => {
    await fse.remove(dbPath);
    const dictParser = new DictParser({
      sqliteDbPath: dbPath,
      fsImplementation: new FileSystemPC(),
      pathImplementation: new PathPC()
    });
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
    const dictParser = new DictParser({
      sqliteDbPath: dbPath,
      fsImplementation: new FileSystemPC(),
      pathImplementation: new PathPC()
    });
    dictParser.on('name', (dictionaryName: string) => {
      console.log(`scanning ${dictionaryName}...`);
    });
    await dictParser.scan([scanFolder2]);
  });

  it("#guessWord", async () => {
    const dictParser = new DictParser({
      sqliteDbPath: dbPath,
      fsImplementation: new FileSystemPC(),
      pathImplementation: new PathPC()
    });
    await dictParser.init();
    await dictParser.scan([scanFolder2]);
    const wordCandidates = await dictParser.getWordCandidates('trivi');
    console.log(wordCandidates);
  });

  it("#getWordDefinition", async () => {
    const dictParser = new DictParser({
      sqliteDbPath: dbPath,
      fsImplementation: new FileSystemPC(),
      pathImplementation: new PathPC()
    });
    await dictParser.init();
    const wordDefinitionList = await dictParser.getWordDefinitions('long');
    console.log(wordDefinitionList);
  });
});
