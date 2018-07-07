import * as fse from "fs-extra";

export class EncodingUtil {
  public static readBase64FromFile = async (filePath: string): Promise<string> => {
    const bitmap = await fse.readFile(filePath);
    return new Buffer(bitmap).toString("base64");
  };
}
