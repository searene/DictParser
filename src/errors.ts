export class TreeBuilderNotFoundError extends Error {
    constructor(msg: string) {
        super(msg);
        let o = Object.setPrototypeOf(this, TreeBuilderNotFoundError.prototype);
        console.log(Object.getPrototypeOf(this));
    }
}