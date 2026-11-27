// Puts the layers of a spell together (see types.ts). Pure; the catalog calls this.
import type { ResolveCtx, SpellResolved, Spell, SpellDef } from "./types";

const isObj = (v: unknown): v is Record<string, any> => typeof v === "object" && v !== null && !Array.isArray(v);
const isOp = (v: unknown): boolean => isObj(v) && ("$append" in v || "$prepend" in v);
const clone = <T>(v: T): T => (v === undefined ? v : JSON.parse(JSON.stringify(v)));   // catalog data is plain JSON

// returns base + patch (neither is changed)
export function applyPatch<T extends Record<string, any>>(base: T, patch: Record<string, any>): T {
  const out: Record<string, any> = clone(base);
  for (const [k, pv] of Object.entries(patch)) {
    if (pv === undefined) continue;
    if (pv === null) { delete out[k]; continue; }
    if (isObj(pv) && "$set" in pv) { out[k] = clone(pv.$set); continue; }
    if (isOp(pv)) { out[k] = [...clone(pv.$prepend ?? []), ...(Array.isArray(out[k]) ? out[k] : []), ...clone(pv.$append ?? [])]; continue; }
    if (isObj(pv)) { out[k] = applyPatch(isObj(out[k]) ? out[k] : {}, pv); continue; }
    out[k] = clone(pv);
  }
  return out as T;
}

// "effect.damage, casting.medium": what a patch touches (for the trace)
export function paths(patch: Record<string, any>, pre = ""): string[] {
  return Object.entries(patch).flatMap(([k, v]) => (isObj(v) && !isOp(v) && !("$set" in v) ? paths(v, `${pre}${k}.`) : [`${pre}${k}`]));
}

const META = new Set(["id", "category", "extends", "aliases", "byCaster", "variants"]);
export const fieldsOf = (d: SpellDef): Record<string, any> => Object.fromEntries(Object.entries(d).filter(([k]) => !META.has(k)));

// the spell and everything it extends, root (core) first. Throws a readable message on a missing parent or a loop
export function chainOf(byId: Map<string, SpellDef>, id: string): SpellDef[] {
  const out: SpellDef[] = [], seen: string[] = [];
  let from = "";
  for (let cur: string | undefined = id; cur; ) {
    if (seen.includes(cur)) throw new Error(`extends วนกลับมาที่เดิม: ${[...seen, cur].join(" → ")}`);
    const d = byId.get(cur);
    if (!d) throw new Error(from ? `"${from}" ต่อจาก "${cur}" แต่ไม่มีสกิลนี้ใน catalog` : `ไม่มีสกิล "${cur}" ใน catalog`);
    seen.push(cur); out.unshift(d); from = cur; cur = d.extends;
  }
  return out;
}

export function resolveFrom(byId: Map<string, SpellDef>, id: string, ctx: ResolveCtx = {}, casterDefaults?: Record<string, any>): SpellResolved {
  const defs = chainOf(byId, id), trace: string[] = [];
  let acc: Record<string, any> = {};
  for (const d of defs) {
    const f = fieldsOf(d); acc = applyPatch(acc, f);
    trace.push(d.extends ? `${d.category} · ${d.id} (ต่อจาก ${d.extends}): ${paths(f).join(", ") || "-"}` : `${d.category} · ${d.id}`);
  }
  const caster = ctx.caster?.toLowerCase();
  if (caster && casterDefaults) { acc = applyPatch(acc, casterDefaults); trace.push(`ค่าตั้งต้นของ ${caster}: ${paths(casterDefaults).join(", ")}`); }
  if (caster) for (const d of defs) {
    const p = d.byCaster?.[caster]; if (!p) continue;
    acc = applyPatch(acc, p); trace.push(`ผู้ร่าย ${caster} (${d.id}): ${paths(p).join(", ")}`);
  }
  for (const v of [ctx.via ?? []].flat()) for (const d of defs) {
    const p = d.variants?.[v]; if (!p) continue;
    acc = applyPatch(acc, p); trace.push(`ร่ายแบบ ${v} (${d.id}): ${paths(p).join(", ")}`);
  }
  const leaf = defs[defs.length - 1];
  return { spell: { ...acc, id: leaf.id, category: leaf.category } as Spell, chain: defs.map((d) => d.id).reverse(), trace };   // chain: leaf first
}
