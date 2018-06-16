import * as sqlite from "sqlite";

export class Sqlite {
  private _dbPath: string;
  private _db: sqlite.Database;
  private _initialized = false;
  constructor(dbPath: string) {
    this._dbPath = dbPath;
  }
  private init = async () => {
    this._db = await sqlite.open(this._dbPath);
    await Promise.all([
      this._db.run(`
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
    ]);
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
  public getDb = async () => {
    if (!this._initialized) {
      await this.init();
    }
    return this._db;
  };
}
