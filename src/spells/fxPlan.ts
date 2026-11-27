// Turns a resolved spell into the beats to play: for each stage, the first ref that really exists (custom file / JB2A name / line).
// Pure: "does this ref exist?" is passed in, so Foundry (Sequencer) and the harness can answer differently.
import type { Delivery, FxRef, FxStage, FxStyle, Spell } from "./types";
import type { Auto } from "./fxAuto";

export type Probe = (ref: FxRef) => boolean | Promise<boolean>;
export interface FxStep { style: FxStyle; when: "cast" | "hit"; ref: FxRef; scale?: number; tried: string[] }

const DEFAULT_STYLE: Record<Delivery, FxStyle> = { self: "on-caster", target: "projectile", area: "at-point", ray: "projectile", point: "at-point" };
const LAST_RESORT: FxRef = { line: "#e8d9a8" };   // a spell with no usable ref still shows something

export const refName = (r: FxRef): string => ("seq" in r ? `seq:${r.seq}` : "file" in r ? `file:${r.file}` : `line:${r.line}`);

// the spell's stages; a spell without `stages` is one stage made from fx.style / fx.refs (style missing = by delivery)
export function stagesOf(s: Spell): FxStage[] {
  const fx = s.fx ?? {};
  if (fx.stages?.length) return fx.stages.map((st) => ({ ...st, refs: st.refs?.length ? st.refs : fx.refs }));
  return [{ style: fx.style ?? DEFAULT_STYLE[s.delivery], refs: fx.refs, scale: fx.scale }];
}

// refs in order, first one that exists wins (custom before JB2A if that is how the spell lists them). `tried` says why, for explain/harness
// `auto` = files found by scanning JB2A (fxAuto): tried after the spell's own refs, before the plain line
export async function planFx(s: Spell, probe: Probe, auto?: Auto): Promise<FxStep[]> {
  const out: FxStep[] = [];
  for (const st of stagesOf(s)) {
    const tried: string[] = []; let pick: FxRef | undefined;
    const own = st.refs ?? [], refs = [...own.filter((r) => !("line" in r)), ...(auto?.(st.style) ?? []), ...own.filter((r) => "line" in r)];
    for (const r of refs) {
      let ok = false; try { ok = await probe(r); } catch { /* counts as missing */ }
      tried.push(`${refName(r)} ${ok ? "✓" : "✗"}`);
      if (ok) { pick = r; break; }
    }
    out.push({ style: st.style, when: st.when ?? "cast", ref: pick ?? LAST_RESORT, scale: st.scale ?? s.fx?.scale, tried });
  }
  return out;
}

export const describePlan = (steps: FxStep[]): string[] =>
  steps.map((s, i) => `${i + 1}. ${s.when} · ${s.style} → ${refName(s.ref)}${s.tried.length ? `   (ลอง: ${s.tried.join(", ")})` : "   (ไม่มี refs ใช้เส้นสำรอง)"}`);
