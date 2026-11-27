// Checks the catalog and says what is wrong in words (Thai) the person adding a spell can act on.
import type { Catalog } from "./catalog";
import type { Issue, SpellDef } from "./types";
import { chainOf } from "./resolve";

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const NEED = ["name", "level", "activation", "range", "delivery"] as const;
const NEED_TH: Record<string, string> = { name: "ชื่อ (name)", level: "เลเวล (level, 0 = cantrip)", activation: "ใช้ยังไง (activation)", range: "ระยะ (range)", delivery: "ผลลงที่ไหน (delivery: self/target/area/ray/point)" };

export function validateCatalog(cat: Catalog, casterKeys: string[] = Object.keys(cat.casters)): Issue[] {
  const out: Issue[] = [];
  const add = (id: string, level: Issue["level"], text: string) => out.push({ id, level, text });
  for (const d of cat.dupes) add(d, "error", "มีสกิลหรือชื่อนี้ซ้ำใน catalog (ตัวหลังถูกข้าม)");
  const known = new Set(casterKeys.map((k) => k.toLowerCase()));

  for (const d of cat.byId.values()) {
    if (!SLUG.test(d.id)) add(d.id, "error", `id ต้องเป็นตัวพิมพ์เล็ก/ตัวเลข คั่นด้วย - เช่น "fire-bolt"`);
    if (d.category === "core" && d.extends) add(d.id, "warn", `เป็น core แต่ต่อจาก "${d.extends}" ถ้าเป็นการปรับกฎให้ใช้ category "house"`);
    if (d.category !== "core" && !d.extends && !d.name) add(d.id, "warn", "ไม่ได้ต่อจากสกิลไหนและไม่มีชื่อ");
    for (const k of Object.keys(d.byCaster ?? {})) if (!known.has(k.toLowerCase())) add(d.id, "warn", `byCaster "${k}" ไม่มีใน src/data/casters.ts (ชื่อผู้ร่ายผิด หรือยังไม่ได้เพิ่มตัวละคร)`);

    let chain: SpellDef[];
    try { chain = chainOf(cat.byId, d.id); } catch (e: any) { add(d.id, "error", e.message); continue; }
    const base = cat.resolve(d.id);
    if (!base) { add(d.id, "error", "รวมชั้นไม่ได้"); continue; }
    const s = base.spell;
    for (const k of NEED) if (s[k] === undefined || s[k] === "") add(d.id, "error", `ขาด ${NEED_TH[k]}`);
    if (s.level === 0 && s.cost?.some((c) => c.kind === "slot")) add(d.id, "warn", "cantrip แต่มีค่าใช้ช่องเวท");
    for (const c of s.cost ?? []) if (c.kind === "slot" && c.level !== undefined && c.level < s.level) add(d.id, "warn", `ใช้ช่องเวทเลเวล ${c.level} ต่ำกว่าเลเวลสกิล (${s.level})`);
    if ((s.delivery === "area" || s.delivery === "ray") && !s.effect?.area) add(d.id, "warn", `delivery "${s.delivery}" แต่ไม่มี effect.area (รูปร่างและขนาด)`);
    if (s.delivery === "self" && s.fx?.style === "projectile") add(d.id, "warn", "สกิลลงตัวเอง แต่ fx.style เป็น projectile");
    if (s.effect?.roll?.kind === "save" && !s.effect.roll.ability) add(d.id, "warn", "roll เป็น save แต่ไม่ได้ระบุ ability");
    if (s.effect?.roll?.kind === "attack" && !s.effect.roll.range) add(d.id, "warn", "roll เป็น attack แต่ไม่ได้ระบุ range (ranged/melee)");
    for (const r of s.fx?.refs ?? []) if (!("seq" in r || "file" in r || "line" in r)) add(d.id, "error", "fx.refs มีรายการที่ไม่ใช่ seq / file / line");
    if (s.fx?.refs?.length && !s.fx.refs.some((r) => "line" in r)) add(d.id, "info", "fx.refs ไม่มี line เป็นตัวสำรอง ถ้าไม่มี JB2A/BLFX จะไม่มีเอฟเฟกต์");

    // every caster / variant patch must still leave a complete spell
    const keys = [...new Set(chain.flatMap((c) => Object.keys(c.byCaster ?? {})))];
    for (const k of keys) { const r = cat.resolve(d.id, { caster: k }); for (const n of NEED) if (r && (r.spell[n] === undefined)) add(d.id, "error", `byCaster "${k}" ทำให้ ${NEED_TH[n]} หายไป`); }
    const vs = [...new Set(chain.flatMap((c) => Object.keys(c.variants ?? {})))];
    for (const v of vs) { const r = cat.resolve(d.id, { via: v }); for (const n of NEED) if (r && (r.spell[n] === undefined)) add(d.id, "error", `variant "${v}" ทำให้ ${NEED_TH[n]} หายไป`); }
  }
  for (const id of Object.keys(cat.icons)) if (!cat.has(id)) add(id, "info", "มีไฟล์ไอคอนแล้ว แต่ยังไม่มีสกิลนี้ใน catalog (ยังใช้ไอคอนได้ แต่ยังไม่มีข้อมูลเอฟเฟกต์/กติกา)");
  return out;
}
