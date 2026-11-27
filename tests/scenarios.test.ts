// Every ready-made case of the harness (dev/scenarios.ts) must really do what its note says.
import { describe, expect, it } from "vitest";
import { SCENARIOS } from "../dev/scenarios";
import { RULEBOOKS } from "../dev/stage";
import { GridWorld } from "../src/world/gridWorld";
import { ACTIONS } from "../src/actions";
import { fixedDice } from "../src/rules/dice";
import type { Trace } from "../src/model/trace";

function run(sc: (typeof SCENARIOS)[number], trace?: Trace) {
  const stage = sc.build();
  const world = new GridWorld({ cols: stage.cols, rows: stage.rows, walls: stage.walls, heights: stage.heights, surfaces: stage.surfaces, creatures: stage.creatures, props: stage.props });
  const ctx = { world, rules: RULEBOOKS[sc.rules].make(), dice: fixedDice(sc.d20, sc.die), trace };
  const input = { actor: world.creatures().find((c) => c.id === sc.actor)!, target: world.creatures().find((c) => c.id === sc.target)!, mode: sc.mode ?? "push" };
  const act = ACTIONS[sc.action ?? "shove"] as import("../src/actions/types").Action<any>;
  const can = act.canUse(ctx, input);
  return { can, fx: can.ok ? act.resolve(ctx, input) : [], stage };
}

describe("harness scenarios", () => {
  it("ids are unique and actor/target exist", () => {
    expect(new Set(SCENARIOS.map((s) => s.id)).size).toBe(SCENARIOS.length);
    for (const s of SCENARIOS) {
      const ids = s.build().creatures.map((c) => c.id);
      expect(ids, s.id).toContain(s.actor); expect(ids, s.id).toContain(s.target);
    }
  });
  for (const sc of SCENARIOS) {
    it(`${sc.id}: ${sc.label}`, () => { expect(sc.verify(run(sc))).toBe(true); });
    it(`${sc.id}: a trace changes nothing and explains something`, () => {
      const lines: string[] = [], plain = run(sc), traced = run(sc, (s, t) => lines.push(`${s}|${t}`));
      expect(traced.fx).toEqual(plain.fx);
      if (plain.can.ok) expect(lines.length).toBeGreaterThan(0);
    });
  }
});
