// A pushed creature crashes into something, which may crash into something else...
// Pure: asks the World and the Ruleset, returns WHO is hurt (as "feet of falling"), WHO moves how far, WHAT bumped WHAT.
// The action turns that into effects. Nothing is moved here.
//
// Think of a train: [target] then each thing it knocks along. After a crash the whole train moves together
// with total mass M. If the front of the train is blocked by another body, that is a new crash with the
// energy that is left; if it is blocked by a wall, the front thing takes a wall hit.
import type { Thing } from "../model/thing";
import type { Cell, World } from "../model/world";
import { PUSH } from "../data/push";
import { resolvePush, type PushResult } from "./push";
import type { Ground, Ruleset } from "./ruleset";
import type { Creature } from "../model/creature";
import type { Trace } from "../model/trace";
import { n1 } from "./fmt";

export interface Chain {
  bumps: { front: Thing; hit: Thing }[];        // in order: "front crashed into hit"
  hurt: { who: Thing; ft: number }[];           // each feels like falling `ft` feet (feed to rules.fall)
  extra: { thing: Thing; cells: number }[];     // struck things that got carried, and how many cells in total
  shift: number;                                // cells the original target follows beyond its first contact
  ids: string[];                                // everyone in the train (they never block each other)
}

// What starts a crash: `front` slides with `energy` ft-lb and is blocked by `hit`, heading `step`.
// Anything can be the front: a shoved target, a charging creature, a thrown crate, a body flung by a blast.
export interface Crash { front: Thing; energy: number; hit: Thing | undefined; step: Cell }

export function runCrash(world: World, rules: Ruleset, c: Crash, trace: Trace = () => {}): Chain | undefined {
  const cellFt = world.cellFt, step = c.step, target = c.front;
  let energy = c.energy;
  let mass = target.mass, front: Thing = target, hit = c.hit;
  const out: Chain = { bumps: [], hurt: [], extra: [], shift: 0, ids: [target.id] };
  const slid: { thing: Thing; cells: number }[] = [];           // cells each struck thing moved on its own turn

  for (let depth = 0; hit && depth < PUSH.maxChain; depth++) {
    const col = rules.collide(energy, { ...front, mass }, hit, world.surfaceAt(hit.pos));
    if (col.moverFt <= 0 && col.struckFt <= 0 && col.slideFt <= 0) { trace("ชนของ", `ครั้งที่ ${depth + 1}: ${front.name} ชน ${hit.name} แต่พลังงานเหลือ ${n1(energy)} ft-lb ไม่พอทำอะไร`); break; }   // 2024 rules, or no energy left

    const lost = energy - col.rest, movable = rules.canMove(hit);
    trace("ชนของ", `ครั้งที่ ${depth + 1}: ${front.name} (ขบวนมวลรวม ${n1(mass)} lb, พลังงาน E = ${n1(energy)} ft-lb) ชน ${hit.name} (${movable ? `${n1(hit.mass)} lb` : "ตรึง = เหมือนกำแพง"})`);
    if (movable) trace("ชนของ", `ชนแบบ inelastic: เสีย E×m2/(m1+m2) = ${n1(lost)} ft-lb กลายเป็นดาเมจ, เหลือไปต่อ E×m1/(m1+m2) = ${n1(col.rest)} ft-lb`);
    trace("ชนของ", `ผู้ชนรับแรงเทียบเท่าตกจาก ${n1(col.moverFt)} ฟุต, ${hit.name} รับ ${n1(col.struckFt)} ฟุต (ฝั่งที่เบากว่ารับมากกว่า)`);
    out.bumps.push({ front, hit });
    // the energy the train gives up is soaked by its front member, so its height is measured against ITS weight
    if (col.moverFt > 0) out.hurt.push({ who: front, ft: (col.moverFt * mass) / front.mass });
    if (col.struckFt > 0) out.hurt.push({ who: hit, ft: col.struckFt });

    const cells = rules.canMove(hit) ? rules.cellsFor(col.slideFt, cellFt) : 0;
    if (!movable) { trace("ชนของ", `${hit.name} ขยับไม่ได้ จบลูกโซ่`); break; }
    trace("ชนของ", `ไถลต่อด้วยกัน = rest/(μ×มวลรวม) = ${n1(col.rest)}/${n1(col.drag)} = ${n1(col.slideFt)} ฟุต → ${cells} ช่อง`);
    if (cells === 0) { trace("ชนของ", `ไม่ถึงครึ่งช่อง ${hit.name} ไม่ขยับ จบลูกโซ่`); break; }

    out.ids.push(hit.id);
    const s = resolvePush(world, hit, step, cells, out.ids);
    slid.push({ thing: hit, cells: s.moved });
    mass += hit.mass; front = hit;
    energy = Math.max(0, col.rest - col.drag * s.moved * cellFt);
    trace("ชนของ", `${hit.name} ถูกดันไปได้ ${s.moved} ช่อง${s.stopped ? ` แล้วถูกขวาง${s.hit ? ` โดย ${s.hit.name}` : "ด้วยกำแพง"}` : ""} พลังงานที่เหลือ ${n1(energy)} ft-lb`);

    if (s.stopped === "wall") {
      if (energy > 0) { out.hurt.push({ who: hit, ft: energy / hit.mass }); trace("ชนของ", `ขบวนกระแทกกำแพง: ${hit.name} รับ ${n1(energy)}/${n1(hit.mass)} = ${n1(energy / hit.mass)} ฟุต`); }
      break;
    }
    hit = s.stopped ? s.hit : undefined;                                         // blocked by another body: next crash
  }

  if (hit && out.bumps.length >= PUSH.maxChain) trace("ชนของ", `ชนต่อเนื่องครบ ${PUSH.maxChain} ครั้งแล้ว ตัดลูกโซ่ (PUSH.maxChain)`);

  // everybody behind a thing follows it, so a thing's total = what it slid + what everything ahead of it slid
  let ahead = 0;
  for (let i = slid.length - 1; i >= 0; i--) { ahead += slid[i].cells; if (ahead > 0) out.extra.unshift({ thing: slid[i].thing, cells: ahead }); }
  out.shift = ahead;
  return out.bumps.length ? out : undefined;
}

// The shove way of starting a crash: the target was pushed `first.moved` cells and the push gave it this much energy.
// (Kept so shove-shaped callers and tests keep working; new actions call runCrash with their own energy.)
export function runChain(world: World, rules: Ruleset, actor: Creature, target: Creature, first: PushResult, step: Cell, ground: Ground, trace: Trace = () => {}): Chain | undefined {
  return runCrash(world, rules, { front: target, energy: rules.pushEnergy(actor, target, first.moved * world.cellFt, ground), hit: first.hit, step }, trace);
}
