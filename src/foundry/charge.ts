// The Foundry entry point for Charge: select your token, target the creature to run into, then
//   game.arkane.core.charge()
// No dialog and no roll: the run and the crash are physics, then the effects are applied.
import { randomDice } from "../rules/dice";
import { Charge } from "../actions/charge";
import { applyEffects } from "./apply";
import { currentRules } from "./rules";
import { isPropToken } from "./snapshot";
import { FoundryWorld } from "./world";

export async function charge(): Promise<void> {
  const me = canvas.tokens.controlled[0]?.document, tgt = game.user.targets.first()?.document;
  if (!me?.actor) return ui.notifications.warn("เลือกตัวละครของคุณก่อน");
  if (isPropToken(tgt)) return ui.notifications.warn("เป้าหมายเป็นของ (prop) พุ่งชนได้เฉพาะตัวละคร");
  if (!tgt?.actor) return ui.notifications.warn("เลือกเป้าหมายก่อน (คลิกเป้าหมายแล้วกด T)");

  const world = new FoundryWorld(canvas.scene);
  const actor = world.creature(me.id), target = world.creature(tgt.id);
  if (!actor || !target) return;

  const ctx = { world, rules: currentRules(), dice: randomDice(() => CONFIG.Dice.randomUniform()) };
  const usable = Charge.canUse(ctx, { actor, target });
  if (!usable.ok) return ui.notifications.warn(usable.reason);
  await applyEffects(Charge.resolve(ctx, { actor, target }), canvas.scene.id, me);
}
