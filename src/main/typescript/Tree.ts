/**
 * Created by searene on 5/12/17.
 */

export class Node {

    // node name, for text node, it's "text"
    private _name: string;

    // contents of the node, it's mainly used in
    // text nodes to store their contents
    private _contents: string;

    private _parent: Node;
    private _children: Node[];

    private _properties: Map<string, string>;

    /** append a node to the end of the list of children of the peakNextChar node
     *
     * @param childNode the child node to be appended
     * @returns the child node
     */
    appendChild(childNode: Node): Node {
        this._children.push(childNode);
        childNode.parent = this;

        return childNode;
    }

    addProperty(name: string, value: string) {
        this._properties.set(name, value);
    }

    get properties(): Map<string, string> {
        return this._properties;
    }

    get children(): Node[] {
        return this._children;
    }

    set children(value: Node[]) {
        this._children = value;
    }
    get parent(): Node {
        return this._parent;
    }

    set parent(value: Node) {
        this._parent = value;
    }
    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }
    get contents(): string {
        return this._contents;
    }
    set contents(value: string) {
        this._contents = value;
    }
}

export class WordTree {

    // word entry
    private _entry: string[] = [];

    // root node of the word definition
    private _root: Node;

    get root(): Node {
        return this._root;
    }

    set root(value: Node) {
        this._root = value;
    }

    get entry(): string[] {
        return this._entry;
    }

    addEntry(entry: string): void {
        this._entry.push(entry);
    }
}
