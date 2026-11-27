// All-in-one registration (core + every feature). Foundry does NOT use this: arkane-core/loader.js loads core.js and
// each feature file separately. Kept for tests and for anyone who wants to bundle everything by hand.
import { createCore, CORE_VERSION } from "../core";
import { register as shove } from "../features/shove";
import { register as charge } from "../features/charge";
import { register as heights } from "../features/heights";
import { register as props } from "../features/props";
import { register as zones } from "../features/zones";

export { CORE_VERSION };
export function registerCore(): void {
  const core = createCore();
  for (const f of [shove, charge, heights, props, zones]) f(core);
}
