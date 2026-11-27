// Work-energy maths for a push. Pure numbers in, numbers out (lb, ft, ft-lb). No creatures, no grid.
//
// The pusher applies force F over a stroke of s ft against friction mu*W (W = weight of the target).
// While pushed it moves s. Energy at release: (F - muW) * s, then it slides E / muW = s * (F/muW - 1) more.
//   total distance from where it stood:  d = s + s * (F/muW - 1) = s * F / muW
//   F <= muW: it does not budge at all (0), so a statue needs no special rule.
export interface Slide { forceLb: number; weightLb: number; mu: number; strokeFt: number }

const drag = (s: Slide) => s.mu * s.weightLb;

export function pushDistanceFt(s: Slide): number {
  const f = drag(s);
  return s.forceLb <= f || f <= 0 ? 0 : (s.strokeFt * s.forceLb) / f;
}

// energy (ft-lb) the target still has after travelling x ft FROM ITS START, i.e. what it hits a wall with
export function energyLeft(s: Slide, x: number): number {
  const f = drag(s), net = s.forceLb - f;
  if (net <= 0 || x <= 0) return 0;
  if (x <= s.strokeFt) return net * x;                    // still being pushed
  return Math.max(0, net * s.strokeFt - f * (x - s.strokeFt));   // sliding
}

// "it hits as hard as falling this many feet": E = W*h  ->  h = E / W
export const impactHeightFt = (energy: number, weightLb: number): number => (weightLb > 0 ? energy / weightLb : 0);

// ---- collision with another body (inelastic: they leave together)
// A mover of mass m1 carrying energy E hits a body of mass m2. Momentum is conserved and both end up moving at one speed, so
//   energy left for the pair      = E * m1 / (m1 + m2)
//   energy lost (crunch, damage)  = E * m2 / (m1 + m2)     <- a light thing hitting a heavy one loses almost everything
// Who takes the lost energy? The lighter body gives way more, so the struck body takes the share m1 / (m1 + m2)
// and the mover takes m2 / (m1 + m2). That choice makes the heavy-struck limit equal the wall case: as m2 grows,
// the mover takes all of E, so hitting a statue hurts like hitting a wall (a wall is just m2 = infinity).
// Each part becomes "falling height" (h = energy / own weight) so the fall table gives the damage.
// The pair then slides on until friction (mu x total weight) eats what is left.
//   rest  : energy (ft-lb) the pair still has right after the crash
//   drag  : friction force (lb) on the pair, so after sliding x ft the energy left is rest - drag * x
export interface Collision { moverFt: number; struckFt: number; slideFt: number; rest: number; drag: number }

export const NO_CRASH: Collision = { moverFt: 0, struckFt: 0, slideFt: 0, rest: 0, drag: 0 };

export function collide(energy: number, moverMass: number, struckMass: number, mu: number): Collision {
  if (energy <= 0 || moverMass <= 0) return NO_CRASH;
  if (!Number.isFinite(struckMass)) return { ...NO_CRASH, moverFt: impactHeightFt(energy, moverMass) };
  const total = moverMass + struckMass;
  const lost = (energy * struckMass) / total, rest = (energy * moverMass) / total;
  const drag = mu * total;
  return {
    moverFt: impactHeightFt((lost * struckMass) / total, moverMass),
    struckFt: impactHeightFt((lost * moverMass) / total, struckMass),
    slideFt: drag > 0 ? rest / drag : 0, rest, drag,
  };
}
