import { assert } from 'chai';
import { ROOT_PATH } from './../../main/typescript/constant';
import { Log } from './../../main/typescript/util/log';
import { LineReader } from './../../main/typescript/LineReader';
import * as mocha from 'mocha';
import * as path from 'path';

describe('LineReaderTest', () => {

    let logger = Log.getLogger();
    let dslFile = path.join(ROOT_PATH, 'src/test/resources/simpleDSL/simple.dsl');
    let dzFile = path.join(ROOT_PATH, 'src/test/resources/simpleDSL/simple.dsl.dz');

    it("#run with dsl", (done) => {
        let result: [string, number][] = [];
        let simpleLineReader = new LineReader(dslFile, 10);
        simpleLineReader.on('line', (data: [string, number]) => {
            result.push([data[0], data[1]]);
        });
        simpleLineReader.on('end', () => {
            logger.info('-----------------------------');
            result.forEach((value) => {
                logger.info(`${value[0]}, ${value[1]}`);
            });
            assert.deepEqual(result, [
                ['#NAME "Sample DSL Dictionary"', 2],
                ['#INDEX_LANGUAGE "English"', 62],
                ['#CONTENTS_LANGUAGE  "English"', 114],
                ['', 174],
                ['trivial card', 176],
                ['  Trivially simple card. The body of the card starts with spaces or TABs, that\'s all.', 202],
            ]);
            done();
        });
    });

    it("#run with dz", (done) => {
        let result: [string, number][] = [];
        let dzLineReader = new LineReader(dzFile, 3);
        dzLineReader.on('line', (data: [string, number]) => {
            result.push([data[0], data[1]]);
        });
        dzLineReader.on('end', () => {
            logger.info('-----------------------------');
            result.forEach((value) => {
                logger.info(`${value[0]}, ${value[1]}`);
            });
            assert.deepEqual(result, [
                ['#NAME "Sample DSL Dictionary"', 2],
                ['#INDEX_LANGUAGE "English"', 62],
                ['#CONTENTS_LANGUAGE  "English"', 114],
                ['', 174],
                ['trivial card', 176],
                ['  Trivially simple card. The body of the card starts with spaces or TABs, that\'s all.', 202],
            ]);
            done();
        });
    });
});