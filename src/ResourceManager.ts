import { WordTree } from './Tree';

export abstract class ResourceManager {
  audioExtensions = [".wav", ".mp3"];
  imageExtensions = [".jpg", ".png"];
  ResourceType = {
    AUDIO: 'AUDIO',
    IMAGE: 'IMAGE',
    UNKNOWN: 'UNKNOWN'
  };
  abstract getResourceContentsList: (wordTree: WordTree, resourceHolder: string) => Promise<ResourceContents[]>;
}

export interface ResourceContents {
  resourceName: string,
  resourceBuffer: Buffer
}

export let resourceManagers: { [index: string]: ResourceManager } = {};

export function registerResourceManager(dictType: string, resourceManager: ResourceManager) {
  resourceManagers[dictType] = resourceManager;
}
