import * as path from 'path';
/**
 * Created by searene on 17-1-30.
 */

export const ROOT_PATH = __dirname;
export const SRC_RESOURCE_PATH = path.join(ROOT_PATH, 'resources');
export const TEST_RESOURCE_PATH = path.join(ROOT_PATH, 'test/resources');
export const JSON_DB_PATH: string = path.join(SRC_RESOURCE_PATH, 'dictParserJSON.db');
export const SQLITE_DB_PATH: string = path.join(SRC_RESOURCE_PATH, 'dictParserSqlite.db');
export const WORD_FORMS_PATH: string = path.join(SRC_RESOURCE_PATH, 'wordforms');
