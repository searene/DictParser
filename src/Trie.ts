import { TrieNode } from "./model/TrieNode";

export class Trie {
  private root = new TrieNode("");

  // key -> Trie
  public add = (word: string): void => {
    let node = this.root;
    for (const c of word) {
      if (!node.children.has(c)) {
        node.children.set(c, new TrieNode(c));
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
