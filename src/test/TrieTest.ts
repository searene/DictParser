import { assert } from "chai";
import { Trie } from "../Trie";
import { describe, it } from "mocha";
describe("#TrieTest", () => {
  it("#contains", () => {
    const trie = new Trie();
    trie.insert("word");
    trie.insert("words");
    trie.insert("long");

    assert.isTrue(trie.contains("word"));
    assert.isFalse(trie.contains("wor"));
  });

  it("#findWordsStartWith", () => {
    const trie = new Trie();
    trie.insert("word");
    trie.insert("words");
    trie.insert("long");

    const words = trie.findWordsStartWith("word", 10);
    assert.isTrue(words.size === 2);
    assert.isTrue(words.has("word"));
    assert.isTrue(words.has("words"));
  });
});
