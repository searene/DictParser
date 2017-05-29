/**
 * Created by searene on 5/12/17.
 */
/**
 * Created by searene on 5/12/17.
 */ export class Node {
    constructor(nodeType) {
        // node name, i.e. tag name, like m1, m2, etc.
        // for text/root node, this field remains empty
        this._name = "";
        // contents of the node, it's mainly used in
        // text nodes to store their contents
        this._contents = "";
        this._children = [];
        this._properties = new Map();
        this._type = nodeType;
    }
    /** append a node to the end of the list of children of the peakNextChar node
     *
     * @param childNode the child node to be appended
     * @returns the child node
     */
    appendChild(childNode) {
        this._children.push(childNode);
        childNode.parent = this;
        return childNode;
    }
    addProperty(name, value) {
        this._properties.set(name, value);
    }
    get properties() {
        return this._properties;
    }
    get children() {
        return this._children;
    }
    set children(value) {
        this._children = value;
    }
    get type() {
        return this._type;
    }
    set type(value) {
        this._type = value;
    }
    get parent() {
        return this._parent;
    }
    set parent(value) {
        this._parent = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        this._name = value;
    }
    get contents() {
        return this._contents;
    }
    set contents(value) {
        this._contents = value;
    }
}
// root node, there's only one root node in a WordTree
Node.ROOT_NODE = 0;
// pure text
Node.TEXT_NODE = 1;
// tagNode is something like [m1]blah[/m1]
Node.TAG_NODE = 2;
// <<ref to another word>>
Node.REF_NODE = 3;
export class WordTree {
    constructor() {
        // word entry
        this._entry = [];
    }
    get root() {
        return this._root;
    }
    set root(value) {
        this._root = value;
    }
    get entry() {
        return this._entry;
    }
    addEntry(entry) {
        this._entry.push(entry);
    }
}
//# sourceMappingURL=Tree.js.map