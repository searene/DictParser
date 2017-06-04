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
var Tree_1 = require("./Tree");
var StateMachine_1 = require("./StateMachine");
var Reader_1 = require("./Reader");
var Tree_2 = require("./Tree");
var log_1 = require("./util/log");
/**
 * Created by searene on 5/13/17.
 */
var logger = log_1.Log.getLogger();
var DSLStateMachine = (function (_super) {
    __extends(DSLStateMachine, _super);
    /* @param input: contents of a word entry and its definition
     */
    function DSLStateMachine(input) {
        var _this = _super.call(this, input) || this;
        _this.states = {
            initial: function () {
                _this.resetCurrentEntry();
                _this.states.inEntry();
            },
            inEntry: function () {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    _this.states.completed();
                switch (currentChar.value) {
                    case '\n':
                        _this._output.addEntry({ completeEntry: _this._currentEntryWithUnsortedPart, indexableEntry: _this._currentEntryWithoutUnsortedPart });
                        _this.resetCurrentEntry();
                        var c = _this._reader.consumeOneChar();
                        if (c.valid && (c.value == ' ' || c.value == '\t')) {
                            _this.states.definitionStart();
                        }
                        else if (c.valid) {
                            _this._currentEntryWithoutUnsortedPart += c.value;
                            _this.states.inEntry();
                        }
                        else {
                            _this.states.completed();
                        }
                        break;
                    case '\\':
                        var escapedChar = _this._reader.consumeOneChar();
                        if (escapedChar.valid) {
                            _this.addStringToCurrentEntry(escapedChar.value);
                            _this.states.inEntry();
                        }
                        else {
                            _this.states.completed();
                        }
                        break;
                    case '{':
                        var nextChar = _this._reader.consumeOneChar();
                        if (nextChar.valid && nextChar.value == '{') {
                            var consumedString = _this._reader.consumeTo('}}', true, true);
                            if (consumedString.isFound) {
                                _this._currentEntryWithoutUnsortedPart += consumedString.value.substring(0, consumedString.value.length - 2);
                                _this.states.inEntry();
                            }
                            else {
                                _this.addStringToCurrentEntry('{');
                                _this._reader.goBackOneCharacter();
                                _this.states.inEntry();
                            }
                        }
                        else {
                            _this.addStringToCurrentEntry('{');
                            _this._reader.goBackOneCharacter();
                            _this.states.inEntry();
                        }
                        break;
                    default:
                        _this.addStringToCurrentEntry(currentChar.value);
                        _this.states.inEntry();
                        break;
                }
            },
            definitionStart: function () {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    _this.states.completed();
                switch (currentChar.value) {
                    case ' ':
                    case '\t':
                        _this.states.definitionStart();
                        break;
                    case '\n':
                        _this.states.completed();
                        break;
                    default:
                        _this._reader.goBackOneCharacter();
                        _this.states.inDefinition();
                        break;
                }
            },
            inDefinition: function () {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    _this.states.completed();
                switch (currentChar.value) {
                    case '[':
                        _this.states.enterNodeStart();
                        break;
                    case '\n':
                        _this.states.definitionStart();
                        break;
                    case '<':
                        var nextChar = _this._reader.consumeOneChar();
                        if (nextChar.valid && nextChar.value == '<') {
                            var consumedString_1 = _this._reader.consumeTo('>>', true, true);
                            if (consumedString_1.isFound) {
                                var refNode = _this.initNewNode(_this._currentNode, Tree_2.Node.REF_NODE);
                                var refWord = consumedString_1.value.substring(0, consumedString_1.value.length - 2);
                                refNode.contents = refWord;
                                _this.states.inDefinition();
                            }
                            else {
                                _this.addStringToCurrentEntry('<');
                                _this._reader.goBackOneCharacter();
                                _this.states.inDefinition();
                            }
                        }
                        else {
                            _this.addStringToCurrentEntry('<');
                            _this._reader.goBackOneCharacter();
                            _this.states.inDefinition();
                        }
                        break;
                    default:
                        var textNode = _this.initNewNode(_this._currentNode, Tree_2.Node.TEXT_NODE);
                        textNode.name = "text";
                        textNode.contents += currentChar.value;
                        var consumedString = _this._reader.consumeTo('[', false, true);
                        if (consumedString.isFound) {
                            textNode.contents += consumedString.value;
                            _this.states.enterNodeStart();
                        }
                        else {
                            _this.states.completed();
                        }
                        break;
                }
            },
            enterNodeStart: function () {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    _this.states.completed();
                switch (currentChar.value) {
                    case '/':
                        _this.states.enterNodeEnd();
                        break;
                    case ']':
                        _this._currentNode = _this.initNewNode(_this._currentNode, Tree_2.Node.TAG_NODE);
                        _this.states.inDefinition();
                        break;
                    case '{':
                        var nextChar = _this._reader.peakNextChar();
                        if (nextChar.valid && nextChar.value == '{') {
                            var consumedString = _this._reader.consumeTo('}}', true, true);
                            if (!consumedString.isFound) {
                                _this.states.completed();
                            }
                            else {
                                _this.states.enterNodeEnd();
                            }
                        }
                        else if (nextChar.valid) {
                            _this.states.enterNodeEnd();
                        }
                        else {
                            _this.states.completed();
                        }
                        break;
                    case '\\':
                        var c = _this._reader.consumeOneChar();
                        if (c.valid) {
                            _this._currentNode.name += c.value;
                            _this.states.inNodeStart();
                        }
                        else {
                            _this.states.completed();
                        }
                        break;
                    default:
                        _this._currentNode.name += currentChar.value;
                        _this.states.inNodeStart();
                        break;
                }
            },
            inNodeStart: function () {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    _this.states.completed();
                switch (currentChar.value) {
                    case ']':
                        _this._currentNode = _this.initNewNode(_this._currentNode, Tree_2.Node.TAG_NODE);
                        _this.states.inDefinition();
                        break;
                    case '{':
                        var nextChar = _this._reader.peakNextChar();
                        if (nextChar.valid && nextChar.value == '{') {
                            var consumedString = _this._reader.consumeTo('}}', true, true);
                            if (!consumedString.isFound) {
                                _this.states.completed();
                            }
                            else {
                                _this.states.inNodeStart();
                            }
                        }
                        else if (nextChar.valid) {
                            _this.states.enterNodeEnd();
                        }
                        else {
                            _this.states.completed();
                        }
                        break;
                    case '\\':
                        var c = _this._reader.consumeOneChar();
                        if (c.valid) {
                            _this._currentNode.name += c.value;
                            _this.states.inNodeStart();
                        }
                        else {
                            _this.states.completed();
                        }
                        break;
                    default:
                        _this._currentNode.name += currentChar.value;
                        _this.states.inNodeStart();
                        break;
                }
            },
            enterNodeEnd: function () {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    _this.states.completed();
                switch (currentChar.value) {
                    case ']':
                        _this.states.inDefinition();
                        break;
                    case '\\':
                        if (_this._reader.consumeOneChar().valid) {
                            _this.states.enterNodeEnd();
                        }
                        else {
                            _this.states.completed();
                        }
                        break;
                    case '{':
                        var nextChar = _this._reader.peakNextChar();
                        if (nextChar.valid && nextChar.value == '{') {
                            var consumedString = _this._reader.consumeTo('}}', true, true);
                            if (!consumedString.isFound) {
                                _this.states.completed();
                            }
                            else {
                                _this.states.enterNodeEnd();
                            }
                        }
                        else if (nextChar.valid) {
                            _this.states.enterNodeEnd();
                        }
                        else {
                            _this.states.completed();
                        }
                        break;
                    default:
                        if (!_this._reader.consumeOneChar().valid) {
                            return _this.states.completed();
                        }
                        break;
                }
            },
            completed: function () { }
        };
        // replace \r\n with \n so we won't deal with \r any more
        _this._input = _this._input.replace(/\r?\n|\r/g, "\n");
        _this._reader = new Reader_1.Reader(_this._input);
        _this._currentEntryWithoutUnsortedPart = "";
        _this._output = new Tree_1.WordTree();
        _this._output.root = new Tree_2.Node(Tree_2.Node.ROOT_NODE);
        _this._currentNode = _this._output.root;
        return _this;
    }
    DSLStateMachine.prototype.addStringToCurrentEntry = function (s) {
        this._currentEntryWithoutUnsortedPart += s;
        this._currentEntryWithUnsortedPart += s;
    };
    DSLStateMachine.prototype.resetCurrentEntry = function () {
        this._currentEntryWithoutUnsortedPart = "";
        this._currentEntryWithUnsortedPart = "";
    };
    /** Create a new node, whose parent is {@code parentOfTheNewNode},
     * then return the new node.
     *
     * @param parentOfTheNewNode peakNextChar node
     */
    DSLStateMachine.prototype.initNewNode = function (parentOfTheNewNode, nodeTypeForNewNode) {
        var previousNode = parentOfTheNewNode;
        var newNode = new Tree_2.Node(nodeTypeForNewNode);
        previousNode.appendChild(newNode);
        return newNode;
    };
    /** Set {@code node} as {@code node}'s parent,
     * and return the parent
     *
     * @param node the node to be closed
     */
    DSLStateMachine.prototype.closeNode = function (node) {
        node = node.parent;
        return node;
    };
    return DSLStateMachine;
}(StateMachine_1.StateMachine));
exports.DSLStateMachine = DSLStateMachine;
//# sourceMappingURL=DSLStateMachine.js.map