// A prop's mass: GM override, else density x volume x fill (data/props.ts).
// Unknown material falls back to the default material, so a typo in a flag never breaks a push.
import type { PropMassSource } from "../model/thing";
import { MATERIALS, PROP_DEFAULT } from "../data/props";

export interface PropMassInput {
  override?: number;
  material?: string;
  heightFt?: number;
  footprint: number;        // cells per side
  cellFt: number;
  fill?: number;            // 0..1, replaces the material's default fill
}

const good = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n > 0;

export function resolvePropMass(i: PropMassInput): { mass: number; source: PropMassSource } {
  if (good(i.override)) return { mass: i.override, source: "override" };
  const mat = MATERIALS[i.material ?? ""] ?? MATERIALS[PROP_DEFAULT.material];
  const side = Math.max(1, i.footprint) * i.cellFt;
  const volume = side * side * (good(i.heightFt) ? i.heightFt : PROP_DEFAULT.heightFt);
  const fill = good(i.fill) && i.fill <= 1 ? i.fill : mat.fill;
  return { mass: mat.rho * volume * fill, source: "material" };
}
