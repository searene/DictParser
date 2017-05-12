"use strict";
/**
 * Created by searene on 17-1-23.
 */
var TreeBuilder = (function () {
    function TreeBuilder() {
        // e.g. zip, dz, containing all the resources such as images/audios
        this._resourceHolderSuffixes = ['zip'];
        // e.g. jpg, wmv, which are the actual resource files
        this._resourceFileSuffixes = ['jpg', 'wmv', 'bmp', 'mp3'];
    }
    Object.defineProperty(TreeBuilder.prototype, "dictionarySuffixes", {
        get: function () {
            return this._dictionarySuffixes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeBuilder.prototype, "resourceHolderSuffixes", {
        get: function () {
            return this._resourceHolderSuffixes;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TreeBuilder.prototype, "resourceFileSuffixes", {
        get: function () {
            return this._resourceFileSuffixes;
        },
        enumerable: true,
        configurable: true
    });
    return TreeBuilder;
}());
exports.TreeBuilder = TreeBuilder;
(function (TreeBuilder) {
    var Tag = (function () {
        function Tag() {
        }
        Tag.prototype.reset = function () {
            this._parent = null;
            this.firstChild = null;
            this.nextSibling = null;
            this._tagName = '';
            this._tagType = Tag.normalTag;
            this._attr = '';
        };
        Tag.prototype.setFirstChild = function (childTag) {
            this.firstChild = childTag;
            childTag._parent = this;
        };
        Tag.prototype.setNextSibling = function (nextSibling) {
            this.nextSibling = nextSibling;
            nextSibling.previousSibling = this;
        };
        Tag.createRootTag = function () {
            var rootTag = new Tag();
            rootTag.tagType = Tag.rootTag;
            return rootTag;
        };
        Tag.createTextTag = function (tagContents, parent, previousSibling) {
            var textTag = new Tag();
            textTag.tagType = Tag.textTag;
            textTag.tagContents = tagContents;
            parent.setFirstChild(textTag);
            previousSibling.setNextSibling(textTag);
            return textTag;
        };
        Tag.createNormalTag = function (tagName, parent, previousSibling) {
            var normalTag = new Tag();
            normalTag.tagType = Tag.normalTag;
            normalTag.tagName = tagName;
            parent.setFirstChild(normalTag);
            previousSibling.setNextSibling(normalTag);
            return normalTag;
        };
        Object.defineProperty(Tag.prototype, "attr", {
            get: function () {
                return this._attr;
            },
            set: function (value) {
                this._attr = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "tagType", {
            get: function () {
                return this._tagType;
            },
            set: function (value) {
                this._tagType = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "tagName", {
            get: function () {
                return this._tagName;
            },
            set: function (value) {
                this._tagName = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "parent", {
            get: function () {
                return this._parent;
            },
            set: function (value) {
                this._parent = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Tag.prototype, "tagContents", {
            get: function () {
                return this._tagContents;
            },
            set: function (value) {
                this._tagContents = value;
            },
            enumerable: true,
            configurable: true
        });
        return Tag;
    }());
    // types of tag
    Tag.rootTag = 0;
    Tag.textTag = 1;
    Tag.normalTag = 2;
    TreeBuilder.Tag = Tag;
})(TreeBuilder = exports.TreeBuilder || (exports.TreeBuilder = {}));
exports.TreeBuilder = TreeBuilder;
