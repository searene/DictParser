import * as path from "path";
import { DictParser, OS } from "../index";
import * as fse from "fs-extra";
import { describe, it } from "mocha";
import { FileSystemPC } from "./os-specific/FileSystemPC";
import { PathPC } from "./os-specific/PathPC";
import { SqlitePC } from "./os-specific/SqlitePC";
import { Buffer } from "buffer";
import { FileUtil } from "../util/FileUtil";
import { OSSpecificImplementationGetter } from "../os-specific/OSSpecificImplementationGetter";

// tslint:disable:no-console

describe('Test DictParser', () => {

  const scanFolder2 = path.join('/home/searene/Public/dictionaries');
  // const scanFolder2 = path.join('/home/searene/Documents/FreshDict');
  // const dbPath = path.join(TEST_RESOURCE_PATH, 'dictParser.db');
  const dbPath = "/tmp/dict-parser.db";

  it("#scanAndGetWordDefinition", async () => {
    await fse.remove(dbPath);
    const dictParser = new DictParser({
      sqliteDbPath: dbPath,
      fsImplementation: new FileSystemPC(),
      pathImplementation: new PathPC(),
      sqliteImplementation: new SqlitePC(),
      commonResourceDirectory: "src/resources",
      wordFormsFolder: "",
      os: OS.PC
    });
    await dictParser.init();
    dictParser.on('name', (dictionaryName: string) => {
      console.log(`scanning ${dictionaryName}...`);
    });
    await dictParser.scan([scanFolder2]);
    // let wordDefinitionList = await dictParser.getWordDefinition('trivial card');
    const wordDefinitionList = await dictParser.getWordDefinitions("long");
    console.log(wordDefinitionList);
  });
  it("#scan only", async () => {
    const dictParser = new DictParser({
      sqliteDbPath: dbPath,
      fsImplementation: new FileSystemPC(),
      pathImplementation: new PathPC(),
      sqliteImplementation: new SqlitePC(),
      commonResourceDirectory: "",
      wordFormsFolder: "",
      os: OS.PC
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
      pathImplementation: new PathPC(),
      sqliteImplementation: new SqlitePC(),
      commonResourceDirectory: "",
      wordFormsFolder: "",
      os: OS.PC
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
      pathImplementation: new PathPC(),
      sqliteImplementation: new SqlitePC(),
      commonResourceDirectory: "",
      wordFormsFolder: "",
      os: OS.PC
    });
    await dictParser.init();
    const wordDefinitionList = await dictParser.getWordDefinitions('long');
    console.log(wordDefinitionList);
  });
  it("#bufferTest", async () => {
    const buffer = Buffer.from("2020540A202020E280A2E280A20A", "hex");
    const s = buffer.toString("utf8");
    const lines = s.split("\n");
    for (const line of lines) {
      console.log("check");
      console.log(line);
      console.log(line.startsWith(" "));
    }
  });
});
