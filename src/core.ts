// Entry "core" (arkane-core/core.js): the base every feature plugs into. Loaded first by arkane-core/loader.js.
// Makes game.arkane.core (version, rules switch, inspect) and listens for the GM socket. Features add their own
// functions onto it (src/features/*.ts), so each feature is its own file and can fail or be removed alone.
import { ACTIONS } from "./actions";
import { Ruleset } from "./rules/ruleset";
import { RulesetPhysics } from "./rules/physicsRuleset";
import { gmApply, type FxMessage } from "./foundry/apply";
import { inspect } from "./foundry/inspect";
import { setRuleset, useRules } from "./foundry/rules";
import { SOCK } from "./foundry/snapshot";

// stamped by tools/build.mjs from package.json ("dev" when running unbuilt, e.g. in tests)
export const CORE_VERSION: string = typeof __CORE_VERSION__ === "string" ? __CORE_VERSION__ : "dev";

export function createCore(): any {
  // only the active GM executes requests (same rule as the old "x-" listener)
  game.socket.on(SOCK, (d: FxMessage) => {
    if (d?.t === "c-fx" && game.users.activeGM?.isSelf) gmApply(d).catch((e) => console.warn("arkane-1920s", "core", e));
  });
  game.arkane = game.arkane ?? {};
  game.arkane.core = { version: CORE_VERSION, setRuleset, useRules, inspect, Ruleset, RulesetPhysics, actions: ACTIONS };
  console.log("arkane-1920s | core", CORE_VERSION, "ready");
  return game.arkane.core;
}
