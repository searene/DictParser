import { DSLWordTreeToHTMLConverter } from "./DSLWordTreeToHTMLConverter";
import { LineReader } from "../../LineReader";
import { BufferReader } from "../../BufferReader";
import { DSLStateMachine } from "./DSLStateMachine";
import { WordTree } from "../../Tree";
import { Dictionary, WordTreeHTML } from "../../Dictionary";
import * as path from "../../os-specific/Path";
import { classifyFiles } from "../../util/FileUtil";
import { none, option, Option } from "ts-option";
import { IFileCategory } from "../../model/IFileCategory";
import { IDSLScanResult } from "../../model/IDSLScanResult";
import { Sqlite } from "../../util/Sqlite";
import { DictionaryType } from "../../model/DictionaryType";
import { HTMLCreator } from "../../HTMLCreator";
import { IDictionary } from "../..";
import { SimpleBufferReader } from "../../SimpleBufferReader";
import { DzBufferReader } from "../../DzBufferReader";
import { ZipReader } from "../../util/ZipReader";
import { IBaseIndex } from "../../model/IBaseIndex";
import { ListUtil } from "../../util/ListUtil";

/**
 * Created by searene on 17-1-23.
 */
export class DSLDictionary extends Dictionary {
  private readonly META_KEY_NAME = "NAME";
  private readonly META_KEY_INDEX_LANGUAGE = "INDEX_LANGUAGE";
  private readonly META_KEY_CONTENTS_LANGUAGE = "CONTENTS_LANGUAGE";
  private readonly META_KEY_INCLUDE = "INCLUDE";
  private readonly META_KEY_SOURCE_CODE_PAGE = "SOURCE_CODE_PAGE";
  private readonly META_KEY_LIST = [
    this.META_KEY_NAME,
    this.META_KEY_INDEX_LANGUAGE,
    this.META_KEY_CONTENTS_LANGUAGE,
    this.META_KEY_INCLUDE,
    this.META_KEY_SOURCE_CODE_PAGE
  ];

  public async getDefinition(dictionary: IDictionary, word: string, pos: number, len: number): Promise<string> {
    const wordTreeHTML: WordTreeHTML = await this.getWordTreeHTML(
      dictionary.dictPath,
      dictionary.resourcePath,
      pos,
      len
    );
    return HTMLCreator.getSingleCompleteDefinitionHTML(dictionary.name, wordTreeHTML.entry, wordTreeHTML.definition);
  }
  public async addDictionary(files: string[]): Promise<string[]> {
    const dslFiles = await this.getDSLFiles(files);
    const dictionaryFiles: string[] = [];
    for (const dslFile of dslFiles) {
      const currentDictionaryFiles = await this.addDictionaryByDSLFile(dslFile, files);
      currentDictionaryFiles.forEach((f: string) => dictionaryFiles.push(f));
    }
    return dictionaryFiles;
  }
  public async getWordTree(dictPath: string, pos: number, len: number): Promise<WordTree> {
    const input: string = await this.getFileContents(dictPath, pos, len);
    const stateMachine = new DSLStateMachine(input);
    return stateMachine.run();
  }

  public async getWordTreeHTML(
    dictPath: string,
    resourceHolder: string,
    pos: number,
    len: number
  ): Promise<WordTreeHTML> {
    const wordTree = await this.getWordTree(dictPath, pos, len);
    return await new DSLWordTreeToHTMLConverter(dictPath, resourceHolder).convertWordTreeToHTML(wordTree);
  }

  public async scanDSL(dictFile: string): Promise<IDSLScanResult> {
    return new Promise<IDSLScanResult>((resolve, reject) => {
      const result: IDSLScanResult = {
        dictName: "",
        wordIndex: []
      };
      const lineReader = new LineReader(dictFile);
      let entryIndex = 0;
      let previousLine = "";
      lineReader.on("line", (lineIndex: IBaseIndex) => {
        const line = lineIndex.contents;
        if (this.isMetaLine(line)) {
          this.processMetaLine(line, result);
        } else if (this.isEntry(line)) {
          entryIndex = this.processEntry(lineIndex, result.wordIndex, entryIndex, previousLine);
        } else if (this.isDefinitionBody(line)) {
          this.processDefinitionBody(lineIndex, result.wordIndex, entryIndex);
        }
        previousLine = lineIndex.contents;
      });
      lineReader.on("end", () => {
        resolve(result);
      });
      lineReader.process();
    });
  }
  private isMetaLine = (line: string): boolean => {
    return this.startsWithMetaKey(line);
  };
  private isDefinitionBody = (line: string): boolean => {
    return this.startWithSpaceOrTab(line);
  };
  private processDefinitionBody = (lineIndexItem: IBaseIndex, wordIndex: IBaseIndex[], maxEntryIndex: number): void => {
    const correspondingEntryIndexList = ListUtil.buildList(maxEntryIndex + 1, wordIndex.length - 1);
    const startIndex = correspondingEntryIndexList[0];
    const endIndex = correspondingEntryIndexList[correspondingEntryIndexList.length - 1];
    this.addSize(
      lineIndexItem.size,
      wordIndex.slice(startIndex, endIndex + 1)
    );
  };
  private isEntry = (line: string): boolean => {
    return !this.startWithSpaceOrTab(line) && !this.startsWithMetaKey(line);
  };
  private startWithSpaceOrTab = (s: string): boolean => {
    return s.startsWith(" ") || s.startsWith("\t");
  };
  private startsWithMetaKey = (s: string): boolean => {
    const metaKeyWithHashList = this.META_KEY_LIST.map(k => "#" + k);
    for (const metaKeyWithHash of metaKeyWithHashList) {
      if (s.startsWith(metaKeyWithHash)) {
        return true;
      }
    }
    return false;
  };

  /**
   * Return current entry index, starting from 0
   */
  private processEntry = (
    lineIndex: IBaseIndex,
    wordIndex: IBaseIndex[],
    lastEntryIndex: number,
    previousLine: string
  ): number => {
    this.addEntryToWordIndex(lineIndex, wordIndex);
    if (this.isFirstEntry(previousLine)) {
      // entryIndex
      return 0;
    } else {
      const correspondingEntryIndexList = ListUtil.buildList(lastEntryIndex + 1, wordIndex.length - 1);
      const startIndex = correspondingEntryIndexList[0];
      const endIndex = correspondingEntryIndexList[correspondingEntryIndexList.length - 1];
      this.addSize(
        lineIndex.size,
        wordIndex.slice(startIndex, endIndex + 1)
      );
      return lastEntryIndex + 1;
    }
  };
  private isFirstEntry = (previousLine: string): boolean => {
    return !this.isEntry(previousLine);
  }
  private addSize = (size: number, wordIndexList: IBaseIndex[]): void => {
    for (const wordIndex of wordIndexList) {
      wordIndex.size += size;
    }
  };
  private addEntryToWordIndex = (lineIndex: IBaseIndex, wordIndex: IBaseIndex[]) => {
    wordIndex.push({
      contents: this.getWord(lineIndex.contents),
      offset: lineIndex.offset,
      size: lineIndex.size
    });
  };
  private processMetaLine = (metaLine: string, dslScanResult: IDSLScanResult) => {
    const { key, value } = this.parseKeyAndValue(metaLine);
    if (key === "NAME") {
      dslScanResult.dictName = value;
      this._dictionaryScanProgressReporter.emit("name", value);
    }
  };

  private parseKeyAndValue = (metaLine: string) => {
    const header: string[] = metaLine.substring(1).split(/\s(.+)/);
    const key = header[0];
    const value = header[1].substring(1, header[1].length - 1);
    return { key, value };
  };

  /**
   * Get word without texts surrounded with {}, texts surrounded with {}
   * should not be indexed.
   */
  private getWord(line: string): string {
    let isInUnindexablePart = false;
    let indexableWord = "";
    for (let i = 0; i < line.length; i++) {
      if (line.charAt(i) === "\\") {
        if (i === line.length - 1) {
          indexableWord += "\\";
          break;
        } else if (["{", "}"].indexOf(line.charAt(i + 1)) > -1) {
          indexableWord += line.charAt(i + 1);
          i++;
        }
      } else if (line.charAt(i) === "{") {
        isInUnindexablePart = true;
      } else if (line.charAt(i) === "}") {
        isInUnindexablePart = false;
      } else if (!isInUnindexablePart) {
        indexableWord += line.charAt(i);
      }
    }
    return indexableWord;
  }

  private getBufferReader = (dictFile: string): BufferReader => {
    let bufferReader: BufferReader;
    const ext = path.extname(dictFile);
    if (ext === ".dsl") {
      bufferReader = new SimpleBufferReader();
    } else if (ext === ".dz") {
      bufferReader = new DzBufferReader();
    } else {
      throw new Error(`${ext} file is not supported`);
    }
    return bufferReader;
  };
  private async getFileContents(dictFile: string, pos: number, len: number): Promise<string> {
    const bufferReader: BufferReader = this.getBufferReader(dictFile);
    await bufferReader.open(dictFile);
    const buffer: Buffer = await bufferReader.read(pos, len);
    const encoding = (await bufferReader.getEncodingStat()).encoding;
    await bufferReader.close();
    return buffer.toString(encoding);
  }
  private getDSLFiles = async (files: string[]): Promise<string[]> => {
    const dirsAndFiles = await classifyFiles(files);
    const result: string[] = [];
    for (const f of dirsAndFiles.normalFilePaths) {
      if (f.endsWith(".dsl") || f.endsWith(".dsl.dz")) {
        result.push(f);
      }
    }
    return result;
  };
  /**
   *
   * @param {string} dslFile absolute path
   * @param {string[]} files absolute path
   * @returns {Promise<string[]>} absolute path
   */
  private addDictionaryByDSLFile = async (dslFile: string, files: string[]): Promise<string[]> => {
    const basename = this.getBaseName(dslFile);
    const dirsAndNormalFiles = await classifyFiles(files);
    const annFilePath = this.getFile(basename, ".ann", dirsAndNormalFiles.normalFilePaths);
    const bmpFilePath = this.getFile(basename, ".bmp", dirsAndNormalFiles.normalFilePaths);
    const resourceFile = this.getResourceFile(dslFile, dirsAndNormalFiles);
    const dictScanResult = await this.scanDSL(dslFile);
    const wordCount = dictScanResult.wordIndex.length;
    const dictionaryId = await Sqlite.addDictionary(
      dictScanResult.dictName,
      option(wordCount),
      none,
      none,
      resourceFile.isDefined ? [resourceFile.get] : [],
      option(dslFile),
      annFilePath,
      bmpFilePath,
      none,
      DictionaryType.DSL
    );
    await Sqlite.addWordIndex(dictionaryId, dictScanResult.wordIndex);
    await this.buildResourceIndex(resourceFile);
    return this.getUsedDictionaryFiles(dslFile, annFilePath, bmpFilePath, resourceFile);
  };
  private buildResourceIndex = async (resourceFile: Option<string>) => {
    if (resourceFile.isDefined && path.extname(resourceFile.get) === ".zip") {
      const zipReader = new ZipReader(resourceFile.get);
      await zipReader.buildZipIndex();
    }
  };
  private getUsedDictionaryFiles = (
    dslFile: string,
    annFilePath: Option<string>,
    bmpFilePath: Option<string>,
    resourceFile: Option<string>
  ): string[] => {
    const result = [dslFile];
    this.addToListIfDefined(annFilePath, result);
    this.addToListIfDefined(bmpFilePath, result);
    this.addToListIfDefined(resourceFile, result);
    return result;
  };
  private addToListIfDefined = <T>(opt: Option<T>, list: T[]): void => {
    if (opt.isDefined) {
      list.push(opt.get);
    }
  };
  private getResourceFile = (dslFile: string, dirsAndNormalFiles: IFileCategory): Option<string> => {
    const dir = path.dirname(dslFile);
    const dslFileName = path.basename(dslFile);
    const zipResourceFile = this.getZipResourceFile(dir, dslFileName, dirsAndNormalFiles);
    if (zipResourceFile.isDefined) {
      return zipResourceFile;
    }
    return this.getResourceFolder(dir, dslFileName, dirsAndNormalFiles);
  };
  private getResourceFolder = (dir: string, dslFileName: string, dirsAndNormalFiles: IFileCategory): Option<string> => {
    for (const dirPath of dirsAndNormalFiles.dirPaths) {
      const dirName = path.basename(dirPath);
      const firstPartOfDSLFileName = dslFileName.split(".")[0];
      if (dirName.startsWith(firstPartOfDSLFileName) && dirName.endsWith(".files")) {
        return option(dirPath);
      }
    }
    return none;
  };
  private getZipResourceFile = (
    dir: string,
    dslFileName: string,
    dirsAndNormalFiles: IFileCategory
  ): Option<string> => {
    for (const normalFilePath of dirsAndNormalFiles.normalFilePaths) {
      const normalFileName = path.basename(normalFilePath);
      const firstPartOfDSLFileName = dslFileName.split(".")[0];
      if (normalFileName.startsWith(firstPartOfDSLFileName) && normalFileName.endsWith(".zip")) {
        return option(normalFilePath);
      }
    }
    return none;
  };
  // private getResourceFilePrefixList = (dslFileName: string): string[] => {
  //   const result = [];
  //   if (dslFileName.endsWith(".dsl.dz")) {
  //     const basename = dslFileName.slice(0, dslFileName.length - ".dsl.dz".length);
  //     result.push(basename);
  //     result.push(basename + ".dsl");
  //   } else if (dslFileName.endsWith(".dsl")) {
  //     const basename = path.parse(dslFileName).name;
  //     result.push(basename);
  //   }
  //   return result;
  // };
  private getBaseName = (dictFile: string): string => {
    if (dictFile.endsWith(".dsl")) {
      return dictFile.substring(0, dictFile.length - ".dsl".length);
    } else if (dictFile.endsWith(".dsl.dz")) {
      return dictFile.substring(0, dictFile.length - ".dsl.dz".length);
    } else {
      throw new Error("dictFile is not supported: " + dictFile);
    }
  };
  private getFile = (basename: string, ext: string, normalFiles: string[]): Option<string> => {
    const fullFilePath = basename + ext;
    for (const normalFile of normalFiles) {
      if (normalFile === fullFilePath) {
        return option(normalFile);
      }
    }
    return none;
  };
}
