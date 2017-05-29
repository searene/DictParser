import { NotImplementedError, NotResourceNodeError } from './errors';
import { ROOT_PATH } from './constant';
import { Node } from './Tree';
import path from 'path';

export class DSLNodeToHTMLConverter {

    private _node: Node;
    private _completeEntry: string;
    private _resourceReader: ResourceReader;

    constructor(completeEntry: string, node: Node, resourceReader: ResourceReader) {
        this._completeEntry = completeEntry;
        this._node = node;
        this._resourceReader = resourceReader;
    }

    private convertEntryToHTML() {
        return `<div class="dsl_headwords"><p>${this._completeEntry}</p></div>`;
    }

    private convertNodesToHTML(nodes: Node[]): string {
        if(nodes.length == 0) {
            return "";
        }
        for(let node of nodes) {
            let htmlOfChildren: string = this.convertNodesToHTML(node.children);
            switch(node.type) {
                case Node.ROOT_NODE:
                    return `<div class="dsl_definition">${htmlOfChildren}</div>`;
                case Node.TAG_NODE:
                    if(["b", "i", "p"].indexOf(node.name) > -1) {
                        return `<${node.name} class="dsl_${node.name}>${htmlOfChildren}</${node.name}>`;
                    } else if(node.name == "u") {
                        return `<span class="dsl_u">${htmlOfChildren}</span>`;
                    } else if(["sub", "sup"].indexOf(node.name) > -1) {
                        return `<${node.name}>${htmlOfChildren}</${node.name}>`;
                    } else if(["m0", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9"].indexOf(node.name) > -1) {
                        return `<div class="dsl_${node.name}>${htmlOfChildren}</div>`;
                    } else if(node.name == "*") {
                        return htmlOfChildren;
                    } else if(node.name == "ex") {
                        return `<div class="dsl_opt><span class="dsl_ex"><span class="dsl_lang">${htmlOfChildren}</span></span></div>`;
                    } else if(node.name == "s" && this._resourceReader.getResourceType(node) == ResourceReader.AUDIO) {
                        return `<span class="dsl_s_wav"><a href="${this._resourceReader.getResourcePath(node)}"><img src="${this._resourceReader.getPathToSoundImg()}" border="0" align="absmiddle" alt="Play"></a></span>`;
                    } else if(node.name == 's' && this._resourceReader.getResourceType(node) == ResourceReader.IMAGE) {
                        return `<img src="${this._resourceReader.getResourcePath(node)}" alt="${this._resourceReader.getResourceName(node)}">`;
                    } else if(node.name == '\'') {
                        let stressedText = node.children.length > 0 ? node.children[0].contents : "";
                        return `<span class="dsl_stress"><span class="dsl_stress_without_accent">stressedText</span><span class="dsl_stress_with_accent">${AccentConverter.getAccentedChar(stressedText)}</span></span>`;
                    } else if(node.name == "ref") {
                        let refWord: string = node.children.length == 1 ? node.children[0].contents : "";
                        return `<a class="dsl_ref" href="${this.getPathToRefWord(refWord)}">${refWord}</a>`;
                    } else if(node.name == "url") {
                        let url: string = node.children.length == 1 ? node.children[0].contents : "";
                        return `<a class="dsl_url" href=${url}>${url}</a>`;
                    } else if(node.name == "c") {
                        let color: string = node.properties.keys.length > 0 ? node.properties.keys[0] : "black";
                        return `<font color=${color}>${htmlOfChildren}</font>`;
                    }
                case Node.REF_NODE:
                    let refWord: string = node.contents;
                    return `<a class="dsl_ref" href="${this.getPathToRefWord(refWord)}">${refWord}</a>`;
                case Node.TEXT_NODE:
                    return node.contents;
                default:
                    return "";
            }
        }
    }

    private getPathToRefWord(refWord: string): string {
        let encodedRefWord: string = encodeURIComponent(refWord);
        return `dplookup://localhost/${encodedRefWord}`;
    }
}

export class ResourceReader {

    private audioExtensions = [".wav", ".mp3"];
    private imageExtensions = [".jpg", ".png"];

    /**
     * Resource types
     */
    public static AUDIO = 0;
    public static IMAGE = 1;
    public static UNKNOWN = 2;

    isResourceNode(node: Node): boolean {
        return node.name == 's' && node.children.length == 1 && node.children[0].name == 'text';
    }

    getResourceType(node: Node): number {
        if(this.isResourceNode(node)) {
            let fileName = node.children[0].contents;
            let ext = path.extname(fileName).toLowerCase();
            if(this.audioExtensions.indexOf(ext) > -1) {
                return ResourceReader.AUDIO;
            } else if(this.imageExtensions.indexOf(ext) > -1) {
                return ResourceReader.IMAGE;
            } else {
                return ResourceReader.UNKNOWN;
            }
        } else {
            throw new NotResourceNodeError("Not a resource node");
        }
    }

    getResourceName(node: Node): string {
        if(this.isResourceNode(node)) {
            return node.children[0].contents;
        } else {
            throw new NotResourceNodeError("Not a resource node");
        }
    }

    getResourcePathFromName(resourceName: string): string {
        throw new NotImplementedError("Not implemented yet");
    }

    getResourcePath(resourceNode: Node): string {
        if(this.isResourceNode(resourceNode)) {
            let fileName = resourceNode.children[0].contents;
            return this.getResourcePathFromName(fileName);
        } else {
            throw new NotResourceNodeError("Not a resource node");
        }
    }

    getPathToSoundImg(): string {
        throw new NotImplementedError("Not implemented yet");
    }
}

export class AccentConverter {
    static getAccentedChar(c: string) {
        return new NotImplementedError("");
    }
}