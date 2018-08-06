import * as fse from "fs-extra";
import { OSSpecificImplementationGetter } from "../os-specific/OSSpecificImplementationGetter";

export class EncodingUtil {
  public static readBase64FromFile = async (filePath: string): Promise<string> => {
    const bitmap = await OSSpecificImplementationGetter.fs.readFile(filePath);
    return new Buffer(bitmap).toString("base64");
  };
}
