import { Log } from './../../main/typescript/util/log';
import {Reader} from "../../main/typescript/Reader";
import {LOG_CONFIG_LOCATION} from "../../main/typescript/constant";
import {assert} from "chai";

describe('test Reader', () => {

    let logger = Log.getLogger();

    it("#consumeTo", () => {
        let reader = new Reader("ab[d");
        let consumedString = reader.consumeTo('[', false, true);
        assert.deepEqual(consumedString, {isFound: true, value: "ab"});
    })
});