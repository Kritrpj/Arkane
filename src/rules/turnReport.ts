// สรุปให้ DM: "ตอนนี้ Zone ทำอะไรกับใครบ้าง" ทั้งตอนอยู่ในเทิร์น (combat) และนอก combat
// ระบบ "เสนอ" ไม่ตัดสิน: ทุกข้อมีที่มา (RAW/physics/house/unchecked) และถ้าเป็นดาเมจจะแนบ Effect ไว้เป็นข้อเสนอ ยังไม่ apply
// อ่านอย่างเดียว ไม่แก้โลก: ใช้ซ้ำได้ทั้ง harness, แชท GM, และหน้าต่างอนุมัติของ DM (ขั้นที่ 2)
import { Fx, type Effect } from "../model/effect";
import type { World } from "../model/world";
import type { Clock, Source } from "../model/zone";
import { ROUND_SEC } from "../data/zones";
import { concentrationDC, isExpired } from "./zones";
import { zoneTick } from "./zoneTick";

export type ReportKind = "expire" | "hazard" | "terrain" | "surface" | "conductive" | "flammable" | "concentration" | "zone" | "note";
// level: "act" = ต้องให้ DM ตัดสิน/มีข้อเสนอ, "info" = รู้ไว้ (UI ควรพับไว้ ไม่เด้งแจ้งเตือน)
export interface ReportItem { kind: ReportKind; who?: string; text: string; source: Source; proposal?: Effect; level?: "act" | "info" }
export interface Report { mode: "combat" | "outside"; title: string; items: ReportItem[]; acts: number }

export const NOTABLE = 0.5;     // นำไฟฟ้า/ติดไฟ ตั้งแต่เท่านี้ถึงจะแจ้ง (house rule ปรับได้)

// whose = id ของผู้ที่กำลังถึงเทิร์น (ไม่ใส่ = สรุปทั้งกระดาน เช่น ปลายรอบหรือนอก combat)
export function turnReport(world: World, clock: Clock, o: { whose?: string; tick?: boolean; rng?: () => number } = {}): Report {
  const combat = clock.round !== undefined;
  const items: ReportItem[] = [];
  const all = world.creatures();
  const who = o.whose ? all.filter((c) => c.id === o.whose) : all;
  const nameOf = (id: string) => all.find((c) => c.id === id)?.name ?? id;

  // 1) Zone ที่หมดแล้ว/กำลังจะหมด
  for (const z of world.zones()) {
    const e = z.expires; if (!e || z.permanent) continue;
    const label = `${z.kind} (${z.id})`;
    if (isExpired(z, clock)) { items.push({ kind: "expire", text: `${label} หมดอายุแล้ว: DM ยังไม่ได้ลบ (sweep จะลบให้)`, source: "house" }); continue; }
    if (e.kind === "world") {
      const left = e.at - clock.worldTime;
      if (!combat || left <= ROUND_SEC) items.push({ kind: "expire", text: `${label} เหลือ ${left} วิ (≈ ${Math.ceil(left / ROUND_SEC)} รอบ)`, source: "house" });
    } else if (combat) {
      const left = e.at - (clock.round as number);
      if (left <= 1) items.push({ kind: "expire", text: `${label} จะหายตอนรอบ ${e.at} (อีก ${left} รอบ)`, source: "house" });
    } else items.push({ kind: "expire", text: `${label} นับตามรอบ combat: นอก combat ไม่หมดเอง (DM ปิดเองได้)`, source: "house" });
  }

  // 2) ใครยืนอยู่บนอะไร (ใช้จุดกลางของตัว ไม่ปัดเป็นช่อง)
  for (const c of who) {
    const f = c.footprint / 2, r = world.propertiesAt({ x: (c.pos.col + f) * world.cellFt, y: (c.pos.row + f) * world.cellFt });
    if (!r.layers.length) continue;
    const base = { who: c.id };
    if (r.props.difficult) items.push({ ...base, kind: "terrain", text: `${c.name}: อยู่ใน difficult terrain (${r.layers.join(" + ")}) เดินกินระยะเพิ่ม`, source: r.sources.difficult ?? "house" });
    if (r.surface) items.push({ ...base, kind: "surface", text: `${c.name}: พื้นใต้ตัวเป็น ${r.surface} (mu ${r.props.mu}) ถูกผลัก/พุ่งจะไถลตามกฎ physics`, source: r.sources.mu ?? "house" });
    for (const h of r.hazards) {
      const what = `${h.name ?? h.type} ${h.amount} ${h.type}`;
      if (h.trigger === "endTurn") {
        items.push(combat
          ? { ...base, kind: "hazard", text: `${c.name}: ปลายเทิร์นโดน ${what} (ชื่อเดียวกันไม่ทบ)`, source: h.source, proposal: Fx.damage(c.id, h.amount, h.type) }
          : { ...base, kind: "hazard", text: `${c.name}: อยู่ใน ${what} แต่นอก combat ไม่มีเทิร์น จึงไม่ทำงานเอง (DM สั่งเองได้)`, source: h.source });
      } else items.push({ ...base, kind: "hazard", text: `${c.name}: อยู่ใน ${what} ที่ทำงานตอนเดินเข้า (ถ้าเดินออกแล้วเข้าใหม่จะโดนอีก)`, source: h.source });
    }
    if (r.props.conductivity >= NOTABLE) items.push({ ...base, kind: "conductive", text: `${c.name}: ยืนบนพื้นนำไฟฟ้า (${r.props.conductivity.toFixed(2)}) ถ้าไฟฟ้าลงก้อนเดียวกันจะถึงตัวนี้ [ยังไม่คำนวณ: ขั้น 4-5]`, source: r.sources.conductivity ?? "house" });
    if (r.props.flammability >= NOTABLE) items.push({ ...base, kind: "flammable", text: `${c.name}: ยืนบนที่ติดไฟง่าย (${r.props.flammability.toFixed(2)}, เชื้อเพลิง ${r.props.fuel}) [ยังไม่คำนวณไฟลาม: ขั้น 4-5]`, source: r.sources.flammability ?? "house" });
  }

  // 3) สมาธิ: ผู้เสกที่ถือ Zone อยู่
  const byCaster = new Map<string, string[]>();
  for (const z of world.zones()) if (z.concentration && z.caster) byCaster.set(z.caster, [...(byCaster.get(z.caster) ?? []), z.kind]);
  for (const [id, kinds] of byCaster) {
    if (o.whose && o.whose !== id) continue;
    items.push({ kind: "concentration", who: id, source: "unchecked",
      text: `${nameOf(id)} ถือสมาธิ ${kinds.join(", ")}: ถ้าโดนดาเมจ ระบบจะเสนอ CON save (DC = มากกว่าระหว่าง 10 กับครึ่งดาเมจ เช่น ดาเมจ 30 → DC ${concentrationDC(30)}) พลาด = Zone ปิด` });
  }

  // 4) จบรอบ: Zone ทำอะไรกันเอง (ไฟลาม น้ำดับไฟ น้ำแข็งละลาย) ครั้งเดียวต่อรอบ รวมเป็นไม่กี่บรรทัด
  if (o.tick) for (const t of zoneTick(world, { rng: o.rng })) items.push({ kind: "zone", text: t.text, source: t.source, level: t.act ? "act" : "info" });

  for (const i of items) i.level ??= i.proposal ? "act" : "info";
  if (!items.length) items.push({ kind: "note", text: "ไม่มี Zone ที่ส่งผลกับใครในตอนนี้", source: "house", level: "info" });
  const name = o.whose ? nameOf(o.whose) : "ทั้งกระดาน";
  return { mode: combat ? "combat" : "outside", title: combat ? `${o.tick ? "จบรอบ" : "สรุปเทิร์น"}: ${name} (รอบ ${clock.round})` : `สรุปนอก combat: ${name}`, items, acts: items.filter((i) => i.level === "act").length };
}
