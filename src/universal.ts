import path = require('path');
/**
 * Created by searene on 17-1-30.
 */

export class Constant {

    // root path of the project
    public static readonly rootPath: string = path.resolve(__dirname, '..');

    // path to the data directory
    public static readonly dataPath: string = path.join(Constant.rootPath, 'data');

    public static readonly pathToDbFile: string = path.join(Constant.dataPath, 'dictParser.db');

    public static readonly dbName: string = 'dictParser';

    public static readonly resourceTableName: string = 'resource';

    public static readonly indexTableName: string = 'wordIndex';
}

// used when we need to return null
export class Option<T> {
    private _isValid: boolean;
    private _value: T|undefined;

    constructor(isValid: boolean, value?: T) {
        this._isValid = isValid;
        this._value = value;
    }

    get value(): T|undefined {
        return this._value;
    }
    get isValid(): boolean {
        return this._isValid;
    }
}