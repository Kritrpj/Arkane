// Dice are injected, never global. Real play uses randomDice(), tests use scriptedDice([...]),
// the harness can force a d20 to preview "what if I roll a 5".
export type Adv = "normal" | "adv" | "dis";
export interface D20Roll { natural: number; rolls: number[] }

export interface Dice {
  d20(adv?: Adv): D20Roll;
  roll(count: number, sides: number): number;     // sum of count dice
}

function pick(rolls: number[], adv: Adv): number {
  return adv === "adv" ? Math.max(...rolls) : adv === "dis" ? Math.min(...rolls) : rolls[0];
}

export function randomDice(rng: () => number = Math.random): Dice {
  const die = (sides: number) => 1 + Math.floor(rng() * sides);
  return {
    d20(adv = "normal") {
      const rolls = adv === "normal" ? [die(20)] : [die(20), die(20)];
      return { rolls, natural: pick(rolls, adv) };
    },
    roll(count, sides) { let t = 0; for (let i = 0; i < count; i++) t += die(sides); return t; },
  };
}

// every die takes the next value from the list (adv/dis d20 takes two). Throws when it runs dry,
// so a test fails loudly if the code rolls more dice than expected.
export function scriptedDice(values: number[]): Dice {
  const q = [...values];
  const next = () => {
    const v = q.shift();
    if (v === undefined) throw new Error("scriptedDice: out of values");
    return v;
  };
  return {
    d20(adv = "normal") {
      const rolls = adv === "normal" ? [next()] : [next(), next()];
      return { rolls, natural: pick(rolls, adv) };
    },
    roll(count) { let t = 0; for (let i = 0; i < count; i++) t += next(); return t; },
  };
}

// Wraps dice and remembers every die rolled, in order. Used when a player must choose AFTER the
// save (push or prone): re-run the action with scriptedDice(rolled) so the same d20 is reused.
export function recordDice(base: Dice): { dice: Dice; rolled: number[] } {
  const rolled: number[] = [];
  return {
    rolled,
    dice: {
      d20(adv = "normal") { const r = base.d20(adv); rolled.push(...r.rolls); return r; },
      roll(count, sides) {
        let t = 0;
        for (let i = 0; i < count; i++) { const v = base.roll(1, sides); rolled.push(v); t += v; }
        return t;
      },
    },
  };
}

// Every die shows the same number: d20 = `d20`, every other die = `die`. For the harness and "what if I roll X" tests.
export function fixedDice(d20: number, die = 3): Dice {
  return {
    d20() { return { natural: d20, rolls: [d20] }; },
    roll(count) { return count * die; },
  };
}
