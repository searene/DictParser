import { ROOT_PATH } from './../constant';
import * as path from 'path';
import * as log4js from "log4js";
export class Log {
    static init() {
        log4js.configure({
            appenders: [
                {
                    type: "console"
                },
                {
                    type: "file",
                    filename: `${Log.logFilePath}`,
                    maxLogSize: 20480,
                    category: "DictParser"
                }
            ],
            replaceConsole: true
        });
        Log.logger = log4js.getLogger("DictParser");
    }
    static getLogger() {
        if (Log.logger != null) {
            return Log.logger;
        }
        else {
            Log.init();
            return Log.logger;
        }
    }
}
Log.logFilePath = path.join(ROOT_PATH, 'logs', 'dict_parser.log');
//# sourceMappingURL=log.js.map