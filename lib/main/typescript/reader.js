"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var constant_1 = require("./constant");
/**
 * Created by searene on 17-1-22.
 */
log4js.configure(constant_1.LOG_CONFIG_LOCATION);
var Reader = (function () {
    function Reader(input, charset) {
        // replace \r\n with \n so we won't deal with \r any more
        input = input.replace('\r\n', '\n');
        this._input = input.split("");
        this._pos = 0;
    }
    /** return the peakNextChar character,
     *  return empty string if all characters are read
     */
    Reader.prototype.peakNextChar = function () {
        return this._pos < this._input.length ?
            this._input[this._pos] :
            "";
    };
    /** Read a character, return it
     *
     * @returns {string} the character, return "" if we have read all characters
     */
    Reader.prototype.advanceOneCharacter = function () {
        var currentCharacter = this.peakNextChar();
        this._pos++;
        return currentCharacter;
    };
    /** Read a line, return it without any carriage return
     *
     * @returns {string} contents of the line without carriage return
     */
    Reader.prototype.advanceOneLine = function () {
        var line = "";
        var currentChar = this.peakNextChar();
        while (currentChar != "" && currentChar != '\n') {
            line += currentChar;
            currentChar = this.peakNextChar();
        }
        return line;
    };
    /**
     * The opposite of {@link advanceOneCharacter()}, which goes
     * back one character, returns the peakNextChar character before
     * going back.
     *
     * If we cannot go back(i.e. the position we are in is less or
     * equal to 0, return "")
     */
    Reader.prototype.goBackOneCharacter = function () {
        if (this._pos <= 0) {
            // return empty string if we cannot go back
            return "";
        }
        else {
            return this._input[this._pos--];
        }
    };
    Reader.prototype.consumeEmptySpaces = function () {
        while (this._input[this._pos] in [' ', '\t']) {
            this._pos++;
        }
    };
    return Reader;
}());
exports.Reader = Reader;
