// The board as plain data, plus the rulebooks. No DOM here, so tests can use it too.
import type { Creature } from "../src/model/creature";
import type { Prop } from "../src/model/thing";
import { Ruleset } from "../src/rules/ruleset";
import { RulesetPhysics } from "../src/rules/physicsRuleset";
import type { WallSeg } from "../src/world/gridWorld";
import type { Zone } from "../src/model/zone";

export interface Stage {
  cols: number; rows: number;
  walls: WallSeg[];                         // pixels, 100 px per cell (same as the module)
  heights: Record<string, number>;          // "col,row" -> ground height in ft
  surfaces: Record<string, string>;        // "col,row" -> "oil" | "ice" | "mud" | "water"
  creatures: Creature[];
  props: Prop[];
  zones: Zone[];                            // Zone (พิกัดฟุต) ดู src/model/zone.ts
}

export const RULEBOOKS = {
  "2024": { label: "2024 (ผลัก 5 ฟุต)", make: (): Ruleset => new Ruleset() },
  physics: { label: "Physics (ปัดใกล้สุด)", make: (): Ruleset => new RulesetPhysics() },
  "physics-nosize": { label: "Physics (ไม่จำกัดขนาด: น้ำหนัก/แรงเกาะตัดสิน)", make: (): Ruleset => new RulesetPhysics({ sizeRule: false }) },
  "physics-floor": { label: "Physics (ปัดลง floor)", make: (): Ruleset => new RulesetPhysics({ rounding: "floor" }) },
} as const;
export type RulesKey = keyof typeof RULEBOOKS;

export const emptyStage = (o: Partial<Stage> = {}): Stage =>
  ({ cols: 14, rows: 8, walls: [], heights: {}, surfaces: {}, creatures: [], props: [], zones: [], ...o });

export const GRID_PX = 100;
export const cellKey = (col: number, row: number) => `${col},${row}`;
