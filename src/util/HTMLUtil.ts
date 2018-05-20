export const buildAudioTag = (resourcePath: string): string => {
  return `<audio id="${resourcePath}" src="${resourcePath}"></audio>`;
}