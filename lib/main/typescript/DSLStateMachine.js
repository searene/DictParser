"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Reader_1 = require("./Reader");
var Tree_1 = require("./Tree");
var log_1 = require("./util/log");
var StateMachine_1 = require("./StateMachine");
/**
 * Created by searene on 5/13/17.
 */
var logger = log_1.Log.getLogger();
var DSLStateMachine = (function (_super) {
    __extends(DSLStateMachine, _super);
    function DSLStateMachine(input) {
        var _this = _super.call(this, input) || this;
        _this.states = {
            initial: function (param) {
                return { next: _this.states.inEntry };
            },
            inEntry: function (param) {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return { next: _this.states.completed };
                switch (currentChar.value) {
                    case '\n':
                        _this._wordTree.entry = _this._currentEntry;
                        var c = _this._reader.consumeOneChar();
                        if (c.valid && (c.value == ' ' || c.value == '\t')) {
                            return { next: _this.states.defLineStart };
                        }
                        else if (c.valid) {
                            // we are in another entry, read on until we
                            // find definition
                            while (true) {
                                var consumed = _this._reader.consumeTo("\n", true, false);
                                if (!consumed.isFound)
                                    return { next: _this.states.completed };
                                var c_1 = _this._reader.consumeOneChar();
                                if (!c_1.valid) {
                                    return { next: _this.states.completed };
                                }
                                else if ([' ', '\t'].indexOf(c_1.value) > -1) {
                                    return { next: _this.states.defLineStart };
                                }
                            }
                        }
                        else {
                            return { next: _this.states.completed };
                        }
                    case '\\':
                        var escapedChar = _this._reader.consumeOneChar();
                        if (escapedChar.valid) {
                            _this._currentEntry += escapedChar;
                            return { next: _this.states.inEntry };
                        }
                        else {
                            return { next: _this.states.completed };
                        }
                    case '{':
                        return { next: _this.states.inEntry };
                    default:
                        _this._currentEntry += currentChar.value;
                        return { next: _this.states.inEntry };
                }
            },
            defLineStart: function (param) {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return { next: _this.states.completed };
                switch (currentChar.value) {
                    case ' ':
                    case '\t':
                        return { next: _this.states.defLineStart };
                    case '\n':
                        return { next: _this.states.defLineStart };
                    default:
                        _this._currentNode = _this.initNewNode(_this._wordTree.root, Tree_1.Node.NEW_LINE_NODE);
                        _this._reader.goBackOneCharacter();
                        return { next: _this.states.inDefinition };
                }
            },
            inDefinition: function (param) {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return { next: _this.states.completed };
                switch (currentChar.value) {
                    case '{':
                        return { next: _this.states.enterComments, param: _this.states.inDefinition };
                    case '\\':
                        return { next: _this.states.inEscape, param: _this.states.inDefinition };
                    case '[':
                        if (_this._currentNode.type == Tree_1.Node.TEXT_NODE) {
                            _this._currentNode = _this._currentNode.parent;
                        }
                        var c = _this._reader.peakNextChar();
                        if (!c.valid)
                            return { next: _this.states.completed };
                        if (c.value == '/') {
                            _this._reader.consumeOneChar();
                            return { next: _this.states.inNodeEnd };
                        }
                        else {
                            _this._currentNode = _this.initNewNode(_this._currentNode, Tree_1.Node.TAG_NODE);
                            return { next: _this.states.inNodeStart };
                        }
                    case '\n':
                        return { next: _this.states.defLineStart };
                    case '<':
                        return { next: _this.states.enterRef, param: _this.states.inDefinition };
                    default:
                        _this.consume(_this.states.inDefinition, currentChar.value);
                        return { next: _this.states.inDefinition };
                }
            },
            inEscape: function (previousFunc) {
                _this.assertFunc(previousFunc);
                previousFunc = previousFunc;
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return { next: _this.states.completed };
                if (currentChar.value == '\n' && previousFunc == _this.states.defLineStart) {
                    _this.initNewNode(_this._wordTree.root, Tree_1.Node.NEW_LINE_NODE);
                    return { next: previousFunc };
                }
                else if (currentChar.value == '\n') {
                    return { next: _this.states.defLineStart };
                }
                else if (['{', '}', '<', '>'].indexOf(currentChar.value) > -1) {
                    var nextChar = _this._reader.consumeOneChar();
                    if (!nextChar.valid) {
                        _this.consume(previousFunc, currentChar.value);
                        return { next: _this.states.completed };
                    }
                    else if (nextChar.value == currentChar.value) {
                        _this.consume(previousFunc, currentChar.value + nextChar.value);
                        return { next: previousFunc };
                    }
                    else {
                        _this._reader.goBackOneCharacter();
                        _this.consume(previousFunc, currentChar.value);
                        return { next: previousFunc };
                    }
                }
                else {
                    _this.consume(previousFunc, currentChar.value);
                    return { next: previousFunc };
                }
            },
            enterComments: function (previousFucntion) {
                _this.assertFunc(previousFucntion);
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return { next: _this.states.completed };
                switch (currentChar.value) {
                    case '{':
                        return { next: _this.states.inComments, param: previousFucntion };
                    default:
                        return { next: _this.states.completed };
                }
            },
            inComments: function (functionBeforeComments) {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return { next: _this.states.completed };
                switch (currentChar.value) {
                    case '}':
                        var nextChar = _this._reader.consumeOneChar();
                        if (!nextChar.valid)
                            return { next: _this.states.completed };
                        if (nextChar.value == '}') {
                            // the end of comments is found
                            return { next: functionBeforeComments };
                        }
                    case '\\':
                        return { next: _this.states.inEscape, param: _this.states.inComments };
                    default:
                        return { next: _this.states.inComments, param: functionBeforeComments };
                }
            },
            enterRef: function (previousFunction) {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid) {
                    _this.consume(previousFunction, '<');
                    return { next: _this.states.completed };
                }
                switch (currentChar.value) {
                    case '<':
                        return { next: _this.states.inRef, param: previousFunction };
                    default:
                        _this.consume(previousFunction, '<');
                        _this._reader.goBackOneCharacter();
                        return { next: previousFunction };
                }
            },
            inRef: function (functionBeforeRef) {
                _this.assertFunc(functionBeforeRef);
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return { next: _this.states.completed };
                switch (currentChar.value) {
                    case '\\':
                        return { next: _this.states.inEscape, param: _this.states.inRef };
                    case '>':
                        var nextChar = _this._reader.consumeOneChar();
                        if (!nextChar.valid)
                            return { next: _this.states.completed };
                        if (nextChar.value == '>') {
                            _this._currentNode = _this._currentNode.parent;
                            return { next: functionBeforeRef };
                        }
                        else {
                            _this.consume(_this.states.inRef, nextChar.value);
                            return { next: _this.states.inRef, param: functionBeforeRef };
                        }
                    default:
                        _this.consume(_this.states.inRef, currentChar.value);
                        return { next: _this.states.inRef, param: functionBeforeRef };
                }
            },
            inNodeStart: function (param) {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    _this.states.completed;
                switch (currentChar.value) {
                    case ']':
                        // split name and properties
                        var propertyList = _this._currentNode.name.split(/\s+/);
                        _this._currentNode.name = propertyList[0];
                        propertyList.slice(1).forEach(function (property) {
                            var keyAndValue = property.split('=');
                            _this._currentNode.properties.set(keyAndValue[0], keyAndValue.slice(1).join('='));
                        });
                        return { next: _this.states.inDefinition };
                    case '{':
                        return { next: _this.states.enterComments, param: _this.states.inNodeStart };
                    case '\\':
                        return { next: _this.states.inEscape, param: _this.states.inNodeStart };
                    default:
                        _this.consume(_this.states.inNodeStart, currentChar.value);
                        return { next: _this.states.inNodeStart };
                }
            },
            inNodeEnd: function (param) {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return { next: _this.states.completed };
                switch (currentChar.value) {
                    case ']':
                        _this._currentNode = _this._currentNode.parent;
                        return { next: _this.states.inDefinition };
                    case '\\':
                        return { next: _this.states.inNodeEnd, param: _this.states.inNodeEnd };
                    case '{':
                        return { next: _this.states.enterComments, param: _this.states.inNodeEnd };
                    default:
                        return { next: _this.states.inNodeEnd };
                }
            },
            completed: function (param) {
                return { next: _this.states.completed };
            }
        };
        // replace \r\n with \n so we won't deal with \r any more
        input = input.replace(/\r?\n|\r/g, "\n");
        _this._reader = new Reader_1.Reader(input);
        _this._wordTree = new Tree_1.WordTree();
        _this._wordTree.root = new Tree_1.Node(Tree_1.Node.ROOT_NODE);
        _this._currentEntry = "";
        _this._currentNode = _this._wordTree.root;
        return _this;
    }
    /** Create a new node, whose parent is {@code parentOfTheNewNode},
     * then return the new node.
     *
     * @param parentOfTheNewNode peakNextChar node
     */
    DSLStateMachine.prototype.initNewNode = function (parentOfTheNewNode, nodeTypeForNewNode) {
        while (parentOfTheNewNode.type == Tree_1.Node.TEXT_NODE) {
            parentOfTheNewNode = parentOfTheNewNode.parent;
        }
        var previousNode = parentOfTheNewNode;
        var newNode = new Tree_1.Node(nodeTypeForNewNode);
        previousNode.appendChild(newNode);
        return newNode;
    };
    DSLStateMachine.prototype.assertFunc = function (obj) {
        if (obj == undefined || !(obj instanceof Function)) {
            throw new Error(obj + " is not a function");
        }
    };
    DSLStateMachine.prototype.consume = function (previousFunc, value) {
        switch (previousFunc) {
            case this.states.defLineStart:
            case this.states.inDefinition:
                if (this._currentNode.type != Tree_1.Node.TEXT_NODE) {
                    this._currentNode = this.initNewNode(this._currentNode, Tree_1.Node.TEXT_NODE);
                }
                this._currentNode.contents += value;
                break;
            case this.states.inNodeStart:
                if (this._currentNode.type != Tree_1.Node.TAG_NODE) {
                    this._currentNode = this.initNewNode(this._currentNode, Tree_1.Node.TAG_NODE);
                }
                this._currentNode.name += value;
                break;
            case this.states.inRef:
                if (this._currentNode.type != Tree_1.Node.REF_NODE) {
                    this._currentNode = this.initNewNode(this._currentNode, Tree_1.Node.REF_NODE);
                }
                this._currentNode.name += value;
                break;
            case this.states.inComments:
            case this.states.inNodeEnd:
            // ignore
            default:
        }
    };
    return DSLStateMachine;
}(StateMachine_1.StateMachine));
exports.DSLStateMachine = DSLStateMachine;
//# sourceMappingURL=DSLStateMachine.js.map