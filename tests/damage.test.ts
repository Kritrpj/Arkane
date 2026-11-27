// How a knock turns into damage (Ruleset.bruise + the shared motion system) and the size-rule switch.
// Falls stay plain 5e (1d6 per whole 10 ft); knocks (crashes, walls) are smooth: whole d6 per 10 ft + the leftover as a fraction of one d6.
import { describe, expect, it } from "vitest";
import { makeCreature } from "../src/model/make";
import { GridWorld } from "../src/world/gridWorld";
import { Ruleset } from "../src/rules/ruleset";
import { RulesetPhysics } from "../src/rules/physicsRuleset";
import { scriptedDice } from "../src/rules/dice";
import { resolveMotion } from "../src/actions/motion";
import { Fx, type Effect } from "../src/model/effect";

const physics = new RulesetPhysics(), base = new Ruleset();

describe("Ruleset.bruise(h): feet of falling -> dice", () => {
  it("under the minimum (1 ft) is not even a bruise", () => {
    expect(base.bruise(0)).toMatchObject({ dice: 0, frac: 0 });
    expect(base.bruise(0.9)).toMatchObject({ dice: 0, frac: 0 });
  });
  it("from 1 ft up the leftover counts as a fraction of one die", () => {
    expect(base.bruise(1)).toMatchObject({ dice: 0, frac: 0.1 });
    expect(base.bruise(5)).toMatchObject({ dice: 0, frac: 0.5 });
    expect(base.bruise(9.9).frac).toBeCloseTo(0.99);
  });
  it("whole dice per 10 ft plus the leftover", () => {
    expect(base.bruise(10)).toMatchObject({ dice: 1, frac: 0 });
    expect(base.bruise(25)).toMatchObject({ dice: 2, frac: 0.5 });
    expect(base.bruise(39.4).dice).toBe(3);
    expect(base.bruise(39.4).frac).toBeCloseTo(0.94);
  });
  it("capped at 20 dice with no leftover", () => {
    expect(base.bruise(500)).toMatchObject({ dice: 20, frac: 0 });
  });
  it("falls are still plain 5e: whole 10 ft only", () => {
    expect(base.fall(9.9).dice).toBe(0);
    expect(base.fall(15).dice).toBe(1);
    expect(base.fall(20).dice).toBe(2);
  });
});

describe("a knock turns into damage through the motion system", () => {
  // a 100 lb body flung into a wall one cell away with a constant energy (so we control h = E / 100 lb)
  const slam = (energy: number, dice: number[], rules: Ruleset = physics) => {
    const body = makeCreature({ id: "b", name: "Bob", pos: { col: 1, row: 1 }, mass: 100 } as never);
    const world = new GridWorld({ cols: 10, rows: 4, creatures: [body], walls: [{ c: [300, 0, 300, 400] }] });
    const steps: string[] = [];
    const out = resolveMotion({ world, rules, dice: scriptedDice(dice), trace: (s, t) => steps.push(`${s}|${t}`) }, {
      body, step: { col: 1, row: 0 }, cells: 5, energyAt: () => energy, describe: (r, note) => Fx.log(`Bob ${r.moved}${note}`),
    });
    const hits = out.fx.filter((e): e is Extract<Effect, { kind: "damage" }> => e.kind === "damage").map((e) => e.amount);
    return { hits, steps, out };
  };
  it("a small knock still hurts: 5 ft = 0.5 of a d6 (roll 4 -> 2)", () => {
    expect(slam(500, [4]).hits).toEqual([2]);
  });
  it("never less than 1 once it counts: 1 ft = 0.1 of a d6 (roll 1 -> 0.1 -> 1)", () => {
    expect(slam(100, [1]).hits).toEqual([1]);
  });
  it("below the minimum: no damage, no dice rolled", () => {
    const r = slam(90, []);                                         // empty dice would throw if anything were rolled
    expect(r.hits).toEqual([]);
    expect(r.steps.some((s) => s.includes("ต่ำกว่าขั้นต่ำ"))).toBe(true);
  });
  it("whole dice plus the leftover: 25 ft = 2d6 + 0.5 of a d6 (3 + 3, then roll 6 -> 3)", () => {
    expect(slam(2500, [3, 3, 6]).hits).toEqual([9]);
  });
  it("the harness trace shows the formula with the numbers", () => {
    const line = slam(500, [4]).steps.find((s) => s.startsWith("กระแทกกำแพง|") && s.includes("n ="))!;
    expect(line).toContain("5 ÷ 10 = 0.5");
    expect(line).toContain("ทอย 4 × 0.5 = 2");
    expect(line).toContain("= 2 ดาเมจ");
  });
  it("the 2024 rulebook has no knock damage at all (the source gives it no energy)", () => {
    expect(slam(0, [], base).hits).toEqual([]);
  });
});

describe("explainDamage (the harness help text, numbers from data/)", () => {
  it("2024 says there is no knock damage", () => {
    expect(base.explainDamage().join(" ")).toContain("ไม่ทำดาเมจ");
  });
  it("physics lists every step with the real numbers", () => {
    const text = physics.explainDamage().join("\n");
    expect(text).toContain("10 ฟุต");                                           // the 10 ft per die
    for (const w of ["พลังงานตอนชน", "ชนแบบไม่ยืดหยุ่น", "ชนกำแพง", "n = h ÷ 10", "อย่างน้อย 1", "20d6", "ตกขอบ"]) expect(text).toContain(w);
    expect(text).toContain("ต่ำกว่า 1 ฟุต");
  });
});

describe("size rule switch (RulesetPhysics option)", () => {
  const small = makeCreature({ id: "s", size: "sm" }), large = makeCreature({ id: "l", size: "lg" });
  it("on by default: 5e allows at most one size larger", () => {
    expect(physics.canShoveSize(small, large)).toBe(false);
    expect(physics.canShoveSize(small, makeCreature({ id: "m", size: "med" }))).toBe(true);
  });
  it("off: weight and grip decide, size no longer forbids", () => {
    expect(new RulesetPhysics({ sizeRule: false }).canShoveSize(small, large)).toBe(true);
  });
  it("a small strong creature: lots of force, little grip -> barely moves a human; dense it does", () => {
    const human = makeCreature({ id: "h", size: "med" });
    const light = makeCreature({ id: "s", size: "sm", mod: { str: 5 } });                       // STR 20, 60 lb
    const dense = makeCreature({ id: "s", size: "sm", mod: { str: 5 }, mass: 250, massSource: "override" });
    expect(physics.pushFt(light, human, {})).toBeCloseTo(2.5, 1);
    expect(physics.pushFt(dense, human, {})).toBeCloseTo(8.33, 1);
  });
});
