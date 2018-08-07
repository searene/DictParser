import { StreamZip, ZipEntry } from "../js/node-stream-zip";
import { Sqlite } from "./Sqlite";

export class ZipReader {
  private _zipFilePath: string;
  constructor(zipFilePath: string) {
    this._zipFilePath = zipFilePath;
  }
  public async extractFileFromZip(fileName: string): Promise<Buffer> {
    const zip = new StreamZip({
      buildEntries: false,
      file: this._zipFilePath
    });
    const entry = await this.getEntry(fileName);

    // entry was not found
    if (entry === undefined) {
      return Buffer.alloc(0);
    }

    await zip.setEntries([entry]);
    return new Promise<Buffer>(resolve => {
      const bufs: Buffer[] = [];
      zip.stream(fileName, (err, stm) => {
        stm.on("data", (data: Buffer) => {
          bufs.push(data);
        });
        stm.on("end", () => {
          resolve(Buffer.concat(bufs));
        });
      });
    });
  }

  public async getZipEntries(): Promise<ZipEntry[]> {
    const entries: ZipEntry[] = [];
    return new Promise<ZipEntry[]>(resolve => {
      const zip = new StreamZip({
        buildEntries: true,
        file: this._zipFilePath
      });
      zip.on("entry", entry => {
        entries.push(entry);
      });
      zip.on("ready", () => {
        resolve(entries);
      });
    });
  }
  public saveEntriesToDb = async (entries: ZipEntry[]): Promise<void> => {
    await Sqlite.db.executeSql(`DELETE FROM zip_entry WHERE resource_path = ${Sqlite.getSQLParam(this._zipFilePath, Sqlite.PARAM_TYPE_STRING)}`);
    let insertStatement = `
              INSERT INTO zip_entry (
                resource_path, flags, method, compressed_size, size,
                fname_len, extra_len, com_len, offset,
                name, is_directory
              ) VALUES `;
    const parameters = [];
    for (const entry of entries) {
      parameters.push(`(${Sqlite.getSQLParam(this._zipFilePath, Sqlite.PARAM_TYPE_STRING)},
                       ${Sqlite.getSQLParam(entry.flags, Sqlite.PARAM_TYPE_NUMBER)},
                       ${Sqlite.getSQLParam(entry.method, Sqlite.PARAM_TYPE_NUMBER)},
                       ${Sqlite.getSQLParam(entry.compressedSize, Sqlite.PARAM_TYPE_NUMBER)},
                       ${Sqlite.getSQLParam(entry.size, Sqlite.PARAM_TYPE_NUMBER)},
                       ${Sqlite.getSQLParam(entry.fnameLen, Sqlite.PARAM_TYPE_NUMBER)},
                       ${Sqlite.getSQLParam(entry.extraLen, Sqlite.PARAM_TYPE_NUMBER)},
                       ${Sqlite.getSQLParam(entry.comLen, Sqlite.PARAM_TYPE_NUMBER)},
                       ${Sqlite.getSQLParam(entry.offset, Sqlite.PARAM_TYPE_NUMBER)},
                       ${Sqlite.getSQLParam(entry.name, Sqlite.PARAM_TYPE_STRING)},
                       ${Sqlite.getSQLParam(entry.isDirectory, Sqlite.PARAM_TYPE_BOOLEAN)})`);
    }
    insertStatement = insertStatement + parameters.join(",\n");
    await Sqlite.db.executeSql(insertStatement);
  };
  public buildZipIndex = async (): Promise<void> => {
    const zipEntries = await this.getZipEntries();
    await this.saveEntriesToDb(zipEntries);
  };
  public getEntry = async (fileName: string): Promise<ZipEntry | undefined> => {
    const result = await Sqlite.db.getOne(
      `SELECT * FROM zip_entry WHERE resource_path = ? AND name = ?`,
      [this._zipFilePath, fileName]
    );

    // no result
    if (result === undefined || result === []) {
      return undefined;
    }

    const entry = new ZipEntry();
    entry.flags = result.flags;
    entry.method = result.method;
    entry.compressedSize = result.compressed_size;
    entry.fnameLen = result.fname_len;
    entry.extraLen = result.extra_len;
    entry.comLen = result.com_len;
    entry.offset = result.offset;
    entry.name = result.name;
    entry.isDirectory = result.is_directory === 1;

    return entry;
  };
}
