// Sanity check on the module's own map data (scripts/chmaps.js): every wall is 4 numbers,
// and a GridWorld can be built from each map. Catches a bad data edit before it reaches Foundry.
import { describe, expect, it } from "vitest";
import { CHMAPS } from "../scripts/chmaps.js";
import { GridWorld } from "../src/world/gridWorld";

describe("real chapter maps", () => {
  for (const [id, d] of Object.entries(CHMAPS) as [string, any][]) {
    it(`${id}: walls are [x1,y1,x2,y2] and the world builds`, () => {
      for (const w of d.walls ?? []) {
        expect(w.c).toHaveLength(4);
        expect(w.c.every((n: number) => Number.isFinite(n))).toBe(true);
      }
      const world = new GridWorld({ cols: d.W, rows: d.H, walls: d.walls ?? [] });
      expect(world.blocked({ col: 0, row: 0 }, { col: -1, row: 0 })).toBe(true);   // edge of map
    });
  }
});
