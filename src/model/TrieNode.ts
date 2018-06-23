export class TrieNode {
  public key: string;
  public end = false;

  // key -> Trie
  public children: Map<string, TrieNode> = new Map<string, TrieNode>();
  public constructor(key: string) {
    this.key = key;
  }
}
