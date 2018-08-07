import * as sqlite from "sqlite";
import { Database } from "sqlite";
import { IDatabase, IResult, ISqlite } from "../..";

export class SqlitePC implements ISqlite {
  public async open(dbPath: string): Promise<IDatabase> {
    const db = await sqlite.open(dbPath);
    return this.toIDatabase(db);
  }
  private toIDatabase(db: Database): IDatabase {
    return {
      executeSql: async (statement: string, params?: any[]): Promise<IResult> => {
        const result = await db.run(statement, params);
        return {
          lastId: result.lastID,
          rowsAffected: result.changes
        };
      },
      getAll: async (sql: string, params?: any[]): Promise<any[]> => {
        if (params === undefined) {
          return await db.all(sql);
        } else {
          return await db.all(sql, ...params);
        }
      },
      getOne: async (sql: string, params: any[]): Promise<any[]> => {
        if (params === undefined) {
          return await db.get(sql);
        } else {
          return await db.get(sql, ...params);
        }
      },
      close: async (): Promise<void> => {
        await db.close();
      }
    }
  }
}
