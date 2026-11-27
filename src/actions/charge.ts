// Charge: run in a straight line and crash into the target. There is no save and no roll: how hard it hits is
// physics (grip, top speed, body weight). Everything after the run is the shared motion system, so a charge
// crashes, hurts, carries things along, hits walls and falls off ledges exactly like a shoved body does.
// The charger is the body that moves; the target is whatever stands in its way.
import type { Creature } from "../model/creature";
import { Fx, type Effect } from "../model/effect";
import { awayFrom, cellsOf, gap } from "../rules/reach";
import { n1 } from "../rules/fmt";
import { groundOf } from "./shove";
import { resolveMotion } from "./motion";
import { no, yes, type Action, type Ctx, type Usable } from "./types";

export interface ChargeInput { actor: Creature; target: Creature }

// A charge only counts if running straight toward the target really ends up in it (any footprint, row/column/diagonal)
function willHit(a: Creature, t: Creature): boolean {
  const step = awayFrom(a, t), theirs = cellsOf(t).map((c) => `${c.col},${c.row}`);
  for (let k = 1; k <= gap(a, t) + 1; k++) {
    const at = { col: a.pos.col + step.col * k, row: a.pos.row + step.row * k };
    if (cellsOf(a, at).some((c) => theirs.includes(`${c.col},${c.row}`))) return true;
  }
  return false;
}

export const Charge: Action<ChargeInput> = {
  id: "charge",
  label: "พุ่งชน (Charge)",

  canUse({ world, rules }: Ctx, { actor, target }: ChargeInput): Usable {
    if (actor.id === target.id) return no("พุ่งชนตัวเองไม่ได้");
    if (!rules.canAct(actor)) return no("ตอนนี้ทำอะไรไม่ได้");
    if (actor.conditions.includes("prone") || actor.tags.includes("flying")) return no("ล้มอยู่หรือบินอยู่ พุ่งชนไม่ได้");
    const run = gap(actor, target);
    if (run < 1) return no("ติดกันอยู่แล้ว ต้องมีระยะวิ่งอย่างน้อย 1 ช่อง");
    if (!willHit(actor, target)) return no("พุ่งตรงไปแล้วไม่โดนเป้าหมาย ต้องอยู่ในแนวตรง (แถว คอลัมน์ หรือทแยง)");
    if (run * world.cellFt > actor.speed) return no(`ไกลเกินระยะวิ่ง (${run * world.cellFt} ฟุต > speed ${actor.speed} ฟุต)`);
    return yes;
  },

  resolve(ctx: Ctx, { actor, target }: ChargeInput): Effect[] {
    const { world, rules } = ctx, t = ctx.trace ?? (() => {});
    const ground = groundOf(world, actor, target);
    const runCells = gap(actor, target), runFt = runCells * world.cellFt;
    for (const line of rules.explainRun(actor, runFt, ground)) t("แรงพุ่ง", line);

    const out = resolveMotion(ctx, {
      body: actor, step: awayFrom(actor, target), cells: runCells + 1,        // one cell more than the gap, so the last step runs into the target
      energyAt: (x) => rules.runEnergy(actor, x, ground),
      describe: (r, note) => Fx.log(`${actor.name} พุ่งชน วิ่ง ${n1(r.moved * world.cellFt)} ฟุต${note}`),
    });
    return [Fx.spendCost(actor.id, rules.costOf("charge")), ...out.fx];
  },
};
