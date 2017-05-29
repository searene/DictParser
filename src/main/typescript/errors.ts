export class TreeBuilderNotFoundError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, TreeBuilderNotFoundError.prototype);
    }
}
export class NotResourceNodeError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, NotResourceNodeError.prototype);
    }
}
export class NotImplementedError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, NotImplementedError.prototype);
    }
}