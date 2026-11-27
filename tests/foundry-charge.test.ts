// game.arkane.core.charge() against a fake Foundry (same approach as foundry.test.ts).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { charge } from "../src/foundry/charge";
import { setRuleset } from "../src/foundry/shove";
import { Ruleset } from "../src/rules/ruleset";
import { RulesetPhysics } from "../src/rules/physicsRuleset";
import { registerCore } from "../src/foundry/register";

const G = globalThis as any;
let scene: any, hero: any, gob: any, chat: any[], emitted: any[], gm: boolean;

function tok(id: string, name: string, col: number, row: number, o: { size?: string; speed?: number; str?: number } = {}) {
  const actor = {
    system: {
      traits: { size: o.size ?? "med" },
      attributes: { prof: 2, ac: { value: 12 }, hp: { value: 20, max: 20 }, movement: { walk: o.speed ?? 30 } },
      abilities: { str: { value: 10 + 2 * (o.str ?? 0), mod: o.str ?? 0 }, dex: { mod: 0 }, con: { mod: 0 }, int: { mod: 0 }, wis: { mod: 0 }, cha: { mod: 0 } },
    },
    statuses: new Set<string>(), getFlag: () => undefined, toggleStatusEffect: vi.fn(), applyDamage: vi.fn(), items: { get: () => undefined },
  };
  return { id, name, x: col * 100, y: row * 100, width: 1, height: 1, elevation: 0, parent: scene, actor, update: vi.fn() };
}

beforeEach(() => {
  chat = []; emitted = []; gm = true;
  scene = { id: "s1", grid: { size: 100, distance: 5 }, dimensions: { sceneX: 0, sceneY: 0, sceneWidth: 1400, sceneHeight: 800 }, templates: { contents: [] }, getFlag: () => undefined };
  hero = tok("hero", "Hero", 1, 2, { str: 3 });
  gob = tok("gob", "Goblin", 5, 2, { size: "sm" });
  scene.tokens = { contents: [hero, gob], get: (id: string) => [hero, gob].find((t) => t.id === id) };
  G.canvas = { scene, tokens: { controlled: [{ document: hero }] } };
  G.game = {
    user: { get isGM() { return gm; }, targets: { first: () => ({ document: gob }) } },
    users: { get activeGM() { return { isSelf: gm }; } },
    scenes: { get: (id: string) => (id === "s1" ? scene : undefined) },
    socket: { emit: (_e: string, d: any) => emitted.push(d), on: vi.fn() },
  };
  G.ui = { notifications: { warn: vi.fn() } };
  G.ChatMessage = { create: async (m: any) => { chat.push(m); }, getSpeaker: () => ({}) };
  G.CONFIG = { Dice: { randomUniform: () => 0.5 }, Canvas: { polygonBackends: { move: { testCollision: () => false } } } };
  setRuleset(new Ruleset());
});
afterEach(() => { for (const k of ["canvas", "game", "ui", "ChatMessage", "CONFIG"]) delete G[k]; });

describe("charge() as the GM", () => {
  it("2024 rules: the charger runs up next to the target and nothing else moves", async () => {
    await charge();
    expect(hero.update).toHaveBeenCalledWith({ x: 400, y: 200 }, { arkaneInternal: true, animate: true });
    expect(gob.update).not.toHaveBeenCalled();
    expect(chat.length).toBeGreaterThan(0);
  });
  it("physics rules: the charger and the target both move (charger col 5, target col 6)", async () => {
    setRuleset(new RulesetPhysics());
    await charge();
    expect(hero.update).toHaveBeenCalledWith({ x: 500, y: 200 }, expect.anything());
    expect(gob.update).toHaveBeenCalledWith({ x: 600, y: 200 }, expect.anything());
    expect(chat.some((m) => m.content.includes("ชน"))).toBe(true);
  });
  it("warns instead of acting when it cannot be used (too far) or nothing is targeted", async () => {
    gob.x = 1100;                                                          // gap of 9 cells = 45 ft > speed 30
    await charge();
    expect(G.ui.notifications.warn).toHaveBeenCalledWith(expect.stringContaining("ระยะวิ่ง"));
    expect(hero.update).not.toHaveBeenCalled();
    G.game.user.targets.first = () => undefined; await charge();
    expect(G.ui.notifications.warn).toHaveBeenCalledWith(expect.stringContaining("เป้าหมาย"));
  });
});

describe("charge() as a player", () => {
  it("sends the moves to the GM by socket and edits nothing itself", async () => {
    gm = false; G.game.users = { activeGM: { isSelf: false } };
    setRuleset(new RulesetPhysics());
    await charge();
    expect(hero.update).not.toHaveBeenCalled();
    expect(emitted).toHaveLength(1);
    expect(emitted[0].effects.filter((e: any) => e.kind === "push").map((e: any) => e.target)).toEqual(["hero", "gob"]);
  });
});

describe("registerCore", () => {
  it("exposes charge next to shove", () => {
    G.game.arkane = {}; registerCore();
    expect(typeof G.game.arkane.core.charge).toBe("function");
    expect(typeof G.game.arkane.core.shove).toBe("function");
    expect(Object.keys(G.game.arkane.core.actions)).toEqual(["shove", "charge"]);
  });
});
