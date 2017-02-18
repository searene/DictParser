"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var TreeBuilderNotFoundError = (function (_super) {
    __extends(TreeBuilderNotFoundError, _super);
    function TreeBuilderNotFoundError(msg) {
        var _this = _super.call(this, msg) || this;
        console.log(Object.getPrototypeOf(_this));
        var o = Object.setPrototypeOf(_this, TreeBuilderNotFoundError.prototype);
        console.log(Object.getPrototypeOf(_this));
        return _this;
    }
    return TreeBuilderNotFoundError;
}(Error));
exports.TreeBuilderNotFoundError = TreeBuilderNotFoundError;
