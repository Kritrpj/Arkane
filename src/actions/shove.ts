// Shove: target resists with a save vs DC 8 + STR + prof; on failure it is pushed or knocked prone.
// Only the shove-specific part lives here (the save, how much force, the wording). Once the push has an
// energy curve it is handed to the shared motion system (actions/motion.ts): path, crashes, wall damage, falls.
// ctx.trace (optional) receives the reasoning with numbers; it never changes the result.
import type { Creature } from "../model/creature";
import { Fx, type Effect } from "../model/effect";
import type { World } from "../model/world";
import { awayFrom, gap } from "../rules/reach";
import { formatCheck } from "../rules/check";
import { n1 } from "../rules/fmt";
import type { Ground } from "../rules/ruleset";
import { resolveMotion, WHY } from "./motion";
import { no, yes, type Action, type Ctx, type Usable } from "./types";

export interface ShoveInput { actor: Creature; target: Creature; mode: "push" | "prone" }

export const groundOf = (world: World, actor: Creature, target: Creature): Ground =>
  ({ actor: world.surfaceAt(actor.pos), target: world.surfaceAt(target.pos) });

export const Shove: Action<ShoveInput> = {
  id: "shove",
  label: "ผลัก (Shove)",

  canUse({ rules }: Ctx, { actor, target }: ShoveInput): Usable {
    if (actor.id === target.id) return no("ผลักตัวเองไม่ได้");
    if (!rules.canAct(actor)) return no("ตอนนี้ทำอะไรไม่ได้");
    if (gap(actor, target) > 0) return no("ต้องอยู่ติดกัน");
    if (!rules.canShoveSize(actor, target)) return no("ตัวใหญ่เกินไป (ผลักได้ใหญ่กว่าไม่เกิน 1 ขนาด)");
    return yes;
  },

  resolve(ctx: Ctx, { actor, target, mode }: ShoveInput): Effect[] {
    const { world, rules, dice } = ctx, t = ctx.trace ?? (() => {});
    const fx: Effect[] = [Fx.spendCost(actor.id, rules.costOf("shove"))];

    const check = rules.save(target, rules.shoveSaveAbility(target), rules.shoveDC(actor), dice);
    t("ทอย save", `${target.name}: ${formatCheck(check)} → ${check.ok ? "ผ่าน ไม่ถูกผลัก" : "พลาด"}`);
    if (check.ok) return [...fx, Fx.log(`${target.name} ยืนมั่น ไม่ถูกผลัก`, check)];

    if (mode === "prone") { t("ทอย save", "เลือกผลลัพธ์ = ล้ม (prone) ไม่มีการเคลื่อนที่"); return [...fx, Fx.log(`${actor.name} ผลัก ${target.name} ล้มลง`, check), Fx.prone(target.id)]; }

    const ground = groundOf(world, actor, target);
    const ft = rules.pushFt(actor, target, ground), cells = rules.cellsFor(ft, world.cellFt);
    for (const line of rules.explainPush(actor, target, ground)) t("แรงและระยะ", line);
    t("ปัดเป็นช่อง", `${n1(ft)} ฟุต ÷ ${world.cellFt} ฟุต/ช่อง = ${n1(ft / world.cellFt)} → ${cells} ช่อง โดย ${rules.roundingNote()}`);
    if (cells === 0) return [...fx, Fx.log(`${actor.name} พยายามผลัก ${target.name} แต่ขยับไม่ไหว`, check)];

    // everything after the save (path, crash, wall damage, falls) is the shared motion system
    const step = awayFrom(actor, target);
    const out = resolveMotion(ctx, {
      body: target, step, cells,
      energyAt: (x) => rules.pushEnergy(actor, target, x, ground),
      describe: (r, note) => Fx.log(`${actor.name} ผลัก ${target.name} ไป ${r.moved * world.cellFt} ฟุต${note}`, check),
    });
    if (out.moved === 0) return [...fx, Fx.log(`${actor.name} พยายามผลัก ${target.name} แต่${WHY[out.stopped ?? "wall"]} ผลักไม่ได้`, check)];
    fx.push(...out.fx);
    return fx;
  },
};
