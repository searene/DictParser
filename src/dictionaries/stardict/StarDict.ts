import { Dictionary, DictionaryStats, WordPosition, WordTreeHTML } from "../../Dictionary";
import { WordTree } from "../../../lib/Tree";
import * as path from "path";
import * as fse from "fs-extra";

export class StarDict extends Dictionary {
  protected _dictionarySuffixes: string[] = [".ifo"];
  private idxSuffixes: string[] = [".idx", ".idx.gz"];
  private tdxSuffixes: string[] = [".tdx", ".tdx.gz"];
  private dictSuffixes: string[] = [".dict", ".dict.dz"];

  public async getDictionaryStats(dictFile: string): Promise<DictionaryStats> {
    return undefined;
  }

  public async getWordTree(dictPath: string, wordPosition: WordPosition): Promise<WordTree> {
    return undefined;
  }

  public async getWordTreeHTML(dictPath: string, resourceHolder: string, wordPosition: WordPosition): Promise<WordTreeHTML> {
    return undefined;
  }

  public async addDictionary(mainDictFile: string): Promise<boolean> {
    const dir = path.dirname(mainDictFile);
    const files = await fse.readdir(dir);
    const basename = path.basename(mainDictFile, path.extname(mainDictFile));
    const idxFile = this.getIdxFile(basename, files) || this.getTdxFile(basename, files);
    const dictFile = this.getDictFile(basename, files);
    if (idxFile === undefined || dictFile === undefined) {
      return false;
    }
    const resourceFiles = this.getResourceFiles(basename, dir, files); // could be [] if not found
    const synFile = this.getSynFile(basename, files); // could be undefined if not found
  }
  private getIdxFile = (basename: string, files: string[]) => {
    return this.getFile(basename, this.idxSuffixes, files);
  };
  private getTdxFile = (basename: string, files: string[]) => {
    return this.getFile(basename, this.tdxSuffixes, files);
  };
  private getDictFile = (basename: string, files: string[]) => {
    return this.getFile(basename, this.dictSuffixes, files);
  }
  private getResourceFiles = (basename: string, dir: string, files: string[]): string[] => {
    const resourceDbFiles = this.getResourceDbFiles(basename, files);
    if (resourceDbFiles.length !== 0) {
      return resourceDbFiles;
    } else if (this.resDirExists(dir, files)) {
      return ["res"];
    } else {
      return [];
    }
  }
  private getFile = (fileBaseName: string, fileSuffixes: string[], files: string[]) => {
    const idxFileNames = fileSuffixes.map(suffix => fileBaseName + suffix);
    for (const f of files) {
      for (const idxFileName of idxFileNames) {
        if (f === idxFileName) {
          return f;
        }
      }
    }
  }
  private getSynFile = (basename: string, files: string[]): string | undefined => {
    const synFile = basename + ".syn";
    if (files.indexOf(synFile) > -1) {
      return synFile;
    }
  };
  private getResourceDbFiles = (basename: string, files: string[]): string[] => {
    const rifoFile = basename + ".rifo";
    const ridxFile = basename + ".ridx";
    const rdictFile = basename + "rdict";
    if (files.indexOf(ridxFile) > -1 && files.indexOf(ridxFile) > -1 && files.indexOf(rdictFile) > -1) {
      return [rifoFile, ridxFile, rdictFile];
    }
    return [];
  };
  private resDirExists = async (dir: string, files: string[]): Promise<boolean> => {
    if (files.indexOf("res") > -1) {
      return (await fse.lstat(path.resolve(dir, "res"))).isDirectory();
    } else {
      return false;
    }
  };
}