/* arkane-core 0.10.0 - generated from src/, do not edit by hand */

// src/rules/dice.ts
function pick(rolls, adv) {
  return adv === "adv" ? Math.max(...rolls) : adv === "dis" ? Math.min(...rolls) : rolls[0];
}
function randomDice(rng = Math.random) {
  const die = (sides) => 1 + Math.floor(rng() * sides);
  return {
    d20(adv = "normal") {
      const rolls = adv === "normal" ? [die(20)] : [die(20), die(20)];
      return { rolls, natural: pick(rolls, adv) };
    },
    roll(count, sides) {
      let t = 0;
      for (let i = 0; i < count; i++) t += die(sides);
      return t;
    }
  };
}
function scriptedDice(values) {
  const q = [...values];
  const next = () => {
    const v = q.shift();
    if (v === void 0) throw new Error("scriptedDice: out of values");
    return v;
  };
  return {
    d20(adv = "normal") {
      const rolls = adv === "normal" ? [next()] : [next(), next()];
      return { rolls, natural: pick(rolls, adv) };
    },
    roll(count) {
      let t = 0;
      for (let i = 0; i < count; i++) t += next();
      return t;
    }
  };
}
function recordDice(base) {
  const rolled = [];
  return {
    rolled,
    dice: {
      d20(adv = "normal") {
        const r = base.d20(adv);
        rolled.push(...r.rolls);
        return r;
      },
      roll(count, sides) {
        let t = 0;
        for (let i = 0; i < count; i++) {
          const v = base.roll(1, sides);
          rolled.push(v);
          t += v;
        }
        return t;
      }
    }
  };
}

export {
  randomDice,
  scriptedDice,
  recordDice
};
