// Friction coefficient (mu) of what covers the ground. Key = World.surfaceAt() name, "floor" = bare ground.
export const FRICTION: Record<string, number> = {
  floor: 0.6,
  mud: 0.8,
  water: 0.4,
  oil: 0.1,
  ice: 0.05,
};
export const MIN_MU = 0.02;       // never divide by ~0
