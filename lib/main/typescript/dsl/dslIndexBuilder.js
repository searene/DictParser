"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var fsp = require("fs-promise");
var constant_1 = require("../constant");
var indexBuilder_1 = require("../indexBuilder");
/**
 * Created by searene on 17-1-29.
 */
var DSLIndexManager = (function (_super) {
    __extends(DSLIndexManager, _super);
    function DSLIndexManager() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /** Check if the given line is the beginning of a word definition,
     * if so, add the index to this.indexArray.
     */
    DSLIndexManager.prototype.storeIndexInMemory = function (line, startPosOfLine) {
        if (this.hasReachedDefinitionSection && line.match('^\S.*$)')) {
            this.indexArray.push([line.trim(), startPosOfLine]);
        }
        else if (!this.hasReachedDefinitionSection && line.match('^[^#\s].*$')) {
            this.hasReachedDefinitionSection = true;
            this.indexArray.push([line.trim(), startPosOfLine]);
        }
    };
    DSLIndexManager.prototype.buildIndex = function () {
        var _this = this;
        var pos = 0;
        var remaining = '';
        var inputStream = fsp.createReadStream(this._dictFile);
        return new Promise(function (resolve, reject) {
            inputStream.on('data', function (data) {
                remaining += data;
                var index = remaining.indexOf('\n');
                while (index > -1) {
                    var line = remaining.substring(0, index + 1);
                    remaining = remaining.substring(index + 1);
                    _this.storeIndexInMemory(line, pos);
                    pos += index + 1;
                }
            });
            inputStream.on('end', function () {
                if (remaining.length > 0) {
                    _this.storeIndexInMemory(remaining, pos);
                }
                _this.addIndexToDb(_this.dictId, _this._dictFile, _this.indexArray)
                    .then(function () { resolve(); })
                    .catch(function (err) { reject(err); });
            });
        });
    };
    DSLIndexManager.prototype.addIndexToDb = function (dictId, dbFile, indexArray) {
        var db = this.databaseManager.getDb();
        return new Promise(function (resolve, reject) {
            db.parallelize(function () {
                for (var _i = 0, indexArray_1 = indexArray; _i < indexArray_1.length; _i++) {
                    var index = indexArray_1[_i];
                    db.run("INSERT INTO " + constant_1.Constant.indexTableName + "\n                        (DICT_ID, WORD, LINE)\n                        VALUES (" + dictId + ", " + index[0] + ", " + index[1] + ")", function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                }
            });
        });
    };
    return DSLIndexManager;
}(indexBuilder_1.IndexManager));
exports.DSLIndexManager = DSLIndexManager;
//# sourceMappingURL=dslIndexBuilder.js.map