import * as path from 'path';
/**
 * Created by searene on 17-1-30.
 */

export const ROOT_PATH = path.join(__dirname, '..', '..', '..');
export const RESOURCE_PATH = path.join(ROOT_PATH, 'src/main/resources');
export const LOG_CONFIG_LOCATION = path.join(RESOURCE_PATH, 'log4js.json');
export const DEFAULT_DB_PATH: string = path.join(RESOURCE_PATH, 'dict_parser.db')