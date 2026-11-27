// Zone = ข้อมูลของเราที่บอกว่าพื้นที่หนึ่งเป็นอะไร (Foundry Scene Region เป็นแค่ฝ่ายวาด)
// หน่วยทุกอย่างเป็น "ฟุตต่อเนื่อง" วัดจากมุมบนซ้ายของกริด (ไม่ปัดเป็นช่องจนกว่าจะแสดงผล)

export interface Point { x: number; y: number }   // ฟุต

// รูปร่างหลายชิ้นในโซนเดียวได้ (merge = เอารูปร่างมาต่อกัน); hole = เจาะรู
export type Shape = (
  | { type: "circle"; x: number; y: number; r: number }                // จุดกลาง + รัศมี
  | { type: "rect"; x: number; y: number; w: number; h: number }       // มุมบนซ้าย + กว้าง/สูง (ไม่หมุน)
  | { type: "polygon"; points: Point[] }
) & { hole?: boolean };

// ที่มาของตัวเลข: RAW = หนังสือ D&D, physics = คำนวณตามฟิสิกส์, house = ตั้งเอง (ต้องถาม DM),
// unchecked = ยังไม่ได้ตรวจกับแหล่งทางการ (ห้ามเชื่อ ต้องตรวจก่อนใช้จริง)
export type Source = "RAW" | "physics" | "house" | "unchecked";

export interface Props {
  mu: number;             // แรงเสียดทาน (ใช้ในกฎ physics)
  flammability: number;   // 0..1 ติดไฟง่ายแค่ไหน
  fuel: number;           // เชื้อเพลิง: ไหม้ได้กี่รอบ
  conductivity: number;   // 0..1 นำไฟฟ้า
  hardness: number;       // ไว้ต่อยอด
  difficult: boolean;     // difficult terrain
  obscured: 0 | 1 | 2;    // บัง/มืด 0 ไม่มี 1 เบา 2 หนัก
}

export interface Hazard {
  name?: string;          // ชื่อคาถา/แหล่งที่มา: ชื่อเดียวกันไม่ทบกัน
  type: string;           // "fire", "cold"...
  amount: number;
  trigger: "enter" | "endTurn";
  source: Source;
}

// หมดอายุ: ตามรอบ combat (1 รอบ = 6 วิ) หรือตามเวลาโลก (วินาที)
export type Expiry =
  | { kind: "round"; at: number; combat?: string }
  | { kind: "world"; at: number };

export interface Zone {
  id: string;
  kind: string;               // คีย์ใน catalog: วัสดุ (ถาวร) หรือสาร (ชั่วคราว) ดู data/zones.ts
  permanent: boolean;
  shapes: Shape[];
  name?: string;
  volume?: number;            // ft³ (โหมดตามปริมาตร)
  depth?: number;             // ft ความลึกที่ใช้เกลี่ยตอนสร้าง
  caster?: string;            // id ผู้เสก
  concentration?: boolean;    // ผูกสมาธิกับ caster
  expires?: Expiry;
  layer?: number;             // ทับค่าเริ่มต้นของ catalog (สูง = อยู่บน)
  overrides?: Partial<Props>; // DM แก้ทีละค่า
  hazard?: Hazard;
  burn?: Record<string, number>;   // เชื้อเพลิงที่เหลือต่อช่อง "col,row" (ใช้กับไฟ; ไม่มี = ใช้ค่าเต็มจากพื้น)
}

export interface Clock { round?: number; combat?: string; worldTime: number }

export interface Resolved {
  props: Props;
  surface?: string;           // ชื่อสารชั้นบนสุดที่กำหนด mu (ใช้กับ FRICTION); undefined = พื้นเปล่า
  layers: string[];           // kind ของ zone ที่อยู่ตรงนั้น ล่างขึ้นบน
  hazards: Hazard[];          // ไม่ทบชื่อเดียวกัน
  sources: Partial<Record<keyof Props, Source>>;   // ค่าแต่ละตัวมาจากชุดไหน (DM แก้ทับ = house)
  trace: string[];            // อธิบายที่มาของทุกค่า ให้ DM ดู
}
