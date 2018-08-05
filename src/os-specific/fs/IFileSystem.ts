export interface IFileSystem {
  isDir: (filePath: string) => Promise<boolean>;
}