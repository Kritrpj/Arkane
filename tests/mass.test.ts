// Sheet text -> mass. Covers the formats a human types into dnd5e's free-text weight/height fields.
import { describe, expect, it } from "vitest";
import { parseHeightFt, parseWeightLb, resolveMass } from "../src/rules/mass";
import { toCreature } from "../src/foundry/snapshot";
import { RulesetPhysics } from "../src/rules/physicsRuleset";
import { makeCreature } from "../src/model/make";

describe("parseWeightLb", () => {
  it("plain and with units", () => {
    expect(parseWeightLb("180 lb")).toBe(180);
    expect(parseWeightLb("180 lbs")).toBe(180);
    expect(parseWeightLb("70 kg")).toBeCloseTo(154.3, 1);
  });
  it("thousands separator: 1,200 lb is twelve hundred, not 1.2", () => {
    expect(parseWeightLb("1,200 lb")).toBe(1200);
    expect(parseWeightLb("12,500 lb")).toBe(12500);
    expect(parseWeightLb("1,200.5 lb")).toBeCloseTo(1200.5);
  });
  it("decimal comma still works", () => {
    expect(parseWeightLb("1,5 kg")).toBeCloseTo(3.31, 2);
    expect(parseWeightLb("62,5 kg")).toBeCloseTo(137.8, 1);
  });
  it("object shape and garbage", () => {
    expect(parseWeightLb({ value: 150, units: "lb" })).toBe(150);
    expect(parseWeightLb("")).toBeUndefined();
    expect(parseWeightLb("heavy")).toBeUndefined();
  });
});

describe("parseHeightFt", () => {
  it("feet/inches, cm, m, bare number", () => {
    expect(parseHeightFt(`5'10"`)).toBeCloseTo(5.83, 2);
    expect(parseHeightFt("5 ft 10 in")).toBeCloseTo(5.83, 2);
    expect(parseHeightFt("170 cm")).toBeCloseTo(5.58, 2);
    expect(parseHeightFt("1.75 m")).toBeCloseTo(5.74, 2);
    expect(parseHeightFt("6")).toBe(6);
  });
  it("thousands separator on a large creature", () => {
    expect(parseHeightFt("1,200 cm")).toBeCloseTo(39.4, 1);
  });
});

describe("resolveMass", () => {
  it("override beats everything, even an odd-looking value", () => {
    expect(resolveMass({ override: 5, weightLb: 180, size: "med" })).toEqual({ mass: 5, source: "override" });
  });
  it("a sane sheet weight is used", () => {
    expect(resolveMass({ weightLb: 200, size: "med" })).toEqual({ mass: 200, source: "weight" });
  });
  it("an absurd weight is ignored with a note, and the height is tried next", () => {
    const r = resolveMass({ weightLb: 1.2, heightFt: 5.8, size: "med" });
    expect(r.source).toBe("height");
    expect(r.note).toContain("ผิดปกติ");
  });
  it("absurd weight and height fall back to the size table", () => {
    const r = resolveMass({ weightLb: 20000, heightFt: 58, size: "med" });
    expect(r).toMatchObject({ mass: 180, source: "size" });
    expect(r.note).toContain("น้ำหนักในชีต");
    expect(r.note).toContain("ส่วนสูงในชีต");
  });
  it("a normal giant is not flagged", () => {
    expect(resolveMass({ weightLb: 1200, size: "lg" }).source).toBe("weight");
  });
  it("no note when nothing was rejected", () => {
    expect(resolveMass({ size: "med" }).note).toBeUndefined();
  });
});

describe("real STR score reaches the push force", () => {
  const rules = new RulesetPhysics();
  it("STR 15 is not rounded down to 14", () => {
    const withScore = makeCreature({ mod: { str: 2 }, strScore: 15 });
    const without = makeCreature({ mod: { str: 2 } });
    expect(rules.strScore(withScore)).toBe(15);
    expect(rules.strScore(without)).toBe(14);                 // fallback unchanged
    expect(rules.pushForce(withScore)).toBeGreaterThan(rules.pushForce(without));
  });
  it("snapshot copies it from the actor and reports a rejected weight", () => {
    const scene = { grid: { size: 100 }, dimensions: {} };
    const tok = {
      id: "t", name: "Ogre", x: 0, y: 0, width: 1, height: 1, parent: scene,
      actor: { statuses: new Set(), getFlag: () => undefined,
        system: { traits: { size: "med" }, details: { weight: "1,2 lb" },
          abilities: { str: { value: 17, mod: 3 }, dex: { mod: 0 }, con: { mod: 0 }, int: { mod: 0 }, wis: { mod: 0 }, cha: { mod: 0 } },
          attributes: { hp: { value: 5, max: 5 } } } },
    };
    const c = toCreature(tok)!;
    expect(c.strScore).toBe(17);
    expect(c.massSource).toBe("size");
    expect(c.massNote).toContain("ผิดปกติ");
  });
});
