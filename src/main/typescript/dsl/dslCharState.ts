import {CharState, parsingStatus} from "../charState";
import {Tag} from "./tag";

/**
 * Created by searene on 17-1-22.
 */
export class DSLCharState extends CharState {

    private metaTitle: string;
    private metaValue: string;

    // entry name without {}
    private cardEntry: string;

    // entry with {} included
    private cardFullEntry: string;

    /** relation between lastTag and currentTag
     *  * parentChildRelation: lastTag is the parent of currentTag
     *  * siblingsRelation: lastTag is the previous sibling of currentTag
     */
    private readonly parentChildRelation: number = 0;
    private readonly siblingsRelation: number = 1;

    private lastTag: Tag;
    private currentTag: Tag;
    private relationBetweenTags: number = this.parentChildRelation;

    private currentEndTagName: string;

    private backSlashed: boolean = false;

    private nextReadMethod: () => void = this.readData;

    /**
     * Create a new Tag, which is the first child of <i>currentTag</i>,
     * then replace <i>lastTag</i> with <i>currentTag</i>, and
     * replace <i>currentTag</i> with the newly created tag.
     *
     * Both <i>lastTag</i> and <i>currentTag</i> are taken from <i>this.token</i>
     */
    private createFirstChildTag(): Tag {
        let tag: Tag = new Tag();
        this.currentTag.setFirstChild(tag);
        this.lastTag = this.currentTag;
        this.currentTag = tag;
        return tag;
    }

    public read(): void {
        this.nextReadMethod();
    }

    private closeTag() {
        this.currentTag = this.currentTag.parent;
        this.lastTag = this.currentTag;
    }

    private readData(): void {
        switch(this.reader.advanceOneCharacter()) {
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
    }

    private readBeforeCard(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case '\t':
            case ' ':
                break;
            case '\\':
                if(!this.backSlashed) {
                    this.backSlashed = true;
                } else {
                    this.cardEntry = '\\';
                    this.cardFullEntry = '\\';
                    this.backSlashed = false;
                }
                break;
            case '{':
                if(this.backSlashed) {
                    this.cardEntry = '{';
                    this.cardFullEntry = '{';
                    this.backSlashed = false;
                } else {
                    this.nextReadMethod = this.readBeforeOrInNotIncludedEntry;
                }
                break;
            default:
                this.cardEntry = advancedCharacter;
                this.cardFullEntry = advancedCharacter;
                this.nextReadMethod = this.readInCardEntry;
        }
    }

    private readInCardEntry(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
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
    }

    private readBeforeOrInNotIncludedEntry(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case '}':
                if(this.backSlashed) {
                    this.cardFullEntry += '}';
                } else {
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
    }

    private readBeforeCardDefinitionTab(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case '\t':
            case ' ':
                this.reader.consumeEmptySpaces();
                this.nextReadMethod = this.readInDefinition;
                break;
            case '[':
                if(this.backSlashed) {
                    this.currentTag = Tag.createTextTag('[', )
                    this.currentTag = new Tag();
                    this.currentTag.tagType = tagType.text;
                    this.currentTag.tagName = '[';
                    this.backSlashed = false;
                } else {
                    this.currentTag.tagName = '';
                    this.nextReadMethod = this.readOpenTagStart;
                }
                break;
            case '\\':
                if(this.backSlashed) {
                    this.currentTag = new Tag();
                    this.currentTag.tagType = tagType.text;
                    this.currentTag.tagName = '\\';
                    this.backSlashed = false;
                } else {
                    this.backSlashed = true;
                }
                this.nextReadMethod = this.readInDefinitionText;
                break;
            case '\r':
            case '\n':
                this.status = parsingStatus.completed;
                break;
            default:
                this.currentTag.tagType = tagType.text;
                this.currentTag.tagName = advancedCharacter;
                this.nextReadMethod = this.readInDefinitionText;
        }
    }

    private readInDefinition(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case '[':
                if(this.backSlashed) {
                    this.currentTag.tagName += '[';
                    this.backSlashed = false;
                } else {
                    this.currentTag.tagName = '';
                    this.nextReadMethod = this.readOpenTagStart;
                }
                break;
            default:
                this.currentTag.tagType = tagType.text;
                this.currentTag.tagName = advancedCharacter;
                this.nextReadMethod = this.readInDefinitionText;
        }
    }

    private readInDefinitionText(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case '[':
                if(this.backSlashed) {
                    this.currentTag.tagName += '[';
                    this.backSlashed = false;
                } else {
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
    }

    private readOpenTagStart(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case ']':
                this.nextReadMethod = this.readOpenTagEnd;
                break;
            default:
                this.currentTag.tagName = advancedCharacter;
                this.nextReadMethod = this.readInOpenTag;
        }
    }

    private readInOpenTag(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case ']':
                if(this.backSlashed) {
                    this.currentTag.tagName += advancedCharacter;
                } else {
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
    }

    private readBeforeAttribute(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case ']':
                this.nextReadMethod = this.readOpenTagEnd;
                break;
            default:
                this.currentTag.attr = advancedCharacter;
                this.nextReadMethod = this.readInAttribute;
        }
    }

    private readInAttribute(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case ']':
                this.nextReadMethod = this.readOpenTagEnd;
                break;
            default:
                this.currentTag.attr += advancedCharacter;
        }
    }

    private readOpenTagEnd(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case '[':
                this.createFirstChildTag();
                this.nextReadMethod = this.readTagStart;
                break;
            default:
                this.createFirstChildTag();
                this.currentTag.tagType = tagType.text;
                this.currentTag.tagName = advancedCharacter;
        }
    }

    private readTagStart(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case '/':
                this.nextReadMethod = this.readEndTagSlashed;
                break;
            default:
                this.currentTag.tagName = advancedCharacter;
                this.nextReadMethod = this.readInOpenTag;
        }
    }

    private readEndTagSlashed(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case ']':
                this.closeTag();
                this.nextReadMethod = this.readEndTagEnd;
                break;
            default:
                this.currentEndTagName = advancedCharacter;
        }
    }

    private readEndTagEnd(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
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
    }

    private readBeforeMetaData(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case '\t':
            case ' ':
                break;

            default:
                this.metaTitle += advancedCharacter;
                this.nextReadMethod = this.readInMetaTitle;
        }
    }

    private readInMetaTitle(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case '\t':
            case ' ':
                this.metaValue = "";
                this.nextReadMethod = this.readBeforeMetaValue;
        }
    }

    private readBeforeMetaValue(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case '\t':
            case ' ':
                break;
            default:
                this.metaValue += advancedCharacter;
                this.nextReadMethod = this.readInMetaValue;
        }
    }

    private readInMetaValue(): void {
        let advancedCharacter = this.reader.advanceOneCharacter();
        switch(advancedCharacter) {
            case '\t':
            case '\r':
            case '\n':
            case ' ':
                this.dictionary.meta[this.metaTitle] =
                    this.metaValue;
                this.nextReadMethod = this.readData;
        }
    }

}
