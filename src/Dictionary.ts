import { EventEmitter } from "events";
import { SRC_RESOURCE_PATH } from "./Constant";
import { WordTree, Node } from "./Tree";
import { Meta, IndexMap } from "./DictionaryFinder";
import * as fse from "fs-extra";
import * as path from "path";
import { WriteStream } from "tty";

/**
 * Created by searene on 17-1-23.
 */

export abstract class Dictionary {
  protected _dictionaryScanProgressReporter: EventEmitter = new EventEmitter();

  // e.g. dsl, main definition file
  protected abstract _dictionarySuffixes: string[];

  // e.g. zip, dz, containing all the resources such as images/audios
  protected _resourceHolderSuffixes: string[] = [".zip"];

  // e.g. jpg, wmv, which are the actual resourcePath files
  protected _resourceFileSuffixes: string[] = [".jpg", ".wmv", ".bmp", ".mp3"];

  // get meta data and index
  public abstract async getDictionaryStats(
    dictFile: string
  ): Promise<DictionaryStats>;

  // get the definition of the word, represented by a WordTree
  public abstract async getWordTree(
    dictPath: string,
    wordPosition: WordPosition
  ): Promise<WordTree>;

  public abstract async getWordTreeHTML(
    dictPath: string,
    resourceHolder: string,
    wordPosition: WordPosition
  ): Promise<WordTreeHTML>;

  public async getHTML(
    dictName: string,
    dictPath: string,
    resourceHolder: string,
    wordPosition: WordPosition
  ): Promise<string> {
    const wordTreeHTML: WordTreeHTML = await this.getWordTreeHTML(
      dictPath,
      resourceHolder,
      wordPosition
    );
    return `<div class="dp-container"><div class="dp-title">${dictName}</div><div class="dp-entry">${
      wordTreeHTML.entry
    }</div><div class="dp-definition">${wordTreeHTML.definition}</div></div>`;
  }

  // get resourcePath contents

  get dictionarySuffixes(): string[] {
    return this._dictionarySuffixes;
  }
  get resourceHolderSuffixes(): string[] {
    return this._resourceHolderSuffixes;
  }
  get resourceFileSuffixes(): string[] {
    return this._resourceFileSuffixes;
  }
  get dictionaryScanProgressReporter(): EventEmitter {
    return this._dictionaryScanProgressReporter;
  }
}

export interface WordPosition {
  pos: number;
  len: number;
}

export interface DictionaryStats {
  meta: Meta;
  indexMap: IndexMap;
}

export interface WordTreeHTML {
  entry: string;
  definition: string;
}
