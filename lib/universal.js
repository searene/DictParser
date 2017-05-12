"use strict";
var path = require("path");
/**
 * Created by searene on 17-1-30.
 */
var Constant = (function () {
    function Constant() {
    }
    return Constant;
}());
Constant.dictTableName = 'DICT';
Constant.indexTableName = 'WORD_INDEX';
Constant.rootPathOfModule = path.join(__dirname, '..');
Constant.logConfigLocation = path.join(Constant.rootPathOfModule, 'resources/log4js.json');
Constant.defaultDbPath = path.join(Constant.rootPathOfModule, 'resources/dict_parser.db');
exports.Constant = Constant;
