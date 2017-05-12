"use strict";
var universal_1 = require("./../universal");
var path = require("path");
var log4js = require("log4js");
var Log = (function () {
    function Log() {
    }
    Log.init = function () {
        log4js.configure({
            appenders: [
                {
                    type: "console"
                },
                {
                    type: "file",
                    filename: "" + Log.logFilePath,
                    maxLogSize: 20480,
                    category: "DictParser"
                }
            ],
            replaceConsole: true
        });
        Log.logger = log4js.getLogger("DictParser");
    };
    Log.getLogger = function () {
        if (Log.logger != null) {
            return Log.logger;
        }
        else {
            Log.init();
            return Log.logger;
        }
    };
    return Log;
}());
Log.logFilePath = path.join(universal_1.Constant.rootPathOfModule, 'logs', 'dict_parser.log');
exports.Log = Log;
