"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var log_1 = require("./log");
var EventEmitter = require("events");
var fsp = require("fs-promise");
var Walk = (function (_super) {
    __extends(Walk, _super);
    function Walk(dir) {
        var _this = _super.call(this) || this;
        _this.log = log_1.Log.getLogger();
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
        })["catch"](function (err) {
            _this.emit('error', err);
        });
    };
    return Walk;
}(EventEmitter));
exports.Walk = Walk;
var FSHelper = (function () {
    function FSHelper() {
    }
    FSHelper.removeFileIfExists = function (filename) {
        var logger = log_1.Log.getLogger();
        return new Promise(function (resolve, reject) {
            fsp.unlink(filename)
                .then(function () {
                logger.debug("File " + filename + " is removed");
            })["catch"](function (err) {
                if (err.code == 'ENOENT') {
                    // file doens't exist, ignore the error.
                    logger.debug("File " + filename + " doesn't exist, won't remove it.");
                }
                else {
                    // maybe we don't have enough permission
                    reject("Error occurred while trying to remove file " + filename + ": " + err.message);
                }
            });
        });
    };
    return FSHelper;
}());
exports.FSHelper = FSHelper;
