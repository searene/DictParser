"use strict";
/**
 * Created by searene on 5/12/17.
 */
Object.defineProperty(exports, "__esModule", { value: true });
var Node = (function () {
    function Node() {
    }
    /** append a node to the end of the list of children of the peakNextChar node
     *
     * @param childNode the child node to be appended
     * @returns the child node
     */
    Node.prototype.appendChild = function (childNode) {
        this._children.push(childNode);
        childNode.parent = this;
        return childNode;
    };
    Node.prototype.addProperty = function (name, value) {
        this._properties.set(name, value);
    };
    Object.defineProperty(Node.prototype, "properties", {
        get: function () {
            return this._properties;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "children", {
        get: function () {
            return this._children;
        },
        set: function (value) {
            this._children = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "parent", {
        get: function () {
            return this._parent;
        },
        set: function (value) {
            this._parent = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (value) {
            this._name = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "contents", {
        get: function () {
            return this._contents;
        },
        set: function (value) {
            this._contents = value;
        },
        enumerable: true,
        configurable: true
    });
    return Node;
}());
exports.Node = Node;
var WordTree = (function () {
    function WordTree() {
        // word entry
        this._entry = [];
    }
    Object.defineProperty(WordTree.prototype, "root", {
        get: function () {
            return this._root;
        },
        set: function (value) {
            this._root = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WordTree.prototype, "entry", {
        get: function () {
            return this._entry;
        },
        enumerable: true,
        configurable: true
    });
    WordTree.prototype.addEntry = function (entry) {
        this._entry.push(entry);
    };
    return WordTree;
}());
exports.WordTree = WordTree;
