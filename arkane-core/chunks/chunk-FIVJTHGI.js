/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  CANT_ACT
} from "./chunk-H7JZCNPB.js";

// src/data/casters.ts
var CASTERS = {
  vivian: { match: "^vivian" },
  mozxorion: { match: "^mozxorion" },
  windows: { match: "^windows?" },
  nincolas: { match: "^nincolas" },
  perry: { match: "^perry" }
};
var RX = Object.entries(CASTERS).map(([k, v]) => [k, new RegExp(v.match, "i")]);
var casterKeyOf = (actorName) => actorName ? RX.find(([, rx]) => rx.test(actorName))?.[0] : void 0;

// src/spells/resolve.ts
var isObj = (v) => typeof v === "object" && v !== null && !Array.isArray(v);
var isOp = (v) => isObj(v) && ("$append" in v || "$prepend" in v);
var clone = (v) => v === void 0 ? v : JSON.parse(JSON.stringify(v));
function applyPatch(base, patch) {
  const out = clone(base);
  for (const [k, pv] of Object.entries(patch)) {
    if (pv === void 0) continue;
    if (pv === null) {
      delete out[k];
      continue;
    }
    if (isObj(pv) && "$set" in pv) {
      out[k] = clone(pv.$set);
      continue;
    }
    if (isOp(pv)) {
      out[k] = [...clone(pv.$prepend ?? []), ...Array.isArray(out[k]) ? out[k] : [], ...clone(pv.$append ?? [])];
      continue;
    }
    if (isObj(pv)) {
      out[k] = applyPatch(isObj(out[k]) ? out[k] : {}, pv);
      continue;
    }
    out[k] = clone(pv);
  }
  return out;
}
function paths(patch, pre = "") {
  return Object.entries(patch).flatMap(([k, v]) => isObj(v) && !isOp(v) && !("$set" in v) ? paths(v, `${pre}${k}.`) : [`${pre}${k}`]);
}
var META = /* @__PURE__ */ new Set(["id", "category", "extends", "aliases", "byCaster", "variants"]);
var fieldsOf = (d) => Object.fromEntries(Object.entries(d).filter(([k]) => !META.has(k)));
function chainOf(byId, id) {
  const out = [], seen = [];
  let from = "";
  for (let cur = id; cur; ) {
    if (seen.includes(cur)) throw new Error(`extends \u0E27\u0E19\u0E01\u0E25\u0E31\u0E1A\u0E21\u0E32\u0E17\u0E35\u0E48\u0E40\u0E14\u0E34\u0E21: ${[...seen, cur].join(" \u2192 ")}`);
    const d = byId.get(cur);
    if (!d) throw new Error(from ? `"${from}" \u0E15\u0E48\u0E2D\u0E08\u0E32\u0E01 "${cur}" \u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2A\u0E01\u0E34\u0E25\u0E19\u0E35\u0E49\u0E43\u0E19 catalog` : `\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2A\u0E01\u0E34\u0E25 "${cur}" \u0E43\u0E19 catalog`);
    seen.push(cur);
    out.unshift(d);
    from = cur;
    cur = d.extends;
  }
  return out;
}
function resolveFrom(byId, id, ctx = {}, casterDefaults) {
  const defs = chainOf(byId, id), trace = [];
  let acc = {};
  for (const d of defs) {
    const f = fieldsOf(d);
    acc = applyPatch(acc, f);
    trace.push(d.extends ? `${d.category} \xB7 ${d.id} (\u0E15\u0E48\u0E2D\u0E08\u0E32\u0E01 ${d.extends}): ${paths(f).join(", ") || "-"}` : `${d.category} \xB7 ${d.id}`);
  }
  const caster = ctx.caster?.toLowerCase();
  if (caster && casterDefaults) {
    acc = applyPatch(acc, casterDefaults);
    trace.push(`\u0E04\u0E48\u0E32\u0E15\u0E31\u0E49\u0E07\u0E15\u0E49\u0E19\u0E02\u0E2D\u0E07 ${caster}: ${paths(casterDefaults).join(", ")}`);
  }
  if (caster) for (const d of defs) {
    const p = d.byCaster?.[caster];
    if (!p) continue;
    acc = applyPatch(acc, p);
    trace.push(`\u0E1C\u0E39\u0E49\u0E23\u0E48\u0E32\u0E22 ${caster} (${d.id}): ${paths(p).join(", ")}`);
  }
  for (const v of [ctx.via ?? []].flat()) for (const d of defs) {
    const p = d.variants?.[v];
    if (!p) continue;
    acc = applyPatch(acc, p);
    trace.push(`\u0E23\u0E48\u0E32\u0E22\u0E41\u0E1A\u0E1A ${v} (${d.id}): ${paths(p).join(", ")}`);
  }
  const leaf = defs[defs.length - 1];
  return { spell: { ...acc, id: leaf.id, category: leaf.category }, chain: defs.map((d) => d.id).reverse(), trace };
}

// src/spells/slug.ts
var slugOf = (name) => String(name ?? "").trim().toLowerCase().replace(/['\u2019\u2018`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// src/spells/catalog.ts
var Catalog = class {
  byId = /* @__PURE__ */ new Map();
  byKey = /* @__PURE__ */ new Map();
  // slug of a name or alias -> id
  dupes = [];
  // ids / names defined twice (reported by validateCatalog)
  icons;
  casters;
  constructor(defs, opts = {}) {
    this.icons = opts.icons ?? {};
    this.casters = opts.casters ?? {};
    for (const d of defs) {
      if (this.byId.has(d.id)) {
        this.dupes.push(d.id);
        continue;
      }
      this.byId.set(d.id, d);
    }
    for (const d of this.byId.values()) for (const n of [d.name, ...d.aliases ?? []]) {
      if (!n) continue;
      const k = slugOf(n), prev = this.byKey.get(k);
      if (prev && prev !== d.id) this.dupes.push(`${n} (${prev} / ${d.id})`);
      else this.byKey.set(k, d.id);
    }
  }
  // by id ("fire-bolt") or by item name ("Fire Bolt")
  get(ref) {
    return this.byId.get(ref) ?? this.byId.get(this.byKey.get(slugOf(ref)) ?? "");
  }
  has(ref) {
    return !!this.get(ref);
  }
  list(f = {}) {
    return [...this.byId.values()].filter((d) => (!f.category || d.category === f.category) && (f.level === void 0 || d.level === f.level) && (!f.tag || Array.isArray(d.tags) && d.tags.includes(f.tag)));
  }
  // null when unknown or broken (validateCatalog says why)
  resolve(ref, ctx = {}) {
    const d = this.get(ref);
    if (!d) return null;
    try {
      return resolveFrom(this.byId, d.id, ctx, ctx.caster ? this.casters[ctx.caster.toLowerCase()]?.defaults : void 0);
    } catch {
      return null;
    }
  }
  // the icon for this caster: his/her own file, else the spell's default, else null (caller keeps the item's own picture)
  icon(ref, caster, via) {
    const c = caster?.toLowerCase(), r = this.resolve(ref, { caster: c, via });
    const chain = r?.chain ?? [slugOf(ref)];
    const first = (pick) => chain.map(pick).find(Boolean);
    return (c ? r?.spell.icons?.byCaster?.[c] ?? first((id) => this.icons[id]?.byCaster?.[c]) : void 0) ?? r?.spell.icons?.default ?? first((id) => this.icons[id]?.default);
  }
};

// src/data/spellIcons.generated.ts
var ICON_MANIFEST = {
  "comprehend-languages": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-comprehend-languages.webp"
    }
  },
  "cure-wounds": {
    "byCaster": {
      "mozxorion": "modules/arkane-1920s/spells/mozxorion/mozxorion-cure-wounds.webp",
      "windows": "modules/arkane-1920s/spells/windows/windows-cure-wounds.webp"
    }
  },
  "dancing-lights": {
    "byCaster": {
      "mozxorion": "modules/arkane-1920s/spells/mozxorion/mozxorion-dancing-lights.webp"
    }
  },
  "detect-magic": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-detect-magic.webp",
      "windows": "modules/arkane-1920s/spells/windows/windows-detect-magic.webp"
    }
  },
  "disguise-self": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-disguise-self.webp"
    }
  },
  "druidcraft": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-druidcraft.webp"
    }
  },
  "ensnaring-strike": {
    "byCaster": {
      "mozxorion": "modules/arkane-1920s/spells/mozxorion/mozxorion-ensnaring-strike.webp",
      "windows": "modules/arkane-1920s/spells/windows/windows-ensnaring-strike.webp"
    }
  },
  "fire-bolt": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-fire-bolt.webp"
    }
  },
  "guidance": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-guidance.webp"
    }
  },
  "hail-of-thorns": {
    "byCaster": {
      "mozxorion": "modules/arkane-1920s/spells/mozxorion/mozxorion-hail-of-thorns.webp"
    }
  },
  "healing-word": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-healing-word.webp"
    }
  },
  "hex": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-hex.webp"
    }
  },
  "hunters-mark": {
    "byCaster": {
      "mozxorion": "modules/arkane-1920s/spells/mozxorion/mozxorion-hunters-mark.webp",
      "windows": "modules/arkane-1920s/spells/windows/windows-hunters-mark.webp"
    }
  },
  "magic-missile": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-magic-missile.webp"
    }
  },
  "message": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-message.webp"
    }
  },
  "minor-illusion": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-minor-illusion.webp"
    }
  },
  "shield": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-shield.webp"
    }
  },
  "shocking-grasp": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-shocking-grasp.webp"
    }
  },
  "sleep": {
    "byCaster": {
      "vivian": "modules/arkane-1920s/spells/vivian/vivian-sleep.webp"
    }
  },
  "speak-with-animals": {
    "byCaster": {
      "mozxorion": "modules/arkane-1920s/spells/mozxorion/mozxorion-speak-with-animals.webp",
      "windows": "modules/arkane-1920s/spells/windows/windows-speak-with-animals.webp"
    }
  }
};

// src/spells/define.ts
var spell = (d) => d;

// src/data/spells/core.ts
var CORE = [
  spell({
    id: "fire-bolt",
    category: "core",
    name: "Fire Bolt",
    nameTh: "\u0E25\u0E39\u0E01\u0E44\u0E1F",
    summaryTh: "\u0E22\u0E34\u0E07\u0E25\u0E39\u0E01\u0E44\u0E1F \u0E42\u0E08\u0E21\u0E15\u0E35\u0E14\u0E49\u0E27\u0E22\u0E40\u0E27\u0E17\u0E23\u0E30\u0E22\u0E30\u0E44\u0E01\u0E25 1d10 Fire \u0E27\u0E31\u0E15\u0E16\u0E38\u0E44\u0E27\u0E44\u0E1F\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E19\u0E16\u0E37\u0E2D\u0E08\u0E30\u0E15\u0E34\u0E14\u0E44\u0E1F",
    level: 0,
    school: "evo",
    tags: ["fire", "attack"],
    activation: "action",
    range: 120,
    duration: { unit: "instant" },
    components: { v: true, s: true },
    requires: { seeTarget: true, notConditions: CANT_ACT },
    delivery: "target",
    targets: { max: 1, allow: "any" },
    effect: { roll: { kind: "attack", range: "ranged" }, damage: [{ dice: "1d10", type: "fire" }], scaling: { cantrip: true } },
    fx: { style: "projectile", refs: [{ seq: "jb2a.fire_bolt.orange" }, { line: "#ff7a2a" }] }
  }),
  spell({
    id: "eldritch-blast",
    category: "core",
    name: "Eldritch Blast",
    nameTh: "\u0E25\u0E33\u0E41\u0E2A\u0E07\u0E21\u0E34\u0E15\u0E34\u0E2D\u0E33\u0E1E\u0E23\u0E32\u0E07",
    summaryTh: "\u0E25\u0E33\u0E41\u0E2A\u0E07\u0E1E\u0E25\u0E31\u0E07 \u0E42\u0E08\u0E21\u0E15\u0E35\u0E14\u0E49\u0E27\u0E22\u0E40\u0E27\u0E17\u0E23\u0E30\u0E22\u0E30\u0E44\u0E01\u0E25 1d10 Force \u0E40\u0E25\u0E40\u0E27\u0E25 5/11/17 \u0E44\u0E14\u0E49 2/3/4 \u0E25\u0E33 (\u0E41\u0E15\u0E48\u0E25\u0E30\u0E25\u0E33\u0E17\u0E2D\u0E22\u0E41\u0E22\u0E01 \u0E40\u0E25\u0E37\u0E2D\u0E01\u0E40\u0E1B\u0E49\u0E32\u0E40\u0E14\u0E35\u0E22\u0E27\u0E01\u0E31\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E48\u0E32\u0E07\u0E01\u0E31\u0E19\u0E44\u0E14\u0E49)",
    level: 0,
    school: "evo",
    tags: ["force", "attack", "beam"],
    activation: "action",
    range: 120,
    duration: { unit: "instant" },
    components: { v: true, s: true },
    requires: { seeTarget: true, notConditions: CANT_ACT },
    delivery: "target",
    targets: { max: 4, allow: "any" },
    effect: { roll: { kind: "attack", range: "ranged" }, damage: [{ dice: "1d10", type: "force" }], count: 1, countByLevel: { 1: 1, 5: 2, 11: 3, 17: 4 } },
    fx: { style: "projectile", refs: [{ seq: "jb2a.eldritch_blast.purple" }, { line: "#d02a4a" }] }
    // the free JB2A beam is purple only; another colour needs a tint in the caster's byCaster
  }),
  spell({
    id: "shocking-grasp",
    category: "core",
    name: "Shocking Grasp",
    nameTh: "\u0E2A\u0E31\u0E21\u0E1C\u0E31\u0E2A\u0E2A\u0E32\u0E22\u0E1F\u0E49\u0E32",
    summaryTh: "\u0E41\u0E15\u0E30\u0E40\u0E1B\u0E49\u0E32 \u0E42\u0E08\u0E21\u0E15\u0E35\u0E14\u0E49\u0E27\u0E22\u0E40\u0E27\u0E17\u0E23\u0E30\u0E22\u0E30\u0E1B\u0E23\u0E30\u0E0A\u0E34\u0E14 1d8 Lightning \u0E44\u0E14\u0E49\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E16\u0E49\u0E32\u0E40\u0E1B\u0E49\u0E32\u0E43\u0E2A\u0E48\u0E40\u0E01\u0E23\u0E32\u0E30\u0E42\u0E25\u0E2B\u0E30 \u0E41\u0E25\u0E30\u0E40\u0E1B\u0E49\u0E32\u0E43\u0E0A\u0E49 Reaction \u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E08\u0E19\u0E15\u0E49\u0E19\u0E40\u0E17\u0E34\u0E23\u0E4C\u0E19\u0E02\u0E2D\u0E07\u0E21\u0E31\u0E19",
    level: 0,
    school: "evo",
    tags: ["lightning", "attack"],
    activation: "action",
    range: "touch",
    duration: { unit: "instant" },
    components: { v: true, s: true },
    requires: { notConditions: CANT_ACT },
    delivery: "target",
    targets: { max: 1, allow: "any" },
    effect: { roll: { kind: "attack", range: "melee" }, damage: [{ dice: "1d8", type: "lightning" }], scaling: { cantrip: true }, text: ["\u0E44\u0E14\u0E49\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E16\u0E49\u0E32\u0E40\u0E1B\u0E49\u0E32\u0E43\u0E2A\u0E48\u0E40\u0E01\u0E23\u0E32\u0E30\u0E42\u0E25\u0E2B\u0E30", "\u0E40\u0E1B\u0E49\u0E32\u0E43\u0E0A\u0E49 Reaction \u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E08\u0E19\u0E15\u0E49\u0E19\u0E40\u0E17\u0E34\u0E23\u0E4C\u0E19\u0E16\u0E31\u0E14\u0E44\u0E1B\u0E02\u0E2D\u0E07\u0E21\u0E31\u0E19"] },
    fx: { style: "on-target" }
  }),
  spell({
    id: "magic-missile",
    category: "core",
    name: "Magic Missile",
    nameTh: "\u0E25\u0E39\u0E01\u0E14\u0E2D\u0E01\u0E40\u0E27\u0E17",
    summaryTh: "\u0E25\u0E39\u0E01\u0E14\u0E2D\u0E01\u0E1E\u0E25\u0E31\u0E07 3 \u0E14\u0E2D\u0E01 \u0E42\u0E14\u0E19\u0E41\u0E19\u0E48\u0E14\u0E2D\u0E01\u0E25\u0E30 1d4+1 Force \u0E41\u0E1A\u0E48\u0E07\u0E40\u0E1B\u0E49\u0E32\u0E44\u0E14\u0E49 \u0E43\u0E0A\u0E49\u0E0A\u0E48\u0E2D\u0E07\u0E2A\u0E39\u0E07\u0E02\u0E36\u0E49\u0E19 +1 \u0E14\u0E2D\u0E01\u0E15\u0E48\u0E2D\u0E40\u0E25\u0E40\u0E27\u0E25",
    level: 1,
    school: "evo",
    tags: ["force"],
    activation: "action",
    range: 120,
    duration: { unit: "instant" },
    components: { v: true, s: true },
    cost: [{ kind: "slot", pool: "spell" }],
    requires: { seeTarget: true, notConditions: CANT_ACT },
    delivery: "target",
    targets: { max: 3, allow: "any" },
    effect: { roll: { kind: "auto" }, damage: [{ dice: "1d4+1", type: "force" }], count: 3, scaling: { perSlot: { count: 1 } } },
    fx: { style: "projectile", refs: [{ line: "#c9a0ff" }] }
  }),
  spell({
    id: "shield",
    category: "core",
    name: "Shield",
    nameTh: "\u0E42\u0E25\u0E48\u0E40\u0E27\u0E17",
    summaryTh: "Reaction \u0E40\u0E21\u0E37\u0E48\u0E2D\u0E16\u0E39\u0E01\u0E42\u0E08\u0E21\u0E15\u0E35\u0E2B\u0E23\u0E37\u0E2D\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E1B\u0E49\u0E32 Magic Missile: AC +5 (\u0E23\u0E27\u0E21\u0E01\u0E32\u0E23\u0E42\u0E08\u0E21\u0E15\u0E35\u0E17\u0E35\u0E48\u0E01\u0E23\u0E30\u0E15\u0E38\u0E49\u0E19) \u0E08\u0E19\u0E15\u0E49\u0E19\u0E40\u0E17\u0E34\u0E23\u0E4C\u0E19\u0E16\u0E31\u0E14\u0E44\u0E1B \u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E42\u0E14\u0E19 Magic Missile",
    level: 1,
    school: "abj",
    tags: ["defense"],
    activation: "reaction",
    range: "self",
    duration: { unit: "turn" },
    components: { v: true, s: true },
    cost: [{ kind: "slot", pool: "spell" }],
    requires: { notConditions: CANT_ACT },
    delivery: "self",
    effect: { roll: { kind: "auto" }, text: ["AC +5 \u0E08\u0E19\u0E15\u0E49\u0E19\u0E40\u0E17\u0E34\u0E23\u0E4C\u0E19\u0E16\u0E31\u0E14\u0E44\u0E1B\u0E02\u0E2D\u0E07\u0E1C\u0E39\u0E49\u0E23\u0E48\u0E32\u0E22", "\u0E44\u0E21\u0E48\u0E42\u0E14\u0E19 Magic Missile"] },
    fx: { style: "on-caster" }
  }),
  spell({
    id: "hex",
    category: "core",
    name: "Hex",
    nameTh: "\u0E04\u0E33\u0E2A\u0E32\u0E1B",
    summaryTh: "Bonus Action \u0E2A\u0E32\u0E1B\u0E40\u0E1B\u0E49\u0E32: \u0E15\u0E35\u0E42\u0E14\u0E19\u0E40\u0E1E\u0E34\u0E48\u0E21 1d6 Necrotic \u0E41\u0E25\u0E30\u0E40\u0E1B\u0E49\u0E32\u0E40\u0E2A\u0E35\u0E22\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E40\u0E0A\u0E47\u0E01\u0E02\u0E2D\u0E07\u0E04\u0E48\u0E32\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E17\u0E35\u0E48\u0E40\u0E25\u0E37\u0E2D\u0E01 \u0E22\u0E49\u0E32\u0E22\u0E44\u0E14\u0E49\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E40\u0E1B\u0E49\u0E32\u0E15\u0E32\u0E22",
    level: 1,
    school: "enc",
    tags: ["necrotic", "curse"],
    activation: "bonus",
    range: 90,
    duration: { unit: "hour", n: 1 },
    concentration: true,
    components: { v: true, s: true, m: "the petrified eye of a newt" },
    cost: [{ kind: "slot", pool: "spell" }],
    requires: { seeTarget: true, notConditions: CANT_ACT },
    delivery: "target",
    targets: { max: 1, allow: "enemy" },
    effect: { roll: { kind: "auto" }, damage: [{ dice: "1d6", type: "necrotic" }], text: ["\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E04\u0E48\u0E32\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16 1 \u0E15\u0E31\u0E27 \u0E40\u0E1B\u0E49\u0E32\u0E40\u0E2A\u0E35\u0E22\u0E40\u0E1B\u0E23\u0E35\u0E22\u0E1A\u0E01\u0E31\u0E1A\u0E40\u0E0A\u0E47\u0E01\u0E02\u0E2D\u0E07\u0E04\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19", "\u0E22\u0E49\u0E32\u0E22\u0E04\u0E33\u0E2A\u0E32\u0E1B\u0E44\u0E14\u0E49\u0E14\u0E49\u0E27\u0E22 Bonus Action \u0E40\u0E21\u0E37\u0E48\u0E2D\u0E40\u0E1B\u0E49\u0E32\u0E15\u0E32\u0E22"] },
    fx: { style: "on-target" }
  }),
  spell({
    id: "sleep",
    category: "core",
    name: "Sleep",
    nameTh: "\u0E25\u0E30\u0E2D\u0E2D\u0E07\u0E2B\u0E25\u0E31\u0E1A",
    summaryTh: "\u0E27\u0E07\u0E23\u0E31\u0E28\u0E21\u0E35 5 \u0E1F\u0E38\u0E15 \u0E40\u0E0B\u0E1F WIS \u0E1E\u0E25\u0E32\u0E14 = Incapacitated \u0E08\u0E1A\u0E40\u0E17\u0E34\u0E23\u0E4C\u0E19\u0E16\u0E31\u0E14\u0E44\u0E1B\u0E40\u0E0B\u0E1F\u0E2D\u0E35\u0E01\u0E17\u0E35 \u0E1E\u0E25\u0E32\u0E14 = Unconscious 1 \u0E19\u0E32\u0E17\u0E35 \u0E15\u0E37\u0E48\u0E19\u0E40\u0E21\u0E37\u0E48\u0E2D\u0E42\u0E14\u0E19\u0E14\u0E32\u0E40\u0E21\u0E08\u0E2B\u0E23\u0E37\u0E2D\u0E16\u0E39\u0E01\u0E40\u0E02\u0E22\u0E48\u0E32",
    level: 1,
    school: "enc",
    tags: ["control"],
    activation: "action",
    range: 90,
    duration: { unit: "minute", n: 1 },
    concentration: true,
    components: { v: true, s: true, m: "a pinch of fine sand, rose petals, or a cricket" },
    cost: [{ kind: "slot", pool: "spell" }],
    requires: { notConditions: CANT_ACT },
    delivery: "area",
    effect: { roll: { kind: "save", ability: "wis" }, area: { shape: "sphere", ft: 5 }, conditions: ["incapacitated", "unconscious"], scaling: { perSlot: { radiusFt: 5 } } },
    fx: { style: "at-point" },
    verify: "\u0E15\u0E23\u0E27\u0E08\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14\u0E01\u0E31\u0E1A PHB 2024"
  }),
  spell({
    id: "healing-word",
    category: "core",
    name: "Healing Word",
    nameTh: "\u0E04\u0E33\u0E23\u0E31\u0E01\u0E29\u0E32",
    summaryTh: "Bonus Action \u0E23\u0E31\u0E01\u0E29\u0E32\u0E40\u0E1B\u0E49\u0E32\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E47\u0E19\u0E43\u0E19\u0E23\u0E30\u0E22\u0E30 60 \u0E1F\u0E38\u0E15 2d4 + \u0E04\u0E48\u0E32\u0E40\u0E27\u0E17 \u0E43\u0E0A\u0E49\u0E0A\u0E48\u0E2D\u0E07\u0E2A\u0E39\u0E07\u0E02\u0E36\u0E49\u0E19 +2d4 \u0E15\u0E48\u0E2D\u0E40\u0E25\u0E40\u0E27\u0E25",
    level: 1,
    school: "abj",
    tags: ["healing"],
    activation: "bonus",
    range: 60,
    duration: { unit: "instant" },
    components: { v: true },
    cost: [{ kind: "slot", pool: "spell" }],
    requires: { seeTarget: true, notConditions: CANT_ACT },
    delivery: "target",
    targets: { max: 1, allow: "any" },
    effect: { roll: { kind: "auto" }, heal: { dice: "2d4", addMod: true }, scaling: { perSlot: { heal: "2d4" } } },
    fx: { style: "on-target" }
  }),
  spell({
    id: "cure-wounds",
    category: "core",
    name: "Cure Wounds",
    nameTh: "\u0E23\u0E31\u0E01\u0E29\u0E32\u0E1A\u0E32\u0E14\u0E41\u0E1C\u0E25",
    summaryTh: "\u0E41\u0E15\u0E30\u0E40\u0E1B\u0E49\u0E32 \u0E23\u0E31\u0E01\u0E29\u0E32 2d8 + \u0E04\u0E48\u0E32\u0E40\u0E27\u0E17 \u0E43\u0E0A\u0E49\u0E0A\u0E48\u0E2D\u0E07\u0E2A\u0E39\u0E07\u0E02\u0E36\u0E49\u0E19 +2d8 \u0E15\u0E48\u0E2D\u0E40\u0E25\u0E40\u0E27\u0E25",
    level: 1,
    school: "abj",
    tags: ["healing"],
    activation: "action",
    range: "touch",
    duration: { unit: "instant" },
    components: { v: true, s: true },
    cost: [{ kind: "slot", pool: "spell" }],
    requires: { notConditions: CANT_ACT },
    delivery: "target",
    targets: { max: 1, allow: "any" },
    effect: { roll: { kind: "auto" }, heal: { dice: "2d8", addMod: true }, scaling: { perSlot: { heal: "2d8" } } },
    fx: { style: "on-target" }
  })
];

// src/data/spells/coreMore.ts
var q = (id, name, level, school, activation, range, delivery, style, area) => spell({ id, category: "core", name, level, school, activation, range, delivery, fx: { style }, ...area ? { effect: { area } } : {}, verify: "stub: \u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E43\u0E2A\u0E48\u0E01\u0E0E (\u0E14\u0E32\u0E40\u0E21\u0E08/\u0E40\u0E0B\u0E1F/\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21) \u0E15\u0E23\u0E27\u0E08\u0E01\u0E31\u0E1A\u0E2B\u0E19\u0E31\u0E07\u0E2A\u0E37\u0E2D\u0E01\u0E48\u0E2D\u0E19\u0E43\u0E0A\u0E49" });
var CORE_MORE = [
  // cantrips
  q("message", "Message", 0, "trs", "action", 120, "target", "projectile"),
  q("minor-illusion", "Minor Illusion", 0, "ill", "action", 30, "point", "at-point"),
  q("guidance", "Guidance", 0, "div", "action", "touch", "target", "on-target"),
  q("druidcraft", "Druidcraft", 0, "trs", "action", 30, "point", "at-point"),
  q("dancing-lights", "Dancing Lights", 0, "evo", "action", 120, "point", "at-point"),
  q("mending", "Mending", 0, "trs", "minute", "touch", "target", "on-target"),
  q("mind-sliver", "Mind Sliver", 0, "enc", "action", 60, "target", "on-target"),
  q("prestidigitation", "Prestidigitation", 0, "trs", "action", 10, "point", "at-point"),
  // level 1
  q("disguise-self", "Disguise Self", 1, "ill", "action", "self", "self", "on-caster"),
  q("hunters-mark", "Hunter's Mark", 1, "div", "bonus", 90, "target", "on-target"),
  q("ensnaring-strike", "Ensnaring Strike", 1, "con", "bonus", "self", "self", "on-caster"),
  q("grease", "Grease", 1, "con", "action", 60, "area", "at-point", { shape: "cube", ft: 10 }),
  q("faerie-fire", "Faerie Fire", 1, "evo", "action", 60, "area", "at-point", { shape: "cube", ft: 20 }),
  q("detect-magic", "Detect Magic", 1, "div", "action", "self", "area", "on-caster", { shape: "sphere", ft: 30 }),
  q("arms-of-hadar", "Arms of Hadar", 1, "con", "action", "self", "area", "on-caster", { shape: "sphere", ft: 10 }),
  q("dissonant-whispers", "Dissonant Whispers", 1, "enc", "action", 60, "target", "on-target"),
  q("speak-with-animals", "Speak with Animals", 1, "div", "action", "self", "self", "on-caster"),
  q("fog-cloud", "Fog Cloud", 1, "con", "action", 120, "area", "at-point", { shape: "sphere", ft: 20 }),
  q("alarm", "Alarm", 1, "abj", "minute", 30, "point", "at-point"),
  // level 2
  q("calm-emotions", "Calm Emotions", 2, "enc", "action", 60, "area", "at-point", { shape: "sphere", ft: 20 }),
  q("detect-thoughts", "Detect Thoughts", 2, "div", "action", "self", "self", "on-caster"),
  q("mirror-image", "Mirror Image", 2, "ill", "action", "self", "self", "on-caster"),
  q("misty-step", "Misty Step", 2, "con", "bonus", "self", "point", "at-point"),
  q("hold-person", "Hold Person", 2, "enc", "action", 60, "target", "on-target"),
  q("rope-trick", "Rope Trick", 2, "trs", "action", "touch", "target", "on-target"),
  q("darkness", "Darkness", 2, "evo", "action", 60, "area", "at-point", { shape: "sphere", ft: 15 }),
  q("pass-without-trace", "Pass without Trace", 2, "abj", "action", "self", "area", "on-caster", { shape: "sphere", ft: 30 }),
  q("spike-growth", "Spike Growth", 2, "trs", "action", 150, "area", "at-point", { shape: "sphere", ft: 20 }),
  // level 3
  q("hunger-of-hadar", "Hunger of Hadar", 3, "con", "action", 150, "area", "at-point", { shape: "sphere", ft: 20 }),
  q("sending", "Sending", 3, "evo", "action", 5280, "target", "on-target"),
  q("fireball", "Fireball", 3, "evo", "action", 150, "area", "at-point", { shape: "sphere", ft: 20 }),
  q("counterspell", "Counterspell", 3, "abj", "reaction", 60, "target", "on-target")
];

// src/data/spells/jb2aNames.ts
var JB2A = {
  // ---- cantrip
  "fire-bolt": { seq: ["jb2a.fire_bolt.orange"], line: "#ff7a2a" },
  "eldritch-blast": { seq: ["jb2a.eldritch_blast.purple"], line: "#d02a4a" },
  "shocking-grasp": { seq: ["jb2a.shocking_grasp.blue"], line: "#9fd8ff" },
  "message": { seq: ["jb2a.markers.light.complete.blue"], line: "#9fd8ff" },
  // เดา
  "minor-illusion": { seq: ["jb2a.markers.light.complete.purple"], line: "#b46aff" },
  // เดา
  "guidance": { seq: ["jb2a.guidance.hand.blue", "jb2a.markers.light.complete.yellow"], line: "#ffd84a" },
  // เดา
  "druidcraft": { seq: ["jb2a.markers.light.complete.green"], line: "#4cff7a" },
  // เดา
  "dancing-lights": { seq: ["jb2a.dancing_light.blueteal", "jb2a.dancing_light.yellow"], line: "#8fe8ff" },
  "mending": { seq: ["jb2a.markers.light.complete.yellow"], line: "#ffd84a" },
  // เดา
  "mind-sliver": { seq: ["jb2a.mind_sliver.purple", "jb2a.markers.light.complete.purple"], line: "#b46aff" },
  // เดา
  "prestidigitation": { seq: ["jb2a.markers.light.complete.white"], line: "#ffffff" },
  // เดา
  // ---- level 1
  "shield": { seq: ["jb2a.shield.01.complete.blue", "jb2a.shield.01.intro.blue"], line: "#5aa9ff" },
  "magic-missile": { seq: ["jb2a.magic_missile.purple", "jb2a.magic_missile.blue"], line: "#c9a0ff" },
  "hex": { seq: ["jb2a.hex.purple", "jb2a.markers.curse.purple"], line: "#7a2aa0" },
  // เดา
  "sleep": { seq: ["jb2a.sleep.blue"], line: "#6aa0ff" },
  // เดา
  "healing-word": { seq: ["jb2a.healing_generic.200px.green", "jb2a.cure_wounds.400px.blue"], line: "#7aff9a" },
  "cure-wounds": { seq: ["jb2a.cure_wounds.400px.blue", "jb2a.healing_generic.200px.green"], line: "#7aff9a" },
  "disguise-self": { seq: ["jb2a.disguise_self.purple", "jb2a.markers.light.complete.purple"], line: "#b46aff" },
  // เดา
  "hunters-mark": { seq: ["jb2a.hunters_mark.pulse.01.green", "jb2a.hunters_mark.mark.01.green"], line: "#4cff7a" },
  "ensnaring-strike": { seq: ["jb2a.ensnaring_strike.reversed.blue", "jb2a.entangle.green"], line: "#4cff7a" },
  "grease": { seq: ["jb2a.grease.dark_brown.loop", "jb2a.grease.top.brown"], line: "#8a6a3a" },
  // เดา
  "faerie-fire": { seq: ["jb2a.faerie_fire.green", "jb2a.markers.light.complete.green"], line: "#9aff6a" },
  // เดา
  "detect-magic": { seq: ["jb2a.detect_magic.circle.blue", "jb2a.detect_magic.cone.blue"], line: "#5aa9ff" },
  "arms-of-hadar": { seq: ["jb2a.arms_of_hadar.dark_purple"], line: "#5a2a7a" },
  "dissonant-whispers": { seq: ["jb2a.dissonant_whispers.01.purple"], line: "#b46aff" },
  "speak-with-animals": { seq: ["jb2a.speak_with_animals.green", "jb2a.markers.light.complete.green"], line: "#4cff7a" },
  // เดา
  "fog-cloud": { seq: ["jb2a.fog_cloud.01.white", "jb2a.fog_cloud.02.white"], line: "#dfe8f0" },
  "alarm": { seq: ["jb2a.alarm.blue", "jb2a.markers.light.complete.blue"], line: "#5aa9ff" },
  // เดา
  // ---- level 2
  "calm-emotions": { seq: ["jb2a.calm_emotions.blue", "jb2a.markers.light.complete.blue"], line: "#9fd8ff" },
  // เดา
  "detect-thoughts": { seq: ["jb2a.detect_thoughts.purple", "jb2a.markers.light.complete.purple"], line: "#b46aff" },
  // เดา
  "mirror-image": { seq: ["jb2a.mirror_image.blue", "jb2a.markers.light.complete.blue"], line: "#9fd8ff" },
  // เดา
  "misty-step": { seq: ["jb2a.misty_step.01.blue", "jb2a.misty_step.02.blue"], line: "#9fd8ff" },
  "hold-person": { seq: ["jb2a.hold_person.blue", "jb2a.markers.chain.standard.loop.01.blue"], line: "#9fd8ff" },
  // เดา
  "rope-trick": { seq: ["jb2a.rope_trick.blue", "jb2a.markers.light.complete.blue"], line: "#c9a06a" },
  // เดา
  "darkness": { seq: ["jb2a.darkness.black", "jb2a.darkness.blue"], line: "#222233" },
  // เดา
  "pass-without-trace": { seq: ["jb2a.pass_without_trace.green", "jb2a.markers.light.complete.green"], line: "#4cff7a" },
  // เดา
  "spike-growth": { seq: ["jb2a.spike_growth.green", "jb2a.markers.light.complete.green"], line: "#6aa04a" },
  // เดา
  // ---- level 3
  "hunger-of-hadar": { seq: ["jb2a.hunger_of_hadar.dark_purple", "jb2a.darkness.black"], line: "#3a1a5a" },
  // เดา
  "sending": { seq: ["jb2a.sending.blue", "jb2a.markers.light.complete.blue"], line: "#9fd8ff" },
  // เดา
  "fireball": { seq: ["jb2a.fireball.explosion.orange"], line: "#ff7a2a" },
  "counterspell": { seq: ["jb2a.counterspell.complete.blueyellow", "jb2a.counterspell.blue"], line: "#5aa9ff" }
};

// src/data/spells/house.ts
var HOUSE = [
  // a house-rule version: only write what CHANGES, everything else comes from "fire-bolt"
  // spell({ id: "fire-bolt-wide", category: "house", extends: "fire-bolt", name: "Fire Bolt (กว้าง)", aliases: ["Fire Bolt Wide"],
  //         effect: { area: { shape: "sphere", ft: 5 } }, delivery: "area" }),
];

// src/data/spells/index.ts
var withJb2a = (d) => {
  const j = JB2A[d.id];
  if (!j) return d;
  const fx = d.fx;
  const own = Array.isArray(fx?.refs) ? fx.refs : [];
  const seqs = j.seq.filter((s) => !own.some((o) => "seq" in o && o.seq === s)).map((s) => ({ seq: s }));
  const lines = own.some((o) => "line" in o) ? own.filter((o) => "line" in o) : j.line ? [{ line: j.line }] : [];
  return { ...d, fx: { ...d.fx, refs: [...own.filter((o) => !("line" in o)), ...seqs, ...lines] } };
};
var SPELLS = new Catalog([...CORE, ...CORE_MORE, ...HOUSE].map(withJb2a), { icons: ICON_MANIFEST, casters: CASTERS });

export {
  chainOf,
  CASTERS,
  casterKeyOf,
  SPELLS
};
