import { Reader } from "../../Reader";
import { Node, WordTree } from "../../Tree";
import { StateMachine, StateValue } from '../../StateMachine';
/**
 * Created by searene on 5/13/17.
 */

export class DSLStateMachine extends StateMachine {

    private _reader: Reader;

    protected _wordTree: WordTree;

    private _currentEntry: string;

    private _currentNode: Node;

    constructor(input: string) {

        super(input);

        // replace \r\n with \n so we won't deal with \r any more
        input = input.replace(/\r?\n|\r/g, "\n");

        this._reader = new Reader(input);

        this._wordTree = new WordTree();
        this._wordTree.root = new Node(Node.ROOT_NODE);

        this._currentEntry = "";
        this._currentNode = this._wordTree.root;
    }

    protected states = {
        initial: (param?: any): StateValue => {
            return { next: this.states.inEntry };
        },
        inEntry: (param?: any): StateValue => {
            const currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) { return { next: this.states.completed }; }
            switch(currentChar.value) {
                case '\n':
                    this._wordTree.entry = this._currentEntry;
                    const c = this._reader.consumeOneChar();
                    if(c.valid && (c.value == ' ' || c.value == '\t')) {
                        return { next: this.states.defLineStart };
                    } else if(c.valid) {

                        // we are in another entry, read on until we
                        // find definition
                        while(true) {
                            const consumed = this._reader.consumeTo("\n", true, false);
                            if(!consumed.isFound) { return { next: this.states.completed }; }

                            const c = this._reader.consumeOneChar();
                            if(!c.valid) {
                                return { next: this.states.completed };
                            } else if([' ', '\t'].indexOf(c.value) > -1) {
                                return { next: this.states.defLineStart };
                            }
                        }
                    } else {
                        return { next: this.states.completed };
                    }
                case '\\':
                    const escapedChar = this._reader.consumeOneChar();
                    if(escapedChar.valid) {
                        this._currentEntry += escapedChar;
                        return { next: this.states.inEntry };
                    } else {
                        return { next: this.states.completed };
                    }
                case '{':
                    return { next: this.states.inEntry };
                default:
                    this._currentEntry += currentChar.value;
                    return { next: this.states.inEntry };
            }
        },
        defLineStart: (param?: any): StateValue => {
            const currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) { return { next: this.states.completed }; }
            switch(currentChar.value) {
                case ' ':
                case '\t':
                    return { next: this.states.defLineStart };
                case '\n':
                    return { next: this.states.defLineStart };
                default:
                    this._currentNode = this.initNewNode(this._wordTree.root, Node.NEW_LINE_NODE);
                    this._reader.goBackOneCharacter();
                    return { next: this.states.inDefinition };
            }
        },
        inDefinition: (param?: any): StateValue => {
            const currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) { return { next: this.states.completed }; }
            switch(currentChar.value) {
                case '{':
                    return { next: this.states.enterComments, param: this.states.inDefinition };
                case '\\':
                    return { next: this.states.inEscape, param: this.states.inDefinition };
                case '[':
                    if(this._currentNode.type == Node.TEXT_NODE) {
                        this._currentNode = this._currentNode.parent;
                    }
                    const c = this._reader.peakNextChar();
                    if(!c.valid) { return { next: this.states.completed }; }
                    if(c.value == '/') {
                        this._reader.consumeOneChar();
                        return { next: this.states.inNodeEnd };
                    } else {
                        this._currentNode = this.initNewNode(this._currentNode, Node.TAG_NODE);
                        return { next: this.states.inNodeStart };
                    }
                case '\n':
                    return { next: this.states.defLineStart };
                case '<':
                    return { next: this.states.enterRef, param: this.states.inDefinition };
                default:
                    this.consume(this.states.inDefinition, currentChar.value);
                    return { next: this.states.inDefinition };
            }
        },
        inEscape: (previousFunc?: any): StateValue => {
            this.assertFunc(previousFunc);
            previousFunc = previousFunc as Function;
            const currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) { return { next: this.states.completed }; }
            if(currentChar.value == '\n' && previousFunc == this.states.defLineStart) {
                this.initNewNode(this._wordTree.root, Node.NEW_LINE_NODE);
                return { next: previousFunc };
            } else if(currentChar.value == '\n') {
                return { next: this.states.defLineStart };
            } else if(['{', '}', '<', '>'].indexOf(currentChar.value) > -1) {
                const nextChar = this._reader.consumeOneChar();
                if(!nextChar.valid) {
                    this.consume(previousFunc, currentChar.value);
                    return { next: this.states.completed };
                } else if(nextChar.value == currentChar.value) {
                    this.consume(previousFunc, currentChar.value + nextChar.value);
                    return { next: previousFunc };
                } else {
                    this._reader.goBackOneCharacter();
                    this.consume(previousFunc, currentChar.value);
                    return { next: previousFunc };
                }
            } else {
                this.consume(previousFunc, currentChar.value);
                return { next: previousFunc };
            }
        },
        enterComments: (previousFucntion?: any): StateValue => {
            this.assertFunc(previousFucntion);
            const currentChar = this._reader.consumeOneChar();
            if (!currentChar.valid) { return { next: this.states.completed }; }
            switch (currentChar.value) {
                case '{':
                    return { next: this.states.inComments, param: previousFucntion };
                default:
                    return { next: this.states.completed };
            }
        },
        inComments: (functionBeforeComments?: any): StateValue => {
            const currentChar = this._reader.consumeOneChar();
            if (!currentChar.valid) { return { next: this.states.completed }; }
            switch (currentChar.value) {
                case '}':
                    const nextChar = this._reader.consumeOneChar();
                    if(!nextChar.valid) { return { next: this.states.completed }; }
                    if(nextChar.value == '}') {
                        // the end of comments is found
                        return { next: functionBeforeComments };
                    }
                case '\\':
                    return { next: this.states.inEscape, param: this.states.inComments };
                default:
                    return { next: this.states.inComments, param: functionBeforeComments };
            }
        },
        enterRef: (previousFunction?: any): StateValue => {
            const currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) {
                this.consume(previousFunction, '<');
                return { next: this.states.completed };
            }
            switch(currentChar.value) {
                case '<':
                    return { next: this.states.inRef, param: previousFunction };
                default:
                    this.consume(previousFunction, '<');
                    this._reader.goBackOneCharacter();
                    return { next: previousFunction };
            }
        },
        inRef: (functionBeforeRef?: any): StateValue => {
            this.assertFunc(functionBeforeRef);
            const currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) { return { next: this.states.completed }; }
            switch(currentChar.value) {
                case '\\':
                    return { next: this.states.inEscape, param: this.states.inRef }
                case '>':
                    const nextChar = this._reader.consumeOneChar();
                    if(!nextChar.valid) { return { next: this.states.completed }; }
                    if(nextChar.value == '>') {
                        this._currentNode = this._currentNode.parent;
                        return { next: functionBeforeRef };
                    } else {
                        this.consume(this.states.inRef, nextChar.value);
                        return { next: this.states.inRef, param: functionBeforeRef };
                    }
                default:
                    this.consume(this.states.inRef, currentChar.value);
                    return { next: this.states.inRef, param: functionBeforeRef };
            }
        },
        inNodeStart: (param?: any): StateValue => {
            const currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) { this.states.completed; }
            switch (currentChar.value) {
                case ']':
                    // split name and properties
                    const propertyList: string[] = this._currentNode.name.split(/\s+/);
                    this._currentNode.name = propertyList[0];
                    propertyList.slice(1).forEach((property) => {
                        const keyAndValue: string[] = property.split('=');
                        this._currentNode.properties.set(keyAndValue[0], keyAndValue.slice(1).join('='));
                    });
                    return { next: this.states.inDefinition };
                case '{':
                    return { next: this.states.enterComments, param: this.states.inNodeStart };
                case '\\':
                    return { next: this.states.inEscape, param: this.states.inNodeStart };
                default:
                    this.consume(this.states.inNodeStart, currentChar.value);
                    return { next: this.states.inNodeStart };
            }
        },
        inNodeEnd: (param?: any): StateValue => {
            const currentChar = this._reader.consumeOneChar();
            if(!currentChar.valid) { return { next: this.states.completed }; }
            switch(currentChar.value) {
                case ']':
                    this._currentNode = this._currentNode.parent;
                    return { next: this.states.inDefinition };
                case '\\':
                    return { next: this.states.inNodeEnd, param: this.states.inNodeEnd };
                case '{':
                    return { next: this.states.enterComments, param: this.states.inNodeEnd };
                default:
                    return { next: this.states.inNodeEnd };
            }
        },
        completed: (param?: any): StateValue => {
            return { next: this.states.completed };
        }
    };

    /** Create a new node, whose parent is {@code parentOfTheNewNode},
     * then return the new node.
     * 
     * @param parentOfTheNewNode peakNextChar node
     */
    private initNewNode(parentOfTheNewNode: Node, nodeTypeForNewNode: string): Node {
        while(parentOfTheNewNode.type == Node.TEXT_NODE) {
            parentOfTheNewNode = parentOfTheNewNode.parent;
        }
        const previousNode: Node = parentOfTheNewNode;
        const newNode: Node = new Node(nodeTypeForNewNode);
        previousNode.appendChild(newNode);
        return newNode;
    }

    private assertFunc(obj: any): void {
        if(obj == undefined || !(obj instanceof Function)) {
            throw new Error(`${obj} is not a function`);
        }
    }

    private consume(previousFunc: Function, value: string): void {
        switch(previousFunc) {
            case this.states.defLineStart:
            case this.states.inDefinition:
                if(this._currentNode.type != Node.TEXT_NODE) {
                    this._currentNode = this.initNewNode(this._currentNode, Node.TEXT_NODE);
                }
                this._currentNode.contents += value;
                break;
            case this.states.inNodeStart:
                if(this._currentNode.type != Node.TAG_NODE) {
                    this._currentNode = this.initNewNode(this._currentNode, Node.TAG_NODE);
                }
                this._currentNode.name += value;
                break;
            case this.states.inRef:
                if(this._currentNode.type != Node.REF_NODE) {
                    this._currentNode = this.initNewNode(this._currentNode, Node.REF_NODE);
                }
                this._currentNode.contents += value;
                break;
            case this.states.inComments:
            case this.states.inNodeEnd:
                // ignore
            default:
                // unknown behaviour, ignore
        }
    }
}