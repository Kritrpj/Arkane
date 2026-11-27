/* arkane-core 0.10.0 - generated from src/, do not edit by hand */

// src/model/creature.ts
var SIZES = ["tiny", "sm", "med", "lg", "huge", "grg"];

// src/data/bodies.ts
var BODY = {
  tiny: { massLb: 10, forceMult: 0.5 },
  sm: { massLb: 60, forceMult: 1 },
  med: { massLb: 180, forceMult: 1 },
  lg: { massLb: 900, forceMult: 2 },
  huge: { massLb: 4e3, forceMult: 4 },
  grg: { massLb: 3e4, forceMult: 8 }
};
var REF_HUMAN = { heightFt: 5.8, massLb: 180 };

// src/rules/mass.ts
var good = (n) => typeof n === "number" && Number.isFinite(n) && n > 0;
var massFromHeight = (heightFt) => REF_HUMAN.massLb * (heightFt / REF_HUMAN.heightFt) ** 3;
var PLAUSIBLE = 6;
var plausible = (mass, size) => {
  const t = BODY[size].massLb;
  return mass >= t / PLAUSIBLE && mass <= t * PLAUSIBLE;
};
function resolveMass(i) {
  if (good(i.override)) return { mass: i.override, source: "override" };
  const notes = [];
  const why = () => notes.length ? `${notes.join("; ")} \u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E49` : void 0;
  if (good(i.weightLb)) {
    if (plausible(i.weightLb, i.size)) return { mass: i.weightLb, source: "weight" };
    notes.push(`\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E43\u0E19\u0E0A\u0E35\u0E15 ${Math.round(i.weightLb * 10) / 10} lb \u0E1C\u0E34\u0E14\u0E1B\u0E01\u0E15\u0E34\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E02\u0E19\u0E32\u0E14 ${i.size}`);
  }
  if (good(i.heightFt)) {
    const m = massFromHeight(i.heightFt);
    if (plausible(m, i.size)) return { mass: m, source: "height", note: why() };
    notes.push(`\u0E2A\u0E48\u0E27\u0E19\u0E2A\u0E39\u0E07\u0E43\u0E19\u0E0A\u0E35\u0E15 ${Math.round(i.heightFt * 100) / 100} ft \u0E1C\u0E34\u0E14\u0E1B\u0E01\u0E15\u0E34\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E02\u0E19\u0E32\u0E14 ${i.size}`);
  }
  return { mass: BODY[i.size].massLb, source: "size", note: why() };
}
var NUM = String.raw`(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:[.,]\d+)?)`;
var num = (s) => Number(/^\d{1,3}(,\d{3})+/.test(s) ? s.replace(/,/g, "") : s.replace(",", "."));
var re = (pattern) => new RegExp(pattern.replace(/N/g, NUM));
var WEIGHT_RE = re(String.raw`N\s*(kg|lbs?|pounds?)?`);
var FT_RE = re(String.raw`N\s*(?:'|ft|feet|foot)\s*(?:N\s*(?:"|in|inch|inches)?)?`);
var CM_RE = re(String.raw`N\s*cm`);
var M_RE = re(String.raw`N\s*m\b`);
var IN_RE = re(String.raw`N\s*(?:"|in)`);
var BARE_RE = re(String.raw`^\s*N\s*$`);
function parseWeightLb(v) {
  if (typeof v === "number") return good(v) ? v : void 0;
  if (v && typeof v === "object") {
    const o = v;
    return parseWeightLb(`${o.value ?? ""} ${o.units ?? ""}`);
  }
  if (typeof v !== "string") return void 0;
  const m = v.toLowerCase().match(WEIGHT_RE);
  if (!m) return void 0;
  const n = num(m[1]) * (m[2] === "kg" ? 2.20462 : 1);
  return good(n) ? n : void 0;
}
function parseHeightFt(v) {
  if (typeof v === "number") return good(v) ? v : void 0;
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
  return good(ft) ? ft : void 0;
}

// src/data/props.ts
var MATERIALS = {
  wood: { rho: 40, fill: 0.05 },
  stone: { rho: 160, fill: 0.5 },
  iron: { rho: 490, fill: 0.05 },
  water: { rho: 62, fill: 0.8 }
  // a full cistern / big barrel of water
};
var PROP_DEFAULT = { material: "wood", heightFt: 5 };

// src/rules/propMass.ts
var good2 = (n) => typeof n === "number" && Number.isFinite(n) && n > 0;
function resolvePropMass(i) {
  if (good2(i.override)) return { mass: i.override, source: "override" };
  const mat = MATERIALS[i.material ?? ""] ?? MATERIALS[PROP_DEFAULT.material];
  const side = Math.max(1, i.footprint) * i.cellFt;
  const volume = side * side * (good2(i.heightFt) ? i.heightFt : PROP_DEFAULT.heightFt);
  const fill = good2(i.fill) && i.fill <= 1 ? i.fill : mat.fill;
  return { mass: mat.rho * volume * fill, source: "material" };
}

// src/foundry/snapshot.ts
var MOD = "arkane-1920s";
var SOCK = `module.${MOD}`;
var ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
var num2 = (v, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
var gridSize = (scene) => num2(scene?.grid?.size, 100) || 100;
var gridFt = (scene) => num2(scene?.grid?.distance, 5) || 5;
var origin = (scene) => ({ x: num2(scene?.dimensions?.sceneX), y: num2(scene?.dimensions?.sceneY) });
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
var isPropToken = (tok) => propFlag(tok) !== null;
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

export {
  SIZES,
  BODY,
  MATERIALS,
  MOD,
  SOCK,
  gridSize,
  gridFt,
  origin,
  cellOf,
  topLeftOf,
  centerOf,
  isPropToken,
  toProp,
  toCreature
};
