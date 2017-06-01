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
        fsp.stat(dir)
            .then(function (stat) {
            if (stat.isDirectory) {
                return fsp.readdir(dir);
            }
            else {
                throw new Error("File " + dir + " should be a directory.");
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
            _this.emit('end');
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
            })
                .catch(function (err) {
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
//# sourceMappingURL=os.js.map