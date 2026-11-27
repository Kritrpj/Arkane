/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  FRICTION,
  Fx
} from "./chunk-HNCV3QLI.js";
import {
  MOD,
  gridFt,
  gridSize,
  origin
} from "./chunk-VELQ4LWX.js";

// src/data/zones.ts
var MAX_ZONES = 200;
var HASH_FT = 10;
var ROUND_SEC = 6;
var BASE_PROPS = {
  mu: FRICTION.floor,
  flammability: 0,
  fuel: 0,
  conductivity: 0,
  hardness: 0,
  difficult: false,
  obscured: 0
};
var MATERIALS = {
  stone: { label: "\u0E2B\u0E34\u0E19", layer: 0, source: "house", color: "#888888", props: { flammability: 0, fuel: 0, conductivity: 0.05, hardness: 8 } },
  wood: { label: "\u0E44\u0E21\u0E49", layer: 0, source: "house", color: "#8b5a2b", props: { flammability: 0.6, fuel: 3, conductivity: 0.05, hardness: 3 } },
  metal: { label: "\u0E40\u0E2B\u0E25\u0E47\u0E01", layer: 0, source: "house", color: "#9aa5b1", props: { flammability: 0, fuel: 0, conductivity: 1, hardness: 9 } },
  dirt: { label: "\u0E14\u0E34\u0E19", layer: 0, source: "house", color: "#6b4f2a", props: { flammability: 0.05, fuel: 0, conductivity: 0.1, hardness: 2 } },
  grass: { label: "\u0E2B\u0E0D\u0E49\u0E32", layer: 0, source: "house", color: "#4a8c3a", props: { flammability: 0.5, fuel: 1, conductivity: 0.05, hardness: 1 } },
  sand: { label: "\u0E17\u0E23\u0E32\u0E22", layer: 0, source: "house", color: "#d8c27a", props: { flammability: 0, fuel: 0, conductivity: 0.05, hardness: 1 } },
  forest: { label: "\u0E1B\u0E48\u0E32", layer: 0, source: "house", color: "#2f6b2f", props: { flammability: 0.6, fuel: 5, conductivity: 0.05, hardness: 2 } }
};
var SUBSTANCES = {
  water: {
    label: "\u0E19\u0E49\u0E33",
    layer: 10,
    source: "house",
    color: "#3b7dd8",
    props: { mu: FRICTION.water, conductivity: 0.6 },
    adjust: { flammability: { mul: 0.1 } }
  },
  // ไม้เปียกติดไฟยากมาก
  mud: { label: "\u0E42\u0E04\u0E25\u0E19", layer: 11, source: "house", color: "#5a4632", props: { mu: FRICTION.mud, conductivity: 0.3 } },
  oil: {
    label: "\u0E19\u0E49\u0E33\u0E21\u0E31\u0E19",
    layer: 20,
    source: "house",
    color: "#2b2b2b",
    // ลอยบนน้ำ จึงอยู่ชั้นบน
    props: { mu: FRICTION.oil, flammability: 0.9, fuel: 2 }
  },
  // TODO(ยังไม่ได้ตรวจ): "difficult terrain + DEX save" ของน้ำแข็งตาม DMG ต้องอ่านจาก compendium ก่อนยืนยัน
  ice: {
    label: "\u0E19\u0E49\u0E33\u0E41\u0E02\u0E47\u0E07",
    layer: 25,
    source: "unchecked",
    color: "#bfe6f5",
    props: { mu: FRICTION.ice, conductivity: 0.1, difficult: true }
  },
  fire: { label: "\u0E44\u0E1F", layer: 30, source: "house", color: "#e8590c", props: { flammability: 0 } }
  // ดาเมจไฟ: TODO ดึงจาก compendium/DM
};
var CATALOG = { materials: MATERIALS, substances: SUBSTANCES };

// src/rules/zoneGeometry.ts
var rectPoly = (s) => [{ x: s.x, y: s.y }, { x: s.x + s.w, y: s.y }, { x: s.x + s.w, y: s.y + s.h }, { x: s.x, y: s.y + s.h }];
var polyOf = (s) => s.type === "rect" ? rectPoly(s) : s.type === "polygon" ? s.points : null;
function pointInPolygon(p, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
function inShape(s, p) {
  if (s.type === "circle") return Math.hypot(p.x - s.x, p.y - s.y) <= s.r;
  if (s.type === "rect") return p.x >= s.x && p.x <= s.x + s.w && p.y >= s.y && p.y <= s.y + s.h;
  return pointInPolygon(p, s.points);
}
function inShapes(shapes, p) {
  let inside = false;
  for (const s of shapes) if (!s.hole && inShape(s, p)) {
    inside = true;
    break;
  }
  if (!inside) return false;
  for (const s of shapes) if (s.hole && inShape(s, p)) return false;
  return true;
}
function boxOfShape(s) {
  if (s.type === "circle") return { x0: s.x - s.r, y0: s.y - s.r, x1: s.x + s.r, y1: s.y + s.r };
  const pts = polyOf(s);
  return {
    x0: Math.min(...pts.map((p) => p.x)),
    y0: Math.min(...pts.map((p) => p.y)),
    x1: Math.max(...pts.map((p) => p.x)),
    y1: Math.max(...pts.map((p) => p.y))
  };
}
function boxOfShapes(shapes) {
  const bs = shapes.map(boxOfShape);
  return {
    x0: Math.min(...bs.map((b) => b.x0)),
    y0: Math.min(...bs.map((b) => b.y0)),
    x1: Math.max(...bs.map((b) => b.x1)),
    y1: Math.max(...bs.map((b) => b.y1))
  };
}
var cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
var onSeg = (a, b, p) => Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x) && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y);
function segTouch(a, b, c, d) {
  const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
  if ((d1 > 0 && d2 < 0 || d1 < 0 && d2 > 0) && (d3 > 0 && d4 < 0 || d3 < 0 && d4 > 0)) return true;
  return d1 === 0 && onSeg(c, d, a) || d2 === 0 && onSeg(c, d, b) || d3 === 0 && onSeg(a, b, c) || d4 === 0 && onSeg(a, b, d);
}
function segDist(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}
function circleTouchesPoly(c, poly) {
  if (pointInPolygon(c, poly)) return true;
  return poly.some((a, i) => segDist(c, a, poly[(i + 1) % poly.length]) <= c.r);
}
function polyTouch(a, b) {
  if (a.some((p) => pointInPolygon(p, b)) || b.some((p) => pointInPolygon(p, a))) return true;
  return a.some((p, i) => b.some((q, j) => segTouch(p, a[(i + 1) % a.length], q, b[(j + 1) % b.length])));
}
function shapesTouch(a, b) {
  if (a.type === "circle" && b.type === "circle") return Math.hypot(a.x - b.x, a.y - b.y) <= a.r + b.r;
  if (a.type === "circle") return circleTouchesPoly(a, polyOf(b));
  if (b.type === "circle") return circleTouchesPoly(b, polyOf(a));
  return polyTouch(polyOf(a), polyOf(b));
}
var anyTouch = (xs, ys) => xs.some((x) => !x.hole && ys.some((y) => !y.hole && shapesTouch(x, y)));

// src/rules/zones.ts
function isExpired(z, clock) {
  const e = z.expires;
  if (!e || z.permanent) return false;
  if (e.kind === "world") return clock.worldTime >= e.at;
  return clock.round !== void 0 && (e.combat === void 0 || e.combat === clock.combat) && clock.round >= e.at;
}
var concentrationDC = (damage) => Math.max(10, Math.floor(damage / 2));
var clamp01 = (n) => Math.min(1, Math.max(0, n));
var layerOf = (z, p) => z.layer ?? p.layer;
function resolveZones(zs, cat = CATALOG) {
  const trace = [];
  const mats = [], subs = [];
  for (const z of zs) {
    const m = cat.materials[z.kind], s = cat.substances[z.kind];
    if (m) mats.push([z, m]);
    else if (s) subs.push([z, s]);
    else trace.push(`Zone "${z.kind}" \u0E44\u0E21\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01\u0E43\u0E19 catalog (\u0E02\u0E49\u0E32\u0E21)`);
  }
  const order = (a, b) => layerOf(...a) - layerOf(...b) || a[0].id.localeCompare(b[0].id);
  mats.sort(order);
  subs.sort(order);
  const props = { ...BASE_PROPS };
  let surface;
  const sources = {};
  const mark = (p, s) => {
    for (const k of Object.keys(p)) sources[k] = s;
  };
  const layers = [];
  const hazards = /* @__PURE__ */ new Map();
  const override = (z) => {
    for (const [k, v] of Object.entries(z.overrides ?? {})) {
      props[k] = v;
      sources[k] = "house";
      trace.push(`${k} = ${v} \u2190 DM \u0E41\u0E01\u0E49\u0E17\u0E31\u0E1A\u0E17\u0E35\u0E48 ${z.kind}`);
    }
  };
  const top = mats[mats.length - 1];
  if (top) {
    Object.assign(props, top[1].props);
    mark(top[1].props, top[1].source);
    layers.push(top[0].kind);
    trace.push(`\u0E1E\u0E37\u0E49\u0E19 = ${top[1].label} [${top[1].source}]`);
    override(top[0]);
  } else trace.push(`\u0E1E\u0E37\u0E49\u0E19 = \u0E40\u0E1B\u0E25\u0E48\u0E32 (mu ${BASE_PROPS.mu}) [house]`);
  for (const [z, s] of subs) {
    layers.push(z.kind);
    if (s.adjust?.flammability) {
      const { mul = 1, add = 0 } = s.adjust.flammability;
      props.flammability = clamp01(props.flammability * mul + add);
      trace.push(`flammability \u0E1B\u0E23\u0E31\u0E1A\u0E40\u0E1B\u0E47\u0E19 ${props.flammability} \u0E40\u0E1E\u0E23\u0E32\u0E30 ${s.label} [${s.source}]`);
    }
    const p = s.props;
    mark(p, s.source);
    if (p.mu !== void 0) {
      props.mu = p.mu;
      surface = z.kind;
      trace.push(`mu = ${p.mu} \u2190 ${s.label} (\u0E0A\u0E31\u0E49\u0E19\u0E1A\u0E19\u0E2A\u0E38\u0E14\u0E0A\u0E19\u0E30) [${s.source}]`);
    }
    if (p.flammability !== void 0) props.flammability = Math.max(props.flammability, p.flammability);
    if (p.conductivity !== void 0) props.conductivity = Math.max(props.conductivity, p.conductivity);
    if (p.hardness !== void 0) props.hardness = Math.max(props.hardness, p.hardness);
    if (p.fuel !== void 0) props.fuel += p.fuel;
    if (p.difficult) props.difficult = true;
    if (p.obscured !== void 0) props.obscured = Math.max(props.obscured, p.obscured);
    override(z);
  }
  for (const [z] of [...mats, ...subs]) if (z.hazard) {
    const key2 = z.hazard.name ?? z.kind;
    const old = hazards.get(key2);
    if (!old || z.hazard.amount > old.amount) hazards.set(key2, z.hazard);
  }
  props.flammability = clamp01(props.flammability);
  return { props, surface, layers, hazards: [...hazards.values()], sources, trace };
}
var SpatialHash = class {
  constructor(size = HASH_FT) {
    this.size = size;
  }
  size;
  buckets = /* @__PURE__ */ new Map();
  big = [];
  span(b) {
    return { i0: Math.floor(b.x0 / this.size), i1: Math.floor(b.x1 / this.size), j0: Math.floor(b.y0 / this.size), j1: Math.floor(b.y1 / this.size) };
  }
  build(zones) {
    this.buckets.clear();
    this.big = [];
    for (const z of zones) {
      if (!z.shapes.length) continue;
      const s = this.span(boxOfShapes(z.shapes));
      if ((s.i1 - s.i0 + 1) * (s.j1 - s.j0 + 1) > 1024) {
        this.big.push(z);
        continue;
      }
      for (let i = s.i0; i <= s.i1; i++) for (let j = s.j0; j <= s.j1; j++) {
        const k = `${i},${j}`;
        const a = this.buckets.get(k);
        if (a) a.push(z);
        else this.buckets.set(k, [z]);
      }
    }
  }
  query(b) {
    const s = this.span(b), seen = new Set(this.big);
    if ((s.i1 - s.i0 + 1) * (s.j1 - s.j0 + 1) > 1024) {
      for (const a of this.buckets.values()) a.forEach((z) => seen.add(z));
      return [...seen];
    }
    for (let i = s.i0; i <= s.i1; i++) for (let j = s.j0; j <= s.j1; j++) this.buckets.get(`${i},${j}`)?.forEach((z) => seen.add(z));
    return [...seen];
  }
};
var later = (a, b) => !a ? b : !b ? a : a.kind === b.kind ? b.at > a.at ? b : a : a;
var ZoneField = class {
  cellFt;
  coverage;
  catalog;
  list;
  hash = new SpatialHash();
  dirty = true;
  constructor(zones = [], o = {}) {
    this.list = [...zones];
    this.cellFt = o.cellFt ?? 5;
    this.coverage = o.coverage ?? { mode: "center" };
    this.catalog = o.catalog ?? CATALOG;
  }
  zones() {
    return this.list;
  }
  get(id) {
    return this.list.find((z) => z.id === id);
  }
  idx() {
    if (this.dirty) {
      this.hash.build(this.list);
      this.dirty = false;
    }
    return this.hash;
  }
  zonesAt(p) {
    return this.idx().query({ x0: p.x, y0: p.y, x1: p.x, y1: p.y }).filter((z) => inShapes(z.shapes, p));
  }
  propertiesAt(p) {
    return resolveZones(this.zonesAt(p), this.catalog);
  }
  zonesOfCell(cell) {
    const s = this.cellFt, x0 = cell.col * s, y0 = cell.row * s;
    const cands = this.idx().query({ x0, y0, x1: x0 + s, y1: y0 + s });
    if (this.coverage.mode === "center") {
      const c = { x: x0 + s / 2, y: y0 + s / 2 };
      return cands.filter((z) => inShapes(z.shapes, c));
    }
    const N = 5, min = this.coverage.min;
    return cands.filter((z) => {
      let hit = 0;
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (inShapes(z.shapes, { x: x0 + (i + 0.5) / N * s, y: y0 + (j + 0.5) / N * s })) hit++;
      return hit / (N * N) >= min;
    });
  }
  propertiesOfCell(cell) {
    return resolveZones(this.zonesOfCell(cell), this.catalog);
  }
  surfaceAtCell(cell) {
    return this.propertiesOfCell(cell).surface;
  }
  // เฉพาะ "สาร" ชนิดเดียวกันที่ซ้อน/ติดกัน รวมเป็นก้อนเดียว (คาถาชื่อเดียวกันไม่ทบ)
  // สมาธิ: รวมเฉพาะของผู้เสกคนเดียวกัน ไม่งั้นปิดทีเดียวทั้งก้อนผิดคน
  mergeHits(z) {
    if (z.permanent || !this.catalog.substances[z.kind] || !z.shapes.length) return [];
    const b = boxOfShapes(z.shapes), pad = 0.01;
    return this.idx().query({ x0: b.x0 - pad, y0: b.y0 - pad, x1: b.x1 + pad, y1: b.y1 + pad }).filter((o) => o.id !== z.id && o.kind === z.kind && !o.permanent && !!o.concentration === !!z.concentration && (!z.concentration || o.caster === z.caster) && anyTouch(o.shapes, z.shapes));
  }
  add(z) {
    if (this.list.some((e) => e.id === z.id)) return { ok: false, removed: [], updated: false, warning: `id ${z.id} \u0E0B\u0E49\u0E33` };
    const hits = this.mergeHits(z);
    if (!hits.length) {
      if (this.list.length >= MAX_ZONES) return { ok: false, removed: [], updated: false, warning: `Zone \u0E04\u0E23\u0E1A\u0E40\u0E1E\u0E14\u0E32\u0E19 ${MAX_ZONES} \u0E2D\u0E31\u0E19\u0E15\u0E48\u0E2D\u0E09\u0E32\u0E01 (\u0E44\u0E21\u0E48\u0E2A\u0E23\u0E49\u0E32\u0E07\u0E40\u0E1E\u0E34\u0E48\u0E21): \u0E43\u0E2B\u0E49 DM \u0E25\u0E1A\u0E2B\u0E23\u0E37\u0E2D\u0E23\u0E27\u0E21\u0E02\u0E2D\u0E07\u0E40\u0E14\u0E34\u0E21` };
      this.list.push(z);
      this.dirty = true;
      return { ok: true, zone: z, removed: [], updated: false };
    }
    const all = [...hits, z], vols = all.map((a) => a.volume).filter((v) => v !== void 0);
    const deps = all.map((a) => a.depth).filter((v) => v !== void 0);
    const merged = {
      ...hits[0],
      shapes: all.flatMap((a) => a.shapes),
      volume: vols.length ? vols.reduce((s, v) => s + v, 0) : void 0,
      depth: deps.length ? Math.max(...deps) : void 0,
      expires: all.map((a) => a.expires).reduce(later, void 0)
    };
    this.list = this.list.filter((e) => !hits.includes(e));
    this.list.push(merged);
    this.dirty = true;
    return { ok: true, zone: merged, removed: hits.slice(1).map((h) => h.id), updated: true };
  }
  remove(id) {
    const n = this.list.length;
    this.list = this.list.filter((z) => z.id !== id);
    this.dirty = true;
    return this.list.length < n;
  }
  removeMany(ids) {
    for (const id of ids) this.remove(id);
  }
  // ลบที่หมดอายุ คืน id ที่ลบ
  sweep(clock) {
    const gone = this.list.filter((z) => isExpired(z, clock)).map((z) => z.id);
    this.removeMany(gone);
    return gone;
  }
};

// src/rules/zoneTick.ts
var MAX_BURNING = 400;
var key = (c) => `${c.col},${c.row}`;
var show = (cs, n = 6) => cs.slice(0, n).map((c) => `(${c.col},${c.row})`).join(" ") + (cs.length > n ? ` \u2026\u0E2D\u0E35\u0E01 ${cs.length - n}` : "");
function zoneTick(world, o = {}) {
  const rng = o.rng ?? Math.random, s = world.cellFt, out = [];
  const mid = (c) => ({ x: (c.col + 0.5) * s, y: (c.row + 0.5) * s });
  const burning = /* @__PURE__ */ new Map();
  for (const z of world.zones()) if (z.kind === "fire" && z.shapes.length) {
    for (const sh of z.shapes) {
      const b = sh.type === "circle" ? { x0: sh.x - sh.r, y0: sh.y - sh.r, x1: sh.x + sh.r, y1: sh.y + sh.r } : sh.type === "rect" ? { x0: sh.x, y0: sh.y, x1: sh.x + sh.w, y1: sh.y + sh.h } : { x0: Math.min(...sh.points.map((p) => p.x)), y0: Math.min(...sh.points.map((p) => p.y)), x1: Math.max(...sh.points.map((p) => p.x)), y1: Math.max(...sh.points.map((p) => p.y)) };
      for (let c = Math.floor(b.x0 / s); c <= Math.floor(b.x1 / s); c++) for (let r = Math.floor(b.y0 / s); r <= Math.floor(b.y1 / s); r++) {
        const cell = { col: c, row: r };
        if (!burning.has(key(cell)) && inShapes(z.shapes, mid(cell))) burning.set(key(cell), cell);
        if (burning.size > MAX_BURNING) {
          out.push({ kind: "burn", cells: [], act: true, source: "house", text: `\u0E44\u0E1F\u0E43\u0E2B\u0E0D\u0E48\u0E40\u0E01\u0E34\u0E19 ${MAX_BURNING} \u0E0A\u0E48\u0E2D\u0E07: \u0E04\u0E33\u0E19\u0E27\u0E13\u0E41\u0E04\u0E48\u0E2A\u0E48\u0E27\u0E19\u0E41\u0E23\u0E01 (DM \u0E04\u0E27\u0E23\u0E15\u0E31\u0E14\u0E2A\u0E34\u0E19\u0E40\u0E2D\u0E07)` });
          break;
        }
      }
    }
  }
  if (!burning.size) return out;
  const fires = world.zones().filter((z) => z.kind === "fire");
  const fuelLeft = (cell, base) => fires.map((z) => z.burn?.[key(cell)]).find((v) => v !== void 0) ?? base;
  const burn = [], dead = [], douse = [], melt = [];
  for (const cell of burning.values()) {
    const r = world.propertiesAt(mid(cell));
    if (r.layers.includes("water") && !r.layers.includes("oil")) {
      douse.push(cell);
      continue;
    }
    if (r.layers.includes("ice")) melt.push(cell);
    if (r.props.fuel > 0) {
      const left = fuelLeft(cell, r.props.fuel) - 1;
      (left <= 0 ? dead : burn).push(cell);
    }
  }
  if (burn.length) out.push({ kind: "burn", cells: burn, act: false, source: "house", text: `\u0E44\u0E1F\u0E40\u0E1C\u0E32\u0E40\u0E0A\u0E37\u0E49\u0E2D\u0E40\u0E1E\u0E25\u0E34\u0E07 ${burn.length} \u0E0A\u0E48\u0E2D\u0E07 (\u0E25\u0E14\u0E0A\u0E48\u0E2D\u0E07\u0E25\u0E30 1): ${show(burn)}` });
  if (dead.length) out.push({ kind: "out", cells: dead, act: true, source: "house", text: `\u0E40\u0E0A\u0E37\u0E49\u0E2D\u0E40\u0E1E\u0E25\u0E34\u0E07\u0E2B\u0E21\u0E14 ${dead.length} \u0E0A\u0E48\u0E2D\u0E07 \u2192 \u0E44\u0E2B\u0E21\u0E49\u0E40\u0E01\u0E23\u0E35\u0E22\u0E21 \u0E44\u0E1F\u0E14\u0E31\u0E1A: ${show(dead)}` });
  if (douse.length) out.push({ kind: "douse", cells: douse, act: true, source: "house", text: `\u0E19\u0E49\u0E33\u0E14\u0E31\u0E1A\u0E44\u0E1F ${douse.length} \u0E0A\u0E48\u0E2D\u0E07: ${show(douse)}` });
  if (melt.length) out.push({ kind: "melt", cells: melt, act: true, source: "house", text: `\u0E44\u0E1F\u0E25\u0E30\u0E25\u0E32\u0E22\u0E19\u0E49\u0E33\u0E41\u0E02\u0E47\u0E07 ${melt.length} \u0E0A\u0E48\u0E2D\u0E07 \u2192 \u0E01\u0E25\u0E32\u0E22\u0E40\u0E1B\u0E47\u0E19\u0E19\u0E49\u0E33: ${show(melt)}` });
  const dousedKeys = new Set(douse.map(key)), seen = /* @__PURE__ */ new Set(), hit = [], miss = [];
  for (const cell of burning.values()) {
    if (dousedKeys.has(key(cell))) continue;
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const n = { col: cell.col + dc, row: cell.row + dr }, k = key(n);
      if (burning.has(k) || seen.has(k)) continue;
      seen.add(k);
      const f = world.propertiesAt(mid(n)).props.flammability;
      if (f <= 0) continue;
      (rng() < f ? hit : miss).push(n);
    }
  }
  if (hit.length || miss.length) out.push({
    kind: "ignite",
    cells: hit,
    act: hit.length > 0,
    source: "house",
    text: `\u0E44\u0E1F\u0E25\u0E32\u0E21: \u0E15\u0E34\u0E14\u0E40\u0E1E\u0E34\u0E48\u0E21 ${hit.length} \u0E0A\u0E48\u0E2D\u0E07${hit.length ? " " + show(hit) : ""} \xB7 \u0E40\u0E2A\u0E35\u0E48\u0E22\u0E07\u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E15\u0E34\u0E14 ${miss.length} \u0E0A\u0E48\u0E2D\u0E07 (\u0E42\u0E2D\u0E01\u0E32\u0E2A\u0E15\u0E32\u0E21 flammability, \u0E2A\u0E38\u0E48\u0E21\u0E44\u0E27\u0E49\u0E41\u0E25\u0E49\u0E27 DM \u0E40\u0E1B\u0E25\u0E35\u0E48\u0E22\u0E19\u0E44\u0E14\u0E49)`
  });
  const hurt = world.creatures().filter((c) => burning.has(key({ col: c.pos.col, row: c.pos.row })) && !dousedKeys.has(key(c.pos)));
  if (hurt.length) out.push({ kind: "people", cells: hurt.map((c) => c.pos), act: true, source: "house", text: `${hurt.map((c) => c.name).join(", ")} \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E0A\u0E48\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E44\u0E2B\u0E21\u0E49: DM \u0E01\u0E33\u0E2B\u0E19\u0E14\u0E14\u0E32\u0E40\u0E21\u0E08\u0E44\u0E1F (\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32\u0E08\u0E32\u0E01 compendium)` });
  return out;
}

// src/rules/turnReport.ts
var NOTABLE = 0.5;
function turnReport(world, clock, o = {}) {
  const combat = clock.round !== void 0;
  const items = [];
  const all = world.creatures();
  const who = o.whose ? all.filter((c) => c.id === o.whose) : all;
  const nameOf = (id) => all.find((c) => c.id === id)?.name ?? id;
  for (const z of world.zones()) {
    const e = z.expires;
    if (!e || z.permanent) continue;
    const label = `${z.kind} (${z.id})`;
    if (isExpired(z, clock)) {
      items.push({ kind: "expire", text: `${label} \u0E2B\u0E21\u0E14\u0E2D\u0E32\u0E22\u0E38\u0E41\u0E25\u0E49\u0E27: DM \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E25\u0E1A (sweep \u0E08\u0E30\u0E25\u0E1A\u0E43\u0E2B\u0E49)`, source: "house" });
      continue;
    }
    if (e.kind === "world") {
      const left = e.at - clock.worldTime;
      if (!combat || left <= ROUND_SEC) items.push({ kind: "expire", text: `${label} \u0E40\u0E2B\u0E25\u0E37\u0E2D ${left} \u0E27\u0E34 (\u2248 ${Math.ceil(left / ROUND_SEC)} \u0E23\u0E2D\u0E1A)`, source: "house" });
    } else if (combat) {
      const left = e.at - clock.round;
      if (left <= 1) items.push({ kind: "expire", text: `${label} \u0E08\u0E30\u0E2B\u0E32\u0E22\u0E15\u0E2D\u0E19\u0E23\u0E2D\u0E1A ${e.at} (\u0E2D\u0E35\u0E01 ${left} \u0E23\u0E2D\u0E1A)`, source: "house" });
    } else items.push({ kind: "expire", text: `${label} \u0E19\u0E31\u0E1A\u0E15\u0E32\u0E21\u0E23\u0E2D\u0E1A combat: \u0E19\u0E2D\u0E01 combat \u0E44\u0E21\u0E48\u0E2B\u0E21\u0E14\u0E40\u0E2D\u0E07 (DM \u0E1B\u0E34\u0E14\u0E40\u0E2D\u0E07\u0E44\u0E14\u0E49)`, source: "house" });
  }
  for (const c of who) {
    const f = c.footprint / 2, r = world.propertiesAt({ x: (c.pos.col + f) * world.cellFt, y: (c.pos.row + f) * world.cellFt });
    if (!r.layers.length) continue;
    const base = { who: c.id };
    if (r.props.difficult) items.push({ ...base, kind: "terrain", text: `${c.name}: \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19 difficult terrain (${r.layers.join(" + ")}) \u0E40\u0E14\u0E34\u0E19\u0E01\u0E34\u0E19\u0E23\u0E30\u0E22\u0E30\u0E40\u0E1E\u0E34\u0E48\u0E21`, source: r.sources.difficult ?? "house" });
    if (r.surface) items.push({ ...base, kind: "surface", text: `${c.name}: \u0E1E\u0E37\u0E49\u0E19\u0E43\u0E15\u0E49\u0E15\u0E31\u0E27\u0E40\u0E1B\u0E47\u0E19 ${r.surface} (mu ${r.props.mu}) \u0E16\u0E39\u0E01\u0E1C\u0E25\u0E31\u0E01/\u0E1E\u0E38\u0E48\u0E07\u0E08\u0E30\u0E44\u0E16\u0E25\u0E15\u0E32\u0E21\u0E01\u0E0E physics`, source: r.sources.mu ?? "house" });
    for (const h of r.hazards) {
      const what = `${h.name ?? h.type} ${h.amount} ${h.type}`;
      if (h.trigger === "endTurn") {
        items.push(combat ? { ...base, kind: "hazard", text: `${c.name}: \u0E1B\u0E25\u0E32\u0E22\u0E40\u0E17\u0E34\u0E23\u0E4C\u0E19\u0E42\u0E14\u0E19 ${what} (\u0E0A\u0E37\u0E48\u0E2D\u0E40\u0E14\u0E35\u0E22\u0E27\u0E01\u0E31\u0E19\u0E44\u0E21\u0E48\u0E17\u0E1A)`, source: h.source, proposal: Fx.damage(c.id, h.amount, h.type) } : { ...base, kind: "hazard", text: `${c.name}: \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19 ${what} \u0E41\u0E15\u0E48\u0E19\u0E2D\u0E01 combat \u0E44\u0E21\u0E48\u0E21\u0E35\u0E40\u0E17\u0E34\u0E23\u0E4C\u0E19 \u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E17\u0E33\u0E07\u0E32\u0E19\u0E40\u0E2D\u0E07 (DM \u0E2A\u0E31\u0E48\u0E07\u0E40\u0E2D\u0E07\u0E44\u0E14\u0E49)`, source: h.source });
      } else items.push({ ...base, kind: "hazard", text: `${c.name}: \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19 ${what} \u0E17\u0E35\u0E48\u0E17\u0E33\u0E07\u0E32\u0E19\u0E15\u0E2D\u0E19\u0E40\u0E14\u0E34\u0E19\u0E40\u0E02\u0E49\u0E32 (\u0E16\u0E49\u0E32\u0E40\u0E14\u0E34\u0E19\u0E2D\u0E2D\u0E01\u0E41\u0E25\u0E49\u0E27\u0E40\u0E02\u0E49\u0E32\u0E43\u0E2B\u0E21\u0E48\u0E08\u0E30\u0E42\u0E14\u0E19\u0E2D\u0E35\u0E01)`, source: h.source });
    }
    if (r.props.conductivity >= NOTABLE) items.push({ ...base, kind: "conductive", text: `${c.name}: \u0E22\u0E37\u0E19\u0E1A\u0E19\u0E1E\u0E37\u0E49\u0E19\u0E19\u0E33\u0E44\u0E1F\u0E1F\u0E49\u0E32 (${r.props.conductivity.toFixed(2)}) \u0E16\u0E49\u0E32\u0E44\u0E1F\u0E1F\u0E49\u0E32\u0E25\u0E07\u0E01\u0E49\u0E2D\u0E19\u0E40\u0E14\u0E35\u0E22\u0E27\u0E01\u0E31\u0E19\u0E08\u0E30\u0E16\u0E36\u0E07\u0E15\u0E31\u0E27\u0E19\u0E35\u0E49 [\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E04\u0E33\u0E19\u0E27\u0E13: \u0E02\u0E31\u0E49\u0E19 4-5]`, source: r.sources.conductivity ?? "house" });
    if (r.props.flammability >= NOTABLE) items.push({ ...base, kind: "flammable", text: `${c.name}: \u0E22\u0E37\u0E19\u0E1A\u0E19\u0E17\u0E35\u0E48\u0E15\u0E34\u0E14\u0E44\u0E1F\u0E07\u0E48\u0E32\u0E22 (${r.props.flammability.toFixed(2)}, \u0E40\u0E0A\u0E37\u0E49\u0E2D\u0E40\u0E1E\u0E25\u0E34\u0E07 ${r.props.fuel}) [\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E04\u0E33\u0E19\u0E27\u0E13\u0E44\u0E1F\u0E25\u0E32\u0E21: \u0E02\u0E31\u0E49\u0E19 4-5]`, source: r.sources.flammability ?? "house" });
  }
  const byCaster = /* @__PURE__ */ new Map();
  for (const z of world.zones()) if (z.concentration && z.caster) byCaster.set(z.caster, [...byCaster.get(z.caster) ?? [], z.kind]);
  for (const [id, kinds] of byCaster) {
    if (o.whose && o.whose !== id) continue;
    items.push({
      kind: "concentration",
      who: id,
      source: "unchecked",
      text: `${nameOf(id)} \u0E16\u0E37\u0E2D\u0E2A\u0E21\u0E32\u0E18\u0E34 ${kinds.join(", ")}: \u0E16\u0E49\u0E32\u0E42\u0E14\u0E19\u0E14\u0E32\u0E40\u0E21\u0E08 \u0E23\u0E30\u0E1A\u0E1A\u0E08\u0E30\u0E40\u0E2A\u0E19\u0E2D CON save (DC = \u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07 10 \u0E01\u0E31\u0E1A\u0E04\u0E23\u0E36\u0E48\u0E07\u0E14\u0E32\u0E40\u0E21\u0E08 \u0E40\u0E0A\u0E48\u0E19 \u0E14\u0E32\u0E40\u0E21\u0E08 30 \u2192 DC ${concentrationDC(30)}) \u0E1E\u0E25\u0E32\u0E14 = Zone \u0E1B\u0E34\u0E14`
    });
  }
  if (o.tick) for (const t of zoneTick(world, { rng: o.rng })) items.push({ kind: "zone", text: t.text, source: t.source, level: t.act ? "act" : "info" });
  for (const i of items) i.level ??= i.proposal ? "act" : "info";
  if (!items.length) items.push({ kind: "note", text: "\u0E44\u0E21\u0E48\u0E21\u0E35 Zone \u0E17\u0E35\u0E48\u0E2A\u0E48\u0E07\u0E1C\u0E25\u0E01\u0E31\u0E1A\u0E43\u0E04\u0E23\u0E43\u0E19\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49", source: "house", level: "info" });
  const name = o.whose ? nameOf(o.whose) : "\u0E17\u0E31\u0E49\u0E07\u0E01\u0E23\u0E30\u0E14\u0E32\u0E19";
  return { mode: combat ? "combat" : "outside", title: combat ? `${o.tick ? "\u0E08\u0E1A\u0E23\u0E2D\u0E1A" : "\u0E2A\u0E23\u0E38\u0E1B\u0E40\u0E17\u0E34\u0E23\u0E4C\u0E19"}: ${name} (\u0E23\u0E2D\u0E1A ${clock.round})` : `\u0E2A\u0E23\u0E38\u0E1B\u0E19\u0E2D\u0E01 combat: ${name}`, items, acts: items.filter((i) => i.level === "act").length };
}

// src/foundry/zones.ts
var FLAG = "zone";
var num = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
var ftPerPx = (scene) => gridFt(scene) / gridSize(scene);
var pxToFt = (scene, x, y) => {
  const o = origin(scene), k = ftPerPx(scene);
  return { x: (x - o.x) * k, y: (y - o.y) * k };
};
var ftToPx = (scene, p) => {
  const o = origin(scene), k = ftPerPx(scene);
  return { x: o.x + p.x / k, y: o.y + p.y / k };
};
var rotate = (pts, cx, cy, deg) => {
  if (!deg) return pts;
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
  return pts.map((p) => ({ x: cx + (p.x - cx) * c - (p.y - cy) * s, y: cy + (p.x - cx) * s + (p.y - cy) * c }));
};
function shapesFromRegion(scene, raw) {
  const out = [], k = ftPerPx(scene);
  const poly = (pxPts, hole) => out.push({ type: "polygon", points: pxPts.map((p) => pxToFt(scene, p.x, p.y)), hole });
  for (const s of raw ?? []) {
    const hole = s?.hole === true;
    if (s?.type === "circle") {
      const c = pxToFt(scene, num(s.x), num(s.y));
      out.push({ type: "circle", x: c.x, y: c.y, r: num(s.radius) * k, hole });
    } else if (s?.type === "rectangle") {
      const x = num(s.x), y = num(s.y), w = num(s.width), h = num(s.height), rot = num(s.rotation);
      if (!rot) {
        const t = pxToFt(scene, x, y);
        out.push({ type: "rect", x: t.x, y: t.y, w: w * k, h: h * k, hole });
      } else poly(rotate([{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }], x + w / 2, y + h / 2, rot), hole);
    } else if (s?.type === "ellipse") {
      const cx = num(s.x), cy = num(s.y), rx = num(s.radiusX), ry = num(s.radiusY);
      const pts = Array.from({ length: 32 }, (_, i) => ({ x: cx + rx * Math.cos(i / 32 * 2 * Math.PI), y: cy + ry * Math.sin(i / 32 * 2 * Math.PI) }));
      poly(rotate(pts, cx, cy, num(s.rotation)), hole);
    } else if (s?.type === "polygon" && Array.isArray(s.points)) {
      const pts = [];
      for (let i = 0; i + 1 < s.points.length; i += 2) pts.push({ x: num(s.points[i]), y: num(s.points[i + 1]) });
      if (pts.length >= 3) poly(pts, hole);
    } else console.warn(MOD, "zone: \u0E44\u0E21\u0E48\u0E23\u0E2D\u0E07\u0E23\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E23\u0E48\u0E32\u0E07 Region \u0E0A\u0E19\u0E34\u0E14", s?.type);
  }
  return out;
}
function shapesToRegion(scene, shapes) {
  const k = ftPerPx(scene);
  return shapes.map((s) => {
    const hole = s.hole === true;
    if (s.type === "circle") {
      const c = ftToPx(scene, s);
      return { type: "circle", x: c.x, y: c.y, radius: s.r / k, hole };
    }
    if (s.type === "rect") {
      const c = ftToPx(scene, s);
      return { type: "rectangle", x: c.x, y: c.y, width: s.w / k, height: s.h / k, rotation: 0, hole };
    }
    return { type: "polygon", points: s.points.flatMap((p) => {
      const c = ftToPx(scene, p);
      return [c.x, c.y];
    }), hole };
  });
}
function zoneFromRegion(scene, region) {
  let f;
  try {
    f = region?.getFlag?.(MOD, FLAG);
  } catch {
  }
  if (!f || typeof f !== "object" || typeof f.kind !== "string") return null;
  const shapes = shapesFromRegion(scene, region.shapes ? [...region.shapes] : []);
  return shapes.length ? { ...f, id: String(region.id), shapes, permanent: f.permanent === true } : null;
}
function regionZones(scene) {
  const regs = scene?.regions?.contents ?? (scene?.regions ? [...scene.regions.values()] : []);
  return regs.map((r) => zoneFromRegion(scene, r)).filter((z) => !!z);
}
function oilTemplateZones(scene) {
  const tpl = scene?.templates?.contents ?? [];
  return tpl.filter((t) => {
    try {
      return !!t.getFlag?.(MOD, "oil");
    } catch {
      return false;
    }
  }).map((t, i) => {
    const c = pxToFt(scene, num(t.x), num(t.y));
    return { id: `tpl:${t.id ?? i}`, kind: "oil", permanent: false, shapes: [{ type: "circle", x: c.x, y: c.y, r: num(t.distance) }] };
  });
}
function coverageOf(scene) {
  let f;
  try {
    f = scene?.getFlag?.(MOD, "zoneCoverage");
  } catch {
  }
  return f?.mode === "fraction" && num(f.min) > 0 ? { mode: "fraction", min: num(f.min) } : void 0;
}
var fieldOf = (scene, catalog = CATALOG) => new ZoneField([...regionZones(scene), ...oilTemplateZones(scene)], { cellFt: gridFt(scene), coverage: coverageOf(scene), catalog });
var flagOf = (z) => {
  const { id, shapes, ...rest } = z;
  return rest;
};
var colorOf = (z, cat = CATALOG) => (cat.substances[z.kind] ?? cat.materials[z.kind])?.color ?? "#ffffff";
async function createZone(scene, zone, catalog = CATALOG) {
  const field = new ZoneField(regionZones(scene), { cellFt: gridFt(scene), catalog });
  const res = field.add(zone);
  if (!res.ok || !res.zone) {
    ui?.notifications?.warn?.(res.warning ?? "\u0E2A\u0E23\u0E49\u0E32\u0E07 Zone \u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
    return res;
  }
  const z = res.zone, data = { shapes: shapesToRegion(scene, z.shapes), [`flags.${MOD}.${FLAG}`]: flagOf(z) };
  if (res.updated) {
    await scene.regions.get(z.id)?.update(data);
    if (res.removed.length) await scene.deleteEmbeddedDocuments("Region", res.removed);
  } else {
    const [doc] = await scene.createEmbeddedDocuments("Region", [{
      name: z.name ?? (catalog.substances[z.kind] ?? catalog.materials[z.kind])?.label ?? z.kind,
      color: colorOf(z, catalog),
      shapes: data.shapes,
      flags: { [MOD]: { [FLAG]: flagOf(z) } }
    }]);
    if (doc?.id) res.zone = { ...z, id: String(doc.id) };
  }
  return res;
}
async function labelRegion(scene, regionId, kind, extra = {}, catalog = CATALOG) {
  const region = scene.regions?.get(regionId);
  if (!region) {
    ui?.notifications?.warn?.(`\u0E44\u0E21\u0E48\u0E1E\u0E1A Region ${regionId}`);
    return false;
  }
  const isMat = !!catalog.materials[kind];
  if (!isMat && !catalog.substances[kind]) {
    ui?.notifications?.warn?.(`\u0E44\u0E21\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01\u0E0A\u0E19\u0E34\u0E14 "${kind}"`);
    return false;
  }
  const { id, shapes, ...rest } = extra;
  await region.setFlag(MOD, FLAG, { kind, permanent: isMat, ...rest });
  await region.update({ color: colorOf({ kind }, catalog) });
  return true;
}
async function removeZones(scene, ids) {
  const real = ids.filter((id) => scene.regions?.get(id));
  if (real.length) await scene.deleteEmbeddedDocuments("Region", real);
}
async function sweepZones(scene, clock) {
  const gone = fieldOf(scene).sweep(clock);
  await removeZones(scene, gone);
  return gone;
}
async function closeConcentration(scene, casterId) {
  const ids = regionZones(scene).filter((z) => z.concentration && z.caster === casterId).map((z) => z.id);
  await removeZones(scene, ids);
  return ids;
}
function currentClock() {
  const c = game.combat;
  return { round: c?.started ? num(c.round) : void 0, combat: c?.id, worldTime: num(game.time?.worldTime) };
}
function inspectPoint(scene, x, y) {
  const feet = pxToFt(scene, x, y);
  return { ...fieldOf(scene).propertiesAt(feet), feet };
}
function registerZoneHooks() {
  if (typeof Hooks === "undefined") return;
  const run = () => {
    if (!game.users?.activeGM?.isSelf) return;
    for (const scene of game.scenes ?? []) sweepZones(scene, currentClock()).catch((e) => console.warn(MOD, "zone sweep", e));
  };
  Hooks.on("updateCombat", (combat, changed) => {
    run();
    if (autoMode === "off" || !game.users?.activeGM?.isSelf || changed?.turn === void 0 && changed?.round === void 0) return;
    const scene = game.scenes.get(combat?.scene?.id ?? combat?.sceneId);
    const tok = combat?.combatant?.tokenId;
    if (scene && tok) reportZones(scene, changed.round !== void 0 ? void 0 : tok, { tick: changed.round !== void 0, auto: true }).catch((e) => console.warn(MOD, "zone report", e));
  });
  Hooks.on("updateWorldTime", run);
}
var escH = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
async function reportZones(scene, whoTokenId, o = {}) {
  const { FoundryWorld } = await import("./world-G5DKMRL4.js");
  const report = turnReport(new FoundryWorld(scene), currentClock(), { whose: whoTokenId, tick: o.tick });
  const li = (xs) => xs.map((i) => `<li>${escH(i.text)} <small>[${i.source}]${i.proposal ? " \xB7 \u0E21\u0E35\u0E02\u0E49\u0E2D\u0E40\u0E2A\u0E19\u0E2D" : ""}</small></li>`).join("");
  const act = report.items.filter((i) => i.level === "act"), info = report.items.filter((i) => i.level !== "act");
  const html = `<div class="rw-card"><b>${escH(report.title)}</b>${act.length ? `<ul>${li(act)}</ul>` : ""}` + (info.length ? `<details><summary>\u0E23\u0E39\u0E49\u0E44\u0E27\u0E49 ${info.length} \u0E02\u0E49\u0E2D</summary><ul>${li(info)}</ul></details>` : "") + `</div>`;
  if (autoMode !== "all" && !act.length && o.auto) return report;
  await ChatMessage.create({ whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id), content: html });
  return report;
}
var autoMode = "off";
var setAutoReport = (m) => {
  autoMode = m === true ? "act" : m === false ? "off" : m;
};

export {
  fieldOf,
  createZone,
  labelRegion,
  removeZones,
  sweepZones,
  closeConcentration,
  currentClock,
  inspectPoint,
  registerZoneHooks,
  reportZones,
  setAutoReport
};
