/**
 * Created by searene on 2/9/17.
 */

module Exceptions {
    export class InvalidFileException extends Error {
        constructor(public message: string) {
            super(message);
            this.name = "InvalidFileException";
            this.stack = (<any>new Error()).stack;
        }
        toString() {
            return this.name + ": " + this.message;
        }
    }
}
