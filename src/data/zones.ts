// ตารางวัสดุ/สารเริ่มต้น. ตัวเลข "คุณสมบัติ" ทั้งหมดเป็น house rule ที่เสนอ ไม่ใช่ค่าจาก D&D (DM ปรับทับได้ทีละค่า)
// ยกเว้น mu ที่อ่านจาก FRICTION (ค่าเดิมของโมดูล). ห้ามเติมตัวเลขคาถา/ไอเทม D&D จากความจำ ใส่ TODO + source "unchecked"
import type { Props, Source } from "../model/zone";
import { FRICTION } from "./surfaces";

export const MAX_ZONES = 200;     // เพดานจำนวน Zone ต่อฉาก (กันแลค) เกินแล้วแจ้ง DM
export const HASH_FT = 10;        // ขนาดช่อง spatial hash (ฟุต)
export const ROUND_SEC = 6;       // 1 รอบ = 6 วินาที (10 รอบ = 1 นาที)

type Adj = { mul?: number; add?: number };

export interface Preset {
  label: string;
  layer: number;                       // สูง = อยู่บน
  source: Source;                      // ที่มาของตัวเลขในชุดนี้
  color: string;                       // สีของ Region ใน Foundry
  props: Partial<Props>;
  adjust?: { flammability?: Adj };     // ปรับค่าของสิ่งที่อยู่ข้างล่าง (เช่น น้ำทำให้ไม้เปียก)
}
export interface Catalog { materials: Record<string, Preset>; substances: Record<string, Preset> }

// พื้นเปล่า (ไม่มี Zone) = floor
export const BASE_PROPS: Props = {
  mu: FRICTION.floor, flammability: 0, fuel: 0, conductivity: 0, hardness: 0, difficult: false, obscured: 0,
};

// วัสดุ: ถาวร DM ติดป้ายครั้งเดียวตอนทำแมพ
export const MATERIALS: Record<string, Preset> = {
  stone:  { label: "หิน",   layer: 0, source: "house", color: "#888888", props: { flammability: 0,   fuel: 0, conductivity: 0.05, hardness: 8 } },
  wood:   { label: "ไม้",   layer: 0, source: "house", color: "#8b5a2b", props: { flammability: 0.6, fuel: 3, conductivity: 0.05, hardness: 3 } },
  metal:  { label: "เหล็ก", layer: 0, source: "house", color: "#9aa5b1", props: { flammability: 0,   fuel: 0, conductivity: 1,    hardness: 9 } },
  dirt:   { label: "ดิน",   layer: 0, source: "house", color: "#6b4f2a", props: { flammability: 0.05, fuel: 0, conductivity: 0.1, hardness: 2 } },
  grass:  { label: "หญ้า",  layer: 0, source: "house", color: "#4a8c3a", props: { flammability: 0.5, fuel: 1, conductivity: 0.05, hardness: 1 } },
  sand:   { label: "ทราย",  layer: 0, source: "house", color: "#d8c27a", props: { flammability: 0,   fuel: 0, conductivity: 0.05, hardness: 1 } },
  forest: { label: "ป่า",   layer: 0, source: "house", color: "#2f6b2f", props: { flammability: 0.6, fuel: 5, conductivity: 0.05, hardness: 2 } },
};

// สาร: ชั่วคราว มีหมดอายุ ผู้เล่นสร้างได้. mu ของสารมาจาก FRICTION (ชั้นบนสุดชนะ)
export const SUBSTANCES: Record<string, Preset> = {
  water: { label: "น้ำ", layer: 10, source: "house", color: "#3b7dd8",
    props: { mu: FRICTION.water, conductivity: 0.6 }, adjust: { flammability: { mul: 0.1 } } },   // ไม้เปียกติดไฟยากมาก
  mud:   { label: "โคลน", layer: 11, source: "house", color: "#5a4632", props: { mu: FRICTION.mud, conductivity: 0.3 } },
  oil:   { label: "น้ำมัน", layer: 20, source: "house", color: "#2b2b2b",                          // ลอยบนน้ำ จึงอยู่ชั้นบน
    props: { mu: FRICTION.oil, flammability: 0.9, fuel: 2 } },
  // TODO(ยังไม่ได้ตรวจ): "difficult terrain + DEX save" ของน้ำแข็งตาม DMG ต้องอ่านจาก compendium ก่อนยืนยัน
  ice:   { label: "น้ำแข็ง", layer: 25, source: "unchecked", color: "#bfe6f5",
    props: { mu: FRICTION.ice, conductivity: 0.1, difficult: true } },
  fire:  { label: "ไฟ", layer: 30, source: "house", color: "#e8590c", props: { flammability: 0 } },   // ดาเมจไฟ: TODO ดึงจาก compendium/DM
};

export const CATALOG: Catalog = { materials: MATERIALS, substances: SUBSTANCES };
