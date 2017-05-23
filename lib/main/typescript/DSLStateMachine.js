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
    /* @input: contents of a word entry and its definition
     */
    function DSLStateMachine(input) {
        var _this = _super.call(this, input) || this;
        _this._output = new Tree_1.WordTree();
        _this._currentEntry = "";
        _this._currentNode = _this._output.root = new Tree_2.Node();
        _this.states = {
            initial: function () {
                return _this.states.inEntry;
            },
            inEntry: function () {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return _this.states.completed;
                switch (currentChar.value) {
                    case '\n':
                        _this._output.addEntry(_this._currentEntry);
                        _this._currentEntry = "";
                        var c = _this._reader.consumeOneChar();
                        if (c.valid && (c.value == ' ' || c.value == '\t')) {
                            return _this.states.inDefinition;
                        }
                        else if (c.valid) {
                            _this._currentEntry += c.value;
                            return _this.states.inEntry;
                        }
                        else {
                            return _this.states.completed;
                        }
                    case '\\':
                        var escapedChar = _this._reader.consumeOneChar();
                        if (escapedChar.valid) {
                            _this._currentEntry += escapedChar;
                            return _this.states.inEntry;
                        }
                        else {
                            return _this.states.completed;
                        }
                    case '{':
                        return _this.states.inUnsortedEntry;
                    default:
                        _this._currentEntry += currentChar;
                        return _this.states.inEntry;
                }
            },
            inUnsortedEntry: function () {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return _this.states.completed;
                if (_this._reader.consumeUntilFind('}', true).valid) {
                    return _this.states.inEntry;
                }
                else {
                    return _this.states.completed;
                }
            },
            inDefinition: function () {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return _this.states.completed;
                switch (currentChar.value) {
                    case ' ':
                    case '\t':
                        return _this.states.inDefinition;
                    case '[':
                        return _this.states.enterNodeStart;
                    case '\n':
                        var nextChar = _this._reader.peakNextChar();
                        if (nextChar.valid && nextChar.value != '\n') {
                            return _this.states.inDefinition;
                        }
                        else {
                            return _this.states.completed;
                        }
                    default:
                        var textNode = _this.initNewNode(_this._currentNode);
                        textNode.name = "text";
                        textNode.contents += currentChar;
                        var consumedString = _this._reader.consumeUntilFind('[', true);
                        if (consumedString.valid) {
                            textNode.contents += consumedString.value;
                            return _this.states.enterNodeStart;
                        }
                        else {
                            return _this.states.completed;
                        }
                }
            },
            inNodeStart: function () {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return _this.states.completed;
                if (currentChar.value == '/') {
                    return _this.states.enterNodeEnd;
                }
                else {
                    var consumedString = _this._reader.consumeUntilFind(']', true);
                    if (!consumedString.valid)
                        return _this.states.completed;
                    var nameAndProperties = consumedString.value.split(/\s/);
                    var nodeName = nameAndProperties[0];
                    _this._currentNode = _this.initNewNode(_this._currentNode);
                    for (var i = 1; i < nameAndProperties.length; i++) {
                        var property = nameAndProperties[i];
                        var posOfEqualSign = property.indexOf("=");
                        if (posOfEqualSign != -1) {
                            var propertyName = property.substring(0, posOfEqualSign);
                            var propertyValue = property.substring(posOfEqualSign + 1, property.length);
                            _this._currentNode.addProperty(propertyName, propertyValue);
                        }
                        else {
                            _this._currentNode.addProperty(property, "");
                        }
                    }
                    return _this.states.inDefinition;
                }
            },
            inNodeEnd: function () {
                var currentChar = _this._reader.consumeOneChar();
                if (!currentChar.valid)
                    return _this.states.completed;
                var consumedString = _this._reader.consumeUntilFind(']', true);
                if (consumedString.valid) {
                    return _this.states.inDefinition;
                }
                else {
                    return _this.states.completed;
                }
            },
            completed: function () {
                return _this.states.completed;
            }
        };
        // replace \r\n with \n so we won't deal with \r any more
        _this._input = _this._input.replace('\r\n', '\n');
        _this._reader = new Reader_1.Reader(_this._input);
        return _this;
    }
    /** Create a new node, whose parent is {@code parentOfTheNewNode},
     * then return the new node.
     *
     * @param parentOfTheNewNode peakNextChar node
     */
    DSLStateMachine.prototype.initNewNode = function (parentOfTheNewNode) {
        var previousNode = parentOfTheNewNode;
        var newNode = new Tree_2.Node();
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
