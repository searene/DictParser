import {ResourceContents, ResourceManager} from '../../ResourceManager';
import { WriteStream } from 'tty';
import { Node, WordTree, getAllChildNodes } from '../../Tree';
import * as fse from 'fs-extra';
import * as path from 'path';

export class DSLResourceManager extends ResourceManager {

  private RESOURCE_HOLDER_TYPE_DIR = 'dir';
  private RESOURCE_HOLDER_TYPE_ZIP = 'zip';

  public getResourceType(node: Node): string {
    if (this.isResourceNode(node)) {
      const fileName = node.children[0].contents;
      const ext = path.extname(fileName).toLowerCase();
      if (this.audioExtensions.indexOf(ext) > -1) {
        return this.ResourceType.AUDIO;
      } else if (this.imageExtensions.indexOf(ext) > -1) {
        return this.ResourceType.IMAGE;
      } else {
        return this.ResourceType.UNKNOWN;
      }
    } else {
      throw new Error("Not a resourcePath node");
    }
  }
  public isResourceNode(node: Node): boolean {
    return node.name == 's' && node.children.length == 1 && node.children[0].type == Node.TEXT_NODE;
  }
  public getResourceName(node: Node): string {
    if (this.isResourceNode(node)) {
      return node.children[0].contents;
    } else {
      throw new Error("Not a resourcePath node");
    }
  }
  public getResourceHolderType = async (resourceHolderPath: string): Promise<string> => {
    const stat = await fse.lstat(resourceHolderPath);
    if(stat.isDirectory()) {
      return this.RESOURCE_HOLDER_TYPE_DIR;
    } else {
      const ext = resourceHolderPath.split('.').pop();
      if(ext !== undefined && ext.toLowerCase() === 'zip') {
        return this.RESOURCE_HOLDER_TYPE_ZIP;
      }
    }
    throw new Error(`Resource is not supported: ${resourceHolderPath}`);
  };
}
