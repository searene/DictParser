import { OS } from "./OS";
import { IPath } from "../os-specific/path/IPath";
import { IFileSystem } from "../os-specific/fs/IFileSystem";
import { ISqlite } from "..";

export interface IDictParserOptions {
  sqliteDbPath: string;
  wordFormsFolder?: string;
  commonResourceDirectory?: string;
  fsImplementation: IFileSystem;
  pathImplementation: IPath;
  sqliteImplementation: ISqlite;
  os: OS;
}