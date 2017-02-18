import {TreeBuilder} from "../treeBuilder";
import {DSLCharState} from "./dslCharState";
import {IndexBuilder} from "../indexBuilder";
import {DSLIndexBuilder} from "./dslIndexBuilder";
/**
 * Created by searene on 17-1-23.
 */

export class DSLTreeBuilder extends TreeBuilder {
    protected _dictionarySuffixes: string[] = ['dsl', 'dz'];

    public getIndexBuilder(dictFile: string): IndexBuilder {
        return new DSLIndexBuilder(dictFile);
    }

    public parse(contents: string): TreeBuilder.Tag {

    }
}
