import { TEST_RESOURCE_PATH } from "../Constant";
import { assert } from "chai";
import { Log } from "../util/log";
import { DictZipParser } from "../dictionaries/dsl/DictZipParser";
import * as path from "path";
import { DictParser } from "../index";
import * as fse from "fs-extra";
import * as os from "os";
import { StreamZip, ZipEntry } from "../js/node-stream-zip";

describe("#ZipReaderTest", () => {
  it("#StreamZipTest", async () => {
    const entries: ZipEntry[] = [];
    return new Promise<ZipEntry[]>(resolve => {
      const zip = new StreamZip({
        buildEntries: true,
        file:
          "/home/searene/Public/dictionaries/En-En_Oxford Advanced Learners Dictionary/En-En_Oxford Advanced Learners Dictionary.dsl.files.zip"
      });
      zip.on("entry", entry => {
        entries.push(entry);
      });
      zip.on("ready", () => {
        resolve(entries);
      });
    });
  });
});
