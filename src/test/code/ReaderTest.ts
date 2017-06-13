import { Log } from '../../main/code/util/log';
import {Reader} from "../../main/code/Reader";
import {LOG_CONFIG_LOCATION} from "../../main/code/constant";
import {assert} from "chai";

describe('test Reader', () => {

    let logger = Log.getLogger();

    it("#consumeTo", () => {
        let reader = new Reader("ab[d");
        let consumedString = reader.consumeTo('[', false, true);
        assert.deepEqual(consumedString, {isFound: true, value: "ab"});
    })
});
