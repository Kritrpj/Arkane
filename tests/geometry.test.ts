import { describe, expect, it } from "vitest";
import { makeCreature } from "../src/model/make";
import { awayFrom, cellsOf, gap } from "../src/rules/reach";
import { GridWorld, segmentsTouch } from "../src/world/gridWorld";

const at = (col: number, row: number, extra = {}) => makeCreature({ id: `${col},${row}`, pos: { col, row }, ...extra });

describe("reach", () => {
  it("gap is 0 when touching (orthogonal and diagonal), grows with distance", () => {
    expect(gap(at(0, 0), at(1, 0))).toBe(0);
    expect(gap(at(0, 0), at(1, 1))).toBe(0);
    expect(gap(at(0, 0), at(3, 0))).toBe(2);
  });
  it("large creature covers 2x2 and touches from its edge", () => {
    const big = at(2, 2, { footprint: 2 });
    expect(cellsOf(big)).toHaveLength(4);
    expect(gap(big, at(4, 3))).toBe(0);
    expect(gap(big, at(5, 3))).toBe(1);
  });
  it("awayFrom points from attacker to target", () => {
    expect(awayFrom(at(2, 2), at(3, 2))).toEqual({ col: 1, row: 0 });
    expect(awayFrom(at(2, 2), at(1, 2))).toEqual({ col: -1, row: 0 });
    expect(awayFrom(at(2, 2), at(3, 3))).toEqual({ col: 1, row: 1 });
    expect(awayFrom(at(2, 2), at(2, 1))).toEqual({ col: 0, row: -1 });
  });
});

describe("GridWorld walls", () => {
  const w = (walls: { c: number[]; door?: number }[]) => new GridWorld({ cols: 6, rows: 6, walls });
  it("segments touch / miss", () => {
    expect(segmentsTouch([0, 0, 10, 10], [0, 10, 10, 0])).toBe(true);
    expect(segmentsTouch([0, 0, 10, 0], [0, 5, 10, 5])).toBe(false);
  });
  it("wall on the grid line blocks the step across it, not along it", () => {
    const world = w([{ c: [200, 0, 200, 600] }]);
    expect(world.blocked({ col: 1, row: 1 }, { col: 2, row: 1 })).toBe(true);
    expect(world.blocked({ col: 1, row: 1 }, { col: 1, row: 2 })).toBe(false);
  });
  it("a diagonal cannot cut through a wall corner", () => {
    const world = w([{ c: [100, 100, 200, 100] }]);                 // ends on the corner the diagonal passes
    expect(world.blocked({ col: 0, row: 0 }, { col: 1, row: 1 })).toBe(true);
  });
  it("outside the map is blocked", () => {
    expect(w([]).blocked({ col: 5, row: 5 }, { col: 6, row: 5 })).toBe(true);
  });
});
