// A plain snapshot of one creature. Built by the Foundry adapter from a dnd5e Actor + token,
// or written by hand in tests. Rules read this and never the Actor itself.
// Numbers that dnd5e already computes (save bonus, mod, proficiency) are copied, not recalculated.
import type { Thing } from "./thing";

export type AbilityKey = "str" | "dex" | "con" | "int" | "wis" | "cha";

// same order as SIZES in scripts/combatx.js, so index comparison keeps working
export const SIZES = ["tiny", "sm", "med", "lg", "huge", "grg"] as const;
export type SizeKey = (typeof SIZES)[number];

// where `mass` came from, so a tester can see "default" vs "read from the sheet"
export type MassSource = "override" | "weight" | "height" | "size";

// optional anatomy: only rules that care about body parts look at it
export interface BodyPart {
  id: string;                                   // "head", "arm-l", "leg-r" ...
  name: string;
  state: "ok" | "injured" | "disabled" | "lost";
}

// id / name / pos / footprint / elevation / mass / tags come from Thing (med footprint = 1, lg = 2 ...)
// mass is in lb: same unit as D&D weight; g is the same everywhere in this game, so no separate "weight"
export interface Creature extends Thing {
  size: SizeKey;
  massSource: MassSource;
  massNote?: string;         // why a sheet weight/height was ignored (shown by inspect)
  strScore?: number;         // the real STR score when known (the mod alone loses odd scores)
  speed: number;             // feet per turn
  ac: number;
  hp: { value: number; max: number };
  prof: number;              // proficiency bonus

  mod: Record<AbilityKey, number>;    // ability modifiers
  save: Record<AbilityKey, number>;   // final saving throw bonuses (proficiency included)

  conditions: string[];      // "prone", "unconscious", "paralyzed" ...

  body?: BodyPart[];
}
