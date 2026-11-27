// The spell effect when a token casts: looked up in the catalog (fx.stages / fx.refs), played with Sequencer (JB2A, BLFX, our own files),
// or drawn as a plain glowing line when Sequencer / the effect is missing. Local to each client, like castIcon (no socket).
// Starts a moment after the cast icon appears, so everyone first sees WHO casts WHAT, then the effect.
import { MOD } from "./snapshot";
import { SPELLS } from "../data/spells";
import { casterKeyOf } from "../data/casters";
import { planFx, describePlan, refName, type FxStep } from "../spells/fxPlan";
import { autoFor } from "../spells/fxAuto";
import { FX_MANIFEST } from "../data/spellFx.generated";
import type { FxRef } from "../spells/types";
import { onCast } from "./castIcon";

const KEY = `${MOD}.castFx`;
const START_DELAY_MS = 600;      // after the icon fades in
const FALLBACK_MS = 900;         // the plain line effect
const MAX_WAIT_MS = 8000;        // never hold a "hit" stage longer than this for a stuck effect

export const castFxEnabled = (): boolean => { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } };
export const setCastFxEnabled = (on: boolean): boolean => { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* ignore */ } return on; };

type Pt = { x: number; y: number };
const hasSeq = (): boolean => typeof Sequence === "function" && !!Sequencer?.Database;
const distFt = (a: any, b: any): number => { const A = ptOf(a), B = ptOf(b); return Math.hypot(A.x - B.x, A.y - B.y) / (canvas.grid?.size || 100) * (canvas.grid?.distance || 5); };
const ptOf = (t: any): Pt => (t?.center ? { x: t.center.x, y: t.center.y } : { x: t.x, y: t.y });

// does this ref exist right now? (seq: in Sequencer's database; file: the file is there; line: always)
const fileOk = new Map<string, boolean>();
async function probe(ref: FxRef): Promise<boolean> {
  if ("line" in ref) return true;
  if (!hasSeq()) return false;
  if ("seq" in ref) return !!Sequencer.Database.entryExists(ref.seq);
  if (!fileOk.has(ref.file)) fileOk.set(ref.file, await (foundry.utils?.srcExists ?? (globalThis as any).srcExists)(ref.file).catch(() => false));
  return fileOk.get(ref.file)!;
}

// ---- the plain fallback (PIXI, like castIcon): a line that flies to the target, or a ring that grows
function drawFallback(style: string, from: any, at: any, colour: string): Promise<void> {
  return new Promise((done) => {
    if (!canvas?.interface || !canvas.app) return done();
    const grid = canvas.grid?.size ?? 100, col = parseInt(String(colour).replace("#", ""), 16) || 0xe8d9a8;
    const B = ptOf(at), A = from ? ptOf(from) : undefined;
    const g = new PIXI.Graphics(); g.eventMode = "none"; g.zIndex = 999; canvas.interface.addChild(g);
    const start = performance.now(), ticker = canvas.app.ticker;
    const tick = () => {
      const t = (performance.now() - start) / FALLBACK_MS;
      if (t >= 1 || g.destroyed) { ticker.remove(tick); if (!g.destroyed) g.destroy(); return done(); }
      g.clear();
      const ring = (p: Pt, u: number, r: number) => { g.lineStyle(3, col, 1 - u); g.beginFill(col, (1 - u) * 0.25); g.drawCircle(p.x, p.y, r * (0.3 + 0.7 * (1 - Math.pow(1 - u, 3)))); g.endFill(); };
      if (A) {
        const u = Math.min(1, t / 0.6), e = 1 - Math.pow(1 - u, 3), head = { x: A.x + (B.x - A.x) * e, y: A.y + (B.y - A.y) * e };
        g.lineStyle(3, col, t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4); g.moveTo(A.x, A.y); g.lineTo(head.x, head.y);
        if (t >= 0.6) ring(B, (t - 0.6) / 0.4, grid * 0.6);
      } else ring(B, t, grid * (style === "at-point" ? 1.6 : 0.8));
    };
    ticker.add(tick);
  });
}

// ---- one effect on one spot, through Sequencer when the ref is a seq/file, else the fallback
async function playOne(step: FxStep, job: { from?: any; at: any }): Promise<void> {
  const ref = step.ref;
  if ("line" in ref) return drawFallback(step.style, job.from, job.at, ref.line);
  const e = new Sequence().effect().file("seq" in ref ? ref.seq : ref.file);
  if (job.from) e.atLocation(job.from).stretchTo(job.at);
  else if (job.at?.document) e.atLocation(job.at).scaleToObject(step.scale ?? 1.5);       // a token
  else e.atLocation(job.at).scale(step.scale ?? 1);                                        // a point
  await e.play();
}

async function playStep(step: FxStep, caster: any, targets: any[]): Promise<void> {
  const mid = targets.length ? { x: targets.reduce((s, t) => s + ptOf(t).x, 0) / targets.length, y: targets.reduce((s, t) => s + ptOf(t).y, 0) / targets.length } : ptOf(caster);
  const jobs: { from?: any; at: any }[] =
    step.style === "projectile" ? targets.map((t) => ({ from: caster, at: t }))
    : step.style === "on-target" ? targets.map((t) => ({ at: t }))
    : step.style === "on-caster" ? [{ at: caster }]
    : [{ at: mid }];                                                                        // at-point: v1 = middle of the targets, else the caster
  await Promise.allSettled(jobs.map((j) => playOne(step, j)));
}

export interface CastInfo { caster?: string; via: string[] }
const viaOf = (item: any): string[] => [item?.system?.method, item?.getFlag?.(MOD, "via")].flat().filter((v) => typeof v === "string" && v);

// plan + play. Returns the plan (or null: spell not in the catalog = no effect)
export async function playCast(token: any, item: any, targets: any[] = []): Promise<FxStep[] | null> {
  if (!token || !item || !canvas?.ready || token.visible === false) return null;
  const caster = casterKeyOf(token.actor?.name ?? token.name);
  const r = SPELLS.resolve(item.name, { caster, via: viaOf(item) });
  if (!r) return null;
  const steps = await planFx(r.spell, probe, autoFor(r.spell, FX_MANIFEST, targets[0] ? distFt(token, targets[0]) : undefined));
  await new Promise((ok) => setTimeout(ok, START_DELAY_MS));
  const pending: Promise<void>[] = [];
  for (const st of steps) {
    if (st.when === "hit") await Promise.race([Promise.allSettled(pending), new Promise((ok) => setTimeout(ok, MAX_WAIT_MS))]);
    pending.push(playStep(st, token, targets).catch((e) => console.warn(MOD, "castFx step", st.style, e)));
  }
  return steps;
}

export function onCastFx(c: { token: any; item: any; targets: any[] }): void {
  if (!castFxEnabled()) return;
  playCast(c.token, c.item, c.targets).catch((e) => console.warn(MOD, "castFx", e));
}
export const registerCastFx = (): void => onCast(onCastFx);

// ---- by hand (console): play / plan / db
const selected = (): any => canvas?.tokens?.controlled?.[0];
export async function playByHand(name: string, caster?: any, targets?: any[]): Promise<FxStep[] | null> {
  const tok = caster ?? selected(); if (!tok) { ui.notifications?.warn("เลือก token ผู้ร่ายก่อน"); return null; }
  return playCast(tok, { name }, targets ?? [...(game.user?.targets ?? [])]);
}
export async function planByHand(name: string, casterKey?: string, via?: string | string[]): Promise<FxStep[] | null> {
  const r = SPELLS.resolve(name, { caster: casterKey, via }); if (!r) { console.log(`ไม่พบสกิล "${name}"`); return null; }
  const steps = await planFx(r.spell, probe, autoFor(r.spell, FX_MANIFEST));
  console.log([`${r.spell.name} (${hasSeq() ? "Sequencer พร้อม" : "ไม่มี Sequencer: ใช้เส้นสำรอง"})`, ...describePlan(steps)].join("\n"));
  return steps;
}
// names under a prefix in Sequencer's database, to copy into fx.refs: castFx.db("jb2a.fire_bolt")
export function dbPaths(prefix = "jb2a"): string[] {
  try { return hasSeq() ? Sequencer.Database.getPathsUnder(prefix) ?? [] : []; } catch { return []; }
}

// every spell in the catalog and what would play for it: which have JB2A (or a scanned file) and which only get the plain line
export async function auditFx(): Promise<void> {
  const rows: Record<string, string>[] = [];
  for (const d of SPELLS.list()) {
    const r = SPELLS.resolve(d.id); if (!r) continue;
    const st = (await planFx(r.spell, probe, autoFor(r.spell, FX_MANIFEST)))[0];
    rows.push({ id: d.id, style: st.style, เล่น: refName(st.ref), ผล: "line" in st.ref ? "✗ เส้นสำรอง" : "✓" });
  }
  console.table(rows);
}
