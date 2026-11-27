/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  CASTERS,
  SPELLS,
  casterKeyOf,
  chainOf
} from "./chunks/chunk-FIVJTHGI.js";
import "./chunks/chunk-H7JZCNPB.js";

// src/spells/validate.ts
var SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
var NEED = ["name", "level", "activation", "range", "delivery"];
var NEED_TH = { name: "\u0E0A\u0E37\u0E48\u0E2D (name)", level: "\u0E40\u0E25\u0E40\u0E27\u0E25 (level, 0 = cantrip)", activation: "\u0E43\u0E0A\u0E49\u0E22\u0E31\u0E07\u0E44\u0E07 (activation)", range: "\u0E23\u0E30\u0E22\u0E30 (range)", delivery: "\u0E1C\u0E25\u0E25\u0E07\u0E17\u0E35\u0E48\u0E44\u0E2B\u0E19 (delivery: self/target/area/ray/point)" };
function validateCatalog(cat, casterKeys = Object.keys(cat.casters)) {
  const out = [];
  const add = (id, level, text) => out.push({ id, level, text });
  for (const d of cat.dupes) add(d, "error", "\u0E21\u0E35\u0E2A\u0E01\u0E34\u0E25\u0E2B\u0E23\u0E37\u0E2D\u0E0A\u0E37\u0E48\u0E2D\u0E19\u0E35\u0E49\u0E0B\u0E49\u0E33\u0E43\u0E19 catalog (\u0E15\u0E31\u0E27\u0E2B\u0E25\u0E31\u0E07\u0E16\u0E39\u0E01\u0E02\u0E49\u0E32\u0E21)");
  const known = new Set(casterKeys.map((k) => k.toLowerCase()));
  for (const d of cat.byId.values()) {
    if (!SLUG.test(d.id)) add(d.id, "error", `id \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E15\u0E31\u0E27\u0E1E\u0E34\u0E21\u0E1E\u0E4C\u0E40\u0E25\u0E47\u0E01/\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02 \u0E04\u0E31\u0E48\u0E19\u0E14\u0E49\u0E27\u0E22 - \u0E40\u0E0A\u0E48\u0E19 "fire-bolt"`);
    if (d.category === "core" && d.extends) add(d.id, "warn", `\u0E40\u0E1B\u0E47\u0E19 core \u0E41\u0E15\u0E48\u0E15\u0E48\u0E2D\u0E08\u0E32\u0E01 "${d.extends}" \u0E16\u0E49\u0E32\u0E40\u0E1B\u0E47\u0E19\u0E01\u0E32\u0E23\u0E1B\u0E23\u0E31\u0E1A\u0E01\u0E0E\u0E43\u0E2B\u0E49\u0E43\u0E0A\u0E49 category "house"`);
    if (d.category !== "core" && !d.extends && !d.name) add(d.id, "warn", "\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E15\u0E48\u0E2D\u0E08\u0E32\u0E01\u0E2A\u0E01\u0E34\u0E25\u0E44\u0E2B\u0E19\u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E21\u0E35\u0E0A\u0E37\u0E48\u0E2D");
    for (const k of Object.keys(d.byCaster ?? {})) if (!known.has(k.toLowerCase())) add(d.id, "warn", `byCaster "${k}" \u0E44\u0E21\u0E48\u0E21\u0E35\u0E43\u0E19 src/data/casters.ts (\u0E0A\u0E37\u0E48\u0E2D\u0E1C\u0E39\u0E49\u0E23\u0E48\u0E32\u0E22\u0E1C\u0E34\u0E14 \u0E2B\u0E23\u0E37\u0E2D\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E40\u0E1E\u0E34\u0E48\u0E21\u0E15\u0E31\u0E27\u0E25\u0E30\u0E04\u0E23)`);
    let chain;
    try {
      chain = chainOf(cat.byId, d.id);
    } catch (e) {
      add(d.id, "error", e.message);
      continue;
    }
    const base = cat.resolve(d.id);
    if (!base) {
      add(d.id, "error", "\u0E23\u0E27\u0E21\u0E0A\u0E31\u0E49\u0E19\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
      continue;
    }
    const s = base.spell;
    for (const k of NEED) if (s[k] === void 0 || s[k] === "") add(d.id, "error", `\u0E02\u0E32\u0E14 ${NEED_TH[k]}`);
    if (s.level === 0 && s.cost?.some((c) => c.kind === "slot")) add(d.id, "warn", "cantrip \u0E41\u0E15\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32\u0E43\u0E0A\u0E49\u0E0A\u0E48\u0E2D\u0E07\u0E40\u0E27\u0E17");
    for (const c of s.cost ?? []) if (c.kind === "slot" && c.level !== void 0 && c.level < s.level) add(d.id, "warn", `\u0E43\u0E0A\u0E49\u0E0A\u0E48\u0E2D\u0E07\u0E40\u0E27\u0E17\u0E40\u0E25\u0E40\u0E27\u0E25 ${c.level} \u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32\u0E40\u0E25\u0E40\u0E27\u0E25\u0E2A\u0E01\u0E34\u0E25 (${s.level})`);
    if ((s.delivery === "area" || s.delivery === "ray") && !s.effect?.area) add(d.id, "warn", `delivery "${s.delivery}" \u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E21\u0E35 effect.area (\u0E23\u0E39\u0E1B\u0E23\u0E48\u0E32\u0E07\u0E41\u0E25\u0E30\u0E02\u0E19\u0E32\u0E14)`);
    if (s.delivery === "self" && s.fx?.style === "projectile") add(d.id, "warn", "\u0E2A\u0E01\u0E34\u0E25\u0E25\u0E07\u0E15\u0E31\u0E27\u0E40\u0E2D\u0E07 \u0E41\u0E15\u0E48 fx.style \u0E40\u0E1B\u0E47\u0E19 projectile");
    if (s.effect?.roll?.kind === "save" && !s.effect.roll.ability) add(d.id, "warn", "roll \u0E40\u0E1B\u0E47\u0E19 save \u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E23\u0E30\u0E1A\u0E38 ability");
    if (s.effect?.roll?.kind === "attack" && !s.effect.roll.range) add(d.id, "warn", "roll \u0E40\u0E1B\u0E47\u0E19 attack \u0E41\u0E15\u0E48\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E23\u0E30\u0E1A\u0E38 range (ranged/melee)");
    for (const r of s.fx?.refs ?? []) if (!("seq" in r || "file" in r || "line" in r)) add(d.id, "error", "fx.refs \u0E21\u0E35\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48 seq / file / line");
    if (s.fx?.refs?.length && !s.fx.refs.some((r) => "line" in r)) add(d.id, "info", "fx.refs \u0E44\u0E21\u0E48\u0E21\u0E35 line \u0E40\u0E1B\u0E47\u0E19\u0E15\u0E31\u0E27\u0E2A\u0E33\u0E23\u0E2D\u0E07 \u0E16\u0E49\u0E32\u0E44\u0E21\u0E48\u0E21\u0E35 JB2A/BLFX \u0E08\u0E30\u0E44\u0E21\u0E48\u0E21\u0E35\u0E40\u0E2D\u0E1F\u0E40\u0E1F\u0E01\u0E15\u0E4C");
    const keys = [...new Set(chain.flatMap((c) => Object.keys(c.byCaster ?? {})))];
    for (const k of keys) {
      const r = cat.resolve(d.id, { caster: k });
      for (const n of NEED) if (r && r.spell[n] === void 0) add(d.id, "error", `byCaster "${k}" \u0E17\u0E33\u0E43\u0E2B\u0E49 ${NEED_TH[n]} \u0E2B\u0E32\u0E22\u0E44\u0E1B`);
    }
    const vs = [...new Set(chain.flatMap((c) => Object.keys(c.variants ?? {})))];
    for (const v of vs) {
      const r = cat.resolve(d.id, { via: v });
      for (const n of NEED) if (r && r.spell[n] === void 0) add(d.id, "error", `variant "${v}" \u0E17\u0E33\u0E43\u0E2B\u0E49 ${NEED_TH[n]} \u0E2B\u0E32\u0E22\u0E44\u0E1B`);
    }
  }
  for (const id of Object.keys(cat.icons)) if (!cat.has(id)) add(id, "info", "\u0E21\u0E35\u0E44\u0E1F\u0E25\u0E4C\u0E44\u0E2D\u0E04\u0E2D\u0E19\u0E41\u0E25\u0E49\u0E27 \u0E41\u0E15\u0E48\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2A\u0E01\u0E34\u0E25\u0E19\u0E35\u0E49\u0E43\u0E19 catalog (\u0E22\u0E31\u0E07\u0E43\u0E0A\u0E49\u0E44\u0E2D\u0E04\u0E2D\u0E19\u0E44\u0E14\u0E49 \u0E41\u0E15\u0E48\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E21\u0E35\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E40\u0E2D\u0E1F\u0E40\u0E1F\u0E01\u0E15\u0E4C/\u0E01\u0E15\u0E34\u0E01\u0E32)");
  return out;
}

// src/features/spells.ts
function register(core) {
  core.spells = {
    catalog: SPELLS,
    get: (ref) => SPELLS.get(ref),
    list: (f) => SPELLS.list(f),
    resolve: (ref, ctx) => SPELLS.resolve(ref, ctx),
    icon: (ref, caster, via) => SPELLS.icon(ref, caster, via),
    casterOf: casterKeyOf,
    explain: (ref, caster, via) => {
      const r = SPELLS.resolve(ref, { caster, via });
      console.log(r ? r.trace.join("\n") : `\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E2A\u0E01\u0E34\u0E25 "${ref}" (\u0E2B\u0E23\u0E37\u0E2D\u0E23\u0E27\u0E21\u0E0A\u0E31\u0E49\u0E19\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E25\u0E2D\u0E07 spells.check())`);
      return r;
    },
    check: () => {
      const issues = validateCatalog(SPELLS, Object.keys(CASTERS));
      const n = (l) => issues.filter((i) => i.level === l).length;
      console.log(`spells.check: error ${n("error")} \xB7 warn ${n("warn")} \xB7 info ${n("info")}`);
      if (issues.length) console.table(issues);
      return issues;
    }
  };
}
export {
  register
};
