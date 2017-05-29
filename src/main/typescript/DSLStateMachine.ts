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

    protected _output: WordTree;

    private _currentEntryWithoutUnsortedPart: string;
    private _currentEntryWithUnsortedPart: string;

    private _currentNode: Node;

    /* @param input: contents of a word entry and its definition
     */
    constructor(input: string) {

        super(input);

        // replace \r\n with \n so we won't deal with \r any more
        this._input = this._input.replace('\r\n', '\n');

        this._reader = new Reader(this._input);

        this._currentEntryWithoutUnsortedPart = "";

        this._output = new WordTree();
        this._output.root = new Node(Node.ROOT_NODE);

        this._currentNode = this._output.root;
    }

    private addStringToCurrentEntry(s: string): void {
        this._currentEntryWithoutUnsortedPart += s;
        this._currentEntryWithUnsortedPart += s;
    }

    private resetCurrentEntry(): void {
        this._currentEntryWithoutUnsortedPart = "";
        this._currentEntryWithUnsortedPart = "";
    }

    protected states = {
        initial: (): void => {
            this.resetCurrentEntry();
            this.states.inEntry();
        },
        inEntry: (): void => {
            let currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) this.states.completed();
            switch(currentChar.value) {
                case '\n':
                    this._output.addEntry({completeEntry: this._currentEntryWithUnsortedPart, indexableEntry: this._currentEntryWithoutUnsortedPart});
                    this.resetCurrentEntry();

                    let c = this._reader.consumeOneChar();
                    if(c.valid && (c.value == ' ' || c.value == '\t')) {
                        this.states.definitionStart();
                    } else if(c.valid) {
                        this._currentEntryWithoutUnsortedPart += c.value;
                        this.states.inEntry();
                    } else {
                        this.states.completed();
                    }
                    break;
                case '\\':
                    let escapedChar = this._reader.consumeOneChar();
                    if(escapedChar.valid) {
                        this.addStringToCurrentEntry(escapedChar.value);
                        this.states.inEntry();
                    } else {
                        this.states.completed();
                    }
                    break;
                case '{':
                    let nextChar = this._reader.consumeOneChar();
                    if(nextChar.valid && nextChar.value == '{') {
                        let consumedString = this._reader.consumeTo('}}', true, true);
                        if(consumedString.isFound) {
                            this._currentEntryWithoutUnsortedPart += consumedString.value.substring(0, consumedString.value.length - 2);
                            this.states.inEntry();
                        } else {
                            this.addStringToCurrentEntry('{');
                            this._reader.goBackOneCharacter();
                            this.states.inEntry();
                        }
                    } else {
                        this.addStringToCurrentEntry('{');
                        this._reader.goBackOneCharacter();
                        this.states.inEntry();
                    }
                    break;
                default:
                    this.addStringToCurrentEntry(currentChar.value);
                    this.states.inEntry();
                    break;
            }
        },
        definitionStart: (): void => {
            let currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) this.states.completed();
            switch(currentChar.value) {
                case ' ':
                case '\t':
                    this.states.definitionStart();
                    break;
                case '\n':
                    this.states.completed();
                    break;
                default:
                    this._reader.goBackOneCharacter();
                    this.states.inDefinition();
                    break;
            }
        },
        inDefinition: (): void => {
            let currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) this.states.completed();
            switch(currentChar.value) {
                case '[':
                    this.states.enterNodeStart();
                    break;
                case '\n':
                    this.states.definitionStart();
                    break;
                case '<':
                    let nextChar = this._reader.consumeOneChar();
                    if(nextChar.valid && nextChar.value == '<') {
                        let consumedString = this._reader.consumeTo('>>', true, true);
                        if(consumedString.isFound) {
                            let refNode: Node = this.initNewNode(this._currentNode, Node.REF_NODE);
                            let refWord: string = consumedString.value.substring(0, consumedString.value.length - 2);
                            refNode.contents = refWord;
                            this.states.inDefinition();
                        } else {
                            this.addStringToCurrentEntry('<');
                            this._reader.goBackOneCharacter();
                            this.states.inDefinition();
                        }
                    } else {
                        this.addStringToCurrentEntry('<');
                        this._reader.goBackOneCharacter();
                        this.states.inDefinition();
                    }
                    break;

                default:
                    let textNode: Node = this.initNewNode(this._currentNode, Node.TEXT_NODE);
                    textNode.name = "text";
                    textNode.contents += currentChar.value;

                    let consumedString = this._reader.consumeTo('[', false, true);
                    if(consumedString.isFound) {
                        textNode.contents += consumedString.value;
                        this.states.enterNodeStart();
                    } else {
                        this.states.completed();
                    }
                    break;
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
                    this._currentNode = this.initNewNode(this._currentNode, Node.TAG_NODE);
                    this.states.inDefinition();
                    break;
                case '{':
                    let nextChar = this._reader.peakNextChar();
                    if(nextChar.valid && nextChar.value == '{') {
                        let consumedString = this._reader.consumeTo('}}', true, true);
                        if(!consumedString.isFound) {
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
                    this._currentNode.name += currentChar.value;
                    this.states.inNodeStart();
                    break;
            }
        },
        inNodeStart: (): void => {
            let currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) this.states.completed();
            switch (currentChar.value) {
                case ']':
                    this._currentNode = this.initNewNode(this._currentNode, Node.TAG_NODE);
                    this.states.inDefinition();
                    break;
                case '{':
                    let nextChar = this._reader.peakNextChar();
                    if(nextChar.valid && nextChar.value == '{') {
                        let consumedString = this._reader.consumeTo('}}', true, true);
                        if(!consumedString.isFound) {
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
                    this._currentNode.name += currentChar.value;
                    this.states.inNodeStart();
                    break;
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
                    if(this._reader.consumeOneChar().valid) {
                        this.states.enterNodeEnd();
                    } else {
                        this.states.completed();
                    }
                    break;
                case '{':
                    let nextChar = this._reader.peakNextChar();
                    if(nextChar.valid && nextChar.value == '{') {
                        let consumedString = this._reader.consumeTo('}}', true, true);
                        if(!consumedString.isFound) {
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
                    if(!this._reader.consumeOneChar().valid) {
                        return this.states.completed();
                    }
                    break;
            }
        },
        completed: (): void => {}
    };

    /** Create a new node, whose parent is {@code parentOfTheNewNode},
     * then return the new node.
     * 
     * @param parentOfTheNewNode peakNextChar node
     */
    private initNewNode(parentOfTheNewNode: Node, nodeTypeForNewNode: number): Node {
        let previousNode: Node = parentOfTheNewNode;
        let newNode: Node = new Node(nodeTypeForNewNode);
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