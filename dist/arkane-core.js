/* arkane-core 0.7.0 - generated from src/, do not edit by hand */
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// src/model/creature.ts
var SIZES;
var init_creature = __esm({
  "src/model/creature.ts"() {
    "use strict";
    SIZES = ["tiny", "sm", "med", "lg", "huge", "grg"];
  }
});

// src/model/effect.ts
var Fx;
var init_effect = __esm({
  "src/model/effect.ts"() {
    "use strict";
    Fx = {
      log: (text, check) => ({ kind: "log", text, check }),
      push: (target, to) => ({ kind: "push", target, to }),
      prone: (target) => ({ kind: "prone", target }),
      damage: (target, amount, type) => ({ kind: "damage", target, amount, type }),
      spendItem: (owner, itemId, qty = 1) => ({ kind: "spendItem", owner, itemId, qty }),
      spendCost: (actor, cost) => ({ kind: "spendCost", actor, cost })
    };
  }
});

// src/data/bodies.ts
var BODY, REF_HUMAN;
var init_bodies = __esm({
  "src/data/bodies.ts"() {
    "use strict";
    BODY = {
      tiny: { massLb: 10, forceMult: 0.5 },
      sm: { massLb: 60, forceMult: 1 },
      med: { massLb: 180, forceMult: 1 },
      lg: { massLb: 900, forceMult: 2 },
      huge: { massLb: 4e3, forceMult: 4 },
      grg: { massLb: 3e4, forceMult: 8 }
    };
    REF_HUMAN = { heightFt: 5.8, massLb: 180 };
  }
});

// src/data/props.ts
var MATERIALS, PROP_DEFAULT;
var init_props = __esm({
  "src/data/props.ts"() {
    "use strict";
    MATERIALS = {
      wood: { rho: 40, fill: 0.05 },
      stone: { rho: 160, fill: 0.5 },
      iron: { rho: 490, fill: 0.05 },
      water: { rho: 62, fill: 0.8 }
      // a full cistern / big barrel of water
    };
    PROP_DEFAULT = { material: "wood", heightFt: 5 };
  }
});

// src/rules/propMass.ts
function resolvePropMass(i) {
  if (good(i.override)) return { mass: i.override, source: "override" };
  const mat = MATERIALS[i.material ?? ""] ?? MATERIALS[PROP_DEFAULT.material];
  const side = Math.max(1, i.footprint) * i.cellFt;
  const volume = side * side * (good(i.heightFt) ? i.heightFt : PROP_DEFAULT.heightFt);
  const fill = good(i.fill) && i.fill <= 1 ? i.fill : mat.fill;
  return { mass: mat.rho * volume * fill, source: "material" };
}
var good;
var init_propMass = __esm({
  "src/rules/propMass.ts"() {
    "use strict";
    init_props();
    good = (n) => typeof n === "number" && Number.isFinite(n) && n > 0;
  }
});

// src/data/surfaces.ts
var FRICTION, MIN_MU;
var init_surfaces = __esm({
  "src/data/surfaces.ts"() {
    "use strict";
    FRICTION = {
      floor: 0.6,
      mud: 0.8,
      water: 0.4,
      oil: 0.1,
      ice: 0.05
    };
    MIN_MU = 0.02;
  }
});

// src/rules/mass.ts
function resolveMass(i) {
  if (good2(i.override)) return { mass: i.override, source: "override" };
  const notes = [];
  const why = () => notes.length ? `${notes.join("; ")} \u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E49` : void 0;
  if (good2(i.weightLb)) {
    if (plausible(i.weightLb, i.size)) return { mass: i.weightLb, source: "weight" };
    notes.push(`\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E43\u0E19\u0E0A\u0E35\u0E15 ${Math.round(i.weightLb * 10) / 10} lb \u0E1C\u0E34\u0E14\u0E1B\u0E01\u0E15\u0E34\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E02\u0E19\u0E32\u0E14 ${i.size}`);
  }
  if (good2(i.heightFt)) {
    const m = massFromHeight(i.heightFt);
    if (plausible(m, i.size)) return { mass: m, source: "height", note: why() };
    notes.push(`\u0E2A\u0E48\u0E27\u0E19\u0E2A\u0E39\u0E07\u0E43\u0E19\u0E0A\u0E35\u0E15 ${Math.round(i.heightFt * 100) / 100} ft \u0E1C\u0E34\u0E14\u0E1B\u0E01\u0E15\u0E34\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E02\u0E19\u0E32\u0E14 ${i.size}`);
  }
  return { mass: BODY[i.size].massLb, source: "size", note: why() };
}
function parseWeightLb(v) {
  if (typeof v === "number") return good2(v) ? v : void 0;
  if (v && typeof v === "object") {
    const o = v;
    return parseWeightLb(`${o.value ?? ""} ${o.units ?? ""}`);
  }
  if (typeof v !== "string") return void 0;
  const m = v.toLowerCase().match(WEIGHT_RE);
  if (!m) return void 0;
  const n = num(m[1]) * (m[2] === "kg" ? 2.20462 : 1);
  return good2(n) ? n : void 0;
}
function parseHeightFt(v) {
  if (typeof v === "number") return good2(v) ? v : void 0;
  if (v && typeof v === "object") {
    const o = v;
    return parseHeightFt(`${o.value ?? ""} ${o.units ?? ""}`);
  }
  if (typeof v !== "string") return void 0;
  const s = v.toLowerCase();
  let ft;
  let m = s.match(FT_RE);
  if (m) ft = num(m[1]) + (m[2] ? num(m[2]) / 12 : 0);
  else if (m = s.match(CM_RE)) ft = num(m[1]) / 30.48;
  else if (m = s.match(M_RE)) ft = num(m[1]) * 3.28084;
  else if (m = s.match(IN_RE)) ft = num(m[1]) / 12;
  else if (m = s.match(BARE_RE)) ft = num(m[1]);
  return good2(ft) ? ft : void 0;
}
var good2, massFromHeight, PLAUSIBLE, plausible, NUM, num, re, WEIGHT_RE, FT_RE, CM_RE, M_RE, IN_RE, BARE_RE;
var init_mass = __esm({
  "src/rules/mass.ts"() {
    "use strict";
    init_bodies();
    good2 = (n) => typeof n === "number" && Number.isFinite(n) && n > 0;
    massFromHeight = (heightFt) => REF_HUMAN.massLb * (heightFt / REF_HUMAN.heightFt) ** 3;
    PLAUSIBLE = 6;
    plausible = (mass, size) => {
      const t = BODY[size].massLb;
      return mass >= t / PLAUSIBLE && mass <= t * PLAUSIBLE;
    };
    NUM = String.raw`(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:[.,]\d+)?)`;
    num = (s) => Number(/^\d{1,3}(,\d{3})+/.test(s) ? s.replace(/,/g, "") : s.replace(",", "."));
    re = (pattern) => new RegExp(pattern.replace(/N/g, NUM));
    WEIGHT_RE = re(String.raw`N\s*(kg|lbs?|pounds?)?`);
    FT_RE = re(String.raw`N\s*(?:'|ft|feet|foot)\s*(?:N\s*(?:"|in|inch|inches)?)?`);
    CM_RE = re(String.raw`N\s*cm`);
    M_RE = re(String.raw`N\s*m\b`);
    IN_RE = re(String.raw`N\s*(?:"|in)`);
    BARE_RE = re(String.raw`^\s*N\s*$`);
  }
});

// src/data/zones.ts
var MAX_ZONES, HASH_FT, ROUND_SEC, BASE_PROPS, MATERIALS2, SUBSTANCES, CATALOG;
var init_zones = __esm({
  "src/data/zones.ts"() {
    "use strict";
    init_surfaces();
    MAX_ZONES = 200;
    HASH_FT = 10;
    ROUND_SEC = 6;
    BASE_PROPS = {
      mu: FRICTION.floor,
      flammability: 0,
      fuel: 0,
      conductivity: 0,
      hardness: 0,
      difficult: false,
      obscured: 0
    };
    MATERIALS2 = {
      stone: { label: "\u0E2B\u0E34\u0E19", layer: 0, source: "house", color: "#888888", props: { flammability: 0, fuel: 0, conductivity: 0.05, hardness: 8 } },
      wood: { label: "\u0E44\u0E21\u0E49", layer: 0, source: "house", color: "#8b5a2b", props: { flammability: 0.6, fuel: 3, conductivity: 0.05, hardness: 3 } },
      metal: { label: "\u0E40\u0E2B\u0E25\u0E47\u0E01", layer: 0, source: "house", color: "#9aa5b1", props: { flammability: 0, fuel: 0, conductivity: 1, hardness: 9 } },
      dirt: { label: "\u0E14\u0E34\u0E19", layer: 0, source: "house", color: "#6b4f2a", props: { flammability: 0.05, fuel: 0, conductivity: 0.1, hardness: 2 } },
      grass: { label: "\u0E2B\u0E0D\u0E49\u0E32", layer: 0, source: "house", color: "#4a8c3a", props: { flammability: 0.5, fuel: 1, conductivity: 0.05, hardness: 1 } },
      sand: { label: "\u0E17\u0E23\u0E32\u0E22", layer: 0, source: "house", color: "#d8c27a", props: { flammability: 0, fuel: 0, conductivity: 0.05, hardness: 1 } },
      forest: { label: "\u0E1B\u0E48\u0E32", layer: 0, source: "house", color: "#2f6b2f", props: { flammability: 0.6, fuel: 5, conductivity: 0.05, hardness: 2 } }
    };
    SUBSTANCES = {
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
    CATALOG = { materials: MATERIALS2, substances: SUBSTANCES };
  }
});

// src/rules/zoneGeometry.ts
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
var rectPoly, polyOf, cross, onSeg, anyTouch;
var init_zoneGeometry = __esm({
  "src/rules/zoneGeometry.ts"() {
    "use strict";
    rectPoly = (s) => [{ x: s.x, y: s.y }, { x: s.x + s.w, y: s.y }, { x: s.x + s.w, y: s.y + s.h }, { x: s.x, y: s.y + s.h }];
    polyOf = (s) => s.type === "rect" ? rectPoly(s) : s.type === "polygon" ? s.points : null;
    cross = (a, b, c) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
    onSeg = (a, b, p) => Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x) && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y);
    anyTouch = (xs, ys) => xs.some((x) => !x.hole && ys.some((y) => !y.hole && shapesTouch(x, y)));
  }
});

// src/rules/zones.ts
function makeZone(o) {
  return { id: `z${++counter}`, permanent: false, ...o };
}
function zoneFromVolume(o) {
  const { center, depth, gallons, ft3, ...rest } = o;
  const volume = ft3 ?? gallonsToFt3(gallons ?? 0);
  if (!(volume > 0) || !(depth > 0)) throw new Error("zoneFromVolume: \u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E1B\u0E23\u0E34\u0E21\u0E32\u0E15\u0E23\u0E41\u0E25\u0E30\u0E04\u0E27\u0E32\u0E21\u0E25\u0E36\u0E01\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32 0");
  return makeZone({ ...rest, volume, depth, shapes: [{ type: "circle", x: center.x, y: center.y, r: radiusFromVolume(volume, depth) }] });
}
function expiryAfter(rounds, clock) {
  return clock.round !== void 0 ? { kind: "round", at: clock.round + rounds, combat: clock.combat } : { kind: "world", at: clock.worldTime + rounds * ROUND_SEC };
}
function isExpired(z, clock) {
  const e = z.expires;
  if (!e || z.permanent) return false;
  if (e.kind === "world") return clock.worldTime >= e.at;
  return clock.round !== void 0 && (e.combat === void 0 || e.combat === clock.combat) && clock.round >= e.at;
}
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
    const key3 = z.hazard.name ?? z.kind;
    const old = hazards.get(key3);
    if (!old || z.hazard.amount > old.amount) hazards.set(key3, z.hazard);
  }
  props.flammability = clamp01(props.flammability);
  return { props, surface, layers, hazards: [...hazards.values()], sources, trace };
}
var counter, FT3_PER_GAL, gallonsToFt3, radiusFromVolume, minutesToRounds, concentrationDC, zonesBoundTo, clamp01, layerOf, SpatialHash, later, ZoneField;
var init_zones2 = __esm({
  "src/rules/zones.ts"() {
    "use strict";
    init_zones();
    init_zoneGeometry();
    counter = 0;
    FT3_PER_GAL = 0.133681;
    gallonsToFt3 = (g) => g * FT3_PER_GAL;
    radiusFromVolume = (ft3, depthFt) => Math.sqrt(ft3 / depthFt / Math.PI);
    minutesToRounds = (m) => m * 10;
    concentrationDC = (damage) => Math.max(10, Math.floor(damage / 2));
    zonesBoundTo = (zones, casterId) => zones.filter((z) => z.concentration && z.caster === casterId).map((z) => z.id);
    clamp01 = (n) => Math.min(1, Math.max(0, n));
    layerOf = (z, p) => z.layer ?? p.layer;
    SpatialHash = class {
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
    later = (a, b) => !a ? b : !b ? a : a.kind === b.kind ? b.at > a.at ? b : a : a;
    ZoneField = class {
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
  }
});

// src/rules/zoneTick.ts
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
  const hurt2 = world.creatures().filter((c) => burning.has(key({ col: c.pos.col, row: c.pos.row })) && !dousedKeys.has(key(c.pos)));
  if (hurt2.length) out.push({ kind: "people", cells: hurt2.map((c) => c.pos), act: true, source: "house", text: `${hurt2.map((c) => c.name).join(", ")} \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E0A\u0E48\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E44\u0E2B\u0E21\u0E49: DM \u0E01\u0E33\u0E2B\u0E19\u0E14\u0E14\u0E32\u0E40\u0E21\u0E08\u0E44\u0E1F (\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32\u0E08\u0E32\u0E01 compendium)` });
  return out;
}
var MAX_BURNING, key, show;
var init_zoneTick = __esm({
  "src/rules/zoneTick.ts"() {
    "use strict";
    init_zoneGeometry();
    MAX_BURNING = 400;
    key = (c) => `${c.col},${c.row}`;
    show = (cs, n = 6) => cs.slice(0, n).map((c) => `(${c.col},${c.row})`).join(" ") + (cs.length > n ? ` \u2026\u0E2D\u0E35\u0E01 ${cs.length - n}` : "");
  }
});

// src/rules/turnReport.ts
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
var NOTABLE;
var init_turnReport = __esm({
  "src/rules/turnReport.ts"() {
    "use strict";
    init_effect();
    init_zones();
    init_zones2();
    init_zoneTick();
    NOTABLE = 0.5;
  }
});

// src/foundry/snapshot.ts
function cellOf(scene, x, y) {
  const s = gridSize(scene), o = origin(scene);
  return { col: Math.round((x - o.x) / s), row: Math.round((y - o.y) / s) };
}
function topLeftOf(scene, c) {
  const s = gridSize(scene), o = origin(scene);
  return { x: o.x + c.col * s, y: o.y + c.row * s };
}
function centerOf(scene, c) {
  const s = gridSize(scene), t = topLeftOf(scene, c);
  return { x: t.x + s / 2, y: t.y + s / 2 };
}
function saveBonus(actor, ab) {
  const a = actor?.system?.abilities?.[ab];
  if (!a) return 0;
  const v = typeof a.save === "object" ? a.save?.value : a.save;
  return num2(v ?? a.mod);
}
function propFlag(tok) {
  let f;
  try {
    f = tok?.getFlag?.(MOD, "prop");
  } catch {
  }
  if (f === true) return {};
  return f && typeof f === "object" ? f : null;
}
function toProp(tok) {
  const f = propFlag(tok);
  if (!f) return null;
  const cellFt = gridFt(tok.parent), footprint = Math.max(1, Math.round(num2(tok.width, 1)));
  const material = typeof f.material === "string" ? f.material : PROP_DEFAULT.material;
  const heightFt = num2(f.heightFt, PROP_DEFAULT.heightFt) || PROP_DEFAULT.heightFt;
  const m = resolvePropMass({ override: Number(f.mass) || void 0, material, heightFt, footprint, cellFt, fill: Number(f.fill) || void 0 });
  return {
    id: String(tok.id),
    name: String(tok.name ?? "prop"),
    pos: cellOf(tok.parent, num2(tok.x), num2(tok.y)),
    footprint,
    elevation: num2(tok.elevation),
    mass: m.mass,
    massSource: m.source,
    material,
    heightFt,
    tags: f.immovable ? ["prop", "immovable"] : ["prop"]
  };
}
function toCreature(tok) {
  const actor = tok?.actor;
  if (!actor || isPropToken(tok)) return null;
  const sys = actor.system ?? {}, at = sys.attributes ?? {}, scene = tok.parent;
  const rawSize = sys.traits?.size;
  const size = SIZES.includes(rawSize) ? rawSize : "med";
  const conditions = [...actor.statuses ?? []].map(String);
  let tags = [];
  try {
    const t = actor.getFlag?.(MOD, "tags");
    if (Array.isArray(t)) tags = t.map(String);
  } catch {
  }
  if (conditions.includes("flying") && !tags.includes("flying")) tags.push("flying");
  let override;
  try {
    override = actor.getFlag?.(MOD, "mass");
  } catch {
  }
  const { mass, source: massSource, note: massNote } = resolveMass({
    override: Number(override) || void 0,
    weightLb: parseWeightLb(sys.details?.weight),
    heightFt: parseHeightFt(sys.details?.height),
    size
  });
  const mod = {}, save = {};
  for (const ab of ABILITIES) {
    mod[ab] = num2(sys.abilities?.[ab]?.mod);
    save[ab] = saveBonus(actor, ab);
  }
  const hp = at.hp ?? {};
  return {
    id: String(tok.id),
    name: String(tok.name ?? actor.name ?? "?"),
    pos: cellOf(scene, num2(tok.x), num2(tok.y)),
    footprint: Math.max(1, Math.round(num2(tok.width, 1))),
    elevation: num2(tok.elevation),
    size,
    mass,
    massSource,
    massNote,
    strScore: Number(sys.abilities?.str?.value) || void 0,
    speed: num2(at.movement?.walk, 30),
    ac: num2(at.ac?.value, 10),
    hp: { value: num2(hp.value, 1), max: num2(hp.max, num2(hp.value, 1)) },
    prof: num2(at.prof, 2),
    mod,
    save,
    conditions,
    tags
  };
}
var MOD, SOCK, ABILITIES, num2, gridSize, gridFt, origin, isPropToken;
var init_snapshot = __esm({
  "src/foundry/snapshot.ts"() {
    "use strict";
    init_creature();
    init_mass();
    init_propMass();
    init_props();
    MOD = "arkane-1920s";
    SOCK = `module.${MOD}`;
    ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
    num2 = (v, d = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : d;
    };
    gridSize = (scene) => num2(scene?.grid?.size, 100) || 100;
    gridFt = (scene) => num2(scene?.grid?.distance, 5) || 5;
    origin = (scene) => ({ x: num2(scene?.dimensions?.sceneX), y: num2(scene?.dimensions?.sceneY) });
    isPropToken = (tok) => propFlag(tok) !== null;
  }
});

// src/foundry/zones.ts
function shapesFromRegion(scene, raw) {
  const out = [], k = ftPerPx(scene);
  const poly = (pxPts, hole) => out.push({ type: "polygon", points: pxPts.map((p) => pxToFt(scene, p.x, p.y)), hole });
  for (const s of raw ?? []) {
    const hole = s?.hole === true;
    if (s?.type === "circle") {
      const c = pxToFt(scene, num3(s.x), num3(s.y));
      out.push({ type: "circle", x: c.x, y: c.y, r: num3(s.radius) * k, hole });
    } else if (s?.type === "rectangle") {
      const x = num3(s.x), y = num3(s.y), w = num3(s.width), h = num3(s.height), rot = num3(s.rotation);
      if (!rot) {
        const t = pxToFt(scene, x, y);
        out.push({ type: "rect", x: t.x, y: t.y, w: w * k, h: h * k, hole });
      } else poly(rotate([{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }], x + w / 2, y + h / 2, rot), hole);
    } else if (s?.type === "ellipse") {
      const cx = num3(s.x), cy = num3(s.y), rx = num3(s.radiusX), ry = num3(s.radiusY);
      const pts = Array.from({ length: 32 }, (_, i) => ({ x: cx + rx * Math.cos(i / 32 * 2 * Math.PI), y: cy + ry * Math.sin(i / 32 * 2 * Math.PI) }));
      poly(rotate(pts, cx, cy, num3(s.rotation)), hole);
    } else if (s?.type === "polygon" && Array.isArray(s.points)) {
      const pts = [];
      for (let i = 0; i + 1 < s.points.length; i += 2) pts.push({ x: num3(s.points[i]), y: num3(s.points[i + 1]) });
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
    const c = pxToFt(scene, num3(t.x), num3(t.y));
    return { id: `tpl:${t.id ?? i}`, kind: "oil", permanent: false, shapes: [{ type: "circle", x: c.x, y: c.y, r: num3(t.distance) }] };
  });
}
function coverageOf(scene) {
  let f;
  try {
    f = scene?.getFlag?.(MOD, "zoneCoverage");
  } catch {
  }
  return f?.mode === "fraction" && num3(f.min) > 0 ? { mode: "fraction", min: num3(f.min) } : void 0;
}
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
  return { round: c?.started ? num3(c.round) : void 0, combat: c?.id, worldTime: num3(game.time?.worldTime) };
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
async function reportZones(scene, whoTokenId, o = {}) {
  const { FoundryWorld: FoundryWorld2 } = await Promise.resolve().then(() => (init_world(), world_exports));
  const report = turnReport(new FoundryWorld2(scene), currentClock(), { whose: whoTokenId, tick: o.tick });
  const li = (xs) => xs.map((i) => `<li>${escH(i.text)} <small>[${i.source}]${i.proposal ? " \xB7 \u0E21\u0E35\u0E02\u0E49\u0E2D\u0E40\u0E2A\u0E19\u0E2D" : ""}</small></li>`).join("");
  const act = report.items.filter((i) => i.level === "act"), info = report.items.filter((i) => i.level !== "act");
  const html = `<div class="rw-card"><b>${escH(report.title)}</b>${act.length ? `<ul>${li(act)}</ul>` : ""}` + (info.length ? `<details><summary>\u0E23\u0E39\u0E49\u0E44\u0E27\u0E49 ${info.length} \u0E02\u0E49\u0E2D</summary><ul>${li(info)}</ul></details>` : "") + `</div>`;
  if (autoMode !== "all" && !act.length && o.auto) return report;
  await ChatMessage.create({ whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id), content: html });
  return report;
}
var FLAG, num3, ftPerPx, pxToFt, ftToPx, rotate, fieldOf, flagOf, colorOf, escH, autoMode, setAutoReport;
var init_zones3 = __esm({
  "src/foundry/zones.ts"() {
    "use strict";
    init_zones();
    init_zones2();
    init_turnReport();
    init_snapshot();
    FLAG = "zone";
    num3 = (v, d = 0) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : d;
    };
    ftPerPx = (scene) => gridFt(scene) / gridSize(scene);
    pxToFt = (scene, x, y) => {
      const o = origin(scene), k = ftPerPx(scene);
      return { x: (x - o.x) * k, y: (y - o.y) * k };
    };
    ftToPx = (scene, p) => {
      const o = origin(scene), k = ftPerPx(scene);
      return { x: o.x + p.x / k, y: o.y + p.y / k };
    };
    rotate = (pts, cx, cy, deg) => {
      if (!deg) return pts;
      const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
      return pts.map((p) => ({ x: cx + (p.x - cx) * c - (p.y - cy) * s, y: cy + (p.x - cx) * s + (p.y - cy) * c }));
    };
    fieldOf = (scene, catalog = CATALOG) => new ZoneField([...regionZones(scene), ...oilTemplateZones(scene)], { cellFt: gridFt(scene), coverage: coverageOf(scene), catalog });
    flagOf = (z) => {
      const { id, shapes, ...rest } = z;
      return rest;
    };
    colorOf = (z, cat = CATALOG) => (cat.substances[z.kind] ?? cat.materials[z.kind])?.color ?? "#ffffff";
    escH = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    autoMode = "off";
    setAutoReport = (m) => {
      autoMode = m === true ? "act" : m === false ? "off" : m;
    };
  }
});

// src/foundry/world.ts
var world_exports = {};
__export(world_exports, {
  FoundryWorld: () => FoundryWorld
});
var FoundryWorld;
var init_world = __esm({
  "src/foundry/world.ts"() {
    "use strict";
    init_snapshot();
    init_zones3();
    FoundryWorld = class {
      cellFt;
      scene;
      list;
      propList;
      heights;
      field;
      constructor(scene = canvas.scene) {
        this.scene = scene;
        this.cellFt = gridFt(scene);
        const toks = scene.tokens?.contents ?? [...scene.tokens.values()];
        this.list = toks.map(toCreature).filter((c) => !!c);
        this.propList = toks.map(toProp).filter((p) => !!p);
        let h;
        try {
          h = scene.getFlag?.(MOD, "heights");
        } catch {
        }
        this.heights = h && typeof h === "object" ? h : {};
        this.field = fieldOf(scene);
      }
      creature(id) {
        return this.list.find((c) => c.id === id);
      }
      creatures() {
        return this.list;
      }
      props() {
        return this.propList;
      }
      propAt(cell) {
        return this.propList.find((p) => cell.col >= p.pos.col && cell.col < p.pos.col + p.footprint && cell.row >= p.pos.row && cell.row < p.pos.row + p.footprint);
      }
      occupant(cell) {
        return this.list.find((c) => cell.col >= c.pos.col && cell.col < c.pos.col + c.footprint && cell.row >= c.pos.row && cell.row < c.pos.row + c.footprint);
      }
      blocked(from, to) {
        const a = centerOf(this.scene, from), b = centerOf(this.scene, to);
        const r = this.scene.dimensions?.sceneRect;
        if (r && (b.x < r.x || b.y < r.y || b.x > r.x + r.width || b.y > r.y + r.height)) return true;
        try {
          return !!CONFIG.Canvas.polygonBackends.move.testCollision(a, b, { type: "move", mode: "any" });
        } catch (e) {
          console.warn(MOD, "collision", e);
          return false;
        }
      }
      // ground height in ft: GM-painted via core.setHeightArea(); the module has no height data yet
      heightAt(cell) {
        return Number(this.heights[`${cell.col},${cell.row}`]) || 0;
      }
      // พื้นผิวของช่อง: ถามจาก Zone (จุดกลางช่องอยู่ในรูปร่าง หรือคลุมเกินสัดส่วน ตั้งที่ flag zoneCoverage ของฉาก)
      surfaceAt(cell) {
        return this.field.surfaceAtCell(cell);
      }
      zones() {
        return this.field.zones();
      }
      propertiesAt(p) {
        return this.field.propertiesAt(p);
      }
      cellOfToken(tok) {
        return cellOf(this.scene, tok.x, tok.y);
      }
    };
  }
});

// src/index.ts
init_creature();
init_effect();

// src/model/make.ts
init_bodies();
init_props();
init_propMass();
function makeCreature(o = {}) {
  const size = o.size ?? "med";
  const zero = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
  return {
    id: "c1",
    name: "Creature",
    pos: { col: 0, row: 0 },
    footprint: 1,
    elevation: 0,
    size,
    mass: BODY[size].massLb,
    massSource: "size",
    speed: 30,
    ac: 10,
    prof: 2,
    conditions: [],
    tags: [],
    ...o,
    hp: { value: 10, max: 10, ...o.hp },
    mod: { ...zero, ...o.mod },
    save: { ...zero, ...o.save }
  };
}
function makeProp(o = {}) {
  const { cellFt = 5, fill, ...rest } = o;
  const material = rest.material ?? PROP_DEFAULT.material, heightFt = rest.heightFt ?? PROP_DEFAULT.heightFt;
  const footprint = rest.footprint ?? 1;
  const m = resolvePropMass({ material, heightFt, footprint, cellFt, fill });
  return {
    id: "p1",
    name: "Prop",
    pos: { col: 0, row: 0 },
    elevation: 0,
    tags: ["prop"],
    mass: m.mass,
    massSource: m.source,
    ...rest,
    material,
    heightFt,
    footprint
  };
}

// src/rules/physics.ts
var drag = (s) => s.mu * s.weightLb;
function pushDistanceFt(s) {
  const f = drag(s);
  return s.forceLb <= f || f <= 0 ? 0 : s.strokeFt * s.forceLb / f;
}
function energyLeft(s, x) {
  const f = drag(s), net = s.forceLb - f;
  if (net <= 0 || x <= 0) return 0;
  if (x <= s.strokeFt) return net * x;
  return Math.max(0, net * s.strokeFt - f * (x - s.strokeFt));
}
var impactHeightFt = (energy, weightLb) => weightLb > 0 ? energy / weightLb : 0;
var NO_CRASH = { moverFt: 0, struckFt: 0, slideFt: 0, rest: 0, drag: 0 };
function collide(energy, moverMass, struckMass, mu) {
  if (energy <= 0 || moverMass <= 0) return NO_CRASH;
  if (!Number.isFinite(struckMass)) return { ...NO_CRASH, moverFt: impactHeightFt(energy, moverMass) };
  const total = moverMass + struckMass;
  const lost = energy * struckMass / total, rest = energy * moverMass / total;
  const drag2 = mu * total;
  return {
    moverFt: impactHeightFt(lost * struckMass / total, moverMass),
    struckFt: impactHeightFt(lost * moverMass / total, struckMass),
    slideFt: drag2 > 0 ? rest / drag2 : 0,
    rest,
    drag: drag2
  };
}

// src/rules/check.ts
var sum = (parts2) => parts2.reduce((n, p) => n + p.value, 0);
function rollSave(i, dice) {
  const dc = sum(i.dcParts);
  if (i.autoFail) {
    return {
      ok: false,
      total: 0,
      dc,
      natural: 0,
      crit: false,
      fumble: false,
      dcParts: i.dcParts,
      roll: [{ label: `\u0E25\u0E49\u0E21\u0E40\u0E2B\u0E25\u0E27\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (${i.autoFail})`, value: 0 }]
    };
  }
  const r = dice.d20(i.adv);
  const roll = [
    { label: i.adv === "normal" ? "d20" : `d20 (${i.adv})`, value: r.natural },
    { label: i.label, value: i.bonus }
  ];
  const total = sum(roll);
  return { ok: total >= dc, total, dc, natural: r.natural, crit: false, fumble: false, roll, dcParts: i.dcParts };
}
var parts = (p) => p.map((x) => `${x.label} ${x.value}`).join(" + ");
var formatCheck = (c) => `${parts(c.roll)} = ${c.total} vs DC ${c.dc} (${parts(c.dcParts)})`;

// src/rules/size.ts
init_creature();
var Size = {
  index: (s) => SIZES.indexOf(s)
};

// src/data/fall.ts
var FALL = { ftPerDie: 10, sides: 6, maxDice: 20, minImpactFt: 1 };

// src/data/conditions.ts
var CANT_ACT = ["unconscious", "paralyzed", "petrified", "stunned", "incapacitated", "dead"];
var AUTO_FAIL_STR_DEX = ["unconscious", "paralyzed", "petrified", "stunned"];

// src/rules/ruleset.ts
var Ruleset = class {
  name = "D&D 2024";
  // what an action costs to use
  costOf(_actionId) {
    return "action";
  }
  canAct(c) {
    return c.hp.value > 0 && !c.conditions.some((x) => CANT_ACT.includes(x));
  }
  // ---- shove
  shoveDC(actor) {
    return [{ label: "base", value: 8 }, { label: "STR", value: actor.mod.str }, { label: "prof", value: actor.prof }];
  }
  // the target resists with its better save (ties go to STR)
  shoveSaveAbility(target) {
    return target.save.str >= target.save.dex ? "str" : "dex";
  }
  // target may be at most one size larger
  canShoveSize(actor, target) {
    return Size.index(target.size) <= Size.index(actor.size) + 1;
  }
  pushFt(_actor, _target, _ground) {
    return 5;
  }
  // feet -> whole cells the push will try. The base rulebook moves exactly 1 cell, so floor is enough here
  cellsFor(ft, cellFt) {
    return Math.floor(ft / cellFt + 1e-9);
  }
  // how hard the target hits a wall, as "feet of falling" (fed to fall()). 2024 has no collision damage
  impactFt(_actor, _target, _travelledFt, _ground) {
    return 0;
  }
  // energy (ft-lb) the target still carries after being pushed `travelledFt`. 2024 has none, so nothing it hits gets hurt
  pushEnergy(_actor, _target, _travelledFt, _ground) {
    return 0;
  }
  // the target slams into another creature or prop. 2024: it just stops, no damage, nothing is carried along
  // (damage is in "feet of falling" for each side, slideFt = how far the pair keeps going together;
  // rest/drag let a chain track the energy left)
  collide(_energy, _mover, _struck, _surface) {
    return NO_CRASH;
  }
  // energy (ft-lb) a creature carries into whatever it hits after running `runFt` in a straight line. 2024 has no charge damage
  runEnergy(_actor, _runFt, _ground) {
    return 0;
  }
  explainRun(_actor, _runFt, _ground) {
    return ["\u0E01\u0E0E 2024: \u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19\u0E44\u0E21\u0E48\u0E21\u0E35\u0E41\u0E23\u0E07\u0E01\u0E23\u0E30\u0E41\u0E17\u0E01 \u0E41\u0E04\u0E48\u0E27\u0E34\u0E48\u0E07\u0E44\u0E1B\u0E16\u0E36\u0E07\u0E15\u0E31\u0E27\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22"];
  }
  // can something be shoved along by a collision? (props tagged "immovable" never)
  canMove(t) {
    return !t.tags.includes("immovable");
  }
  // ---- explanations for the sidebar / tests: the same numbers the rules use, written out
  explainPush(_actor, _target, _ground) {
    return ["\u0E01\u0E0E 2024: \u0E1C\u0E25\u0E31\u0E01 5 \u0E1F\u0E38\u0E15 (1 \u0E0A\u0E48\u0E2D\u0E07) \u0E40\u0E2A\u0E21\u0E2D \u0E44\u0E21\u0E48\u0E02\u0E36\u0E49\u0E19\u0E01\u0E31\u0E1A\u0E41\u0E23\u0E07\u0E2B\u0E23\u0E37\u0E2D\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01"];
  }
  roundingNote() {
    return "\u0E1B\u0E31\u0E14\u0E25\u0E07 (floor)";
  }
  // ---- saves
  advantage(c, ability) {
    return ability === "dex" && c.conditions.includes("restrained") ? "dis" : "normal";
  }
  autoFail(c, ability) {
    return ability === "str" || ability === "dex" ? c.conditions.find((x) => AUTO_FAIL_STR_DEX.includes(x)) : void 0;
  }
  save(target, ability, dcParts, dice) {
    return rollSave({
      label: `${ability.toUpperCase()} save`,
      bonus: target.save[ability],
      adv: this.advantage(target, ability),
      autoFail: this.autoFail(target, ability),
      dcParts
    }, dice);
  }
  // ---- falling
  // damage of a knock (crash into a body or a wall), from its "feet of falling" h. Unlike a fall (plain 5e, 1d6 per whole 10 ft)
  // an impact is smooth: whole dice for every 10 ft plus the leftover as a fraction of one die, so a small knock still bruises.
  //   exact = h / 10 ft   dice = floor(exact)   frac = exact - dice
  bruise(h) {
    const exact = Math.max(0, h) / FALL.ftPerDie;
    if (h < FALL.minImpactFt) return { dice: 0, sides: FALL.sides, frac: 0, exact };
    const dice = Math.min(FALL.maxDice, Math.floor(exact));
    return { dice, sides: FALL.sides, frac: dice >= FALL.maxDice ? 0 : exact - dice, exact };
  }
  // the sentences the harness shows under "how is damage worked out" (numbers come from data/, so they never go stale)
  explainDamage() {
    return [`\u0E01\u0E0E ${this.name}: \u0E01\u0E32\u0E23\u0E1C\u0E25\u0E31\u0E01/\u0E0A\u0E19\u0E44\u0E21\u0E48\u0E17\u0E33\u0E14\u0E32\u0E40\u0E21\u0E08 (\u0E21\u0E35\u0E41\u0E04\u0E48\u0E15\u0E01\u0E02\u0E2D\u0E1A ${FALL.sides === 6 ? "1d6" : `1d${FALL.sides}`} \u0E15\u0E48\u0E2D ${FALL.ftPerDie} \u0E1F\u0E38\u0E15 \u0E1B\u0E31\u0E14\u0E25\u0E07)`];
  }
  fall(dropFt) {
    return { dice: Math.min(FALL.maxDice, Math.floor(dropFt / FALL.ftPerDie)), sides: FALL.sides };
  }
};

// src/rules/physicsRuleset.ts
init_bodies();
init_surfaces();

// src/data/push.ts
var PUSH = {
  lbPerStr: 30,
  // 5e: push/drag/lift = 30 x STR score (lb)
  strokeFt: 1.5,
  // how far the target is pushed while the pusher still applies force (arm reach)
  bracing: 5,
  // pusher's traction multiplier: leaning/bracing makes grip far better than plain mu x weight
  maxChain: 3,
  // how many things in a row a crash can knock into (guards against endless chains)
  g: 32.17,
  // ft/s^2, only used for run-ups (v^2 = 2 a d) and the energy of a moving body (E = W v^2 / 2g)
  sprint: 1 / 2,
  // top charge speed in ft/s = creature speed (ft per round) x this: speed 30 -> 15 ft/s (about as hard as a STR 16 shove)
  rounding: "nearest"
};

// src/rules/fmt.ts
var n1 = (x) => String(Math.round(x * 10) / 10);
var n2 = (x) => String(Math.round(x * 100) / 100);

// src/rules/physicsRuleset.ts
var RulesetPhysics = class extends Ruleset {
  name = "D&D 2024 + physics";
  opt;
  constructor(o = {}) {
    super();
    this.opt = { rounding: PUSH.rounding, sizeRule: true, strokeFt: PUSH.strokeFt, bracing: PUSH.bracing, ...o };
  }
  canShoveSize(actor, target) {
    return !this.opt.sizeRule || super.canShoveSize(actor, target);
  }
  // the real STR score when the adapter knows it; otherwise 10 + 2 x mod (odd scores round down)
  strScore(c) {
    return Math.max(1, c.strScore ?? 10 + 2 * c.mod.str);
  }
  pushForce(c) {
    return PUSH.lbPerStr * this.strScore(c) * BODY[c.size].forceMult;
  }
  friction(surface) {
    return Math.max(MIN_MU, FRICTION[surface ?? "floor"] ?? FRICTION.floor);
  }
  // the most force feet can transmit: mu x weight x bracing. Oil under the pusher -> almost nothing
  tractionLimit(c, surface) {
    return this.friction(surface) * this.opt.bracing * c.mass;
  }
  slide(actor, target, g = {}) {
    return {
      forceLb: Math.min(this.pushForce(actor), this.tractionLimit(actor, g.actor)),
      weightLb: target.mass,
      mu: this.friction(g.target),
      strokeFt: this.opt.strokeFt
    };
  }
  pushFt(actor, target, g) {
    return pushDistanceFt(this.slide(actor, target, g));
  }
  roundingNote() {
    return this.opt.rounding === "floor" ? "\u0E1B\u0E31\u0E14\u0E25\u0E07 (floor)" : "\u0E1B\u0E31\u0E14\u0E43\u0E01\u0E25\u0E49\u0E2A\u0E38\u0E14 (\u0E04\u0E23\u0E36\u0E48\u0E07\u0E0A\u0E48\u0E2D\u0E07\u0E1E\u0E2D\u0E14\u0E35\u0E1B\u0E31\u0E14\u0E25\u0E07)";
  }
  explainPush(actor, target, g = {}) {
    const score = this.strScore(actor), mult = BODY[actor.size].forceMult;
    const force = this.pushForce(actor), grip = this.tractionLimit(actor, g.actor), used = Math.min(force, grip);
    const muT = this.friction(g.target), drag2 = muT * target.mass;
    const out = [
      `\u0E41\u0E23\u0E07\u0E1C\u0E25\u0E31\u0E01 F = ${PUSH.lbPerStr} \xD7 STR ${score} \xD7 \u0E15\u0E31\u0E27\u0E04\u0E39\u0E13\u0E02\u0E19\u0E32\u0E14 (${actor.size}) ${mult} = ${n1(force)} lb`,
      `traction \u0E1C\u0E39\u0E49\u0E1C\u0E25\u0E31\u0E01 = \u03BC ${this.friction(g.actor)} (${g.actor ?? "\u0E1E\u0E37\u0E49\u0E19\u0E1B\u0E01\u0E15\u0E34"}) \xD7 bracing ${this.opt.bracing} \xD7 \u0E21\u0E27\u0E25 ${n1(actor.mass)} lb = ${n1(grip)} lb${grip < force ? "  \u2190 \u0E08\u0E33\u0E01\u0E31\u0E14\u0E41\u0E23\u0E07" : ""}`,
      `\u0E41\u0E23\u0E07\u0E17\u0E35\u0E48\u0E2A\u0E48\u0E07\u0E44\u0E14\u0E49\u0E08\u0E23\u0E34\u0E07 = min(${n1(force)}, ${n1(grip)}) = ${n1(used)} lb`,
      `\u0E41\u0E23\u0E07\u0E40\u0E2A\u0E35\u0E22\u0E14\u0E17\u0E32\u0E19\u0E02\u0E2D\u0E07\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 \u03BCW = ${muT} (${g.target ?? "\u0E1E\u0E37\u0E49\u0E19\u0E1B\u0E01\u0E15\u0E34"}) \xD7 ${n1(target.mass)} lb = ${n1(drag2)} lb`
    ];
    out.push(used <= drag2 ? `F \u2264 \u03BCW \u2192 \u0E02\u0E22\u0E31\u0E1A\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E23\u0E30\u0E22\u0E30 0` : `\u0E23\u0E30\u0E22\u0E30\u0E23\u0E27\u0E21 d = s \xD7 F/(\u03BCW) = ${this.opt.strokeFt} \xD7 ${n1(used)}/${n1(drag2)} = ${n1(this.pushFt(actor, target, g))} \u0E1F\u0E38\u0E15`);
    return out;
  }
  cellsFor(ft, cellFt) {
    const n = ft / cellFt;
    return Math.max(0, this.opt.rounding === "floor" ? Math.floor(n + 1e-9) : Math.ceil(n - 0.5 - 1e-9));
  }
  pushEnergy(actor, target, travelledFt, g) {
    return energyLeft(this.slide(actor, target, g), travelledFt);
  }
  impactFt(actor, target, travelledFt, g) {
    return impactHeightFt(this.pushEnergy(actor, target, travelledFt, g), target.mass);
  }
  // a runner is limited by grip, not strength: a = mu x g, until it hits its top speed. E = W v^2 / 2g
  runSpeed(actor, runFt, g) {
    const a = this.friction(g?.actor) * PUSH.g, vmax = actor.speed * PUSH.sprint;
    return { a, vmax, v: Math.min(Math.sqrt(2 * a * Math.max(0, runFt)), vmax) };
  }
  runEnergy(actor, runFt, g) {
    const { v } = this.runSpeed(actor, runFt, g);
    return actor.mass * v * v / (2 * PUSH.g);
  }
  explainRun(actor, runFt, g) {
    const { a, vmax, v } = this.runSpeed(actor, runFt, g), mu = this.friction(g?.actor);
    return [
      `\u0E27\u0E34\u0E48\u0E07\u0E40\u0E23\u0E48\u0E07\u0E14\u0E49\u0E27\u0E22\u0E41\u0E23\u0E07\u0E40\u0E01\u0E32\u0E30\u0E1E\u0E37\u0E49\u0E19: a = \u03BC\xD7g = ${n1(mu)}\xD7${PUSH.g} = ${n1(a)} ft/s\xB2 (\u0E1E\u0E37\u0E49\u0E19${g?.actor ?? "\u0E1B\u0E01\u0E15\u0E34"})`,
      `\u0E04\u0E27\u0E32\u0E21\u0E40\u0E23\u0E47\u0E27\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 = speed ${actor.speed} ft \xD7 ${n1(PUSH.sprint)} = ${n1(vmax)} ft/s; \u0E27\u0E34\u0E48\u0E07 ${n1(runFt)} \u0E1F\u0E38\u0E15 \u0E44\u0E14\u0E49 v = min(\u221A(2ad), \u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14) = ${n1(v)} ft/s`,
      `\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19 E = \u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 ${n1(actor.mass)} lb \xD7 v\xB2 \xF7 2g = ${n1(actor.mass * v * v / (2 * PUSH.g))} ft-lb`
    ];
  }
  explainDamage() {
    const d = `d${FALL.sides}`;
    return [
      "1) \u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E15\u0E2D\u0E19\u0E0A\u0E19 E (ft-lb): \u0E1C\u0E25\u0E31\u0E01 = (\u0E41\u0E23\u0E07\u0E1C\u0E25\u0E31\u0E01 \u2212 \u0E41\u0E23\u0E07\u0E40\u0E2A\u0E35\u0E22\u0E14\u0E17\u0E32\u0E19) \xD7 \u0E23\u0E30\u0E22\u0E30\u0E17\u0E35\u0E48\u0E22\u0E31\u0E07\u0E1C\u0E25\u0E31\u0E01\u0E2D\u0E22\u0E39\u0E48 \u0E41\u0E25\u0E49\u0E27\u0E04\u0E48\u0E2D\u0E22 \u0E46 \u0E2B\u0E21\u0E14\u0E44\u0E1B\u0E40\u0E1E\u0E23\u0E32\u0E30\u0E40\u0E2A\u0E35\u0E22\u0E14\u0E17\u0E32\u0E19; \u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19 = \u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 \xD7 v\xB2 \xF7 2g",
      "2) \u0E0A\u0E19\u0E04\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E02\u0E2D\u0E07 (\u0E0A\u0E19\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E22\u0E37\u0E14\u0E2B\u0E22\u0E38\u0E48\u0E19): \u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E40\u0E2A\u0E35\u0E22\u0E44\u0E1B = E \xD7 m\u2082 \xF7 (m\u2081 + m\u2082) \u0E15\u0E31\u0E27\u0E17\u0E35\u0E48\u0E0A\u0E19\u0E41\u0E25\u0E30\u0E15\u0E31\u0E27\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E0A\u0E19\u0E41\u0E1A\u0E48\u0E07\u0E01\u0E31\u0E19 \u0E15\u0E31\u0E27\u0E40\u0E1A\u0E32\u0E44\u0E14\u0E49\u0E2A\u0E48\u0E27\u0E19\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32 (\u0E15\u0E31\u0E27\u0E17\u0E35\u0E48\u0E0A\u0E19\u0E23\u0E31\u0E1A m\u2082/(m\u2081+m\u2082), \u0E15\u0E31\u0E27\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E0A\u0E19\u0E23\u0E31\u0E1A m\u2081/(m\u2081+m\u2082)); \u0E17\u0E35\u0E48\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E1E\u0E32\u0E01\u0E31\u0E19\u0E44\u0E16\u0E25\u0E15\u0E48\u0E2D",
      "3) \u0E0A\u0E19\u0E01\u0E33\u0E41\u0E1E\u0E07: \u0E40\u0E08\u0E47\u0E1A\u0E40\u0E15\u0E47\u0E21 E (\u0E01\u0E33\u0E41\u0E1E\u0E07\u0E40\u0E2B\u0E21\u0E37\u0E2D\u0E19\u0E21\u0E27\u0E25\u0E2D\u0E19\u0E31\u0E19\u0E15\u0E4C)",
      "4) \u0E41\u0E1B\u0E25\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E39\u0E07\u0E17\u0E35\u0E48\u0E15\u0E01: h = \u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E02\u0E2D\u0E07\u0E1D\u0E48\u0E32\u0E22\u0E19\u0E31\u0E49\u0E19 \xF7 \u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E15\u0E31\u0E27\u0E40\u0E2D\u0E07 (ft)",
      `5) \u0E14\u0E32\u0E40\u0E21\u0E08: n = h \xF7 ${FALL.ftPerDie} \u0E1F\u0E38\u0E15; \u0E17\u0E2D\u0E22 \u230An\u230B${d} \u0E1A\u0E27\u0E01\u0E40\u0E28\u0E29 (n \u2212 \u230An\u230B) \u0E02\u0E2D\u0E07 1${d} (\u0E17\u0E2D\u0E22 1${d} \u0E04\u0E39\u0E13\u0E40\u0E28\u0E29 \u0E1B\u0E31\u0E14\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E25\u0E02\u0E40\u0E15\u0E47\u0E21 \u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 1); h \u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32 ${FALL.minImpactFt} \u0E1F\u0E38\u0E15 = \u0E44\u0E21\u0E48\u0E40\u0E08\u0E47\u0E1A; \u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 ${FALL.maxDice}${d}`,
      `6) \u0E15\u0E01\u0E02\u0E2D\u0E1A\u0E40\u0E1B\u0E47\u0E19\u0E01\u0E0E 5e \u0E15\u0E23\u0E07 \u0E46: ${FALL.sides === 6 ? "1d6" : `1d${FALL.sides}`} \u0E15\u0E48\u0E2D ${FALL.ftPerDie} \u0E1F\u0E38\u0E15\u0E40\u0E15\u0E47\u0E21 (\u0E1B\u0E31\u0E14\u0E25\u0E07 \u0E44\u0E21\u0E48\u0E21\u0E35\u0E40\u0E28\u0E29) \u0E41\u0E25\u0E49\u0E27\u0E25\u0E49\u0E21`
    ];
  }
  collide(energy, mover, struck, surface) {
    const m2 = this.canMove(struck) ? struck.mass : Infinity;
    return collide(energy, mover.mass, m2, this.friction(surface));
  }
};

// src/index.ts
init_mass();
init_propMass();

// src/rules/dice.ts
function pick(rolls, adv) {
  return adv === "adv" ? Math.max(...rolls) : adv === "dis" ? Math.min(...rolls) : rolls[0];
}
function randomDice(rng = Math.random) {
  const die = (sides) => 1 + Math.floor(rng() * sides);
  return {
    d20(adv = "normal") {
      const rolls = adv === "normal" ? [die(20)] : [die(20), die(20)];
      return { rolls, natural: pick(rolls, adv) };
    },
    roll(count, sides) {
      let t = 0;
      for (let i = 0; i < count; i++) t += die(sides);
      return t;
    }
  };
}
function scriptedDice(values) {
  const q = [...values];
  const next = () => {
    const v = q.shift();
    if (v === void 0) throw new Error("scriptedDice: out of values");
    return v;
  };
  return {
    d20(adv = "normal") {
      const rolls = adv === "normal" ? [next()] : [next(), next()];
      return { rolls, natural: pick(rolls, adv) };
    },
    roll(count) {
      let t = 0;
      for (let i = 0; i < count; i++) t += next();
      return t;
    }
  };
}
function recordDice(base) {
  const rolled = [];
  return {
    rolled,
    dice: {
      d20(adv = "normal") {
        const r = base.d20(adv);
        rolled.push(...r.rolls);
        return r;
      },
      roll(count, sides) {
        let t = 0;
        for (let i = 0; i < count; i++) {
          const v = base.roll(1, sides);
          rolled.push(v);
          t += v;
        }
        return t;
      }
    }
  };
}

// src/actions/charge.ts
init_effect();

// src/rules/reach.ts
function cellsOf(c, at = c.pos) {
  const out = [];
  for (let r = 0; r < c.footprint; r++)
    for (let k = 0; k < c.footprint; k++) out.push({ col: at.col + k, row: at.row + r });
  return out;
}
function gap(a, b) {
  const dx = Math.max(a.pos.col - (b.pos.col + b.footprint), b.pos.col - (a.pos.col + a.footprint), 0);
  const dy = Math.max(a.pos.row - (b.pos.row + b.footprint), b.pos.row - (a.pos.row + a.footprint), 0);
  return Math.max(dx, dy);
}
function awayFrom(a, b) {
  const ax = a.pos.col + a.footprint / 2, ay = a.pos.row + a.footprint / 2;
  const bx = b.pos.col + b.footprint / 2, by = b.pos.row + b.footprint / 2;
  const len = Math.hypot(bx - ax, by - ay) || 1;
  return { col: Math.round((bx - ax) / len) || 0, row: Math.round((by - ay) / len) || 0 };
}

// src/actions/shove.ts
init_effect();

// src/actions/motion.ts
init_effect();

// src/rules/push.ts
function resolvePush(world, target, step, cells, ignore = []) {
  let pos = target.pos, moved = 0, stopped = null, hit;
  const free = (t) => !t || t.id === target.id || ignore.includes(t.id);
  for (let i = 0; i < cells; i++) {
    const next = { col: pos.col + step.col, row: pos.row + step.row };
    const from = cellsOf(target, pos), to = cellsOf(target, next);
    if (from.some((c, k) => world.blocked(c, to[k]))) {
      stopped = "wall";
      break;
    }
    const crea = to.map((c) => world.occupant(c)).find((o) => !free(o));
    if (crea) {
      stopped = "creature";
      hit = crea;
      break;
    }
    const prop = to.map((c) => world.propAt(c)).find((o) => !free(o));
    if (prop) {
      stopped = "prop";
      hit = prop;
      break;
    }
    pos = next;
    moved++;
  }
  const flying = target.tags.includes("flying");
  const dropFt = moved > 0 && !flying ? Math.max(0, world.heightAt(target.pos) - world.heightAt(pos)) : 0;
  return { to: pos, moved, stopped, hit, dropFt, surface: moved > 0 ? world.surfaceAt(pos) : void 0 };
}

// src/rules/chain.ts
function runCrash(world, rules, c, trace = () => {
}) {
  const cellFt = world.cellFt, step = c.step, target = c.front;
  let energy = c.energy;
  let mass = target.mass, front = target, hit = c.hit;
  const out = { bumps: [], hurt: [], extra: [], shift: 0, ids: [target.id] };
  const slid = [];
  for (let depth = 0; hit && depth < PUSH.maxChain; depth++) {
    const col = rules.collide(energy, { ...front, mass }, hit, world.surfaceAt(hit.pos));
    if (col.moverFt <= 0 && col.struckFt <= 0 && col.slideFt <= 0) {
      trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E04\u0E23\u0E31\u0E49\u0E07\u0E17\u0E35\u0E48 ${depth + 1}: ${front.name} \u0E0A\u0E19 ${hit.name} \u0E41\u0E15\u0E48\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E40\u0E2B\u0E25\u0E37\u0E2D ${n1(energy)} ft-lb \u0E44\u0E21\u0E48\u0E1E\u0E2D\u0E17\u0E33\u0E2D\u0E30\u0E44\u0E23`);
      break;
    }
    const lost = energy - col.rest, movable = rules.canMove(hit);
    trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E04\u0E23\u0E31\u0E49\u0E07\u0E17\u0E35\u0E48 ${depth + 1}: ${front.name} (\u0E02\u0E1A\u0E27\u0E19\u0E21\u0E27\u0E25\u0E23\u0E27\u0E21 ${n1(mass)} lb, \u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19 E = ${n1(energy)} ft-lb) \u0E0A\u0E19 ${hit.name} (${movable ? `${n1(hit.mass)} lb` : "\u0E15\u0E23\u0E36\u0E07 = \u0E40\u0E2B\u0E21\u0E37\u0E2D\u0E19\u0E01\u0E33\u0E41\u0E1E\u0E07"})`);
    if (movable) trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E0A\u0E19\u0E41\u0E1A\u0E1A inelastic: \u0E40\u0E2A\u0E35\u0E22 E\xD7m2/(m1+m2) = ${n1(lost)} ft-lb \u0E01\u0E25\u0E32\u0E22\u0E40\u0E1B\u0E47\u0E19\u0E14\u0E32\u0E40\u0E21\u0E08, \u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E44\u0E1B\u0E15\u0E48\u0E2D E\xD7m1/(m1+m2) = ${n1(col.rest)} ft-lb`);
    trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E1C\u0E39\u0E49\u0E0A\u0E19\u0E23\u0E31\u0E1A\u0E41\u0E23\u0E07\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E48\u0E32\u0E15\u0E01\u0E08\u0E32\u0E01 ${n1(col.moverFt)} \u0E1F\u0E38\u0E15, ${hit.name} \u0E23\u0E31\u0E1A ${n1(col.struckFt)} \u0E1F\u0E38\u0E15 (\u0E1D\u0E31\u0E48\u0E07\u0E17\u0E35\u0E48\u0E40\u0E1A\u0E32\u0E01\u0E27\u0E48\u0E32\u0E23\u0E31\u0E1A\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32)`);
    out.bumps.push({ front, hit });
    if (col.moverFt > 0) out.hurt.push({ who: front, ft: col.moverFt * mass / front.mass });
    if (col.struckFt > 0) out.hurt.push({ who: hit, ft: col.struckFt });
    const cells = rules.canMove(hit) ? rules.cellsFor(col.slideFt, cellFt) : 0;
    if (!movable) {
      trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `${hit.name} \u0E02\u0E22\u0E31\u0E1A\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E08\u0E1A\u0E25\u0E39\u0E01\u0E42\u0E0B\u0E48`);
      break;
    }
    trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E44\u0E16\u0E25\u0E15\u0E48\u0E2D\u0E14\u0E49\u0E27\u0E22\u0E01\u0E31\u0E19 = rest/(\u03BC\xD7\u0E21\u0E27\u0E25\u0E23\u0E27\u0E21) = ${n1(col.rest)}/${n1(col.drag)} = ${n1(col.slideFt)} \u0E1F\u0E38\u0E15 \u2192 ${cells} \u0E0A\u0E48\u0E2D\u0E07`);
    if (cells === 0) {
      trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E44\u0E21\u0E48\u0E16\u0E36\u0E07\u0E04\u0E23\u0E36\u0E48\u0E07\u0E0A\u0E48\u0E2D\u0E07 ${hit.name} \u0E44\u0E21\u0E48\u0E02\u0E22\u0E31\u0E1A \u0E08\u0E1A\u0E25\u0E39\u0E01\u0E42\u0E0B\u0E48`);
      break;
    }
    out.ids.push(hit.id);
    const s = resolvePush(world, hit, step, cells, out.ids);
    slid.push({ thing: hit, cells: s.moved });
    mass += hit.mass;
    front = hit;
    energy = Math.max(0, col.rest - col.drag * s.moved * cellFt);
    trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `${hit.name} \u0E16\u0E39\u0E01\u0E14\u0E31\u0E19\u0E44\u0E1B\u0E44\u0E14\u0E49 ${s.moved} \u0E0A\u0E48\u0E2D\u0E07${s.stopped ? ` \u0E41\u0E25\u0E49\u0E27\u0E16\u0E39\u0E01\u0E02\u0E27\u0E32\u0E07${s.hit ? ` \u0E42\u0E14\u0E22 ${s.hit.name}` : "\u0E14\u0E49\u0E27\u0E22\u0E01\u0E33\u0E41\u0E1E\u0E07"}` : ""} \u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E25\u0E37\u0E2D ${n1(energy)} ft-lb`);
    if (s.stopped === "wall") {
      if (energy > 0) {
        out.hurt.push({ who: hit, ft: energy / hit.mass });
        trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E02\u0E1A\u0E27\u0E19\u0E01\u0E23\u0E30\u0E41\u0E17\u0E01\u0E01\u0E33\u0E41\u0E1E\u0E07: ${hit.name} \u0E23\u0E31\u0E1A ${n1(energy)}/${n1(hit.mass)} = ${n1(energy / hit.mass)} \u0E1F\u0E38\u0E15`);
      }
      break;
    }
    hit = s.stopped ? s.hit : void 0;
  }
  if (hit && out.bumps.length >= PUSH.maxChain) trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E0A\u0E19\u0E15\u0E48\u0E2D\u0E40\u0E19\u0E37\u0E48\u0E2D\u0E07\u0E04\u0E23\u0E1A ${PUSH.maxChain} \u0E04\u0E23\u0E31\u0E49\u0E07\u0E41\u0E25\u0E49\u0E27 \u0E15\u0E31\u0E14\u0E25\u0E39\u0E01\u0E42\u0E0B\u0E48 (PUSH.maxChain)`);
  let ahead = 0;
  for (let i = slid.length - 1; i >= 0; i--) {
    ahead += slid[i].cells;
    if (ahead > 0) out.extra.unshift({ thing: slid[i].thing, cells: ahead });
  }
  out.shift = ahead;
  return out.bumps.length ? out : void 0;
}

// src/actions/motion.ts
var WHY = { wall: "\u0E15\u0E34\u0E14\u0E01\u0E33\u0E41\u0E1E\u0E07", creature: "\u0E21\u0E35\u0E04\u0E19\u0E22\u0E37\u0E19\u0E02\u0E27\u0E32\u0E07\u0E2D\u0E22\u0E39\u0E48", prop: "\u0E21\u0E35\u0E02\u0E2D\u0E07\u0E02\u0E27\u0E32\u0E07\u0E2D\u0E22\u0E39\u0E48" };
var isProp = (t) => "material" in t;
function hurt({ rules, dice, trace }, who, h, why, step) {
  if (isProp(who)) {
    trace?.(step, `${who.name} \u0E40\u0E1B\u0E47\u0E19\u0E02\u0E2D\u0E07 \u0E44\u0E21\u0E48\u0E21\u0E35 HP \u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E40\u0E2A\u0E35\u0E22\u0E2B\u0E32\u0E22`);
    return [];
  }
  const b = rules.bruise(h), d = `d${b.sides}`;
  if (b.dice <= 0 && b.frac <= 0) {
    trace?.(step, `${who.name}: \u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E48\u0E32\u0E15\u0E01 ${n1(h)} \u0E1F\u0E38\u0E15 \u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32\u0E02\u0E31\u0E49\u0E19\u0E15\u0E48\u0E33 \u2192 \u0E41\u0E04\u0E48\u0E01\u0E23\u0E30\u0E41\u0E17\u0E01\u0E40\u0E1A\u0E32 \u0E46 \u0E44\u0E21\u0E48\u0E40\u0E2A\u0E35\u0E22\u0E2B\u0E32\u0E22`);
    return [];
  }
  const whole = b.dice > 0 ? dice.roll(b.dice, b.sides) : 0;
  const roll = b.frac > 0 ? dice.roll(1, b.sides) : 0, part = b.frac > 0 ? Math.max(1, Math.round(roll * b.frac)) : 0;
  const dmg = whole + part;
  trace?.(step, `${who.name}: \u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E48\u0E32\u0E15\u0E01 ${n1(h)} \u0E1F\u0E38\u0E15 \u2192 n = ${n1(h)} \xF7 10 = ${n2(b.exact)} \u0E25\u0E39\u0E01\u0E40\u0E15\u0E4B\u0E32 \u2192 ${b.dice > 0 ? `${b.dice}${d} \u0E17\u0E2D\u0E22\u0E44\u0E14\u0E49 ${whole}` : "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E40\u0E15\u0E4B\u0E32\u0E40\u0E15\u0E47\u0E21"}` + (b.frac > 0 ? ` + \u0E40\u0E28\u0E29 ${n2(b.frac)} \u0E02\u0E2D\u0E07 1${d} (\u0E17\u0E2D\u0E22 ${roll} \xD7 ${n2(b.frac)} = ${n2(roll * b.frac)} \u2192 \u0E1B\u0E31\u0E14\u0E40\u0E1B\u0E47\u0E19 ${part}, \u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 1)` : "") + ` = ${dmg} \u0E14\u0E32\u0E40\u0E21\u0E08`);
  return [Fx.log(`${why} \u0E40\u0E2A\u0E35\u0E22 ${dmg} \u0E14\u0E32\u0E40\u0E21\u0E08`), Fx.damage(who.id, dmg, "bludgeoning")];
}
function fallFx({ rules, dice, trace }, who, dropFt) {
  if (dropFt <= 0) return [];
  const fall = rules.fall(dropFt);
  if (fall.dice > 0 && !isProp(who)) {
    const dmg = dice.roll(fall.dice, fall.sides);
    trace?.("\u0E15\u0E01\u0E02\u0E2D\u0E1A", `${who.name} \u0E15\u0E01\u0E08\u0E32\u0E01\u0E2A\u0E39\u0E07 ${dropFt} \u0E1F\u0E38\u0E15 \u2192 ${fall.dice}d${fall.sides} \u0E17\u0E2D\u0E22\u0E44\u0E14\u0E49 ${dmg} \u0E41\u0E25\u0E30\u0E25\u0E49\u0E21 (prone)`);
    return [Fx.log(`${who.name} \u0E15\u0E01\u0E08\u0E32\u0E01\u0E17\u0E35\u0E48\u0E2A\u0E39\u0E07 ${dropFt} \u0E1F\u0E38\u0E15 \u0E40\u0E2A\u0E35\u0E22 ${dmg} \u0E14\u0E32\u0E40\u0E21\u0E08`), Fx.damage(who.id, dmg, "bludgeoning"), Fx.prone(who.id)];
  }
  trace?.("\u0E15\u0E01\u0E02\u0E2D\u0E1A", `${who.name} \u0E15\u0E01\u0E25\u0E07\u0E21\u0E32 ${dropFt} \u0E1F\u0E38\u0E15 ${isProp(who) ? "\u0E41\u0E15\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E02\u0E2D\u0E07 \u0E44\u0E21\u0E48\u0E40\u0E2A\u0E35\u0E22\u0E2B\u0E32\u0E22" : "\u0E41\u0E15\u0E48\u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32 10 \u0E1F\u0E38\u0E15 \u0E44\u0E21\u0E48\u0E40\u0E08\u0E47\u0E1A"}`);
  return [Fx.log(`${who.name} \u0E15\u0E01\u0E25\u0E07\u0E21\u0E32 ${dropFt} \u0E1F\u0E38\u0E15${isProp(who) ? "" : " (\u0E44\u0E21\u0E48\u0E40\u0E08\u0E47\u0E1A)"}`)];
}
function resolveMotion(ctx, m) {
  const { world, rules } = ctx, t = ctx.trace ?? (() => {
  });
  const { body, step } = m;
  const first = resolvePush(world, body, step, m.cells);
  t("\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07", `\u0E17\u0E34\u0E28 (${step.col}, ${step.row}) \u0E15\u0E31\u0E49\u0E07\u0E43\u0E08\u0E44\u0E1B ${m.cells} \u0E0A\u0E48\u0E2D\u0E07 \u0E44\u0E1B\u0E44\u0E14\u0E49\u0E08\u0E23\u0E34\u0E07 ${first.moved} \u0E0A\u0E48\u0E2D\u0E07 \u2014 ${first.stopped ? `\u0E2B\u0E22\u0E38\u0E14\u0E40\u0E1E\u0E23\u0E32\u0E30${WHY[first.stopped]}${first.hit ? ` (${first.hit.name})` : ""}` : "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2D\u0E30\u0E44\u0E23\u0E02\u0E27\u0E32\u0E07"}`);
  if (first.moved === 0) return { fx: [], moved: 0, stopped: first.stopped };
  const crash = first.hit ? runCrash(world, rules, { front: body, energy: m.energyAt(first.moved * world.cellFt), hit: first.hit, step }, ctx.trace) : void 0;
  if (first.hit && !crash) t("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `${body.name} \u0E0A\u0E19 ${first.hit.name} \u0E41\u0E15\u0E48\u0E01\u0E0E\u0E19\u0E35\u0E49\u0E44\u0E21\u0E48\u0E21\u0E35\u0E14\u0E32\u0E40\u0E21\u0E08\u0E0A\u0E19\u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E14\u0E31\u0E19\u0E15\u0E48\u0E2D \u0E08\u0E36\u0E07\u0E41\u0E04\u0E48\u0E2B\u0E22\u0E38\u0E14`);
  const r = crash && crash.shift > 0 ? resolvePush(world, body, step, first.moved + crash.shift, crash.ids) : first;
  if (crash && crash.shift > 0) t("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `${body.name} \u0E15\u0E32\u0E21\u0E02\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E0A\u0E19\u0E44\u0E1B\u0E2D\u0E35\u0E01 ${crash.shift} \u0E0A\u0E48\u0E2D\u0E07 \u0E23\u0E27\u0E21\u0E40\u0E14\u0E34\u0E19\u0E17\u0E32\u0E07 ${r.moved} \u0E0A\u0E48\u0E2D\u0E07`);
  const note = crash ? ` (\u0E0A\u0E19 ${first.hit.name})` : r.stopped ? ` (\u0E2B\u0E22\u0E38\u0E14\u0E40\u0E1E\u0E23\u0E32\u0E30${WHY[r.stopped]})` : "";
  const fx = [m.describe(r, note), Fx.push(body.id, r.to)];
  const falls = [];
  if (crash) {
    for (const b of crash.bumps) fx.push(Fx.log(`${b.front.name} \u0E0A\u0E19 ${b.hit.name}`));
    for (const h of crash.hurt) fx.push(...hurt(ctx, h.who, h.ft, `${h.who.name} \u0E40\u0E08\u0E47\u0E1A\u0E08\u0E32\u0E01\u0E01\u0E32\u0E23\u0E0A\u0E19 \u0E41\u0E23\u0E07\u0E40\u0E17\u0E48\u0E32\u0E15\u0E01\u0E08\u0E32\u0E01 ${Math.round(h.ft)} \u0E1F\u0E38\u0E15`, "\u0E14\u0E32\u0E40\u0E21\u0E08\u0E08\u0E32\u0E01\u0E01\u0E32\u0E23\u0E0A\u0E19"));
    for (const x of crash.extra) {
      const s = resolvePush(world, x.thing, step, x.cells, crash.ids);
      if (s.moved === 0) continue;
      fx.push(Fx.log(`${x.thing.name} \u0E16\u0E39\u0E01\u0E14\u0E31\u0E19\u0E44\u0E1B\u0E2D\u0E35\u0E01 ${s.moved * world.cellFt} \u0E1F\u0E38\u0E15`), Fx.push(x.thing.id, s.to));
      falls.push(...fallFx(ctx, x.thing, s.dropFt));
    }
  }
  if (first.stopped === "wall") {
    const e = m.energyAt(first.moved * world.cellFt), h = impactHeightFt(e, body.mass);
    t("\u0E01\u0E23\u0E30\u0E41\u0E17\u0E01\u0E01\u0E33\u0E41\u0E1E\u0E07", e > 0 ? `\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E22\u0E31\u0E07\u0E40\u0E2B\u0E25\u0E37\u0E2D E = ${n1(e)} ft-lb \xF7 \u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 ${n1(body.mass)} lb = ${n1(h)} \u0E1F\u0E38\u0E15 (\u0E40\u0E2B\u0E21\u0E37\u0E2D\u0E19\u0E15\u0E01\u0E08\u0E32\u0E01\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E39\u0E07\u0E19\u0E31\u0E49\u0E19)` : "\u0E01\u0E0E\u0E19\u0E35\u0E49\u0E44\u0E21\u0E48\u0E21\u0E35\u0E14\u0E32\u0E40\u0E21\u0E08\u0E0A\u0E19\u0E01\u0E33\u0E41\u0E1E\u0E07");
    fx.push(...hurt(ctx, body, h, `${body.name} \u0E01\u0E23\u0E30\u0E41\u0E17\u0E01\u0E01\u0E33\u0E41\u0E1E\u0E07 \u0E41\u0E23\u0E07\u0E40\u0E17\u0E48\u0E32\u0E15\u0E01\u0E08\u0E32\u0E01 ${Math.round(h)} \u0E1F\u0E38\u0E15`, "\u0E01\u0E23\u0E30\u0E41\u0E17\u0E01\u0E01\u0E33\u0E41\u0E1E\u0E07"));
  }
  if (body.tags.includes("flying") && world.heightAt(body.pos) > world.heightAt(r.to)) t("\u0E15\u0E01\u0E02\u0E2D\u0E1A", `${body.name} \u0E1A\u0E34\u0E19\u0E2D\u0E22\u0E39\u0E48 \u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E15\u0E01\u0E25\u0E07\u0E44\u0E1B\u0E43\u0E19\u0E2B\u0E25\u0E38\u0E21`);
  fx.push(...falls, ...fallFx(ctx, body, r.dropFt));
  return { fx, moved: r.moved, stopped: first.stopped, crash };
}

// src/actions/types.ts
var yes = { ok: true };
var no = (reason) => ({ ok: false, reason });

// src/actions/shove.ts
var groundOf = (world, actor, target) => ({ actor: world.surfaceAt(actor.pos), target: world.surfaceAt(target.pos) });
var Shove = {
  id: "shove",
  label: "\u0E1C\u0E25\u0E31\u0E01 (Shove)",
  canUse({ rules }, { actor, target }) {
    if (actor.id === target.id) return no("\u0E1C\u0E25\u0E31\u0E01\u0E15\u0E31\u0E27\u0E40\u0E2D\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
    if (!rules.canAct(actor)) return no("\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E17\u0E33\u0E2D\u0E30\u0E44\u0E23\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
    if (gap(actor, target) > 0) return no("\u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E15\u0E34\u0E14\u0E01\u0E31\u0E19");
    if (!rules.canShoveSize(actor, target)) return no("\u0E15\u0E31\u0E27\u0E43\u0E2B\u0E0D\u0E48\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B (\u0E1C\u0E25\u0E31\u0E01\u0E44\u0E14\u0E49\u0E43\u0E2B\u0E0D\u0E48\u0E01\u0E27\u0E48\u0E32\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19 1 \u0E02\u0E19\u0E32\u0E14)");
    return yes;
  },
  resolve(ctx, { actor, target, mode }) {
    const { world, rules, dice } = ctx, t = ctx.trace ?? (() => {
    });
    const fx = [Fx.spendCost(actor.id, rules.costOf("shove"))];
    const check = rules.save(target, rules.shoveSaveAbility(target), rules.shoveDC(actor), dice);
    t("\u0E17\u0E2D\u0E22 save", `${target.name}: ${formatCheck(check)} \u2192 ${check.ok ? "\u0E1C\u0E48\u0E32\u0E19 \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E1C\u0E25\u0E31\u0E01" : "\u0E1E\u0E25\u0E32\u0E14"}`);
    if (check.ok) return [...fx, Fx.log(`${target.name} \u0E22\u0E37\u0E19\u0E21\u0E31\u0E48\u0E19 \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E1C\u0E25\u0E31\u0E01`, check)];
    if (mode === "prone") {
      t("\u0E17\u0E2D\u0E22 save", "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C = \u0E25\u0E49\u0E21 (prone) \u0E44\u0E21\u0E48\u0E21\u0E35\u0E01\u0E32\u0E23\u0E40\u0E04\u0E25\u0E37\u0E48\u0E2D\u0E19\u0E17\u0E35\u0E48");
      return [...fx, Fx.log(`${actor.name} \u0E1C\u0E25\u0E31\u0E01 ${target.name} \u0E25\u0E49\u0E21\u0E25\u0E07`, check), Fx.prone(target.id)];
    }
    const ground = groundOf(world, actor, target);
    const ft = rules.pushFt(actor, target, ground), cells = rules.cellsFor(ft, world.cellFt);
    for (const line of rules.explainPush(actor, target, ground)) t("\u0E41\u0E23\u0E07\u0E41\u0E25\u0E30\u0E23\u0E30\u0E22\u0E30", line);
    t("\u0E1B\u0E31\u0E14\u0E40\u0E1B\u0E47\u0E19\u0E0A\u0E48\u0E2D\u0E07", `${n1(ft)} \u0E1F\u0E38\u0E15 \xF7 ${world.cellFt} \u0E1F\u0E38\u0E15/\u0E0A\u0E48\u0E2D\u0E07 = ${n1(ft / world.cellFt)} \u2192 ${cells} \u0E0A\u0E48\u0E2D\u0E07 \u0E42\u0E14\u0E22 ${rules.roundingNote()}`);
    if (cells === 0) return [...fx, Fx.log(`${actor.name} \u0E1E\u0E22\u0E32\u0E22\u0E32\u0E21\u0E1C\u0E25\u0E31\u0E01 ${target.name} \u0E41\u0E15\u0E48\u0E02\u0E22\u0E31\u0E1A\u0E44\u0E21\u0E48\u0E44\u0E2B\u0E27`, check)];
    const step = awayFrom(actor, target);
    const out = resolveMotion(ctx, {
      body: target,
      step,
      cells,
      energyAt: (x) => rules.pushEnergy(actor, target, x, ground),
      describe: (r, note) => Fx.log(`${actor.name} \u0E1C\u0E25\u0E31\u0E01 ${target.name} \u0E44\u0E1B ${r.moved * world.cellFt} \u0E1F\u0E38\u0E15${note}`, check)
    });
    if (out.moved === 0) return [...fx, Fx.log(`${actor.name} \u0E1E\u0E22\u0E32\u0E22\u0E32\u0E21\u0E1C\u0E25\u0E31\u0E01 ${target.name} \u0E41\u0E15\u0E48${WHY[out.stopped ?? "wall"]} \u0E1C\u0E25\u0E31\u0E01\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49`, check)];
    fx.push(...out.fx);
    return fx;
  }
};

// src/actions/charge.ts
function willHit(a, t) {
  const step = awayFrom(a, t), theirs = cellsOf(t).map((c) => `${c.col},${c.row}`);
  for (let k = 1; k <= gap(a, t) + 1; k++) {
    const at = { col: a.pos.col + step.col * k, row: a.pos.row + step.row * k };
    if (cellsOf(a, at).some((c) => theirs.includes(`${c.col},${c.row}`))) return true;
  }
  return false;
}
var Charge = {
  id: "charge",
  label: "\u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19 (Charge)",
  canUse({ world, rules }, { actor, target }) {
    if (actor.id === target.id) return no("\u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19\u0E15\u0E31\u0E27\u0E40\u0E2D\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
    if (!rules.canAct(actor)) return no("\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E17\u0E33\u0E2D\u0E30\u0E44\u0E23\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
    if (actor.conditions.includes("prone") || actor.tags.includes("flying")) return no("\u0E25\u0E49\u0E21\u0E2D\u0E22\u0E39\u0E48\u0E2B\u0E23\u0E37\u0E2D\u0E1A\u0E34\u0E19\u0E2D\u0E22\u0E39\u0E48 \u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
    const run = gap(actor, target);
    if (run < 1) return no("\u0E15\u0E34\u0E14\u0E01\u0E31\u0E19\u0E2D\u0E22\u0E39\u0E48\u0E41\u0E25\u0E49\u0E27 \u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E23\u0E30\u0E22\u0E30\u0E27\u0E34\u0E48\u0E07\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 1 \u0E0A\u0E48\u0E2D\u0E07");
    if (!willHit(actor, target)) return no("\u0E1E\u0E38\u0E48\u0E07\u0E15\u0E23\u0E07\u0E44\u0E1B\u0E41\u0E25\u0E49\u0E27\u0E44\u0E21\u0E48\u0E42\u0E14\u0E19\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 \u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E41\u0E19\u0E27\u0E15\u0E23\u0E07 (\u0E41\u0E16\u0E27 \u0E04\u0E2D\u0E25\u0E31\u0E21\u0E19\u0E4C \u0E2B\u0E23\u0E37\u0E2D\u0E17\u0E41\u0E22\u0E07)");
    if (run * world.cellFt > actor.speed) return no(`\u0E44\u0E01\u0E25\u0E40\u0E01\u0E34\u0E19\u0E23\u0E30\u0E22\u0E30\u0E27\u0E34\u0E48\u0E07 (${run * world.cellFt} \u0E1F\u0E38\u0E15 > speed ${actor.speed} \u0E1F\u0E38\u0E15)`);
    return yes;
  },
  resolve(ctx, { actor, target }) {
    const { world, rules } = ctx, t = ctx.trace ?? (() => {
    });
    const ground = groundOf(world, actor, target);
    const runCells = gap(actor, target), runFt = runCells * world.cellFt;
    for (const line of rules.explainRun(actor, runFt, ground)) t("\u0E41\u0E23\u0E07\u0E1E\u0E38\u0E48\u0E07", line);
    const out = resolveMotion(ctx, {
      body: actor,
      step: awayFrom(actor, target),
      cells: runCells + 1,
      // one cell more than the gap, so the last step runs into the target
      energyAt: (x) => rules.runEnergy(actor, x, ground),
      describe: (r, note) => Fx.log(`${actor.name} \u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19 \u0E27\u0E34\u0E48\u0E07 ${n1(r.moved * world.cellFt)} \u0E1F\u0E38\u0E15${note}`)
    });
    return [Fx.spendCost(actor.id, rules.costOf("charge")), ...out.fx];
  }
};

// src/actions/index.ts
var ACTIONS = { shove: Shove, charge: Charge };

// src/index.ts
init_zones();
init_zones2();
init_zoneTick();
init_turnReport();

// src/world/gridWorld.ts
init_zones2();
var key2 = (c) => `${c.col},${c.row}`;
function cross2(ax, ay, bx, by, cx, cy) {
  return (bx - ax) * (cy - ay) - (by - ay) * (cx - ax);
}
function onSeg2(ax, ay, bx, by, px, py) {
  return Math.min(ax, bx) <= px && px <= Math.max(ax, bx) && Math.min(ay, by) <= py && py <= Math.max(ay, by);
}
function segmentsTouch(p, q) {
  const [x1, y1, x2, y2] = p, [x3, y3, x4, y4] = q;
  const d1 = cross2(x3, y3, x4, y4, x1, y1), d2 = cross2(x3, y3, x4, y4, x2, y2);
  const d3 = cross2(x1, y1, x2, y2, x3, y3), d4 = cross2(x1, y1, x2, y2, x4, y4);
  if ((d1 > 0 && d2 < 0 || d1 < 0 && d2 > 0) && (d3 > 0 && d4 < 0 || d3 < 0 && d4 > 0)) return true;
  return d1 === 0 && onSeg2(x3, y3, x4, y4, x1, y1) || d2 === 0 && onSeg2(x3, y3, x4, y4, x2, y2) || d3 === 0 && onSeg2(x1, y1, x2, y2, x3, y3) || d4 === 0 && onSeg2(x1, y1, x2, y2, x4, y4);
}
var GridWorld = class {
  cols;
  rows;
  gridPx;
  cellFt;
  walls;
  heights;
  surfaces;
  field;
  list;
  propList;
  spent = [];
  constructor(i) {
    this.cols = i.cols;
    this.rows = i.rows;
    this.gridPx = i.gridPx ?? 100;
    this.cellFt = i.cellFt ?? 5;
    this.walls = i.walls ?? [];
    this.heights = i.heights ?? {};
    this.surfaces = i.surfaces ?? {};
    this.field = new ZoneField(i.zones ?? [], { cellFt: this.cellFt, coverage: i.coverage });
    this.list = i.creatures ?? [];
    this.propList = i.props ?? [];
  }
  inside = (c) => c.col >= 0 && c.row >= 0 && c.col < this.cols && c.row < this.rows;
  center = (c) => [(c.col + 0.5) * this.gridPx, (c.row + 0.5) * this.gridPx];
  blocked(from, to) {
    if (!this.inside(to)) return true;
    const [ax, ay] = this.center(from), [bx, by] = this.center(to);
    return this.walls.some((w) => segmentsTouch([ax, ay, bx, by], w.c));
  }
  occupant(cell) {
    return this.list.find((c) => cell.col >= c.pos.col && cell.col < c.pos.col + c.footprint && cell.row >= c.pos.row && cell.row < c.pos.row + c.footprint);
  }
  propAt(cell) {
    return this.propList.find((p) => cell.col >= p.pos.col && cell.col < p.pos.col + p.footprint && cell.row >= p.pos.row && cell.row < p.pos.row + p.footprint);
  }
  props() {
    return this.propList;
  }
  heightAt(cell) {
    return this.heights[key2(cell)] ?? 0;
  }
  // แบบเดิม (map ต่อช่อง) มาก่อน ไม่มีค่อยถาม Zone
  surfaceAt(cell) {
    return this.surfaces[key2(cell)] ?? this.field.surfaceAtCell(cell);
  }
  zones() {
    return this.field.zones();
  }
  propertiesAt(p) {
    return this.field.propertiesAt(p);
  }
  creatures() {
    return this.list;
  }
  // Applies effects to this in-memory world (tests + harness). Returns the log lines.
  apply(effects) {
    const lines = [];
    const get = (id) => this.list.find((c) => c.id === id);
    const thing = (id) => get(id) ?? this.propList.find((p) => p.id === id);
    for (const e of effects) {
      if (e.kind === "log") lines.push(e.text);
      else if (e.kind === "push") {
        const c = thing(e.target);
        if (c) c.pos = e.to;
      } else if (e.kind === "prone") {
        const c = get(e.target);
        if (c && !c.conditions.includes("prone")) c.conditions.push("prone");
      } else if (e.kind === "damage") {
        const c = get(e.target);
        if (c) c.hp.value = Math.max(0, c.hp.value - e.amount);
      } else if (e.kind === "spendCost") this.spent.push({ actor: e.actor, cost: e.cost });
    }
    return lines;
  }
};

// src/foundry/apply.ts
init_snapshot();
var esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
var NEEDS_GM = /* @__PURE__ */ new Set(["push", "prone", "damage", "spendItem"]);
async function say(e, speaker) {
  const check = e.check ? `<small>${esc(formatCheck(e.check))}</small>` : "";
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ token: speaker }),
    content: `<div class="rw-card">${esc(e.text)}${check}</div>`
  });
}
async function applyEffects(effects, sceneId, speaker) {
  for (const e of effects) if (e.kind === "log") await say(e, speaker);
  const remote = effects.filter((e) => NEEDS_GM.has(e.kind));
  if (!remote.length) return;
  const msg = { t: "c-fx", scene: sceneId, effects: remote };
  if (game.user.isGM) return gmApply(msg);
  if (!game.users.activeGM) {
    ui.notifications.warn("\u0E44\u0E21\u0E48\u0E21\u0E35 GM \u0E2D\u0E2D\u0E19\u0E44\u0E25\u0E19\u0E4C \u0E08\u0E36\u0E07\u0E1C\u0E25\u0E31\u0E01/\u0E17\u0E33\u0E14\u0E32\u0E40\u0E21\u0E08\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E25\u0E2D\u0E07\u0E1A\u0E2D\u0E01 DM \u0E43\u0E2B\u0E49\u0E40\u0E02\u0E49\u0E32\u0E40\u0E01\u0E21");
    return;
  }
  game.socket.emit(SOCK, msg);
}
async function gmApply(msg) {
  const scene = game.scenes.get(msg.scene);
  if (!scene) return;
  const s = scene.grid?.size || 100, d = scene.dimensions ?? {};
  const cols = Number.isFinite(d.sceneWidth) ? Math.floor(d.sceneWidth / s) : Infinity;
  const rows = Number.isFinite(d.sceneHeight) ? Math.floor(d.sceneHeight / s) : Infinity;
  for (const e of msg.effects ?? []) {
    try {
      const tok = scene.tokens.get(e.target ?? e.owner);
      if (!tok) continue;
      if (e.kind === "push") {
        const { col, row } = e.to ?? {};
        if (!Number.isInteger(col) || !Number.isInteger(row) || col < 0 || row < 0 || col >= cols || row >= rows) continue;
        await tok.update(topLeftOf(scene, { col, row }), { arkaneInternal: true, animate: true });
      } else if (e.kind === "prone") {
        await tok.actor?.toggleStatusEffect?.("prone", { active: true });
      } else if (e.kind === "damage") {
        if (!(e.amount > 0) || !tok.actor) continue;
        try {
          await tok.actor.applyDamage([{ value: e.amount, type: e.type || "bludgeoning" }]);
        } catch {
          await tok.actor.applyDamage(e.amount);
        }
      } else if (e.kind === "spendItem") {
        const it = tok.actor?.items?.get(e.itemId);
        if (!it) continue;
        const left = (Number(it.system?.quantity) || 1) - Math.max(1, e.qty | 0);
        if (left > 0) await it.update({ "system.quantity": left });
        else await it.delete();
      }
    } catch (err) {
      console.warn(MOD, "core effect", e.kind, err);
    }
  }
}

// src/foundry/heights.ts
init_snapshot();
async function setHeightArea(col1, row1, col2, row2, ft) {
  if (!game.user.isGM) {
    ui.notifications.warn("\u0E40\u0E09\u0E1E\u0E32\u0E30 GM");
    return 0;
  }
  const h = {};
  for (let r = Math.min(row1, row2); r <= Math.max(row1, row2); r++)
    for (let c = Math.min(col1, col2); c <= Math.max(col1, col2); c++) h[`${c},${r}`] = ft;
  await canvas.scene.setFlag(MOD, "heights", h);
  return Object.keys(h).length;
}

// src/foundry/shove.ts
init_effect();
init_snapshot();
init_world();
var ruleset = new Ruleset();
var setRuleset = (r) => {
  ruleset = r;
};
var currentRules = () => ruleset;
var RULEBOOKS = { "2024": () => new Ruleset(), physics: () => new RulesetPhysics() };
function useRules(name) {
  const make = RULEBOOKS[name];
  if (!make) {
    ui.notifications.warn(`\u0E44\u0E21\u0E48\u0E21\u0E35\u0E0A\u0E38\u0E14\u0E01\u0E0E "${name}" (\u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49: ${Object.keys(RULEBOOKS).join(", ")})`);
    return ruleset.name;
  }
  ruleset = make();
  return ruleset.name;
}
var failedCheck = (fx) => fx.find((e) => e.kind === "log" && e.check && !e.check.ok);
async function shove() {
  const me = canvas.tokens.controlled[0]?.document, tgt = game.user.targets.first()?.document;
  if (!me?.actor) return ui.notifications.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E01\u0E48\u0E2D\u0E19");
  if (isPropToken(tgt)) return ui.notifications.warn("\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E1B\u0E47\u0E19\u0E02\u0E2D\u0E07 (prop) \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 \u0E1C\u0E25\u0E31\u0E01\u0E44\u0E14\u0E49\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23 \u0E02\u0E2D\u0E07\u0E08\u0E30\u0E16\u0E39\u0E01\u0E14\u0E31\u0E19\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E21\u0E35\u0E04\u0E19\u0E0A\u0E19");
  if (!tgt?.actor) return ui.notifications.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E01\u0E48\u0E2D\u0E19 (\u0E04\u0E25\u0E34\u0E01\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E41\u0E25\u0E49\u0E27\u0E01\u0E14 T)");
  const world = new FoundryWorld(canvas.scene);
  const actor = world.creature(me.id), target = world.creature(tgt.id);
  if (!actor || !target) return;
  const rec = recordDice(randomDice(() => CONFIG.Dice.randomUniform()));
  const ctx = { world, rules: ruleset, dice: rec.dice };
  const input = { actor, target, mode: "push" };
  const usable = Shove.canUse(ctx, input);
  if (!usable.ok) return ui.notifications.warn(usable.reason);
  const pushedFt = ruleset.cellsFor(ruleset.pushFt(actor, target, groundOf(world, actor, target)), world.cellFt) * world.cellFt;
  let fx = Shove.resolve(ctx, input);
  const miss = failedCheck(fx);
  if (miss) {
    const how = await foundry.applications.api.DialogV2.wait({
      window: { title: `\u0E1C\u0E25\u0E31\u0E01 ${tgt.name}` },
      content: "<p>\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E1E\u0E25\u0E32\u0E14 save \u0E40\u0E25\u0E37\u0E2D\u0E01\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C</p>",
      buttons: [{ action: "push", label: `\u0E1C\u0E25\u0E31\u0E01\u0E44\u0E1B ${pushedFt} \u0E1F\u0E38\u0E15`, default: true }, { action: "prone", label: "\u0E25\u0E49\u0E21 (Prone)" }]
    }).catch(() => null);
    if (how === "prone") fx = Shove.resolve({ ...ctx, dice: scriptedDice(rec.rolled) }, { ...input, mode: "prone" });
    else if (how !== "push") fx = [Fx.log(`${actor.name} \u0E1E\u0E22\u0E32\u0E22\u0E32\u0E21\u0E1C\u0E25\u0E31\u0E01 ${target.name} \u0E41\u0E15\u0E48\u0E22\u0E01\u0E40\u0E25\u0E34\u0E01`, miss.check)];
  }
  await applyEffects(fx, canvas.scene.id, me);
}

// src/foundry/charge.ts
init_snapshot();
init_world();
async function charge() {
  const me = canvas.tokens.controlled[0]?.document, tgt = game.user.targets.first()?.document;
  if (!me?.actor) return ui.notifications.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23\u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E01\u0E48\u0E2D\u0E19");
  if (isPropToken(tgt)) return ui.notifications.warn("\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E40\u0E1B\u0E47\u0E19\u0E02\u0E2D\u0E07 (prop) \u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19\u0E44\u0E14\u0E49\u0E40\u0E09\u0E1E\u0E32\u0E30\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23");
  if (!tgt?.actor) return ui.notifications.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E01\u0E48\u0E2D\u0E19 (\u0E04\u0E25\u0E34\u0E01\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22\u0E41\u0E25\u0E49\u0E27\u0E01\u0E14 T)");
  const world = new FoundryWorld(canvas.scene);
  const actor = world.creature(me.id), target = world.creature(tgt.id);
  if (!actor || !target) return;
  const ctx = { world, rules: currentRules(), dice: randomDice(() => CONFIG.Dice.randomUniform()) };
  const usable = Charge.canUse(ctx, { actor, target });
  if (!usable.ok) return ui.notifications.warn(usable.reason);
  await applyEffects(Charge.resolve(ctx, { actor, target }), canvas.scene.id, me);
}

// src/foundry/inspect.ts
init_snapshot();
function inspect(tok) {
  const doc = tok ?? canvas.tokens.controlled[0]?.document;
  const prop = doc ? toProp(doc) : null;
  if (prop) {
    console.log("arkane-1920s | core inspect (prop)", prop.name, {
      material: prop.material,
      heightFt: prop.heightFt,
      footprint: prop.footprint,
      mass: prop.mass,
      massSource: prop.massSource,
      tags: prop.tags,
      elevation: prop.elevation
    });
    return prop;
  }
  const c = doc ? toCreature(doc) : null;
  if (!c) {
    ui.notifications.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01 token \u0E01\u0E48\u0E2D\u0E19");
    return null;
  }
  console.log("arkane-1920s | core inspect", c.name, {
    size: c.size,
    footprint: c.footprint,
    mass: c.mass,
    massSource: c.massSource,
    massNote: c.massNote,
    strScore: c.strScore,
    strMod: c.mod.str,
    elevation: c.elevation,
    conditions: c.conditions,
    tags: c.tags,
    sheetWeight: doc.actor?.system?.details?.weight,
    sheetHeight: doc.actor?.system?.details?.height
  });
  return c;
}

// src/foundry/props.ts
init_props();
init_snapshot();
async function setProp(opts = {}, tokens) {
  if (!game.user.isGM) {
    ui.notifications.warn("\u0E40\u0E09\u0E1E\u0E32\u0E30 GM");
    return 0;
  }
  const docs = tokens ?? (canvas.tokens?.controlled ?? []).map((t) => t.document);
  if (!docs.length) {
    ui.notifications.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01 token \u0E01\u0E48\u0E2D\u0E19");
    return 0;
  }
  if (opts?.material && !MATERIALS[opts.material]) {
    ui.notifications.warn(`\u0E44\u0E21\u0E48\u0E21\u0E35\u0E27\u0E31\u0E2A\u0E14\u0E38 "${opts.material}" (\u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49: ${Object.keys(MATERIALS).join(", ")})`);
    return 0;
  }
  for (const d of docs) {
    if (opts === null) await d.unsetFlag(MOD, "prop");
    else await d.setFlag(MOD, "prop", Object.keys(opts).length ? opts : true);
  }
  return docs.length;
}

// src/foundry/register.ts
init_snapshot();
init_zones3();
var CORE_VERSION = true ? "0.7.0" : "dev";
function registerCore() {
  game.socket.on(SOCK, (d) => {
    if (d?.t === "c-fx" && game.users.activeGM?.isSelf) gmApply(d).catch((e) => console.warn("arkane-1920s", "core", e));
  });
  game.arkane = game.arkane ?? {};
  const sc = () => canvas.scene;
  const zones = {
    create: (z) => createZone(sc(), z),
    label: (regionId, kind, extra) => labelRegion(sc(), regionId, kind, extra),
    remove: (ids) => removeZones(sc(), ids),
    sweep: () => sweepZones(sc(), currentClock()),
    closeConcentration: (casterId) => closeConcentration(sc(), casterId),
    at: (x, y) => inspectPoint(sc(), x, y),
    report: (tokenId) => reportZones(sc(), tokenId),
    autoReport: setAutoReport
  };
  game.arkane.core = { version: CORE_VERSION, shove, charge, setRuleset, useRules, inspect, setProp, Ruleset, RulesetPhysics, actions: ACTIONS, setHeightArea, zones };
  registerZoneHooks();
  console.log("arkane-1920s | core", CORE_VERSION, "ready");
}
export {
  ACTIONS,
  CATALOG,
  CORE_VERSION,
  Fx,
  GridWorld,
  MATERIALS2 as MATERIALS,
  MAX_ZONES,
  Ruleset,
  RulesetPhysics,
  SIZES,
  SUBSTANCES,
  Shove,
  ZoneField,
  concentrationDC,
  expiryAfter,
  formatCheck,
  gallonsToFt3,
  isExpired,
  makeCreature,
  makeProp,
  makeZone,
  massFromHeight,
  minutesToRounds,
  radiusFromVolume,
  randomDice,
  recordDice,
  registerCore,
  resolveMass,
  resolvePropMass,
  resolveZones,
  scriptedDice,
  turnReport,
  zoneFromVolume,
  zoneTick,
  zonesBoundTo
};
