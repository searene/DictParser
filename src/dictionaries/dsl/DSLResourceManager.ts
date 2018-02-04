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
  getResourceContentsList = async (wordTree: WordTree, resourceHolder: string): Promise<ResourceContents[]> => {
    let resourceContentsList: ResourceContents[] = [];
    let nodes: Node[] = getAllChildNodes(wordTree.root);
    for(const node of nodes) {
      if(this.isResourceNode(node)) {
          const resourceName = this.getResourceName(node);
          const resourceContents = await this.getResource(resourceHolder, resourceName);
          resourceContentsList.push({
            resourceName: resourceName,
            resourceBuffer: resourceContents
          });
      }
    }
    return resourceContentsList;
  };

  async getResource(resourceHolder: string, resourceName: string): Promise<Buffer> {
    let isResourceHolderExists = await fse.pathExists(resourceHolder);
    if (!isResourceHolderExists) {
      throw new Error(`Resource Holder ${resourceHolder} doesn't exist`);
    }
    let resourceHolderStats: fse.Stats = await fse.stat(resourceHolder);
    if (resourceHolderStats.isDirectory()) {
      let fullResourceFilePath = path.join(resourceHolder, resourceName);
      if (!(await fse.pathExists(fullResourceFilePath))) {
        throw new Error(`Resource file ${fullResourceFilePath} doesn't exist`);
      }
      return fse.readFile(fullResourceFilePath);
    } else if (resourceHolderStats.isFile()) {
      let ext = path.extname(resourceHolder);
      if (ext == '.zip') {
        return await this.getResourceContentsFromZipFile(resourceHolder, resourceName);
      }
    }
    throw new Error(`resource is not supported: ${resourceHolder}`);
  }

  getResourceContentsFromZipFile = (zipFilePath: string, resourceName: string): Promise<Buffer> => {
    let buffers: Buffer[] = [];
    const zip = new StreamZip({
      file: zipFilePath,
      storeEntries: true
    });
    return new Promise<Buffer>((resolve, reject) => {
      zip.on('ready', () => {
        zip.stream(resourceName, (err: NodeJS.ErrnoException, stream: WriteStream) => {
          stream.on('data', (buffer: Buffer) => {
            buffers.push(buffer);
          });
          stream.on('end', () => {
            zip.close();
            resolve(Buffer.concat(buffers));
          });
        });
      });
    });
  };

}
