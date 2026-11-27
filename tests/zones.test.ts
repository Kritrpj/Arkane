import { describe, expect, it } from "vitest";
import { FRICTION } from "../src/data/surfaces";
import { GridWorld } from "../src/world/gridWorld";
import { ZoneField, concentrationDC, expiryAfter, gallonsToFt3, isExpired, makeZone, radiusFromVolume, resolveZones, zoneFromVolume } from "../src/rules/zones";
import type { Shape } from "../src/model/zone";

const circle = (x: number, y: number, r: number): Shape => ({ type: "circle", x, y, r });
const rect = (x: number, y: number, w: number, h: number): Shape => ({ type: "rect", x, y, w, h });

describe("ซ้อนชั้น", () => {
  it("น้ำมันลอยบนน้ำ: mu และ surface เป็นของน้ำมัน", () => {
    const r = resolveZones([makeZone({ id: "w", kind: "water", shapes: [circle(0, 0, 9)] }), makeZone({ id: "o", kind: "oil", shapes: [circle(0, 0, 9)] })]);
    expect(r.surface).toBe("oil"); expect(r.props.mu).toBe(FRICTION.oil); expect(r.layers).toEqual(["water", "oil"]);
  });
  it("ลำดับที่ใส่ไม่มีผล (ใช้ layer)", () => {
    const a = makeZone({ id: "o", kind: "oil", shapes: [] }), b = makeZone({ id: "w", kind: "water", shapes: [] });
    expect(resolveZones([a, b]).surface).toBe("oil"); expect(resolveZones([b, a]).surface).toBe("oil");
  });
  it("น้ำบนไม้: ติดไฟยากลง, นำไฟฟ้าขึ้น; น้ำมันบนไม้: ติดไฟง่ายขึ้น", () => {
    const wood = makeZone({ id: "f", kind: "wood", permanent: true, shapes: [] });
    const dry = resolveZones([wood]).props, wet = resolveZones([wood, makeZone({ id: "w", kind: "water", shapes: [] })]).props;
    const oily = resolveZones([wood, makeZone({ id: "o", kind: "oil", shapes: [] })]).props;
    expect(wet.flammability).toBeLessThan(dry.flammability); expect(wet.conductivity).toBeGreaterThan(dry.conductivity);
    expect(oily.flammability).toBeGreaterThan(dry.flammability); expect(dry.fuel).toBe(3);
  });
  it("difficult = OR, DM แก้ทับได้, ดาเมจชื่อเดียวกันไม่ทบ", () => {
    const hz = (amount: number) => ({ name: "grease", type: "x", amount, trigger: "endTurn" as const, source: "house" as const });
    const r = resolveZones([makeZone({ id: "a", kind: "ice", shapes: [], hazard: hz(3) }), makeZone({ id: "b", kind: "ice", shapes: [], hazard: hz(5), overrides: { mu: 0.3 } })]);
    expect(r.props.difficult).toBe(true); expect(r.props.mu).toBe(0.3); expect(r.hazards).toHaveLength(1); expect(r.hazards[0].amount).toBe(5);
  });
  it("พื้นเปล่า = floor, kind แปลก ๆ ถูกข้ามพร้อมหมายเหตุ", () => {
    const r = resolveZones([makeZone({ id: "x", kind: "???", shapes: [] })]);
    expect(r.props.mu).toBe(FRICTION.floor); expect(r.surface).toBeUndefined(); expect(r.trace.join()).toContain("ไม่รู้จัก");
  });
});

describe("merge", () => {
  it("เสกน้ำ 20 กองติดกัน เหลือก้อนเดียว ปริมาตรบวกกัน", () => {
    const f = new ZoneField([], { cellFt: 5 });
    for (let i = 0; i < 20; i++) f.add(zoneFromVolume({ kind: "water", center: { x: i * 1.5, y: 0 }, gallons: 10, depth: 0.05 }));
    expect(f.zones()).toHaveLength(1);
    expect(f.zones()[0].volume).toBeCloseTo(20 * gallonsToFt3(10), 6); expect(f.zones()[0].shapes).toHaveLength(20);
  });
  it("ไกลกันไม่ merge, ต่างชนิดไม่ merge, วัสดุไม่ merge", () => {
    const f = new ZoneField();
    f.add(makeZone({ kind: "water", shapes: [circle(0, 0, 2)] })); f.add(makeZone({ kind: "water", shapes: [circle(50, 0, 2)] }));
    f.add(makeZone({ kind: "oil", shapes: [circle(0, 0, 2)] }));
    f.add(makeZone({ kind: "wood", permanent: true, shapes: [rect(0, 0, 5, 5)] })); f.add(makeZone({ kind: "wood", permanent: true, shapes: [rect(0, 0, 5, 5)] }));
    expect(f.zones()).toHaveLength(5);
  });
  it("วางคร่อมสองก้อน -> รวมสามเป็นหนึ่ง และแจ้ง id ที่ถูกกลืน", () => {
    const f = new ZoneField(); const a = makeZone({ id: "a", kind: "water", shapes: [circle(0, 0, 2)] }), b = makeZone({ id: "b", kind: "water", shapes: [circle(6, 0, 2)] });
    f.add(a); f.add(b);
    const r = f.add(makeZone({ id: "c", kind: "water", shapes: [circle(3, 0, 2)] }));
    expect(f.zones()).toHaveLength(1); expect(r.removed).toEqual(["b"]); expect(r.zone?.id).toBe("a");
  });
  it("สมาธิ: คนละผู้เสกไม่ merge", () => {
    const f = new ZoneField();
    f.add(makeZone({ kind: "water", concentration: true, caster: "A", shapes: [circle(0, 0, 2)] }));
    f.add(makeZone({ kind: "water", concentration: true, caster: "B", shapes: [circle(1, 0, 2)] }));
    expect(f.zones()).toHaveLength(2);
  });
  it("เกินเพดานแจ้งเตือนและไม่สร้างเพิ่ม", () => {
    const f = new ZoneField(Array.from({ length: 200 }, (_, i) => makeZone({ kind: "water", shapes: [circle(i * 100, 0, 1)] })));
    const r = f.add(makeZone({ kind: "oil", shapes: [circle(0, 500, 1)] }));
    expect(r.ok).toBe(false); expect(r.warning).toContain("200");
  });
});

describe("ปริมาตร", () => {
  it("น้ำ 10 แกลลอน = 1.337 ft³ ลึก 0.05 ฟุต -> รัศมี 2.917 ฟุต", () => {
    expect(gallonsToFt3(10)).toBeCloseTo(1.337, 3); expect(radiusFromVolume(gallonsToFt3(10), 0.05)).toBeCloseTo(2.917, 3);
  });
});

describe("หมดอายุและสมาธิ", () => {
  it("1 นาที = 10 รอบ; นอกการต่อสู้ใช้เวลาโลก (6 วิ/รอบ)", () => {
    const inCombat = expiryAfter(10, { round: 3, combat: "c1", worldTime: 0 }), out = expiryAfter(10, { worldTime: 100 });
    expect(inCombat).toEqual({ kind: "round", at: 13, combat: "c1" }); expect(out).toEqual({ kind: "world", at: 160 });
    const z = makeZone({ kind: "water", shapes: [], expires: inCombat });
    expect(isExpired(z, { round: 12, combat: "c1", worldTime: 0 })).toBe(false); expect(isExpired(z, { round: 13, combat: "c1", worldTime: 0 })).toBe(true);
    expect(isExpired(makeZone({ kind: "water", shapes: [], expires: out }), { worldTime: 160 })).toBe(true);
  });
  it("sweep ลบเฉพาะที่หมดอายุ; ของถาวรไม่หมด; DC สมาธิ", () => {
    const f = new ZoneField([makeZone({ id: "a", kind: "water", shapes: [], expires: { kind: "world", at: 10 } }), makeZone({ id: "b", kind: "stone", permanent: true, shapes: [], expires: { kind: "world", at: 1 } })]);
    expect(f.sweep({ worldTime: 50 })).toEqual(["a"]); expect(concentrationDC(8)).toBe(10); expect(concentrationDC(30)).toBe(15);
  });
});

describe("World ถามด้วยพิกัดฟุต", () => {
  it("surfaceAt(ช่อง) ใช้จุดกลางช่อง; fraction ใช้สัดส่วนที่คลุม; propertiesAt รับฟุตต่อเนื่อง", () => {
    const zones = [makeZone({ kind: "oil", shapes: [rect(0, 0, 2, 5)] })];           // คลุมช่อง (0,0) 40% แต่ไม่ถึงจุดกลาง (2.5,2.5)  (เดิม 3 ฟุต = 60% ซึ่งคลุมจุดกลางด้วย เทสต์จึงขัดกับรูปร่างตัวเอง)
    expect(new GridWorld({ cols: 4, rows: 4, zones }).surfaceAt({ col: 0, row: 0 })).toBeUndefined();
    expect(new GridWorld({ cols: 4, rows: 4, zones, coverage: { mode: "fraction", min: 0.3 } }).surfaceAt({ col: 0, row: 0 })).toBe("oil");
    expect(new GridWorld({ cols: 4, rows: 4, zones }).propertiesAt({ x: 1.25, y: 1 }).surface).toBe("oil");
  });
  it("ของเดิม: surfaces map ต่อช่องยังทำงาน", () => {
    expect(new GridWorld({ cols: 3, rows: 3, surfaces: { "1,1": "ice" } }).surfaceAt({ col: 1, row: 1 })).toBe("ice");
  });
});
