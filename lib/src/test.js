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
var EventEmitter = require("events");
var MyEmitter = (function (_super) {
    __extends(MyEmitter, _super);
    function MyEmitter() {
        var _this = _super.call(this) || this;
        var a = 1;
        process.nextTick(function () {
            _this.emit('event', a);
        });
        return _this;
    }
    return MyEmitter;
}(EventEmitter));
var myEmitter = new MyEmitter();
myEmitter.on('event', function (a) {
    console.log(a);
});
