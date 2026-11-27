// Paints the board on the canvas. Reads state, changes nothing.
import { S, isProp, thingById } from "./state";
import { GRID_PX } from "./stage";
import type { Thing } from "../src/model/thing";
import type { Shape, Zone } from "../src/model/zone";
import { CATALOG } from "../src/data/zones";
import { boxOfShapes } from "../src/rules/zoneGeometry";

export const CELL = 40;
const SURFACE: Record<string, string> = { oil: "#2f2810", ice: "#183044", mud: "#2b2016", water: "#14283a" };

function label(g: CanvasRenderingContext2D, text: string, x: number, y: number, size = 10, color = "#fff") {
  g.fillStyle = color; g.font = `${size}px sans-serif`; g.textAlign = "center"; g.fillText(text, x, y); g.textAlign = "start";
}

const presetOf = (z: Zone) => CATALOG.substances[z.kind] ?? CATALOG.materials[z.kind];
function shapePath(g: CanvasRenderingContext2D, s: Shape, k: number) {
  if (s.type === "circle") g.arc(s.x * k, s.y * k, s.r * k, 0, 7);
  else if (s.type === "rect") g.rect(s.x * k, s.y * k, s.w * k, s.h * k);
  else { s.points.forEach((p, i) => (i ? g.lineTo(p.x * k, p.y * k) : g.moveTo(p.x * k, p.y * k))); g.closePath(); }
}
// Zone: ฟุตต่อเนื่อง ไม่ปัดตามช่อง. จุดเล็ก ๆ กลางช่อง = จุดตัวอย่างที่ระบบถามว่าช่องนี้ถูกคลุมไหม (เหลือง = ถูกคลุม)
function drawZones(g: CanvasRenderingContext2D) {
  const k = CELL / S.world.cellFt;
  const zs = [...S.stage.zones].sort((a, b) => (a.layer ?? presetOf(a)?.layer ?? 0) - (b.layer ?? presetOf(b)?.layer ?? 0));
  for (const z of zs) {
    const col = presetOf(z)?.color ?? "#fff";
    g.fillStyle = col; g.strokeStyle = col;
    g.globalAlpha = 0.4; g.beginPath(); for (const s of z.shapes) if (!s.hole) shapePath(g, s, k); g.fill();
    g.globalAlpha = 0.9; g.beginPath(); for (const s of z.shapes) if (!s.hole) shapePath(g, s, k); g.stroke(); g.globalAlpha = 1;
    if (z.shapes.length) {
      const b = boxOfShapes(z.shapes), left = z.expires?.kind === "round" ? ` (${Math.max(0, z.expires.at - S.round)})` : "";
      label(g, z.kind + left, ((b.x0 + b.x1) / 2) * k, ((b.y0 + b.y1) / 2) * k + 3, 10, "#fff");
    }
  }
  for (let r = 0; r < S.stage.rows; r++) for (let c = 0; c < S.stage.cols; c++) {
    if (!S.stage.zones.length) break;
    g.fillStyle = S.world.field.zonesOfCell({ col: c, row: r }).length ? "#ffd75e" : "#44444c";
    g.beginPath(); g.arc((c + 0.5) * CELL, (r + 0.5) * CELL, 2, 0, 7); g.fill();
  }
  if (S.probe) {
    const x = S.probe.x * k, y = S.probe.y * k; g.strokeStyle = "#7ff"; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(x - 7, y); g.lineTo(x + 7, y); g.moveTo(x, y - 7); g.lineTo(x, y + 7); g.stroke(); g.lineWidth = 1;
  }
}

function drawThing(g: CanvasRenderingContext2D, t: Thing, ghost = false) {
  const x = t.pos.col * CELL, y = t.pos.row * CELL, s = t.footprint * CELL;
  g.globalAlpha = ghost ? 0.35 : 1;
  if (isProp(t)) {
    g.fillStyle = t.tags.includes("immovable") ? "#3a3a44" : t.material === "stone" ? "#8a8a92" : t.material === "iron" ? "#5d6b7a" : t.material === "water" ? "#3b6b8f" : "#6b5330";
    g.fillRect(x + 4, y + 4, s - 8, s - 8);
    if (!ghost) { label(g, t.name, x + s / 2, y + s / 2 - 1); label(g, `${Math.round(t.mass)} lb`, x + s / 2, y + s / 2 + 11); }
  } else {
    g.fillStyle = t.id === S.actor ? "#3b6fd1" : t.id === S.target ? "#c4482f" : "#6a6a72";
    g.beginPath(); g.arc(x + s / 2, y + s / 2, s / 2 - 4, 0, 7); g.fill();
    if (!ghost) {
      const c = S.stage.creatures.find((k) => k.id === t.id)!;
      label(g, c.name + (c.conditions.includes("prone") ? " ↓" : "") + (c.tags.includes("flying") ? " ✈" : ""), x + s / 2, y + s / 2 - 1, 11);
      label(g, `${c.hp.value}/${c.hp.max} · ${Math.round(c.mass)}lb`, x + s / 2, y + s / 2 + 11, 10);
    }
  }
  g.globalAlpha = 1;
}

export function draw(cv: HTMLCanvasElement): void {
  const g = cv.getContext("2d")!, st = S.stage;
  cv.width = st.cols * CELL; cv.height = st.rows * CELL;

  for (let r = 0; r < st.rows; r++) for (let c = 0; c < st.cols; c++) {
    const k = `${c},${r}`, h = st.heights[k] ?? 0, sf = st.surfaces[k];
    g.fillStyle = h < 0 ? "#05050a" : h > 0 ? "#22222c" : (sf && SURFACE[sf]) || "#14141a";
    g.fillRect(c * CELL, r * CELL, CELL, CELL);
    if (h !== 0 && sf) { g.fillStyle = SURFACE[sf] ?? "#222"; g.globalAlpha = 0.6; g.fillRect(c * CELL, r * CELL + CELL - 12, CELL, 12); g.globalAlpha = 1; }
    g.strokeStyle = "#232329"; g.strokeRect(c * CELL, r * CELL, CELL, CELL);
    if (h !== 0) label(g, `${h > 0 ? "+" : ""}${h}ft`, c * CELL + CELL / 2, r * CELL + 13, 10, "#8899cc");
    if (sf) label(g, sf, c * CELL + CELL / 2, r * CELL + CELL - 4, 10, "#cdb88a");
  }

  drawZones(g);

  const k = CELL / GRID_PX;
  g.lineWidth = 3;
  for (const w of st.walls) { g.strokeStyle = w.door ? "#e8b84a" : "#d55"; g.beginPath(); g.moveTo(w.c[0] * k, w.c[1] * k); g.lineTo(w.c[2] * k, w.c[3] * k); g.stroke(); }
  g.lineWidth = 1;

  for (const e of S.preview) if (e.kind === "push") {                  // where each pushed thing will end up
    const t = thingById(e.target); if (!t) continue;
    drawThing(g, { ...t, pos: e.to }, true);
  }
  for (const p of st.props) drawThing(g, p);
  for (const c of st.creatures) drawThing(g, c);

  for (const e of S.preview) if (e.kind === "push") {                  // arrows
    const t = thingById(e.target); if (!t) continue;
    const a = (n: number) => (n + t.footprint / 2) * CELL;
    g.strokeStyle = "#7f7"; g.lineWidth = 3; g.setLineDash([6, 4]); g.beginPath();
    g.moveTo(a(t.pos.col), a(t.pos.row)); g.lineTo(a(e.to.col), a(e.to.row)); g.stroke(); g.setLineDash([]); g.lineWidth = 1;
  }

  const f = thingById(S.focus);                                         // focus outline
  if (f) { g.strokeStyle = "#ffd75e"; g.setLineDash([3, 3]); g.strokeRect(f.pos.col * CELL + 1, f.pos.row * CELL + 1, f.footprint * CELL - 2, f.footprint * CELL - 2); g.setLineDash([]); }
}
