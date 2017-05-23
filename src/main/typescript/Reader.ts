import * as log4js from 'log4js';
import {LOG_CONFIG_LOCATION} from "./constant";
/**
 * Created by searene on 17-1-22.
 */

log4js.configure(LOG_CONFIG_LOCATION);

export class Reader {

    /** the position of the character in {@code this._input}
     *  that is going to be read, starts from 0
    */
    private _pos: number;

    private _input: string;

    constructor(input: string) {

        // replace \r\n with \n so we won't deal with \r any more
        input = input.replace('\r\n', '\n');

        this._input = input;
        this._pos = 0;
    }

    /** return the next character
     * 
     * @returns valid: false if we have consumed all characters
     *                 and nothing left for us to consume, true otherwise
     *          value: consumed character, it exists only if {@code valid}
     *                is set true
     */
    peakNextChar(): {valid: boolean, value?: string} {
        return this._pos < this._input.length ?
            {valid: true, value: this._input[this._pos]}:
            {valid: false};
    }

    getLastReadChar(): {valid: boolean, value?: string} {
        return this._pos >= 1 ?
            {valid: true, value: this._input[this._pos]}:
            {valid: false};
    }

    /** Read a character, return it
     *
     * @returns valid: false if we have consumed all characters
     *                 and nothing left for us to consume, true otherwise
     *          value: consumed character, it exists only if {@code valid}
     *                is set true
     */
    consumeOneChar(): {valid: boolean, value?: string} {
        let current: {valid: boolean, char?: string} = this.peakNextChar();
        if(current.valid) {
            this._pos++;
            return {valid: true, value: current.char};
        } else {
            return {valid: false};
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
     * equal to 0, the {@code valid} in the return value would be false)
     */
    goBackOneCharacter(): {valid: boolean, value?: string} {
        if(this._pos <= 0) {
            // return empty string if we cannot go back
            return {valid: false};
        } else {
            return {valid: true, value: this._input[this._pos--]};
        }
    }

    consumeNChars(n: number): {valid: boolean, value?: string} {
        let c = this.peakNextChar();
        let consumedCount = 0;
        let consumedString = "";
        while(c.valid && consumedCount++ < n) {
            this._pos++;
            consumedString += c.value;
            c = this.peakNextChar();
        }
        return consumedString == "" ? {valid: false} : {valid: true, value: consumedString};
    }

    /** Consume characters until we meet {@code s}, notice that {@code s}
     * is also included in the result
     * 
     * @param s consume until {@code s} is met
     * @param considerEscape if {@code considerEscape} is set true, and suppose
     *      {@code s} is [, we will take \[ as [ and continue to consume other
     *      characters starting from [, instead of stopping when we see [
     * @return {valid: boolean, value?: string}
     *      valid: false if no more characters are left to be read, true otherwise
     *      value: consumed string, including {@code s}
     */
    consumeUntilFind(s: string, considerEscape: boolean): {valid: boolean, value?: string} {
        // let consumedString = "";
        // let escaped = false;
        // while(true) {
        //     let currentChar = this.consumeOneChar();
        //     if(currentChar.valid && currentChar.value == "\\" && considerEscape) {
        //         escaped = true;
        //     } else if(currentChar.valid && currentChar.value == s && escaped) {
        //         consumedString += s;
        //         escaped = false;
        //     } else if(currentChar.valid && currentChar.value == s) {
        //         return consumedString == "" ? {valid: false}
        //                                     : {valid: true, value: consumedString};
        //     } else if(!currentChar.valid) {
        //         return consumedString == "" ? {valid: false}
        //                                     : {valid: true, value: consumedString};
        //     }
        // }
        if(this._pos >= this._input.length) {
            return {valid: false};
        }
        let remainingString = this._input.substring(this._pos);
        let consumedString = s.substring(this._pos);
        let index = remainingString.indexOf(s);
        while(index != -1) {
            if((index - 1 >= this._pos && this._input[index - 1] != '\\') || (index == this._pos)) {
                consumedString = s.substring(this._pos, index + 1);
                break;
            } else {
                index = remainingString.indexOf(s);
            }
        }
        return {valid: true, value: consumedString};
    }

    consumeEmptySpaces(): void {
        while(this._input[this._pos] in [' ', '\t']) {
            this._pos++;
        }
    }
}
