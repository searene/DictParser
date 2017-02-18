import path = require("path");
import {Dictionary} from "./dictionary";
import {Constant} from "./universal";
/**
 * Created by searene on 2/2/17.
 */

function parseDSL() {
    let dbFile = path.join(Constant.dataPath, 'sample.dsl');
    let dictionary: Dictionary = new Dictionary(dbFile);
    dictionary.scan()
}
