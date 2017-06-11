"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var constant_1 = require("./../../main/typescript/constant");
var log_1 = require("./../../main/typescript/util/log");
var LineReader_1 = require("./../../main/typescript/LineReader");
var path = require("path");
describe('LineReaderTest', function () {
    var logger = log_1.Log.getLogger();
    var dslFile = path.join(constant_1.ROOT_PATH, 'src/test/resources/simpleDSL/simple.dsl');
    var dzFile = path.join(constant_1.ROOT_PATH, 'src/test/resources/simpleDSL/simple.dsl.dz');
    it("#run with dsl", function (done) {
        var result = [];
        var simpleLineReader = new LineReader_1.LineReader(dslFile, 10);
        simpleLineReader.on('line', function (data) {
            result.push([data[0], data[1]]);
        });
        simpleLineReader.on('end', function () {
            logger.info('-----------------------------');
            result.forEach(function (value) {
                logger.info(value[0] + ", " + value[1]);
            });
            chai_1.assert.deepEqual(result, [
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
    it("#run with dz", function (done) {
        var result = [];
        var dzLineReader = new LineReader_1.LineReader(dzFile, 3);
        dzLineReader.on('line', function (data) {
            result.push([data[0], data[1]]);
        });
        dzLineReader.on('end', function () {
            logger.info('-----------------------------');
            result.forEach(function (value) {
                logger.info(value[0] + ", " + value[1]);
            });
            chai_1.assert.deepEqual(result, [
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
//# sourceMappingURL=LineReaderTest.js.map