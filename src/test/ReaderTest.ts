import {Reader} from "../Reader";
import {assert} from "chai";

describe('test Reader', () => {

    it("#consumeTo", () => {
        const reader = new Reader("ab[d");
        const consumedString = reader.consumeTo('[', false, true);
        assert.deepEqual(consumedString, {isFound: true, value: "ab"});
    })
});
