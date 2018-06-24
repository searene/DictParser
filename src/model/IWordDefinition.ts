import { WordTree } from "../Tree";
import { IDictionary } from "./IDictionary";

export interface IWordDefinition {
  word: string;
  wordTree: WordTree;
  html: string;
  dict: IDictionary,
}

