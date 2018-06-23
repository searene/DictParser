import { WordTree } from "../Tree";
import { IDictionary } from "../DictionaryFinder";

export interface WordDefinition {
  word: string;
  wordTree: WordTree;
  html: string;
  dict: IDictionary,
}

