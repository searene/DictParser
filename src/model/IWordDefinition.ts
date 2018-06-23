import { WordTree } from "../Tree";
import { IDictionary } from "../DictionaryFinder";

export interface IWordDefinition {
  word: string;
  wordTree: WordTree;
  html: string;
  dict: IDictionary,
}

