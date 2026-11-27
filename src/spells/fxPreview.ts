// Draws a plan on a plain 2D canvas, for the harness (no Foundry, no Sequencer). It is a PREVIEW:
// a seq/file ref is drawn as a glow in a colour guessed from its name, labelled with the real name, because only Foundry can play the JB2A file itself.
import type { FxRef } from "./types";
import type { FxStep } from "./fxPlan";

export interface Pt { x: number; y: number }
export interface PreviewGeo { caster: Pt; targets: Pt[]; point?: Pt }   // canvas pixels
export const STEP_MS = 900;

const COLOURS: [string, string][] = [["orange", "#ff7a2a"], ["red", "#e5344a"], ["yellow", "#ffd84a"], ["green", "#4cff7a"], ["blue", "#4aa8ff"], ["purple", "#b46aff"], ["pink", "#ff7ad0"], ["white", "#ffffff"], ["fire", "#ff7a2a"], ["lightning", "#9fd8ff"], ["ice", "#bfefff"], ["cold", "#bfefff"], ["necro", "#7aff9a"]];
export function previewColour(ref: FxRef): string {
  if ("line" in ref) return ref.line;
  const name = ("seq" in ref ? ref.seq : ref.file).toLowerCase();
  return COLOURS.find(([k]) => name.includes(k))?.[1] ?? "#e8d9a8";
}

// when each step starts (ms): "cast" steps start together at 0, "hit" steps start after everything before them has finished
export function timeline(steps: FxStep[]): { step: FxStep; start: number }[] {
  let end = 0;
  return steps.map((step) => { const start = step.when === "hit" ? end : 0; end = Math.max(end, start + STEP_MS); return { step, start }; });
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3);
const mix = (a: Pt, b: Pt, t: number): Pt => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
const centroid = (ps: Pt[], d: Pt): Pt => (ps.length ? { x: ps.reduce((s, p) => s + p.x, 0) / ps.length, y: ps.reduce((s, p) => s + p.y, 0) / ps.length } : d);

function ring(g: CanvasRenderingContext2D, at: Pt, t: number, r: number, colour: string) {
  g.globalAlpha = 1 - t; g.strokeStyle = colour; g.fillStyle = colour; g.lineWidth = 3;
  g.beginPath(); g.arc(at.x, at.y, r * (0.3 + 0.7 * ease(t)), 0, Math.PI * 2); g.stroke();
  g.globalAlpha = (1 - t) * 0.25; g.fill();
}

// draw every step that is active at `ms` since the cast
export function drawPreview(g: CanvasRenderingContext2D, steps: FxStep[], geo: PreviewGeo, ms: number, grid = 60): void {
  g.save();
  for (const { step, start } of timeline(steps)) {
    const t = (ms - start) / STEP_MS;
    if (t < 0 || t > 1) continue;
    const c = previewColour(step.ref), k = step.scale ?? 1;
    if (step.style === "projectile") {
      for (const to of geo.targets) {
        const head = mix(geo.caster, to, ease(Math.min(1, t / 0.6)));
        g.globalAlpha = t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4; g.strokeStyle = c; g.lineWidth = 3;
        g.beginPath(); g.moveTo(geo.caster.x, geo.caster.y); g.lineTo(head.x, head.y); g.stroke();
        if (t >= 0.6) ring(g, to, (t - 0.6) / 0.4, grid * 0.6 * k, c);
      }
    } else if (step.style === "on-target") for (const to of geo.targets) ring(g, to, t, grid * 0.8 * k, c);
    else if (step.style === "on-caster") ring(g, geo.caster, t, grid * 0.8 * k, c);
    else ring(g, geo.point ?? centroid(geo.targets, geo.caster), t, grid * 1.6 * k, c);   // at-point
    g.globalAlpha = 1; g.fillStyle = "#ddd"; g.font = "11px monospace";
    g.fillText(("seq" in step.ref ? "JB2A/Sequencer: " + step.ref.seq : "file" in step.ref ? "file: " + step.ref.file : "line"), 8, 14 + 14 * steps.indexOf(step));
  }
  g.restore();
}
