// D&D 2024 + real push physics. Only what differs from the base rulebook is overridden:
// the save, DC and "one size bigger" limit stay the same; HOW FAR a failed save sends the target
// now comes from force, weight and friction (rules/physics.ts) instead of a flat 5 ft.
import type { Creature } from "../model/creature";
import type { Thing } from "../model/thing";
import { BODY } from "../data/bodies";
import { FRICTION, MIN_MU } from "../data/surfaces";
import { PUSH } from "../data/push";
import { FALL } from "../data/fall";
import { n1 } from "./fmt";
import { Ruleset, type Ground } from "./ruleset";
import { collide, energyLeft, impactHeightFt, pushDistanceFt, type Collision, type Slide } from "./physics";

export interface PhysicsOptions {
  rounding: "nearest" | "floor";   // 9.8 ft: nearest = 2 cells, floor = 1 cell. Exactly half a cell rounds down
  sizeRule: boolean;               // keep the 5e limit "target at most one size larger"; false = weight and grip alone decide
  strokeFt: number;
  bracing: number;
}

export class RulesetPhysics extends Ruleset {
  readonly name = "D&D 2024 + physics";
  readonly opt: PhysicsOptions;

  constructor(o: Partial<PhysicsOptions> = {}) {
    super();
    this.opt = { rounding: PUSH.rounding, sizeRule: true, strokeFt: PUSH.strokeFt, bracing: PUSH.bracing, ...o };
  }

  canShoveSize(actor: Creature, target: Creature): boolean { return !this.opt.sizeRule || super.canShoveSize(actor, target); }

  // the real STR score when the adapter knows it; otherwise 10 + 2 x mod (odd scores round down)
  strScore(c: Creature): number { return Math.max(1, c.strScore ?? 10 + 2 * c.mod.str); }
  pushForce(c: Creature): number { return PUSH.lbPerStr * this.strScore(c) * BODY[c.size].forceMult; }
  friction(surface?: string): number { return Math.max(MIN_MU, FRICTION[surface ?? "floor"] ?? FRICTION.floor); }
  // the most force feet can transmit: mu x weight x bracing. Oil under the pusher -> almost nothing
  tractionLimit(c: Creature, surface?: string): number { return this.friction(surface) * this.opt.bracing * c.mass; }

  private slide(actor: Creature, target: Creature, g: Ground = {}): Slide {
    return {
      forceLb: Math.min(this.pushForce(actor), this.tractionLimit(actor, g.actor)),
      weightLb: target.mass, mu: this.friction(g.target), strokeFt: this.opt.strokeFt,
    };
  }

  pushFt(actor: Creature, target: Creature, g?: Ground): number {
    return pushDistanceFt(this.slide(actor, target, g));
  }

  roundingNote(): string { return this.opt.rounding === "floor" ? "ปัดลง (floor)" : "ปัดใกล้สุด (ครึ่งช่องพอดีปัดลง)"; }

  explainPush(actor: Creature, target: Creature, g: Ground = {}): string[] {
    const score = this.strScore(actor), mult = BODY[actor.size].forceMult;
    const force = this.pushForce(actor), grip = this.tractionLimit(actor, g.actor), used = Math.min(force, grip);
    const muT = this.friction(g.target), drag = muT * target.mass;
    const out = [
      `แรงผลัก F = ${PUSH.lbPerStr} × STR ${score} × ตัวคูณขนาด (${actor.size}) ${mult} = ${n1(force)} lb`,
      `traction ผู้ผลัก = μ ${this.friction(g.actor)} (${g.actor ?? "พื้นปกติ"}) × bracing ${this.opt.bracing} × มวล ${n1(actor.mass)} lb = ${n1(grip)} lb${grip < force ? "  ← จำกัดแรง" : ""}`,
      `แรงที่ส่งได้จริง = min(${n1(force)}, ${n1(grip)}) = ${n1(used)} lb`,
      `แรงเสียดทานของเป้าหมาย μW = ${muT} (${g.target ?? "พื้นปกติ"}) × ${n1(target.mass)} lb = ${n1(drag)} lb`,
    ];
    out.push(used <= drag
      ? `F ≤ μW → ขยับไม่ได้ ระยะ 0`
      : `ระยะรวม d = s × F/(μW) = ${this.opt.strokeFt} × ${n1(used)}/${n1(drag)} = ${n1(this.pushFt(actor, target, g))} ฟุต`);
    return out;
  }

  cellsFor(ft: number, cellFt: number): number {
    const n = ft / cellFt;
    return Math.max(0, this.opt.rounding === "floor" ? Math.floor(n + 1e-9) : Math.ceil(n - 0.5 - 1e-9));
  }

  pushEnergy(actor: Creature, target: Creature, travelledFt: number, g?: Ground): number {
    return energyLeft(this.slide(actor, target, g), travelledFt);
  }

  impactFt(actor: Creature, target: Creature, travelledFt: number, g?: Ground): number {
    return impactHeightFt(this.pushEnergy(actor, target, travelledFt, g), target.mass);
  }

  // a runner is limited by grip, not strength: a = mu x g, until it hits its top speed. E = W v^2 / 2g
  private runSpeed(actor: Creature, runFt: number, g?: Ground): { a: number; vmax: number; v: number } {
    const a = this.friction(g?.actor) * PUSH.g, vmax = actor.speed * PUSH.sprint;
    return { a, vmax, v: Math.min(Math.sqrt(2 * a * Math.max(0, runFt)), vmax) };
  }
  runEnergy(actor: Creature, runFt: number, g?: Ground): number {
    const { v } = this.runSpeed(actor, runFt, g);
    return (actor.mass * v * v) / (2 * PUSH.g);
  }
  explainRun(actor: Creature, runFt: number, g?: Ground): string[] {
    const { a, vmax, v } = this.runSpeed(actor, runFt, g), mu = this.friction(g?.actor);
    return [
      `วิ่งเร่งด้วยแรงเกาะพื้น: a = μ×g = ${n1(mu)}×${PUSH.g} = ${n1(a)} ft/s² (พื้น${g?.actor ?? "ปกติ"})`,
      `ความเร็วสูงสุด = speed ${actor.speed} ft × ${n1(PUSH.sprint)} = ${n1(vmax)} ft/s; วิ่ง ${n1(runFt)} ฟุต ได้ v = min(√(2ad), สูงสุด) = ${n1(v)} ft/s`,
      `พลังงาน E = น้ำหนัก ${n1(actor.mass)} lb × v² ÷ 2g = ${n1((actor.mass * v * v) / (2 * PUSH.g))} ft-lb`,
    ];
  }

  explainDamage(): string[] {
    const d = `d${FALL.sides}`;
    return [
      "1) พลังงานตอนชน E (ft-lb): ผลัก = (แรงผลัก − แรงเสียดทาน) × ระยะที่ยังผลักอยู่ แล้วค่อย ๆ หมดไปเพราะเสียดทาน; พุ่งชน = น้ำหนัก × v² ÷ 2g",
      "2) ชนคนหรือของ (ชนแบบไม่ยืดหยุ่น): พลังงานที่เสียไป = E × m₂ ÷ (m₁ + m₂) ตัวที่ชนและตัวที่ถูกชนแบ่งกัน ตัวเบาได้ส่วนมากกว่า (ตัวที่ชนรับ m₂/(m₁+m₂), ตัวที่ถูกชนรับ m₁/(m₁+m₂)); ที่เหลือพากันไถลต่อ",
      "3) ชนกำแพง: เจ็บเต็ม E (กำแพงเหมือนมวลอนันต์)",
      "4) แปลงเป็นความสูงที่ตก: h = พลังงานของฝ่ายนั้น ÷ น้ำหนักตัวเอง (ft)",
      `5) ดาเมจ: n = h ÷ ${FALL.ftPerDie} ฟุต; ทอย ⌊n⌋${d} บวกเศษ (n − ⌊n⌋) ของ 1${d} (ทอย 1${d} คูณเศษ ปัดเป็นเลขเต็ม อย่างน้อย 1); h ต่ำกว่า ${FALL.minImpactFt} ฟุต = ไม่เจ็บ; สูงสุด ${FALL.maxDice}${d}`,
      `6) ตกขอบเป็นกฎ 5e ตรง ๆ: ${FALL.sides === 6 ? "1d6" : `1d${FALL.sides}`} ต่อ ${FALL.ftPerDie} ฟุตเต็ม (ปัดลง ไม่มีเศษ) แล้วล้ม`,
    ];
  }

  collide(energy: number, mover: Thing, struck: Thing, surface?: string): Collision {
    const m2 = this.canMove(struck) ? struck.mass : Infinity;
    return collide(energy, mover.mass, m2, this.friction(surface));
  }
}
