// The map as the rules see it. Rules never touch canvas/scene directly:
// in Foundry an adapter implements this, in the dev harness a fake grid does.
import type { Creature } from "./creature";
import type { Prop, Thing } from "./thing";
import type { Point, Resolved, Zone } from "./zone";

// Everything is measured in grid cells. Feet = cells * World.cellFt (5 in this module: 100px = 5 ft).
export interface Cell { col: number; row: number }

export interface World {
  readonly cellFt: number;

  // is there a wall (or closed door) between two ADJACENT cells?
  blocked(from: Cell, to: Cell): boolean;

  // who stands on this cell (undefined = empty)
  occupant(cell: Cell): Creature | undefined;

  // props (crates, statues...) standing in the way. Empty list when the map has none
  props(): readonly Prop[];
  propAt(cell: Cell): Prop | undefined;

  // ground height of a cell in feet (0 when the map has no height data - the repo has none yet)
  heightAt(cell: Cell): number;

  // what covers the ground: "oil" | "fire" | "water" | ... (undefined = bare floor)
  surfaceAt(cell: Cell): string | undefined;

  // --- Zone: ถามด้วยพิกัดฟุตต่อเนื่อง (จุดกลางช่อง = ((col+.5)*cellFt, (row+.5)*cellFt)); ช่องเป็นแค่จุดตัวอย่าง
  zones(): readonly Zone[];
  propertiesAt(p: Point): Resolved;

  creatures(): readonly Creature[];
}
