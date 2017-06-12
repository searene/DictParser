"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
/**
 * Created by searene on 17-1-30.
 */
exports.ROOT_PATH = path.join(__dirname, '..', '..', '..');
exports.RESOURCE_PATH = path.join(exports.ROOT_PATH, 'src/main/resources');
exports.LOG_CONFIG_LOCATION = path.join(exports.RESOURCE_PATH, 'log4js.json');
exports.DEFAULT_DB_PATH = path.join(exports.RESOURCE_PATH, 'dict_parser.db');
//# sourceMappingURL=constant.js.map