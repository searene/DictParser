import {TreeBuilder} from "./treeBuilder";
import {DSLCharState} from "../dslCharState";
import {DictIndex} from "./model/dictIndex";
import {Tag} from "../tag";
/**
 * Created by searene on 17-1-23.
 */

export class DSLTreeBuilder extends TreeBuilder {
    protected _dictionarySuffixes: string[] = ['dsl', 'dz'];

    public parse(contents: string): TreeBuilder.Tag {

    }
}
