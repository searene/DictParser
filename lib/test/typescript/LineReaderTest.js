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
            result.push(data);
        });
        simpleLineReader.on('end', function () {
            chai_1.assert.deepEqual(result, [
                { line: '#NAME "Sample DSL Dictionary"\n', pos: 2, len: 60 },
                { line: '#INDEX_LANGUAGE "English"\n', pos: 62, len: 52 },
                { line: '#CONTENTS_LANGUAGE  "English"\n', pos: 114, len: 60 },
                { line: '\n', pos: 174, len: 2 },
                { line: 'trivial card\n', pos: 176, len: 26 },
                { line: '  Trivially simple card. The body of the card starts with spaces or TABs, that\'s all.\n', pos: 202, len: 172 }
            ]);
            done();
        });
        simpleLineReader.process();
    });
    it("#run with dz", function (done) {
        var result = [];
        var dzLineReader = new LineReader_1.LineReader(dzFile, 3);
        dzLineReader.on('line', function (data) {
            result.push(data);
        });
        dzLineReader.on('end', function () {
            chai_1.assert.deepEqual(result, [
                { line: '#NAME "Sample DSL Dictionary"\n', pos: 2, len: 60 },
                { line: '#INDEX_LANGUAGE "English"\n', pos: 62, len: 52 },
                { line: '#CONTENTS_LANGUAGE  "English"\n', pos: 114, len: 60 },
                { line: '\n', pos: 174, len: 2 },
                { line: 'trivial card\n', pos: 176, len: 26 },
                { line: '  Trivially simple card. The body of the card starts with spaces or TABs, that\'s all.\n', pos: 202, len: 172 }
            ]);
            done();
        });
        dzLineReader.process();
    });
});
//# sourceMappingURL=LineReaderTest.js.map