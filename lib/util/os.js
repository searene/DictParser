"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var EventEmitter = require("events");
var fsp = require("fs-promise");
var Walk = (function (_super) {
    __extends(Walk, _super);
    function Walk(dir) {
        var _this = _super.call(this) || this;
        process.nextTick(function () {
            _this.walkthrough(dir, true);
        });
        return _this;
    }
    Walk.prototype.walkthrough = function (dir, topLevel) {
        var _this = this;
        var root;
        fsp.exists(dir)
            .then(function (exist) {
            if (exist) {
                return fsp.stat(dir);
            }
            else {
                _this.emit('error', new Error("File " + dir + " doesn't exist."));
                _this.emit('end');
            }
        })
            .then(function (stat) {
            if (stat.isDirectory) {
                return fsp.readdir(dir);
            }
            else {
                _this.emit('error', new Error("File " + dir + " should be a directory."));
                _this.emit('end');
            }
        })
            .then(function (files) {
            files.forEach(function (file, index) {
                fsp.stat(file)
                    .then(function (stat) {
                    if (stat.isDirectory) {
                        _this.emit('dir', file, stat);
                        process.nextTick(function () {
                            _this.walkthrough(file, false);
                        });
                    }
                    else if (stat.isFile) {
                        _this.emit('file', file, stat);
                    }
                    if (index == files.length - 1 && topLevel) {
                        _this.emit('end');
                    }
                });
            });
        })
            .catch(function (err) {
            _this.emit('error', err);
        });
    };
    return Walk;
}(EventEmitter));
exports.Walk = Walk;
