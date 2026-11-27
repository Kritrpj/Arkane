// Anything that takes up cells on the map and has mass: creatures and props (crates, statues, barrels).
// Physics (push, collision) only needs this much, so it works the same on both.
import type { Cell } from "./world";

export interface Thing {
  id: string;
  name: string;
  pos: Cell;                 // top-left cell of its footprint
  footprint: number;         // cells per side
  elevation: number;         // feet above the ground it stands on
  mass: number;              // lb (same unit as D&D weight)
  tags: string[];            // "flying", "immovable", "prop" ...
}

// where a prop's mass came from: a GM override, or material density x volume x fill
export type PropMassSource = "override" | "material";

export interface Prop extends Thing {
  material: string;          // key of MATERIALS in data/props.ts ("wood", "stone", ...)
  heightFt: number;
  massSource: PropMassSource;
}
