import * as log4js from 'log4js';
import assert from 'assert';
import {Reader} from "../../main/typescript/Reader";
import {LOG_CONFIG_LOCATION} from "../../main/typescript/constant";

describe('test Reader', () => {

    log4js.configure(LOG_CONFIG_LOCATION);

    it("#consumeUntilFind", () => {
        let reader = new Reader("ab[d");
        let consumedString = reader.consumeUntilFind('[', true);
        assert.equal(consumedString, {valid: true, value: "ab"});
    })
});
