// THE central system for "something starts sliding": walk it cell by cell, crash it into whatever is in
// the way, hurt what got hit, carry things along, drop it off ledges. Shove, Charge and any future action
// (running into someone, a thrown crate, a blast that flings bodies) hand it a Motion and get Effects back.
// An action only decides WHO moves, WHERE, with how much energy, and how to word the first log line.
// Order of events: path -> (hit a creature/prop: crash chain) -> (hit a wall: damage) -> falls.
// ctx.trace (optional) receives the reasoning with numbers; it never changes the result.
import type { Prop, Thing } from "../model/thing";
import { Fx, type Effect } from "../model/effect";
import type { Cell } from "../model/world";
import { resolvePush, type PushResult } from "../rules/push";
import { runCrash, type Chain } from "../rules/chain";
import { impactHeightFt } from "../rules/physics";
import { n1, n2 } from "../rules/fmt";
import type { Ctx } from "./types";

export const WHY = { wall: "ติดกำแพง", creature: "มีคนยืนขวางอยู่", prop: "มีของขวางอยู่" } as const;
export const isProp = (t: Thing): t is Prop => "material" in t;

export interface Motion {
  body: Thing;                                 // what starts sliding
  step: Cell;                                  // direction, one cell at a time
  cells: number;                               // whole cells it will try (the action rounds feet with rules.cellsFor)
  energyAt(travelledFt: number): number;       // ft-lb it still carries after travelling x ft from where it started
  // the action words its own opening line (it knows the verb, the dice, who did it); `note` is "(ชน X)" / "(หยุดเพราะ...)"
  describe(final: PushResult, note: string): Effect;
}

export interface MotionResult {
  fx: Effect[];                                // empty when the body could not move at all
  moved: number;                               // cells the body itself moved (0 = blocked at once; the action explains why)
  stopped: PushResult["stopped"];
  crash?: Chain;
}

// "it hits as hard as falling h feet": a knock is smooth damage (whole d6 per 10 ft + the leftover as a fraction of one d6),
// so even a small crash bruises. Returns log + damage; nothing for props (no HP yet) or for a knock under the minimum.
export function hurt({ rules, dice, trace }: Ctx, who: Thing, h: number, why: string, step: string): Effect[] {
  if (isProp(who)) { trace?.(step, `${who.name} เป็นของ ไม่มี HP จึงไม่เสียหาย`); return []; }
  const b = rules.bruise(h), d = `d${b.sides}`;
  if (b.dice <= 0 && b.frac <= 0) { trace?.(step, `${who.name}: เทียบเท่าตก ${n1(h)} ฟุต ต่ำกว่าขั้นต่ำ → แค่กระแทกเบา ๆ ไม่เสียหาย`); return []; }
  const whole = b.dice > 0 ? dice.roll(b.dice, b.sides) : 0;
  const roll = b.frac > 0 ? dice.roll(1, b.sides) : 0, part = b.frac > 0 ? Math.max(1, Math.round(roll * b.frac)) : 0;
  const dmg = whole + part;
  trace?.(step, `${who.name}: เทียบเท่าตก ${n1(h)} ฟุต → n = ${n1(h)} ÷ 10 = ${n2(b.exact)} ลูกเต๋า`
    + ` → ${b.dice > 0 ? `${b.dice}${d} ทอยได้ ${whole}` : "ไม่มีเต๋าเต็ม"}`
    + (b.frac > 0 ? ` + เศษ ${n2(b.frac)} ของ 1${d} (ทอย ${roll} × ${n2(b.frac)} = ${n2(roll * b.frac)} → ปัดเป็น ${part}, อย่างน้อย 1)` : "")
    + ` = ${dmg} ดาเมจ`);
  return [Fx.log(`${why} เสีย ${dmg} ดาเมจ`), Fx.damage(who.id, dmg, "bludgeoning")];
}

export function fallFx({ rules, dice, trace }: Ctx, who: Thing, dropFt: number): Effect[] {
  if (dropFt <= 0) return [];
  const fall = rules.fall(dropFt);
  if (fall.dice > 0 && !isProp(who)) {
    const dmg = dice.roll(fall.dice, fall.sides);
    trace?.("ตกขอบ", `${who.name} ตกจากสูง ${dropFt} ฟุต → ${fall.dice}d${fall.sides} ทอยได้ ${dmg} และล้ม (prone)`);
    return [Fx.log(`${who.name} ตกจากที่สูง ${dropFt} ฟุต เสีย ${dmg} ดาเมจ`), Fx.damage(who.id, dmg, "bludgeoning"), Fx.prone(who.id)];
  }
  trace?.("ตกขอบ", `${who.name} ตกลงมา ${dropFt} ฟุต ${isProp(who) ? "แต่เป็นของ ไม่เสียหาย" : "แต่ต่ำกว่า 10 ฟุต ไม่เจ็บ"}`);
  return [Fx.log(`${who.name} ตกลงมา ${dropFt} ฟุต${isProp(who) ? "" : " (ไม่เจ็บ)"}`)];
}

export function resolveMotion(ctx: Ctx, m: Motion): MotionResult {
  const { world, rules } = ctx, t = ctx.trace ?? (() => {});
  const { body, step } = m;

  const first = resolvePush(world, body, step, m.cells);
  t("เส้นทาง", `ทิศ (${step.col}, ${step.row}) ตั้งใจไป ${m.cells} ช่อง ไปได้จริง ${first.moved} ช่อง — ${first.stopped ? `หยุดเพราะ${WHY[first.stopped]}${first.hit ? ` (${first.hit.name})` : ""}` : "ไม่มีอะไรขวาง"}`);
  if (first.moved === 0) return { fx: [], moved: 0, stopped: first.stopped };

  // ran into something? (physics rulebook only; 2024 returns no energy so the chain is empty and the body just stops)
  const crash = first.hit ? runCrash(world, rules, { front: body, energy: m.energyAt(first.moved * world.cellFt), hit: first.hit, step }, ctx.trace) : undefined;
  if (first.hit && !crash) t("ชนของ", `${body.name} ชน ${first.hit.name} แต่กฎนี้ไม่มีดาเมจชนและไม่ดันต่อ จึงแค่หยุด`);
  // the body follows whatever it knocked along, so its own path is walked again with the extra cells
  const r = crash && crash.shift > 0 ? resolvePush(world, body, step, first.moved + crash.shift, crash.ids) : first;
  if (crash && crash.shift > 0) t("ชนของ", `${body.name} ตามของที่ชนไปอีก ${crash.shift} ช่อง รวมเดินทาง ${r.moved} ช่อง`);

  const note = crash ? ` (ชน ${first.hit!.name})` : r.stopped ? ` (หยุดเพราะ${WHY[r.stopped]})` : "";
  const fx: Effect[] = [m.describe(r, note), Fx.push(body.id, r.to)];

  const falls: Effect[] = [];
  if (crash) {
    for (const b of crash.bumps) fx.push(Fx.log(`${b.front.name} ชน ${b.hit.name}`));
    for (const h of crash.hurt) fx.push(...hurt(ctx, h.who, h.ft, `${h.who.name} เจ็บจากการชน แรงเท่าตกจาก ${Math.round(h.ft)} ฟุต`, "ดาเมจจากการชน"));
    for (const x of crash.extra) {                                // each struck thing moves; it may fall over an edge
      const s = resolvePush(world, x.thing, step, x.cells, crash.ids);
      if (s.moved === 0) continue;
      fx.push(Fx.log(`${x.thing.name} ถูกดันไปอีก ${s.moved * world.cellFt} ฟุต`), Fx.push(x.thing.id, s.to));
      falls.push(...fallFx(ctx, x.thing, s.dropFt));
    }
  }

  if (first.stopped === "wall") {                                 // slammed into it: same damage table as a fall
    const e = m.energyAt(first.moved * world.cellFt), h = impactHeightFt(e, body.mass);
    t("กระแทกกำแพง", e > 0 ? `พลังงานที่ยังเหลือ E = ${n1(e)} ft-lb ÷ น้ำหนัก ${n1(body.mass)} lb = ${n1(h)} ฟุต (เหมือนตกจากความสูงนั้น)` : "กฎนี้ไม่มีดาเมจชนกำแพง");
    fx.push(...hurt(ctx, body, h, `${body.name} กระแทกกำแพง แรงเท่าตกจาก ${Math.round(h)} ฟุต`, "กระแทกกำแพง"));
  }
  if (body.tags.includes("flying") && world.heightAt(body.pos) > world.heightAt(r.to)) t("ตกขอบ", `${body.name} บินอยู่ จึงไม่ตกลงไปในหลุม`);
  fx.push(...falls, ...fallFx(ctx, body, r.dropFt));
  return { fx, moved: r.moved, stopped: first.stopped, crash };
}
