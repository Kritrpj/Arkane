// The sidebar's explanations must quote the numbers the rules really use, not a second copy that can drift.
import { describe, expect, it } from "vitest";
import { makeCreature } from "../src/model/make";
import { Ruleset } from "../src/rules/ruleset";
import { RulesetPhysics } from "../src/rules/physicsRuleset";
import { fixedDice } from "../src/rules/dice";
import { n1 } from "../src/rules/fmt";

describe("explainPush", () => {
  const rules = new RulesetPhysics();
  const hero = makeCreature({ id: "h", mod: { str: 3 } }), gob = makeCreature({ id: "g", size: "sm" });

  it("quotes the same force, grip, friction and distance as the rules compute", () => {
    const text = rules.explainPush(hero, gob).join("\n");
    expect(text).toContain(`= ${n1(rules.pushForce(hero))} lb`);
    expect(text).toContain(`= ${n1(rules.tractionLimit(hero))} lb`);
    expect(text).toContain(`= ${n1(rules.pushFt(hero, gob))} ฟุต`);
  });
  it("says so when grip limits the force (oil under the pusher), and when nothing moves", () => {
    expect(rules.explainPush(hero, gob, { actor: "oil" }).join("\n")).toContain("จำกัดแรง");
    const bob = makeCreature({ id: "b" });                                   // 180 lb: mu W = 108 > the 90 lb the oil lets through
    expect(rules.explainPush(hero, bob, { actor: "oil" }).join("\n")).toContain("ขยับไม่ได้");
  });
  it("the 2024 rulebook explains itself too", () => {
    expect(new Ruleset().explainPush(hero, gob)[0]).toContain("5 ฟุต");
    expect(new Ruleset().roundingNote()).toContain("floor");
    expect(rules.roundingNote()).toContain("ใกล้สุด");
    expect(new RulesetPhysics({ rounding: "floor" }).roundingNote()).toContain("floor");
  });
});

describe("fixedDice", () => {
  it("every d20 is the forced value, every other die too", () => {
    const d = fixedDice(7, 4);
    expect(d.d20().natural).toBe(7); expect(d.d20("adv").natural).toBe(7);
    expect(d.roll(3, 6)).toBe(12);
  });
});
