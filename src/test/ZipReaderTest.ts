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
