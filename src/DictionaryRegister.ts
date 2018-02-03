import {registerResourceManager} from "./ResourceManager";
import {DSLResourceManager} from "./dictionaries/dsl/DSLResourceManager";

export function registerResourceManagers() {
  registerResourceManager('dsl', new DSLResourceManager());
}
