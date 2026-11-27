// Where a creature's mass comes from. First one that exists wins:
//   override (GM flag)  ->  real weight on the sheet  ->  height (cube law)  ->  table by size
import type { MassSource, SizeKey } from "../model/creature";
import { BODY, REF_HUMAN } from "../data/bodies";

export interface MassInput { override?: number; weightLb?: number; heightFt?: number; size: SizeKey }

const good = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;

// same shape at any height: volume (so mass) grows with height cubed
export const massFromHeight = (heightFt: number): number => REF_HUMAN.massLb * (heightFt / REF_HUMAN.heightFt) ** 3;

// a sheet value further than this factor from the table for its size is a typo or a unit mix-up, not a body
const PLAUSIBLE = 6;
const plausible = (mass: number, size: SizeKey) => { const t = BODY[size].massLb; return mass >= t / PLAUSIBLE && mass <= t * PLAUSIBLE; };

// override is the GM's word and is never second-guessed. `note` says why a sheet value was not used.
export function resolveMass(i: MassInput): { mass: number; source: MassSource; note?: string } {
  if (good(i.override)) return { mass: i.override, source: "override" };
  const notes: string[] = [];
  const why = () => (notes.length ? `${notes.join("; ")} จึงไม่ใช้` : undefined);
  if (good(i.weightLb)) {
    if (plausible(i.weightLb, i.size)) return { mass: i.weightLb, source: "weight" };
    notes.push(`น้ำหนักในชีต ${Math.round(i.weightLb * 10) / 10} lb ผิดปกติสำหรับขนาด ${i.size}`);
  }
  if (good(i.heightFt)) {
    const m = massFromHeight(i.heightFt);
    if (plausible(m, i.size)) return { mass: m, source: "height", note: why() };
    notes.push(`ส่วนสูงในชีต ${Math.round(i.heightFt * 100) / 100} ft ผิดปกติสำหรับขนาด ${i.size}`);
  }
  return { mass: BODY[i.size].massLb, source: "size", note: why() };
}

// ---- sheet text -> numbers (dnd5e stores these as free text, so be forgiving)
// "1,200" is twelve hundred, "1,5" is one and a half. "1.200" reads as 1.2 (resolveMass rejects it if absurd).
const NUM = String.raw`(\d{1,3}(?:,\d{3})+(?:\.\d+)?|\d+(?:[.,]\d+)?)`;
const num = (s: string) => Number(/^\d{1,3}(,\d{3})+/.test(s) ? s.replace(/,/g, "") : s.replace(",", "."));
const re = (pattern: string) => new RegExp(pattern.replace(/N/g, NUM));

const WEIGHT_RE = re(String.raw`N\s*(kg|lbs?|pounds?)?`);
const FT_RE = re(String.raw`N\s*(?:'|ft|feet|foot)\s*(?:N\s*(?:"|in|inch|inches)?)?`);
const CM_RE = re(String.raw`N\s*cm`);
const M_RE = re(String.raw`N\s*m\b`);
const IN_RE = re(String.raw`N\s*(?:"|in)`);
const BARE_RE = re(String.raw`^\s*N\s*$`);

export function parseWeightLb(v: unknown): number | undefined {
  if (typeof v === "number") return good(v) ? v : undefined;
  if (v && typeof v === "object") {
    const o = v as { value?: unknown; units?: unknown };
    return parseWeightLb(`${o.value ?? ""} ${o.units ?? ""}`);
  }
  if (typeof v !== "string") return undefined;
  const m = v.toLowerCase().match(WEIGHT_RE);
  if (!m) return undefined;
  const n = num(m[1]) * (m[2] === "kg" ? 2.20462 : 1);
  return good(n) ? n : undefined;
}

export function parseHeightFt(v: unknown): number | undefined {
  if (typeof v === "number") return good(v) ? v : undefined;
  if (v && typeof v === "object") {
    const o = v as { value?: unknown; units?: unknown };
    return parseHeightFt(`${o.value ?? ""} ${o.units ?? ""}`);
  }
  if (typeof v !== "string") return undefined;
  const s = v.toLowerCase();
  let ft: number | undefined;
  let m = s.match(FT_RE);
  if (m) ft = num(m[1]) + (m[2] ? num(m[2]) / 12 : 0);
  else if ((m = s.match(CM_RE))) ft = num(m[1]) / 30.48;
  else if ((m = s.match(M_RE))) ft = num(m[1]) * 3.28084;
  else if ((m = s.match(IN_RE))) ft = num(m[1]) / 12;
  else if ((m = s.match(BARE_RE))) ft = num(m[1]);
  return good(ft) ? ft : undefined;
}
