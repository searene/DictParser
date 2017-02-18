export class TreeBuilderNotFoundError extends Error {
    constructor(msg: string) {
        super(msg);
        console.log(Object.getPrototypeOf(this));
        let o = Object.setPrototypeOf(this, TreeBuilderNotFoundError.prototype);
        console.log(Object.getPrototypeOf(this));
    }
}