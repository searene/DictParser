import { OS } from "./OS";
import { IPath } from "../os-specific/path/IPath";
import { IFileSystem } from "../os-specific/fs/IFileSystem";

export interface IDictParserOptions {
  sqliteDbPath: string;
  wordFormsFolder?: string;
  commonResourceDirectory?: string;
  fsImplementation?: IFileSystem;
  pathImplementation?: IPath;
  os?: OS;
}