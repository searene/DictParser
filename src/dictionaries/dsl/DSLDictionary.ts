import { DSLWordTreeToHTMLConverter } from "./DSLWordTreeToHTMLConverter";
import { LineReader } from "../../LineReader";
import { BufferReader } from "../../BufferReader";
import { DSLStateMachine } from "./DSLStateMachine";
import { StateMachine } from "../../StateMachine";
import { WordTree } from "../../Tree";
import { Dictionary, WordTreeHTML } from "../../Dictionary";
import * as path from "path";
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

/**
 * Created by searene on 17-1-23.
 */
export class DSLDictionary extends Dictionary {
  public async getDefinition(
    dictionary: IDictionary,
    pos: number,
    len: number
  ): Promise<string> {
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
      let isInDefinition = false;
      const lineReader = new LineReader(dictFile);
      let previousLine: string;
      let entryIndex = 0;
      lineReader.on("line", (lineIndex: IBaseIndex) => {
        const line = lineIndex.contents;
        if (this.isMetaLine(isInDefinition, line)) {
          this.processMetaLine(line, result);
        } else if (this.isBetweenMetaAndDefinition(isInDefinition, line)) {
          isInDefinition = true;
        } else if (this.isEntry(isInDefinition, line)) {
          entryIndex = this.processEntry(lineIndex, result.wordIndex, previousLine, entryIndex);
        } else if (this.isDefinitionBody(isInDefinition, line)) {
          this.processDefinitionBody(lineIndex, result.wordIndex, entryIndex);
        }
        previousLine = line;
      });
      lineReader.on("end", () => {
        resolve(result);
      });
      lineReader.process();
    });
  }
  private isBetweenMetaAndDefinition = (isInDefinition: boolean, line: string): boolean => {
    return !isInDefinition && !line.startsWith("#");
  };
  private isMetaLine = (isInDefinition: boolean, line: string): boolean => {
    return !isInDefinition && line.startsWith("#");
  };
  private isDefinitionBody = (isInDefinition: boolean, line: string): boolean => {
    return isInDefinition && /^\s/.test(line);
  };
  private processDefinitionBody = (lineIndex: IBaseIndex, wordIndex: IBaseIndex[], maxEntryIndex: number): void => {
    const indexList = this.getIndexList(maxEntryIndex + 1, wordIndex.length);
    this.addLen(lineIndex.size, wordIndex, indexList);
  };
  private isEntry = (isInDefinition: boolean, line: string): boolean => {
    return isInDefinition && !/^\s/.test(line);
  };
  private isFirstEntry = (previousLine: string): boolean => {
    return previousLine.trim() === "" || /^\s/.test(previousLine);
  };

  /**
   * Return current entry index, start from 0
   */
  private processEntry = (
    lineIndex: IBaseIndex,
    wordIndex: IBaseIndex[],
    previousLine: string,
    lastEntryIndex: number
  ): number => {
    this.addEntryToWordIndex(lineIndex, wordIndex);
    if (this.isFirstEntry(previousLine)) {
      // entryIndex
      return 0;
    } else {
      const indexList = this.getIndexList(lastEntryIndex + 1, wordIndex.length);
      this.addLen(lineIndex.size, wordIndex, indexList);
      return lastEntryIndex + 1;
    }
  };
  /**
   * Return indexes of last reversedStartIndex numbers.
   *
   * For example, if reversedStartIndex is 3, totalLength is 10,
   * [7, 8, 9] will be returned.
   */
  private getIndexList = (reversedStartIndex: number, totalLength: number): number[] => {
    const result: number[] = [];
    for (let i = totalLength - reversedStartIndex; i < totalLength; i++) {
      result.push(i);
    }
    return result;
  };
  private addLen = (len: number, wordIndex: IBaseIndex[], indexList: number[]): void => {
    for (const i of indexList) {
      wordIndex[i].size += len;
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
  }
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
    for (const f of dirsAndFiles.normalFiles) {
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
    const annFilePath = this.getFile(basename, ".ann", dirsAndNormalFiles.normalFiles);
    const bmpFilePath = this.getFile(basename, ".bmp", dirsAndNormalFiles.normalFiles);
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
  private buildResourceIndex = async (
    resourceFile: Option<string>,
  ) => {
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
  }
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
    const resourceFilePrefixList = this.getResourceFilePrefixList(dslFileName);
    for (const resourceFilePrefix of resourceFilePrefixList) {
      const filename = resourceFilePrefix + ".files";
      if (dirsAndNormalFiles.dirs.indexOf(filename) > -1) {
        return option(path.resolve(dir, filename));
      }
    }
    return none;
  };
  private getZipResourceFile = (dir: string, dslFileName: string, dirsAndNormalFiles: IFileCategory): Option<string> => {
    const resourceFilePrefixList = this.getResourceFilePrefixList(dslFileName);
    for (const resourceFilePrefix of resourceFilePrefixList) {
      const filename = resourceFilePrefix + ".files.zip";
      if (dirsAndNormalFiles.normalFiles.indexOf(path.resolve(dir, filename)) > -1) {
        return option(path.resolve(dir, filename));
      }
    }
    return none;
  };
  private getResourceFilePrefixList = (dslFileName: string): string[] => {
    const result = [];
    if (dslFileName.endsWith(".dsl.dz")) {
      const basename = dslFileName.slice(0, dslFileName.length - ".dsl.dz".length);
      result.push(basename);
      result.push(basename + ".dsl");
    } else if (dslFileName.endsWith(".dsl")) {
      const basename = path.parse(dslFileName).name;
      result.push(basename);
    }
    return result;
  };
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
