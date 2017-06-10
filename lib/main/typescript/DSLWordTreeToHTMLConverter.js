"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DSLDictionary_1 = require("./DSLDictionary");
var errors_1 = require("./errors");
var constant_1 = require("./constant");
var Tree_1 = require("./Tree");
var path = require("path");
var DSLNodeToHTMLConverter = (function () {
    function DSLNodeToHTMLConverter(completeEntry, node, resourceReader) {
        this._completeEntry = completeEntry;
        this._node = node;
        this._resourceReader = resourceReader;
    }
    DSLNodeToHTMLConverter.prototype.convertEntryToHTML = function () {
        return "<div class=\"dsl_headwords\"><p>" + this._completeEntry + "</p></div>";
    };
    DSLNodeToHTMLConverter.prototype.convertNodesToHTML = function (nodes) {
        if (nodes.length == 0) {
            return "";
        }
        for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
            var node = nodes_1[_i];
            var htmlOfChildren = this.convertNodesToHTML(node.children);
            switch (node.type) {
                case Tree_1.Node.ROOT_NODE:
                    return "<div class=\"dsl_definition\">" + htmlOfChildren + "</div>";
                case Tree_1.Node.TAG_NODE:
                    if (["b", "i", "p"].indexOf(node.name) > -1) {
                        return "<" + node.name + " class=\"dsl_" + node.name + ">" + htmlOfChildren + "</" + node.name + ">";
                    }
                    else if (node.name == "u") {
                        return "<span class=\"dsl_u\">" + htmlOfChildren + "</span>";
                    }
                    else if (["sub", "sup"].indexOf(node.name) > -1) {
                        return "<" + node.name + ">" + htmlOfChildren + "</" + node.name + ">";
                    }
                    else if (["m0", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9"].indexOf(node.name) > -1) {
                        return "<div class=\"dsl_" + node.name + ">" + htmlOfChildren + "</div>";
                    }
                    else if (node.name == "*") {
                        return htmlOfChildren;
                    }
                    else if (node.name == "ex") {
                        return "<div class=\"dsl_opt><span class=\"dsl_ex\"><span class=\"dsl_lang\">" + htmlOfChildren + "</span></span></div>";
                    }
                    else if (node.name == "s" && this._resourceReader.getResourceType(node) == ResourceReader.AUDIO) {
                        return "<span class=\"dsl_s_wav\"><a href=\"" + this._resourceReader.getResourcePath(node) + "\"><img src=\"" + this._resourceReader.getPathToSoundImg() + "\" border=\"0\" align=\"absmiddle\" alt=\"Play\"></a></span>";
                    }
                    else if (node.name == 's' && this._resourceReader.getResourceType(node) == ResourceReader.IMAGE) {
                        return "<img src=\"" + this._resourceReader.getResourcePath(node) + "\" alt=\"" + this._resourceReader.getResourceName(node) + "\">";
                    }
                    else if (node.name == '\'') {
                        var stressedText = node.children.length > 0 ? node.children[0].contents : "";
                        return "<span class=\"dsl_stress\"><span class=\"dsl_stress_without_accent\">stressedText</span><span class=\"dsl_stress_with_accent\">" + AccentConverter.getAccentedChar(stressedText) + "</span></span>";
                    }
                    else if (node.name == "ref") {
                        var refWord_1 = node.children.length == 1 ? node.children[0].contents : "";
                        return "<a class=\"dsl_ref\" href=\"" + this.getPathToRefWord(refWord_1) + "\">" + refWord_1 + "</a>";
                    }
                    else if (node.name == "url") {
                        var url = node.children.length == 1 ? node.children[0].contents : "";
                        return "<a class=\"dsl_url\" href=" + url + ">" + url + "</a>";
                    }
                    else if (node.name == "c") {
                        var color = node.properties.size > 0 ? node.properties.entries().next().value[0] : "black";
                        return "<font color=" + color + ">" + htmlOfChildren + "</font>";
                    }
                case Tree_1.Node.REF_NODE:
                    var refWord = node.contents;
                    return "<a class=\"dsl_ref\" href=\"" + this.getPathToRefWord(refWord) + "\">" + refWord + "</a>";
                case Tree_1.Node.TEXT_NODE:
                    return node.contents;
                case Tree_1.Node.NEW_LINE_NODE:
                    return "<span class=\"new_line\">" + htmlOfChildren + "</span>";
                default:
                    return "";
            }
        }
        return "";
    };
    DSLNodeToHTMLConverter.prototype.getPathToRefWord = function (refWord) {
        var encodedRefWord = encodeURIComponent(refWord);
        return "dplookup://localhost/" + encodedRefWord;
    };
    return DSLNodeToHTMLConverter;
}());
exports.DSLNodeToHTMLConverter = DSLNodeToHTMLConverter;
var ResourceReader = (function () {
    function ResourceReader(resourceFile) {
        this._audioExtensions = [".wav", ".mp3"];
        this._imageExtensions = [".jpg", ".png"];
        this._dslDictionary = new DSLDictionary_1.DSLDictionary();
        this._resourceFile = resourceFile;
    }
    ResourceReader.prototype.isResourceNode = function (node) {
        return node.name == 's' && node.children.length == 1 && node.children[0].name == 'text';
    };
    ResourceReader.prototype.getResourceType = function (node) {
        if (this.isResourceNode(node)) {
            var fileName = node.children[0].contents;
            var ext = path.extname(fileName).toLowerCase();
            if (this._audioExtensions.indexOf(ext) > -1) {
                return ResourceReader.AUDIO;
            }
            else if (this._imageExtensions.indexOf(ext) > -1) {
                return ResourceReader.IMAGE;
            }
            else {
                return ResourceReader.UNKNOWN;
            }
        }
        else {
            throw new errors_1.NotResourceNodeError("Not a resource node");
        }
    };
    ResourceReader.prototype.getResourceName = function (node) {
        if (this.isResourceNode(node)) {
            return node.children[0].contents;
        }
        else {
            throw new errors_1.NotResourceNodeError("Not a resource node");
        }
    };
    ResourceReader.prototype.getResourcePathFromName = function (resourceName) {
        return path.join(this._resourceFile, resourceName);
    };
    ResourceReader.prototype.getResourcePath = function (resourceNode) {
        if (this.isResourceNode(resourceNode)) {
            var fileName = resourceNode.children[0].contents;
            return this.getResourcePathFromName(fileName);
        }
        else {
            throw new errors_1.NotResourceNodeError("Not a resource node");
        }
    };
    ResourceReader.prototype.getPathToSoundImg = function () {
        return path.join(constant_1.RESOURCE_PATH, 'sound.png');
    };
    return ResourceReader;
}());
/**
 * Resource types
 */
ResourceReader.AUDIO = 0;
ResourceReader.IMAGE = 1;
ResourceReader.UNKNOWN = 2;
exports.ResourceReader = ResourceReader;
var AccentConverter = (function () {
    function AccentConverter() {
    }
    AccentConverter.getAccentedChar = function (c) {
        return new errors_1.NotImplementedError("");
    };
    return AccentConverter;
}());
exports.AccentConverter = AccentConverter;
//# sourceMappingURL=DSLWordTreeToHTMLConverter.js.map