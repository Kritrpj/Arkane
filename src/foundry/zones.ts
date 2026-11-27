// Adapter: Scene Region (Foundry V13) <-> Zone. ที่เดียวที่แตะ Region
// หลักการ: รูปร่างอ่านจาก Region เอง (DM ลาก/ย่อ/ย้ายได้ในตัว) ส่วนข้อมูลอื่นของ Zone เก็บใน flag  arkane-1920s.zone
// ยังไม่ได้ลองกับ Foundry จริง (ชื่อฟิลด์ shapes: circle{x,y,radius} / rectangle{x,y,width,height,rotation}
// / ellipse{x,y,radiusX,radiusY,rotation} / polygon{points:[x0,y0,...]} / hole มาจากความจำ): ตรวจบนเวอร์ชันที่ใช้ก่อน
import type { Clock, Point, Resolved, Shape, Zone } from "../model/zone";
import { CATALOG, type Catalog } from "../data/zones";
import { ZoneField, type AddResult, type Coverage } from "../rules/zones";
import { turnReport, type Report } from "../rules/turnReport";
import { MOD, gridFt, gridSize, origin } from "./snapshot";

const FLAG = "zone";
const num = (v: unknown, d = 0): number => { const n = Number(v); return Number.isFinite(n) ? n : d; };

// ---- พิกเซล <-> ฟุต (ฟุตวัดจากมุมบนซ้ายของกริด)
const ftPerPx = (scene: any) => gridFt(scene) / gridSize(scene);
export const pxToFt = (scene: any, x: number, y: number): Point => {
  const o = origin(scene), k = ftPerPx(scene); return { x: (x - o.x) * k, y: (y - o.y) * k };
};
export const ftToPx = (scene: any, p: Point): Point => {
  const o = origin(scene), k = ftPerPx(scene); return { x: o.x + p.x / k, y: o.y + p.y / k };
};

const rotate = (pts: Point[], cx: number, cy: number, deg: number): Point[] => {
  if (!deg) return pts; const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return pts.map((p) => ({ x: cx + (p.x - cx) * c - (p.y - cy) * s, y: cy + (p.x - cx) * s + (p.y - cy) * c }));
};

export function shapesFromRegion(scene: any, raw: any[]): Shape[] {
  const out: Shape[] = [], k = ftPerPx(scene);
  const poly = (pxPts: Point[], hole: boolean) => out.push({ type: "polygon", points: pxPts.map((p) => pxToFt(scene, p.x, p.y)), hole });
  for (const s of raw ?? []) {
    const hole = s?.hole === true;
    if (s?.type === "circle") { const c = pxToFt(scene, num(s.x), num(s.y)); out.push({ type: "circle", x: c.x, y: c.y, r: num(s.radius) * k, hole }); }
    else if (s?.type === "rectangle") {
      const x = num(s.x), y = num(s.y), w = num(s.width), h = num(s.height), rot = num(s.rotation);
      if (!rot) { const t = pxToFt(scene, x, y); out.push({ type: "rect", x: t.x, y: t.y, w: w * k, h: h * k, hole }); }
      else poly(rotate([{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }], x + w / 2, y + h / 2, rot), hole);   // หมุนรอบจุดกลาง (ยังไม่ได้ตรวจ)
    } else if (s?.type === "ellipse") {
      const cx = num(s.x), cy = num(s.y), rx = num(s.radiusX), ry = num(s.radiusY);
      const pts = Array.from({ length: 32 }, (_, i) => ({ x: cx + rx * Math.cos((i / 32) * 2 * Math.PI), y: cy + ry * Math.sin((i / 32) * 2 * Math.PI) }));
      poly(rotate(pts, cx, cy, num(s.rotation)), hole);
    } else if (s?.type === "polygon" && Array.isArray(s.points)) {
      const pts: Point[] = []; for (let i = 0; i + 1 < s.points.length; i += 2) pts.push({ x: num(s.points[i]), y: num(s.points[i + 1]) });
      if (pts.length >= 3) poly(pts, hole);
    } else console.warn(MOD, "zone: ไม่รองรับรูปร่าง Region ชนิด", s?.type);
  }
  return out;
}

export function shapesToRegion(scene: any, shapes: readonly Shape[]): any[] {
  const k = ftPerPx(scene);
  return shapes.map((s) => {
    const hole = s.hole === true;
    if (s.type === "circle") { const c = ftToPx(scene, s); return { type: "circle", x: c.x, y: c.y, radius: s.r / k, hole }; }
    if (s.type === "rect") { const c = ftToPx(scene, s); return { type: "rectangle", x: c.x, y: c.y, width: s.w / k, height: s.h / k, rotation: 0, hole }; }
    return { type: "polygon", points: s.points.flatMap((p) => { const c = ftToPx(scene, p); return [c.x, c.y]; }), hole };
  });
}

// ---- Region -> Zone (ไม่ใช่ Region ของเรา = ข้าม)
export function zoneFromRegion(scene: any, region: any): Zone | null {
  let f: any; try { f = region?.getFlag?.(MOD, FLAG); } catch { /* no flag */ }
  if (!f || typeof f !== "object" || typeof f.kind !== "string") return null;
  const shapes = shapesFromRegion(scene, region.shapes ? [...region.shapes] : []);
  return shapes.length ? { ...f, id: String(region.id), shapes, permanent: f.permanent === true } : null;
}
export function regionZones(scene: any): Zone[] {
  const regs: any[] = scene?.regions?.contents ?? (scene?.regions ? [...scene.regions.values()] : []);
  return regs.map((r) => zoneFromRegion(scene, r)).filter((z): z is Zone => !!z);
}

// เทมเพลตน้ำมันเดิม (Measured Template ป้าย oil ที่ combatx.js สร้าง) -> Zone วงกลม (พฤติกรรมเดิม: จุดกลางช่องอยู่ในรัศมี)
export function oilTemplateZones(scene: any): Zone[] {
  const tpl: any[] = scene?.templates?.contents ?? [];
  return tpl.filter((t) => { try { return !!t.getFlag?.(MOD, "oil"); } catch { return false; } }).map((t, i) => {
    const c = pxToFt(scene, num(t.x), num(t.y));
    return { id: `tpl:${t.id ?? i}`, kind: "oil", permanent: false, shapes: [{ type: "circle", x: c.x, y: c.y, r: num(t.distance) } as Shape] };
  });
}

export function coverageOf(scene: any): Coverage | undefined {
  let f: any; try { f = scene?.getFlag?.(MOD, "zoneCoverage"); } catch { /* none */ }
  return f?.mode === "fraction" && num(f.min) > 0 ? { mode: "fraction", min: num(f.min) } : undefined;
}

export const fieldOf = (scene: any, catalog: Catalog = CATALOG): ZoneField =>
  new ZoneField([...regionZones(scene), ...oilTemplateZones(scene)], { cellFt: gridFt(scene), coverage: coverageOf(scene), catalog });

// ---- ฝั่ง GM (ผู้เล่นแก้ scene ไม่ได้): สร้าง/แก้/ลบ
const flagOf = (z: Zone) => { const { id, shapes, ...rest } = z; return rest; };
const colorOf = (z: Zone, cat: Catalog = CATALOG) => (cat.substances[z.kind] ?? cat.materials[z.kind])?.color ?? "#ffffff";

// สร้าง Zone (merge กับของเดิมชนิดเดียวกันอัตโนมัติ) แล้วเขียนลง Region
export async function createZone(scene: any, zone: Zone, catalog: Catalog = CATALOG): Promise<AddResult> {
  const field = new ZoneField(regionZones(scene), { cellFt: gridFt(scene), catalog });
  const res = field.add(zone);
  if (!res.ok || !res.zone) { ui?.notifications?.warn?.(res.warning ?? "สร้าง Zone ไม่ได้"); return res; }
  const z = res.zone, data = { shapes: shapesToRegion(scene, z.shapes), [`flags.${MOD}.${FLAG}`]: flagOf(z) };
  if (res.updated) {
    await scene.regions.get(z.id)?.update(data);
    if (res.removed.length) await scene.deleteEmbeddedDocuments("Region", res.removed);
  } else {
    const [doc] = await scene.createEmbeddedDocuments("Region", [{
      name: z.name ?? (catalog.substances[z.kind] ?? catalog.materials[z.kind])?.label ?? z.kind, color: colorOf(z, catalog),
      shapes: data.shapes, flags: { [MOD]: { [FLAG]: flagOf(z) } },
    }]);
    if (doc?.id) res.zone = { ...z, id: String(doc.id) };
  }
  return res;
}

// DM ลาก Region เองแล้วติดป้าย (แบบ A): เลือกวัสดุ/สารจากรายการ แล้วปรับตัวเลขทับทีละค่าได้ผ่าน extra.overrides
export async function labelRegion(scene: any, regionId: string, kind: string, extra: Partial<Zone> = {}, catalog: Catalog = CATALOG): Promise<boolean> {
  const region = scene.regions?.get(regionId);
  if (!region) { ui?.notifications?.warn?.(`ไม่พบ Region ${regionId}`); return false; }
  const isMat = !!catalog.materials[kind];
  if (!isMat && !catalog.substances[kind]) { ui?.notifications?.warn?.(`ไม่รู้จักชนิด "${kind}"`); return false; }
  const { id, shapes, ...rest } = extra as any;
  await region.setFlag(MOD, FLAG, { kind, permanent: isMat, ...rest });
  await region.update({ color: colorOf({ kind } as Zone, catalog) });
  return true;
}

export async function removeZones(scene: any, ids: string[]): Promise<void> {
  const real = ids.filter((id) => scene.regions?.get(id));
  if (real.length) await scene.deleteEmbeddedDocuments("Region", real);
}

// ลบที่หมดอายุ (เรียกจาก hook ฝั่ง GM)
export async function sweepZones(scene: any, clock: Clock): Promise<string[]> {
  const gone = fieldOf(scene).sweep(clock);
  await removeZones(scene, gone); return gone;
}
// สมาธิหลุด: ปิด Zone ที่ผูกกับผู้เสกนี้ (id ที่ใช้ตอนสร้าง Zone เช่น actor id)
export async function closeConcentration(scene: any, casterId: string): Promise<string[]> {
  const ids = regionZones(scene).filter((z) => z.concentration && z.caster === casterId).map((z) => z.id);
  await removeZones(scene, ids); return ids;
}

export function currentClock(): Clock {
  const c = game.combat;
  return { round: c?.started ? num(c.round) : undefined, combat: c?.id, worldTime: num(game.time?.worldTime) };
}

// ส่องจุดบนแมพ (พิกเซล) ดูว่ามีอะไรซ้อนอยู่ พร้อมเหตุผลทุกค่า
export function inspectPoint(scene: any, x: number, y: number): Resolved & { feet: Point } {
  const feet = pxToFt(scene, x, y);
  return { ...fieldOf(scene).propertiesAt(feet), feet };
}

// hook ฝั่ง GM: ตรวจหมดอายุตอนเปลี่ยนรอบ/เวลาโลกเดิน (ชื่อ hook ยังไม่ได้ลองกับเวอร์ชันจริง)
export function registerZoneHooks(): void {
  if (typeof Hooks === "undefined") return;
  const run = () => {
    if (!game.users?.activeGM?.isSelf) return;
    for (const scene of game.scenes ?? []) sweepZones(scene, currentClock()).catch((e) => console.warn(MOD, "zone sweep", e));
  };
  // ถึงเทิร์นใคร (เปลี่ยน turn/round): ลบที่หมดอายุก่อน แล้วถ้าเปิด autoReport ค่อยส่งสรุปให้ GM
  Hooks.on("updateCombat", (combat: any, changed: any) => {
    run();
    if (autoMode === "off" || !game.users?.activeGM?.isSelf || (changed?.turn === undefined && changed?.round === undefined)) return;
    const scene = game.scenes.get(combat?.scene?.id ?? combat?.sceneId); const tok = combat?.combatant?.tokenId;
    // เปลี่ยนรอบ = Zone ทำงานกันเอง (สรุปทั้งกระดานครั้งเดียว) · เปลี่ยนแค่เทิร์น = สรุปเฉพาะคนนั้น
    if (scene && tok) reportZones(scene, changed.round !== undefined ? undefined : tok, { tick: changed.round !== undefined, auto: true }).catch((e) => console.warn(MOD, "zone report", e));
  });
  Hooks.on("updateWorldTime", run);
}

// ---- สรุปให้ DM (whisper หา GM). ข้อเสนอเท่านั้น ไม่ apply อะไร
const escH = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
export async function reportZones(scene: any, whoTokenId?: string, o: { tick?: boolean; auto?: boolean } = {}): Promise<Report> {
  const { FoundryWorld } = await import("./world");
  const report = turnReport(new FoundryWorld(scene), currentClock(), { whose: whoTokenId, tick: o.tick });
  // ข้อความไม่ท่วมแชท: การ์ดเดียวต่อครั้ง, ข้อที่ต้องตัดสินแสดงเลย, ที่เหลือพับไว้ใน <details>
  const li = (xs: typeof report.items) => xs.map((i) => `<li>${escH(i.text)} <small>[${i.source}]${i.proposal ? " · มีข้อเสนอ" : ""}</small></li>`).join("");
  const act = report.items.filter((i) => i.level === "act"), info = report.items.filter((i) => i.level !== "act");
  const html = `<div class="rw-card"><b>${escH(report.title)}</b>${act.length ? `<ul>${li(act)}</ul>` : ""}`
    + (info.length ? `<details><summary>รู้ไว้ ${info.length} ข้อ</summary><ul>${li(info)}</ul></details>` : "") + `</div>`;
  if (autoMode !== "all" && !act.length && o.auto) return report;                  // อัตโนมัติ: ไม่มีอะไรให้ตัดสิน = เงียบ
  await ChatMessage.create({ whisper: ChatMessage.getWhisperRecipients("GM").map((u: any) => u.id), content: html });
  return report;
}
// off = ไม่ส่งเอง · act = ส่งเฉพาะเมื่อมีข้อที่ DM ต้องตัดสิน (ค่าแนะนำ) · all = ส่งทุกเทิร์น
type AutoMode = "off" | "act" | "all";
let autoMode: AutoMode = "off";
export const setAutoReport = (m: boolean | AutoMode): void => { autoMode = m === true ? "act" : m === false ? "off" : m; };
