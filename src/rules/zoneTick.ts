// จบรอบ (ทุก 6 วินาที ครั้งเดียวต่อรอบ ไม่ใช่ต่อเทิร์น ไม่งั้นไฟลามหลายรอบในรอบเดียว) Zone ทำอะไรกันเองบ้าง
// pure + อ่านอย่างเดียว: คืน "ข้อเสนอ" ให้ DM ยังไม่แก้อะไร. กฎทั้งหมดเป็น house rule (ตัวเลขมาจากคุณสมบัติของวัสดุ/สาร)
//   ไฟ: เผาเชื้อเพลิงช่องละ 1/รอบ หมด = ไหม้เกรียม · ลามช่องข้างเคียงด้วยโอกาส = flammability · น้ำดับไฟ (ยกเว้นมีน้ำมันลอยอยู่) · ไฟละลายน้ำแข็ง
import type { Cell, World } from "../model/world";
import type { Source } from "../model/zone";
import { inShapes } from "./zoneGeometry";

export type TickKind = "burn" | "out" | "ignite" | "douse" | "melt" | "people";
export interface TickItem { kind: TickKind; cells: Cell[]; text: string; source: Source; act: boolean }

export const MAX_BURNING = 400;                      // เพดานช่องที่ไหม้ต่อการคำนวณ (กันแลค)
const key = (c: Cell) => `${c.col},${c.row}`;
const show = (cs: Cell[], n = 6) => cs.slice(0, n).map((c) => `(${c.col},${c.row})`).join(" ") + (cs.length > n ? ` …อีก ${cs.length - n}` : "");

export function zoneTick(world: World, o: { rng?: () => number } = {}): TickItem[] {
  const rng = o.rng ?? Math.random, s = world.cellFt, out: TickItem[] = [];
  const mid = (c: Cell) => ({ x: (c.col + 0.5) * s, y: (c.row + 0.5) * s });

  // ช่องที่ไหม้: จุดกลางช่องอยู่ในรูปร่างของ Zone ไฟ
  const burning = new Map<string, Cell>();
  for (const z of world.zones()) if (z.kind === "fire" && z.shapes.length) {
    for (const sh of z.shapes) {
      const b = sh.type === "circle" ? { x0: sh.x - sh.r, y0: sh.y - sh.r, x1: sh.x + sh.r, y1: sh.y + sh.r }
        : sh.type === "rect" ? { x0: sh.x, y0: sh.y, x1: sh.x + sh.w, y1: sh.y + sh.h }
        : { x0: Math.min(...sh.points.map((p) => p.x)), y0: Math.min(...sh.points.map((p) => p.y)), x1: Math.max(...sh.points.map((p) => p.x)), y1: Math.max(...sh.points.map((p) => p.y)) };
      for (let c = Math.floor(b.x0 / s); c <= Math.floor(b.x1 / s); c++) for (let r = Math.floor(b.y0 / s); r <= Math.floor(b.y1 / s); r++) {
        const cell = { col: c, row: r };
        if (!burning.has(key(cell)) && inShapes(z.shapes, mid(cell))) burning.set(key(cell), cell);
        if (burning.size > MAX_BURNING) { out.push({ kind: "burn", cells: [], act: true, source: "house", text: `ไฟใหญ่เกิน ${MAX_BURNING} ช่อง: คำนวณแค่ส่วนแรก (DM ควรตัดสินเอง)` }); break; }
      }
    }
  }
  if (!burning.size) return out;

  const fires = world.zones().filter((z) => z.kind === "fire");
  const fuelLeft = (cell: Cell, base: number) => fires.map((z) => z.burn?.[key(cell)]).find((v) => v !== undefined) ?? base;
  const burn: Cell[] = [], dead: Cell[] = [], douse: Cell[] = [], melt: Cell[] = [];
  for (const cell of burning.values()) {
    const r = world.propertiesAt(mid(cell));
    if (r.layers.includes("water") && !r.layers.includes("oil")) { douse.push(cell); continue; }   // น้ำมันลอยบนน้ำ ไฟไหม้ชั้นน้ำมัน น้ำไม่ดับ
    if (r.layers.includes("ice")) melt.push(cell);
    if (r.props.fuel > 0) { const left = fuelLeft(cell, r.props.fuel) - 1; (left <= 0 ? dead : burn).push(cell); }
  }
  if (burn.length) out.push({ kind: "burn", cells: burn, act: false, source: "house", text: `ไฟเผาเชื้อเพลิง ${burn.length} ช่อง (ลดช่องละ 1): ${show(burn)}` });
  if (dead.length) out.push({ kind: "out", cells: dead, act: true, source: "house", text: `เชื้อเพลิงหมด ${dead.length} ช่อง → ไหม้เกรียม ไฟดับ: ${show(dead)}` });
  if (douse.length) out.push({ kind: "douse", cells: douse, act: true, source: "house", text: `น้ำดับไฟ ${douse.length} ช่อง: ${show(douse)}` });
  if (melt.length) out.push({ kind: "melt", cells: melt, act: true, source: "house", text: `ไฟละลายน้ำแข็ง ${melt.length} ช่อง → กลายเป็นน้ำ: ${show(melt)}` });

  // ลามช่องข้างเคียง: โอกาส = flammability ของช่องนั้น (ช่องที่ถูกน้ำดับอยู่ไม่ลามต่อ)
  const dousedKeys = new Set(douse.map(key)), seen = new Set<string>(), hit: Cell[] = [], miss: Cell[] = [];
  for (const cell of burning.values()) {
    if (dousedKeys.has(key(cell))) continue;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { col: cell.col + dc, row: cell.row + dr }, k = key(n);
      if (burning.has(k) || seen.has(k)) continue; seen.add(k);
      const f = world.propertiesAt(mid(n)).props.flammability;
      if (f <= 0) continue;
      (rng() < f ? hit : miss).push(n);
    }
  }
  if (hit.length || miss.length) out.push({ kind: "ignite", cells: hit, act: hit.length > 0, source: "house",
    text: `ไฟลาม: ติดเพิ่ม ${hit.length} ช่อง${hit.length ? " " + show(hit) : ""} · เสี่ยงแต่ไม่ติด ${miss.length} ช่อง (โอกาสตาม flammability, สุ่มไว้แล้ว DM เปลี่ยนได้)` });

  const hurt = world.creatures().filter((c) => burning.has(key({ col: c.pos.col, row: c.pos.row })) && !dousedKeys.has(key(c.pos)));
  if (hurt.length) out.push({ kind: "people", cells: hurt.map((c) => c.pos), act: true, source: "house", text: `${hurt.map((c) => c.name).join(", ")} อยู่ในช่องที่ไหม้: DM กำหนดดาเมจไฟ (ยังไม่มีค่าจาก compendium)` });
  return out;
}
