import { DzBufferReader } from "../DzBufferReader";
import { BufferReader } from "../BufferReader";
import { SimpleBufferReader } from "../SimpleBufferReader";
import { describe, it } from "mocha";

describe('Test DzBufferReader', () => {
  it("#getEncodingStatsForDz", async () => {
    const bufferReader: BufferReader = new DzBufferReader();
    await bufferReader.open("/home/searene/Public/longman.dsl.dz");
    const encodingStat = await bufferReader.getEncodingStat()
    console.log(encodingStat);
  });
});

describe('Test SimpleBufferReader', () => {
  it("#getEncodingStatsForDsl", async () => {
    const bufferReader: BufferReader = new SimpleBufferReader();
    await bufferReader.open("/home/searene/Public/longman.dsl");
    const encodingStat = await bufferReader.getEncodingStat()
    console.log(encodingStat);
  });
});
