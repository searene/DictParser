import * as log4js from 'log4js';
import {LOG_CONFIG_LOCATION} from "./constant";
import {Log} from "./util/log";
/**
 * Created by searene on 17-1-22.
 */

let logger = Log.getLogger();

export class Reader {

    /** the position of the character in {@code this._input}
     *  that is going to be read, starts from 0
    */
    private _pos: number;

    private _input: string;

    constructor(input: string) {

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
    peakNextChar(): {valid: boolean, value: string} {
        return this._pos < this._input.length ?
            {valid: true, value: this._input[this._pos]}:
            {valid: false, value: ""};
    }

    getLastReadChar(): {valid: boolean, value: string} {
        return this._pos >= 1 ?
            {valid: true, value: this._input[this._pos]}:
            {valid: false, value: ""};
    }

    /** Read a character, return it
     *
     * @returns isFound: false if we have consumed all characters
     *                 and nothing left for us to consume, true otherwise
     *          value: consumed character, it exists only if {@code isFound}
     *                is set true
     */
    consumeOneChar(): {valid: boolean, value: string} {
        let nextChar = this.peakNextChar();
        if(nextChar.valid) {
            this._pos++;
            return {valid: true, value: nextChar.value};
        } else {
            return {valid: false, value: ""};
        }
    }

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
    goBackOneCharacter(): {valid: boolean, value: string} {
        if(this._pos <= 0) {
            // return empty string if we cannot go back
            return {valid: false, value: ""};
        } else {
            return {valid: true, value: this._input[this._pos--]};
        }
    }

    consumeNChars(n: number): {valid: boolean, value: string} {
        let c = this.peakNextChar();
        let consumedCount = 0;
        let consumedString = "";
        while(c.valid && consumedCount++ < n) {
            this._pos++;
            consumedString += c.value;
            c = this.peakNextChar();
        }
        return consumedString == "" ? {valid: false, value: ""} : {valid: true, value: consumedString};
    }

    consumeTo(s: string, isSearchedStringIncluded: boolean, considerEscape: boolean): {isFound: boolean, value: string} {
        if(this._pos >= this._input.length) {
            return {isFound: false, value: ""};
        }
        let startPos = this._pos;
        let index = this._input.indexOf(s, startPos);
        while(index != -1) {
            if(!considerEscape) {
                break;
            } else if((index - 1 >= this._pos && this._input[index - 1] != '\\') || (index == this._pos)) {
                break;
            } else {
                startPos = index + 1;
                index = this._input.indexOf(s, startPos);
            }
        }
        if(index == -1) {
            // not found
            return {isFound: false, value: ""};
        } else {
            let nextPos = isSearchedStringIncluded ? index + s.length : index;
            let consumedString = this._input.substring(this._pos, nextPos);
            this._pos = nextPos;
            return {isFound: true, value: consumedString};
        }
    }

    consumeEmptySpaces(): void {
        while(this._input[this._pos] in [' ', '\t']) {
            this._pos++;
        }
    }
}
