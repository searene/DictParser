"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("./util/log");
/**
 * Created by searene on 17-1-23.
 */
var logger = log_1.Log.getLogger();
var Dictionary = (function () {
    function Dictionary() {
        // e.g. zip, dz, containing all the resources such as images/audios
        this._resourceHolderSuffixes = ['.zip'];
        // e.g. jpg, wmv, which are the actual resource files
        this._resourceFileSuffixes = ['.jpg', '.wmv', '.bmp', '.mp3'];
    }
    Object.defineProperty(Dictionary.prototype, "dictionarySuffixes", {
        get: function () {
            return this._dictionarySuffixes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dictionary.prototype, "resourceHolderSuffixes", {
        get: function () {
            return this._resourceHolderSuffixes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Dictionary.prototype, "resourceFileSuffixes", {
        get: function () {
            return this._resourceFileSuffixes;
        },
        enumerable: true,
        configurable: true
    });
    return Dictionary;
}());
exports.Dictionary = Dictionary;
//# sourceMappingURL=Dictionary.js.map