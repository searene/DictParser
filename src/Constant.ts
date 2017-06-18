import * as path from 'path';
/**
 * Created by searene on 17-1-30.
 */

export const ROOT_PATH = __dirname;
export const SRC_RESOURCE_PATH = path.join(ROOT_PATH, 'resources');
export const TEST_RESOURCE_PATH = path.join(ROOT_PATH, 'test/resources');
export const LOG_CONFIG_LOCATION = path.join(SRC_RESOURCE_PATH, 'log4js.json');
export const DB_PATH: string = path.join(SRC_RESOURCE_PATH, 'dictParser.db');
export const WORD_FORMS_PATH: string = path.join(SRC_RESOURCE_PATH, 'wordforms');
