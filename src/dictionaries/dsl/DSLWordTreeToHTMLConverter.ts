import { buildAudioTag } from './../../util/HTMLUtil';
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

  async convertWordTreeToHTML(wordTree: WordTree): Promise<WordTreeHTML> {
    return {
      entry: this.convertEntryToHTML(wordTree.entry),
      definition: await this.convertRootNodeToHTML(wordTree.root)
    }
  }

  private convertEntryToHTML(entry: string) {
    return `<div class="dsl-headwords"><p>${entry}</p></div>`;
  }

  private async convertRootNodeToHTML(rootNode: Node): Promise<string> {
    return await this.convertNodesToHTML(rootNode.children);
  }

  private async convertNodesToHTML(nodes: Node[]): Promise<string> {
    let html = '';
    for (let node of nodes) {
      let htmlOfChildren: string = await this.convertNodesToHTML(node.children);
      switch (node.type) {
        case Node.ROOT_NODE:
          html += `<div class="dsl-definition">${htmlOfChildren}</div>`;
          break;
        case Node.TAG_NODE:
          if (["b", "i"].indexOf(node.name) > -1) {
            html += `<${node.name} class="dsl-${node.name}">${htmlOfChildren}</${node.name}>`;
          } else if (node.name === "p") {
            html += `<span class="dsl-p">${htmlOfChildren}</span>`
          } else if (node.name == "u") {
            html += `<span class="dsl-u">${htmlOfChildren}</span>`;
          } else if (["sub", "sup"].indexOf(node.name) > -1) {
            html += `<${node.name}>${htmlOfChildren}</${node.name}>`;
          } else if (["m0", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9"].indexOf(node.name) > -1) {
            html += `<div class="dsl-${node.name}">${htmlOfChildren}</div>`;
          } else if (node.name == "*") {
            html += htmlOfChildren;
          } else if (node.name == "ex") {
            html += `<div class="dsl-opt"><span class="dsl-ex">${htmlOfChildren}</span></div>`;
          } else if (node.name == "s" && this._dslResourceManager.getResourceType(node) == this._dslResourceManager.ResourceType.AUDIO) {
            const resourceHolder = this._dictMap.dict.resourceHolder;
            const resourceHolderType = await this._dslResourceManager.getResourceHolderType(resourceHolder);
            const resourceName = this._dslResourceManager.getResourceName(node);
            const completeResourcePath = resourceHolderType === 'dir' ? path.join(resourceHolder, resourceName) : `dictp://audio:${resourceHolderType}:${resourceHolder}:${resourceName}`;
            html += `<a class="dictp-audio dsl-audio" href="#" onclick="playAudio('${completeResourcePath}')" data-dictp-audio-id="${completeResourcePath}">
                        <img class="sound-img" src="${this.getPathToSoundImg()}" border="0" align="absmiddle" alt="Play">
                        ${buildAudioTag(completeResourcePath)}
                     </a>`;
          } else if (node.name == 's' && this._dslResourceManager.getResourceType(node) == this._dslResourceManager.ResourceType.IMAGE) {
            const resourceHolder = this._dictMap.dict.resourceHolder;
            const resourceHolderType = await this._dslResourceManager.getResourceHolderType(resourceHolder);
            const resourceName = this._dslResourceManager.getResourceName(node);
            const completeResourcePath = resourceHolderType === 'dir' ? path.join(resourceHolder, resourceName) : `dictp://image:${resourceHolderType}:${resourceHolder}:${resourceName}`;
            html += `<img src=${completeResourcePath} alt="${this._dslResourceManager.getResourceName(node)}">`;
          } else if (node.name == '\'') {
            let stressedText = node.children.length > 0 ? node.children[0].contents : "";
            html += `<span class="dsl-stress"><span class="dsl-stress-without-accent">stressedText</span><span class="dsl-stress-with-accent">${AccentConverter.removeAccent(stressedText)}</span></span>`;
          } else if (node.name == "url") {
            let url: string = node.children.length == 1 ? node.children[0].contents : "";
            html += `<a class="dsl-url" href=${url}>${url}</a>`;
          } else if (node.name == "c") {
            let color: string = node.properties.size > 0 ? node.properties.entries().next().value[0] : "green";
            html += `<span style="color: ${color}">${htmlOfChildren}</span>`;
          } else if (node.name == 'lang') {
            html += `<span class="dsl-lang">${htmlOfChildren}</span>`;
          }
          break;
        case Node.REF_NODE:
          let refWord: string = node.contents.replace(/'/g, `\'`);
          html += `<a class="dsl-ref" href="#" data-ref='${refWord}' onClick="{var button=document.getElementById('refer-word-search-button'); button.innerHTML='${refWord}'; button.click();}">${refWord}</a>`;
          break;
        case Node.TEXT_NODE:
          html += node.contents;
          break;
        case Node.NEW_LINE_NODE:
          html += `<div class="dsl-line">${htmlOfChildren}</div>`;
          break;
        default:
          html += "";
      }
    }
    return html;
  }
  private getPathToRefWord(refWord: string): string {
    let encodedRefWord: string = encodeURIComponent(refWord);
    return `dictp://lookup:${encodedRefWord}`;
  }
  private getPathToSoundImg(): string {
    return path.join(ResourceManager.commonResourceDirectory, 'sound.png');
  }

}
