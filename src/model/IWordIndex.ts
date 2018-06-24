import { IDictionary } from "./IDictionary";

export interface IWordIndex {
  id: number;
  dictionary: IDictionary;
  word: string;
  pos: number;
  len: number;
}