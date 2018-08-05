/// <reference path="../types/react-native-path.d.ts" />
/* tslint:disable:no-var-requires */
import { OSUtil } from "../util/OSUtil";
import { OS } from "..";

import * as ReactNativePath from "react-native-path";

// conditional imports: http://ideasintosoftware.com/typescript-conditional-imports/
import * as NodeJSPath from "path";
let nodeJSPath: typeof NodeJSPath;
if (OSUtil.os === OS.PC) {
  nodeJSPath = require("path");
}

export function resolve(...paths: string[]): string {
  if (OSUtil.os === OS.PC) {
    return NodeJSPath.resolve(...paths);
  } else {
    return ReactNativePath.resolve(...paths);
  }
}
export function dirname(path: string): string {
  if (OSUtil.os === OS.PC) {
    return NodeJSPath.dirname(path);
  } else {
    return ReactNativePath.dirname(path);
  }
}
export function basename(path: string, ext?: string): string {
  if (OSUtil.os === OS.PC) {
    return NodeJSPath.basename(path, ext);
  } else {
    return ReactNativePath.basename(path, ext);
  }
}
export function extname(path: string): string {
  if (OSUtil.os === OS.PC) {
    return NodeJSPath.extname(path);
  } else {
    return ReactNativePath.extname(path);
  }
}