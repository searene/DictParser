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
var TreeBuilderNotFoundError = (function (_super) {
    __extends(TreeBuilderNotFoundError, _super);
    function TreeBuilderNotFoundError(msg) {
        var _this = _super.call(this, msg) || this;
        Object.setPrototypeOf(_this, TreeBuilderNotFoundError.prototype);
        return _this;
    }
    return TreeBuilderNotFoundError;
}(Error));
exports.TreeBuilderNotFoundError = TreeBuilderNotFoundError;
var NotResourceNodeError = (function (_super) {
    __extends(NotResourceNodeError, _super);
    function NotResourceNodeError(msg) {
        var _this = _super.call(this, msg) || this;
        Object.setPrototypeOf(_this, NotResourceNodeError.prototype);
        return _this;
    }
    return NotResourceNodeError;
}(Error));
exports.NotResourceNodeError = NotResourceNodeError;
var NotImplementedError = (function (_super) {
    __extends(NotImplementedError, _super);
    function NotImplementedError(msg) {
        var _this = _super.call(this, msg) || this;
        Object.setPrototypeOf(_this, NotImplementedError.prototype);
        return _this;
    }
    return NotImplementedError;
}(Error));
exports.NotImplementedError = NotImplementedError;
//# sourceMappingURL=errors.js.map