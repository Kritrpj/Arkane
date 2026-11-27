import { describe, expect, it } from "vitest";
import { makeCreature } from "../src/model/make";
import { GridWorld } from "../src/world/gridWorld";
import { Ruleset } from "../src/rules/ruleset";
import { RulesetPhysics } from "../src/rules/physicsRuleset";
import { energyLeft, impactHeightFt, pushDistanceFt, type Slide } from "../src/rules/physics";
import { massFromHeight, parseHeightFt, parseWeightLb, resolveMass } from "../src/rules/mass";
import { scriptedDice } from "../src/rules/dice";
import { Shove } from "../src/actions/shove";

const slide = (o: Partial<Slide> = {}): Slide => ({ forceLb: 480, weightLb: 190, mu: 0.6, strokeFt: 1.5, ...o });

describe("work-energy push", () => {
  it("the plan's example: STR 16 (480 lb) vs 190 lb on mu 0.6 goes about 6.3 ft (the plan said 6.4: its formula forgot the stroke itself)", () => {
    expect(pushDistanceFt(slide())).toBeCloseTo(6.32, 1);
  });
  it("F <= mu*W does not budge (the statue case needs no special rule)", () => {
    expect(pushDistanceFt(slide({ weightLb: 800 }))).toBe(0);       // mu W = 480 = F
    expect(pushDistanceFt(slide({ weightLb: 5000 }))).toBe(0);
  });
  it("more friction or more mass never makes it go farther", () => {
    for (let a = 0.05; a < 1.5; a += 0.05) expect(pushDistanceFt(slide({ mu: a + 0.05 }))).toBeLessThanOrEqual(pushDistanceFt(slide({ mu: a })));
    for (let w = 20; w < 1200; w += 20) expect(pushDistanceFt(slide({ weightLb: w + 20 }))).toBeLessThanOrEqual(pushDistanceFt(slide({ weightLb: w })));
  });
  it("more force never makes it go less far", () => {
    for (let f = 100; f < 3000; f += 100) expect(pushDistanceFt(slide({ forceLb: f + 100 }))).toBeGreaterThanOrEqual(pushDistanceFt(slide({ forceLb: f })));
  });
  it("energy: zero at the start, continuous at the end of the stroke, zero when it stops", () => {
    const s = slide(), d = pushDistanceFt(s);
    expect(energyLeft(s, 0)).toBe(0);
    expect(energyLeft(s, s.strokeFt - 1e-9)).toBeCloseTo(energyLeft(s, s.strokeFt + 1e-9), 3);
    expect(energyLeft(s, d)).toBeCloseTo(0, 6);
    expect(energyLeft(s, d + 5)).toBe(0);
  });
  it("hitting something sooner means hitting harder (after the stroke)", () => {
    const s = slide({ forceLb: 2000 });
    expect(energyLeft(s, 3)).toBeGreaterThan(energyLeft(s, 8));
  });
  it("impact height = E / W", () => { expect(impactHeightFt(1900, 190)).toBe(10); });
});

describe("mass", () => {
  it("priority: override > weight > height > size table", () => {
    expect(resolveMass({ override: 500, weightLb: 100, heightFt: 6, size: "med" })).toEqual({ mass: 500, source: "override" });
    expect(resolveMass({ weightLb: 100, heightFt: 6, size: "med" })).toEqual({ mass: 100, source: "weight" });
    expect(resolveMass({ heightFt: 5.8, size: "med" }).source).toBe("height");
    expect(resolveMass({ size: "lg" })).toEqual({ mass: 900, source: "size" });
  });
  it("garbage falls through to the next source", () => {
    expect(resolveMass({ override: NaN, weightLb: -3, heightFt: 0, size: "sm" })).toEqual({ mass: 60, source: "size" });
  });
  it("height cube law: reference human is itself, double height is 8x", () => {
    expect(massFromHeight(5.8)).toBeCloseTo(180, 5);
    expect(massFromHeight(11.6)).toBeCloseTo(1440, 5);
  });
  it("parses sheet text", () => {
    expect(parseWeightLb("180 lb")).toBe(180);
    expect(parseWeightLb("80kg")).toBeCloseTo(176.4, 0);
    expect(parseWeightLb({ value: 150, units: "lb" })).toBe(150);
    expect(parseWeightLb("unknown")).toBeUndefined();
    expect(parseHeightFt(`5'10"`)).toBeCloseTo(5.83, 2);
    expect(parseHeightFt("6 ft")).toBe(6);
    expect(parseHeightFt("1.8 m")).toBeCloseTo(5.91, 1);
    expect(parseHeightFt("180cm")).toBeCloseTo(5.91, 1);
    expect(parseHeightFt("tall")).toBeUndefined();
  });
});

describe("RulesetPhysics", () => {
  const rules = new RulesetPhysics();
  const human = (o = {}) => makeCreature({ id: "h", mod: { str: 3 }, ...o });          // STR 16, 180 lb

  it("STR 16 human vs equal human: one cell", () => {
    const ft = rules.pushFt(human(), human({ id: "t" }));
    expect(ft).toBeGreaterThan(5); expect(ft).toBeLessThan(8);
    expect(rules.cellsFor(ft, 5)).toBe(1);
  });
  it("a halfling cannot budge an armoured human (light pusher: traction limit)", () => {
    const halfling = makeCreature({ id: "p", size: "sm", mod: { str: -1 } });
    expect(rules.cellsFor(rules.pushFt(halfling, human({ id: "t", mass: 220 })), 5)).toBe(0);
  });
  it("oil under the pusher: no traction, no push. oil under the target: it slides far", () => {
    const a = human(), t = human({ id: "t" });
    expect(rules.pushFt(a, t, { actor: "oil" })).toBe(0);
    expect(rules.pushFt(a, t, { target: "oil" })).toBeGreaterThan(rules.pushFt(a, t) * 3);
  });
  it("stronger or heavier pusher goes farther; heavier target goes less far", () => {
    const t = human({ id: "t" });
    expect(rules.pushFt(human({ mod: { str: 5 } }), t)).toBeGreaterThanOrEqual(rules.pushFt(human(), t));
    expect(rules.pushFt(human(), human({ id: "t", mass: 400 }))).toBeLessThan(rules.pushFt(human(), t));
  });
  it("size multiplies force: an ogre (lg) pushes farther than a human of the same STR", () => {
    const ogre = makeCreature({ id: "o", size: "lg", mod: { str: 3 } }), t = human({ id: "t" });
    expect(rules.pushFt(ogre, t)).toBeGreaterThan(rules.pushFt(human(), t));
  });
  it("rounding: nearest by default, floor on request (9.8 ft -> 2 vs 1)", () => {
    expect(rules.cellsFor(9.8, 5)).toBe(2);
    expect(new RulesetPhysics({ rounding: "floor" }).cellsFor(9.8, 5)).toBe(1);
    expect(rules.cellsFor(2.5, 5)).toBe(0);                          // exactly half a cell: down
    expect(rules.cellsFor(2.6, 5)).toBe(1);
    expect(new Ruleset().cellsFor(5, 5)).toBe(1);
  });
});

describe("Shove with RulesetPhysics", () => {
  const rules = new RulesetPhysics();
  const arena = (actor: Parameters<typeof makeCreature>[0], target: Parameters<typeof makeCreature>[0], extra = {}) => {
    const a = makeCreature({ id: "a", pos: { col: 2, row: 2 }, ...actor });
    const t = makeCreature({ id: "t", pos: { col: 3, row: 2 }, ...target });
    return { a, t, world: new GridWorld({ cols: 14, rows: 6, creatures: [a, t], ...extra }) };
  };
  const run = (w: GridWorld, a: any, t: any, dice: number[]) =>
    Shove.resolve({ world: w, rules, dice: scriptedDice(dice) }, { actor: a, target: t, mode: "push" });
  const kinds = (fx: { kind: string }[]) => fx.map((e) => e.kind);

  it("a statue (5000 lb) does not move even when its save fails", () => {
    const { a, t, world } = arena({ mod: { str: 3 } }, { mass: 5000 });
    const fx = run(world, a, t, [1]);
    expect(kinds(fx)).not.toContain("push");
    expect(fx.some((e) => e.kind === "log" && e.text.includes("ขยับไม่ไหว"))).toBe(true);
  });
  it("equal humans: pushed one cell, same as the plain rules", () => {
    const { a, t, world } = arena({ mod: { str: 3 } }, {});
    expect(run(world, a, t, [1]).find((e) => e.kind === "push")).toMatchObject({ to: { col: 4, row: 2 } });
  });
  it("a giant throws a human far: several cells in one shove", () => {
    const { a, t, world } = arena({ size: "huge", mod: { str: 6 } }, {});
    const push = run(world, a, t, [1]).find((e) => e.kind === "push") as any;
    expect(push.to.col - 3).toBeGreaterThanOrEqual(5);
  });
  it("a giant slams a human into a wall: impact (~19 ft equivalent) = 1d6 + 0.9 of a d6", () => {
    const { a, t, world } = arena({ size: "huge", mod: { str: 6 } }, {}, { walls: [{ c: [500, 0, 500, 600] }] });
    const fx = run(world, a, t, [1, 5, 6]);                         // d20 fails the save, 1d6 = 5, then the leftover die = 6 (6 x 0.9 = 5.4 -> 5)
    expect(fx.find((e) => e.kind === "damage")).toEqual({ kind: "damage", target: "t", amount: 10, type: "bludgeoning" });
    expect(fx.find((e) => e.kind === "push")).toMatchObject({ to: { col: 4, row: 2 } });
  });
  it("a gentle push into a wall does no damage and rolls no extra dice", () => {
    const { a, t, world } = arena({ mod: { str: 3 } }, {}, { walls: [{ c: [500, 0, 500, 600] }] });
    expect(kinds(run(world, a, t, [1]))).not.toContain("damage");   // would throw if it rolled more dice
  });
  it("oil under the pusher: shove fails to move anything", () => {
    const { a, t, world } = arena({ mod: { str: 3 } }, {}, { surfaces: { "2,2": "oil" } });
    expect(kinds(run(world, a, t, [1]))).not.toContain("push");
  });
  it("is pure: the same input gives the same effects", () => {
    const { a, t, world } = arena({ size: "huge", mod: { str: 6 } }, {});
    expect(run(world, a, t, [1])).toEqual(run(world, a, t, [1]));
  });
});
