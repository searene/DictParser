import * as path from 'path';
import * as log4js from "log4js";
import { ROOT_PATH } from "../Constant";

export class Log {

    private static logger: log4js.Logger;
    private static logFilePath = path.join(ROOT_PATH, 'logs', 'dict_parser.log');

    private static init(): void {
        log4js.configure({
            appenders: {
                "console": { type: 'console' },
                "file": { type: 'file', filename: `${Log.logFilePath}`, maxLogSize: 20480 }
            },
            categories: { default: { appenders: ['console', 'file'], level: 'debug' }}
        });
        Log.logger = log4js.getLogger("default");
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

