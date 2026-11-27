// กฎกลางของ Zone (pure): ซ้อนชั้นต่อคุณสมบัติ, merge, หมดอายุ, สมาธิ, ปริมาตร -> รูปร่าง
// ไม่ตัดสินแทน DM: ทุกอย่างที่ออกจากที่นี่เป็นข้อมูลให้ adapter/DM ใช้ พร้อม trace บอกที่มา
import type { Cell } from "../model/world";
import type { Clock, Expiry, Hazard, Point, Props, Resolved, Shape, Source, Zone } from "../model/zone";
import { BASE_PROPS, CATALOG, HASH_FT, MAX_ZONES, ROUND_SEC, type Catalog, type Preset } from "../data/zones";
import { anyTouch, boxOfShapes, inShapes, type Box } from "./zoneGeometry";

let counter = 0;
export function makeZone(o: Partial<Zone> & Pick<Zone, "kind" | "shapes">): Zone {
  return { id: `z${++counter}`, permanent: false, ...o };
}

// ---------- ปริมาตร -> รูปร่าง (โหมดตามปริมาตร: ใช้กับกฎ physics)
export const FT3_PER_GAL = 0.133681;                         // 1 แกลลอนสหรัฐ = 231 in³
export const gallonsToFt3 = (g: number): number => g * FT3_PER_GAL;
export const radiusFromVolume = (ft3: number, depthFt: number): number => Math.sqrt(ft3 / depthFt / Math.PI);

export function zoneFromVolume(o: { id?: string; kind: string; center: Point; depth: number; gallons?: number; ft3?: number } & Partial<Zone>): Zone {
  const { center, depth, gallons, ft3, ...rest } = o;
  const volume = ft3 ?? gallonsToFt3(gallons ?? 0);
  if (!(volume > 0) || !(depth > 0)) throw new Error("zoneFromVolume: ต้องมีปริมาตรและความลึกมากกว่า 0");
  return makeZone({ ...rest, volume, depth, shapes: [{ type: "circle", x: center.x, y: center.y, r: radiusFromVolume(volume, depth) }] });
}

// ---------- เวลา: 1 รอบ = 6 วินาที
export const minutesToRounds = (m: number): number => m * 10;
export function expiryAfter(rounds: number, clock: Clock): Expiry {
  return clock.round !== undefined
    ? { kind: "round", at: clock.round + rounds, combat: clock.combat }
    : { kind: "world", at: clock.worldTime + rounds * ROUND_SEC };
}
export function isExpired(z: Zone, clock: Clock): boolean {
  const e = z.expires;
  if (!e || z.permanent) return false;
  if (e.kind === "world") return clock.worldTime >= e.at;
  // ผูกกับ combat นั้น: ถ้าไม่มี combat อยู่/เป็นคนละอัน ไม่หมดเอง (DM ปิดเองได้)
  return clock.round !== undefined && (e.combat === undefined || e.combat === clock.combat) && clock.round >= e.at;
}

// ---------- สมาธิ: ผู้เสกโดนดาเมจ -> ข้อเสนอ CON save (DM ตัดสิน)
export const concentrationDC = (damage: number): number => Math.max(10, Math.floor(damage / 2));
export const zonesBoundTo = (zones: readonly Zone[], casterId: string): string[] =>
  zones.filter((z) => z.concentration && z.caster === casterId).map((z) => z.id);

// ---------- ซ้อนชั้น (ต่อคุณสมบัติ ไม่ใช่ต่อ Zone)
const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
const layerOf = (z: Zone, p: Preset) => z.layer ?? p.layer;

export function resolveZones(zs: readonly Zone[], cat: Catalog = CATALOG): Resolved {
  const trace: string[] = [];
  const mats: [Zone, Preset][] = [], subs: [Zone, Preset][] = [];
  for (const z of zs) {
    const m = cat.materials[z.kind], s = cat.substances[z.kind];
    if (m) mats.push([z, m]); else if (s) subs.push([z, s]); else trace.push(`Zone "${z.kind}" ไม่รู้จักใน catalog (ข้าม)`);
  }
  const order = (a: [Zone, Preset], b: [Zone, Preset]) => layerOf(...a) - layerOf(...b) || a[0].id.localeCompare(b[0].id);
  mats.sort(order); subs.sort(order);

  const props: Props = { ...BASE_PROPS };
  let surface: string | undefined;
  const sources: Resolved["sources"] = {};
  const mark = (p: Partial<Props>, s: Source) => { for (const k of Object.keys(p) as (keyof Props)[]) sources[k] = s; };
  const layers: string[] = [];
  const hazards = new Map<string, Hazard>();
  const override = (z: Zone) => {
    for (const [k, v] of Object.entries(z.overrides ?? {})) { (props as any)[k] = v; sources[k as keyof Props] = "house"; trace.push(`${k} = ${v} ← DM แก้ทับที่ ${z.kind}`); }
  };

  // วัสดุ: ชิ้นบนสุดเป็นพื้นจริงของจุดนั้น
  const top = mats[mats.length - 1];
  if (top) {
    Object.assign(props, top[1].props); mark(top[1].props, top[1].source);
    layers.push(top[0].kind);
    trace.push(`พื้น = ${top[1].label} [${top[1].source}]`);
    override(top[0]);
  } else trace.push(`พื้น = เปล่า (mu ${BASE_PROPS.mu}) [house]`);

  // สาร: ล่างขึ้นบน. mu ชั้นบนสุดชนะ, ติดไฟ/นำไฟฟ้า/ความแข็ง = สูงสุด, เชื้อเพลิง = บวก, difficult = OR, บัง = สูงสุด
  for (const [z, s] of subs) {
    layers.push(z.kind);
    if (s.adjust?.flammability) {
      const { mul = 1, add = 0 } = s.adjust.flammability;
      props.flammability = clamp01(props.flammability * mul + add);
      trace.push(`flammability ปรับเป็น ${props.flammability} เพราะ ${s.label} [${s.source}]`);
    }
    const p = s.props; mark(p, s.source);
    if (p.mu !== undefined) { props.mu = p.mu; surface = z.kind; trace.push(`mu = ${p.mu} ← ${s.label} (ชั้นบนสุดชนะ) [${s.source}]`); }
    if (p.flammability !== undefined) props.flammability = Math.max(props.flammability, p.flammability);
    if (p.conductivity !== undefined) props.conductivity = Math.max(props.conductivity, p.conductivity);
    if (p.hardness !== undefined) props.hardness = Math.max(props.hardness, p.hardness);
    if (p.fuel !== undefined) props.fuel += p.fuel;
    if (p.difficult) props.difficult = true;
    if (p.obscured !== undefined) props.obscured = Math.max(props.obscured, p.obscured) as Props["obscured"];
    override(z);
  }
  for (const [z] of [...mats, ...subs]) if (z.hazard) {
    const key = z.hazard.name ?? z.kind;                       // ชื่อเดียวกันไม่ทบ: เก็บอันแรง
    const old = hazards.get(key);
    if (!old || z.hazard.amount > old.amount) hazards.set(key, z.hazard);
  }
  props.flammability = clamp01(props.flammability);
  return { props, surface, layers, hazards: [...hazards.values()], sources, trace };
}

// ---------- spatial hash: ถามจุด/กล่องแล้วได้เฉพาะ Zone ใกล้ ๆ ไม่เทียบทุกอัน
class SpatialHash {
  private buckets = new Map<string, Zone[]>();
  private big: Zone[] = [];
  constructor(private size = HASH_FT) {}
  private span(b: Box) {
    return { i0: Math.floor(b.x0 / this.size), i1: Math.floor(b.x1 / this.size), j0: Math.floor(b.y0 / this.size), j1: Math.floor(b.y1 / this.size) };
  }
  build(zones: readonly Zone[]) {
    this.buckets.clear(); this.big = [];
    for (const z of zones) {
      if (!z.shapes.length) continue;
      const s = this.span(boxOfShapes(z.shapes));
      if ((s.i1 - s.i0 + 1) * (s.j1 - s.j0 + 1) > 1024) { this.big.push(z); continue; }   // ก้อนใหญ่มาก (เช่นป่า) ไม่ต้องกระจายทุกช่อง
      for (let i = s.i0; i <= s.i1; i++) for (let j = s.j0; j <= s.j1; j++) {
        const k = `${i},${j}`; const a = this.buckets.get(k); if (a) a.push(z); else this.buckets.set(k, [z]);
      }
    }
  }
  query(b: Box): Zone[] {
    const s = this.span(b), seen = new Set<Zone>(this.big);
    if ((s.i1 - s.i0 + 1) * (s.j1 - s.j0 + 1) > 1024) { for (const a of this.buckets.values()) a.forEach((z) => seen.add(z)); return [...seen]; }
    for (let i = s.i0; i <= s.i1; i++) for (let j = s.j0; j <= s.j1; j++) this.buckets.get(`${i},${j}`)?.forEach((z) => seen.add(z));
    return [...seen];
  }
}

// ช่องนับว่าถูกคลุมเมื่อ: จุดกลางอยู่ในรูปร่าง (center) หรือรูปร่างคลุมเกินสัดส่วน min (fraction, สุ่มจุด 5x5)
export type Coverage = { mode: "center" } | { mode: "fraction"; min: number };

export interface AddResult {
  ok: boolean;
  zone?: Zone;            // ผลลัพธ์หลัง merge (id คือของก้อนเดิมถ้า merge)
  removed: string[];      // id ที่ถูกกลืนเข้าก้อนอื่น (ต้องลบออกจาก Foundry)
  updated: boolean;       // true = zone.id มีอยู่เดิมแล้วถูกแก้ (ไม่ใช่สร้างใหม่)
  warning?: string;
}

const later = (a?: Expiry, b?: Expiry): Expiry | undefined => !a ? b : !b ? a : a.kind === b.kind ? (b.at > a.at ? b : a) : a;

export class ZoneField {
  readonly cellFt: number;
  coverage: Coverage;
  catalog: Catalog;
  private list: Zone[];
  private hash = new SpatialHash();
  private dirty = true;

  constructor(zones: readonly Zone[] = [], o: { cellFt?: number; coverage?: Coverage; catalog?: Catalog } = {}) {
    this.list = [...zones];
    this.cellFt = o.cellFt ?? 5; this.coverage = o.coverage ?? { mode: "center" }; this.catalog = o.catalog ?? CATALOG;
  }
  zones(): readonly Zone[] { return this.list; }
  get(id: string): Zone | undefined { return this.list.find((z) => z.id === id); }
  private idx(): SpatialHash { if (this.dirty) { this.hash.build(this.list); this.dirty = false; } return this.hash; }

  zonesAt(p: Point): Zone[] {
    return this.idx().query({ x0: p.x, y0: p.y, x1: p.x, y1: p.y }).filter((z) => inShapes(z.shapes, p));
  }
  propertiesAt(p: Point): Resolved { return resolveZones(this.zonesAt(p), this.catalog); }

  zonesOfCell(cell: Cell): Zone[] {
    const s = this.cellFt, x0 = cell.col * s, y0 = cell.row * s;
    const cands = this.idx().query({ x0, y0, x1: x0 + s, y1: y0 + s });
    if (this.coverage.mode === "center") { const c = { x: x0 + s / 2, y: y0 + s / 2 }; return cands.filter((z) => inShapes(z.shapes, c)); }
    const N = 5, min = this.coverage.min;
    return cands.filter((z) => {
      let hit = 0;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (inShapes(z.shapes, { x: x0 + ((i + 0.5) / N) * s, y: y0 + ((j + 0.5) / N) * s })) hit++;
      return hit / (N * N) >= min;
    });
  }
  propertiesOfCell(cell: Cell): Resolved { return resolveZones(this.zonesOfCell(cell), this.catalog); }
  surfaceAtCell(cell: Cell): string | undefined { return this.propertiesOfCell(cell).surface; }

  // เฉพาะ "สาร" ชนิดเดียวกันที่ซ้อน/ติดกัน รวมเป็นก้อนเดียว (คาถาชื่อเดียวกันไม่ทบ)
  // สมาธิ: รวมเฉพาะของผู้เสกคนเดียวกัน ไม่งั้นปิดทีเดียวทั้งก้อนผิดคน
  private mergeHits(z: Zone): Zone[] {
    if (z.permanent || !this.catalog.substances[z.kind] || !z.shapes.length) return [];
    const b = boxOfShapes(z.shapes), pad = 0.01;
    return this.idx().query({ x0: b.x0 - pad, y0: b.y0 - pad, x1: b.x1 + pad, y1: b.y1 + pad }).filter((o) =>
      o.id !== z.id && o.kind === z.kind && !o.permanent && !!o.concentration === !!z.concentration
      && (!z.concentration || o.caster === z.caster) && anyTouch(o.shapes, z.shapes));
  }

  add(z: Zone): AddResult {
    if (this.list.some((e) => e.id === z.id)) return { ok: false, removed: [], updated: false, warning: `id ${z.id} ซ้ำ` };
    const hits = this.mergeHits(z);
    if (!hits.length) {
      if (this.list.length >= MAX_ZONES) return { ok: false, removed: [], updated: false, warning: `Zone ครบเพดาน ${MAX_ZONES} อันต่อฉาก (ไม่สร้างเพิ่ม): ให้ DM ลบหรือรวมของเดิม` };
      this.list.push(z); this.dirty = true;
      return { ok: true, zone: z, removed: [], updated: false };
    }
    const all = [...hits, z], vols = all.map((a) => a.volume).filter((v): v is number => v !== undefined);
    const deps = all.map((a) => a.depth).filter((v): v is number => v !== undefined);
    const merged: Zone = {
      ...hits[0],
      shapes: all.flatMap((a) => a.shapes),
      volume: vols.length ? vols.reduce((s, v) => s + v, 0) : undefined,
      depth: deps.length ? Math.max(...deps) : undefined,
      expires: all.map((a) => a.expires).reduce(later, undefined),
    };
    this.list = this.list.filter((e) => !hits.includes(e)); this.list.push(merged); this.dirty = true;
    return { ok: true, zone: merged, removed: hits.slice(1).map((h) => h.id), updated: true };
  }

  remove(id: string): boolean {
    const n = this.list.length; this.list = this.list.filter((z) => z.id !== id); this.dirty = true; return this.list.length < n;
  }
  removeMany(ids: string[]): void { for (const id of ids) this.remove(id); }

  // ลบที่หมดอายุ คืน id ที่ลบ
  sweep(clock: Clock): string[] {
    const gone = this.list.filter((z) => isExpired(z, clock)).map((z) => z.id);
    this.removeMany(gone); return gone;
  }
}
