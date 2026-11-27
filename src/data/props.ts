// Numbers for props (crates, barrels, statues). Balance here, not in the rules.
//   rho  : density of the material in lb per cubic foot (water is 62)
//   fill : how much of the bounding box is really material. A crate or wardrobe is mostly air (0.05),
//          a statue is nearly solid. GM can override per prop with the `fill` flag.
// mass = rho x (footprint x cellFt)^2 x height x fill.  Example: 1 cell, 5 ft tall wooden crate = 40 x 125 x 0.05 = 250 lb
export const MATERIALS: Record<string, { rho: number; fill: number }> = {
  wood:  { rho: 40,  fill: 0.05 },
  stone: { rho: 160, fill: 0.5 },
  iron:  { rho: 490, fill: 0.05 },
  water: { rho: 62,  fill: 0.8 },     // a full cistern / big barrel of water
};

// when a token is marked as a prop but says nothing else
export const PROP_DEFAULT = { material: "wood", heightFt: 5 } as const;
