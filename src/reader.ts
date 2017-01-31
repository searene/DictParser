/**
 * Created by searene on 17-1-22.
 */

export class Reader {
    pos: number;
    input: string[];

    constructor(input: string) {
        this.input = input.split("");
        this.pos = 0;
    }

    /** return the current character,
     *  return null if all characters are read
     */
    current(): string {
        return this.pos < this.input.length ?
            this.input[this.pos]:
            null;
    }

    advanceOneCharacter(): string {
        let currentCharacter: string = this.current();
        this.pos++;
        return currentCharacter;
    }

    consumeEmptySpaces() {
        while(this.input[this.pos] in [' ', '\t']) {
            this.pos++;
        }
    }
}
