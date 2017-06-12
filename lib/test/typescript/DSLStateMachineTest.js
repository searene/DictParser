"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var constant_1 = require("./../../main/typescript/constant");
var log_1 = require("../../main/typescript/util/log");
var DSLStateMachine_1 = require("../../main/typescript/DSLStateMachine");
var EncodingDetector_1 = require("../../main/typescript/EncodingDetector");
var fsp = require("fs-promise");
var path = require("path");
var logger = log_1.Log.getLogger();
describe("Test DSLStateMachine", function () {
    describe("Test run", function () {
        var simpleEntryContents;
        var mediumEntryContents;
        var complexEntryContents;
        var typicalEntryContents;
        before(function () { return __awaiter(_this, void 0, void 0, function () {
            var dslFile, encoding;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dslFile = path.join(constant_1.ROOT_PATH, 'src/test/resources/dsl/sample.dsl');
                        return [4 /*yield*/, EncodingDetector_1.getEncodingInFile(dslFile)];
                    case 1:
                        encoding = (_a.sent());
                        return [4 /*yield*/, readFile(dslFile, encoding.encoding, 5, 6)];
                    case 2:
                        simpleEntryContents = _a.sent();
                        return [4 /*yield*/, readFile(dslFile, encoding.encoding, 214, 216)];
                    case 3:
                        mediumEntryContents = _a.sent();
                        return [4 /*yield*/, readFile(dslFile, encoding.encoding, 8, 190)];
                    case 4:
                        complexEntryContents = _a.sent();
                        return [4 /*yield*/, readFile(dslFile, encoding.encoding, 192, 212)];
                    case 5:
                        typicalEntryContents = _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it("Simple entry test", function () {
            var stateMachine = new DSLStateMachine_1.DSLStateMachine(simpleEntryContents);
            var wordTree = stateMachine.run();
            var s = wordTree.toString();
            // logger.info(s);
        });
        it("Medium entry test", function () {
            var stateMachine = new DSLStateMachine_1.DSLStateMachine(mediumEntryContents);
            var wordTree = stateMachine.run();
            var s = wordTree.toString();
            // logger.info(s);
        });
        it("Complex entry test", function () {
            var stateMachine = new DSLStateMachine_1.DSLStateMachine(complexEntryContents);
            var wordTree = stateMachine.run();
            var s = wordTree.toString();
            // logger.info(s);
        });
        it("Typical entry test", function () {
            var stateMachine = new DSLStateMachine_1.DSLStateMachine(typicalEntryContents);
            var wordTree = stateMachine.run();
        });
    });
});
function readFile(filePath, encoding, startLine, endLine) {
    return __awaiter(this, void 0, void 0, function () {
        var fileContents, lines;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, fsp.readFile(filePath, { encoding: encoding })];
                case 1:
                    fileContents = _a.sent();
                    // replace \r\n with \n so we won't deal with \r any more
                    fileContents = fileContents.replace(/\r?\n|\r/g, "\n");
                    lines = fileContents.split(/\n/);
                    return [2 /*return*/, lines.slice(startLine - 1, endLine).join("\n")];
            }
        });
    });
}
//# sourceMappingURL=DSLStateMachineTest.js.map