// Foundry token -> plain Creature, and pixel <-> grid-cell conversion.
// Everything reads from the token's own scene (not canvas.scene), so the GM client can apply a
// player's request even while looking at another scene.
import { SIZES, type AbilityKey, type Creature, type SizeKey } from "../model/creature";
import type { Cell } from "../model/world";
import type { Prop } from "../model/thing";
import { parseHeightFt, parseWeightLb, resolveMass } from "../rules/mass";
import { resolvePropMass } from "../rules/propMass";
import { PROP_DEFAULT } from "../data/props";

export const MOD = "arkane-1920s";
export const SOCK = `module.${MOD}`;
const ABILITIES: AbilityKey[] = ["str", "dex", "con", "int", "wis", "cha"];

const num = (v: unknown, d = 0): number => { const n = Number(v); return Number.isFinite(n) ? n : d; };

// ---- grid maths (square grid; the scene's padding offset is respected)
export const gridSize = (scene: any): number => num(scene?.grid?.size, 100) || 100;
export const gridFt = (scene: any): number => num(scene?.grid?.distance, 5) || 5;
export const origin = (scene: any) => ({ x: num(scene?.dimensions?.sceneX), y: num(scene?.dimensions?.sceneY) });

export function cellOf(scene: any, x: number, y: number): Cell {
  const s = gridSize(scene), o = origin(scene);
  return { col: Math.round((x - o.x) / s), row: Math.round((y - o.y) / s) };
}
export function topLeftOf(scene: any, c: Cell): { x: number; y: number } {
  const s = gridSize(scene), o = origin(scene);
  return { x: o.x + c.col * s, y: o.y + c.row * s };
}
export function centerOf(scene: any, c: Cell): { x: number; y: number } {
  const s = gridSize(scene), t = topLeftOf(scene, c);
  return { x: t.x + s / 2, y: t.y + s / 2 };
}

// same fallback chain as saveMod() in combatx.js: save.value, else save, else the ability mod
function saveBonus(actor: any, ab: AbilityKey): number {
  const a = actor?.system?.abilities?.[ab];
  if (!a) return 0;
  const v = typeof a.save === "object" ? a.save?.value : a.save;
  return num(v ?? a.mod);
}

// A token is a PROP (crate, statue, barrel) when the GM set the flag  arkane-1920s.prop  on it
// (true, or an object {material, heightFt, fill, mass, immovable}). See game.arkane.core.setProp().
function propFlag(tok: any): Record<string, unknown> | null {
  let f: unknown; try { f = tok?.getFlag?.(MOD, "prop"); } catch { /* no flag */ }
  if (f === true) return {};
  return f && typeof f === "object" ? (f as Record<string, unknown>) : null;
}
export const isPropToken = (tok: any): boolean => propFlag(tok) !== null;

export function toProp(tok: any): Prop | null {
  const f = propFlag(tok);
  if (!f) return null;
  const cellFt = gridFt(tok.parent), footprint = Math.max(1, Math.round(num(tok.width, 1)));
  const material = typeof f.material === "string" ? f.material : PROP_DEFAULT.material;
  const heightFt = num(f.heightFt, PROP_DEFAULT.heightFt) || PROP_DEFAULT.heightFt;
  const m = resolvePropMass({ override: Number(f.mass) || undefined, material, heightFt, footprint, cellFt, fill: Number(f.fill) || undefined });
  return {
    id: String(tok.id), name: String(tok.name ?? "prop"),
    pos: cellOf(tok.parent, num(tok.x), num(tok.y)), footprint, elevation: num(tok.elevation),
    mass: m.mass, massSource: m.source, material, heightFt,
    tags: f.immovable ? ["prop", "immovable"] : ["prop"],
  };
}

export function toCreature(tok: any): Creature | null {
  const actor = tok?.actor;
  if (!actor || isPropToken(tok)) return null;
  const sys = actor.system ?? {}, at = sys.attributes ?? {}, scene = tok.parent;

  const rawSize = sys.traits?.size;
  const size: SizeKey = (SIZES as readonly string[]).includes(rawSize) ? rawSize : "med";
  const conditions = [...(actor.statuses ?? [])].map(String);

  let tags: string[] = [];
  try { const t = actor.getFlag?.(MOD, "tags"); if (Array.isArray(t)) tags = t.map(String); } catch { /* no flag */ }
  if (conditions.includes("flying") && !tags.includes("flying")) tags.push("flying");

  // mass: GM flag > weight on the sheet > height on the sheet > table by size (see rules/mass.ts).
  // dnd5e keeps weight/height as free text under system.details; field names are checked on the real game
  let override: unknown; try { override = actor.getFlag?.(MOD, "mass"); } catch { /* no flag */ }
  const { mass, source: massSource, note: massNote } = resolveMass({
    override: Number(override) || undefined,
    weightLb: parseWeightLb(sys.details?.weight), heightFt: parseHeightFt(sys.details?.height), size,
  });

  const mod = {} as Record<AbilityKey, number>, save = {} as Record<AbilityKey, number>;
  for (const ab of ABILITIES) { mod[ab] = num(sys.abilities?.[ab]?.mod); save[ab] = saveBonus(actor, ab); }

  const hp = at.hp ?? {};
  return {
    id: String(tok.id), name: String(tok.name ?? actor.name ?? "?"),
    pos: cellOf(scene, num(tok.x), num(tok.y)),
    footprint: Math.max(1, Math.round(num(tok.width, 1))),
    elevation: num(tok.elevation),
    size, mass, massSource, massNote, strScore: Number(sys.abilities?.str?.value) || undefined, speed: num(at.movement?.walk, 30), ac: num(at.ac?.value, 10),
    hp: { value: num(hp.value, 1), max: num(hp.max, num(hp.value, 1)) },
    prof: num(at.prof, 2),
    mod, save, conditions, tags,
  };
}
