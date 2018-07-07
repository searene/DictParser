import { describe, it } from "mocha";
import { Sqlite } from "../util/Sqlite";
import { none, option } from "ts-option";
import { DictionaryType } from "../model/DictionaryType";
import * as fse from "fs-extra";

describe("#SqliteTest", () => {
  it("#test", async () => {
    await fse.remove("/tmp/dictParser.db");
    await Sqlite.init("/tmp/dictParser.db");
    const dictId = await Sqlite.addDictionary("test dict", none, none, none, [], none, none, none, none, DictionaryType.DSL);
    const result = await Sqlite.db.all(`SELECT * FROM dictionary WHERE id = ${dictId}`);
    console.log(result);
  });
});

