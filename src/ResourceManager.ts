import { WordTree } from './Tree';
import { Buffer } from "buffer";

export abstract class ResourceManager {
  public static commonResourceDirectory: string;
  public audioExtensions = [".wav", ".mp3"];
  public imageExtensions = [".jpg", ".png"];
  public resourceType = {
    AUDIO: 'AUDIO',
    IMAGE: 'IMAGE',
    UNKNOWN: 'UNKNOWN'
  };
}

export interface IResourceContents {
  resourceName: string,
  resourceBuffer: Buffer
}

const resourceManagers: { [index: string]: ResourceManager } = {};

export function registerResourceManager(dictType: string, resourceManager: ResourceManager) {
  resourceManagers[dictType] = resourceManager;
}
export function getResourceManagerByDictType(dictType: string) {
  return resourceManagers[dictType];
}