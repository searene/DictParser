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
var charState_1 = require("../charState");
var tag_1 = require("./tag");
/**
 * Created by searene on 17-1-22.
 */
var DSLCharState = (function (_super) {
    __extends(DSLCharState, _super);
    function DSLCharState() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /** relation between lastTag and currentTag
         *  * parentChildRelation: lastTag is the parent of currentTag
         *  * siblingsRelation: lastTag is the previous sibling of currentTag
         */
        _this.parentChildRelation = 0;
        _this.siblingsRelation = 1;
        _this.relationBetweenTags = _this.parentChildRelation;
        _this.backSlashed = false;
        _this.nextReadMethod = _this.readData;
        return _this;
    }
    /**
     * Create a new Tag, which is the first child of <i>currentTag</i>,
     * then replace <i>lastTag</i> with <i>currentTag</i>, and
     * replace <i>currentTag</i> with the newly created tag.
     *
     * Both <i>lastTag</i> and <i>currentTag</i> are taken from <i>this.token</i>
     */
    DSLCharState.prototype.createFirstChildTag = function () {
        var tag = new tag_1.Tag();
        this.currentTag.setFirstChild(tag);
        this.lastTag = this.currentTag;
        this.currentTag = tag;
        return tag;
    };
    DSLCharState.prototype.read = function () {
        this.nextReadMethod();
    };
    DSLCharState.prototype.closeTag = function () {
        this.currentTag = this.currentTag.parent;
        this.lastTag = this.currentTag;
    };
    DSLCharState.prototype.readData = function () {
        switch (this.reader.advanceOneCharacter()) {
            case '\t':
            case ' ':
                break;
            case '\r':
            case '\n':
                this.nextReadMethod = this.readBeforeCard;
                break;
            case '#':
                this.metaTitle = "";
                this.nextReadMethod = this.readBeforeMetaData;
                break;
        }
    };
    DSLCharState.prototype.readBeforeCard = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '\t':
            case ' ':
                break;
            case '\\':
                if (!this.backSlashed) {
                    this.backSlashed = true;
                }
                else {
                    this.cardEntry = '\\';
                    this.cardFullEntry = '\\';
                    this.backSlashed = false;
                }
                break;
            case '{':
                if (this.backSlashed) {
                    this.cardEntry = '{';
                    this.cardFullEntry = '{';
                    this.backSlashed = false;
                }
                else {
                    this.nextReadMethod = this.readBeforeOrInNotIncludedEntry;
                }
                break;
            default:
                this.cardEntry = advancedCharacter;
                this.cardFullEntry = advancedCharacter;
                this.nextReadMethod = this.readInCardEntry;
        }
    };
    DSLCharState.prototype.readInCardEntry = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '\r':
            case '\n':
                this.nextReadMethod = this.readBeforeCardDefinitionTab;
                break;
            case '{':
                this.nextReadMethod = this.readBeforeOrInNotIncludedEntry;
                break;
            default:
                this.cardEntry += advancedCharacter;
                this.cardFullEntry += advancedCharacter;
        }
    };
    DSLCharState.prototype.readBeforeOrInNotIncludedEntry = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '}':
                if (this.backSlashed) {
                    this.cardFullEntry += '}';
                }
                else {
                    this.nextReadMethod = this.readInCardEntry;
                }
                break;
            case '\r':
            case '\n':
                // malformed entry
                this.nextReadMethod = this.readBeforeCardDefinitionTab;
                break;
            default:
                this.cardFullEntry += advancedCharacter;
        }
    };
    DSLCharState.prototype.readBeforeCardDefinitionTab = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '\t':
            case ' ':
                this.reader.consumeEmptySpaces();
                this.nextReadMethod = this.readInDefinition;
                break;
            case '[':
                if (this.backSlashed) {
                    this.currentTag = tag_1.Tag.createTextTag('[');
                    this.currentTag = new tag_1.Tag();
                    this.currentTag.tagType = tagType.text;
                    this.currentTag.tagName = '[';
                    this.backSlashed = false;
                }
                else {
                    this.currentTag.tagName = '';
                    this.nextReadMethod = this.readOpenTagStart;
                }
                break;
            case '\\':
                if (this.backSlashed) {
                    this.currentTag = new tag_1.Tag();
                    this.currentTag.tagType = tagType.text;
                    this.currentTag.tagName = '\\';
                    this.backSlashed = false;
                }
                else {
                    this.backSlashed = true;
                }
                this.nextReadMethod = this.readInDefinitionText;
                break;
            case '\r':
            case '\n':
                this.status = charState_1.parsingStatus.completed;
                break;
            default:
                this.currentTag.tagType = tagType.text;
                this.currentTag.tagName = advancedCharacter;
                this.nextReadMethod = this.readInDefinitionText;
        }
    };
    DSLCharState.prototype.readInDefinition = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '[':
                if (this.backSlashed) {
                    this.currentTag.tagName += '[';
                    this.backSlashed = false;
                }
                else {
                    this.currentTag.tagName = '';
                    this.nextReadMethod = this.readOpenTagStart;
                }
                break;
            default:
                this.currentTag.tagType = tagType.text;
                this.currentTag.tagName = advancedCharacter;
                this.nextReadMethod = this.readInDefinitionText;
        }
    };
    DSLCharState.prototype.readInDefinitionText = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '[':
                if (this.backSlashed) {
                    this.currentTag.tagName += '[';
                    this.backSlashed = false;
                }
                else {
                    this.currentTag.tagName = '';
                    this.nextReadMethod = this.readOpenTagStart;
                }
                break;
            case '\r':
            case '\n':
                this.nextReadMethod = this.readBeforeCardDefinitionTab;
                break;
            default:
                this.currentTag.tagName += advancedCharacter;
        }
    };
    DSLCharState.prototype.readOpenTagStart = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case ']':
                this.nextReadMethod = this.readOpenTagEnd;
                break;
            default:
                this.currentTag.tagName = advancedCharacter;
                this.nextReadMethod = this.readInOpenTag;
        }
    };
    DSLCharState.prototype.readInOpenTag = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case ']':
                if (this.backSlashed) {
                    this.currentTag.tagName += advancedCharacter;
                }
                else {
                    this.nextReadMethod = this.readOpenTagEnd;
                }
                break;
            case ' ':
            case '\t':
                this.nextReadMethod = this.readBeforeAttribute;
                break;
            default:
                this.currentTag.tagName += advancedCharacter;
        }
    };
    DSLCharState.prototype.readBeforeAttribute = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case ']':
                this.nextReadMethod = this.readOpenTagEnd;
                break;
            default:
                this.currentTag.attr = advancedCharacter;
                this.nextReadMethod = this.readInAttribute;
        }
    };
    DSLCharState.prototype.readInAttribute = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case ']':
                this.nextReadMethod = this.readOpenTagEnd;
                break;
            default:
                this.currentTag.attr += advancedCharacter;
        }
    };
    DSLCharState.prototype.readOpenTagEnd = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '[':
                this.createFirstChildTag();
                this.nextReadMethod = this.readTagStart;
                break;
            default:
                this.createFirstChildTag();
                this.currentTag.tagType = tagType.text;
                this.currentTag.tagName = advancedCharacter;
        }
    };
    DSLCharState.prototype.readTagStart = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '/':
                this.nextReadMethod = this.readEndTagSlashed;
                break;
            default:
                this.currentTag.tagName = advancedCharacter;
                this.nextReadMethod = this.readInOpenTag;
        }
    };
    DSLCharState.prototype.readEndTagSlashed = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case ']':
                this.closeTag();
                this.nextReadMethod = this.readEndTagEnd;
                break;
            default:
                this.currentEndTagName = advancedCharacter;
        }
    };
    DSLCharState.prototype.readEndTagEnd = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '[':
                this.lastTag = this.currentTag;
                this.currentTag.reset();
                this.lastTag.setFirstChild(this.currentTag);
                this.nextReadMethod = this.readTagStart;
                break;
            case '\r':
            case '\n':
                this.nextReadMethod = this.readBeforeCardDefinitionTab;
                break;
            default:
                this.lastTag = this.currentTag;
                this.lastTag.setNextSibling(this.currentTag);
                this.currentTag.reset();
                this.currentTag.tagName = advancedCharacter;
                this.currentTag.tagType = tagType.text;
        }
    };
    DSLCharState.prototype.readBeforeMetaData = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '\t':
            case ' ':
                break;
            default:
                this.metaTitle += advancedCharacter;
                this.nextReadMethod = this.readInMetaTitle;
        }
    };
    DSLCharState.prototype.readInMetaTitle = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '\t':
            case ' ':
                this.metaValue = "";
                this.nextReadMethod = this.readBeforeMetaValue;
        }
    };
    DSLCharState.prototype.readBeforeMetaValue = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '\t':
            case ' ':
                break;
            default:
                this.metaValue += advancedCharacter;
                this.nextReadMethod = this.readInMetaValue;
        }
    };
    DSLCharState.prototype.readInMetaValue = function () {
        var advancedCharacter = this.reader.advanceOneCharacter();
        switch (advancedCharacter) {
            case '\t':
            case '\r':
            case '\n':
            case ' ':
                this.dictionary.meta[this.metaTitle] =
                    this.metaValue;
                this.nextReadMethod = this.readData;
        }
    };
    return DSLCharState;
}(charState_1.CharState));
exports.DSLCharState = DSLCharState;
//# sourceMappingURL=dslCharState.js.map