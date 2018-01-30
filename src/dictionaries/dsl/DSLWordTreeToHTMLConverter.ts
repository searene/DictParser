import { AccentConverter } from '../../AccentConverter';
import { DSLDictionary } from './DSLDictionary';
import { Dictionary, WordTreeHTML } from '../../Dictionary';
import { WordTree } from '../../Tree'
import { NotResourceNodeError } from '../../Error';
import { SRC_RESOURCE_PATH } from '../../Constant';
import { Node } from '../../Tree';
import * as path from 'path';

export class DSLWordTreeToHTMLConverter {

  private _audioExtensions = [".wav", ".mp3"];
  private _imageExtensions = [".jpg", ".png"];

  /**
   * Resource types
   */
  private ResourceType = {
    AUDIO: 1,
    IMAGE: 2,
    UNKNOWN: 3
  };
  private _resourceFolder: string;

  constructor(resourceFolder: string) {
    this._resourceFolder = resourceFolder;
  }

  convertWordTreeToHTML(wordTree: WordTree): WordTreeHTML {
    return {
      entry: this.convertEntryToHTML(wordTree.entry),
      definition: this.convertRootNodeToHTML(wordTree.root)
    }
  }

  private convertEntryToHTML(entry: string) {
    return `<div class="dsl_headwords"><p>${entry}</p></div>`;
  }

  private convertRootNodeToHTML(rootNode: Node): string {
    return this.convertNodesToHTML(rootNode.children);
  }

  private convertNodesToHTML(nodes: Node[]): string {
    let html: string = '';
    if (nodes.length == 0) {
      html += "";
    }
    for (let node of nodes) {
      let htmlOfChildren: string = this.convertNodesToHTML(node.children);
      switch (node.type) {
        case Node.ROOT_NODE:
          html += `<div class="dsl_definition">${htmlOfChildren}</div>`;
          break;
        case Node.TAG_NODE:
          if (["b", "i", "p"].indexOf(node.name) > -1) {
            html += `<${node.name} class="dsl_${node.name}>${htmlOfChildren}</${node.name}>`;
          } else if (node.name == "u") {
            html += `<span class="dsl_u">${htmlOfChildren}</span>`;
          } else if (["sub", "sup"].indexOf(node.name) > -1) {
            html += `<${node.name}>${htmlOfChildren}</${node.name}>`;
          } else if (["m0", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9"].indexOf(node.name) > -1) {
            html += `<div class="dsl_${node.name}>${htmlOfChildren}</div>`;
          } else if (node.name == "*") {
            html += htmlOfChildren;
          } else if (node.name == "ex") {
            html += `<div class="dsl_opt><span class="dsl_ex"><span class="dsl_lang">${htmlOfChildren}</span></span></div>`;
          } else if (node.name == "s" && this.getResourceType(node) == this.ResourceType.AUDIO) {
            html += `<span class="dsl_s_wav"><a href="${this.getResourcePath(node)}"><img class="sound-img" src="${this.getPathToSoundImg()}" border="0" align="absmiddle" alt="Play"></a></span>`;
          } else if (node.name == 's' && this.getResourceType(node) == this.ResourceType.IMAGE) {
            html += `<img src="${this.getResourcePath(node)}" alt="${this.getResourceName(node)}">`;
          } else if (node.name == '\'') {
            let stressedText = node.children.length > 0 ? node.children[0].contents : "";
            html += `<span class="dsl_stress"><span class="dsl_stress_without_accent">stressedText</span><span class="dsl_stress_with_accent">${AccentConverter.removeAccent(stressedText)}</span></span>`;
          } else if (node.name == "ref") {
            let refWord: string = node.children.length == 1 ? node.children[0].contents : "";
            html += `<a class="dsl_ref" href="${this.getPathToRefWord(refWord)}">${refWord}</a>`;
          } else if (node.name == "url") {
            let url: string = node.children.length == 1 ? node.children[0].contents : "";
            html += `<a class="dsl_url" href=${url}>${url}</a>`;
          } else if (node.name == "c") {
            let color: string = node.properties.size > 0 ? node.properties.entries().next().value[0] : "black";
            html += `<span style="color: ${color}">${htmlOfChildren}</span>`;
          }
        case Node.REF_NODE:
          let refWord: string = node.contents;
          html += `<a class="dsl_ref" href="${this.getPathToRefWord(refWord)}">${refWord}</a>`;
          break;
        case Node.TEXT_NODE:
          html += node.contents;
          break;
        case Node.NEW_LINE_NODE:
          html += `<div class="dsl_line">${htmlOfChildren}</div>`;
          break;
        default:
          html += "";
      }
    }
    return html;
  }

  private getPathToRefWord(refWord: string): string {
    let encodedRefWord: string = encodeURIComponent(refWord);
    return `dplookup://localhost/${encodedRefWord}`;
  }


  private isResourceNode(node: Node): boolean {
    return node.name == 's' && node.children.length == 1 && node.children[0].type == Node.TEXT_NODE;
  }

  private getResourceName(node: Node): string {
    if (this.isResourceNode(node)) {
      return node.children[0].contents;
    } else {
      throw new NotResourceNodeError("Not a resource node");
    }
  }

  private getResourcePathFromName(resourceName: string): string {
    return resourceName;
  }

  private getResourcePath(resourceNode: Node): string {
    if (this.isResourceNode(resourceNode)) {
      let fileName = resourceNode.children[0].contents;
      return this.getResourcePathFromName(fileName);
    } else {
      throw new NotResourceNodeError("Not a resource node");
    }
  }

  private getPathToSoundImg(): string {
    return path.join(this._resourceFolder, 'sound.png');
  }

  private getResourceType(node: Node): number {
    if (this.isResourceNode(node)) {
      let fileName = node.children[0].contents;
      let ext = path.extname(fileName).toLowerCase();
      if (this._audioExtensions.indexOf(ext) > -1) {
        return this.ResourceType.AUDIO;
      } else if (this._imageExtensions.indexOf(ext) > -1) {
        return this.ResourceType.IMAGE;
      } else {
        return this.ResourceType.UNKNOWN;
      }
    } else {
      throw new NotResourceNodeError("Not a resource node");
    }
  }
}