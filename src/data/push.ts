// Numbers for the physics push (RulesetPhysics). Balance here.
export const PUSH = {
  lbPerStr: 30,       // 5e: push/drag/lift = 30 x STR score (lb)
  strokeFt: 1.5,      // how far the target is pushed while the pusher still applies force (arm reach)
  bracing: 5,         // pusher's traction multiplier: leaning/bracing makes grip far better than plain mu x weight
  maxChain: 3,        // how many things in a row a crash can knock into (guards against endless chains)
  g: 32.17,           // ft/s^2, only used for run-ups (v^2 = 2 a d) and the energy of a moving body (E = W v^2 / 2g)
  sprint: 1 / 2,      // top charge speed in ft/s = creature speed (ft per round) x this: speed 30 -> 15 ft/s (about as hard as a STR 16 shove)
  rounding: "nearest" as "nearest" | "floor",
} as const;
