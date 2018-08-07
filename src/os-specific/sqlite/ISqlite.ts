import { IDatabase } from "./IDatabase";

export interface ISqlite {
  open: (dbPath: string) => Promise<IDatabase>;
}