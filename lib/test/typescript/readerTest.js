"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var reader_1 = require("../../main/typescript/reader");
var constant_1 = require("../../main/typescript/constant");
describe('test Reader', function () {
    log4js.configure(constant_1.LOG_CONFIG_LOCATION);
    describe('#readOneCharacter()', function () {
        it('test UTF-16LE', function () {
            var file = 'src/main/resources/test/encodings/UTF-16LE.txt';
            var reader = new reader_1.Reader();
        });
    });
});
