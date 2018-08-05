/* tslint:disable:no-var-requires */

import { OSUtil } from "../util/OSUtil";
import { OS } from "..";

// conditional imports: http://ideasintosoftware.com/typescript-conditional-imports/
import * as FSE from "fs-extra";
let fse: typeof FSE;
if (OSUtil.os === OS.PC) {
  fse = require("fs-extra");
}
