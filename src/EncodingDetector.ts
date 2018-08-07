import { OSSpecificImplementationGetter } from "./os-specific/OSSpecificImplementationGetter";

export const UTF_8: string = "utf8";
export const UTF_16_BE: string = "utf16be";
export const UTF_16_LE: string = "utf16le";
export const UTF_32_BE: string = "utf32be";
export const UTF_32_LE: string = "utf32le";

/**
 * Detect file encoding using BOM(Byte Order Mark) at the beginning of the file,
 * the following encodings are supported:
 *
 *      utf32be
 *      utf32le
 *      utf16be
 *      utf16le
 *      utf8
 *
 * Notice that a lot of UTF-8 files are deemed indetectable by the function because they don't
 * have a BOM header.
 *
 * @param fileContents file contents represented as Buffer, at least 4 bytes are needed
 * @return an object, containing two keys:
 *          {@code encoding: string}
 *          {@code posAfterBom: offset of the real contents, excluding the bom at the beginning}
 */
export async function getEncodingInBuffer(fileContents: Buffer): Promise<EncodingStat> {
  if (fileContents.length < 4) {
    throw new Error("at least 4 bytes are needed");
  }
  const bom: Buffer = fileContents.slice(0, 4);

  if (bom.equals(Buffer.from("0000FEFF", "hex"))) {
    return { encoding: UTF_32_BE, posAfterBom: 4 };
  } else if (bom.equals(Buffer.from("FFFE0000", "hex"))) {
    return { encoding: UTF_32_LE, posAfterBom: 4 };
  } else if (bom.slice(0, 2).equals(Buffer.from("FEFF", "hex"))) {
    return { encoding: UTF_16_BE, posAfterBom: 2 };
  } else if (bom.slice(0, 2).equals(Buffer.from("FFFE", "hex"))) {
    return { encoding: UTF_16_LE, posAfterBom: 2 };
  } else {
    return { encoding: UTF_8, posAfterBom: 0 };
  }
}

export async function getEncodingInFile(fdOrFilePath: string | number): Promise<EncodingStat> {
  const fd = typeof fdOrFilePath === "number" ? fdOrFilePath : await OSSpecificImplementationGetter.fs.open(fdOrFilePath, "r");
  const bytes = await OSSpecificImplementationGetter.fs.read(fd, 4, 0);
  if (bytes.bytesRead < 4) {
    throw new Error(`at least 4 bytes are required to detect encoding`);
  }
  return await getEncodingInBuffer(bytes.buffer);
}

export interface EncodingStat {
  encoding: string;
  posAfterBom: number;
}
