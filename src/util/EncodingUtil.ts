import { OSSpecificImplementationGetter } from "../os-specific/OSSpecificImplementationGetter";
import { Buffer } from "buffer";

export class EncodingUtil {
  public static readBase64FromFile = async (filePath: string): Promise<string> => {
    const bitmap = await OSSpecificImplementationGetter.fs.readFile(filePath);
    return new Buffer(bitmap).toString("base64");
  };
}
