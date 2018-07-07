import { IDictionary } from "./IDictionary";

export interface IIndex {
  id: number;
  dictionary: IDictionary;
  word: string;
  pos: number;
  len: number;
}