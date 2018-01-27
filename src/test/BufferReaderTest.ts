import { DzBufferReader, BufferReader, SimpleBufferReader } from './../BufferReader';
import { assert } from 'chai';
import * as path from 'path';

describe('Test DzBufferReader', () => {
  it("#getEncodingStatsForDz", async () => {
    let bufferReader: BufferReader = new DzBufferReader();
    await bufferReader.open("/home/searene/Public/longman.dsl.dz");
    let encodingStat = await bufferReader.getEncodingStat()
    console.log(encodingStat);
  });
});

describe('Test SimpleBufferReader', () => {
  it("#getEncodingStatsForDsl", async () => {
    let bufferReader: BufferReader = new SimpleBufferReader();
    await bufferReader.open("/home/searene/Public/longman.dsl");
    let encodingStat = await bufferReader.getEncodingStat()
    console.log(encodingStat);
  });
});
