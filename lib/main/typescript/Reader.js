"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var log4js = require("log4js");
var constant_1 = require("./constant");
/**
 * Created by searene on 17-1-22.
 */
log4js.configure(constant_1.LOG_CONFIG_LOCATION);
var Reader = (function () {
    function Reader(input) {
        // replace \r\n with \n so we won't deal with \r any more
        input = input.replace('\r\n', '\n');
        this._input = input.split("");
        this._pos = 0;
    }
    /** return the next character
     *
     * @returns valid: false if we have consumed all characters
     *                 and nothing left for us to consume, true otherwise
     *          value: consumed character, it exists only if {@code valid}
     *                is set true
     */
    Reader.prototype.peakNextChar = function () {
        return this._pos < this._input.length ?
            { valid: true, value: this._input[this._pos] } :
            { valid: false };
    };
    Reader.prototype.getLastReadChar = function () {
        return this._pos >= 1 ?
            { valid: true, value: this._input[this._pos] } :
            { valid: false };
    };
    /** Read a character, return it
     *
     * @returns valid: false if we have consumed all characters
     *                 and nothing left for us to consume, true otherwise
     *          value: consumed character, it exists only if {@code valid}
     *                is set true
     */
    Reader.prototype.consumeOneChar = function () {
        var current = this.peakNextChar();
        if (current.valid) {
            this._pos++;
            return { valid: true, value: current.char };
        }
        else {
            return { valid: false };
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
     * equal to 0, the {@code valid} in the return value would be false)
     */
    Reader.prototype.goBackOneCharacter = function () {
        if (this._pos <= 0) {
            // return empty string if we cannot go back
            return { valid: false };
        }
        else {
            return { valid: true, value: this._input[this._pos--] };
        }
    };
    /** Consume characters until we meet {@code value}, notice that {@code value}
     * is also included in the result
     *
     * @param char consume until {@code value} is met
     * @param considerEscape if {@code considerEscape} is set true, and suppose
     *      {@code value} is [, we will take \[ as [ and continue to consume other
     *      characters starting from [, instead of stopping when we see [
     * @return {valid: boolean, value?: string}
     *      valid: false if no more characters are left to be read, true otherwise
     *      value: consumed string, including {@code value}
     */
    Reader.prototype.consumeUntilFind = function (char, considerEscape) {
        var consumedString = "";
        var escaped = false;
        while (true) {
            var currentChar = this.consumeOneChar();
            if (currentChar.valid && currentChar.value == "\\" && considerEscape) {
                escaped = true;
            }
            else if (currentChar.valid && currentChar.value == char && escaped) {
                consumedString += char;
                escaped = false;
            }
            else if (currentChar.valid && currentChar.value == char) {
                return consumedString == "" ? { valid: false }
                    : { valid: true, value: consumedString };
            }
            else if (!currentChar.valid) {
                return consumedString == "" ? { valid: false }
                    : { valid: true, value: consumedString };
            }
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
