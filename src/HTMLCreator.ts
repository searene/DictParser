import { ResourceManager } from "./ResourceManager";
import {OSSpecificImplementationGetter} from "./os-specific/OSSpecificImplementationGetter";
import { EncodingUtil } from "./util/EncodingUtil";

export class HTMLCreator {
  public static getSingleCompleteDefinitionHTML = (
    dictName: string,
    entryPartHTML: string,
    definitionPartHTML: string
  ): string => {
    return `<div class="dp-container"><div class="dp-title">${dictName}</div><div class="dp-entry">${entryPartHTML}</div><div class="dp-definition">${definitionPartHTML}</div></div>`;
  };
  public static getSoundHTML = async (audioType: string, resourceAsBase64: string): Promise<string> => {
    return `<img 
              onclick='(function() {
                var audio = new Audio("data:audio/${audioType};base64,${resourceAsBase64}");
                audio.play();
              })()'
              class="dictp-sound-img" 
              src="data:image/png;base64,${await HTMLCreator.getSoundImgAsBase64()}" 
              border="0" 
              align="absmiddle" 
              alt="Play"/>`;
  };
  public static getImageHTML = (imageType: string, resourceAsBase64: string): string => {
    return `<img src="data:image/${imageType},${resourceAsBase64}" />`
  };
  public static getNotSupportedHTML = (message: string): string => {
    return `<div style="margin: 10px; border-radius: 10px">${message}</div>`
  };
  public static getFailedToFetchDefinitionFromDictionaryHTML = (word: string, dictName: string): string => {
    const errorHTML = `<div>Failed to fetch the definition.</div>`;
    return HTMLCreator.getSingleCompleteDefinitionHTML(dictName, word, errorHTML);
  }
  public static convertEntryToHTML(entry: string) {
    return `<div class="dictp-headwords"><p>${entry}</p></div>`;
  }
  private static soundImgAsBase64 = "";
  private static getPathToSoundImg = (): string => {
    return OSSpecificImplementationGetter.path.resolve(ResourceManager.commonResourceDirectory, "sound.png");
  };
  private static getSoundImgAsBase64 = async (): Promise<string> => {
    if (HTMLCreator.soundImgAsBase64 === "") {
      const filePath = HTMLCreator.getPathToSoundImg();
      HTMLCreator.soundImgAsBase64 = await EncodingUtil.readBase64FromFile(filePath);
    }
    return HTMLCreator.soundImgAsBase64;
  };
}
