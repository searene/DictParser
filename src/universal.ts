import * as path from 'path';
/**
 * Created by searene on 17-1-30.
 */

export class Constant {
    public static readonly dictTableName = 'DICT';
    public static readonly indexTableName = 'WORD_INDEX';

    public static readonly rootPathOfModule = path.join(__dirname, '..', '..');
    public static readonly logConfigLocation = path.join(Constant.rootPathOfModule, 'resources/log4js.json');

    public static readonly defaultDbPath = path.join(Constant.rootPathOfModule, 'resources/dict_parser.db')
}