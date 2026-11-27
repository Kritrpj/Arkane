// Phase B: a pushed creature hits another creature or a prop. Pure numbers first, then whole Shoves.
import { describe, expect, it } from "vitest";
import { makeCreature, makeProp } from "../src/model/make";
import { GridWorld } from "../src/world/gridWorld";
import { Ruleset } from "../src/rules/ruleset";
import { RulesetPhysics } from "../src/rules/physicsRuleset";
import { collide } from "../src/rules/physics";
import { resolvePropMass } from "../src/rules/propMass";
import { resolvePush } from "../src/rules/push";
import { runChain } from "../src/rules/chain";
import { PUSH } from "../src/data/push";
import { scriptedDice } from "../src/rules/dice";
import { Shove } from "../src/actions/shove";
import type { Effect } from "../src/model/effect";

describe("prop mass", () => {
  it("wood crate, 1 cell, 5 ft tall = 40 lb/ft3 x 125 ft3 x 0.05 fill = 250 lb", () => {
    expect(resolvePropMass({ footprint: 1, cellFt: 5, heightFt: 5, material: "wood" })).toEqual({ mass: 250, source: "material" });
  });
  it("same box in other materials: stone is solid-ish, iron is hollow-but-dense", () => {
    expect(resolvePropMass({ footprint: 1, cellFt: 5, heightFt: 5, material: "stone" }).mass).toBe(10000);
    expect(resolvePropMass({ footprint: 1, cellFt: 5, heightFt: 5, material: "iron" }).mass).toBeCloseTo(3062.5, 5);
  });
  it("override wins; unknown material and garbage numbers fall back to the defaults", () => {
    expect(resolvePropMass({ override: 90, material: "stone", footprint: 1, cellFt: 5 })).toEqual({ mass: 90, source: "override" });
    expect(resolvePropMass({ material: "unobtainium", heightFt: NaN, footprint: 1, cellFt: 5 }).mass).toBe(250);
    expect(resolvePropMass({ material: "wood", fill: 7, footprint: 1, cellFt: 5 }).mass).toBe(250);       // fill must be 0..1
  });
  it("taller = proportionally heavier, 2x2 footprint = 4x heavier, fill override scales it", () => {
    const base = resolvePropMass({ footprint: 1, cellFt: 5, heightFt: 5 }).mass;
    expect(resolvePropMass({ footprint: 1, cellFt: 5, heightFt: 10 }).mass).toBe(base * 2);
    expect(resolvePropMass({ footprint: 2, cellFt: 5, heightFt: 5 }).mass).toBe(base * 4);
    expect(resolvePropMass({ footprint: 1, cellFt: 5, heightFt: 5, fill: 0.1 }).mass).toBe(base * 2);
  });
});

describe("collide() (inelastic)", () => {
  const mu = 0.6, E = 4000;
  it("energy is conserved: lost = what the two sides absorb, rest = what the pair slides off", () => {
    for (const m2 of [20, 180, 900, 5000]) {
      const c = collide(E, 180, m2, mu), total = 180 + m2;
      const lost = c.moverFt * 180 + c.struckFt * m2, rest = c.slideFt * mu * total;
      expect(lost + rest).toBeCloseTo(E, 6);
    }
  });
  it("a heavier struck body: the mover is hurt more, the pair slides less", () => {
    let prev = collide(E, 180, 10, mu);
    for (let m2 = 20; m2 <= 20000; m2 *= 1.5) {
      const c = collide(E, 180, m2, mu);
      expect(c.moverFt).toBeGreaterThanOrEqual(prev.moverFt - 1e-9);
      expect(c.slideFt).toBeLessThanOrEqual(prev.slideFt + 1e-9);
      prev = c;
    }
  });
  it("a very heavy struck body hurts the mover like a wall does (h = E / W)", () => {
    expect(collide(E, 180, 1e9, mu).moverFt).toBeCloseTo(E / 180, 3);
    expect(collide(E, 180, Infinity, mu)).toMatchObject({ moverFt: E / 180, struckFt: 0, slideFt: 0, rest: 0 });
  });
  it("more energy never hurts less or slides less", () => {
    for (let e = 100; e < 8000; e += 300) {
      const a = collide(e, 180, 250, mu), b = collide(e + 300, 180, 250, mu);
      expect(b.moverFt).toBeGreaterThanOrEqual(a.moverFt); expect(b.slideFt).toBeGreaterThanOrEqual(a.slideFt);
    }
  });
  it("no energy, no crash", () => { expect(collide(0, 180, 250, mu)).toMatchObject({ moverFt: 0, struckFt: 0, slideFt: 0 }); });
});

describe("resolvePush sees props", () => {
  const crate = makeProp({ id: "crate", pos: { col: 5, row: 2 } });
  const t = makeCreature({ id: "t", pos: { col: 3, row: 2 } });
  const world = new GridWorld({ cols: 14, rows: 6, creatures: [t], props: [crate] });
  it("stops in front of a prop and says which one", () => {
    const r = resolvePush(world, t, { col: 1, row: 0 }, 5);
    expect(r).toMatchObject({ moved: 1, stopped: "prop", to: { col: 4, row: 2 } });
    expect(r.hit?.id).toBe("crate");
  });
  it("a thing in the ignore list is not an obstacle", () => {
    expect(resolvePush(world, t, { col: 1, row: 0 }, 3, ["crate"])).toMatchObject({ moved: 3, stopped: null });
  });
  it("a prop can be pushed too (same function)", () => {
    expect(resolvePush(world, crate, { col: 1, row: 0 }, 2)).toMatchObject({ moved: 2, to: { col: 7, row: 2 } });
  });
});

describe("Shove into creatures and props", () => {
  const physics = new RulesetPhysics();
  const giant = (o = {}) => makeCreature({ id: "a", name: "Giant", size: "huge", mod: { str: 6 }, pos: { col: 2, row: 2 }, ...o });
  const victim = (o = {}) => makeCreature({ id: "t", name: "Victim", pos: { col: 3, row: 2 }, ...o });
  const run = (rules: Ruleset, world: GridWorld, a: any, t: any, dice: number[]): Effect[] =>
    Shove.resolve({ world, rules, dice: scriptedDice(dice) }, { actor: a, target: t, mode: "push" });
  const find = (fx: Effect[], kind: string, target?: string) =>
    fx.find((e) => e.kind === kind && (target === undefined || (e as any).target === target)) as any;
  const logs = (fx: Effect[]) => fx.filter((e) => e.kind === "log").map((e) => (e as any).text as string);
  const setup = (rules: Ruleset, o: { props?: any[]; others?: any[]; walls?: any[]; heights?: any } = {}, a = giant(), t = victim()) => {
    const world = new GridWorld({ cols: 14, rows: 6, creatures: [a, t, ...(o.others ?? [])], props: o.props ?? [], walls: o.walls, heights: o.heights });
    return { world, a, t, fx: (dice = [1, 3, 3, 3, 3]) => run(rules, world, a, t, dice) };
  };

  it("2024 rules: a creature in the way just stops the push. Nothing is hurt, nothing is carried", () => {
    const bob = makeCreature({ id: "b", name: "Bob", pos: { col: 4, row: 2 } });
    const s = setup(new Ruleset(), { others: [bob] });
    expect(s.fx([1]).map((e) => e.kind)).not.toContain("damage");
    const crate = makeProp({ id: "c", pos: { col: 5, row: 2 } });
    const p = setup(new Ruleset(), { props: [crate] }, makeCreature({ id: "a", mod: { str: 3 }, pos: { col: 2, row: 2 } }));
    expect(find(p.fx([1]), "push", "c")).toBeUndefined();
  });

  it("physics: a thrown victim shoves a light crate along and follows it", () => {
    const crate = makeProp({ id: "crate", name: "Crate", pos: { col: 6, row: 2 } });
    const fx = setup(physics, { props: [crate] }).fx();
    const crateMove = find(fx, "push", "crate"), victimMove = find(fx, "push", "t");
    expect(crateMove.to.col).toBeGreaterThan(6);
    expect(victimMove.to.col).toBe(crateMove.to.col - 1);               // still right behind it
    expect(victimMove.to.row).toBe(2);
    expect(logs(fx).some((l) => l.includes("ชน Crate"))).toBe(true);
  });

  it("physics: a crate that falls into a pit takes no damage; the log says it fell", () => {
    const crate = makeProp({ id: "crate", name: "Crate", pos: { col: 6, row: 2 } });
    const fx = setup(physics, { props: [crate], heights: { "7,2": -20 } }).fx();
    expect(find(fx, "damage", "crate")).toBeUndefined();
    expect(logs(fx).some((l) => l.includes("Crate ตกลงมา 20 ฟุต"))).toBe(true);
  });

  it("physics: a struck creature is carried along too, and the one who falls takes fall damage + prone", () => {
    const bob = makeCreature({ id: "b", name: "Bob", pos: { col: 5, row: 2 } });
    const fx = setup(physics, { others: [bob], heights: { "7,2": -20 } }).fx([1, 4, 4, 4, 4]);
    expect(find(fx, "push", "b").to.col).toBeGreaterThanOrEqual(6);
    expect(find(fx, "prone", "b")).toBeDefined();                       // Bob went over the edge
    // two hits on Bob: the crash (4.8 ft of falling = 0.48 of a d6: 4 x 0.48 -> 2), then the 20 ft fall (plain 5e: 2d6 = 4 + 4)
    const hits = fx.filter((e) => e.kind === "damage" && (e as any).target === "b").map((e) => (e as any).amount);
    expect(hits).toEqual([2, 8]);
  });

  it("physics: a heavy statue is not moved, and hitting it hurts like a wall", () => {
    const statue = makeProp({ id: "st", name: "Statue", material: "stone", pos: { col: 6, row: 2 } });
    const wall = setup(physics, { walls: [{ c: [600, 0, 600, 600] }] }, giant(), victim()).fx([1, 5, 6]);
    const hit = setup(physics, { props: [statue] }, giant(), victim()).fx([1, 5, 6]);
    expect(find(hit, "push", "st")).toBeUndefined();
    expect(find(hit, "push", "t").to.col).toBe(find(wall, "push", "t").to.col);       // stops at the same cell as the wall
    expect(find(hit, "damage", "t")?.amount).toBe(8);      // 15.4 ft = 1d6 (5) + 0.54 of a d6 (6 x 0.54 = 3.2 -> 3). The wall gives 16 ft = 5 + 4 = 9: nearly the same''
    expect(find(wall, "damage", "t")?.amount).toBe(9);
  });

  it("an \"immovable\" prop acts exactly like a wall even if it is light", () => {
    const post = makeProp({ id: "post", name: "Post", mass: 5, tags: ["prop", "immovable"], pos: { col: 6, row: 2 } });
    const fx = setup(physics, { props: [post] }).fx([1, 5, 6]);
    expect(find(fx, "push", "post")).toBeUndefined();
    expect(find(fx, "damage", "t")?.amount).toBe(9);      // 16 ft: 1d6 (5) + 0.6 of a d6 (6 x 0.6 = 3.6 -> 4), exactly the wall's number
  });

  it("a hard crash hurts the struck creature too: a pixie hit by a human thrown by a STR 30 giant", () => {
    const pixie = makeCreature({ id: "p", name: "Pixie", size: "tiny", pos: { col: 5, row: 2 } });
    const fx = setup(physics, { others: [pixie] }, giant({ mod: { str: 10 } })).fx([1, 6, 6, 6, 6, 6, 6]);
    expect(find(fx, "damage", "p")).toMatchObject({ amount: 15, type: "bludgeoning" });       // 24.2 ft: 2d6 (6 + 6) + 0.42 of a d6 (6 x 0.42 = 2.5 -> 3)
    expect(find(fx, "damage", "t")).toBeUndefined();                                           // the heavier body barely feels it
  });

  it("a gentle push that never reaches the creature behind it does nothing special", () => {
    const bob = makeCreature({ id: "b", pos: { col: 9, row: 2 } });
    const a = makeCreature({ id: "a", mod: { str: 3 }, pos: { col: 2, row: 2 } });
    const fx = setup(physics, { others: [bob] }, a).fx([1]);
    expect(find(fx, "push", "b")).toBeUndefined();
    expect(logs(fx).some((l) => l.includes("ชน"))).toBe(false);
  });

  it("is pure: the same input gives the same effects", () => {
    const crate = makeProp({ id: "crate", pos: { col: 6, row: 2 } });
    const s = setup(physics, { props: [crate] });
    expect(s.fx()).toEqual(s.fx());
  });

  it("wall damage still comes from impactFt, now smooth: whole d6 per 10 ft plus the leftover", () => {
    const fx = setup(physics, { walls: [{ c: [500, 0, 500, 600] }] }).fx([1, 5, 6]);
    expect(find(fx, "damage", "t")).toEqual({ kind: "damage", target: "t", amount: 10, type: "bludgeoning" });   // 19 ft: 1d6 (5) + 0.9 of a d6 (6 x 0.9 = 5.4 -> 5)
  });
});

describe("chain: the crash keeps going", () => {
  const physics = new RulesetPhysics();
  const giant = () => makeCreature({ id: "a", name: "Giant", size: "huge", mod: { str: 6 }, pos: { col: 0, row: 2 } });
  const victim = () => makeCreature({ id: "t", name: "Victim", pos: { col: 1, row: 2 } });
  const line = (n: number) => Array.from({ length: n }, (_, i) =>
    makeCreature({ id: `b${i}`, name: `B${i}`, pos: { col: 4 + i, row: 2 } }));
  const chainOf = (world: GridWorld, a: any, t: any) => {
    const first = resolvePush(world, t, { col: 1, row: 0 }, physics.cellsFor(physics.pushFt(a, t), world.cellFt));
    return { first, chain: runChain(world, physics, a, t, first, { col: 1, row: 0 }, {}) };
  };

  it("a crate that is itself blocked crashes into the creature behind it (energy is not lost silently)", () => {
    const crate = makeProp({ id: "crate", name: "Crate", pos: { col: 4, row: 2 } });
    const rat = makeCreature({ id: "r", name: "Rat", size: "tiny", pos: { col: 5, row: 2 } });
    const a = giant(), t = victim();
    const world = new GridWorld({ cols: 14, rows: 6, creatures: [a, t, rat], props: [crate] });
    const { chain } = chainOf(world, a, t);
    expect(chain!.bumps.map((b) => `${b.front.id}>${b.hit.id}`)).toEqual(["t>crate", "crate>r"]);
    expect(chain!.hurt.some((h) => h.who.id === "r")).toBe(true);
  });

  it("the train never gives up more energy than the push had", () => {
    for (const n of [1, 2, 3]) for (const str of [4, 6, 10]) {
      const a = makeCreature({ ...giant(), mod: { str } }), t = victim(), crowd = line(n);
      const world = new GridWorld({ cols: 20, rows: 6, creatures: [a, t, ...crowd] });
      const { first, chain } = chainOf(world, a, t);
      if (!chain) continue;
      const e0 = physics.pushEnergy(a, t, first.moved * 5, {});
      const absorbed = chain.hurt.reduce((sum, h) => sum + h.ft * h.who.mass, 0);
      expect(absorbed).toBeLessThanOrEqual(e0 + 1e-6);
    }
  });

  it("a long queue stops after maxChain crashes", () => {
    const a = makeCreature({ ...giant(), mod: { str: 20 } }), t = victim(), crowd = line(8);
    const world = new GridWorld({ cols: 20, rows: 6, creatures: [a, t, ...crowd] });
    const { chain } = chainOf(world, a, t);
    expect(crowd.length).toBeGreaterThan(PUSH.maxChain);          // the queue really is longer than the cap
    expect(chain!.bumps).toHaveLength(PUSH.maxChain);
  });

  it("a carried crate slammed into a wall puts the wall hit on the crate (props just have no HP)", () => {
    const crate = makeProp({ id: "crate", name: "Crate", pos: { col: 4, row: 2 } });
    const a = giant(), t = victim();
    const world = new GridWorld({ cols: 14, rows: 6, creatures: [a, t], props: [crate], walls: [{ c: [600, 0, 600, 600] }] });
    const { chain } = chainOf(world, a, t);
    expect(chain!.hurt.some((h) => h.who.id === "crate")).toBe(true);
  });

  it("everything in the train ends up in order, none on top of another", () => {
    const crate = makeProp({ id: "crate", pos: { col: 4, row: 2 } });
    const a = giant(), t = victim();
    const world = new GridWorld({ cols: 14, rows: 6, creatures: [a, t], props: [crate] });
    const fx = Shove.resolve({ world, rules: physics, dice: scriptedDice([1, 3, 3, 3, 3, 3]) }, { actor: a, target: t, mode: "push" });
    const to = (id: string) => (fx.find((e) => e.kind === "push" && (e as any).target === id) as any).to;
    expect(to("crate").col).toBeGreaterThan(4);
    expect(to("t").col).toBe(to("crate").col - 1);
  });

  it("2024 rules never build a chain", () => {
    const crate = makeProp({ id: "crate", pos: { col: 4, row: 2 } });
    const a = giant(), t = victim();
    const world = new GridWorld({ cols: 14, rows: 6, creatures: [a, t], props: [crate] });
    const first = resolvePush(world, t, { col: 1, row: 0 }, 5);
    expect(runChain(world, new Ruleset(), a, t, first, { col: 1, row: 0 }, {})).toBeUndefined();
  });
});
