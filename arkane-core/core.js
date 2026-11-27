/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  Charge
} from "./chunks/chunk-IRQ3VE3N.js";
import {
  Ruleset,
  RulesetPhysics,
  Shove,
  gmApply,
  setRuleset,
  useRules
} from "./chunks/chunk-VSXCXXY3.js";
import "./chunks/chunk-HNCV3QLI.js";
import {
  SOCK,
  toCreature,
  toProp
} from "./chunks/chunk-VELQ4LWX.js";
import "./chunks/chunk-H7JZCNPB.js";

// src/actions/index.ts
var ACTIONS = { shove: Shove, charge: Charge };

// src/foundry/inspect.ts
function inspect(tok) {
  const doc = tok ?? canvas.tokens.controlled[0]?.document;
  const prop = doc ? toProp(doc) : null;
  if (prop) {
    console.log("arkane-1920s | core inspect (prop)", prop.name, {
      material: prop.material,
      heightFt: prop.heightFt,
      footprint: prop.footprint,
      mass: prop.mass,
      massSource: prop.massSource,
      tags: prop.tags,
      elevation: prop.elevation
    });
    return prop;
  }
  const c = doc ? toCreature(doc) : null;
  if (!c) {
    ui.notifications.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01 token \u0E01\u0E48\u0E2D\u0E19");
    return null;
  }
  console.log("arkane-1920s | core inspect", c.name, {
    size: c.size,
    footprint: c.footprint,
    mass: c.mass,
    massSource: c.massSource,
    massNote: c.massNote,
    strScore: c.strScore,
    strMod: c.mod.str,
    elevation: c.elevation,
    conditions: c.conditions,
    tags: c.tags,
    sheetWeight: doc.actor?.system?.details?.weight,
    sheetHeight: doc.actor?.system?.details?.height
  });
  return c;
}

// src/core.ts
var CORE_VERSION = true ? "0.10.0" : "dev";
function createCore() {
  game.socket.on(SOCK, (d) => {
    if (d?.t === "c-fx" && game.users.activeGM?.isSelf) gmApply(d).catch((e) => console.warn("arkane-1920s", "core", e));
  });
  game.arkane = game.arkane ?? {};
  game.arkane.core = { version: CORE_VERSION, setRuleset, useRules, inspect, Ruleset, RulesetPhysics, actions: ACTIONS };
  console.log("arkane-1920s | core", CORE_VERSION, "ready");
  return game.arkane.core;
}
export {
  CORE_VERSION,
  createCore
};
