import { assert } from 'chai';
import { TEST_RESOURCE_PATH } from '../Constant';
import { LineReader } from '../LineReader';
import * as path from 'path';
import { IBaseIndex } from "../model/IBaseIndex";
import { describe, it } from "mocha";
import { SimpleBufferReader } from "../SimpleBufferReader";
import { DzBufferReader } from "../DzBufferReader";

describe('LineReaderTest', () => {

    const dslFile = path.join(TEST_RESOURCE_PATH, 'simpleDSL/simple.dsl');
    const dzFile = path.join(TEST_RESOURCE_PATH, 'simpleDSL/simple.dsl.dz');

    it("#run with dsl", (done) => {
        const result: IBaseIndex[] = [];
        const simpleLineReader = new LineReader(dslFile, new SimpleBufferReader(), 10);
        simpleLineReader.on('line', (data: IBaseIndex) => {
            result.push(data);
        });
        simpleLineReader.on('end', () => {
            assert.deepEqual(result, [
                {contents: '#NAME "Sample DSL Dictionary"\n', offset: 2, size: 60},
                {contents: '#INDEX_LANGUAGE "English"\n', offset: 62, size: 52},
                {contents: '#CONTENTS_LANGUAGE  "English"\n', offset: 114, size: 60},
                {contents: '\n', offset: 174, size: 2},
                {contents: 'trivial card\n', offset: 176, size: 26},
                {contents: '  Trivially simple card. The body of the card starts with spaces or TABs, that\'s all.\n', offset: 202, size: 172}
            ]);
            done();
        });
        simpleLineReader.process();
    });

    it("#run with dz", (done) => {
        const result: IBaseIndex[] = [];
        const dzLineReader = new LineReader(dzFile, new DzBufferReader(), 3);
        dzLineReader.on('line', (data: IBaseIndex) => {
            result.push(data);
        });
        dzLineReader.on('end', () => {
            assert.deepEqual(result, [
                {contents: '#NAME "Sample DSL Dictionary"\n', offset: 2, size: 60},
                {contents: '#INDEX_LANGUAGE "English"\n', offset: 62, size: 52},
                {contents: '#CONTENTS_LANGUAGE  "English"\n', offset: 114, size: 60},
                {contents: '\n', offset: 174, size: 2},
                {contents: 'trivial card\n', offset: 176, size: 26},
                {contents: '  Trivially simple card. The body of the card starts with spaces or TABs, that\'s all.\n', offset: 202, size: 172}
            ]);
            done();
        });
        dzLineReader.process();
    });
});