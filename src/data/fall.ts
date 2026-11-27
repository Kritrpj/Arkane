// Fall damage table. Change numbers here, not in the rules.
export const FALL = { ftPerDie: 10, sides: 6, maxDice: 20, minImpactFt: 1 } as const;
// minImpactFt: a knock that is worth less than this many feet of falling is not even a bruise (falls themselves stay plain 5e)
