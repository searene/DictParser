import {DictionaryManager} from "./dictionary";
import {Reader} from "./reader";
import {CharState, parsingStatus} from "./charState";
import {IndexBuilder} from "./indexBuilder";
/**
 * Created by searene on 17-1-23.
 */

export abstract class TreeBuilder {

    // e.g. dsl, main definition file
    protected abstract _dictionarySuffixes: string[];

    // e.g. zip, dz, containing all the resources such as images/audios
    protected _resourceHolderSuffixes: string[] = ['zip'];

    // e.g. jpg, wmv, which are the actual resource files
    protected _resourceFileSuffixes: string[] = ['jpg', 'wmv', 'bmp', 'mp3'];

    protected _indexBuilder: IndexBuilder;

    public abstract parse(contents: string): TreeBuilder.Tag;

    get dictionarySuffixes(): string[] {
        return this._dictionarySuffixes;
    }
    get resourceHolderSuffixes(): string[] {
        return this._resourceHolderSuffixes;
    }
    get resourceFileSuffixes(): string[] {
        return this._resourceFileSuffixes;
    }
    public abstract getIndexBuilder(dictFile: string): IndexBuilder;
}

export module TreeBuilder {
    export class Tag {
        private _parent: Tag;
        private firstChild: Tag;
        private previousSibling: Tag;
        private nextSibling: Tag;

        // types of tag
        public static readonly rootTag: number = 0;
        public static readonly textTag: number = 1;
        public static readonly normalTag: number = 2;

        /** name of the tag, e.g. b, m2, etc
         * for tag only containing texts, the field is null
         */
        private _tagName: string;

        /** type of the tag, it could be one of:
         * * Tag.rootTag
         * * Tag.textTag
         * * Tag.normalTag
         */
        private _tagType: number;

        /** contents of tag of type text,
         * for tags of other types, the field should be null
         */
        private _tagContents: string;

        // attributes
        private _attr: string;

        reset(): void {
            this._parent = new Tag();
            this.firstChild = new Tag();
            this.nextSibling = new Tag();
            this._tagName = '';
            this._tagType = Tag.normalTag;
            this._attr = '';
        }

        setFirstChild(childTag: Tag) {
            this.firstChild = childTag;
            childTag._parent = this;
        }

        setNextSibling(nextSibling: Tag) {
            this.nextSibling = nextSibling;
            nextSibling.previousSibling = this;
        }

        static createRootTag(): Tag {
            let rootTag: Tag = new Tag();
            rootTag.tagType = Tag.rootTag;
            return rootTag;
        }

        static createTextTag(tagContents: string, parent: Tag, previousSibling: Tag): Tag {
            let textTag: Tag = new Tag();
            textTag.tagType = Tag.textTag;
            textTag.tagContents = tagContents;

            parent.setFirstChild(textTag);
            previousSibling.setNextSibling(textTag);
            return textTag;
        }

        static createNormalTag(tagName: string, parent: Tag, previousSibling: Tag): Tag {
            let normalTag: Tag = new Tag();
            normalTag.tagType = Tag.normalTag;
            normalTag.tagName = tagName;

            parent.setFirstChild(normalTag);
            previousSibling.setNextSibling(normalTag);
            return normalTag;
        }

        get attr(): string {
            return this._attr;
        }
        set attr(value: string) {
            this._attr = value;
        }
        get tagType(): number {
            return this._tagType;
        }
        set tagType(value: number) {
            this._tagType = value;
        }
        get tagName(): string {
            return this._tagName;
        }
        set tagName(value: string) {
            this._tagName = value;
        }
        get parent(): Tag {
            return this._parent;
        }
        set parent(value: Tag) {
            this._parent = value;
        }
        get tagContents(): string {
            return this._tagContents;
        }
        set tagContents(value: string) {
            this._tagContents = value;
        }
    }
}
