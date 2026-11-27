import type { SpellDef } from "./types";
// Identity helper: gives autocomplete and type errors while writing a spell. `spell({ id: ..., ... })`
export const spell = (d: SpellDef): SpellDef => d;
