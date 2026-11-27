// Finds JB2A (or any scanned) effect files for a spell by its id, so a spell needs no hand-written ref.
// The manifest comes from tools/scan-fx.mjs (npm run fx): spell id -> { family -> files }.
// A "family" is one effect in one colour (e.g. "firebolt_01_regular_orange"); its files are the same effect made for different ranges (05ft, 15ft, 30ft ...).
import type { FxRef, FxStyle, Spell } from "./types";

export type FxManifest = Record<string, Record<string, string[]>>;
export type Auto = (style: FxStyle) => FxRef[];

const feetOf = (p: string): number => Number(/_(\d+)ft_/i.exec(p)?.[1] ?? 0);   // 0 = not a ranged file
const ranged = (files: string[]): boolean => files.some((f) => feetOf(f) > 0);

// best families first (colour the spell/caster asked for, then ranged for a bolt / not ranged for a burst, then "01 regular"),
// inside a family the smallest range that still reaches the target (else the longest). Up to 3 refs: the first that exists wins.
export function autoRefs(id: string, man: FxManifest, o: { style: FxStyle; color?: string; ft?: number }): FxRef[] {
  const fams = Object.entries(man[id] ?? {});
  if (!fams.length) return [];
  const want = o.color?.toLowerCase();
  const score = ([fam, files]: [string, string[]]): number => {
    const f = fam.toLowerCase();
    return (want && f.split("_").includes(want) ? 100 : 0) + ((o.style === "projectile") === ranged(files) ? 20 : 0) + (f.includes("regular") ? 3 : 0) + (f.includes("01") ? 2 : 0);
  };
  return fams.sort((a, b) => score(b) - score(a)).slice(0, 3).map(([, files]) => {
    const by = [...files].sort((a, b) => feetOf(a) - feetOf(b));
    return { file: by.find((f) => feetOf(f) >= (o.ft ?? 0)) ?? by[by.length - 1] };
  });
}

// spell.fx.color picks the colour (a caster's byCaster can change it); fx.auto === false turns this off for a spell
export const autoFor = (s: Spell, man: FxManifest, ft?: number): Auto => (style) => (s.fx?.auto === false ? [] : autoRefs(s.id, man, { style, color: s.fx?.color, ft }));
