"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
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
