export class TrieNode {
  public key: string;
  public end = false;
  public parent?: TrieNode;

  // key -> Trie
  public children: Map<string, TrieNode> = new Map<string, TrieNode>();
  public constructor(key: string, parent?: TrieNode) {
    this.key = key;
    this.parent = parent;
  }
}
