"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Created by searene on 17-1-23.
 */
var parsingStatus;
(function (parsingStatus) {
    parsingStatus[parsingStatus["parsing"] = 0] = "parsing";
    parsingStatus[parsingStatus["completed"] = 1] = "completed";
})(parsingStatus = exports.parsingStatus || (exports.parsingStatus = {}));
var CharState = (function () {
    function CharState(reader) {
        this.reader = reader;
        this._status = parsingStatus.parsing;
    }
    Object.defineProperty(CharState.prototype, "status", {
        get: function () {
            return this._status;
        },
        set: function (value) {
            this._status = value;
        },
        enumerable: true,
        configurable: true
    });
    return CharState;
}());
exports.CharState = CharState;
