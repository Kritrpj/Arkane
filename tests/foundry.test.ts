// Tests the Foundry adapter against a FAKE Foundry (tokens, scene, socket, dialog). It proves our code
// reads/writes the shapes we expect; it cannot prove Foundry itself behaves that way (the friend's world does).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { toCreature, toProp, cellOf, topLeftOf } from "../src/foundry/snapshot";
import { FoundryWorld } from "../src/foundry/world";
import { gmApply } from "../src/foundry/apply";
import { shove } from "../src/foundry/shove";
import { registerCore } from "../src/foundry/register";
import { setProp } from "../src/foundry/props";
import { inspect } from "../src/foundry/inspect";
import { RulesetPhysics } from "../src/rules/physicsRuleset";
import { setRuleset } from "../src/foundry/shove";
import { Ruleset } from "../src/rules/ruleset";
import { recordDice, randomDice, scriptedDice } from "../src/rules/dice";

const G = globalThis as any;

function mkToken(scene: any, id: string, name: string, col: number, row: number, o: any = {}) {
  const actor = {
    system: {
      traits: { size: o.size ?? "med" },
      attributes: { prof: 2, ac: { value: 12 }, hp: { value: 10, max: 10 }, movement: { walk: 30 } },
      abilities: {
        str: { mod: o.str ?? 0, save: { value: o.strSave ?? o.str ?? 0 } },
        dex: { mod: 0, save: o.dexSave ?? 0 },            // number form on purpose: old code handled both
        con: { mod: 0 }, int: { mod: 0 }, wis: { mod: 0 }, cha: { mod: 0 },
      },
    },
    statuses: new Set<string>(o.statuses ?? []),
    getFlag: () => undefined,
    toggleStatusEffect: vi.fn(), applyDamage: vi.fn(), items: { get: () => undefined },
  };
  return { id, name, x: scene.dimensions.sceneX + col * 100, y: scene.dimensions.sceneY + row * 100,
    width: 1, height: 1, elevation: 0, parent: scene, actor, update: vi.fn() };
}

let scene: any, hero: any, gob: any, chat: any[], emitted: any[], dialog: string | null, rolls: number[], gm: boolean;

beforeEach(() => {
  chat = []; emitted = []; dialog = "push"; gm = true;
  scene = { id: "s1", grid: { size: 100, distance: 5 }, dimensions: { sceneX: 0, sceneY: 0, sceneWidth: 1000, sceneHeight: 800 },
    templates: { contents: [] }, getFlag: () => undefined, setFlag: vi.fn() };
  hero = mkToken(scene, "hero", "Hero", 2, 2, { str: 3 });
  gob = mkToken(scene, "gob", "Goblin", 3, 2);
  scene.tokens = { contents: [hero, gob], get: (id: string) => [hero, gob].find((t) => t.id === id) };
  rolls = [(5 - 0.5) / 20];                                 // d20 = 5 (fails vs DC 13); later calls fall back to 0.5
  G.canvas = { scene, tokens: { controlled: [{ document: hero }] } };   // placeables wrap the document
  G.game = {
    user: { get isGM() { return gm; }, targets: { first: () => ({ document: gob }) } },
    users: { get activeGM() { return { isSelf: gm }; } },
    scenes: { get: (id: string) => (id === "s1" ? scene : undefined) },
    socket: { emit: (_ev: string, d: any) => emitted.push(d), on: vi.fn() },
  };
  G.ui = { notifications: { warn: vi.fn() } };
  G.ChatMessage = { create: async (m: any) => { chat.push(m); }, getSpeaker: () => ({}) };
  G.foundry = { applications: { api: { DialogV2: { wait: async () => dialog } } } };
  G.CONFIG = { Dice: { randomUniform: () => rolls.shift() ?? 0.5 }, Canvas: { polygonBackends: { move: { testCollision: () => false } } } };
});
afterEach(() => { for (const k of ["canvas", "game", "ui", "ChatMessage", "foundry", "CONFIG"]) delete G[k]; });

describe("snapshot", () => {
  it("maps a token to a Creature", () => {
    const c = toCreature(hero)!;
    expect(c).toMatchObject({ id: "hero", pos: { col: 2, row: 2 }, footprint: 1, size: "med", ac: 12, prof: 2 });
    expect(c.mod.str).toBe(3); expect(c.save.str).toBe(3);
  });
  it("reads the save bonus from either shape (object or number) and falls back to mod", () => {
    expect(toCreature(mkToken(scene, "a", "A", 0, 0, { dexSave: 4 }))!.save.dex).toBe(4);
    expect(toCreature(mkToken(scene, "b", "B", 0, 0))!.save.con).toBe(0);
  });
  it("unknown size becomes med, flying status becomes a tag, no actor gives null", () => {
    const t = mkToken(scene, "a", "A", 0, 0, { size: "weird", statuses: ["flying", "prone"] });
    const c = toCreature(t)!;
    expect(c.size).toBe("med"); expect(c.tags).toContain("flying"); expect(c.conditions).toEqual(["flying", "prone"]);
    expect(toCreature({ id: "x" })).toBeNull();
  });
  it("mass: size table by default, then sheet height, then sheet weight, then the GM flag", () => {
    expect(toCreature(hero)!).toMatchObject({ mass: 180, massSource: "size" });
    const t: any = mkToken(scene, "a", "A", 0, 0, { size: "lg" });
    expect(toCreature(t)!).toMatchObject({ mass: 900, massSource: "size" });
    t.actor.system.details = { height: `11'6"` };
    expect(toCreature(t)!.massSource).toBe("height");
    t.actor.system.details = { height: `11'6"`, weight: "300 lb" };
    expect(toCreature(t)!).toMatchObject({ mass: 300, massSource: "weight" });
    t.actor.getFlag = (_m: string, k: string) => (k === "mass" ? 777 : undefined);
    expect(toCreature(t)!).toMatchObject({ mass: 777, massSource: "override" });
  });
  it("respects the scene padding offset", () => {
    scene.dimensions.sceneX = 250; scene.dimensions.sceneY = 100;
    expect(cellOf(scene, 450, 300)).toEqual({ col: 2, row: 2 });
    expect(topLeftOf(scene, { col: 2, row: 2 })).toEqual({ x: 450, y: 300 });
  });
});

describe("FoundryWorld", () => {
  it("occupant, creature lookup and cellFt", () => {
    const w = new FoundryWorld(scene);
    expect(w.cellFt).toBe(5);
    expect(w.occupant({ col: 3, row: 2 })?.id).toBe("gob");
    expect(w.occupant({ col: 9, row: 9 })).toBeUndefined();
  });
  it("blocked asks Foundry's collision test and treats off-map as blocked", () => {
    scene.dimensions.sceneRect = { x: 0, y: 0, width: 1000, height: 800 };
    const spy = vi.fn().mockReturnValue(true); G.CONFIG.Canvas.polygonBackends.move.testCollision = spy;
    const w = new FoundryWorld(scene);
    expect(w.blocked({ col: 3, row: 2 }, { col: 4, row: 2 })).toBe(true);
    expect(spy).toHaveBeenCalledWith({ x: 350, y: 250 }, { x: 450, y: 250 }, { type: "move", mode: "any" });
    spy.mockClear();
    expect(w.blocked({ col: 9, row: 2 }, { col: 10, row: 2 })).toBe(true);     // x=1050 > 1000
    expect(spy).not.toHaveBeenCalled();
  });
  it("a collision test that throws does not block (same as the old code)", () => {
    G.CONFIG.Canvas.polygonBackends.move.testCollision = () => { throw new Error("api changed"); };
    expect(new FoundryWorld(scene).blocked({ col: 3, row: 2 }, { col: 4, row: 2 })).toBe(false);
  });
  it("heights come from the scene flag; oil from flagged templates", () => {
    scene.getFlag = (_m: string, k: string) => (k === "heights" ? { "4,2": -20 } : undefined);
    scene.templates.contents = [{ x: 450, y: 250, distance: 10, getFlag: () => true }, { x: 0, y: 0, distance: 10, getFlag: () => false }];
    const w = new FoundryWorld(scene);
    expect(w.heightAt({ col: 4, row: 2 })).toBe(-20); expect(w.heightAt({ col: 0, row: 0 })).toBe(0);
    expect(w.surfaceAt({ col: 4, row: 2 })).toBe("oil");     // 10 ft = 200 px radius around (450,250)
    expect(w.surfaceAt({ col: 8, row: 6 })).toBeUndefined();
  });
});

describe("shove() as the GM", () => {
  it("moves the target one cell away (to px 400,200) and posts the check to chat", async () => {
    await shove();
    expect(gob.update).toHaveBeenCalledWith({ x: 400, y: 200 }, { arkaneInternal: true, animate: true });
    expect(chat).toHaveLength(1);
    expect(chat[0].content).toContain("d20 5 + STR save 0 = 5 vs DC 13 (base 8 + STR 3 + prof 2)");
  });
  it("prone choice reuses the same d20 (random is asked exactly once)", async () => {
    dialog = "prone"; const used = vi.fn(() => rolls.shift() ?? 0.5); G.CONFIG.Dice.randomUniform = used;
    await shove();
    expect(gob.actor.toggleStatusEffect).toHaveBeenCalledWith("prone", { active: true });
    expect(gob.update).not.toHaveBeenCalled();
    expect(used).toHaveBeenCalledTimes(1);
  });
  it("cancelling keeps the roll in chat and changes nothing", async () => {
    dialog = null; await shove();
    expect(gob.update).not.toHaveBeenCalled(); expect(gob.actor.toggleStatusEffect).not.toHaveBeenCalled();
    expect(chat).toHaveLength(1); expect(chat[0].content).toContain("ยกเลิก");
  });
  it("target that saves is not asked and not moved", async () => {
    rolls = [(18 - 0.5) / 20]; const ask = vi.fn(); G.foundry.applications.api.DialogV2.wait = ask;
    await shove();
    expect(ask).not.toHaveBeenCalled(); expect(gob.update).not.toHaveBeenCalled(); expect(chat).toHaveLength(1);
  });
  it("warns when nothing is targeted or the target is too far", async () => {
    G.game.user.targets.first = () => undefined; await shove();
    expect(G.ui.notifications.warn).toHaveBeenCalledWith(expect.stringContaining("เป้าหมาย"));
    G.game.user.targets.first = () => ({ document: gob }); gob.x = 700; await shove();
    expect(G.ui.notifications.warn).toHaveBeenCalledWith("ต้องอยู่ติดกัน");
  });
  it("a wall behind the target stops the push", async () => {
    G.CONFIG.Canvas.polygonBackends.move.testCollision = () => true; await shove();
    expect(gob.update).not.toHaveBeenCalled();
    expect(chat[0].content).toContain("ผลักไม่ได้");
  });
});

describe("shove() as a player", () => {
  it("sends the token changes to the GM by socket instead of editing", async () => {
    gm = false; G.game.users = { activeGM: { isSelf: false } };
    await shove();
    expect(gob.update).not.toHaveBeenCalled();
    expect(chat).toHaveLength(1);                                          // own chat line still posted locally
    expect(emitted).toHaveLength(1);
    expect(emitted[0]).toMatchObject({ t: "c-fx", scene: "s1", effects: [{ kind: "push", target: "gob", to: { col: 4, row: 2 } }] });
  });
  it("warns instead of failing silently when no GM is online", async () => {
    gm = false; G.game.users = { activeGM: null };
    await shove();
    expect(G.ui.notifications.warn).toHaveBeenCalledWith(expect.stringContaining("GM"));
    expect(emitted).toHaveLength(0);
  });
});

describe("gmApply validation", () => {
  const push = (col: any, row: any) => ({ t: "c-fx" as const, scene: "s1", effects: [{ kind: "push" as const, target: "gob", to: { col, row } }] });
  it("applies a good push", async () => { await gmApply(push(5, 4)); expect(gob.update).toHaveBeenCalledWith({ x: 500, y: 400 }, expect.anything()); });
  it("ignores off-map, fractional and missing cells", async () => {
    await gmApply(push(-1, 0)); await gmApply(push(10, 0)); await gmApply(push(1.5, 1)); await gmApply(push(undefined, 1));
    expect(gob.update).not.toHaveBeenCalled();
  });
  it("ignores unknown scenes, unknown tokens and unknown kinds", async () => {
    await gmApply({ t: "c-fx", scene: "nope", effects: [] });
    await gmApply({ t: "c-fx", scene: "s1", effects: [{ kind: "push", target: "ghost", to: { col: 1, row: 1 } }] });
    await gmApply({ t: "c-fx", scene: "s1", effects: [{ kind: "explode", target: "gob" } as any] });
    expect(gob.update).not.toHaveBeenCalled();
  });
  it("damage uses applyDamage with a type, ignores zero", async () => {
    await gmApply({ t: "c-fx", scene: "s1", effects: [{ kind: "damage", target: "gob", amount: 7, type: "bludgeoning" }, { kind: "damage", target: "gob", amount: 0, type: "fire" }] });
    expect(gob.actor.applyDamage).toHaveBeenCalledTimes(1);
    expect(gob.actor.applyDamage).toHaveBeenCalledWith([{ value: 7, type: "bludgeoning" }]);
  });
});

describe("registerCore", () => {
  it("exposes game.arkane.core and only the active GM runs c-fx messages", async () => {
    G.game.arkane = { shove: "old" };
    registerCore();
    expect(typeof G.game.arkane.core.shove).toBe("function");
    expect(G.game.arkane.shove).toBe("old");                              // the friend's old shove is untouched
    const handler = G.game.socket.on.mock.calls[0][1];
    gm = false; await handler({ t: "c-fx", scene: "s1", effects: [{ kind: "prone", target: "gob" }] });
    expect(gob.actor.toggleStatusEffect).not.toHaveBeenCalled();
    gm = true; await handler({ t: "c-fx", scene: "s1", effects: [{ kind: "prone", target: "gob" }] });
    await new Promise((r) => setTimeout(r, 0));
    expect(gob.actor.toggleStatusEffect).toHaveBeenCalled();
    await handler({ t: "x-move" });                                        // old message types are ignored
  });
});

describe("recordDice", () => {
  it("replays exactly what was rolled", () => {
    const rec = recordDice(randomDice(() => 0.5));
    rec.dice.d20("adv"); rec.dice.roll(2, 6);
    expect(rec.rolled).toHaveLength(4);
    const again = scriptedDice(rec.rolled);
    expect(again.d20("adv").rolls).toEqual(rec.rolled.slice(0, 2));
    expect(again.roll(2, 6)).toBe(rec.rolled[2] + rec.rolled[3]);
  });
});


// ---- props: a token with the flag arkane-1920s.prop is an object, not a creature
function mkProp(id: string, col: number, row: number, flag: unknown, o: any = {}) {
  const flags: Record<string, unknown> = { prop: flag };
  return { id, name: o.name ?? id, x: scene.dimensions.sceneX + col * 100, y: scene.dimensions.sceneY + row * 100,
    width: o.width ?? 1, height: o.width ?? 1, elevation: 0, parent: scene, actor: o.actor, update: vi.fn(),
    getFlag: (_m: string, k: string) => flags[k], setFlag: vi.fn(), unsetFlag: vi.fn() };
}

describe("props (Foundry adapter)", () => {
  it("flag true = default wooden crate; flag object = custom; no flag = not a prop", () => {
    expect(toProp(mkProp("c", 4, 2, true))).toMatchObject({ id: "c", pos: { col: 4, row: 2 }, material: "wood", heightFt: 5, mass: 250, massSource: "material", tags: ["prop"] });
    expect(toProp(mkProp("s", 4, 2, { material: "stone", heightFt: 6 }))!.mass).toBe(12000);
    expect(toProp(mkProp("m", 4, 2, { mass: 321 }))).toMatchObject({ mass: 321, massSource: "override" });
    expect(toProp(mkProp("i", 4, 2, { immovable: true }))!.tags).toEqual(["prop", "immovable"]);
    expect(toProp(mkProp("n", 4, 2, undefined))).toBeNull();
    expect(toProp(hero)).toBeNull();                                   // a plain test token has no getFlag at all: still fine
  });
  it("a 2x2 prop is 4x heavier; the scene's feet-per-cell is used", () => {
    expect(toProp(mkProp("b", 4, 2, true, { width: 2 }))!.mass).toBe(1000);
    scene.grid.distance = 10;
    expect(toProp(mkProp("b", 4, 2, true))!.mass).toBe(1000);
  });
  it("a token with an actor AND the prop flag is a prop, not a creature", () => {
    const barrel = mkProp("bar", 5, 2, true, { actor: gob.actor });
    expect(toCreature(barrel)).toBeNull();
    expect(toProp(barrel)).not.toBeNull();
  });
  it("FoundryWorld lists props separately and finds them by cell", () => {
    const crate = mkProp("crate", 5, 2, true, { width: 2 });
    scene.tokens = { contents: [hero, gob, crate], get: (id: string) => [hero, gob, crate].find((t) => t.id === id) };
    const w = new FoundryWorld(scene);
    expect(w.creatures().map((c) => c.id)).toEqual(["hero", "gob"]);
    expect(w.props().map((p) => p.id)).toEqual(["crate"]);
    expect(w.propAt({ col: 6, row: 3 })?.id).toBe("crate");            // 2x2 footprint
    expect(w.propAt({ col: 7, row: 2 })).toBeUndefined();
    expect(w.occupant({ col: 5, row: 2 })).toBeUndefined();
  });
  it("shove() refuses a prop as the target", async () => {
    const crate = mkProp("crate", 3, 2, true);
    G.game.user.targets.first = () => ({ document: crate });
    await shove();
    expect(G.ui.notifications.warn).toHaveBeenCalledWith(expect.stringContaining("ของ"));
    expect(crate.update).not.toHaveBeenCalled();
  });
  it("physics shove: the goblin is thrown into a crate, the GM moves BOTH tokens", async () => {
    const giant = mkToken(scene, "hero", "Giant", 2, 2, { str: 6, size: "huge" });
    const crate = mkProp("crate", 6, 2, true);
    scene.tokens = { contents: [giant, gob, crate], get: (id: string) => [giant, gob, crate].find((t) => t.id === id) };
    G.canvas.tokens.controlled = [{ document: giant }];
    setRuleset(new RulesetPhysics());
    try { await shove(); } finally { setRuleset(new Ruleset()); }
    const to = (t: any) => t.update.mock.calls[0]?.[0];
    expect(to(crate)).toMatchObject({ y: 200 });
    expect(to(crate).x).toBeGreaterThan(600);                         // shoved along, not left in place
    expect(to(gob).x).toBe(to(crate).x - 100);                       // goblin right behind it
    expect(crate.update).toHaveBeenCalledWith(expect.anything(), { arkaneInternal: true, animate: true });
  });
  it("setProp: GM only, validates the material, sets / clears the flag on selected tokens", async () => {
    const crate = mkProp("crate", 5, 2, undefined);
    G.canvas.tokens.controlled = [{ document: crate }];
    expect(await setProp({ material: "stone" })).toBe(1);
    expect(crate.setFlag).toHaveBeenCalledWith("arkane-1920s", "prop", { material: "stone" });
    await setProp({}); expect(crate.setFlag).toHaveBeenLastCalledWith("arkane-1920s", "prop", true);
    await setProp(null); expect(crate.unsetFlag).toHaveBeenCalledWith("arkane-1920s", "prop");
    expect(await setProp({ material: "unobtainium" })).toBe(0);
    expect(G.ui.notifications.warn).toHaveBeenCalledWith(expect.stringContaining("unobtainium"));
    gm = false; expect(await setProp({})).toBe(0);
  });
  it("inspect() describes a prop token", () => {
    const crate = mkProp("crate", 5, 2, { material: "iron" });
    expect(inspect(crate)).toMatchObject({ material: "iron", massSource: "material" });
  });
});
