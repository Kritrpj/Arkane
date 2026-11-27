// A World built from plain data: the same wall list the module already stores
// ({ c:[x1,y1,x2,y2], door? } in pixels). Used by tests and the dev harness; the Foundry
// adapter will have its own World that asks the real canvas.
import type { Creature } from "../model/creature";
import type { Prop, Thing } from "../model/thing";
import type { Cell, World } from "../model/world";
import type { Effect, Cost } from "../model/effect";
import type { Point, Resolved, Zone } from "../model/zone";
import { ZoneField, type Coverage } from "../rules/zones";

export interface WallSeg { c: number[]; door?: number }

export interface GridInit {
  cols: number; rows: number;
  gridPx?: number;                         // pixels per cell (module uses 100)
  cellFt?: number;                         // feet per cell (module uses 5)
  walls?: WallSeg[];                       // doors count as closed walls
  creatures?: Creature[];
  props?: Prop[];
  heights?: Record<string, number>;        // "col,row" -> ground height in ft
  surfaces?: Record<string, string>;       // "col,row" -> "oil" | "fire" ... (แบบเดิม ยังใช้ได้)
  zones?: Zone[];                          // Zone แบบใหม่ (พิกัดฟุต)
  coverage?: Coverage;
}

const key = (c: Cell) => `${c.col},${c.row}`;

// do segments p1-p2 and p3-p4 touch? (touching counts, so a diagonal can't squeeze past a wall corner)
function cross(ax: number, ay: number, bx: number, by: number, cx: number, cy: number) {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}
function onSeg(ax: number, ay: number, bx: number, by: number, px: number, py: number) {
  return Math.min(ax, bx) <= px && px <= Math.max(ax, bx) && Math.min(ay, by) <= py && py <= Math.max(ay, by);
}
export function segmentsTouch(p: number[], q: number[]): boolean {
  const [x1, y1, x2, y2] = p, [x3, y3, x4, y4] = q;
  const d1 = cross(x3, y3, x4, y4, x1, y1), d2 = cross(x3, y3, x4, y4, x2, y2);
  const d3 = cross(x1, y1, x2, y2, x3, y3), d4 = cross(x1, y1, x2, y2, x4, y4);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  return (d1 === 0 && onSeg(x3, y3, x4, y4, x1, y1)) || (d2 === 0 && onSeg(x3, y3, x4, y4, x2, y2))
    || (d3 === 0 && onSeg(x1, y1, x2, y2, x3, y3)) || (d4 === 0 && onSeg(x1, y1, x2, y2, x4, y4));
}

export class GridWorld implements World {
  readonly cols: number; readonly rows: number;
  readonly gridPx: number; readonly cellFt: number;
  walls: WallSeg[];
  heights: Record<string, number>;
  surfaces: Record<string, string>;
  readonly field: ZoneField;
  private list: Creature[];
  private propList: Prop[];
  spent: { actor: string; cost: Cost }[] = [];

  constructor(i: GridInit) {
    this.cols = i.cols; this.rows = i.rows;
    this.gridPx = i.gridPx ?? 100; this.cellFt = i.cellFt ?? 5;
    this.walls = i.walls ?? []; this.heights = i.heights ?? {}; this.surfaces = i.surfaces ?? {};
    this.field = new ZoneField(i.zones ?? [], { cellFt: this.cellFt, coverage: i.coverage });
    this.list = i.creatures ?? [];
    this.propList = i.props ?? [];
  }

  private inside = (c: Cell) => c.col >= 0 && c.row >= 0 && c.col < this.cols && c.row < this.rows;
  private center = (c: Cell) => [(c.col + 0.5) * this.gridPx, (c.row + 0.5) * this.gridPx];

  blocked(from: Cell, to: Cell): boolean {
    if (!this.inside(to)) return true;
    const [ax, ay] = this.center(from), [bx, by] = this.center(to);
    return this.walls.some((w) => segmentsTouch([ax, ay, bx, by], w.c));
  }
  occupant(cell: Cell): Creature | undefined {
    return this.list.find((c) => cell.col >= c.pos.col && cell.col < c.pos.col + c.footprint
      && cell.row >= c.pos.row && cell.row < c.pos.row + c.footprint);
  }
  propAt(cell: Cell): Prop | undefined {
    return this.propList.find((p) => cell.col >= p.pos.col && cell.col < p.pos.col + p.footprint
      && cell.row >= p.pos.row && cell.row < p.pos.row + p.footprint);
  }
  props(): readonly Prop[] { return this.propList; }
  heightAt(cell: Cell): number { return this.heights[key(cell)] ?? 0; }
  // แบบเดิม (map ต่อช่อง) มาก่อน ไม่มีค่อยถาม Zone
  surfaceAt(cell: Cell): string | undefined { return this.surfaces[key(cell)] ?? this.field.surfaceAtCell(cell); }
  zones(): readonly Zone[] { return this.field.zones(); }
  propertiesAt(p: Point): Resolved { return this.field.propertiesAt(p); }
  creatures(): readonly Creature[] { return this.list; }

  // Applies effects to this in-memory world (tests + harness). Returns the log lines.
  apply(effects: Effect[]): string[] {
    const lines: string[] = [];
    const get = (id: string) => this.list.find((c) => c.id === id);
    const thing = (id: string): Thing | undefined => get(id) ?? this.propList.find((p) => p.id === id);
    for (const e of effects) {
      if (e.kind === "log") lines.push(e.text);
      else if (e.kind === "push") { const c = thing(e.target); if (c) c.pos = e.to; }
      else if (e.kind === "prone") { const c = get(e.target); if (c && !c.conditions.includes("prone")) c.conditions.push("prone"); }
      else if (e.kind === "damage") { const c = get(e.target); if (c) c.hp.value = Math.max(0, c.hp.value - e.amount); }
      else if (e.kind === "spendCost") this.spent.push({ actor: e.actor, cost: e.cost });
      // spendItem: no inventory in this world yet
    }
    return lines;
  }
}
