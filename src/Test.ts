import { BufferReader, SimpleBufferReader, DzBufferReader } from './BufferReader';
import * as fse from 'fs-extra';
import * as zlib from 'zlib';

async function test() {
  let bufferReader: BufferReader = new DzBufferReader();
  await bufferReader.open("/home/searene/Public/dz/longman.dsl.dz");
  console.log('file is opened');
  let encodingStat = await bufferReader.getEncodingStat();
  console.log(encodingStat);
}

async function anotherTest() {
  let buffer = await fse.readFile("/home/searene/Public/random/test.dsl.gz");
  zlib.createGunzip()
    .on('data', (chunk: Buffer) => {
      console.log(chunk.toString())
    })
    .on('error', (err) => {
      console.log(err);
    })
    .on('end', () => {
      console.log('end')
    })
    .end(buffer);
}

console.log('starting...');
test();