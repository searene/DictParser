import * as sqlite from "sqlite";
import * as fse from "fs-extra";
import * as path from "path";

export class Sqlite {
  public static init = async (dbPath: string) => {
    if (!await fse.pathExists(dbPath)) {
      await fse.createFile(dbPath);
    }
    Sqlite._db = await sqlite.open(dbPath);
    await Sqlite.createAllTables();
  };
  /**
   * Used in INSERT and DELETE
   */
  public static getSQLParam = <T>(v: T): any => {
    if (v === null || v === undefined) {
      return null;
    }
    if (typeof v === "number") {
      return v;
    } else if (typeof v === "string") {
      const s = v.replace(/'/g, "''");
      return `'${s}'`;
    } else if (typeof v === "boolean") {
      return v ? 1 : 0;
    } else {
      throw new Error(`type ${typeof v} is not supported`);
    }
  };
  public static get db() {
    return Sqlite._db;
  }
  public static reset = async () => {
    await Sqlite.dropAllTables();
    await Sqlite.createAllTables();
  }
  public static createAllTables = async () => {
    return Promise.all([
      Sqlite._db.run(`
          CREATE TABLE IF NOT EXISTS zip_entry (
            resource_holder TEXT,
            flags INTEGER,
            method INTEGER,
            compressed_size INTEGER,
            size INTEGER,
            fname_len INTEGER,
            extra_len INTEGER,
            com_len INTEGER,
            offset INTEGER,
            name TEXT,
            is_directory INTEGER
          )`),
      Sqlite._db.run(`
          CREATE TABLE IF NOT EXISTS dictionary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            resource_holder TEXT,
            dict_path TEXT,
            type TEXT
          )`),
      Sqlite._db.run(`
          CREATE TABLE IF NOT EXISTS word_index (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dictionary_id INTEGER,
            word TEXT,
            pos INTEGER,
            len INTEGER
          )`),
      Sqlite._db.run(`
          CREATE TABLE IF NOT EXISTS word_form (
            transformed_word TEXT,
            original_word TEXT
          )`)
    ]);
  };
  public static dropAllTables = async () => {
    return Promise.all([
      Sqlite.dropTableIfExists("zip_entry"),
      Sqlite.dropTableIfExists("dictionary"),
      Sqlite.dropTableIfExists("word_index"),
      Sqlite.dropTableIfExists("word_form")
    ]);
  };
  public static dropTableIfExists = async (tableName: string): Promise<void> => {
    await Sqlite._db.run(`DROP TABLE IF EXISTS ${tableName}`, );
  }
  private static _db: sqlite.Database;
}
