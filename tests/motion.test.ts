// The shared motion system (actions/motion.ts) and the second action built on it (Charge).
// The point: Shove and Charge use the SAME code for path, crashes, wall damage and falls; a new action only
// supplies who moves, how much energy it has, and the wording.
import { describe, expect, it, vi } from "vitest";
import { makeCreature, makeProp } from "../src/model/make";
import { GridWorld } from "../src/world/gridWorld";
import { Ruleset } from "../src/rules/ruleset";
import { RulesetPhysics } from "../src/rules/physicsRuleset";
import { scriptedDice } from "../src/rules/dice";
import { resolvePush } from "../src/rules/push";
import { runChain, runCrash } from "../src/rules/chain";
import { resolveMotion } from "../src/actions/motion";
import { Charge } from "../src/actions/charge";
import { Shove } from "../src/actions/shove";
import { ACTIONS } from "../src/actions";
import { Fx, type Effect } from "../src/model/effect";
import type { Creature } from "../src/model/creature";

const physics = new RulesetPhysics(), base = new Ruleset();
const kinds = (fx: Effect[]) => fx.map((e) => e.kind);
const logs = (fx: Effect[]) => fx.filter((e) => e.kind === "log").map((e) => (e as Extract<Effect, { kind: "log" }>).text);
const pushes = (fx: Effect[]) => fx.filter((e) => e.kind === "push").map((e) => (e as Extract<Effect, { kind: "push" }>));
const dmg = (fx: Effect[], who: string) => fx.filter((e) => e.kind === "damage" && e.target === who).map((e) => (e as Extract<Effect, { kind: "damage" }>).amount);

// hero (180 lb, speed 30) on col 1, goblin (60 lb) on col 5: three empty cells between them
const scene = (extra: Partial<ConstructorParameters<typeof GridWorld>[0]> = {}) => {
  const hero = makeCreature({ id: "hero", name: "Hero", pos: { col: 1, row: 3 }, mod: { str: 3 } });
  const gob = makeCreature({ id: "gob", name: "Goblin", pos: { col: 5, row: 3 }, size: "sm" });
  return { hero, gob, world: new GridWorld({ cols: 14, rows: 8, creatures: [hero, gob], ...extra }) };
};
const run = (world: GridWorld, a: Creature, t: Creature, rules: Ruleset, dice: number[] = [3, 3, 3, 3]) =>
  Charge.resolve({ world, rules, dice: scriptedDice(dice) }, { actor: a, target: t });

describe("resolveMotion works for any source of energy (no action involved)", () => {
  const blast = (rules: Ruleset, energy: number, dice: number[]) => {
    const body = makeCreature({ id: "b", name: "Bob", pos: { col: 1, row: 1 }, phys: undefined, mass: 100 } as never);
    const world = new GridWorld({ cols: 10, rows: 4, creatures: [body], walls: [{ c: [300, 0, 300, 400] }] });    // wall after col 2
    const out = resolveMotion({ world, rules, dice: scriptedDice(dice) }, {
      body, step: { col: 1, row: 0 }, cells: 5, energyAt: () => energy,
      describe: (r, note) => Fx.log(`Bob ถูกเหวี่ยง ${r.moved} ช่อง${note}`),
    });
    return { body, out };
  };
  it("flings a body into a wall: moves until the wall, hurt by its energy (2000 ft-lb / 100 lb = 20 ft of falling = 2d6)", () => {
    const { out } = blast(physics, 2000, [3, 4]);
    expect(out.moved).toBe(1);
    expect(pushes(out.fx)[0].to).toEqual({ col: 2, row: 1 });
    expect(dmg(out.fx, "b")).toEqual([7]);
    expect(logs(out.fx)[0]).toContain("หยุดเพราะติดกำแพง");
  });
  it("no energy = no wall damage (the 2024 behaviour), still stops at the wall", () => {
    const { out } = blast(base, 0, []);
    expect(out.moved).toBe(1);
    expect(dmg(out.fx, "b")).toEqual([]);
  });
  it("blocked at the first step: no effects, the action explains why", () => {
    const body = makeCreature({ id: "b", name: "Bob", pos: { col: 2, row: 1 } });
    const world = new GridWorld({ cols: 10, rows: 4, creatures: [body], walls: [{ c: [300, 0, 300, 400] }] });
    const out = resolveMotion({ world, rules: physics, dice: scriptedDice([]) }, { body, step: { col: 1, row: 0 }, cells: 3, energyAt: () => 999, describe: () => Fx.log("x") });
    expect(out).toMatchObject({ fx: [], moved: 0, stopped: "wall" });
  });
});

describe("runChain is now a thin wrapper over runCrash", () => {
  it("gives exactly the same answer", () => {
    const a = makeCreature({ id: "a", name: "A", pos: { col: 0, row: 0 }, mod: { str: 4 } });
    const t = makeCreature({ id: "t", name: "T", pos: { col: 1, row: 0 } });
    const crate = makeProp({ id: "c", name: "Crate", pos: { col: 3, row: 0 } });
    const world = new GridWorld({ cols: 12, rows: 2, creatures: [a, t], props: [crate] });
    const step = { col: 1, row: 0 };
    const first = resolvePush(world, t, step, 6);
    const viaShove = runChain(world, physics, a, t, first, step, {});
    const direct = runCrash(world, physics, { front: t, energy: physics.pushEnergy(a, t, first.moved * 5, {}), hit: first.hit, step });
    expect(viaShove).toBeDefined();
    expect(direct).toEqual(viaShove);
  });
});

describe("Charge.canUse", () => {
  const can = (a: Creature, t: Creature, world: GridWorld) => Charge.canUse({ world, rules: physics, dice: scriptedDice([]) }, { actor: a, target: t });
  it("ok with a clear run in a straight line", () => { const s = scene(); expect(can(s.hero, s.gob, s.world).ok).toBe(true); });
  it("needs at least one cell of run-up", () => {
    const s = scene(); s.gob.pos = { col: 2, row: 3 };
    expect(can(s.hero, s.gob, s.world)).toMatchObject({ ok: false, reason: expect.stringContaining("ระยะวิ่ง") });
  });
  it("cannot run further than its speed (30 ft = 6 cells of gap... but the gap is what is run)", () => {
    const s = scene(); s.gob.pos = { col: 9, row: 3 };                    // gap of 7 cells = 35 ft > speed 30
    expect(can(s.hero, s.gob, s.world).ok).toBe(false);
  });
  it("must really end up in the target: off the line is refused", () => {
    const s = scene(); s.gob.pos = { col: 5, row: 6 };
    expect(can(s.hero, s.gob, s.world).ok).toBe(false);
  });
  it("diagonals work", () => { const s = scene(); s.gob.pos = { col: 4, row: 6 }; expect(can(s.hero, s.gob, s.world).ok).toBe(true); });
  it("not while prone, flying, or unable to act; not yourself", () => {
    const s = scene(); s.hero.conditions.push("prone"); expect(can(s.hero, s.gob, s.world).ok).toBe(false);
    const f = scene(); f.hero.tags.push("flying"); expect(can(f.hero, f.gob, f.world).ok).toBe(false);
    const h = scene(); h.hero.hp.value = 0; expect(can(h.hero, h.gob, h.world).ok).toBe(false);
    const m = scene(); expect(can(m.hero, m.hero, m.world).ok).toBe(false);
  });
  it("a large charger (2x2) can hit a medium target", () => {
    const ogre = makeCreature({ id: "ogre", name: "Ogre", pos: { col: 1, row: 2 }, size: "lg", footprint: 2, speed: 40 });
    const g = makeCreature({ id: "gob", name: "Goblin", pos: { col: 6, row: 3 }, size: "sm" });
    expect(can(ogre, g, new GridWorld({ cols: 14, rows: 8, creatures: [ogre, g] })).ok).toBe(true);
  });
});

describe("Charge.resolve", () => {
  it("2024: runs up to the target and stops next to it; nothing else happens", () => {
    const s = scene(); const fx = run(s.world, s.hero, s.gob, base);
    expect(pushes(fx)).toEqual([{ kind: "push", target: "hero", to: { col: 4, row: 3 } }]);
    expect(kinds(fx)).not.toContain("damage");
  });
  it("physics: the charger crashes into the target and carries it along (hero 1 cell, goblin 1 cell)", () => {
    const s = scene(); const fx = run(s.world, s.hero, s.gob, physics);
    expect(pushes(fx)).toEqual([
      { kind: "push", target: "hero", to: { col: 5, row: 3 } },
      { kind: "push", target: "gob", to: { col: 6, row: 3 } },
    ]);
    expect(logs(fx)).toContain("Hero ชน Goblin");
  });
  it("physics: slippery ground under the charger = less grip = less speed = the target is not moved", () => {
    const s = scene({ surfaces: { "1,3": "oil", "2,3": "oil", "3,3": "oil", "4,3": "oil" } });
    const fx = run(s.world, s.hero, s.gob, physics);
    expect(pushes(fx).map((p) => p.target)).toEqual(["hero"]);
  });
  it("physics: a charge that sends the target off a 20 ft ledge hurts and knocks it prone", () => {
    const s = scene({ heights: { "6,3": -20, "7,3": -20 } });
    const fx = run(s.world, s.hero, s.gob, physics, [3, 3, 3]);
    expect(dmg(fx, "gob")).toEqual([1, 6]);                                // the crash (2 ft = 0.2 of a d6 -> 1), then the 20 ft fall (2d6 = 3 + 3)
    expect(fx).toContainEqual({ kind: "prone", target: "gob" });
  });
  it("physics: a heavy charger sends the same target much further than a light one does", () => {
    const mkOgre = () => makeCreature({ id: "ogre", name: "Ogre", pos: { col: 1, row: 2 }, size: "lg", footprint: 2, speed: 40, mod: { str: 4 } });
    const mkGob = () => makeCreature({ id: "gob", name: "Goblin", pos: { col: 6, row: 3 }, size: "sm" });
    const ogre = mkOgre(), g = mkGob();
    const fx = run(new GridWorld({ cols: 14, rows: 8, creatures: [ogre, g] }), ogre, g, physics);
    const gobMoved = pushes(fx).find((p) => p.target === "gob")!.to.col - 6;
    expect(gobMoved).toBe(2);                                              // hero would have moved a goblin 1 cell
    expect(dmg(fx, "gob")).toEqual([2]);                                   // open floor: only a bruise (5.5 ft of falling = 0.55 of a d6: 3 x 0.55 -> 2)
    expect(dmg(fx, "ogre")).toEqual([]);
  });
  it("physics: with a wall right behind, the pair slams into it and the light one takes the damage (3d6 + a bit)", () => {
    const ogre = makeCreature({ id: "ogre", name: "Ogre", pos: { col: 1, row: 2 }, size: "lg", footprint: 2, speed: 40, mod: { str: 4 } });
    const g = makeCreature({ id: "gob", name: "Goblin", pos: { col: 6, row: 3 }, size: "sm" });
    const world = new GridWorld({ cols: 14, rows: 8, creatures: [ogre, g], walls: [{ c: [800, 0, 800, 800] }] });
    const fx = run(world, ogre, g, physics, [4, 4, 4, 4, 4, 4]);
    expect(dmg(fx, "gob")).toEqual([2, 16]);                               // the crash bruise (5.5 ft -> 2), then the pair hits the wall: 39.4 ft = 3d6 (12) + 0.94 of a d6 (4 x 0.94 -> 4)
    expect(dmg(fx, "ogre")).toEqual([]);                                   // the heavy side feels almost nothing
  });
  it("physics: charging into a heavy immovable prop behind the target ends the chain without a push of the prop", () => {
    const s = scene({ props: [makeProp({ id: "statue", name: "Statue", pos: { col: 6, row: 3 }, tags: ["immovable"] })] });
    const fx = run(s.world, s.hero, s.gob, physics);
    expect(pushes(fx).map((p) => p.target)).not.toContain("statue");
  });
  it("a wall in the way stops the charger with only a bruise (a run-up is worth 3 ft of falling, not 10)", () => {
    const s = scene({ walls: [{ c: [300, 0, 300, 800] }] });             // between col 2 and col 3
    const fx = run(s.world, s.hero, s.gob, physics);
    expect(pushes(fx)).toEqual([{ kind: "push", target: "hero", to: { col: 2, row: 3 } }]);
    expect(logs(fx)[0]).toContain("ติดกำแพง");
    expect(dmg(fx, "hero")).toEqual([1]);                                  // 3 ft = 0.3 of a d6: 3 x 0.3 = 0.9 -> at least 1
  });
  it("pays the action cost from the rulebook", () => {
    class Bonus extends RulesetPhysics { costOf(id: string) { return id === "charge" ? ("bonus" as const) : super.costOf(id); } }
    const s = scene(); const fx = run(s.world, s.hero, s.gob, new Bonus());
    expect(fx[0]).toEqual({ kind: "spendCost", actor: "hero", cost: "bonus" });
  });
  it("is pure: running it twice gives the same effects and the world is untouched", () => {
    const s = scene(); const a = run(s.world, s.hero, s.gob, physics), b = run(s.world, s.hero, s.gob, physics);
    expect(b).toEqual(a); expect(s.hero.pos).toEqual({ col: 1, row: 3 });
  });
  it("applies cleanly to the in-memory world", () => {
    const s = scene({ heights: { "6,3": -20, "7,3": -20 } });
    s.world.apply(run(s.world, s.hero, s.gob, physics, [3, 3, 3]));
    expect(s.hero.pos).toEqual({ col: 5, row: 3 }); expect(s.gob.pos).toEqual({ col: 6, row: 3 });
    expect(s.gob.hp.value).toBe(3); expect(s.gob.conditions).toContain("prone");      // 10 - 1 (crash) - 6 (fall)
  });
});

describe("run energy (rules.runEnergy)", () => {
  const hero = makeCreature({ id: "h", mass: 180, speed: 30 } as never);
  it("grows with the run-up, then plateaus at top speed: E = W v^2 / 2g with v = speed x 1/2", () => {
    const e2 = physics.runEnergy(hero, 2), e10 = physics.runEnergy(hero, 10), e30 = physics.runEnergy(hero, 30);
    expect(e2).toBeLessThan(e10);
    expect(e10).toBeCloseTo(e30, 6);
    expect(e30).toBeCloseTo((180 * 15 * 15) / (2 * 32.17), 3);
  });
  it("oil needs a much longer run to reach the same energy; 2024 has none at all", () => {
    expect(physics.runEnergy(hero, 10, { actor: "oil" })).toBeLessThan(physics.runEnergy(hero, 10));
    expect(base.runEnergy(hero, 30)).toBe(0);
  });
  it("a faster or heavier creature carries more", () => {
    const fast = makeCreature({ id: "f", mass: 180, speed: 60 } as never), heavy = makeCreature({ id: "g", mass: 400, speed: 30 } as never);
    expect(physics.runEnergy(fast, 30)).toBeGreaterThan(physics.runEnergy(hero, 30));
    expect(physics.runEnergy(heavy, 30)).toBeGreaterThan(physics.runEnergy(hero, 30));
  });
  it("the trace explains it with numbers", () => {
    const steps: string[] = [];
    const s = scene();
    Charge.resolve({ world: s.world, rules: physics, dice: scriptedDice([3]), trace: (st, tx) => steps.push(`${st}|${tx}`) }, { actor: s.hero, target: s.gob });
    expect(steps.some((x) => x.startsWith("แรงพุ่ง|") && x.includes("E ="))).toBe(true);
    expect(steps.some((x) => x.startsWith("เส้นทาง|"))).toBe(true);
  });
});

describe("registry", () => {
  it("lists both actions", () => { expect(Object.keys(ACTIONS)).toEqual(["shove", "charge"]); expect(ACTIONS.charge).toBe(Charge); expect(ACTIONS.shove).toBe(Shove); });
});

void vi;
