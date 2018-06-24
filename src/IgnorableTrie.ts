import { TrieNode } from "./model/TrieNode";
import { Trie } from "./Trie";

export class IgnorableTrie extends Trie {
  private readonly ignoreCharacters = "-_ .;\\?,/";

  public findWordsStartWithExcludeIgnoreCharacters = (
    startWith: string,
    maxCount: number,
    previousWords: Set<string>
  ) => {
    if (previousWords.size >= maxCount) {
      return;
    }
    const endNodes = this.getEndNodesFromWords(previousWords);
    this.findEndNodesStartWithExcludeIgnoreCharacters(
      this.root,
      startWith,
      maxCount,
      endNodes
    );
    const words = this.getWordsFromEndNodes(endNodes);
    for (const word of words.values()) {
      previousWords.add(word);
    }
  };

  private getNextCharIndex = (prefix: string): number => {
    for (let i = 0; i < prefix.length; i++) {
      const c = prefix[i];
      if (this.ignoreCharacters.indexOf(c) === -1) {
        return i;
      }
    }
    return -1;
  };

  private getChildrenWithKey = (
    key: string,
    startNodes: TrieNode[]
  ): TrieNode[] => {
    const result: TrieNode[] = [];
    for (const node of startNodes) {
      if (node.key === key) {
        result.push(node);
      } else if (this.ignoreCharacters.indexOf(node.key) > -1) {
        this.getChildrenWithKey(
          key,
          Array.from(node.children.values())
        ).forEach((n: TrieNode) => {
          result.push(n);
        });
      }
    }
    return result;
  };

  private findEndNodesStartWithExcludeIgnoreCharacters = (
    node: TrieNode,
    prefix: string,
    maxCount: number,
    endNodes: Set<TrieNode>
  ) => {
    if (endNodes.size >= maxCount) {
      return;
    }
    const charIndex = this.getNextCharIndex(prefix);
    if (charIndex === -1) {
      this.findAllEndNodesStartWith(node, maxCount - endNodes.size, endNodes);
      return;
    }
    const children = this.getChildrenWithKey(
      prefix[charIndex],
      Array.from(node.children.values())
    );
    children.forEach((child: TrieNode) => {
      this.findEndNodesStartWithExcludeIgnoreCharacters(
        child,
        prefix.substring(charIndex + 1, prefix.length),
        maxCount,
        endNodes
      );
    });
  };
}
