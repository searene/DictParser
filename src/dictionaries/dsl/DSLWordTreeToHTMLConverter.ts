import { buildAudioTag } from "./../../util/HTMLUtil";
import { ResourceManager } from "./../../ResourceManager";
import { DSLResourceManager } from "./DSLResourceManager";
import { AccentConverter } from "../../AccentConverter";
import { DSLDictionary } from "./DSLDictionary";
import { Dictionary, WordTreeHTML } from "../../Dictionary";
import { WordTree } from "../../Tree";
import { NotResourceNodeError } from "../../Error";
import { SRC_RESOURCE_PATH } from "../../Constant";
import * as fse from "fs-extra";
import { Node } from "../../Tree";
import * as path from "path";
import { DictMap } from "../../DictionaryFinder";
import { ZipReader } from "../../util/ZipReader";

export class DSLWordTreeToHTMLConverter {
  /**
   * Resource types
   */
  private _dslResourceManager = new DSLResourceManager();
  private _dictMap: DictMap;
  private _sqliteDbPath: string;

  constructor(dictMap: DictMap, sqliteDbPath: string) {
    this._dictMap = dictMap;
    this._sqliteDbPath = sqliteDbPath;
  }

  async convertWordTreeToHTML(wordTree: WordTree): Promise<WordTreeHTML> {
    return {
      entry: this.convertEntryToHTML(wordTree.entry),
      definition: await this.convertRootNodeToHTML(wordTree.root)
    };
  }

  private convertEntryToHTML(entry: string) {
    return `<div class="dsl-headwords"><p>${entry}</p></div>`;
  }

  private async convertRootNodeToHTML(rootNode: Node): Promise<string> {
    let html = this.getPlayAudioHTML();
    html += await this.convertNodesToHTML(rootNode.children);
    return html;
  }

  private async convertNodesToHTML(nodes: Node[]): Promise<string> {
    let html = "";
    for (let node of nodes) {
      let htmlOfChildren: string = await this.convertNodesToHTML(node.children);
      switch (node.type) {
        case Node.ROOT_NODE:
          html += `<div class="dsl-definition">${htmlOfChildren}</div>`;
          break;
        case Node.TAG_NODE:
          if (["b", "i"].indexOf(node.name) > -1) {
            html += `<${node.name} class="dsl-${
              node.name
            }">${htmlOfChildren}</${node.name}>`;
          } else if (node.name === "p") {
            html += `<span class="dsl-p">${htmlOfChildren}</span>`;
          } else if (node.name == "u") {
            html += `<span class="dsl-u">${htmlOfChildren}</span>`;
          } else if (["sub", "sup"].indexOf(node.name) > -1) {
            html += `<${node.name}>${htmlOfChildren}</${node.name}>`;
          } else if (
            [
              "m0",
              "m1",
              "m2",
              "m3",
              "m4",
              "m5",
              "m6",
              "m7",
              "m8",
              "m9"
            ].indexOf(node.name) > -1
          ) {
            html += `<div class="dsl-${node.name}">${htmlOfChildren}</div>`;
          } else if (node.name == "*") {
            html += htmlOfChildren;
          } else if (node.name == "ex") {
            html += `<div class="dsl-opt"><span class="dsl-ex">${htmlOfChildren}</span></div>`;
          } else if (
            node.name == "s" &&
            this._dslResourceManager.getResourceType(node) ==
              this._dslResourceManager.ResourceType.AUDIO
          ) {
            const audioType = path
              .extname(this._dslResourceManager.getResourceName(node))
              .substr(1); // wav
            const resourceAsBase64 = await this.getResourceAsBase64(node);
            html += `<img 
                        onclick='(function() {
                          var audio = new Audio("data:audio/${audioType};base64,${resourceAsBase64}");
                          audio.play();
                        })()'
                        class="dictp-sound-img" 
                        src="data:image/png;base64,${await this.getSoundImgAsBase64()}" 
                        border="0" 
                        align="absmiddle" 
                        alt="Play"/>`;
          } else if (
            node.name == "s" &&
            this._dslResourceManager.getResourceType(node) ==
              this._dslResourceManager.ResourceType.IMAGE
          ) {
            const resourceHolder = this._dictMap.dict.resourceHolder;
            const resourceHolderType = await this._dslResourceManager.getResourceHolderType(
              resourceHolder
            );
            const resourceName = this._dslResourceManager.getResourceName(node);
            const completeResourcePath =
              resourceHolderType === "dir"
                ? path.join(resourceHolder, resourceName)
                : `dictp://image:${resourceHolderType}:${resourceHolder}:${resourceName}`;
            html += `<img src=${completeResourcePath} alt="${this._dslResourceManager.getResourceName(
              node
            )}"/>`;
          } else if (node.name == "'") {
            let stressedText =
              node.children.length > 0 ? node.children[0].contents : "";
            html += `<span class="dsl-stress"><span class="dsl-stress-without-accent">stressedText</span><span class="dsl-stress-with-accent">${AccentConverter.removeAccent(
              stressedText
            )}</span></span>`;
          } else if (node.name == "url") {
            let url: string =
              node.children.length == 1 ? node.children[0].contents : "";
            html += `<a class="dsl-url" href=${url}>${url}</a>`;
          } else if (node.name == "c") {
            let color: string =
              node.properties.size > 0
                ? node.properties.entries().next().value[0]
                : "green";
            html += `<span style="color: ${color}">${htmlOfChildren}</span>`;
          } else if (node.name == "lang") {
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
    return path.join(ResourceManager.commonResourceDirectory, "sound.png");
  }
  private base64Encode = async (filePath: string): Promise<string> => {
    const bitmap = await fse.readFile(filePath);
    return new Buffer(bitmap).toString("base64");
  };
  private getSoundImgAsBase64 = async (): Promise<string> => {
    const filePath = this.getPathToSoundImg();
    return await this.base64Encode(filePath);
  };
  private getResourceAsBase64 = async (resourceNode: Node): Promise<string> => {
    const resourceHolder = this._dictMap.dict.resourceHolder;
    const resourceHolderType = await this._dslResourceManager.getResourceHolderType(
      resourceHolder
    );
    const resourceName = this._dslResourceManager.getResourceName(resourceNode);
    if (resourceHolderType === "dir") {
      const filePath = path.join(resourceHolder, resourceName);
      return await this.base64Encode(filePath);
    } else if (resourceHolderType === "zip") {
      const zipReader = new ZipReader(this._sqliteDbPath, resourceHolder);
      const buffer = await zipReader.extractFileFromZip(resourceName);
      return buffer.toString("base64");
    } else {
      throw new Error(
        `ResourceHolderType ${resourceHolderType} is not supported`
      );
    }
  };
  private getPlayAudioHTML = (): string => {
    return `
      <script>
        function playAudio(audioType, base64) {
          var audio = new Audio("data:audio/" + audioType + ";base64," + base64);
          audio.play();
        }
      </script>
    `;
  };
}
