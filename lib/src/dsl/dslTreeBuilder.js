"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var treeBuilder_1 = require("../treeBuilder");
var dslIndexBuilder_1 = require("./dslIndexBuilder");
/**
 * Created by searene on 17-1-23.
 */
var DSLTreeBuilder = (function (_super) {
    __extends(DSLTreeBuilder, _super);
    function DSLTreeBuilder() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._dictionarySuffixes = ['dsl', 'dz'];
        return _this;
    }
    DSLTreeBuilder.prototype.getIndexBuilder = function (dictFile) {
        return new dslIndexBuilder_1.DSLIndexBuilder(dictFile);
    };
    DSLTreeBuilder.prototype.parse = function (contents) {
    };
    return DSLTreeBuilder;
}(treeBuilder_1.TreeBuilder));
exports.DSLTreeBuilder = DSLTreeBuilder;
