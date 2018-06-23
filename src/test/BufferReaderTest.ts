import { DzBufferReader, BufferReader, SimpleBufferReader } from './../BufferReader';
import { assert } from 'chai';
import * as path from 'path';

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
