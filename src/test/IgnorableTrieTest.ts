import { describe, it } from "mocha";
import { IgnorableTrie } from "../IgnorableTrie";
import { assert } from "chai";

describe("#IgnorableTrieTest", () => {
  it("#findWordsStartWithExcludeIgnoreCharacters", () => {
    const ignorableTrie = new IgnorableTrie();
    ignorableTrie.add("go out");
    ignorableTrie.add("test");
    const words = new Set<string>();
    ignorableTrie.findWordsStartWithExcludeIgnoreCharacters("go\\out", 10, words);
    assert.equal(words.size, 1);
    assert.equal(words.values().next().value, "go out");
  });
});