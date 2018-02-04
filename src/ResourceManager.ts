import { WordTree } from './Tree';

export abstract class ResourceManager {
  static commonResourceDirectory: string;
  audioExtensions = [".wav", ".mp3"];
  imageExtensions = [".jpg", ".png"];
  ResourceType = {
    AUDIO: 'AUDIO',
    IMAGE: 'IMAGE',
    UNKNOWN: 'UNKNOWN'
  };
  abstract getResourceContentsList: (wordTree: WordTree, resourceHolder: string) => Promise<ResourceContents[]>;

  abstract async getResource(resourceHolder: string, resourceName: string): Promise<Buffer>;
}

export interface ResourceContents {
  resourceName: string,
  resourceBuffer: Buffer
}

let resourceManagers: { [index: string]: ResourceManager } = {};

export function registerResourceManager(dictType: string, resourceManager: ResourceManager) {
  resourceManagers[dictType] = resourceManager;
}
export function getResourceManagerByDictType(dictType: string) {
  return resourceManagers[dictType];
}