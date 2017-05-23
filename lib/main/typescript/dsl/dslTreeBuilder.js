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
