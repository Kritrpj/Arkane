/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  FRICTION,
  Fx,
  MIN_MU
} from "./chunk-HNCV3QLI.js";
import {
  BODY,
  MOD,
  SIZES,
  SOCK,
  topLeftOf
} from "./chunk-VELQ4LWX.js";
import {
  AUTO_FAIL_STR_DEX,
  CANT_ACT
} from "./chunk-H7JZCNPB.js";

// src/rules/physics.ts
var drag = (s) => s.mu * s.weightLb;
function pushDistanceFt(s) {
  const f = drag(s);
  return s.forceLb <= f || f <= 0 ? 0 : s.strokeFt * s.forceLb / f;
}
function energyLeft(s, x) {
  const f = drag(s), net = s.forceLb - f;
  if (net <= 0 || x <= 0) return 0;
  if (x <= s.strokeFt) return net * x;
  return Math.max(0, net * s.strokeFt - f * (x - s.strokeFt));
}
var impactHeightFt = (energy, weightLb) => weightLb > 0 ? energy / weightLb : 0;
var NO_CRASH = { moverFt: 0, struckFt: 0, slideFt: 0, rest: 0, drag: 0 };
function collide(energy, moverMass, struckMass, mu) {
  if (energy <= 0 || moverMass <= 0) return NO_CRASH;
  if (!Number.isFinite(struckMass)) return { ...NO_CRASH, moverFt: impactHeightFt(energy, moverMass) };
  const total = moverMass + struckMass;
  const lost = energy * struckMass / total, rest = energy * moverMass / total;
  const drag2 = mu * total;
  return {
    moverFt: impactHeightFt(lost * struckMass / total, moverMass),
    struckFt: impactHeightFt(lost * moverMass / total, struckMass),
    slideFt: drag2 > 0 ? rest / drag2 : 0,
    rest,
    drag: drag2
  };
}

// src/rules/check.ts
var sum = (parts2) => parts2.reduce((n, p) => n + p.value, 0);
function rollSave(i, dice) {
  const dc = sum(i.dcParts);
  if (i.autoFail) {
    return {
      ok: false,
      total: 0,
      dc,
      natural: 0,
      crit: false,
      fumble: false,
      dcParts: i.dcParts,
      roll: [{ label: `\u0E25\u0E49\u0E21\u0E40\u0E2B\u0E25\u0E27\u0E2D\u0E31\u0E15\u0E42\u0E19\u0E21\u0E31\u0E15\u0E34 (${i.autoFail})`, value: 0 }]
    };
  }
  const r = dice.d20(i.adv);
  const roll = [
    { label: i.adv === "normal" ? "d20" : `d20 (${i.adv})`, value: r.natural },
    { label: i.label, value: i.bonus }
  ];
  const total = sum(roll);
  return { ok: total >= dc, total, dc, natural: r.natural, crit: false, fumble: false, roll, dcParts: i.dcParts };
}
var parts = (p) => p.map((x) => `${x.label} ${x.value}`).join(" + ");
var formatCheck = (c) => `${parts(c.roll)} = ${c.total} vs DC ${c.dc} (${parts(c.dcParts)})`;

// src/rules/size.ts
var Size = {
  index: (s) => SIZES.indexOf(s)
};

// src/data/fall.ts
var FALL = { ftPerDie: 10, sides: 6, maxDice: 20, minImpactFt: 1 };

// src/rules/ruleset.ts
var Ruleset = class {
  name = "D&D 2024";
  // what an action costs to use
  costOf(_actionId) {
    return "action";
  }
  canAct(c) {
    return c.hp.value > 0 && !c.conditions.some((x) => CANT_ACT.includes(x));
  }
  // ---- shove
  shoveDC(actor) {
    return [{ label: "base", value: 8 }, { label: "STR", value: actor.mod.str }, { label: "prof", value: actor.prof }];
  }
  // the target resists with its better save (ties go to STR)
  shoveSaveAbility(target) {
    return target.save.str >= target.save.dex ? "str" : "dex";
  }
  // target may be at most one size larger
  canShoveSize(actor, target) {
    return Size.index(target.size) <= Size.index(actor.size) + 1;
  }
  pushFt(_actor, _target, _ground) {
    return 5;
  }
  // feet -> whole cells the push will try. The base rulebook moves exactly 1 cell, so floor is enough here
  cellsFor(ft, cellFt) {
    return Math.floor(ft / cellFt + 1e-9);
  }
  // how hard the target hits a wall, as "feet of falling" (fed to fall()). 2024 has no collision damage
  impactFt(_actor, _target, _travelledFt, _ground) {
    return 0;
  }
  // energy (ft-lb) the target still carries after being pushed `travelledFt`. 2024 has none, so nothing it hits gets hurt
  pushEnergy(_actor, _target, _travelledFt, _ground) {
    return 0;
  }
  // the target slams into another creature or prop. 2024: it just stops, no damage, nothing is carried along
  // (damage is in "feet of falling" for each side, slideFt = how far the pair keeps going together;
  // rest/drag let a chain track the energy left)
  collide(_energy, _mover, _struck, _surface) {
    return NO_CRASH;
  }
  // energy (ft-lb) a creature carries into whatever it hits after running `runFt` in a straight line. 2024 has no charge damage
  runEnergy(_actor, _runFt, _ground) {
    return 0;
  }
  explainRun(_actor, _runFt, _ground) {
    return ["\u0E01\u0E0E 2024: \u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19\u0E44\u0E21\u0E48\u0E21\u0E35\u0E41\u0E23\u0E07\u0E01\u0E23\u0E30\u0E41\u0E17\u0E01 \u0E41\u0E04\u0E48\u0E27\u0E34\u0E48\u0E07\u0E44\u0E1B\u0E16\u0E36\u0E07\u0E15\u0E31\u0E27\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22"];
  }
  // can something be shoved along by a collision? (props tagged "immovable" never)
  canMove(t) {
    return !t.tags.includes("immovable");
  }
  // ---- explanations for the sidebar / tests: the same numbers the rules use, written out
  explainPush(_actor, _target, _ground) {
    return ["\u0E01\u0E0E 2024: \u0E1C\u0E25\u0E31\u0E01 5 \u0E1F\u0E38\u0E15 (1 \u0E0A\u0E48\u0E2D\u0E07) \u0E40\u0E2A\u0E21\u0E2D \u0E44\u0E21\u0E48\u0E02\u0E36\u0E49\u0E19\u0E01\u0E31\u0E1A\u0E41\u0E23\u0E07\u0E2B\u0E23\u0E37\u0E2D\u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01"];
  }
  roundingNote() {
    return "\u0E1B\u0E31\u0E14\u0E25\u0E07 (floor)";
  }
  // ---- saves
  advantage(c, ability) {
    return ability === "dex" && c.conditions.includes("restrained") ? "dis" : "normal";
  }
  autoFail(c, ability) {
    return ability === "str" || ability === "dex" ? c.conditions.find((x) => AUTO_FAIL_STR_DEX.includes(x)) : void 0;
  }
  save(target, ability, dcParts, dice) {
    return rollSave({
      label: `${ability.toUpperCase()} save`,
      bonus: target.save[ability],
      adv: this.advantage(target, ability),
      autoFail: this.autoFail(target, ability),
      dcParts
    }, dice);
  }
  // ---- falling
  // damage of a knock (crash into a body or a wall), from its "feet of falling" h. Unlike a fall (plain 5e, 1d6 per whole 10 ft)
  // an impact is smooth: whole dice for every 10 ft plus the leftover as a fraction of one die, so a small knock still bruises.
  //   exact = h / 10 ft   dice = floor(exact)   frac = exact - dice
  bruise(h) {
    const exact = Math.max(0, h) / FALL.ftPerDie;
    if (h < FALL.minImpactFt) return { dice: 0, sides: FALL.sides, frac: 0, exact };
    const dice = Math.min(FALL.maxDice, Math.floor(exact));
    return { dice, sides: FALL.sides, frac: dice >= FALL.maxDice ? 0 : exact - dice, exact };
  }
  // the sentences the harness shows under "how is damage worked out" (numbers come from data/, so they never go stale)
  explainDamage() {
    return [`\u0E01\u0E0E ${this.name}: \u0E01\u0E32\u0E23\u0E1C\u0E25\u0E31\u0E01/\u0E0A\u0E19\u0E44\u0E21\u0E48\u0E17\u0E33\u0E14\u0E32\u0E40\u0E21\u0E08 (\u0E21\u0E35\u0E41\u0E04\u0E48\u0E15\u0E01\u0E02\u0E2D\u0E1A ${FALL.sides === 6 ? "1d6" : `1d${FALL.sides}`} \u0E15\u0E48\u0E2D ${FALL.ftPerDie} \u0E1F\u0E38\u0E15 \u0E1B\u0E31\u0E14\u0E25\u0E07)`];
  }
  fall(dropFt) {
    return { dice: Math.min(FALL.maxDice, Math.floor(dropFt / FALL.ftPerDie)), sides: FALL.sides };
  }
};

// src/data/push.ts
var PUSH = {
  lbPerStr: 30,
  // 5e: push/drag/lift = 30 x STR score (lb)
  strokeFt: 1.5,
  // how far the target is pushed while the pusher still applies force (arm reach)
  bracing: 5,
  // pusher's traction multiplier: leaning/bracing makes grip far better than plain mu x weight
  maxChain: 3,
  // how many things in a row a crash can knock into (guards against endless chains)
  g: 32.17,
  // ft/s^2, only used for run-ups (v^2 = 2 a d) and the energy of a moving body (E = W v^2 / 2g)
  sprint: 1 / 2,
  // top charge speed in ft/s = creature speed (ft per round) x this: speed 30 -> 15 ft/s (about as hard as a STR 16 shove)
  rounding: "nearest"
};

// src/rules/fmt.ts
var n1 = (x) => String(Math.round(x * 10) / 10);
var n2 = (x) => String(Math.round(x * 100) / 100);

// src/rules/physicsRuleset.ts
var RulesetPhysics = class extends Ruleset {
  name = "D&D 2024 + physics";
  opt;
  constructor(o = {}) {
    super();
    this.opt = { rounding: PUSH.rounding, sizeRule: true, strokeFt: PUSH.strokeFt, bracing: PUSH.bracing, ...o };
  }
  canShoveSize(actor, target) {
    return !this.opt.sizeRule || super.canShoveSize(actor, target);
  }
  // the real STR score when the adapter knows it; otherwise 10 + 2 x mod (odd scores round down)
  strScore(c) {
    return Math.max(1, c.strScore ?? 10 + 2 * c.mod.str);
  }
  pushForce(c) {
    return PUSH.lbPerStr * this.strScore(c) * BODY[c.size].forceMult;
  }
  friction(surface) {
    return Math.max(MIN_MU, FRICTION[surface ?? "floor"] ?? FRICTION.floor);
  }
  // the most force feet can transmit: mu x weight x bracing. Oil under the pusher -> almost nothing
  tractionLimit(c, surface) {
    return this.friction(surface) * this.opt.bracing * c.mass;
  }
  slide(actor, target, g = {}) {
    return {
      forceLb: Math.min(this.pushForce(actor), this.tractionLimit(actor, g.actor)),
      weightLb: target.mass,
      mu: this.friction(g.target),
      strokeFt: this.opt.strokeFt
    };
  }
  pushFt(actor, target, g) {
    return pushDistanceFt(this.slide(actor, target, g));
  }
  roundingNote() {
    return this.opt.rounding === "floor" ? "\u0E1B\u0E31\u0E14\u0E25\u0E07 (floor)" : "\u0E1B\u0E31\u0E14\u0E43\u0E01\u0E25\u0E49\u0E2A\u0E38\u0E14 (\u0E04\u0E23\u0E36\u0E48\u0E07\u0E0A\u0E48\u0E2D\u0E07\u0E1E\u0E2D\u0E14\u0E35\u0E1B\u0E31\u0E14\u0E25\u0E07)";
  }
  explainPush(actor, target, g = {}) {
    const score = this.strScore(actor), mult = BODY[actor.size].forceMult;
    const force = this.pushForce(actor), grip = this.tractionLimit(actor, g.actor), used = Math.min(force, grip);
    const muT = this.friction(g.target), drag2 = muT * target.mass;
    const out = [
      `\u0E41\u0E23\u0E07\u0E1C\u0E25\u0E31\u0E01 F = ${PUSH.lbPerStr} \xD7 STR ${score} \xD7 \u0E15\u0E31\u0E27\u0E04\u0E39\u0E13\u0E02\u0E19\u0E32\u0E14 (${actor.size}) ${mult} = ${n1(force)} lb`,
      `traction \u0E1C\u0E39\u0E49\u0E1C\u0E25\u0E31\u0E01 = \u03BC ${this.friction(g.actor)} (${g.actor ?? "\u0E1E\u0E37\u0E49\u0E19\u0E1B\u0E01\u0E15\u0E34"}) \xD7 bracing ${this.opt.bracing} \xD7 \u0E21\u0E27\u0E25 ${n1(actor.mass)} lb = ${n1(grip)} lb${grip < force ? "  \u2190 \u0E08\u0E33\u0E01\u0E31\u0E14\u0E41\u0E23\u0E07" : ""}`,
      `\u0E41\u0E23\u0E07\u0E17\u0E35\u0E48\u0E2A\u0E48\u0E07\u0E44\u0E14\u0E49\u0E08\u0E23\u0E34\u0E07 = min(${n1(force)}, ${n1(grip)}) = ${n1(used)} lb`,
      `\u0E41\u0E23\u0E07\u0E40\u0E2A\u0E35\u0E22\u0E14\u0E17\u0E32\u0E19\u0E02\u0E2D\u0E07\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 \u03BCW = ${muT} (${g.target ?? "\u0E1E\u0E37\u0E49\u0E19\u0E1B\u0E01\u0E15\u0E34"}) \xD7 ${n1(target.mass)} lb = ${n1(drag2)} lb`
    ];
    out.push(used <= drag2 ? `F \u2264 \u03BCW \u2192 \u0E02\u0E22\u0E31\u0E1A\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E23\u0E30\u0E22\u0E30 0` : `\u0E23\u0E30\u0E22\u0E30\u0E23\u0E27\u0E21 d = s \xD7 F/(\u03BCW) = ${this.opt.strokeFt} \xD7 ${n1(used)}/${n1(drag2)} = ${n1(this.pushFt(actor, target, g))} \u0E1F\u0E38\u0E15`);
    return out;
  }
  cellsFor(ft, cellFt) {
    const n = ft / cellFt;
    return Math.max(0, this.opt.rounding === "floor" ? Math.floor(n + 1e-9) : Math.ceil(n - 0.5 - 1e-9));
  }
  pushEnergy(actor, target, travelledFt, g) {
    return energyLeft(this.slide(actor, target, g), travelledFt);
  }
  impactFt(actor, target, travelledFt, g) {
    return impactHeightFt(this.pushEnergy(actor, target, travelledFt, g), target.mass);
  }
  // a runner is limited by grip, not strength: a = mu x g, until it hits its top speed. E = W v^2 / 2g
  runSpeed(actor, runFt, g) {
    const a = this.friction(g?.actor) * PUSH.g, vmax = actor.speed * PUSH.sprint;
    return { a, vmax, v: Math.min(Math.sqrt(2 * a * Math.max(0, runFt)), vmax) };
  }
  runEnergy(actor, runFt, g) {
    const { v } = this.runSpeed(actor, runFt, g);
    return actor.mass * v * v / (2 * PUSH.g);
  }
  explainRun(actor, runFt, g) {
    const { a, vmax, v } = this.runSpeed(actor, runFt, g), mu = this.friction(g?.actor);
    return [
      `\u0E27\u0E34\u0E48\u0E07\u0E40\u0E23\u0E48\u0E07\u0E14\u0E49\u0E27\u0E22\u0E41\u0E23\u0E07\u0E40\u0E01\u0E32\u0E30\u0E1E\u0E37\u0E49\u0E19: a = \u03BC\xD7g = ${n1(mu)}\xD7${PUSH.g} = ${n1(a)} ft/s\xB2 (\u0E1E\u0E37\u0E49\u0E19${g?.actor ?? "\u0E1B\u0E01\u0E15\u0E34"})`,
      `\u0E04\u0E27\u0E32\u0E21\u0E40\u0E23\u0E47\u0E27\u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 = speed ${actor.speed} ft \xD7 ${n1(PUSH.sprint)} = ${n1(vmax)} ft/s; \u0E27\u0E34\u0E48\u0E07 ${n1(runFt)} \u0E1F\u0E38\u0E15 \u0E44\u0E14\u0E49 v = min(\u221A(2ad), \u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14) = ${n1(v)} ft/s`,
      `\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19 E = \u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 ${n1(actor.mass)} lb \xD7 v\xB2 \xF7 2g = ${n1(actor.mass * v * v / (2 * PUSH.g))} ft-lb`
    ];
  }
  explainDamage() {
    const d = `d${FALL.sides}`;
    return [
      "1) \u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E15\u0E2D\u0E19\u0E0A\u0E19 E (ft-lb): \u0E1C\u0E25\u0E31\u0E01 = (\u0E41\u0E23\u0E07\u0E1C\u0E25\u0E31\u0E01 \u2212 \u0E41\u0E23\u0E07\u0E40\u0E2A\u0E35\u0E22\u0E14\u0E17\u0E32\u0E19) \xD7 \u0E23\u0E30\u0E22\u0E30\u0E17\u0E35\u0E48\u0E22\u0E31\u0E07\u0E1C\u0E25\u0E31\u0E01\u0E2D\u0E22\u0E39\u0E48 \u0E41\u0E25\u0E49\u0E27\u0E04\u0E48\u0E2D\u0E22 \u0E46 \u0E2B\u0E21\u0E14\u0E44\u0E1B\u0E40\u0E1E\u0E23\u0E32\u0E30\u0E40\u0E2A\u0E35\u0E22\u0E14\u0E17\u0E32\u0E19; \u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19 = \u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 \xD7 v\xB2 \xF7 2g",
      "2) \u0E0A\u0E19\u0E04\u0E19\u0E2B\u0E23\u0E37\u0E2D\u0E02\u0E2D\u0E07 (\u0E0A\u0E19\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E22\u0E37\u0E14\u0E2B\u0E22\u0E38\u0E48\u0E19): \u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E40\u0E2A\u0E35\u0E22\u0E44\u0E1B = E \xD7 m\u2082 \xF7 (m\u2081 + m\u2082) \u0E15\u0E31\u0E27\u0E17\u0E35\u0E48\u0E0A\u0E19\u0E41\u0E25\u0E30\u0E15\u0E31\u0E27\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E0A\u0E19\u0E41\u0E1A\u0E48\u0E07\u0E01\u0E31\u0E19 \u0E15\u0E31\u0E27\u0E40\u0E1A\u0E32\u0E44\u0E14\u0E49\u0E2A\u0E48\u0E27\u0E19\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32 (\u0E15\u0E31\u0E27\u0E17\u0E35\u0E48\u0E0A\u0E19\u0E23\u0E31\u0E1A m\u2082/(m\u2081+m\u2082), \u0E15\u0E31\u0E27\u0E17\u0E35\u0E48\u0E16\u0E39\u0E01\u0E0A\u0E19\u0E23\u0E31\u0E1A m\u2081/(m\u2081+m\u2082)); \u0E17\u0E35\u0E48\u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E1E\u0E32\u0E01\u0E31\u0E19\u0E44\u0E16\u0E25\u0E15\u0E48\u0E2D",
      "3) \u0E0A\u0E19\u0E01\u0E33\u0E41\u0E1E\u0E07: \u0E40\u0E08\u0E47\u0E1A\u0E40\u0E15\u0E47\u0E21 E (\u0E01\u0E33\u0E41\u0E1E\u0E07\u0E40\u0E2B\u0E21\u0E37\u0E2D\u0E19\u0E21\u0E27\u0E25\u0E2D\u0E19\u0E31\u0E19\u0E15\u0E4C)",
      "4) \u0E41\u0E1B\u0E25\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E39\u0E07\u0E17\u0E35\u0E48\u0E15\u0E01: h = \u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E02\u0E2D\u0E07\u0E1D\u0E48\u0E32\u0E22\u0E19\u0E31\u0E49\u0E19 \xF7 \u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01\u0E15\u0E31\u0E27\u0E40\u0E2D\u0E07 (ft)",
      `5) \u0E14\u0E32\u0E40\u0E21\u0E08: n = h \xF7 ${FALL.ftPerDie} \u0E1F\u0E38\u0E15; \u0E17\u0E2D\u0E22 \u230An\u230B${d} \u0E1A\u0E27\u0E01\u0E40\u0E28\u0E29 (n \u2212 \u230An\u230B) \u0E02\u0E2D\u0E07 1${d} (\u0E17\u0E2D\u0E22 1${d} \u0E04\u0E39\u0E13\u0E40\u0E28\u0E29 \u0E1B\u0E31\u0E14\u0E40\u0E1B\u0E47\u0E19\u0E40\u0E25\u0E02\u0E40\u0E15\u0E47\u0E21 \u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 1); h \u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32 ${FALL.minImpactFt} \u0E1F\u0E38\u0E15 = \u0E44\u0E21\u0E48\u0E40\u0E08\u0E47\u0E1A; \u0E2A\u0E39\u0E07\u0E2A\u0E38\u0E14 ${FALL.maxDice}${d}`,
      `6) \u0E15\u0E01\u0E02\u0E2D\u0E1A\u0E40\u0E1B\u0E47\u0E19\u0E01\u0E0E 5e \u0E15\u0E23\u0E07 \u0E46: ${FALL.sides === 6 ? "1d6" : `1d${FALL.sides}`} \u0E15\u0E48\u0E2D ${FALL.ftPerDie} \u0E1F\u0E38\u0E15\u0E40\u0E15\u0E47\u0E21 (\u0E1B\u0E31\u0E14\u0E25\u0E07 \u0E44\u0E21\u0E48\u0E21\u0E35\u0E40\u0E28\u0E29) \u0E41\u0E25\u0E49\u0E27\u0E25\u0E49\u0E21`
    ];
  }
  collide(energy, mover, struck, surface) {
    const m2 = this.canMove(struck) ? struck.mass : Infinity;
    return collide(energy, mover.mass, m2, this.friction(surface));
  }
};

// src/foundry/apply.ts
var esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
var NEEDS_GM = /* @__PURE__ */ new Set(["push", "prone", "damage", "spendItem"]);
async function say(e, speaker) {
  const check = e.check ? `<small>${esc(formatCheck(e.check))}</small>` : "";
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ token: speaker }),
    content: `<div class="rw-card">${esc(e.text)}${check}</div>`
  });
}
async function applyEffects(effects, sceneId, speaker) {
  for (const e of effects) if (e.kind === "log") await say(e, speaker);
  const remote = effects.filter((e) => NEEDS_GM.has(e.kind));
  if (!remote.length) return;
  const msg = { t: "c-fx", scene: sceneId, effects: remote };
  if (game.user.isGM) return gmApply(msg);
  if (!game.users.activeGM) {
    ui.notifications.warn("\u0E44\u0E21\u0E48\u0E21\u0E35 GM \u0E2D\u0E2D\u0E19\u0E44\u0E25\u0E19\u0E4C \u0E08\u0E36\u0E07\u0E1C\u0E25\u0E31\u0E01/\u0E17\u0E33\u0E14\u0E32\u0E40\u0E21\u0E08\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E25\u0E2D\u0E07\u0E1A\u0E2D\u0E01 DM \u0E43\u0E2B\u0E49\u0E40\u0E02\u0E49\u0E32\u0E40\u0E01\u0E21");
    return;
  }
  game.socket.emit(SOCK, msg);
}
async function gmApply(msg) {
  const scene = game.scenes.get(msg.scene);
  if (!scene) return;
  const s = scene.grid?.size || 100, d = scene.dimensions ?? {};
  const cols = Number.isFinite(d.sceneWidth) ? Math.floor(d.sceneWidth / s) : Infinity;
  const rows = Number.isFinite(d.sceneHeight) ? Math.floor(d.sceneHeight / s) : Infinity;
  for (const e of msg.effects ?? []) {
    try {
      const tok = scene.tokens.get(e.target ?? e.owner);
      if (!tok) continue;
      if (e.kind === "push") {
        const { col, row } = e.to ?? {};
        if (!Number.isInteger(col) || !Number.isInteger(row) || col < 0 || row < 0 || col >= cols || row >= rows) continue;
        await tok.update(topLeftOf(scene, { col, row }), { arkaneInternal: true, animate: true });
      } else if (e.kind === "prone") {
        await tok.actor?.toggleStatusEffect?.("prone", { active: true });
      } else if (e.kind === "damage") {
        if (!(e.amount > 0) || !tok.actor) continue;
        try {
          await tok.actor.applyDamage([{ value: e.amount, type: e.type || "bludgeoning" }]);
        } catch {
          await tok.actor.applyDamage(e.amount);
        }
      } else if (e.kind === "spendItem") {
        const it = tok.actor?.items?.get(e.itemId);
        if (!it) continue;
        const left = (Number(it.system?.quantity) || 1) - Math.max(1, e.qty | 0);
        if (left > 0) await it.update({ "system.quantity": left });
        else await it.delete();
      }
    } catch (err) {
      console.warn(MOD, "core effect", e.kind, err);
    }
  }
}

// src/foundry/rules.ts
var ruleset = new Ruleset();
var setRuleset = (r) => {
  ruleset = r;
};
var currentRules = () => ruleset;
var RULEBOOKS = { "2024": () => new Ruleset(), physics: () => new RulesetPhysics() };
function useRules(name) {
  const make = RULEBOOKS[name];
  if (!make) {
    ui.notifications.warn(`\u0E44\u0E21\u0E48\u0E21\u0E35\u0E0A\u0E38\u0E14\u0E01\u0E0E "${name}" (\u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49: ${Object.keys(RULEBOOKS).join(", ")})`);
    return ruleset.name;
  }
  ruleset = make();
  return ruleset.name;
}

// src/rules/reach.ts
function cellsOf(c, at = c.pos) {
  const out = [];
  for (let r = 0; r < c.footprint; r++)
    for (let k = 0; k < c.footprint; k++) out.push({ col: at.col + k, row: at.row + r });
  return out;
}
function gap(a, b) {
  const dx = Math.max(a.pos.col - (b.pos.col + b.footprint), b.pos.col - (a.pos.col + a.footprint), 0);
  const dy = Math.max(a.pos.row - (b.pos.row + b.footprint), b.pos.row - (a.pos.row + a.footprint), 0);
  return Math.max(dx, dy);
}
function awayFrom(a, b) {
  const ax = a.pos.col + a.footprint / 2, ay = a.pos.row + a.footprint / 2;
  const bx = b.pos.col + b.footprint / 2, by = b.pos.row + b.footprint / 2;
  const len = Math.hypot(bx - ax, by - ay) || 1;
  return { col: Math.round((bx - ax) / len) || 0, row: Math.round((by - ay) / len) || 0 };
}

// src/rules/push.ts
function resolvePush(world, target, step, cells, ignore = []) {
  let pos = target.pos, moved = 0, stopped = null, hit;
  const free = (t) => !t || t.id === target.id || ignore.includes(t.id);
  for (let i = 0; i < cells; i++) {
    const next = { col: pos.col + step.col, row: pos.row + step.row };
    const from = cellsOf(target, pos), to = cellsOf(target, next);
    if (from.some((c, k) => world.blocked(c, to[k]))) {
      stopped = "wall";
      break;
    }
    const crea = to.map((c) => world.occupant(c)).find((o) => !free(o));
    if (crea) {
      stopped = "creature";
      hit = crea;
      break;
    }
    const prop = to.map((c) => world.propAt(c)).find((o) => !free(o));
    if (prop) {
      stopped = "prop";
      hit = prop;
      break;
    }
    pos = next;
    moved++;
  }
  const flying = target.tags.includes("flying");
  const dropFt = moved > 0 && !flying ? Math.max(0, world.heightAt(target.pos) - world.heightAt(pos)) : 0;
  return { to: pos, moved, stopped, hit, dropFt, surface: moved > 0 ? world.surfaceAt(pos) : void 0 };
}

// src/rules/chain.ts
function runCrash(world, rules, c, trace = () => {
}) {
  const cellFt = world.cellFt, step = c.step, target = c.front;
  let energy = c.energy;
  let mass = target.mass, front = target, hit = c.hit;
  const out = { bumps: [], hurt: [], extra: [], shift: 0, ids: [target.id] };
  const slid = [];
  for (let depth = 0; hit && depth < PUSH.maxChain; depth++) {
    const col = rules.collide(energy, { ...front, mass }, hit, world.surfaceAt(hit.pos));
    if (col.moverFt <= 0 && col.struckFt <= 0 && col.slideFt <= 0) {
      trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E04\u0E23\u0E31\u0E49\u0E07\u0E17\u0E35\u0E48 ${depth + 1}: ${front.name} \u0E0A\u0E19 ${hit.name} \u0E41\u0E15\u0E48\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E40\u0E2B\u0E25\u0E37\u0E2D ${n1(energy)} ft-lb \u0E44\u0E21\u0E48\u0E1E\u0E2D\u0E17\u0E33\u0E2D\u0E30\u0E44\u0E23`);
      break;
    }
    const lost = energy - col.rest, movable = rules.canMove(hit);
    trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E04\u0E23\u0E31\u0E49\u0E07\u0E17\u0E35\u0E48 ${depth + 1}: ${front.name} (\u0E02\u0E1A\u0E27\u0E19\u0E21\u0E27\u0E25\u0E23\u0E27\u0E21 ${n1(mass)} lb, \u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19 E = ${n1(energy)} ft-lb) \u0E0A\u0E19 ${hit.name} (${movable ? `${n1(hit.mass)} lb` : "\u0E15\u0E23\u0E36\u0E07 = \u0E40\u0E2B\u0E21\u0E37\u0E2D\u0E19\u0E01\u0E33\u0E41\u0E1E\u0E07"})`);
    if (movable) trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E0A\u0E19\u0E41\u0E1A\u0E1A inelastic: \u0E40\u0E2A\u0E35\u0E22 E\xD7m2/(m1+m2) = ${n1(lost)} ft-lb \u0E01\u0E25\u0E32\u0E22\u0E40\u0E1B\u0E47\u0E19\u0E14\u0E32\u0E40\u0E21\u0E08, \u0E40\u0E2B\u0E25\u0E37\u0E2D\u0E44\u0E1B\u0E15\u0E48\u0E2D E\xD7m1/(m1+m2) = ${n1(col.rest)} ft-lb`);
    trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E1C\u0E39\u0E49\u0E0A\u0E19\u0E23\u0E31\u0E1A\u0E41\u0E23\u0E07\u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E48\u0E32\u0E15\u0E01\u0E08\u0E32\u0E01 ${n1(col.moverFt)} \u0E1F\u0E38\u0E15, ${hit.name} \u0E23\u0E31\u0E1A ${n1(col.struckFt)} \u0E1F\u0E38\u0E15 (\u0E1D\u0E31\u0E48\u0E07\u0E17\u0E35\u0E48\u0E40\u0E1A\u0E32\u0E01\u0E27\u0E48\u0E32\u0E23\u0E31\u0E1A\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32)`);
    out.bumps.push({ front, hit });
    if (col.moverFt > 0) out.hurt.push({ who: front, ft: col.moverFt * mass / front.mass });
    if (col.struckFt > 0) out.hurt.push({ who: hit, ft: col.struckFt });
    const cells = rules.canMove(hit) ? rules.cellsFor(col.slideFt, cellFt) : 0;
    if (!movable) {
      trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `${hit.name} \u0E02\u0E22\u0E31\u0E1A\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49 \u0E08\u0E1A\u0E25\u0E39\u0E01\u0E42\u0E0B\u0E48`);
      break;
    }
    trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E44\u0E16\u0E25\u0E15\u0E48\u0E2D\u0E14\u0E49\u0E27\u0E22\u0E01\u0E31\u0E19 = rest/(\u03BC\xD7\u0E21\u0E27\u0E25\u0E23\u0E27\u0E21) = ${n1(col.rest)}/${n1(col.drag)} = ${n1(col.slideFt)} \u0E1F\u0E38\u0E15 \u2192 ${cells} \u0E0A\u0E48\u0E2D\u0E07`);
    if (cells === 0) {
      trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E44\u0E21\u0E48\u0E16\u0E36\u0E07\u0E04\u0E23\u0E36\u0E48\u0E07\u0E0A\u0E48\u0E2D\u0E07 ${hit.name} \u0E44\u0E21\u0E48\u0E02\u0E22\u0E31\u0E1A \u0E08\u0E1A\u0E25\u0E39\u0E01\u0E42\u0E0B\u0E48`);
      break;
    }
    out.ids.push(hit.id);
    const s = resolvePush(world, hit, step, cells, out.ids);
    slid.push({ thing: hit, cells: s.moved });
    mass += hit.mass;
    front = hit;
    energy = Math.max(0, col.rest - col.drag * s.moved * cellFt);
    trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `${hit.name} \u0E16\u0E39\u0E01\u0E14\u0E31\u0E19\u0E44\u0E1B\u0E44\u0E14\u0E49 ${s.moved} \u0E0A\u0E48\u0E2D\u0E07${s.stopped ? ` \u0E41\u0E25\u0E49\u0E27\u0E16\u0E39\u0E01\u0E02\u0E27\u0E32\u0E07${s.hit ? ` \u0E42\u0E14\u0E22 ${s.hit.name}` : "\u0E14\u0E49\u0E27\u0E22\u0E01\u0E33\u0E41\u0E1E\u0E07"}` : ""} \u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E40\u0E2B\u0E25\u0E37\u0E2D ${n1(energy)} ft-lb`);
    if (s.stopped === "wall") {
      if (energy > 0) {
        out.hurt.push({ who: hit, ft: energy / hit.mass });
        trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E02\u0E1A\u0E27\u0E19\u0E01\u0E23\u0E30\u0E41\u0E17\u0E01\u0E01\u0E33\u0E41\u0E1E\u0E07: ${hit.name} \u0E23\u0E31\u0E1A ${n1(energy)}/${n1(hit.mass)} = ${n1(energy / hit.mass)} \u0E1F\u0E38\u0E15`);
      }
      break;
    }
    hit = s.stopped ? s.hit : void 0;
  }
  if (hit && out.bumps.length >= PUSH.maxChain) trace("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `\u0E0A\u0E19\u0E15\u0E48\u0E2D\u0E40\u0E19\u0E37\u0E48\u0E2D\u0E07\u0E04\u0E23\u0E1A ${PUSH.maxChain} \u0E04\u0E23\u0E31\u0E49\u0E07\u0E41\u0E25\u0E49\u0E27 \u0E15\u0E31\u0E14\u0E25\u0E39\u0E01\u0E42\u0E0B\u0E48 (PUSH.maxChain)`);
  let ahead = 0;
  for (let i = slid.length - 1; i >= 0; i--) {
    ahead += slid[i].cells;
    if (ahead > 0) out.extra.unshift({ thing: slid[i].thing, cells: ahead });
  }
  out.shift = ahead;
  return out.bumps.length ? out : void 0;
}

// src/actions/motion.ts
var WHY = { wall: "\u0E15\u0E34\u0E14\u0E01\u0E33\u0E41\u0E1E\u0E07", creature: "\u0E21\u0E35\u0E04\u0E19\u0E22\u0E37\u0E19\u0E02\u0E27\u0E32\u0E07\u0E2D\u0E22\u0E39\u0E48", prop: "\u0E21\u0E35\u0E02\u0E2D\u0E07\u0E02\u0E27\u0E32\u0E07\u0E2D\u0E22\u0E39\u0E48" };
var isProp = (t) => "material" in t;
function hurt({ rules, dice, trace }, who, h, why, step) {
  if (isProp(who)) {
    trace?.(step, `${who.name} \u0E40\u0E1B\u0E47\u0E19\u0E02\u0E2D\u0E07 \u0E44\u0E21\u0E48\u0E21\u0E35 HP \u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E40\u0E2A\u0E35\u0E22\u0E2B\u0E32\u0E22`);
    return [];
  }
  const b = rules.bruise(h), d = `d${b.sides}`;
  if (b.dice <= 0 && b.frac <= 0) {
    trace?.(step, `${who.name}: \u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E48\u0E32\u0E15\u0E01 ${n1(h)} \u0E1F\u0E38\u0E15 \u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32\u0E02\u0E31\u0E49\u0E19\u0E15\u0E48\u0E33 \u2192 \u0E41\u0E04\u0E48\u0E01\u0E23\u0E30\u0E41\u0E17\u0E01\u0E40\u0E1A\u0E32 \u0E46 \u0E44\u0E21\u0E48\u0E40\u0E2A\u0E35\u0E22\u0E2B\u0E32\u0E22`);
    return [];
  }
  const whole = b.dice > 0 ? dice.roll(b.dice, b.sides) : 0;
  const roll = b.frac > 0 ? dice.roll(1, b.sides) : 0, part = b.frac > 0 ? Math.max(1, Math.round(roll * b.frac)) : 0;
  const dmg = whole + part;
  trace?.(step, `${who.name}: \u0E40\u0E17\u0E35\u0E22\u0E1A\u0E40\u0E17\u0E48\u0E32\u0E15\u0E01 ${n1(h)} \u0E1F\u0E38\u0E15 \u2192 n = ${n1(h)} \xF7 10 = ${n2(b.exact)} \u0E25\u0E39\u0E01\u0E40\u0E15\u0E4B\u0E32 \u2192 ${b.dice > 0 ? `${b.dice}${d} \u0E17\u0E2D\u0E22\u0E44\u0E14\u0E49 ${whole}` : "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E40\u0E15\u0E4B\u0E32\u0E40\u0E15\u0E47\u0E21"}` + (b.frac > 0 ? ` + \u0E40\u0E28\u0E29 ${n2(b.frac)} \u0E02\u0E2D\u0E07 1${d} (\u0E17\u0E2D\u0E22 ${roll} \xD7 ${n2(b.frac)} = ${n2(roll * b.frac)} \u2192 \u0E1B\u0E31\u0E14\u0E40\u0E1B\u0E47\u0E19 ${part}, \u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 1)` : "") + ` = ${dmg} \u0E14\u0E32\u0E40\u0E21\u0E08`);
  return [Fx.log(`${why} \u0E40\u0E2A\u0E35\u0E22 ${dmg} \u0E14\u0E32\u0E40\u0E21\u0E08`), Fx.damage(who.id, dmg, "bludgeoning")];
}
function fallFx({ rules, dice, trace }, who, dropFt) {
  if (dropFt <= 0) return [];
  const fall = rules.fall(dropFt);
  if (fall.dice > 0 && !isProp(who)) {
    const dmg = dice.roll(fall.dice, fall.sides);
    trace?.("\u0E15\u0E01\u0E02\u0E2D\u0E1A", `${who.name} \u0E15\u0E01\u0E08\u0E32\u0E01\u0E2A\u0E39\u0E07 ${dropFt} \u0E1F\u0E38\u0E15 \u2192 ${fall.dice}d${fall.sides} \u0E17\u0E2D\u0E22\u0E44\u0E14\u0E49 ${dmg} \u0E41\u0E25\u0E30\u0E25\u0E49\u0E21 (prone)`);
    return [Fx.log(`${who.name} \u0E15\u0E01\u0E08\u0E32\u0E01\u0E17\u0E35\u0E48\u0E2A\u0E39\u0E07 ${dropFt} \u0E1F\u0E38\u0E15 \u0E40\u0E2A\u0E35\u0E22 ${dmg} \u0E14\u0E32\u0E40\u0E21\u0E08`), Fx.damage(who.id, dmg, "bludgeoning"), Fx.prone(who.id)];
  }
  trace?.("\u0E15\u0E01\u0E02\u0E2D\u0E1A", `${who.name} \u0E15\u0E01\u0E25\u0E07\u0E21\u0E32 ${dropFt} \u0E1F\u0E38\u0E15 ${isProp(who) ? "\u0E41\u0E15\u0E48\u0E40\u0E1B\u0E47\u0E19\u0E02\u0E2D\u0E07 \u0E44\u0E21\u0E48\u0E40\u0E2A\u0E35\u0E22\u0E2B\u0E32\u0E22" : "\u0E41\u0E15\u0E48\u0E15\u0E48\u0E33\u0E01\u0E27\u0E48\u0E32 10 \u0E1F\u0E38\u0E15 \u0E44\u0E21\u0E48\u0E40\u0E08\u0E47\u0E1A"}`);
  return [Fx.log(`${who.name} \u0E15\u0E01\u0E25\u0E07\u0E21\u0E32 ${dropFt} \u0E1F\u0E38\u0E15${isProp(who) ? "" : " (\u0E44\u0E21\u0E48\u0E40\u0E08\u0E47\u0E1A)"}`)];
}
function resolveMotion(ctx, m) {
  const { world, rules } = ctx, t = ctx.trace ?? (() => {
  });
  const { body, step } = m;
  const first = resolvePush(world, body, step, m.cells);
  t("\u0E40\u0E2A\u0E49\u0E19\u0E17\u0E32\u0E07", `\u0E17\u0E34\u0E28 (${step.col}, ${step.row}) \u0E15\u0E31\u0E49\u0E07\u0E43\u0E08\u0E44\u0E1B ${m.cells} \u0E0A\u0E48\u0E2D\u0E07 \u0E44\u0E1B\u0E44\u0E14\u0E49\u0E08\u0E23\u0E34\u0E07 ${first.moved} \u0E0A\u0E48\u0E2D\u0E07 \u2014 ${first.stopped ? `\u0E2B\u0E22\u0E38\u0E14\u0E40\u0E1E\u0E23\u0E32\u0E30${WHY[first.stopped]}${first.hit ? ` (${first.hit.name})` : ""}` : "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E2D\u0E30\u0E44\u0E23\u0E02\u0E27\u0E32\u0E07"}`);
  if (first.moved === 0) return { fx: [], moved: 0, stopped: first.stopped };
  const crash = first.hit ? runCrash(world, rules, { front: body, energy: m.energyAt(first.moved * world.cellFt), hit: first.hit, step }, ctx.trace) : void 0;
  if (first.hit && !crash) t("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `${body.name} \u0E0A\u0E19 ${first.hit.name} \u0E41\u0E15\u0E48\u0E01\u0E0E\u0E19\u0E35\u0E49\u0E44\u0E21\u0E48\u0E21\u0E35\u0E14\u0E32\u0E40\u0E21\u0E08\u0E0A\u0E19\u0E41\u0E25\u0E30\u0E44\u0E21\u0E48\u0E14\u0E31\u0E19\u0E15\u0E48\u0E2D \u0E08\u0E36\u0E07\u0E41\u0E04\u0E48\u0E2B\u0E22\u0E38\u0E14`);
  const r = crash && crash.shift > 0 ? resolvePush(world, body, step, first.moved + crash.shift, crash.ids) : first;
  if (crash && crash.shift > 0) t("\u0E0A\u0E19\u0E02\u0E2D\u0E07", `${body.name} \u0E15\u0E32\u0E21\u0E02\u0E2D\u0E07\u0E17\u0E35\u0E48\u0E0A\u0E19\u0E44\u0E1B\u0E2D\u0E35\u0E01 ${crash.shift} \u0E0A\u0E48\u0E2D\u0E07 \u0E23\u0E27\u0E21\u0E40\u0E14\u0E34\u0E19\u0E17\u0E32\u0E07 ${r.moved} \u0E0A\u0E48\u0E2D\u0E07`);
  const note = crash ? ` (\u0E0A\u0E19 ${first.hit.name})` : r.stopped ? ` (\u0E2B\u0E22\u0E38\u0E14\u0E40\u0E1E\u0E23\u0E32\u0E30${WHY[r.stopped]})` : "";
  const fx = [m.describe(r, note), Fx.push(body.id, r.to)];
  const falls = [];
  if (crash) {
    for (const b of crash.bumps) fx.push(Fx.log(`${b.front.name} \u0E0A\u0E19 ${b.hit.name}`));
    for (const h of crash.hurt) fx.push(...hurt(ctx, h.who, h.ft, `${h.who.name} \u0E40\u0E08\u0E47\u0E1A\u0E08\u0E32\u0E01\u0E01\u0E32\u0E23\u0E0A\u0E19 \u0E41\u0E23\u0E07\u0E40\u0E17\u0E48\u0E32\u0E15\u0E01\u0E08\u0E32\u0E01 ${Math.round(h.ft)} \u0E1F\u0E38\u0E15`, "\u0E14\u0E32\u0E40\u0E21\u0E08\u0E08\u0E32\u0E01\u0E01\u0E32\u0E23\u0E0A\u0E19"));
    for (const x of crash.extra) {
      const s = resolvePush(world, x.thing, step, x.cells, crash.ids);
      if (s.moved === 0) continue;
      fx.push(Fx.log(`${x.thing.name} \u0E16\u0E39\u0E01\u0E14\u0E31\u0E19\u0E44\u0E1B\u0E2D\u0E35\u0E01 ${s.moved * world.cellFt} \u0E1F\u0E38\u0E15`), Fx.push(x.thing.id, s.to));
      falls.push(...fallFx(ctx, x.thing, s.dropFt));
    }
  }
  if (first.stopped === "wall") {
    const e = m.energyAt(first.moved * world.cellFt), h = impactHeightFt(e, body.mass);
    t("\u0E01\u0E23\u0E30\u0E41\u0E17\u0E01\u0E01\u0E33\u0E41\u0E1E\u0E07", e > 0 ? `\u0E1E\u0E25\u0E31\u0E07\u0E07\u0E32\u0E19\u0E17\u0E35\u0E48\u0E22\u0E31\u0E07\u0E40\u0E2B\u0E25\u0E37\u0E2D E = ${n1(e)} ft-lb \xF7 \u0E19\u0E49\u0E33\u0E2B\u0E19\u0E31\u0E01 ${n1(body.mass)} lb = ${n1(h)} \u0E1F\u0E38\u0E15 (\u0E40\u0E2B\u0E21\u0E37\u0E2D\u0E19\u0E15\u0E01\u0E08\u0E32\u0E01\u0E04\u0E27\u0E32\u0E21\u0E2A\u0E39\u0E07\u0E19\u0E31\u0E49\u0E19)` : "\u0E01\u0E0E\u0E19\u0E35\u0E49\u0E44\u0E21\u0E48\u0E21\u0E35\u0E14\u0E32\u0E40\u0E21\u0E08\u0E0A\u0E19\u0E01\u0E33\u0E41\u0E1E\u0E07");
    fx.push(...hurt(ctx, body, h, `${body.name} \u0E01\u0E23\u0E30\u0E41\u0E17\u0E01\u0E01\u0E33\u0E41\u0E1E\u0E07 \u0E41\u0E23\u0E07\u0E40\u0E17\u0E48\u0E32\u0E15\u0E01\u0E08\u0E32\u0E01 ${Math.round(h)} \u0E1F\u0E38\u0E15`, "\u0E01\u0E23\u0E30\u0E41\u0E17\u0E01\u0E01\u0E33\u0E41\u0E1E\u0E07"));
  }
  if (body.tags.includes("flying") && world.heightAt(body.pos) > world.heightAt(r.to)) t("\u0E15\u0E01\u0E02\u0E2D\u0E1A", `${body.name} \u0E1A\u0E34\u0E19\u0E2D\u0E22\u0E39\u0E48 \u0E08\u0E36\u0E07\u0E44\u0E21\u0E48\u0E15\u0E01\u0E25\u0E07\u0E44\u0E1B\u0E43\u0E19\u0E2B\u0E25\u0E38\u0E21`);
  fx.push(...falls, ...fallFx(ctx, body, r.dropFt));
  return { fx, moved: r.moved, stopped: first.stopped, crash };
}

// src/actions/types.ts
var yes = { ok: true };
var no = (reason) => ({ ok: false, reason });

// src/actions/shove.ts
var groundOf = (world, actor, target) => ({ actor: world.surfaceAt(actor.pos), target: world.surfaceAt(target.pos) });
var Shove = {
  id: "shove",
  label: "\u0E1C\u0E25\u0E31\u0E01 (Shove)",
  canUse({ rules }, { actor, target }) {
    if (actor.id === target.id) return no("\u0E1C\u0E25\u0E31\u0E01\u0E15\u0E31\u0E27\u0E40\u0E2D\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
    if (!rules.canAct(actor)) return no("\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E17\u0E33\u0E2D\u0E30\u0E44\u0E23\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
    if (gap(actor, target) > 0) return no("\u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E15\u0E34\u0E14\u0E01\u0E31\u0E19");
    if (!rules.canShoveSize(actor, target)) return no("\u0E15\u0E31\u0E27\u0E43\u0E2B\u0E0D\u0E48\u0E40\u0E01\u0E34\u0E19\u0E44\u0E1B (\u0E1C\u0E25\u0E31\u0E01\u0E44\u0E14\u0E49\u0E43\u0E2B\u0E0D\u0E48\u0E01\u0E27\u0E48\u0E32\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19 1 \u0E02\u0E19\u0E32\u0E14)");
    return yes;
  },
  resolve(ctx, { actor, target, mode }) {
    const { world, rules, dice } = ctx, t = ctx.trace ?? (() => {
    });
    const fx = [Fx.spendCost(actor.id, rules.costOf("shove"))];
    const check = rules.save(target, rules.shoveSaveAbility(target), rules.shoveDC(actor), dice);
    t("\u0E17\u0E2D\u0E22 save", `${target.name}: ${formatCheck(check)} \u2192 ${check.ok ? "\u0E1C\u0E48\u0E32\u0E19 \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E1C\u0E25\u0E31\u0E01" : "\u0E1E\u0E25\u0E32\u0E14"}`);
    if (check.ok) return [...fx, Fx.log(`${target.name} \u0E22\u0E37\u0E19\u0E21\u0E31\u0E48\u0E19 \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E1C\u0E25\u0E31\u0E01`, check)];
    if (mode === "prone") {
      t("\u0E17\u0E2D\u0E22 save", "\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E1C\u0E25\u0E25\u0E31\u0E1E\u0E18\u0E4C = \u0E25\u0E49\u0E21 (prone) \u0E44\u0E21\u0E48\u0E21\u0E35\u0E01\u0E32\u0E23\u0E40\u0E04\u0E25\u0E37\u0E48\u0E2D\u0E19\u0E17\u0E35\u0E48");
      return [...fx, Fx.log(`${actor.name} \u0E1C\u0E25\u0E31\u0E01 ${target.name} \u0E25\u0E49\u0E21\u0E25\u0E07`, check), Fx.prone(target.id)];
    }
    const ground = groundOf(world, actor, target);
    const ft = rules.pushFt(actor, target, ground), cells = rules.cellsFor(ft, world.cellFt);
    for (const line of rules.explainPush(actor, target, ground)) t("\u0E41\u0E23\u0E07\u0E41\u0E25\u0E30\u0E23\u0E30\u0E22\u0E30", line);
    t("\u0E1B\u0E31\u0E14\u0E40\u0E1B\u0E47\u0E19\u0E0A\u0E48\u0E2D\u0E07", `${n1(ft)} \u0E1F\u0E38\u0E15 \xF7 ${world.cellFt} \u0E1F\u0E38\u0E15/\u0E0A\u0E48\u0E2D\u0E07 = ${n1(ft / world.cellFt)} \u2192 ${cells} \u0E0A\u0E48\u0E2D\u0E07 \u0E42\u0E14\u0E22 ${rules.roundingNote()}`);
    if (cells === 0) return [...fx, Fx.log(`${actor.name} \u0E1E\u0E22\u0E32\u0E22\u0E32\u0E21\u0E1C\u0E25\u0E31\u0E01 ${target.name} \u0E41\u0E15\u0E48\u0E02\u0E22\u0E31\u0E1A\u0E44\u0E21\u0E48\u0E44\u0E2B\u0E27`, check)];
    const step = awayFrom(actor, target);
    const out = resolveMotion(ctx, {
      body: target,
      step,
      cells,
      energyAt: (x) => rules.pushEnergy(actor, target, x, ground),
      describe: (r, note) => Fx.log(`${actor.name} \u0E1C\u0E25\u0E31\u0E01 ${target.name} \u0E44\u0E1B ${r.moved * world.cellFt} \u0E1F\u0E38\u0E15${note}`, check)
    });
    if (out.moved === 0) return [...fx, Fx.log(`${actor.name} \u0E1E\u0E22\u0E32\u0E22\u0E32\u0E21\u0E1C\u0E25\u0E31\u0E01 ${target.name} \u0E41\u0E15\u0E48${WHY[out.stopped ?? "wall"]} \u0E1C\u0E25\u0E31\u0E01\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49`, check)];
    fx.push(...out.fx);
    return fx;
  }
};

export {
  cellsOf,
  gap,
  awayFrom,
  n1,
  resolveMotion,
  yes,
  no,
  groundOf,
  Shove,
  Ruleset,
  RulesetPhysics,
  applyEffects,
  gmApply,
  setRuleset,
  currentRules,
  useRules
};
