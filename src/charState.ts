import {Reader} from "./reader";
import {Dictionary} from "./dictionary";
import {TreeBuilder} from "./treeBuilder";
/**
 * Created by searene on 17-1-23.
 */

export enum parsingStatus {
    parsing,
    completed
}

export abstract class CharState {
    protected treeBuilder: TreeBuilder;
    protected reader: Reader;
    private _status: parsingStatus;

    constructor(reader: Reader) {
        this.reader = reader;
        this._status = parsingStatus.parsing;
    }

    public abstract read(): void;

    get status(): parsingStatus {
        return this._status;
    }

    set status(value: parsingStatus) {
        this._status = value;
    }
}
