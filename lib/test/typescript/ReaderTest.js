"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var assert_1 = require("assert");
var Reader_1 = require("../../main/typescript/Reader");
var constant_1 = require("../../main/typescript/constant");
describe('test Reader', function () {
    log4js.configure(constant_1.LOG_CONFIG_LOCATION);
    it("#consumeUntilFind", function () {
        var reader = new Reader_1.Reader("ab[d");
        var consumedString = reader.consumeUntilFind('[', true);
        assert_1.default.equal(consumedString, { valid: true, value: "ab" });
    });
});
