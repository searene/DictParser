import { DSLResourceManager } from "./DSLResourceManager";
import { AccentConverter } from "../../AccentConverter";
import { WordTreeHTML } from "../../Dictionary";
import { WordTree } from "../../Tree";
import { Node } from "../../Tree";
import { OSSpecificImplementationGetter } from "../../os-specific/OSSpecificImplementationGetter";
import { ZipReader } from "../../util/ZipReader";
import { EncodingUtil } from "../../util/EncodingUtil";
import { HTMLCreator } from "../../HTMLCreator";
import { none, option, Option } from "ts-option";

export class DSLWordTreeToHTMLConverter {
  /**
   * Resource types
   */
  private _dslResourceManager = new DSLResourceManager();
  private _dictPath: string;
  private _resourceHolder: string;

  constructor(dictPath: string, resourceHolder: string) {
    this._dictPath = dictPath;
    this._resourceHolder = resourceHolder;
  }

  public async convertWordTreeToHTML(wordTree: WordTree): Promise<WordTreeHTML> {
    return {
      entry: HTMLCreator.convertEntryToHTML(wordTree.entry),
      definition: await this.convertRootNodeToHTML(wordTree.root)
    };
  }

  private async convertRootNodeToHTML(rootNode: Node): Promise<string> {
    return await this.convertNodesToHTML(rootNode.children);
  }

  private async convertNodesToHTML(nodes: Node[]): Promise<string> {
    let html = "";
    for (const node of nodes) {
      const htmlOfChildren: string = await this.convertNodesToHTML(node.children);
      switch (node.type) {
        case Node.ROOT_NODE:
          html += `<div class="dsl-definition">${htmlOfChildren}</div>`;
          break;
        case Node.TAG_NODE:
          if (["b", "i"].indexOf(node.name) > -1) {
            html += `<${node.name} class="dsl-${node.name}">${htmlOfChildren}</${node.name}>`;
          } else if (node.name === "p") {
            html += `<span class="dsl-p">${htmlOfChildren}</span>`;
          } else if (node.name === "u") {
            html += `<span class="dsl-u">${htmlOfChildren}</span>`;
          } else if (["sub", "sup"].indexOf(node.name) > -1) {
            html += `<${node.name}>${htmlOfChildren}</${node.name}>`;
          } else if (["m0", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9"].indexOf(node.name) > -1) {
            html += `<div class="dsl-${node.name}">${htmlOfChildren}</div>`;
          } else if (node.name === "*") {
            html += htmlOfChildren;
          } else if (node.name === "ex") {
            html += `<div class="dsl-opt"><span class="dsl-ex">${htmlOfChildren}</span></div>`;
          } else if (
            node.name === "s" &&
            this._dslResourceManager.getResourceType(node) === this._dslResourceManager.resourceType.AUDIO
          ) {
            const audioType = OSSpecificImplementationGetter.path.extname(this._dslResourceManager.getResourceName(node)).substr(1); // wav
            const resourceAsBase64 = await this.getResourceAsBase64(node);
            if (resourceAsBase64.isDefined) {
              html += await HTMLCreator.getSoundHTML(audioType, resourceAsBase64.get);
            }
          } else if (
            node.name === "s" &&
            this._dslResourceManager.getResourceType(node) === this._dslResourceManager.resourceType.IMAGE
          ) {
            const resourceHolder = this._resourceHolder;
            const resourceHolderType = await this._dslResourceManager.getResourceHolderType(resourceHolder);
            const resourceName = this._dslResourceManager.getResourceName(node);
            const completeResourcePath =
              resourceHolderType === "dir"
                ? OSSpecificImplementationGetter.path.resolve(resourceHolder, resourceName)
                : `dictp://image:${resourceHolderType}:${resourceHolder}:${resourceName}`;
            html += `<img src=${completeResourcePath} alt="${this._dslResourceManager.getResourceName(node)}"/>`;
          } else if (node.name === "'") {
            const stressedText = node.children.length > 0 ? node.children[0].contents : "";
            html += `<span class="dsl-stress"><span class="dsl-stress-without-accent">stressedText</span><span class="dsl-stress-with-accent">${AccentConverter.removeAccent(
              stressedText
            )}</span></span>`;
          } else if (node.name === "url") {
            const url: string = node.children.length === 1 ? node.children[0].contents : "";
            html += `<a class="dsl-url" href=${url}>${url}</a>`;
          } else if (node.name === "c") {
            const color: string = node.properties.size > 0 ? node.properties.entries().next().value[0] : "green";
            html += `<span style="color: ${color}">${htmlOfChildren}</span>`;
          } else if (node.name === "lang") {
            html += `<span class="dsl-lang">${htmlOfChildren}</span>`;
          }
          break;
        case Node.REF_NODE:
          const refWord: string = node.contents.replace(/'/g, `\'`);
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
  private getResourceAsBase64 = async (resourceNode: Node): Promise<Option<string>> => {
    try {
      const resourceHolder = this._resourceHolder;
      const resourceHolderType = await this._dslResourceManager.getResourceHolderType(resourceHolder);
      const resourceName = this._dslResourceManager.getResourceName(resourceNode);
      if (resourceHolderType === "dir") {
        const filePath = OSSpecificImplementationGetter.path.resolve(resourceHolder, resourceName);
        const base64 = await EncodingUtil.readBase64FromFile(filePath);
        return option(base64);
      } else if (resourceHolderType === "zip") {
        const zipReader = new ZipReader(resourceHolder);
        const buffer = await zipReader.extractFileFromZip(resourceName);
        return option(buffer.toString("base64"));
      }
    } catch (e) {
      console.error(e);
    }
    return none;
  };
}
