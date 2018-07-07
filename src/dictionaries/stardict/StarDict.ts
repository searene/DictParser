import { Dictionary, WordPosition } from "../../Dictionary";
import * as path from "path";
import * as fse from "fs-extra";
import { Sqlite } from "../../util/Sqlite";
import { decompressGzFile, getNormalFiles, readFileAsLines } from "../../util/FileUtil";
import { none, option, Option } from "ts-option";
import { DictionaryType } from "../../model/DictionaryType";
import { readUInt64BE } from "../../util/BufferUtil";
import { IWordPos } from "../../model/IWordPos";
import { DzBufferReader } from "../../DzBufferReader";
import { SimpleBufferReader } from "../../../lib/BufferReader";
import { IStarDictDefinitionField } from "../../model/IStarDictDefinitionField";
import { IDictionary } from "../..";
import { StarDictResource } from "../../model/StarDictResource";
import { IFileIndex } from "../../model/IFileIndex";
import { start } from "repl";
import { IBaseIndex } from "../../model/IBaseIndex";
import { Encoding } from "tslint/lib/utils";
import { EncodingUtil } from "../../util/EncodingUtil";
import { HTMLCreator } from "../../HTMLCreator";

export class StarDict extends Dictionary {
  private idxSuffixes: string[] = [".idx", ".idx.gz"];
  private tdxSuffixes: string[] = [".tdx", ".tdx.gz"];
  private dictSuffixes: string[] = [".dict", ".dict.dz"];

  private STAR_DICT_WORD_DATA_TYPE_PURE_TEXT = "m";
  private STAR_DICT_WORD_DATA_TYPE_PANGO_MARKUP = "g";
  private STAR_DICT_WORD_DATA_TYPE_PHONETIC = "t";
  private STAR_DICT_WORD_DATA_TYPE_XDXF = "x";
  private STAR_DICT_WORD_DATA_TYPE_YINBIAO_KANA = "y";
  private STAR_DICT_WORD_DATA_TYPE_POWER_WORD = "k";
  private STAR_DICT_WORD_DATA_TYPE_WIKI = "w";
  private STAR_DICT_WORD_DATA_TYPE_HTML = "h";
  private STAR_DICT_WORD_DATA_TYPE_WORD_NET = "n";
  private STAR_DICT_WORD_DATA_TYPE_RESOURCE = "r";

  // absoluteFilePath -> file contents in lines
  private fileCache: Map<string, string[]> = new Map<string, string[]>();

  public async getDefinition(dictionary: IDictionary, pos: number, len: number): Promise<string> {
    const sameTypeSequence = dictionary.sameTypeSequence === "" ? none : option(dictionary.sameTypeSequence);
    const fields = await this.getDefinitionFields(dictionary.dictPath, sameTypeSequence, pos, len);
    return this.parseDefinitionFields(fields);
  }

  /**
   * Return files which are used by StarDict.
   */
  public async addDictionary(files: string[]): Promise<string[]> {
    const dictionaryFiles: string[] = [];
    const ifoFiles = await this.getIfoFiles(files);
    for (const ifoFile of ifoFiles) {
      const currentDictionaryFiles = await this.addDictionaryByIfoFile(ifoFile);
      currentDictionaryFiles.forEach((f: string) => dictionaryFiles.push(f));
    }
    return dictionaryFiles;
  }
  private parseDefinitionFields = (fields: IStarDictDefinitionField[]): string => {
    let result = "";
    for (const field of fields) {
      result += this.parseDefinitionField(field) + "\n";
    }
    return result;
  };
  private parseDefinitionField = async (field: IStarDictDefinitionField): Promise<string> => {
    if (
      [
        this.STAR_DICT_WORD_DATA_TYPE_PURE_TEXT,
        this.STAR_DICT_WORD_DATA_TYPE_PANGO_MARKUP,
        this.STAR_DICT_WORD_DATA_TYPE_PHONETIC,
        this.STAR_DICT_WORD_DATA_TYPE_XDXF,
        this.STAR_DICT_WORD_DATA_TYPE_YINBIAO_KANA,
        this.STAR_DICT_WORD_DATA_TYPE_HTML
      ].indexOf(field.type) > -1
    ) {
      const lastByte = field.data.slice(field.data.length - 1, field.data.length);
      const buffer = lastByte.readUInt8(0) === 0 ? field.data.slice(0, field.data.length - 1) : field.data;
      return this.parseFieldContents(buffer.toString("UTF-8"), field.type);
    } else if (field.type === this.STAR_DICT_WORD_DATA_TYPE_RESOURCE) {
      const resourceList = this.getResourceList(field);
      return await this.convertResourceListToHTML(resourceList);
    } else {
      throw new Error(`StarDict Type ${field.type} is not supported.`);
    }
  };
  private convertResourceListToHTML = async (resourceList: StarDictResource[]): Promise<string> => {
    let html = "";
    for (const resource of resourceList) {
      switch (resource.type) {
        case StarDictResource.TYPE_IMG:
          html += await this.getImgResourceHTML(resource.fileName);
          break;
        case StarDictResource.TYPE_SND:
          html += await this.getSndResourceHTML(resource.fileName);
          break;
        case StarDictResource.TYPE_VDO:
          html += await this.getVdoResourceHTML(resource.fileName);
          break;
        case StarDictResource.TYPE_ATT:
          html += await this.getAttResourceHTML(resource.fileName);
          break;
      }
    }
    return html;
  };
  private getImgResourceHTML = async (fileName: string): Promise<string> => {
    const base64 = await EncodingUtil.readBase64FromFile(fileName);
    const ext = path.extname(fileName);
    return HTMLCreator.getImageHTML(ext, base64);
  };
  private getSndResourceHTML = async (fileName: string): Promise<string> => {
    const base64 = await EncodingUtil.readBase64FromFile(fileName);
    const ext = path.extname(fileName);
    return HTMLCreator.getSoundHTML(ext, base64);
  };
  private getVdoResourceHTML = async (fileName: string): Promise<string> => {
    return HTMLCreator.getNotSupportedHTML("Video is not supported.");
  };
  private getAttResourceHTML = async (fileName: string): Promise<string> => {
    return HTMLCreator.getNotSupportedHTML("Attachment is not supported.");
  };

  private parseFieldContents = (contents: string, type: string): string => {
    switch (type) {
      case this.STAR_DICT_WORD_DATA_TYPE_PURE_TEXT:
      case this.STAR_DICT_WORD_DATA_TYPE_PHONETIC:
      case this.STAR_DICT_WORD_DATA_TYPE_YINBIAO_KANA:
        return contents;
      case this.STAR_DICT_WORD_DATA_TYPE_HTML:
        // TODO replace resources with their contents
        return contents;
    }
    throw new Error(`Type ${type} is not supported. Contents: ${contents}`);
  };
  private getResourceList = (field: IStarDictDefinitionField): StarDictResource[] => {
    const text = field.data.slice(0, field.data.length - 1).toString("UTF-8"); // remove the last \0
    const lines = text.split("\n");
    return this.getResourceListFromLines(lines);
  };
  private getResourceListFromLines = (lines: string[]): StarDictResource[] => {
    const result: StarDictResource[] = [];
    for (const line of lines) {
      const tuple = line.split(":");
      result.push(new StarDictResource(tuple[0], tuple[1]));
    }
    return result;
  };
  private addDictionaryByIfoFile = async (ifoFile: string): Promise<string[]> => {
    const dir = path.dirname(ifoFile);
    const files = await fse.readdir(dir);
    const dictName = path.basename(ifoFile, path.extname(ifoFile));
    const indexFile = this.getIndexFile(dictName, files);
    const dictFile = this.getDictFile(dictName, files);
    const resourceFiles = this.getResourceFiles(dictName, dir, files); // could be [] if not found
    const synFile = this.getSynFile(dictName, files);
    const wordCount = await this.getWordCount(dir, ifoFile);
    const idxOffsetBits = await this.getIdxOffsetBits(ifoFile);
    const sameTypeSequence = await this.getSameTypeSequence(dir, ifoFile);
    if (!this.isDictionaryValid(dictFile, indexFile)) {
      return [];
    }
    const dictionaryId = await Sqlite.addDictionary(
      dictName,
      wordCount,
      synFile,
      indexFile,
      resourceFiles,
      dictFile,
      none,
      none,
      sameTypeSequence,
      DictionaryType.STAR_DICT
    );
    await this.buildWordIndex(indexFile.get, dictionaryId, ifoFile, synFile, idxOffsetBits);
    await this.buildResourceIndex(dictionaryId, resourceFiles, idxOffsetBits);
    return this.getDictionaryFiles(indexFile, dictFile, resourceFiles, synFile);
  };
  private buildResourceIndex = async (
    dictionaryId: number,
    resourceFiles: string[],
    idxOffsetBits: number
  ): Promise<void> => {
    if (resourceFiles.length === 1 && resourceFiles[0] === "res") {
      return;
    }
    const ridxFile = this.getRidxFile(resourceFiles);
    if (ridxFile.isEmpty) {
      return;
    }
    const ridxFileBuffer = await fse.readFile(ridxFile.get);
    const resourceIndex = await this.getIndexFromIdxFileContents(ridxFileBuffer, idxOffsetBits);
    await Sqlite.addResourceIndex(dictionaryId, resourceIndex);
  };
  private getRidxFile = (resourceFiles: string[]): Option<string> => {
    const ridxArray = resourceFiles.filter(f => f.endsWith(".ridx"));
    if (ridxArray.length !== 0) {
      return option(ridxArray[0]);
    } else {
      return none;
    }
  };
  private getRawDefinitionText = async (dictFile: string, pos: number, len: number): Promise<Buffer> => {
    const bufferReader = path.extname(dictFile) === ".dz" ? new DzBufferReader() : new SimpleBufferReader();
    const buffer: Buffer = await bufferReader.read(pos, len);
    await bufferReader.close();
    return buffer;
  };
  private getDefinitionFields = async (
    dictFile: string,
    sameTypeSequence: Option<string>,
    pos: number,
    len: number
  ): Promise<IStarDictDefinitionField[]> => {
    const rawDefinitionText = await this.getRawDefinitionText(dictFile, pos, len);
    return this.parseRawDefinitionBuffer(rawDefinitionText, sameTypeSequence);
  };
  private parseRawDefinitionBuffer = (
    rawDefinitionBuffer: Buffer,
    sameTypeSequence: Option<string>
  ): IStarDictDefinitionField[] => {
    if (sameTypeSequence.isDefined) {
      return this.parseRawDefinitionTextBySameTypeSequence(rawDefinitionBuffer, sameTypeSequence.get);
    } else {
      return this.parseRawDefinitionTextByDifferentTypes(rawDefinitionBuffer);
    }
  };
  private parseRawDefinitionTextBySameTypeSequence = (
    rawDefinitionBuffer: Buffer,
    sameTypeSequence: string
  ): IStarDictDefinitionField[] => {
    let offset = 0;
    const result: IStarDictDefinitionField[] = [];
    while (true) {
      const offsetOfFirstZero = this.getOffsetOfFirstZero(rawDefinitionBuffer, offset);
      if (offsetOfFirstZero === -1) {
        // last data
        result.push({
          type: sameTypeSequence,
          data: rawDefinitionBuffer.slice(offset)
        });
        return result;
      } else {
        result.push({
          type: sameTypeSequence,
          data: rawDefinitionBuffer.slice(offset, offsetOfFirstZero)
        });
        offset = offsetOfFirstZero + 1;
      }
    }
  };
  private parseRawDefinitionTextByDifferentTypes = (rawDefinitionBuffer: Buffer): IStarDictDefinitionField[] => {
    let offset = 0;
    const result: IStarDictDefinitionField[] = [];
    while (true) {
      if (offset >= rawDefinitionBuffer.length) {
        return result;
      }
      const type = rawDefinitionBuffer.readUInt8(offset++).toString();
      const offsetOfFirstZero = this.getOffsetOfFirstZero(rawDefinitionBuffer, offset);
      const data = rawDefinitionBuffer.slice(offset, offsetOfFirstZero);
      result.push({ type, data });
      offset = offsetOfFirstZero + 1;
    }
  };
  private getDictionaryFiles = (
    indexFile: Option<string>,
    dictFile: Option<string>,
    resourceFiles: string[],
    synFile: Option<string>
  ): string[] => {
    const dictionaryFiles = [indexFile.get, dictFile.get, ...resourceFiles];
    if (synFile.isDefined) {
      dictionaryFiles.push(synFile.get);
    }
    return dictionaryFiles;
  };
  private getIfoFiles = async (files: string[]): Promise<string[]> => {
    const normalFiles = await getNormalFiles(files);
    const result = [];
    for (const f of normalFiles) {
      if (f.endsWith(".ifo")) {
        result.push(f);
      }
    }
    return result;
  };
  private getIdxFile = (dictName: string, files: string[]): Option<string> => {
    return this.getFile(dictName, this.idxSuffixes, files);
  };
  private getTdxFile = (dictName: string, files: string[]): Option<string> => {
    return this.getFile(dictName, this.tdxSuffixes, files);
  };
  private getIndexFile = (dictName: string, files: string[]): Option<string> => {
    const idxFile = this.getIdxFile(dictName, files);
    if (idxFile.isDefined) {
      return idxFile;
    }
    const tdxFile = this.getTdxFile(dictName, files);
    if (tdxFile.isDefined) {
      return tdxFile;
    }
    return none;
  };
  private getDictFile = (dictName: string, files: string[]): Option<string> => {
    return this.getFile(dictName, this.dictSuffixes, files);
  };
  private getResourceFiles = (dictName: string, dir: string, files: string[]): string[] => {
    const resourceDbFiles = this.getResourceDbFiles(dictName, files);
    if (resourceDbFiles.length !== 0) {
      return resourceDbFiles;
    } else if (this.resDirExists(dir, files)) {
      return ["res"];
    } else {
      return [];
    }
  };
  private getFile = (fileBaseName: string, fileSuffixes: string[], files: string[]): Option<string> => {
    const idxFileNames = fileSuffixes.map(suffix => fileBaseName + suffix);
    for (const f of files) {
      for (const idxFileName of idxFileNames) {
        if (f === idxFileName) {
          return option(f);
        }
      }
    }
    return none;
  };
  private getSynFile = (dictName: string, files: string[]): Option<string> => {
    const synFile = dictName + ".syn";
    if (files.indexOf(synFile) > -1) {
      return option(synFile);
    }
    return none;
  };
  private getResourceDbFiles = (dictName: string, files: string[]): string[] => {
    const rifoFile = dictName + ".rifo";
    const ridxFile = dictName + ".ridx";
    const rdictFile = dictName + "rdict";
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
  private getWordCount = async (dir: string, ifoFile: string): Promise<Option<number>> => {
    const absoluteIfoFilePath = path.resolve(dir, ifoFile);
    const wordCountValue = await this.getValue(absoluteIfoFilePath, "wordcount");
    if (wordCountValue.isEmpty) {
      return none;
    } else {
      return option(parseInt(wordCountValue.get, 10));
    }
  };
  private getSameTypeSequence = async (dir: string, ifoFile: string): Promise<Option<string>> => {
    const absoluteIfoFilePath = path.resolve(dir, ifoFile);
    return await this.getValue(absoluteIfoFilePath, "sametypesequence");
  };
  private getValue = async (absoluteFilePath: string, key: string): Promise<Option<string>> => {
    const lines = await readFileAsLines(absoluteFilePath);
    for (const line of lines) {
      if (line.indexOf("=") === -1) {
        continue;
      }
      const keyAndValue = line.split("=");
      const k = keyAndValue[0];
      const v = keyAndValue[1];
      if (k === key) {
        return option(v);
      }
    }
    return none;
  };
  private isDictionaryValid = (dictFile: Option<string>, indexFile: Option<string>): boolean => {
    return dictFile.isDefined && indexFile.isDefined;
  };
  private buildWordIndex = async (
    indexFile: string,
    dictionaryId: number,
    ifoFile: string,
    synFile: Option<string>,
    idxOffsetBits: number
  ): Promise<void> => {
    if (this.isIdxFile(indexFile)) {
      await this.buildIndexByIdx(indexFile, dictionaryId, ifoFile, synFile, idxOffsetBits);
    } else {
      await this.buildIndexByTdx(indexFile, dictionaryId, ifoFile, synFile, idxOffsetBits);
    }
  };
  private isIdxFile = (indexFile: string): boolean => {
    return indexFile.endsWith(".idx") || indexFile.endsWith(".idx.gz");
  };
  private buildIndexByIdx = async (
    idxFile: string,
    dictionaryId: number,
    ifoFile: string,
    synFile: Option<string>,
    idxOffsetBits: number
  ): Promise<void> => {
    const fileContents = await this.getFileContents(idxFile, true);
    const wordIndex = await this.getWordIndexByIdxFileContents(fileContents, idxOffsetBits, synFile);
    await Sqlite.addWordIndex(dictionaryId, wordIndex);
  };
  private buildIndexByTdx = async (
    tdxFile: string,
    dictionaryId: number,
    ifoFile: string,
    synFile: Option<string>,
    idxOffsetBits: number
  ): Promise<void> => {
    throw new Error(`Tdx file ${tdxFile} is not supported.`);
  };
  private getWordIndexByIdxFileContents = async (
    idxFileContents: Buffer,
    idxOffsetBits: number,
    synFile: Option<string>
  ): Promise<IBaseIndex[]> => {
    const wordIndex = this.getIndexFromIdxFileContents(idxFileContents, idxOffsetBits);
    if (synFile.isDefined) {
      await this.addSynToWordIndex(wordIndex, idxOffsetBits, synFile.get, idxFileContents);
    }
    return wordIndex;
  };
  private addSynToWordIndex = async (
    wordIndex: IBaseIndex[],
    idxOffsetBits: number,
    synFile: string,
    idxFileContents: Buffer
  ): Promise<void> => {
    const synFileContents = await fse.readFile(synFile);
    let offset = 0;
    while (true) {
      const nextOffset = this.readOneSynEntry(synFileContents, idxFileContents, idxOffsetBits, wordIndex, offset);
      if (nextOffset.isEmpty) {
        return;
      }
      offset = nextOffset.get;
    }
  };
  private readOneSynEntry = (
    synFileContents: Buffer,
    idxFileContents: Buffer,
    idxOffsetBits: number,
    wordIndex: IBaseIndex[],
    offset: number
  ): Option<number> => {
    if (offset >= synFileContents.length) {
      return none;
    }
    const offsetOfFirstZero = this.getOffsetOfFirstZero(synFileContents, offset);
    const synonymWord = synFileContents.toString("UTF-8", offset, offsetOfFirstZero);

    // TODO The way to get the original word's index may not be correct,
    // TODO stardict's doc is ambiguous about it, further verification is required.
    const originalWordIndex = synFileContents.readUInt32BE(offsetOfFirstZero + 1);
    const originalWord = idxFileContents.toString("UTF-8", offset, offsetOfFirstZero);
    const wordDataOffset = this.readWordDataOffset(idxFileContents, offsetOfFirstZero + 1, idxOffsetBits);
    const nextOffset = offsetOfFirstZero + 1 + idxOffsetBits / 8;
    const wordDataSize = idxFileContents.readUInt32BE(nextOffset);
    wordIndex.push({
      contents: synonymWord,
      offset: wordDataOffset,
      size: wordDataSize
    });
    return option(offsetOfFirstZero + 1 + 4);
  };
  private getWord = (buffer: Buffer, offset: number): string => {
    const offsetOfFirstZero = this.getOffsetOfFirstZero(buffer, offset);
    return buffer.toString("UTF-8", offset, offsetOfFirstZero);
  };
  private getIndexFromIdxFileContents = (idxFileContents: Buffer, idxOffsetBits: number): IBaseIndex[] => {
    // word -> word position
    const wordIndex: IBaseIndex[] = [];
    let offset = 0;
    while (true) {
      const nextOffset = this.readOneIdxEntry(wordIndex, idxFileContents, offset, idxOffsetBits);
      if (nextOffset.isEmpty) {
        return wordIndex;
      }
      offset = nextOffset.get;
    }
  };
  private readOneIdxEntry = (
    indexList: IBaseIndex[],
    idxFileContents: Buffer,
    offset: number,
    idxOffsetBits: number
  ): Option<number> => {
    if (!this.isIdxEntryExist(idxFileContents, offset)) {
      return none;
    }
    const offsetOfFirstZero = this.getOffsetOfFirstZero(idxFileContents, offset);
    const wordStr = idxFileContents.toString("UTF-8", offset, offsetOfFirstZero);
    const wordDataOffset = this.readWordDataOffset(idxFileContents, offsetOfFirstZero + 1, idxOffsetBits);
    const nextOffset = offsetOfFirstZero + 1 + idxOffsetBits / 8;
    const wordDataSize = idxFileContents.readUInt32BE(nextOffset);
    indexList.push({
      contents: wordStr,
      offset: wordDataOffset,
      size: wordDataSize
    });
    return option(nextOffset + 4);
  };
  private isIdxEntryExist = (idxFileContents: Buffer, offset: number): boolean => {
    return offset >= idxFileContents.length;
  };
  private readWordDataOffset = (indexFileContents: Buffer, offset: number, len: number): number => {
    if (len === 32) {
      return indexFileContents.readUInt32BE(offset);
    } else {
      // size === 64
      return readUInt64BE(indexFileContents, offset);
    }
  };
  private getOffsetOfFirstZero = (buffer: Buffer, startOffset: number): number => {
    let offset = startOffset;
    while (true) {
      if (buffer.length <= offset) {
        return -1;
      } else if (buffer.readUInt8(offset) === 0) {
        return offset;
      } else {
        offset++;
      }
    }
  };
  private getIdxOffsetBits = async (ifoFile: string): Promise<number> => {
    const idxOffsetBits = await this.getValue(ifoFile, "idxoffsetbits"); // 32 or 64
    return idxOffsetBits.isDefined ? parseInt(idxOffsetBits.get, 10) : 32;
  };

  private getFileContents = async (f: string, decompressGz: boolean): Promise<Buffer> => {
    if (f.endsWith(".gz") && decompressGz) {
      return await decompressGzFile(f);
    } else {
      return await fse.readFile(f);
    }
  };
}
