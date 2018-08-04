import * as path from './os-specific/Path';
/**
 * Created by searene on 17-1-30.
 */

export const ROOT_PATH = __dirname;
export const SRC_RESOURCE_PATH = path.resolve(ROOT_PATH, 'resources');
export const TEST_RESOURCE_PATH = path.resolve(ROOT_PATH, 'test/resources');
export const SQLITE_DB_PATH: string = path.resolve(SRC_RESOURCE_PATH, 'dictParserSqlite.db');
export const WORD_FORMS_PATH: string = path.resolve(SRC_RESOURCE_PATH, 'wordforms');
