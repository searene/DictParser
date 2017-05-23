"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("./../../main/typescript/util/log");
var DSLStateMachine_1 = require("./../../main/typescript/DSLStateMachine");
var logger = log_1.Log.getLogger();
describe("Test DSLStateMachine", function () {
    describe("Test run", function () {
        it.only("Simple entry test", function () {
            var simpleEntryContents = "trivial card\n  Trivially simple card. The body of the card starts with spaces or TABs, that's all.";
            var stateMachine = new DSLStateMachine_1.DSLStateMachine(simpleEntryContents);
            var wordTree = stateMachine.run();
            wordTree.entry.forEach(function (entry) {
                logger.debug(entry);
            });
        });
    });
});
