import { Option } from "ts-option";
import { IBaseIndex } from "../model/IBaseIndex";
import { OSSpecificImplementationGetter } from "../os-specific/OSSpecificImplementationGetter";
import { IDatabase } from "..";

export class Sqlite {

  public static PARAM_TYPE_NUMBER = "number";
  public static PARAM_TYPE_STRING = "string";
  public static PARAM_TYPE_BOOLEAN = "boolean";

  public static init = async (dbPath: string) => {
    if (!(await OSSpecificImplementationGetter.fs.pathExists(dbPath))) {
      await OSSpecificImplementationGetter.fs.createFile(dbPath);
    }
    Sqlite._db = await OSSpecificImplementationGetter.sqlite.open(dbPath);
    await Sqlite.createAllTables();
  };
  /**
   * Used in INSERT and DELETE
   */
  public static getSQLParam = <T> (variable: T, sqlParamType: string): any => {
    if (sqlParamType === Sqlite.PARAM_TYPE_NUMBER) {
      return variable;
    } else if (sqlParamType === Sqlite.PARAM_TYPE_STRING) {
      const s = String(variable).replace(/'/g, "''");
      return `'${s}'`;
    } else if (sqlParamType === Sqlite.PARAM_TYPE_BOOLEAN) {
      return variable ? 1 : 0;
    } else {
      throw new Error(`type ${typeof sqlParamType} is not supported`);
    }
  };
  public static get db() {
    return Sqlite._db;
  }
  public static reset = async () => {
    await Sqlite.dropAllTables();
    await Sqlite.createAllTables();
  };
  public static createAllTables = async () => {
    return Promise.all([
      Sqlite._db.executeSql(`
          CREATE TABLE IF NOT EXISTS zip_entry (
            resource_path TEXT,
            offset INTEGER,
            name TEXT,
            is_directory INTEGER
          )`),
      Sqlite._db.executeSql(`
          CREATE TABLE IF NOT EXISTS dictionary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            word_count INTEGER,
            syn_path TEXT,
            index_path TEXT,
            resource_path TEXT,
            dict_path TEXT,
            ann_path TEXT,
            bmp_path TEXT,
            same_type_sequence TEXT,
            type TEXT
          )`),

      // INTEGER in Sqlite3 is not large enough,
      // so we use TEXT to store pos
      Sqlite._db.executeSql(`
          CREATE TABLE IF NOT EXISTS word_index (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            dictionary_id INTEGER,
            word TEXT,
            pos TEXT,
            len INTEGER
          )`),
      Sqlite._db.executeSql(`
          CREATE TABLE IF NOT EXISTS word_form (
            transformed_word TEXT,
            original_word TEXT
          )`),

      // INTEGER in Sqlite3 is not large enough,
      // so we use TEXT to store pos.
      // This table is used by StarDict
      Sqlite._db.executeSql(`
          CREATE TABLE IF NOT EXISTS resource_index (
            dictionary_id INTEGER,
            filename TEXT,
            pos TEXT,
            len INTEGER
          )
      `)
    ]);
  };
  public static dropAllTables = async () => {
    return Promise.all([
      Sqlite.dropTableIfExists("zip_entry"),
      Sqlite.dropTableIfExists("dictionary"),
      Sqlite.dropTableIfExists("word_index"),
      Sqlite.dropTableIfExists("word_form"),
      Sqlite.dropTableIfExists("resource_index")
    ]);
  };
  public static dropTableIfExists = async (
    tableName: string
  ): Promise<void> => {
    await Sqlite._db.executeSql(`DROP TABLE IF EXISTS ${tableName}`);
  };

  /**
   * Return dictionary_id
   */
  public static addDictionary = async (
    name: string,
    wordCount: Option<number>,
    synFile: Option<string>,
    indexFile: Option<string>,
    resourceFiles: string[],
    dictFile: Option<string>,
    annPath: Option<string>,
    bmpFilePath: Option<string>,
    sameTypeSequence: Option<string>,
    type: string
  ): Promise<number> => {
    const statement = await Sqlite._db.executeSql(
      `
      INSERT INTO dictionary 
        (name, word_count, syn_path, index_path, resource_path, dict_path, ann_path, bmp_path, same_type_sequence, type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        wordCount.isDefined ? wordCount.get : undefined,
        synFile.isDefined ? synFile.get : "",
        indexFile.isDefined ? indexFile.get : "",
        resourceFiles.length >= 0 ? resourceFiles.join(",") : "",
        dictFile.isDefined ? dictFile.get : "",
        annPath.isDefined ? annPath.get : "",
        bmpFilePath.isDefined ? bmpFilePath.get : "",
        sameTypeSequence.isDefined ? sameTypeSequence.get : "",
        type
      ]
    );
    return statement.lastId;
  };
  public static addWordIndexes = async (dictionaryId: number, wordIndexes: IBaseIndex[]): Promise<void> => {
    let insertStatement = `INSERT INTO word_index (dictionary_id, word, pos, len) VALUES`;
    const parameters = [];
    for (const wordPosition of wordIndexes) {
      parameters.push(`(
                       ${Sqlite.getSQLParam(dictionaryId, Sqlite.PARAM_TYPE_NUMBER)},
                       ${Sqlite.getSQLParam(wordPosition.contents, Sqlite.PARAM_TYPE_STRING)},
                       ${Sqlite.getSQLParam(wordPosition.offset, Sqlite.PARAM_TYPE_STRING)},
                       ${Sqlite.getSQLParam(wordPosition.size, Sqlite.PARAM_TYPE_NUMBER)}
        )`);
    }
    insertStatement = insertStatement + parameters.join(",\n");
    await Sqlite._db.executeSql(insertStatement);
  };
  public static addResourceIndex = async (dictionaryId: number, resourceIndex: IBaseIndex[]): Promise<void> => {
    let insertStatement = `INSERT INTO word_index (dictionary_id, filename, pos, len) VALUES`;
    const parameters = [];
    for (const indexItem of resourceIndex) {
      parameters.push(`(
                       ${Sqlite.getSQLParam(dictionaryId, Sqlite.PARAM_TYPE_NUMBER)},
                       ${Sqlite.getSQLParam(indexItem.contents, Sqlite.PARAM_TYPE_STRING)},
                       ${Sqlite.getSQLParam(indexItem.offset, Sqlite.PARAM_TYPE_STRING)},
                       ${Sqlite.getSQLParam(indexItem.size, Sqlite.PARAM_TYPE_NUMBER)}
        )`);
    }
    insertStatement = insertStatement + parameters.join(",\n");
    await Sqlite._db.executeSql(insertStatement);
  };
  private static _db: IDatabase;
}
