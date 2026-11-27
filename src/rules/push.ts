// Pushing a thing (creature or prop) cell by cell. Pure: it asks the World and returns where it ends up.
// It does not move anything; the result is turned into effects by the action.
import type { Thing } from "../model/thing";
import type { Cell, World } from "../model/world";
import { cellsOf } from "./reach";

export type PushStop = "wall" | "creature" | "prop" | null;

export interface PushResult {
  to: Cell;                // final top-left cell
  moved: number;           // cells actually moved
  stopped: PushStop;       // why it stopped early, if it did
  hit?: Thing;             // the creature or prop it ran into (when stopped is "creature" or "prop")
  dropFt: number;          // how far it fell at the end (0 = no fall)
  surface?: string;        // what covers the cell it lands on
}

// `ignore`: ids that do not count as obstacles (a thing being carried along by the one pushing it)
export function resolvePush(world: World, target: Thing, step: Cell, cells: number, ignore: string[] = []): PushResult {
  let pos = target.pos, moved = 0, stopped: PushStop = null, hit: Thing | undefined;
  const free = (t: Thing | undefined) => !t || t.id === target.id || ignore.includes(t.id);

  for (let i = 0; i < cells; i++) {
    const next = { col: pos.col + step.col, row: pos.row + step.row };
    const from = cellsOf(target, pos), to = cellsOf(target, next);
    if (from.some((c, k) => world.blocked(c, to[k]))) { stopped = "wall"; break; }
    const crea = to.map((c) => world.occupant(c)).find((o) => !free(o));
    if (crea) { stopped = "creature"; hit = crea; break; }
    const prop = to.map((c) => world.propAt(c)).find((o) => !free(o));
    if (prop) { stopped = "prop"; hit = prop; break; }
    pos = next; moved++;
  }
  const flying = target.tags.includes("flying");
  const dropFt = moved > 0 && !flying ? Math.max(0, world.heightAt(target.pos) - world.heightAt(pos)) : 0;
  return { to: pos, moved, stopped, hit, dropFt, surface: moved > 0 ? world.surfaceAt(pos) : undefined };
}
