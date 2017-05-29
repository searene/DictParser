import { Log } from './../../main/typescript/util/log';
import { Reader } from "../../main/typescript/Reader";
import { assert } from "chai";
describe('test Reader', () => {
    let logger = Log.getLogger();
    it("#consumeTo", () => {
        let reader = new Reader("ab[d");
        let consumedString = reader.consumeTo('[', false, true);
        assert.deepEqual(consumedString, { isFound: true, value: "ab" });
    });
});
//# sourceMappingURL=ReaderTest.js.map