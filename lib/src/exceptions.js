/**
 * Created by searene on 2/9/17.
 */
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
var Exceptions;
(function (Exceptions) {
    var InvalidFileException = (function (_super) {
        __extends(InvalidFileException, _super);
        function InvalidFileException(message) {
            var _this = _super.call(this, message) || this;
            _this.message = message;
            _this.name = "InvalidFileException";
            _this.stack = new Error().stack;
            return _this;
        }
        InvalidFileException.prototype.toString = function () {
            return this.name + ": " + this.message;
        };
        return InvalidFileException;
    }(Error));
    Exceptions.InvalidFileException = InvalidFileException;
})(Exceptions || (Exceptions = {}));
