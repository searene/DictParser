/**
 * Created by searene on 17-1-22.
 */
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Reader = (function () {
    function Reader(input) {
        this.input = input.split("");
        this.pos = 0;
    }
    /** return the current character,
     *  return empty string if all characters are read
     */
    Reader.prototype.current = function () {
        return this.pos < this.input.length ?
            this.input[this.pos] :
            "";
    };
    Reader.prototype.advanceOneCharacter = function () {
        var currentCharacter = this.current();
        this.pos++;
        return currentCharacter;
    };
    Reader.prototype.consumeEmptySpaces = function () {
        while (this.input[this.pos] in [' ', '\t']) {
            this.pos++;
        }
    };
    return Reader;
}());
exports.Reader = Reader;
