import { describe, it } from "mocha";
import { Sqlite } from "../util/Sqlite";

describe("#SqliteTest", () => {
  it("#test", async () => {
    await Sqlite.init("/tmp/dictParser.db");
    await Sqlite.db.run(`DROP TABLE IF EXISTS ?`, ["word_index"]);
  });
});

