/**
 * Created by searene on 5/12/17.
 */

interface Node {

    // name of the node
    name: string;

    parent: Node;
    children: Node[];

    properties: Map<string, string>;

    /** append a node to the end of the list of children of the current node
     *
     * @param childNode the child node to be appended
     * @returns the child node
     */
    appendChild(childNode: Node): Node;
}

interface Tree {

    // root node of the tree
    root: Node
}
