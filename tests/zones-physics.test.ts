// The zones work and the physics/damage work meet here: an oil Zone must slow a shove down exactly like the old
// per-cell "oil" surface did, and a Zone must not disturb the new impact damage.
import { describe, expect, it } from "vitest";
import { makeCreature } from "../src/model/make";
import { GridWorld } from "../src/world/gridWorld";
import { RulesetPhysics } from "../src/rules/physicsRuleset";
import { scriptedDice } from "../src/rules/dice";
import { makeZone } from "../src/rules/zones";
import { Shove } from "../src/actions/shove";
import { Charge } from "../src/actions/charge";
import { groundOf } from "../src/actions/shove";
import type { Effect } from "../src/model/effect";

const physics = new RulesetPhysics();
const pushCol = (fx: Effect[], id: string) => (fx.find((e) => e.kind === "push" && e.target === id) as Extract<Effect, { kind: "push" }> | undefined)?.to.col;
const oilRow3 = () => makeZone({ kind: "oil", shapes: [{ type: "rect", x: 10, y: 15, w: 50, h: 5 }] });      // feet: cols 2..11 of row 3

describe("oil Zone x physics", () => {
  const stage = (extra: object) => {
    const hero = makeCreature({ id: "hero", name: "Hero", pos: { col: 2, row: 3 }, mod: { str: 3 } });
    const bob = makeCreature({ id: "bob", name: "Bob", pos: { col: 3, row: 3 } });
    return { hero, bob, world: new GridWorld({ cols: 14, rows: 6, creatures: [hero, bob], ...extra }) };
  };
  const shove = (s: ReturnType<typeof stage>) =>
    Shove.resolve({ world: s.world, rules: physics, dice: scriptedDice([1, 3, 3, 3]) }, { actor: s.hero, target: s.bob, mode: "push" });

  it("a Zone is seen as the surface under the target", () => {
    expect(stage({ zones: [oilRow3()] }).world.surfaceAt({ col: 3, row: 3 })).toBe("oil");
  });
  it("oil from a Zone changes the push distance exactly like the old per-cell surface (compared in continuous feet, not rounded cells)", () => {
    const ft = (extra: object) => { const s = stage(extra); return physics.pushFt(s.hero, s.bob, groundOf(s.world, s.hero, s.bob)); };
    const cells: Record<string, string> = {}; for (let c = 2; c <= 11; c++) cells[`${c},3`] = "oil";
    const dry = ft({}), viaZone = ft({ zones: [oilRow3()] }), viaCells = ft({ surfaces: cells });
    expect(viaZone).not.toBeCloseTo(dry, 1);               // 6.7 ft dry vs 7.5 ft on oil (both round to 1 cell, so cells alone would hide it)
    expect(viaZone).toBeCloseTo(viaCells, 6);
  });
  it("charging across oil only under the charger is weaker than on dry ground (less grip, less speed)", () => {
    const run = (extra: object) => {
      const hero = makeCreature({ id: "hero", name: "Hero", pos: { col: 1, row: 3 }, mod: { str: 3 } });
      const gob = makeCreature({ id: "gob", name: "Goblin", pos: { col: 5, row: 3 }, size: "sm" });
      const world = new GridWorld({ cols: 14, rows: 6, creatures: [hero, gob], ...extra });
      return Charge.resolve({ world, rules: physics, dice: scriptedDice([3, 3, 3, 3]) }, { actor: hero, target: gob });
    };
    expect(pushCol(run({}), "gob")).toBe(6);
    expect(pushCol(run({ zones: [makeZone({ kind: "oil", shapes: [{ type: "rect", x: 5, y: 15, w: 20, h: 5 }] })] }), "gob")).toBeUndefined();   // oil on cols 1..4 only: the goblin stands on dry floor
  });
});
