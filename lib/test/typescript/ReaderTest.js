"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("./../../main/typescript/util/log");
var Reader_1 = require("../../main/typescript/Reader");
var chai_1 = require("chai");
describe('test Reader', function () {
    var logger = log_1.Log.getLogger();
    it("#consumeTo", function () {
        var reader = new Reader_1.Reader("ab[d");
        var consumedString = reader.consumeTo('[', false, true);
        chai_1.assert.deepEqual(consumedString, { isFound: true, value: "ab" });
    });
});
//# sourceMappingURL=ReaderTest.js.map