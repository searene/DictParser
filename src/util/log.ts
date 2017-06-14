import { ROOT_PATH } from '../Constant';
import * as path from 'path';
import * as log4js from "log4js";

export class Log {

    private static logger: log4js.Logger;
    private static logFilePath = path.join(ROOT_PATH, 'logs', 'dict_parser.log');

    private static init(): void {
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

    public static getLogger(): log4js.Logger {
        if(Log.logger != null) {
            return Log.logger;
        } else {
            Log.init();
            return Log.logger;
        }
    }

}