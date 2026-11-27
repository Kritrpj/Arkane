import { describe, expect, it } from "vitest";
import { makeCreature } from "../src/model/make";
import { makeZone } from "../src/rules/zones";
import { turnReport } from "../src/rules/turnReport";
import { zoneTick } from "../src/rules/zoneTick";
import { GridWorld } from "../src/world/gridWorld";

const hero = makeCreature({ id: "h", name: "Hero", pos: { col: 1, row: 1 } });
const circle = (x: number, y: number, r: number) => ({ type: "circle" as const, x, y, r });
const hz = { name: "burn", type: "fire", amount: 4, trigger: "endTurn" as const, source: "house" as const };

describe("turnReport", () => {
  it("combat: เสนอดาเมจปลายเทิร์น (ยังไม่ apply) พร้อมที่มา", () => {
    const w = new GridWorld({ cols: 6, rows: 6, creatures: [hero], zones: [makeZone({ kind: "fire", shapes: [circle(7.5, 7.5, 3)], hazard: hz })] });
    const r = turnReport(w, { round: 2, worldTime: 0 }, { whose: "h" });
    const h = r.items.find((i) => i.kind === "hazard")!;
    expect(r.mode).toBe("combat"); expect(h.proposal).toEqual({ kind: "damage", target: "h", amount: 4, type: "fire" }); expect(h.source).toBe("house");
    expect(w.creatures()[0].hp.value).toBe(10);
  });
  it("นอก combat: ไม่มี proposal และบอกว่าไม่มีเทิร์น; zone เวลาโลกบอกวินาทีที่เหลือ", () => {
    const w = new GridWorld({ cols: 6, rows: 6, creatures: [hero], zones: [
      makeZone({ kind: "fire", shapes: [circle(7.5, 7.5, 3)], hazard: hz }),
      makeZone({ kind: "water", shapes: [circle(30, 30, 2)], expires: { kind: "world", at: 100 } })] });
    const r = turnReport(w, { worldTime: 40 });
    expect(r.mode).toBe("outside"); expect(r.items.find((i) => i.kind === "hazard")!.proposal).toBeUndefined();
    expect(r.items.find((i) => i.kind === "expire")!.text).toContain("60 วิ");
  });
  it("น้ำแข็ง: แจ้ง difficult พร้อมป้าย unchecked; ผู้เสกถือสมาธิ", () => {
    const w = new GridWorld({ cols: 6, rows: 6, creatures: [hero], zones: [makeZone({ kind: "ice", shapes: [circle(7.5, 7.5, 3)], concentration: true, caster: "h" })] });
    const r = turnReport(w, { round: 1, worldTime: 0 }, { whose: "h" });
    expect(r.items.find((i) => i.kind === "terrain")!.source).toBe("unchecked");
    expect(r.items.some((i) => i.kind === "concentration")).toBe(true);
  });
});

describe("zoneTick (จบรอบ)", () => {
  const cell = (c: number, r: number) => ({ type: "rect" as const, x: c * 5, y: r * 5, w: 5, h: 5 });
  const world = (zs: ReturnType<typeof makeZone>[], creatures = [] as ReturnType<typeof makeCreature>[]) => new GridWorld({ cols: 8, rows: 8, zones: zs, creatures });
  const floor = makeZone({ kind: "wood", permanent: true, shapes: [{ type: "rect", x: 0, y: 0, w: 40, h: 40 }] });

  it("ไฟบนพื้นไม้ลามช่องข้างเคียงเมื่อสุ่มต่ำกว่า flammability (0.6)", () => {
    const w = world([floor, makeZone({ kind: "fire", shapes: [cell(2, 2)] })]);
    const items = zoneTick(w, { rng: () => 0.1 });
    const ig = items.find((i) => i.kind === "ignite")!;
    expect(ig.cells).toHaveLength(4); expect(items.find((i) => i.kind === "burn")!.cells).toHaveLength(1);
    expect(zoneTick(w, { rng: () => 0.9 }).find((i) => i.kind === "ignite")!.cells).toHaveLength(0);
  });
  it("เชื้อเพลิงเหลือ 1 -> ไหม้เกรียม", () => {
    const w = world([floor, makeZone({ kind: "fire", shapes: [cell(2, 2)], burn: { "2,2": 1 } })]);
    expect(zoneTick(w, { rng: () => 0.9 }).find((i) => i.kind === "out")!.cells).toHaveLength(1);
  });
  it("น้ำดับไฟ แต่ถ้ามีน้ำมันลอยบนน้ำไฟไม่ดับ", () => {
    const f = makeZone({ kind: "fire", shapes: [cell(1, 1)] }), water = makeZone({ kind: "water", shapes: [cell(1, 1)] });
    expect(zoneTick(world([water, f]), { rng: () => 0.9 }).some((i) => i.kind === "douse")).toBe(true);
    expect(zoneTick(world([water, f, makeZone({ kind: "oil", shapes: [cell(1, 1)] })]), { rng: () => 0.9 }).some((i) => i.kind === "douse")).toBe(false);
  });
  it("ไฟละลายน้ำแข็ง; คนในช่องไฟถูกแจ้ง; turnReport tick รวมเป็น act", () => {
    const hero2 = makeCreature({ id: "h", name: "Hero", pos: { col: 1, row: 1 } });
    const w = world([makeZone({ kind: "ice", shapes: [cell(1, 1)] }), makeZone({ kind: "fire", shapes: [cell(1, 1)] })], [hero2]);
    expect(zoneTick(w, { rng: () => 0.9 }).some((i) => i.kind === "melt")).toBe(true);
    const r = turnReport(w, { round: 3, worldTime: 0 }, { tick: true, rng: () => 0.9 });
    expect(r.acts).toBeGreaterThan(0); expect(r.title).toContain("จบรอบ");
  });
});
