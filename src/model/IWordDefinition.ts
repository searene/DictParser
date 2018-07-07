import { WordTree } from "../Tree";
import { IDictionary } from "./IDictionary";

export interface IWordDefinition {
  word: string;
  html: string;
  dict: IDictionary,
}

