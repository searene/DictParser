import { TrieNode } from "./model/TrieNode";

export class Trie {
  protected root = new TrieNode("");

  // key -> Trie
  public add = (word: string): void => {
    let node = this.root;
    for (const c of word) {
      if (!node.children.has(c)) {
        node.children.set(c, new TrieNode(c, node));
      }
      node = node.children.get(c) as TrieNode;
    }
    node.end = true;
  };
  /**
   * Check if has the exact word.
   */
  public contains = (word: string): boolean => {
    let node = this.root;
    for (const c of word) {
      if (node.children.has(c)) {
        node = node.children.get(c) as TrieNode;
      } else {
        return false;
      }
    }
    return node.end;
  };

  public findWordsStartWith = (
    prefix: string,
    maxReturnSize: number
  ): Set<string> => {
    let node = this.root;
    for (const c of prefix) {
      if (!node.children.has(c)) {
        return new Set();
      }
      node = node.children.get(c) as TrieNode;
    }
    const result = new Set<string>();
    this.findAllWords(node, maxReturnSize, prefix, result);
    return result;
  };

  // include startNode if it's an endNode
  protected findAllEndNodesStartWith = (startNode: TrieNode, maxCount: number, result: Set<TrieNode>) => {
    if (result.size >= maxCount) {
      return;
    }
    if (startNode.end) {
      result.add(startNode);
    }
    for (const childNode of startNode.children.values()) {
      this.findAllEndNodesStartWith(childNode, maxCount, result);
    }
    return result;
  }

  protected getWordByEndNode = (endNode: TrieNode): string => {
    let result = endNode.key;
    if (endNode.parent === undefined) {
      // endNode is the root node
      return result;
    }
    result = this.getWordByEndNode(endNode.parent) + result;
    return result;
  }

  protected getEndNodeByWord = (word: string): TrieNode => {
    let currentNode = this.root;
    for (const c of word) {
      currentNode = currentNode.children.get(c) as TrieNode;
    }
    return currentNode;
  };

  protected getEndNodesFromWords = (words: Set<string>): Set<TrieNode> => {
    const endNodes: Set<TrieNode> = new Set();
    for (const word of words) {
      endNodes.add(this.getEndNodeByWord(word));
    }
    return endNodes;
  };

  protected getWordsFromEndNodes = (nodes: Set<TrieNode>): Set<string> => {
    const words = new Set<string>();
    for (const node of nodes) {
      words.add(this.getWordByEndNode(node))
    }
    return words;
  };


  /**
   * Find all words starting with the given {@code node}.
   */
  private findAllWords = (
    node: TrieNode,
    maxReturnSize: number,
    prefix: string,
    result: Set<string>
  ) => {
    if (result.size >= maxReturnSize) {
      return;
    }
    if (node.end) {
      result.add(prefix);
    }
    for (const key of node.children.keys()) {
      const childNode = node.children.get(key) as TrieNode;
      prefix = prefix + key;
      this.findAllWords(childNode, maxReturnSize, prefix, result);
      prefix = prefix.substring(0, prefix.length - 1);
    }
  };
}
