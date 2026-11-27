// The rulebook. Actions never hard-code a rule, they ask `rules.something()`.
// This base class IS the current behaviour (D&D 2024, same as combatx.js). A variant extends it and
// overrides only what differs:   class RulesetBG3 extends Ruleset { costOf(id) { ... } }
import type { AbilityKey, Creature } from "../model/creature";
import type { Thing } from "../model/thing";
import { NO_CRASH, type Collision } from "./physics";
import type { CheckResult, Part } from "../model/check";
import type { Cost } from "../model/effect";
import type { Adv, Dice } from "./dice";
import { rollSave } from "./check";
import { Size } from "./size";
import { FALL } from "../data/fall";
import { AUTO_FAIL_STR_DEX, CANT_ACT } from "../data/conditions";

// what covers the ground under each side of a push (undefined = bare floor)
export interface Ground { actor?: string; target?: string }

export class Ruleset {
  readonly name: string = "D&D 2024";

  // what an action costs to use
  costOf(_actionId: string): Cost { return "action"; }

  canAct(c: Creature): boolean {
    return c.hp.value > 0 && !c.conditions.some((x) => CANT_ACT.includes(x));
  }

  // ---- shove
  shoveDC(actor: Creature): Part[] {
    return [{ label: "base", value: 8 }, { label: "STR", value: actor.mod.str }, { label: "prof", value: actor.prof }];
  }
  // the target resists with its better save (ties go to STR)
  shoveSaveAbility(target: Creature): AbilityKey { return target.save.str >= target.save.dex ? "str" : "dex"; }
  // target may be at most one size larger
  canShoveSize(actor: Creature, target: Creature): boolean { return Size.index(target.size) <= Size.index(actor.size) + 1; }
  pushFt(_actor: Creature, _target: Creature, _ground?: Ground): number { return 5; }
  // feet -> whole cells the push will try. The base rulebook moves exactly 1 cell, so floor is enough here
  cellsFor(ft: number, cellFt: number): number { return Math.floor(ft / cellFt + 1e-9); }
  // how hard the target hits a wall, as "feet of falling" (fed to fall()). 2024 has no collision damage
  impactFt(_actor: Creature, _target: Creature, _travelledFt: number, _ground?: Ground): number { return 0; }

  // energy (ft-lb) the target still carries after being pushed `travelledFt`. 2024 has none, so nothing it hits gets hurt
  pushEnergy(_actor: Creature, _target: Creature, _travelledFt: number, _ground?: Ground): number { return 0; }
  // the target slams into another creature or prop. 2024: it just stops, no damage, nothing is carried along
  // (damage is in "feet of falling" for each side, slideFt = how far the pair keeps going together;
  // rest/drag let a chain track the energy left)
  collide(_energy: number, _mover: Thing, _struck: Thing, _surface?: string): Collision { return NO_CRASH; }
  // energy (ft-lb) a creature carries into whatever it hits after running `runFt` in a straight line. 2024 has no charge damage
  runEnergy(_actor: Creature, _runFt: number, _ground?: Ground): number { return 0; }
  explainRun(_actor: Creature, _runFt: number, _ground?: Ground): string[] {
    return ["กฎ 2024: พุ่งชนไม่มีแรงกระแทก แค่วิ่งไปถึงตัวเป้าหมาย"];
  }
  // can something be shoved along by a collision? (props tagged "immovable" never)
  canMove(t: Thing): boolean { return !t.tags.includes("immovable"); }

  // ---- explanations for the sidebar / tests: the same numbers the rules use, written out
  explainPush(_actor: Creature, _target: Creature, _ground?: Ground): string[] {
    return ["กฎ 2024: ผลัก 5 ฟุต (1 ช่อง) เสมอ ไม่ขึ้นกับแรงหรือน้ำหนัก"];
  }
  roundingNote(): string { return "ปัดลง (floor)"; }

  // ---- saves
  advantage(c: Creature, ability: AbilityKey): Adv {
    return ability === "dex" && c.conditions.includes("restrained") ? "dis" : "normal";
  }
  autoFail(c: Creature, ability: AbilityKey): string | undefined {
    return ability === "str" || ability === "dex" ? c.conditions.find((x) => AUTO_FAIL_STR_DEX.includes(x)) : undefined;
  }
  save(target: Creature, ability: AbilityKey, dcParts: Part[], dice: Dice): CheckResult {
    return rollSave({
      label: `${ability.toUpperCase()} save`, bonus: target.save[ability],
      adv: this.advantage(target, ability), autoFail: this.autoFail(target, ability), dcParts,
    }, dice);
  }

  // ---- falling
  // damage of a knock (crash into a body or a wall), from its "feet of falling" h. Unlike a fall (plain 5e, 1d6 per whole 10 ft)
  // an impact is smooth: whole dice for every 10 ft plus the leftover as a fraction of one die, so a small knock still bruises.
  //   exact = h / 10 ft   dice = floor(exact)   frac = exact - dice
  bruise(h: number): { dice: number; sides: number; frac: number; exact: number } {
    const exact = Math.max(0, h) / FALL.ftPerDie;
    if (h < FALL.minImpactFt) return { dice: 0, sides: FALL.sides, frac: 0, exact };
    const dice = Math.min(FALL.maxDice, Math.floor(exact));
    return { dice, sides: FALL.sides, frac: dice >= FALL.maxDice ? 0 : exact - dice, exact };
  }
  // the sentences the harness shows under "how is damage worked out" (numbers come from data/, so they never go stale)
  explainDamage(): string[] {
    return [`กฎ ${this.name}: การผลัก/ชนไม่ทำดาเมจ (มีแค่ตกขอบ ${FALL.sides === 6 ? "1d6" : `1d${FALL.sides}`} ต่อ ${FALL.ftPerDie} ฟุต ปัดลง)`];
  }

  fall(dropFt: number): { dice: number; sides: number } {
    return { dice: Math.min(FALL.maxDice, Math.floor(dropFt / FALL.ftPerDie)), sides: FALL.sides };
  }
}
