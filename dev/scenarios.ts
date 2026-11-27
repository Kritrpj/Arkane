// Ready-made test cases for the harness. Each one sets up the board, picks the rulebook, forces the dice,
// says WHAT TO LOOK FOR (note) and checks it (verify). tests/scenarios.test.ts runs every verify(), so the
// text you read in the sidebar and what the code really does cannot drift apart.
import type { Effect } from "../src/model/effect";
import { makeCreature, makeProp } from "../src/model/make";
import { PUSH } from "../src/data/push";
import type { Usable } from "../src/actions/types";
import { emptyStage, type RulesKey, type Stage } from "./stage";

export interface RunResult { can: Usable; fx: Effect[]; stage: Stage }
export interface Scenario {
  id: string; group: string; label: string; note: string;
  unchecked?: boolean;                                      // true = no expectation to verify (e.g. real chapter maps)
  rules: RulesKey; d20: number; die: number;                // forced dice: d20 and every damage die (3 = a middling roll)
  mode?: "push" | "prone";
  action?: "shove" | "charge";                              // default shove
  actor: string; target: string;
  build(): Stage;
  verify(r: RunResult): boolean;
}

// ---- helpers to read effects
const pushOf = (fx: Effect[], id: string) => fx.find((e) => e.kind === "push" && e.target === id) as Extract<Effect, { kind: "push" }> | undefined;
const dmgOf = (fx: Effect[], id: string) => fx.find((e) => e.kind === "damage" && e.target === id) as Extract<Effect, { kind: "damage" }> | undefined;
const proneOf = (fx: Effect[], id: string) => fx.some((e) => e.kind === "prone" && e.target === id);
const logs = (fx: Effect[]) => fx.filter((e): e is Extract<Effect, { kind: "log" }> => e.kind === "log").map((e) => e.text);
const bumps = (fx: Effect[]) => logs(fx).filter((l) => l.includes(" ชน ") && !l.includes("ผลัก")).length;

// ---- people
const hero = (o = {}) => makeCreature({ id: "hero", name: "Hero", pos: { col: 2, row: 3 }, mod: { str: 3 }, save: { str: 3, dex: 1 }, ...o });   // STR 16, 180 lb
const gob = (o = {}) => makeCreature({ id: "gob", name: "Goblin", pos: { col: 3, row: 3 }, size: "sm", save: { str: -1, dex: 2 }, ...o });       // 60 lb
const bob = (o = {}) => makeCreature({ id: "bob", name: "Bob", pos: { col: 3, row: 3 }, save: { str: 0, dex: 0 }, ...o });                       // 180 lb
const giant = (o = {}) => makeCreature({ id: "giant", name: "Giant", pos: { col: 0, row: 2 }, size: "huge", footprint: 3, mod: { str: 6 }, save: { str: 6, dex: 0 }, ...o });   // STR 22
const rat = (o = {}) => makeCreature({ id: "rat", name: "Rat", pos: { col: 6, row: 3 }, size: "tiny", save: { str: -4, dex: 2 }, ...o });
const strongSmall = (o = {}) => makeCreature({ id: "small", name: "Small", pos: { col: 2, row: 3 }, size: "sm", mod: { str: 5 }, save: { str: 5, dex: 2 }, ...o });   // STR 20 but only 60 lb
const ogre = (o = {}) => makeCreature({ id: "ogre", name: "Ogre", pos: { col: 3, row: 3 }, size: "lg", footprint: 2, save: { str: 4, dex: -1 }, ...o });            // 900 lb
const crate = (o = {}) => makeProp({ id: "crate", name: "Crate", pos: { col: 5, row: 3 }, ...o });
const pit = (c1: number, c2: number, r1: number, r2: number, ft = -20) => {
  const h: Record<string, number> = {};
  for (let c = c1; c <= c2; c++) for (let r = r1; r <= r2; r++) h[`${c},${r}`] = ft;
  return h;
};
const wallV = (col: number) => [{ c: [col * 100, 0, col * 100, 800] }];       // vertical wall on the left edge of column `col`

export const SCENARIOS: Scenario[] = [
  // ============ 2024 rulebook ============
  { id: "r2024-basic", group: "กฎ 2024", label: "ผลักปกติ 1 ช่อง", rules: "2024", d20: 1, die: 3, actor: "hero", target: "gob",
    note: "ผลักได้ 5 ฟุตเสมอ ไม่สนน้ำหนัก ดู sidebar ว่ากฎนี้ไม่คิดแรง",
    build: () => emptyStage({ creatures: [hero(), gob()] }),
    verify: ({ fx }) => pushOf(fx, "gob")?.to.col === 4 },
  { id: "r2024-blocked", group: "กฎ 2024", label: "มีลังขวาง = ผลักไม่ได้", rules: "2024", d20: 1, die: 3, actor: "hero", target: "gob",
    note: "ลังอยู่ติดหลังเป้าหมาย ไม่มีที่ให้ไป ไม่มีดาเมจ ไม่ดันลัง",
    build: () => emptyStage({ creatures: [hero(), gob()], props: [crate({ pos: { col: 4, row: 3 } })] }),
    verify: ({ fx }) => !pushOf(fx, "gob") && logs(fx).some((l) => l.includes("ผลักไม่ได้")) },
  { id: "r2024-stops", group: "กฎ 2024", label: "ชนคนหลังเป้า = หยุด ไม่ดาเมจ", rules: "2024", d20: 1, die: 3, actor: "giant", target: "gob",
    note: "ยักษ์แรงมากก็ยังไป 1 ช่อง และถ้ามีลังอยู่ถัดไปก็แค่หยุด",
    build: () => emptyStage({ creatures: [giant({ pos: { col: 0, row: 2 } }), gob({ pos: { col: 3, row: 3 } })], props: [crate({ pos: { col: 5, row: 3 } })] }),
    verify: ({ fx }) => pushOf(fx, "gob")?.to.col === 4 && !dmgOf(fx, "gob") },

  // ============ physics: how far ============
  { id: "ph-equal", group: "Physics: ระยะผลัก", label: "คนปกติผลักคนปกติ ≈ 1 ช่อง", rules: "physics", d20: 1, die: 3, actor: "hero", target: "bob",
    note: "STR 16 ผลักคน 180 lb ได้ราว 6.7 ฟุต ปัดเป็น 1 ช่อง ลองแก้มวล Bob ใน inspector ดูระยะเปลี่ยน",
    build: () => emptyStage({ creatures: [hero(), bob()] }),
    verify: ({ fx }) => pushOf(fx, "bob")?.to.col === 4 },
  { id: "ph-light", group: "Physics: ระยะผลัก", label: "ผลักก็อบลินตัวเบา ไปหลายช่อง", rules: "physics", d20: 1, die: 3, actor: "hero", target: "gob",
    note: "ก็อบลิน 60 lb ต้านน้อย ไปไกลกว่าคนปกติมาก (4 ช่อง)",
    build: () => emptyStage({ creatures: [hero(), gob()] }),
    verify: ({ fx }) => pushOf(fx, "gob")?.to.col === 7 },
  { id: "ph-halfling", group: "Physics: ระยะผลัก", label: "ฮาล์ฟลิงผลักคนใส่เกราะ ไม่ขยับ", rules: "physics", d20: 1, die: 3, actor: "halfling", target: "knight",
    note: "ตัวเบา STR ต่ำ แรงที่ส่งได้ถูก traction จำกัด ดูบรรทัด 'จำกัดแรง'",
    build: () => emptyStage({ creatures: [makeCreature({ id: "halfling", name: "Halfling", size: "sm", pos: { col: 2, row: 3 }, mod: { str: -1 } }), makeCreature({ id: "knight", name: "Knight", pos: { col: 3, row: 3 }, mass: 260, massSource: "override" })] }),
    verify: ({ fx }) => !pushOf(fx, "knight") && logs(fx).some((l) => l.includes("ขยับไม่ไหว")) },
  { id: "ph-statue", group: "Physics: ระยะผลัก", label: "ตัวหนัก 5000 lb ไม่ขยับ (รูปปั้น)", rules: "physics", d20: 1, die: 3, actor: "hero", target: "statue",
    note: "F ≤ μW จึงขยับไม่ได้ โดยสูตรเอง ไม่มีเงื่อนไขพิเศษ",
    build: () => emptyStage({ creatures: [hero(), makeCreature({ id: "statue", name: "Golem", pos: { col: 3, row: 3 }, mass: 5000, massSource: "override" })] }),
    verify: ({ fx }) => !pushOf(fx, "statue") },
  { id: "ph-oil-pusher", group: "Physics: ระยะผลัก", label: "ผู้ผลักยืนบนน้ำมัน = ผลักไม่ออก", rules: "physics", d20: 1, die: 3, actor: "hero", target: "bob",
    note: "traction ของผู้ผลักเหลือแทบศูนย์ แรงส่งไม่ถึง μW ของเป้าหมาย",
    build: () => emptyStage({ creatures: [hero(), bob()], surfaces: { "2,3": "oil" } }),
    verify: ({ fx }) => !pushOf(fx, "bob") },
  { id: "ph-oil-target", group: "Physics: ระยะผลัก", label: "เป้าหมายยืนบนน้ำมัน ไถลไกลมาก", rules: "physics", d20: 1, die: 3, actor: "hero", target: "bob",
    note: "μ ต่ำ (0.1) เสียดทานน้อย ไถลไป 8 ช่องจากแรงเท่าเดิม",
    build: () => emptyStage({ creatures: [hero(), bob()], surfaces: { "3,3": "oil" } }),
    verify: ({ fx }) => (pushOf(fx, "bob")?.to.col ?? 0) >= 10 },
  { id: "ph-giant", group: "Physics: ระยะผลัก", label: "ยักษ์ปาคน ไปไกลหลายช่อง", rules: "physics", d20: 1, die: 3, actor: "giant", target: "bob",
    note: "ตัวคูณขนาด huge ×4 และ STR 22 ได้แรง 2640 lb",
    build: () => emptyStage({ cols: 18, creatures: [giant({ pos: { col: 0, row: 3 } }), bob({ pos: { col: 3, row: 4 } })] }),
    verify: ({ fx }) => (pushOf(fx, "bob")?.to.col ?? 0) >= 8 },
  { id: "ph-round-nearest", group: "Physics: ระยะผลัก", label: "ปัดใกล้สุด: 8 ฟุต = 2 ช่อง", rules: "physics", d20: 1, die: 3, actor: "hero", target: "x",
    note: "มวล 150 lb ได้ระยะ 8.0 ฟุต = 1.6 ช่อง ปัดใกล้สุดเป็น 2 (เทียบกับเคส floor)",
    build: () => emptyStage({ creatures: [hero(), makeCreature({ id: "x", name: "X", pos: { col: 3, row: 3 }, mass: 150, massSource: "override" })] }),
    verify: ({ fx }) => pushOf(fx, "x")?.to.col === 5 },
  { id: "ph-round-floor", group: "Physics: ระยะผลัก", label: "ปัดลง (floor): 8 ฟุต = 1 ช่อง", rules: "physics-floor", d20: 1, die: 3, actor: "hero", target: "x",
    note: "ตัวเลขเดียวกับเคสก่อนหน้า แต่ปัดลง จึงได้ 1 ช่อง",
    build: () => emptyStage({ creatures: [hero(), makeCreature({ id: "x", name: "X", pos: { col: 3, row: 3 }, mass: 150, massSource: "override" })] }),
    verify: ({ fx }) => pushOf(fx, "x")?.to.col === 4 },

  // ============ walls and edges ============
  { id: "ph-wall", group: "กำแพงและขอบ", label: "ยักษ์ปาคนชนกำแพง = ดาเมจ", rules: "physics", d20: 1, die: 3, actor: "giant", target: "bob",
    note: "พลังงานที่เหลือ ÷ น้ำหนัก = ความสูงเทียบเท่า (13 ฟุต) → 1d6 ต่อ 10 ฟุต + เศษ 0.3 ของ d6 = 3 + 1 = 4 ดูสูตรเต็มในกล่อง 'ทำไมถึงได้ผลนี้' ลองลาก/ลบกำแพงด้วยเครื่องมือกำแพง",
    build: () => emptyStage({ creatures: [giant({ pos: { col: 0, row: 3 } }), bob({ pos: { col: 3, row: 4 } })], walls: wallV(7) }),
    verify: ({ fx }) => dmgOf(fx, "bob")?.amount === 4 && pushOf(fx, "bob")?.to.col === 6 },
  { id: "ph-wall-gentle", group: "กำแพงและขอบ", label: "ผลักเบาๆ ชนกำแพง ไม่เจ็บ", rules: "physics", d20: 1, die: 3, actor: "hero", target: "bob",
    note: "ชนกำแพงที่ระยะ 1 ช่อง ความสูงเทียบเท่าต่ำกว่า 1 ฟุต ถือว่าแค่กระแทกเบา ๆ ไม่ขึ้นดาเมจ (ขั้นต่ำอยู่ที่ data/fall.ts)",
    build: () => emptyStage({ creatures: [hero(), bob()], walls: wallV(5) }),
    verify: ({ fx }) => !dmgOf(fx, "bob") },
  { id: "ph-pit", group: "กำแพงและขอบ", label: "ตกหลุม 20 ฟุต = 2d6 + ล้ม", rules: "physics", d20: 1, die: 3, actor: "hero", target: "gob",
    note: "ตกจากขอบใช้ตารางเดียวกับชนกำแพง วัดความสูงจากจุดเริ่มถึงจุดจบ",
    build: () => emptyStage({ creatures: [hero(), gob()], heights: pit(6, 9, 1, 5) }),
    verify: ({ fx }) => dmgOf(fx, "gob")?.amount === 6 && proneOf(fx, "gob") },
  { id: "ph-fly", group: "กำแพงและขอบ", label: "ตัวบินไม่ตกหลุม", rules: "physics", d20: 1, die: 3, actor: "hero", target: "gob",
    note: "ก็อบลินมี tag flying (ดูในช่อง inspector) จึงลอยข้ามหลุม ลองติ๊กออกแล้วกดผลักใหม่",
    build: () => emptyStage({ creatures: [hero(), gob({ tags: ["flying"] })], heights: pit(6, 9, 1, 5) }),
    verify: ({ fx }) => !!pushOf(fx, "gob") && !dmgOf(fx, "gob") && !proneOf(fx, "gob") },

  // ============ creatures and props in the way ============
  { id: "ph-crate", group: "ชนคน/ของ", label: "ปาคนชนลังเบา ลังไถลตาม", rules: "physics", d20: 1, die: 3, actor: "giant", target: "bob",
    note: "ผู้ถูกผลักกับลังไปด้วยกัน (inelastic) ผู้ถูกผลักตามหลังลังติดกัน",
    build: () => emptyStage({ creatures: [giant({ pos: { col: 0, row: 3 } }), bob({ pos: { col: 3, row: 4 } })], props: [crate({ pos: { col: 6, row: 4 } })] }),
    verify: ({ fx }) => { const c = pushOf(fx, "crate"), b = pushOf(fx, "bob"); return !!c && !!b && b.to.col === c.to.col - 1; } },
  { id: "ph-statue-prop", group: "ชนคน/ของ", label: "ชนรูปปั้นหิน: ไม่ขยับ ผู้ชนเจ็บเท่ากำแพง", rules: "physics", d20: 1, die: 3, actor: "giant", target: "bob",
    note: "รูปปั้นหนัก 10,000 lb ถูกชนแทบเหมือนกำแพง ผู้ชนรับพลังงานเกือบเต็ม",
    build: () => emptyStage({ creatures: [giant({ pos: { col: 0, row: 3 } }), bob({ pos: { col: 3, row: 4 } })], props: [makeProp({ id: "statue", name: "Statue", material: "stone", heightFt: 6, pos: { col: 6, row: 4 } })] }),
    verify: ({ fx }) => !pushOf(fx, "statue") && !!dmgOf(fx, "bob") },
  { id: "ph-immovable", group: "ชนคน/ของ", label: "เสาตรึง (immovable) เหมือนกำแพง", rules: "physics", d20: 1, die: 3, actor: "giant", target: "bob",
    note: "เสาเบาแต่ติด tag immovable จึงเป็นมวลอนันต์ ไม่ขยับ ผู้ชนเจ็บเต็มพลังงาน",
    build: () => emptyStage({ creatures: [giant({ pos: { col: 0, row: 3 } }), bob({ pos: { col: 3, row: 4 } })], props: [makeProp({ id: "post", name: "Post", mass: 5, tags: ["prop", "immovable"], pos: { col: 6, row: 4 } })] }),
    verify: ({ fx }) => !pushOf(fx, "post") && !!dmgOf(fx, "bob") },
  { id: "ph-crate-pit", group: "ชนคน/ของ", label: "ลังถูกดันตกหลุม (ของไม่เจ็บ)", rules: "physics", d20: 1, die: 3, actor: "giant", target: "bob",
    note: "ลังตกลงไปในหลุมถัดไป ของไม่มี HP จึงมีแค่บรรทัด log",
    build: () => emptyStage({ creatures: [giant({ pos: { col: 0, row: 3 } }), bob({ pos: { col: 3, row: 4 } })], props: [crate({ pos: { col: 6, row: 4 } })], heights: pit(7, 8, 2, 6) }),
    verify: ({ fx }) => !dmgOf(fx, "crate") && logs(fx).some((l) => l.includes("Crate ตกลงมา 20 ฟุต")) },
  { id: "ph-chain", group: "ชนคน/ของ", label: "ลูกโซ่: ก็อบลิน → ลัง → Rat → ตกหลุม", rules: "physics", d20: 1, die: 3, actor: "giant", target: "gob",
    note: "ลังถูกขวางด้วย Rat จึงชนต่อ Rat ถูกดันลงหลุม ดูหัวข้อ 'ชนของ' ใน sidebar ว่าพลังงานลดลงทีละครั้ง",
    build: () => emptyStage({ creatures: [giant({ pos: { col: 0, row: 2 } }), gob({ pos: { col: 3, row: 3 } }), rat()], props: [crate()], heights: pit(7, 8, 2, 4) }),
    verify: ({ fx }) => logs(fx).some((l) => l.includes("Crate ชน Rat")) && !!pushOf(fx, "rat") && !!dmgOf(fx, "rat") },
  { id: "ph-hurt-light", group: "ชนคน/ของ", label: "คนที่ถูกชนตัวเล็กมากเจ็บหนัก (Pixie)", rules: "physics", d20: 1, die: 3, actor: "giant", target: "bob",
    note: "ยักษ์ STR 30 ปาคนไปชนพิกซี่ 10 lb ฝั่งที่เบากว่ารับพลังงานที่เสียเกือบหมด",
    build: () => emptyStage({ creatures: [giant({ pos: { col: 0, row: 3 }, mod: { str: 10 } }), bob({ pos: { col: 3, row: 4 } }), makeCreature({ id: "pixie", name: "Pixie", size: "tiny", pos: { col: 5, row: 4 } })] }),
    verify: ({ fx }) => !!dmgOf(fx, "pixie") && !dmgOf(fx, "bob") },
  { id: "ph-queue", group: "ชนคน/ของ", label: "คิว 8 คน: ลูกโซ่ถูกตัดตามเพดาน", rules: "physics", d20: 1, die: 3, actor: "giant", target: "bob",
    note: `มีคนยืนต่อแถวยาวกว่า PUSH.maxChain (${PUSH.maxChain}) ลูกโซ่ต้องหยุดที่เพดาน`,
    build: () => emptyStage({ cols: 18, creatures: [giant({ pos: { col: 0, row: 3 }, mod: { str: 20 } }), bob({ pos: { col: 3, row: 4 } }),
      ...Array.from({ length: 8 }, (_, i) => makeCreature({ id: `q${i}`, name: `Q${i}`, pos: { col: 5 + i, row: 4 } }))] }),
    verify: ({ fx }) => bumps(fx) === PUSH.maxChain },

  // ============ small but strong ============
  { id: "sm-strong", group: "ตัวเล็กแรงสูง", label: "ตัวเล็ก STR 20 ผลักคนปกติ: แรงเยอะแต่ไม่ขยับ", rules: "physics", d20: 1, die: 3, actor: "small", target: "bob",
    note: "STR 20 ให้แรงได้ 600 lb แต่เท้าส่งแรงลงพื้นได้แค่ traction = μ × bracing × น้ำหนักตัวเอง = 0.6 × 5 × 60 = 180 lb ผลักได้แค่ 2.5 ฟุต (ไม่ถึงครึ่งช่อง) ลองแก้มวล Small เป็น 250 ใน inspector เปรียบเทียบกับเคสถัดไป",
    build: () => emptyStage({ creatures: [strongSmall(), bob()] }),
    verify: ({ fx }) => !pushOf(fx, "bob") && logs(fx).some((l) => l.includes("ขยับไม่ไหว")) },
  { id: "sm-dense", group: "ตัวเล็กแรงสูง", label: "ตัวเล็กแต่หนักแน่น (250 lb) ผลักคนปกติ ไปได้ 2 ช่อง", rules: "physics", d20: 1, die: 3, actor: "small", target: "bob",
    note: "ตัวเล็กเหมือนกันแต่หนัก 250 lb (เช่น ใส่เกราะหนัก): traction = 0.6 × 5 × 250 = 750 lb แรงส่งได้เต็ม 600 lb → 8.3 ฟุต = 2 ช่อง น้ำหนักตัวคือสิ่งที่ทำให้แรงถูกส่งออกไปได้",
    build: () => emptyStage({ creatures: [strongSmall({ mass: 250, massSource: "override" }), bob()] }),
    verify: ({ fx }) => pushOf(fx, "bob")?.to.col === 5 },
  { id: "sm-size-rule", group: "ตัวเล็กแรงสูง", label: "ตัวเล็กผลัก Ogre: กฎขนาด 5e ห้าม", rules: "physics", d20: 1, die: 3, actor: "small", target: "ogre",
    note: "5e ห้ามผลักตัวที่ใหญ่กว่าเกิน 1 ขนาด (sm → lg = 2 ขนาด) เปลี่ยนกฎด้านบนเป็น 'Physics ไม่จำกัดขนาด' แล้วดูว่าฟิสิกส์ตัดสินอย่างไร",
    build: () => emptyStage({ creatures: [strongSmall(), ogre()] }),
    verify: ({ can }) => !can.ok },
  { id: "sm-free", group: "ตัวเล็กแรงสูง", label: "ไม่จำกัดขนาด: ตัวเล็กหนักแน่นผลัก Ogre ขยับแค่นิดเดียว", rules: "physics-nosize", d20: 1, die: 3, actor: "small", target: "ogre",
    note: "Ogre 900 lb ต้านเสียดทาน 0.6 × 900 = 540 lb แรงสูงสุดของ Small (250 lb, STR 20) คือ 600 lb เกินแค่นิดเดียว จึงไถลได้แค่ 1.7 ฟุต ไม่ถึงครึ่งช่อง (แชตขึ้น 'ขยับไม่ไหว'); ถ้า Small ตัวเบา 60 lb แรงส่งแค่ 180 lb ต่ำกว่าแรงเสียดทาน ไม่ขยับเลยตั้งแต่ต้น ผลในแชตเหมือนกัน แต่ดูตัวเลขได้ใน 'ทำไมถึงได้ผลนี้'",
    build: () => emptyStage({ creatures: [strongSmall({ mass: 250, massSource: "override" }), ogre()] }),
    verify: ({ fx }) => !pushOf(fx, "ogre") && logs(fx).some((l) => l.includes("ขยับไม่ไหว")) },
  { id: "sm-charge-ogre", group: "ตัวเล็กแรงสูง", label: "ตัวเล็กพุ่งชน Ogre: ตัวเล็กเจ็บเอง Ogre ไม่ขยับ", rules: "physics", action: "charge", d20: 1, die: 3, actor: "small", target: "ogre",
    note: "วิ่ง 15 ฟุตได้พลังงาน ≈ 210 ft-lb แต่ชนของหนักกว่า 15 เท่า พลังงานที่เสียไปตกที่ฝั่งเบา ตัวเล็กรับเทียบเท่าตก 3.1 ฟุต (= 0.31 ของ d6 → เจ็บ 1) Ogre รับแทบไม่ได้",
    build: () => emptyStage({ cols: 12, creatures: [strongSmall({ pos: { col: 0, row: 3 } }), ogre({ pos: { col: 4, row: 3 } })] }),
    verify: ({ fx }) => !pushOf(fx, "ogre") && (dmgOf(fx, "small")?.amount ?? 0) > 0 && !dmgOf(fx, "ogre") },
  { id: "charge-basic", group: "ตัวเล็กแรงสูง", label: "คนปกติพุ่งชนก็อบลิน: พากันไปอีก 1 ช่อง", rules: "physics", action: "charge", d20: 1, die: 3, actor: "hero", target: "gob",
    note: "ระบบเคลื่อนที่/ชนตัวเดียวกับการผลัก แค่พลังงานมาจากการวิ่ง (แรงเกาะพื้น + ความเร็วสูงสุด + น้ำหนักตัว) Hero ตามไปด้วย ก็อบลินเจ็บเล็กน้อยจากการกระแทก",
    build: () => emptyStage({ cols: 12, creatures: [hero({ pos: { col: 1, row: 3 } }), gob({ pos: { col: 5, row: 3 } })] }),
    verify: ({ fx }) => pushOf(fx, "hero")?.to.col === 5 && pushOf(fx, "gob")?.to.col === 6 && (dmgOf(fx, "gob")?.amount ?? 0) > 0 },

  // ============ rules around the shove ============
  { id: "save-pass", group: "กฎรอบๆ", label: "เป้าหมายผ่าน save = ไม่ขยับ", rules: "2024", d20: 20, die: 3, actor: "hero", target: "gob",
    note: "บังคับ d20 = 20 ดูบรรทัดทอย save", build: () => emptyStage({ creatures: [hero(), gob()] }),
    verify: ({ fx }) => !pushOf(fx, "gob") && logs(fx).some((l) => l.includes("ยืนมั่น")) },
  { id: "prone-mode", group: "กฎรอบๆ", label: "เลือกผลักให้ล้ม (prone)", rules: "2024", d20: 1, die: 3, mode: "prone", actor: "hero", target: "gob",
    note: "โหมดล้ม ไม่เคลื่อนที่ แค่ล้ม", build: () => emptyStage({ creatures: [hero(), gob()] }),
    verify: ({ fx }) => proneOf(fx, "gob") && !pushOf(fx, "gob") },
  { id: "paralyzed", group: "กฎรอบๆ", label: "เป้าหมาย paralyzed พลาด save อัตโนมัติ", rules: "2024", d20: 20, die: 3, actor: "hero", target: "gob",
    note: "ถึง d20 = 20 ก็ล้มเหลวเพราะ STR/DEX save ของ paralyzed ล้มเหลวอัตโนมัติ",
    build: () => emptyStage({ creatures: [hero(), gob({ conditions: ["paralyzed"] })] }),
    verify: ({ fx }) => !!pushOf(fx, "gob") },
  { id: "too-big", group: "กฎรอบๆ", label: "ผลักตัวที่ใหญ่กว่าเกิน 1 ขนาดไม่ได้", rules: "2024", d20: 1, die: 3, actor: "pixie", target: "giant",
    note: "Pixie (tiny) ผลักยักษ์ (huge) ไม่ได้ ดู 'ใช้ไม่ได้' ใน sidebar",
    build: () => emptyStage({ creatures: [makeCreature({ id: "pixie", name: "Pixie", size: "tiny", pos: { col: 3, row: 3 } }), giant({ pos: { col: 4, row: 2 } })] }),
    verify: ({ can }) => !can.ok },
  { id: "not-adjacent", group: "กฎรอบๆ", label: "ไม่ติดกัน ผลักไม่ได้", rules: "2024", d20: 1, die: 3, actor: "hero", target: "gob",
    note: "ลองลากเป้าหมายให้ชิดผู้ผลัก (รวมทแยง) จะใช้ได้", build: () => emptyStage({ creatures: [hero(), gob({ pos: { col: 6, row: 3 } })] }),
    verify: ({ can }) => !can.ok },
];
