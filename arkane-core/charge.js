/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  Charge
} from "./chunks/chunk-IRQ3VE3N.js";
import {
  randomDice
} from "./chunks/chunk-RINPBN55.js";
import {
  FoundryWorld
} from "./chunks/chunk-OOIDDOUU.js";
import "./chunks/chunk-YYXYPINZ.js";
import {
  applyEffects,
  currentRules
} from "./chunks/chunk-VSXCXXY3.js";
import "./chunks/chunk-HNCV3QLI.js";
import {
  isPropToken
} from "./chunks/chunk-VELQ4LWX.js";
import "./chunks/chunk-H7JZCNPB.js";

// src/foundry/charge.ts
async function charge() {
  const me = canvas.tokens.controlled[0]?.document, tgt = game.user.targets.first()?.document;
  if (!me?.actor) return ui.notifications.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E01\u0E48\u0E2D\u0E19");
  if (isPropToken(tgt)) return ui.notifications.warn("\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E1B\u0E47\u0E19\u0E02\u0E2D\u0E07 (prop) \u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19\u0E44\u0E14\u0E49\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23");
  if (!tgt?.actor) return ui.notifications.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E01\u0E48\u0E2D\u0E19 (\u0E04\u0E25\u0E34\u0E01\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E41\u0E25\u0E49\u0E27\u0E01\u0E14 T)");
  const world = new FoundryWorld(canvas.scene);
  const actor = world.creature(me.id), target = world.creature(tgt.id);
  if (!actor || !target) return;
  const ctx = { world, rules: currentRules(), dice: randomDice(() => CONFIG.Dice.randomUniform()) };
  const usable = Charge.canUse(ctx, { actor, target });
  if (!usable.ok) return ui.notifications.warn(usable.reason);
  await applyEffects(Charge.resolve(ctx, { actor, target }), canvas.scene.id, me);
}

// src/features/charge.ts
function register(core) {
  core.charge = charge;
}
export {
  register
};
