/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  randomDice,
  recordDice,
  scriptedDice
} from "./chunks/chunk-RINPBN55.js";
import {
  FoundryWorld
} from "./chunks/chunk-OOIDDOUU.js";
import "./chunks/chunk-YYXYPINZ.js";
import {
  Shove,
  applyEffects,
  currentRules,
  groundOf
} from "./chunks/chunk-VSXCXXY3.js";
import {
  Fx
} from "./chunks/chunk-HNCV3QLI.js";
import {
  isPropToken
} from "./chunks/chunk-VELQ4LWX.js";
import "./chunks/chunk-H7JZCNPB.js";

// src/foundry/shove.ts
var failedCheck = (fx) => fx.find((e) => e.kind === "log" && e.check && !e.check.ok);
async function shove() {
  const me = canvas.tokens.controlled[0]?.document, tgt = game.user.targets.first()?.document;
  if (!me?.actor) return ui.notifications.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E01\u0E48\u0E2D\u0E19");
  if (isPropToken(tgt)) return ui.notifications.warn("\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E1B\u0E47\u0E19\u0E02\u0E2D\u0E07 (prop) \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 \u0E1C\u0E25\u0E31\u0E01\u0E44\u0E14\u0E49\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 \u0E02\u0E2D\u0E07\u0E08\u0E30\u0E16\u0E39\u0E01\u0E14\u0E31\u0E19\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E21\u0E35\u0E04\u0E19\u0E0A\u0E19");
  if (!tgt?.actor) return ui.notifications.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E01\u0E48\u0E2D\u0E19 (\u0E04\u0E25\u0E34\u0E01\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E41\u0E25\u0E49\u0E27\u0E01\u0E14 T)");
  const world = new FoundryWorld(canvas.scene);
  const actor = world.creature(me.id), target = world.creature(tgt.id);
  if (!actor || !target) return;
  const rec = recordDice(randomDice(() => CONFIG.Dice.randomUniform()));
  const ctx = { world, rules: currentRules(), dice: rec.dice };
  const input = { actor, target, mode: "push" };
  const usable = Shove.canUse(ctx, input);
  if (!usable.ok) return ui.notifications.warn(usable.reason);
  const pushedFt = currentRules().cellsFor(currentRules().pushFt(actor, target, groundOf(world, actor, target)), world.cellFt) * world.cellFt;
  let fx = Shove.resolve(ctx, input);
  const miss = failedCheck(fx);
  if (miss) {
    const how = await foundry.applications.api.DialogV2.wait({
      window: { title: `\u0E1C\u0E25\u0E31\u0E01 ${tgt.name}` },
      content: "<p>\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E1E\u0E25\u0E32\u0E14 save \u0E40\u0E25\u0E37\u0E2D\u0E01\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C</p>",
      buttons: [{ action: "push", label: `\u0E1C\u0E25\u0E31\u0E01\u0E44\u0E1B ${pushedFt} \u0E1F\u0E38\u0E15`, default: true }, { action: "prone", label: "\u0E25\u0E49\u0E21 (Prone)" }]
    }).catch(() => null);
    if (how === "prone") fx = Shove.resolve({ ...ctx, dice: scriptedDice(rec.rolled) }, { ...input, mode: "prone" });
    else if (how !== "push") fx = [Fx.log(`${actor.name} \u0E1E\u0E22\u0E32\u0E22\u0E32\u0E21\u0E1C\u0E25\u0E31\u0E01 ${target.name} \u0E41\u0E15\u0E48\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01`, miss.check)];
  }
  await applyEffects(fx, canvas.scene.id, me);
}

// src/features/shove.ts
function register(core) {
  core.shove = shove;
}
export {
  register
};
