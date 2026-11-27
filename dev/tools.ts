// Mouse tools on the canvas.
//   move   : drag a creature/prop to a new cell. Click = target, Shift+click = actor
//   height : paint ground height (0 clears)     surface : paint oil/ice/mud/water ("" clears)
//   wall   : click near a cell edge to toggle a wall on it
//   zone   : click to place a Zone (continuous feet)   probe : click to see every layer + reason at that point
import type { Cell } from "../src/model/world";
import { CELL } from "./draw";
import { cellKey, GRID_PX } from "./stage";
import { placeZone } from "./zonePanel";
import { S, creatureById, fits, rebuild, remember, thingAt, thingById } from "./state";

export type Tool = "move" | "height" | "surface" | "wall" | "zone" | "probe";
export const tool = { kind: "move" as Tool, height: -20, surface: "oil" };

function where(cv: HTMLCanvasElement, e: PointerEvent) {
  const r = cv.getBoundingClientRect(), px = ((e.clientX - r.left) * cv.width) / r.width / CELL, py = ((e.clientY - r.top) * cv.height) / r.height / CELL;
  return { col: Math.floor(px), row: Math.floor(py), fx: px - Math.floor(px), fy: py - Math.floor(py), ft: { x: px * S.world.cellFt, y: py * S.world.cellFt } };
}
const inside = (c: Cell) => c.col >= 0 && c.row >= 0 && c.col < S.stage.cols && c.row < S.stage.rows;

// a wall sits on a cell edge: store it as the left or top edge of a cell, so toggling twice removes it
function toggleWall(p: { col: number; row: number; fx: number; fy: number }) {
  const d = { left: p.fx, right: 1 - p.fx, top: p.fy, bottom: 1 - p.fy };
  const near = (Object.entries(d).sort((a, b) => a[1] - b[1])[0][0]) as keyof typeof d;
  const { col, row } = p, G = GRID_PX;
  const c = near === "left" ? [col * G, row * G, col * G, (row + 1) * G]
    : near === "right" ? [(col + 1) * G, row * G, (col + 1) * G, (row + 1) * G]
    : near === "top" ? [col * G, row * G, (col + 1) * G, row * G]
    : [col * G, (row + 1) * G, (col + 1) * G, (row + 1) * G];
  const i = S.stage.walls.findIndex((w) => w.c.every((n, k) => n === c[k]));
  if (i >= 0) S.stage.walls.splice(i, 1); else S.stage.walls.push({ c });
}

function paint(cell: Cell) {
  if (!inside(cell)) return;
  const key = cellKey(cell.col, cell.row);
  if (tool.kind === "height") { if (tool.height === 0) delete S.stage.heights[key]; else S.stage.heights[key] = tool.height; }
  else if (tool.kind === "surface") { if (!tool.surface) delete S.stage.surfaces[key]; else S.stage.surfaces[key] = tool.surface; }
}

// onChange(kind): "select" (no edit), "edit" (board changed)
export function attachTools(cv: HTMLCanvasElement, onChange: (kind: "select" | "edit") => void): void {
  let drag: { id: string; dx: number; dy: number; moved: boolean } | null = null;
  let painting = false;

  cv.onpointerdown = (e) => {
    const p = where(cv, e), cell = { col: p.col, row: p.row };
    cv.setPointerCapture(e.pointerId);
    if (tool.kind === "move") {
      const t = thingAt(cell); if (!t) return;
      S.focus = t.id;
      if (creatureById(t.id)) { if (e.shiftKey) S.actor = t.id; else S.target = t.id; }
      drag = { id: t.id, dx: cell.col - t.pos.col, dy: cell.row - t.pos.row, moved: false };
      S.preview = []; onChange("select");
    } else if (tool.kind === "wall") {
      if (!inside(cell)) return;
      remember(); toggleWall(p); rebuild(); onChange("edit");
    } else if (tool.kind === "zone") {
      if (!inside(cell)) return;
      remember(); placeZone(p.ft, cell); rebuild(); onChange("edit");
    } else if (tool.kind === "probe") {
      S.probe = p.ft; onChange("select");
    } else {
      remember(); painting = true; paint(cell); onChange("edit");
    }
  };
  cv.onpointermove = (e) => {
    const p = where(cv, e), cell = { col: p.col, row: p.row };
    if (drag) {
      const t = thingById(drag.id); if (!t) return;
      const to = { col: cell.col - drag.dx, row: cell.row - drag.dy };
      if ((to.col === t.pos.col && to.row === t.pos.row) || !fits(t, to)) return;
      if (!drag.moved) { remember(); drag.moved = true; }
      t.pos = to; S.preview = []; onChange("edit");
    } else if (painting) { paint(cell); onChange("edit"); }
  };
  cv.onpointerup = cv.onpointercancel = () => { drag = null; painting = false; };
}
