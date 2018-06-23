import { assert } from 'chai';
import { TEST_RESOURCE_PATH } from '../Constant';
import { LineReader, LineStats } from '../LineReader';
import * as mocha from 'mocha';
import * as path from 'path';

describe('LineReaderTest', () => {

    let dslFile = path.join(TEST_RESOURCE_PATH, 'simpleDSL/simple.dsl');
    let dzFile = path.join(TEST_RESOURCE_PATH, 'simpleDSL/simple.dsl.dz');

    it("#run with dsl", (done) => {
        let result: LineStats[] = [];
        let simpleLineReader = new LineReader(dslFile, 10);
        simpleLineReader.on('line', (data: LineStats) => {
            result.push(data);
        });
        simpleLineReader.on('end', () => {
            assert.deepEqual(result, [
                {line: '#NAME "Sample DSL Dictionary"\n', pos: 2, len: 60},
                {line: '#INDEX_LANGUAGE "English"\n', pos: 62, len: 52},
                {line: '#CONTENTS_LANGUAGE  "English"\n', pos: 114, len: 60},
                {line: '\n', pos: 174, len: 2},
                {line: 'trivial card\n', pos: 176, len: 26},
                {line: '  Trivially simple card. The body of the card starts with spaces or TABs, that\'s all.\n', pos: 202, len: 172}
            ]);
            done();
        });
        simpleLineReader.process();
    });

    it("#run with dz", (done) => {
        let result: LineStats[] = [];
        let dzLineReader = new LineReader(dzFile, 3);
        dzLineReader.on('line', (data: LineStats) => {
            result.push(data);
        });
        dzLineReader.on('end', () => {
            assert.deepEqual(result, [
                {line: '#NAME "Sample DSL Dictionary"\n', pos: 2, len: 60},
                {line: '#INDEX_LANGUAGE "English"\n', pos: 62, len: 52},
                {line: '#CONTENTS_LANGUAGE  "English"\n', pos: 114, len: 60},
                {line: '\n', pos: 174, len: 2},
                {line: 'trivial card\n', pos: 176, len: 26},
                {line: '  Trivially simple card. The body of the card starts with spaces or TABs, that\'s all.\n', pos: 202, len: 172}
            ]);
            done();
        });
        dzLineReader.process();
    });
});