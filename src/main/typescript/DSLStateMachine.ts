import { WordTree } from './Tree';
import {StateMachine} from "./StateMachine";
import {Reader} from "./Reader";
import {Node} from "./Tree";
import {Log} from "./util/log";
/**
 * Created by searene on 5/13/17.
 */

let logger = Log.getLogger();

export class DSLStateMachine extends StateMachine {

    private _reader: Reader;

    protected _output: WordTree = new WordTree();

    private _currentEntry: string = "";
    private _currentNode: Node = this._output.root = new Node();

    /* @input: contents of a word entry and its definition
     */
    constructor(input: string) {

        super(input);

        // replace \r\n with \n so we won't deal with \r any more
        this._input = this._input.replace('\r\n', '\n');

        this._reader = new Reader(this._input);
    }

    protected states = {
        initial: (): void => {
            this.states.inEntry();
        },
        inEntry: (): void => {
            let currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) this.states.completed();
            switch(currentChar.value) {
                case '\n':
                    this._output.addEntry(this._currentEntry);
                    this._currentEntry = "";

                    let c = this._reader.consumeOneChar();
                    if(c.valid && (c.value == ' ' || c.value == '\t')) {
                        this.states.inDefinition();
                    } else if(c.valid) {
                        this._currentEntry += c.value;
                        this.states.inEntry();
                    } else {
                        this.states.completed();
                    }
                    break;
                case '\\':
                    let escapedChar = this._reader.consumeOneChar();
                    if(escapedChar.valid) {
                        this._currentEntry += escapedChar;
                        this.states.inEntry();
                    } else {
                        this.states.completed();
                    }
                    break;
                case '{':
                    this.states.inUnsortedEntry();
                    break;
                default:
                    this._currentEntry += currentChar;
                    this.states.inEntry();
            }
        },
        inUnsortedEntry: (): void => {
            let currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) this.states.completed();
            if(this._reader.consumeUntilFind('}', true).valid) {
                this.states.inEntry();
            } else {
                this.states.completed();
            }
        },
        inDefinition: (): void => {
            let currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) this.states.completed();
            switch(currentChar.value) {
                case ' ':
                case '\t':
                    this.states.inDefinition();
                    break;
                case '[':
                    this.states.enterNodeStart();
                    break;
                case '\n':
                    let nextChar = this._reader.peakNextChar();
                    if(nextChar.valid && nextChar.value != '\n') {
                        this.states.inDefinition();
                    } else {
                        this.states.completed();
                    }
                    break;
                default:
                    let textNode: Node = this.initNewNode(this._currentNode);
                    textNode.name = "text";
                    textNode.contents += currentChar;

                    let consumedString = this._reader.consumeUntilFind('[', true);
                    if(consumedString.valid) {
                        textNode.contents += consumedString.value;
                        this.states.enterNodeStart();
                    } else {
                        this.states.completed();
                    }
            }
        },
        enterNodeStart: (): void => {
            let currentChar = this._reader.consumeOneChar();
            if (!currentChar.valid) this.states.completed();
            switch (currentChar.value) {
                case '/':
                    this.states.enterNodeEnd();
                    break;
                case ']':
                    this._currentNode = this.initNewNode(this._currentNode);
                    this.states.inDefinition();
                    break;
                case '{':
                    let nextChar = this._reader.peakNextChar();
                    if(nextChar.valid && nextChar.value == '{') {
                        let consumedString = this._reader.consumeUntilFind('}}', true);
                        if(!consumedString.valid) {
                            this.states.completed();
                        } else {
                            this.states.enterNodeEnd();
                        }
                    } else if(nextChar.valid) {
                        this.states.enterNodeEnd();
                    } else {
                        this.states.completed();
                    }
                    break;
                case '\\':
                    let c = this._reader.consumeOneChar();
                    if (c.valid) {
                        this._currentNode.name += c.value;
                        this.states.inNodeStart();
                    } else {
                        this.states.completed();
                    }
                    break;
                default:
                    this._currentNode.name += currentChar;
                    this.states.inNodeStart();
            }
        },
        inNodeStart: (): void => {
            let currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) this.states.completed();
            switch (currentChar.value) {
                case ']':
                    this._currentNode = this.initNewNode(this._currentNode);
                    this.states.inDefinition();
                    break;
                case '{':
                    let nextChar = this._reader.peakNextChar();
                    if(nextChar.valid && nextChar.value == '{') {
                        let consumedString = this._reader.consumeUntilFind('}}', true);
                        if(!consumedString.valid) {
                            this.states.completed();
                        } else {
                            this.states.inNodeStart();
                        }
                    } else if(nextChar.valid) {
                        this.states.enterNodeEnd();
                    } else {
                        this.states.completed();
                    }
                    break;
                case '\\':
                    let c = this._reader.consumeOneChar();
                    if (c.valid) {
                        this._currentNode.name += c.value;
                        this.states.inNodeStart();
                    } else {
                        this.states.completed();
                    }
                    break;
                default:
                    this._currentNode.name += currentChar;
                    this.states.inNodeStart();
            }
        },
        enterNodeEnd: (): void => {
            let currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) this.states.completed();
            switch(currentChar.value) {
                case ']':
                    this.states.inDefinition();
                    break;
                case '\\':
                    let c = this._reader.consumeOneChar();
                    if(c.valid) {
                        this.states.enterNodeEnd();
                    } else {
                        this.states.completed();
                    }
                    break;
                case '{':
                    let nextChar = this._reader.peakNextChar();
                    if(nextChar.valid && nextChar.value == '{') {
                        let consumedString = this._reader.consumeUntilFind('}}', true);
                        if(!consumedString.valid) {
                            this.states.completed();
                        } else {
                            this.states.enterNodeEnd();
                        }
                    } else if(nextChar.valid) {
                        this.states.enterNodeEnd();
                    } else {
                        this.states.completed();
                    }
                    break;
                default:
                    let c = this._reader.consumeOneChar();
                    if(!c.valid) {
                        this.states.completed();
                    }
            }
        },
        completed: (): void => {}
    };

    /** Create a new node, whose parent is {@code parentOfTheNewNode},
     * then return the new node.
     * 
     * @param parentOfTheNewNode peakNextChar node
     */
    private initNewNode(parentOfTheNewNode: Node): Node {
        let previousNode: Node = parentOfTheNewNode;
        let newNode: Node = new Node();
        previousNode.appendChild(newNode);
        return newNode;
    }

    /** Set {@code node} as {@code node}'s parent,
     * and return the parent
     * 
     * @param node the node to be closed
     */
    private closeNode(node: Node): Node {
        node = node.parent;
        return node;
    }
}