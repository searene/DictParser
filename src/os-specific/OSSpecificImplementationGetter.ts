import { IPath } from "./path/IPath";
import { IFileSystem } from "./fs/IFileSystem";
import { ISqlite, OS } from "..";

export class OSSpecificImplementationGetter {
  private static _fs: IFileSystem;
  private static _path: IPath;
  private static _sqlite: ISqlite;
  private static _os: OS;
  static get fs() {
    return this._fs;
  }
  static set fs(fs) {
    this._fs = fs;
  }
  static get path() {
    return this._path;
  }
  static set path(path) {
    this._path = path;
  }
  static get sqlite(): ISqlite {
    return this._sqlite;
  }
  static set sqlite(value: ISqlite) {
    this._sqlite = value;
  }
  static get os() {
    return this._os;
  }
  static set os(os) {
    this._os = os;
  }
}