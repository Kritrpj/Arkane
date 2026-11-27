// Grid geometry between creatures. All in cells; feet are the World's business.
import type { Creature } from "../model/creature";
import type { Cell } from "../model/world";

// every cell a creature covers when its top-left cell is `at`
export function cellsOf(c: Pick<Creature, "pos" | "footprint">, at: Cell = c.pos): Cell[] {
  const out: Cell[] = [];
  for (let r = 0; r < c.footprint; r++)
    for (let k = 0; k < c.footprint; k++) out.push({ col: at.col + k, row: at.row + r });
  return out;
}

// empty cells between two footprints. 0 = touching (diagonal counts), same as gapFt() in combatx.js
export function gap(a: Creature, b: Creature): number {
  const dx = Math.max(a.pos.col - (b.pos.col + b.footprint), b.pos.col - (a.pos.col + a.footprint), 0);
  const dy = Math.max(a.pos.row - (b.pos.row + b.footprint), b.pos.row - (a.pos.row + a.footprint), 0);
  return Math.max(dx, dy);
}

export const touching = (a: Creature, b: Creature): boolean => a.id !== b.id && gap(a, b) === 0;

// one step (each axis -1, 0 or 1) pointing from a toward b, rounded like the old shove code
export function awayFrom(a: Creature, b: Creature): Cell {
  const ax = a.pos.col + a.footprint / 2, ay = a.pos.row + a.footprint / 2;
  const bx = b.pos.col + b.footprint / 2, by = b.pos.row + b.footprint / 2;
  const len = Math.hypot(bx - ax, by - ay) || 1;
  return { col: Math.round((bx - ax) / len) || 0, row: Math.round((by - ay) / len) || 0 };
}
