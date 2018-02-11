import {ResourceContents, ResourceManager} from '../../ResourceManager';
import { WriteStream } from 'tty';
import { Node, WordTree, getAllChildNodes } from '../../Tree';
import * as fse from 'fs-extra';
import * as path from 'path';
const StreamZip = require('node-stream-zip');

export class DSLResourceManager extends ResourceManager {

  getResourceType(node: Node): string {
    if (this.isResourceNode(node)) {
      let fileName = node.children[0].contents;
      let ext = path.extname(fileName).toLowerCase();
      if (this.audioExtensions.indexOf(ext) > -1) {
        return this.ResourceType.AUDIO;
      } else if (this.imageExtensions.indexOf(ext) > -1) {
        return this.ResourceType.IMAGE;
      } else {
        return this.ResourceType.UNKNOWN;
      }
    } else {
      throw new Error("Not a resourceHolder node");
    }
  }
  isResourceNode(node: Node): boolean {
    return node.name == 's' && node.children.length == 1 && node.children[0].type == Node.TEXT_NODE;
  }
  getResourceName(node: Node): string {
    if (this.isResourceNode(node)) {
      return node.children[0].contents;
    } else {
      throw new Error("Not a resourceHolder node");
    }
  }
}
