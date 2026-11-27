import { describe, expect, it } from "vitest";
import { makeCreature } from "../src/model/make";
import { GridWorld } from "../src/world/gridWorld";
import { Ruleset } from "../src/rules/ruleset";
import { scriptedDice } from "../src/rules/dice";
import { Shove } from "../src/actions/shove";
import type { Ctx } from "../src/actions/types";
import type { Cost } from "../src/model/effect";

// hero (STR +3, prof 2) -> DC 13, next to a goblin on its right
const hero = () => makeCreature({ id: "hero", name: "Hero", pos: { col: 2, row: 2 }, mod: { str: 3 } });
const goblin = () => makeCreature({ id: "gob", name: "Goblin", pos: { col: 3, row: 2 } });
const arena = (extra: Partial<ConstructorParameters<typeof GridWorld>[0]> = {}) => {
  const h = hero(), g = goblin();
  const world = new GridWorld({ cols: 10, rows: 8, creatures: [h, g], ...extra });
  return { h, g, world };
};
const ctx = (world: GridWorld, dice: number[], rules = new Ruleset()): Ctx => ({ world, rules, dice: scriptedDice(dice) });
const kinds = (fx: { kind: string }[]) => fx.map((e) => e.kind);

describe("Shove.canUse", () => {
  it("needs the target to be touching", () => {
    const { h, g, world } = arena();
    g.pos = { col: 5, row: 2 };
    expect(Shove.canUse(ctx(world, []), { actor: h, target: g, mode: "push" })).toEqual({ ok: false, reason: "ต้องอยู่ติดกัน" });
  });
  it("diagonal counts as touching", () => {
    const { h, g, world } = arena();
    g.pos = { col: 3, row: 3 };
    expect(Shove.canUse(ctx(world, []), { actor: h, target: g, mode: "push" }).ok).toBe(true);
  });
  it("allows one size bigger, refuses two", () => {
    const { h, g, world } = arena();
    g.size = "lg";
    expect(Shove.canUse(ctx(world, []), { actor: h, target: g, mode: "push" }).ok).toBe(true);
    g.size = "huge";
    expect(Shove.canUse(ctx(world, []), { actor: h, target: g, mode: "push" }).ok).toBe(false);
  });
  it("refuses when the actor cannot act", () => {
    const { h, g, world } = arena();
    h.conditions.push("stunned");
    expect(Shove.canUse(ctx(world, []), { actor: h, target: g, mode: "push" }).ok).toBe(false);
  });
});

describe("Shove.resolve", () => {
  it("target saves: only a log, nothing moves", () => {
    const { h, g, world } = arena();
    const fx = Shove.resolve(ctx(world, [18]), { actor: h, target: g, mode: "push" });   // 18 >= 13
    expect(kinds(fx)).toEqual(["spendCost", "log"]);
  });

  it("target fails: pushed 5 ft directly away", () => {
    const { h, g, world } = arena();
    const fx = Shove.resolve(ctx(world, [5]), { actor: h, target: g, mode: "push" });    // 5 < 13
    expect(fx.find((e) => e.kind === "push")).toEqual({ kind: "push", target: "gob", to: { col: 4, row: 2 } });
  });

  it("the log carries the breakdown: DC 13 = 8 + STR 3 + prof 2", () => {
    const { h, g, world } = arena();
    const log = Shove.resolve(ctx(world, [5]), { actor: h, target: g, mode: "push" }).find((e) => e.kind === "log");
    expect(log && log.kind === "log" && log.check?.dc).toBe(13);
    expect(log && log.kind === "log" && log.check?.dcParts.map((p) => p.value)).toEqual([8, 3, 2]);
  });

  it("prone mode knocks down instead of moving", () => {
    const { h, g, world } = arena();
    const fx = Shove.resolve(ctx(world, [5]), { actor: h, target: g, mode: "prone" });
    expect(kinds(fx)).toEqual(["spendCost", "log", "prone"]);
  });

  it("a wall behind the target stops the push", () => {
    const { h, g, world } = arena({ walls: [{ c: [400, 0, 400, 800] }] });   // between col 3 and col 4
    const fx = Shove.resolve(ctx(world, [5]), { actor: h, target: g, mode: "push" });
    expect(kinds(fx)).toEqual(["spendCost", "log"]);
  });

  it("a creature behind the target stops the push", () => {
    const { h, g, world } = arena({ creatures: [hero(), goblin(), makeCreature({ id: "x", pos: { col: 4, row: 2 } })] });
    const fx = Shove.resolve(ctx(world, [5]), { actor: world.creatures()[0], target: world.creatures()[1], mode: "push" });
    expect(kinds(fx)).toEqual(["spendCost", "log"]);
  });

  it("pushed off a 20 ft ledge: fall damage 2d6 and prone", () => {
    const { h, g, world } = arena({ heights: { "4,2": -20 } });
    const fx = Shove.resolve(ctx(world, [5, 3, 4]), { actor: h, target: g, mode: "push" });   // d20=5, then 3 + 4
    expect(fx.find((e) => e.kind === "damage")).toEqual({ kind: "damage", target: "gob", amount: 7, type: "bludgeoning" });
    expect(kinds(fx)).toContain("prone");
  });

  it("a flying target does not fall", () => {
    const { h, g, world } = arena({ heights: { "4,2": -20 } });
    g.tags.push("flying");
    const fx = Shove.resolve(ctx(world, [5]), { actor: h, target: g, mode: "push" });
    expect(kinds(fx)).not.toContain("damage");
  });

  it("paralyzed target auto-fails and no d20 is rolled", () => {
    const { h, g, world } = arena();
    g.conditions.push("paralyzed");
    const fx = Shove.resolve(ctx(world, []), { actor: h, target: g, mode: "push" });      // empty dice: would throw if rolled
    expect(kinds(fx)).toContain("push");
  });

  it("is pure: same input gives same effects and the world is untouched (preview)", () => {
    const { h, g, world } = arena();
    const a = Shove.resolve(ctx(world, [5]), { actor: h, target: g, mode: "push" });
    const b = Shove.resolve(ctx(world, [5]), { actor: h, target: g, mode: "push" });
    expect(b).toEqual(a);
    expect(g.pos).toEqual({ col: 3, row: 2 });
  });
});

describe("Ruleset variants", () => {
  it("a subclass can change cost and distance without touching the action", () => {
    class Variant extends Ruleset {
      costOf(id: string): Cost { return id === "shove" ? "bonus" : super.costOf(id); }
      pushFt() { return 10; }
    }
    const { h, g, world } = arena();
    const fx = Shove.resolve(ctx(world, [5], new Variant()), { actor: h, target: g, mode: "push" });
    expect(fx[0]).toEqual({ kind: "spendCost", actor: "hero", cost: "bonus" });
    expect(fx.find((e) => e.kind === "push")).toMatchObject({ to: { col: 5, row: 2 } });
  });
});

describe("GridWorld.apply", () => {
  it("applies push, prone, damage and returns the log", () => {
    const { h, g, world } = arena({ heights: { "4,2": -20 } });
    const lines = world.apply(Shove.resolve(ctx(world, [5, 3, 4]), { actor: h, target: g, mode: "push" }));
    expect(g.pos).toEqual({ col: 4, row: 2 });
    expect(g.hp.value).toBe(3);
    expect(g.conditions).toEqual(["prone"]);
    expect(lines.length).toBe(2);
    expect(world.spent).toEqual([{ actor: "hero", cost: "action" }]);
  });
});
