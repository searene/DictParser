import { ResourceManager } from './../../ResourceManager';
import { DSLResourceManager } from './DSLResourceManager';
import { AccentConverter } from '../../AccentConverter';
import { DSLDictionary } from './DSLDictionary';
import { Dictionary, WordTreeHTML } from '../../Dictionary';
import { WordTree } from '../../Tree';
import { NotResourceNodeError } from '../../Error';
import { SRC_RESOURCE_PATH } from '../../Constant';
import { Node } from '../../Tree';
import * as path from 'path';
import {DictMap} from "../../DictionaryFinder";

export class DSLWordTreeToHTMLConverter {

  /**
   * Resource types
   */
  private _dslResourceManager = new DSLResourceManager();
  private _dictMap: DictMap;

  constructor(dictMap: DictMap) {
    this._dictMap = dictMap;
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
    let html = '';
    for (let node of nodes) {
      let htmlOfChildren: string = this.convertNodesToHTML(node.children);
      switch (node.type) {
        case Node.ROOT_NODE:
          html += `<div class="dsl_definition">${htmlOfChildren}</div>`;
          break;
        case Node.TAG_NODE:
          if (["b", "i"].indexOf(node.name) > -1) {
            html += `<${node.name} class="dsl_${node.name}">${htmlOfChildren}</${node.name}>`;
          } else if (node.name === "p") {
            html += `<span class="dsl_p">${htmlOfChildren}</span>`
          } else if (node.name == "u") {
            html += `<span class="dsl_u">${htmlOfChildren}</span>`;
          } else if (["sub", "sup"].indexOf(node.name) > -1) {
            html += `<${node.name}>${htmlOfChildren}</${node.name}>`;
          } else if (["m0", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9"].indexOf(node.name) > -1) {
            html += `<div class="dsl_${node.name}">${htmlOfChildren}</div>`;
          } else if (node.name == "*") {
            html += htmlOfChildren;
          } else if (node.name == "ex") {
            html += `<div class="dsl_opt"><span class="dsl_ex">${htmlOfChildren}</span></div>`;
          } else if (node.name == "s" && this._dslResourceManager.getResourceType(node) == this._dslResourceManager.ResourceType.AUDIO) {
            const resourceHolder = this._dictMap.dict.resourceHolder;
            const resourceName = this._dslResourceManager.getResourceName(node);
            const completeResourcePath = `/resource/${resourceHolder}/${resourceName}`;
            // html += `<audio id="${completeResourcePath}" src="${completeResourcePath}"></audio>`;
            html += `<audio id="${completeResourcePath}" src="http://other.web.nf01.sycdn.kuwo.cn/resource/n2/0/45/2382586584.mp3"></audio>`;
            html += `<a class="dsl_audio" href="#" onclick="playAudio('${completeResourcePath}')">
                        <img class="sound-img" src="${this.getPathToSoundImg()}" border="0" align="absmiddle" alt="Play">
                     </a>`;
          } else if (node.name == 's' && this._dslResourceManager.getResourceType(node) == this._dslResourceManager.ResourceType.IMAGE) {
            html += `<img src="${this._dslResourceManager.getResourceName(node)}" alt="${this._dslResourceManager.getResourceName(node)}">`;
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
            let color: string = node.properties.size > 0 ? node.properties.entries().next().value[0] : "green";
            html += `<span style="color: ${color}">${htmlOfChildren}</span>`;
          } else if (node.name == 'lang') {
            html += `<span class="dsl_lang">${htmlOfChildren}</span>`;
          }
          break;
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
  private getPathToSoundImg(): string {
    return path.join(ResourceManager.commonResourceDirectory, 'sound.png');
  }
}
