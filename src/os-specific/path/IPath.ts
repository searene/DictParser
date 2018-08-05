export interface IPath {
  resolve: (...filePaths: string[]) => string;
  dirname: (filePath: string) => string;
  basename: (filePath: string, ext?: string) => string;
  extname: (filePath: string) => string;
}