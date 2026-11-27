// Body numbers per size. Change numbers here, not in the rules.
//   massLb    : "combat mass" = body + typical gear, used when the actor gives no weight/height
//   forceMult : 5e carrying/pushing rule: Large counts double, Huge x4, Gargantuan x8, Tiny half
import type { SizeKey } from "../model/creature";

export const BODY: Record<SizeKey, { massLb: number; forceMult: number }> = {
  tiny: { massLb: 10, forceMult: 0.5 },
  sm:   { massLb: 60, forceMult: 1 },
  med:  { massLb: 180, forceMult: 1 },
  lg:   { massLb: 900, forceMult: 2 },
  huge: { massLb: 4000, forceMult: 4 },
  grg:  { massLb: 30000, forceMult: 8 },
};

// reference human for the height -> mass cube law: mass = ref.massLb * (height / ref.heightFt)^3
export const REF_HUMAN = { heightFt: 5.8, massLb: 180 } as const;
