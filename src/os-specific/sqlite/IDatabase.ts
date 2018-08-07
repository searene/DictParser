import { IResult } from "./IResult";

export interface IDatabase {
  executeSql: (statement: string, params?: any[]) => Promise<IResult>;
  getAll: (sql: string, params?: any[]) => Promise<any[]>;
  getOne: (sql: string, params?: any[]) => Promise<any>;
  close: () => Promise<void>;
}