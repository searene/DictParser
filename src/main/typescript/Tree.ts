/**
 * Created by searene on 5/12/17.
 */

export class Node {

    // root node, there's only one root node in a WordTree
    public static ROOT_NODE: number = 0;

    // pure text
    public static TEXT_NODE: number = 1;

    // tagNode is something like [m1]blah[/m1]
    public static TAG_NODE: number = 2;

    // <<ref to another word>>
    public static REF_NODE: number = 3;

    // new line
    public static NEW_LINE_NODE: number = 4;

    // node name, i.e. tag name, like m1, m2, etc.
    // for text/root node, this field remains empty
    private _name: string = "";

    private _type: number;

    // contents of the node, it's mainly used in
    // text nodes to store their contents
    private _contents: string = "";

    constructor(nodeType: number) {
        this._type = nodeType;
    }

    private _parent: Node;
    private _children: Node[] = [];

    private _properties: Map<string, string> = new Map<string, string>();

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

    set properties(properties: Map<string, string>) {
        this._properties = properties;
    }

    get children(): Node[] {
        return this._children;
    }

    set children(value: Node[]) {
        this._children = value;
    }

    get type(): number {
        return this._type;
    }

    set type(value: number) {
        this._type = value;
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

    toString(indent = 0) {
        let prefix = "";
        for(let i = 0; i < indent; i++) {
            if(i == 0) prefix += "|";
            else prefix += "-";
        }
        let properties = "";
        this._properties.forEach((value: string, key: string) => {
            properties += `{${key} => ${value}}`;
        })
        let currentNodeToString = `${prefix}name:${this._name}, ${properties}, type:${this._type}, contents:${this._contents}.`;
        let childrenNodesToString = "";
        for(let i = 0; i < this._children.length; i++) {
            let child: Node = this._children[i];
            childrenNodesToString += "\n" + child.toString(indent + 2);
        }
    
        return currentNodeToString +  childrenNodesToString;
    }
}

export class WordTree {

    // word entry
    private _entry: string;

    // root node of the word definition
    private _root: Node;

    get root(): Node {
        return this._root;
    }

    set root(value: Node) {
        this._root = value;
    }

    get entry(): string {
        return this._entry;
    }

    set entry(entry: string) {
        this._entry = entry;
    }

    toString() {
        return `${this._entry}
${this._root.toString()}`;
    }
}