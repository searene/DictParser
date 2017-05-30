import * as path from 'path';
/**
 * Created by searene on 17-1-30.
 */

export const DICT_TABLE_NAME: string = 'DICT';
export const INDEX_TABLE_NAME = 'WORD_INDEX';
export const ROOT_PATH = path.join(__dirname, '..', '..', '..');
export const LOG_CONFIG_LOCATION = path.join(ROOT_PATH, 'src/main/resources/log4js.json');
export const DEFAULT_DB_PATH: string = path.join(ROOT_PATH, 'src/main/resources/dict_parser.db')
