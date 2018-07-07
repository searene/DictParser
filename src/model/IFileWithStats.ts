import * as fse from "fs-extra";
export interface IFileWithStats {
  filePath: string;
  stat: fse.Stats;
}

