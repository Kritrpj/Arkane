// The Foundry entry point for Shove: reads selection, runs the pure action, asks push/prone only
// when the save failed (2024 rule), then applies the effects.
import { Fx, type Effect } from "../model/effect";
import { randomDice, recordDice, scriptedDice } from "../rules/dice";
import { Shove, groundOf } from "../actions/shove";
import { applyEffects } from "./apply";
import { currentRules } from "./rules";
import { isPropToken } from "./snapshot";
import { FoundryWorld } from "./world";

export { setRuleset, currentRules, useRules } from "./rules";   // kept here so older imports still work

const failedCheck = (fx: Effect[]) => fx.find((e) => e.kind === "log" && e.check && !e.check.ok) as Extract<Effect, { kind: "log" }> | undefined;

export async function shove(): Promise<void> {
  const me = canvas.tokens.controlled[0]?.document, tgt = game.user.targets.first()?.document;
  if (!me?.actor) return ui.notifications.warn("เลือกตัวละครของคุณก่อน");
  if (isPropToken(tgt)) return ui.notifications.warn("เป้าหมายเป็นของ (prop) ไม่ใช่ตัวละคร ผลักได้เฉพาะตัวละคร ของจะถูกดันเมื่อมีคนชน");
  if (!tgt?.actor) return ui.notifications.warn("เลือกเป้าหมายก่อน (คลิกเป้าหมายแล้วกด T)");

  const world = new FoundryWorld(canvas.scene);
  const actor = world.creature(me.id), target = world.creature(tgt.id);
  if (!actor || !target) return;

  const rec = recordDice(randomDice(() => CONFIG.Dice.randomUniform()));
  const ctx = { world, rules: currentRules(), dice: rec.dice };
  const input = { actor, target, mode: "push" as "push" | "prone" };

  const usable = Shove.canUse(ctx, input);
  if (!usable.ok) return ui.notifications.warn(usable.reason);

  const pushedFt = currentRules().cellsFor(currentRules().pushFt(actor, target, groundOf(world, actor, target)), world.cellFt) * world.cellFt;
  let fx = Shove.resolve(ctx, input);
  const miss = failedCheck(fx);
  if (miss) {                                                  // target failed its save: attacker chooses
    const how: string | null = await foundry.applications.api.DialogV2.wait({
      window: { title: `ผลัก ${tgt.name}` }, content: "<p>เป้าหมายพลาด save เลือกผลลัพธ์</p>",
      buttons: [{ action: "push", label: `ผลักไป ${pushedFt} ฟุต`, default: true }, { action: "prone", label: "ล้ม (Prone)" }],
    }).catch(() => null);
    if (how === "prone") fx = Shove.resolve({ ...ctx, dice: scriptedDice(rec.rolled) }, { ...input, mode: "prone" });   // same d20
    else if (how !== "push") fx = [Fx.log(`${actor.name} พยายามผลัก ${target.name} แต่ยกเลิก`, miss.check)];            // roll is kept: no re-roll by cancelling
  }
  await applyEffects(fx, canvas.scene.id, me);
}
