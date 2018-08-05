import * as path from "path";
import { IPath } from "./IPath";

export class PathPC implements IPath {
  public resolve(...filePaths: string[]): string {
    return path.resolve(...filePaths);
  }
  public dirname(filePath: string): string {
    return path.dirname(filePath);
  }
  public basename(filePath: string, ext?: string): string {
    return path.basename(filePath, ext);
  }
  public extname(filePath: string): string {
    return path.extname(filePath);
  }
}