/* arkane-core 0.10.0 - generated from src/, do not edit by hand */

// src/model/effect.ts
var Fx = {
  log: (text, check) => ({ kind: "log", text, check }),
  push: (target, to) => ({ kind: "push", target, to }),
  prone: (target) => ({ kind: "prone", target }),
  damage: (target, amount, type) => ({ kind: "damage", target, amount, type }),
  spendItem: (owner, itemId, qty = 1) => ({ kind: "spendItem", owner, itemId, qty }),
  spendCost: (actor, cost) => ({ kind: "spendCost", actor, cost })
};

// src/data/surfaces.ts
var FRICTION = {
  floor: 0.6,
  mud: 0.8,
  water: 0.4,
  oil: 0.1,
  ice: 0.05
};
var MIN_MU = 0.02;

export {
  Fx,
  FRICTION,
  MIN_MU
};
