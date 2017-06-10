"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log_1 = require("./util/log");
/**
 * Created by searene on 17-1-22.
 */
var logger = log_1.Log.getLogger();
var Reader = (function () {
    function Reader(input) {
        // replace \r\n with \n so we won't deal with \r any more
        this._input = input.replace('\r\n', '\n');
        this._pos = 0;
    }
    /** return the next character
     *
     * @returns isFound: false if we have consumed all characters
     *                 and nothing left for us to consume, true otherwise
     *          value: consumed character, it exists only if {@code isFound}
     *                is set true
     */
    Reader.prototype.peakNextChar = function () {
        return this._pos < this._input.length ?
            { valid: true, value: this._input[this._pos] } :
            { valid: false, value: "" };
    };
    Reader.prototype.getLastReadChar = function () {
        return this._pos >= 1 ?
            { valid: true, value: this._input[this._pos - 2] } :
            { valid: false, value: "" };
    };
    /** Read a character, return it
     *
     * @returns isFound: false if we have consumed all characters
     *                 and nothing left for us to consume, true otherwise
     *          value: consumed character, it exists only if {@code isFound}
     *                is set true
     */
    Reader.prototype.consumeOneChar = function () {
        var nextChar = this.peakNextChar();
        if (nextChar.valid) {
            this._pos++;
            return { valid: true, value: nextChar.value };
        }
        else {
            return { valid: false, value: "" };
        }
    };
    // /** Read a line, return it without any carriage return
    //  *
    //  * @returns {string} contents of the line without carriage return
    //  */
    // advanceOneLine(): string {
    //     let line: string = "";
    //     let currentChar: string = this.peakNextChar();
    //     while(currentChar != "" && currentChar != '\n') {
    //         line += currentChar;
    //         currentChar = this.peakNextChar();
    //     }
    //     return line;
    // }
    /**
     * The opposite of {@link advanceOneCharacter()}, which goes
     * back one character, returns the current character before
     * going back.
     *
     * If we cannot go back(i.e. the position we are in is less or
     * equal to 0, the {@code isFound} in the return value would be false)
     */
    Reader.prototype.goBackOneCharacter = function () {
        if (this._pos <= 0) {
            // return empty string if we cannot go back
            return { valid: false, value: "" };
        }
        else {
            return { valid: true, value: this._input[this._pos--] };
        }
    };
    Reader.prototype.consumeNChars = function (n) {
        var c = this.peakNextChar();
        var consumedCount = 0;
        var consumedString = "";
        while (c.valid && consumedCount++ < n) {
            this._pos++;
            consumedString += c.value;
            c = this.peakNextChar();
        }
        return consumedString == "" ? { valid: false, value: "" } : { valid: true, value: consumedString };
    };
    Reader.prototype.consumeTo = function (s, isSearchedStringIncluded, considerEscape) {
        if (this._pos >= this._input.length) {
            return { isFound: false, value: "" };
        }
        var startPos = this._pos;
        var index = this._input.indexOf(s, startPos);
        while (index != -1) {
            if (!considerEscape) {
                break;
            }
            else if ((index - 1 >= this._pos && this._input[index - 1] != '\\') || (index == this._pos)) {
                break;
            }
            else {
                startPos = index + 1;
                index = this._input.indexOf(s, startPos);
            }
        }
        if (index == -1) {
            // not found
            return { isFound: false, value: "" };
        }
        else {
            var nextPos = isSearchedStringIncluded ? index + s.length : index;
            var consumedString = this._input.substring(this._pos, nextPos);
            this._pos = nextPos;
            return { isFound: true, value: consumedString };
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
//# sourceMappingURL=Reader.js.map