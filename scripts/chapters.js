// Chapters 2-4: scenes (maps, walls, lights, DM notes, teleports, cover), NPCs, items and a DM journal per chapter.
import { CHMAPS } from "./chmaps.js?v=21";
const MOD = "arkane-1920s";
const G = 100;
const ABS = ["str", "dex", "con", "int", "wis", "cha"];
const rect = ([x, y, w, h]) => ({ type: "rectangle", x: x * G, y: y * G, width: w * G, height: h * G, rotation: 0, hole: false });
const P = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.startsWith("- ") ? `<li>${l.slice(2)}</li>` : l.startsWith("## ") ? `<h3>${l.slice(3)}</h3>` : `<p>${l}</p>`).join("").replace(/(<li>.*?<\/li>)+/g, (m) => `<ul>${m}</ul>`);
const I = { claw: "icons/creatures/claws/claw-hooked-curved.webp", gun: "icons/weapons/guns/gun-pistol-flintlock-white.webp", auto: "icons/weapons/guns/gun-pistol-brass.webp",
  knife: "modules/arkane-1920s/items/melee-dagger.webp", harpoon: "icons/weapons/polearms/spear-hooked-rounded.webp", fist: "icons/skills/melee/unarmed-punch-fist.webp",
  needle: "modules/arkane-1920s/items/npc-syringe.webp", psy: "icons/magic/control/hypnosis-mesmerism-swirl.webp", tent: "modules/arkane-1920s/items/npc-tentacle.webp",
  staff: "icons/weapons/staves/staff-ornate-hook.webp", bite: "icons/creatures/abilities/mouth-teeth-sharp.webp" };

/* ---------------- NPCs ---------------- */
// key, name, chapter, [abilities], ac, hp, cr, move {walk, swim}, disposition, size, attacks [name, melee?, bonus, [n,d,b], type, range|null, img, note], stat-block text
const NPCS = [
  // Chapter 2
  { key: "rosso", ch: 2, name: "ดอน ลูก้า \"ปลาเงิน\" รอสโซ (บอส)", ab: [16, 12, 16, 12, 12, 16], ac: 14, hp: 60, cr: 3, walk: 30, swim: 40, disp: -1,
    atk: [["ตะปบ", true, 5, [1, 8, 3], "slashing", null, I.claw, "โจมตีหลายครั้ง: 2 ครั้งต่อ Action (ตะปบหรือปืนผสมกันได้)"], ["ปืนพกอัตโนมัติ .45", false, 3, [1, 10, 1], "piercing", "50/150", I.auto, "บรรจุ 7 นัด (ปืนในเกม)"]],
    text: `หัวหน้าซินดิเคทเหรียญจมน้ำสาขาท่าเรือ เคยเป็นมาเฟียหน้าหล่อ ตอนนี้ดวงตาโปน ผิวเป็นเกล็ด หายใจทางเหงือกที่คอ ยังใส่สูทสั่งตัดและหมวกเฟดอร่า
## ค่าสถานะ
AC 14 · HP 60 · ความเร็ว 30 ฟุต ว่ายน้ำ 40 ฟุต · CR 3 · Darkvision 60 · หายใจในน้ำได้
STR 16 DEX 12 CON 16 INT 12 WIS 12 CHA 16 · Intimidation +5 Deception +5
## Action
- โจมตีหลายครั้ง: 2 ครั้ง ตะปบ (+5, 1d8+3 ฟัน) หรือ ปืนพกอัตโนมัติ .45 (+3, 1d10+1 แทง ระยะ 50/150)
- เสียงเรียกจากก้นทะเล (ชาร์จ 5–6): ทุกคนในระยะ 30 ฟุตเซฟ WIS DC 13 ไม่ผ่านติด Frightened 1 นาที และทอยความหวาดผวา DC 13
## Bonus Action / Reaction
- ดำหนี: ถ้า HP ต่ำกว่าครึ่ง กระโดดลงแท็งก์ ว่ายออกตะแกรงใต้น้ำ ต้องหยุดเขาก่อนถึงตะแกรง (2 รอบ)
- ลูกน้องรับกระสุน (Reaction): เมื่อโดนโจมตีและมีลูกน้องอยู่ติดตัว ให้ลูกน้องรับดาเมจแทน
## เล่นบทบาท
พูดสุภาพแบบนักธุรกิจ เสนอดีลก่อนสู้เสมอ: "เอาตั๋วมา แล้วพวกเธอเดินออกไปได้" เขารู้ว่าของถูกส่งไปไหน และยอมบอกถ้าถูกต้อนจนมุม`},
  { key: "hybrid", ch: 2, name: "คนงานท่าเรือมีเหงือก", ab: [14, 12, 14, 8, 10, 8], ac: 12, hp: 18, cr: 0.5, walk: 30, swim: 30, disp: -1,
    atk: [["ตะปบ", true, 4, [1, 6, 2], "slashing", null, I.claw, ""], ["ฉมวกเกี่ยว", false, 4, [1, 8, 2], "piercing", "20/60", I.harpoon, "โดนแล้วเป้า Medium ลงมาถูกลากเข้าหา 10 ฟุต"]],
    text: `คนงานที่ดื่มน้ำจากแท็งก์ของบอสทุกคืน คอมีเหงือก ตาไม่กะพริบ ยังใส่ชุดคนงานและหมวกแก๊ป
## ค่าสถานะ
AC 12 · HP 18 · ความเร็ว 30 ฟุต ว่ายน้ำ 30 ฟุต · CR 1/2 · Darkvision 60 · หายใจในน้ำได้
STR 14 DEX 12 CON 14 INT 8 WIS 10 CHA 8
## Action
- ตะปบ +4 · 1d6+2 ฟัน
- ฉมวกเกี่ยว +4 ระยะ 20/60 · 1d8+2 แทง · เป้าโดนถูกลากเข้าหา 10 ฟุต
## ลักษณะ
- ลากลงน้ำ: ถ้าจับ (Grapple) เป้าที่อยู่ริมน้ำได้ จะลากลงน้ำทันที (เป้าหายใจไม่ได้)
- เห็นครั้งแรก: ทอยความหวาดผวา DC 10`},
  { key: "gunman", ch: 2, name: "มือปืนซินดิเคท", ab: [12, 14, 12, 10, 10, 10], ac: 13, hp: 22, cr: 1, walk: 30, disp: -1,
    atk: [["ปืนพกอัตโนมัติ .45", false, 4, [1, 10, 2], "piercing", "50/150", I.auto, "ยิงรัว (ชาร์จ 5–6): กรวย 15 ฟุต เซฟ DEX DC 12 ดาเมจ 2d8 ผ่านได้ครึ่ง"], ["มีดพับ", true, 4, [1, 4, 2], "piercing", null, I.knife, ""]],
    text: `มือปืนมนุษย์ของซินดิเคท ไม่รู้เรื่องลัทธิ รู้แค่ว่าเงินดี
## ค่าสถานะ
AC 13 · HP 22 · ความเร็ว 30 ฟุต · CR 1
STR 12 DEX 14 CON 12 INT 10 WIS 10 CHA 10
## Action
- ปืนพกอัตโนมัติ .45 +4 ระยะ 50/150 · 1d10+2 แทง
- ยิงรัว (ชาร์จ 5–6): กรวย 15 ฟุต เซฟ DEX DC 12 · 2d8 ผ่านได้ครึ่ง
- มีดพับ +4 · 1d4+2 แทง
## ลักษณะ
ถ้าบอสหนีหรือตาย มือปืนจะวางปืนยอมแพ้ทันที และเล่าได้ว่ารถบรรทุกขนลังไป "โรงพยาบาลเซนต์อัลดริก" ทุกคืนวันศุกร์`},
  { key: "captain", ch: 2, name: "กัปตันเอซรา ฮอลล์ (เรือแมรี่ แอนน์)", ab: [11, 12, 12, 12, 13, 11], ac: 11, hp: 13, cr: 0.125, walk: 30, disp: 0,
    atk: [["ลูกโม่เก่า", false, 3, [1, 10, 1], "piercing", "40/120", I.gun, ""]],
    text: `กัปตันเรือขนส่งที่ถูกบังคับให้ขนของให้ซินดิเคท ลูกเรือครึ่งลำหายไปในทะเล เขาอยากออกจากเรื่องนี้
## ค่าสถานะ
AC 11 · HP 13 · CR 1/8 · Navigator's Tools · Perception +3
## ข้อมูลที่ให้ได้ (Persuasion DC 12 หรือสัญญาว่าจะช่วยลูกเรือ)
- ของที่ขนมาคือ "ชิ้นส่วนเครื่องจักรโบราณ" งมได้จากซากเรือนอกชายฝั่ง
- ปลายทางคือโรงพยาบาลทหารผ่านศึก ผู้รับลงชื่อ "นพ. ก. เครน"
- รอสโซกลัวไฟ และไม่เคยออกจากห้องแท็งก์ตอนกลางวัน`},
  // Chapter 3
  { key: "director", ch: 3, name: "นพ. กาเบรียล เครน (ผู้อำนวยการ)", ab: [10, 12, 14, 18, 14, 16], ac: 13, hp: 75, cr: 4, walk: 30, disp: -1,
    atk: [["แส้จิต", false, 6, [2, 6, 4], "psychic", "60/60", I.psy, "โจมตีหลายครั้ง: 2 ครั้งต่อ Action"], ["ไม้เท้าเงิน", true, 3, [1, 6, 0], "bludgeoning", null, I.staff, ""]],
    text: `ผู้อำนวยการโรงพยาบาลทหารผ่านศึกเซนต์อัลดริก (\"นพ. ก.\" ในใบเสร็จของอาเธอร์) เชื่อว่ากำลัง "รักษา" ทหารที่ป่วย PTSD โดยส่งความทรมานของพวกเขาไปให้สิ่งที่หลับอยู่ใต้ทะเล
## ค่าสถานะ
AC 13 · HP 75 · CR 4 · INT 18 WIS 14 CHA 16 · เซฟ INT +6 WIS +4 · Insight +6 Medicine +6
## Action
- โจมตีหลายครั้ง: แส้จิต 2 ครั้ง (+6 ระยะ 60 ฟุต · 2d6+4 พลังจิต)
- คำสั่งนิ่ง (1/วัน): เป้าในระยะ 60 ฟุต เซฟ WIS DC 14 ไม่ผ่านติด Paralyzed จนจบเทิร์นถัดไปของเขา
## Bonus Action
- บิดพื้นที่: วาร์ปตัวเองไปจุดที่เห็นในระยะ 30 ฟุต หรือสลับที่สิ่งมีชีวิต 2 ตัวในระยะ 60 ฟุต (เซฟ CHA DC 14 ถ้าไม่ยอม)
## เครื่องแบตเตอรี่สังเวย
- ถ้ายังมีทหารต่อสายอยู่ 3 คนขึ้นไป: เครนต้านทานดาเมจทุกชนิด และฟื้น 10 HP ต้นเทิร์น
- ปลดทหาร 1 คน: Action + Medicine หรือ Arcana DC 13 (มีทั้งหมด 6 คน)
- ทำลายเครื่อง: AC 15 HP 40 (โทเคนเครื่องจักร)`},
  { key: "orderly", ch: 3, name: "ผู้คุมกลายพันธุ์", ab: [18, 10, 16, 6, 10, 6], ac: 13, hp: 45, cr: 2, walk: 30, disp: -1,
    atk: [["ทุบ", true, 6, [1, 8, 4], "bludgeoning", null, I.fist, "2 ครั้งต่อ Action · โดนทั้งสองครั้งเป้าติด Grappled (DC 14)"]],
    text: `ผู้คุมที่ถูกทดลองจนเนื้อหนังงอกเป็นก้อน ใส่ชุดขาวที่เปื้อนเลือด ไม่พูด ทำตามคำสั่งผู้อำนวยการเท่านั้น
## ค่าสถานะ
AC 13 · HP 45 · CR 2 · STR 18 CON 16 · Athletics +6
## Action
- โจมตีหลายครั้ง: ทุบ 2 ครั้ง (+6 · 1d8+4) โดนทั้งคู่เป้าติด Grappled (DC 14)
## ลักษณะ
- เนื้อผสาน: อยู่ในหอผู้ป่วยเนื้อ ฟื้น 5 HP ต้นเทิร์น
- เกลียดไฟ: โดนดาเมจไฟ เสียเปรียบการโจมตีเทิร์นถัดไป`},
  { key: "nurse", ch: 3, name: "พยาบาลลัทธิ", ab: [10, 14, 12, 12, 12, 12], ac: 12, hp: 22, cr: 0.5, walk: 30, disp: -1,
    atk: [["เข็มกล่อมประสาท", true, 4, [1, 4, 2], "piercing", null, I.needle, "โดนแล้วเซฟ CON DC 12 ไม่ผ่านติด Poisoned และความเร็ว 0 จนจบเทิร์นถัดไป"], ["มีดผ่าตัด", true, 4, [1, 4, 2], "slashing", null, I.knife, ""]],
    text: `พยาบาลที่เข้าลัทธิ ยิ้มตลอดเวลา ตาขาวไม่มีม่านตา
## ค่าสถานะ
AC 12 · HP 22 · CR 1/2 · Deception +3 Medicine +3
## Action
- เข็มกล่อมประสาท +4 · 1d4+2 แทง · เซฟ CON DC 12 ไม่ผ่านติด Poisoned และความเร็ว 0 จนจบเทิร์นถัดไป
## ลักษณะ
ถ้าผู้เล่นปลอมเป็นคนไข้ พยาบาลจะฉีดยาให้ทุกคน (Disadvantage เซฟ WIS จนกว่าจะพัก) แต่จะพาไปหอผู้ป่วย A โดยไม่สงสัย`},
  { key: "tommy", ch: 3, name: "สิบโททอมมี่ เรย์ (ผู้ป่วยที่ยังมีสติ)", ab: [12, 12, 10, 11, 9, 12], ac: 10, hp: 9, cr: 0, walk: 25, disp: 1,
    atk: [],
    text: `ทหารหนุ่มที่รอดจากรอยแยกสีขี้เถ้า ร่างกายผอมจากการถูกดูดพลัง แต่ยังพอมีสติ เคยรู้จักอาเธอร์ เพนเดิลตัน
## ข้อมูลที่ให้
- ทุกคืนผู้คุมพาผู้ป่วย 6 คนลงไปใต้ดิน บางคนไม่กลับมา
- ประตูลงใต้ดินอยู่หลังผนังห้องเก็บของ (มุมตะวันออกเฉียงใต้) กุญแจอยู่กับพยาบาลหัวหน้า
- "หมอบอกว่าเราจะได้ลืมสงคราม แต่ผมยังได้ยินเสียงจากทะเลทุกคืน"
## ถ้าช่วยออกไปได้
เขาจะเป็นพยานให้ C.A.A.M. และบอกว่าเครนส่ง "พลังงาน" ไปที่ไหนสักแห่งใต้เมือง (เบาะแส Chapter 4)`},
  { key: "machine", ch: 3, name: "เครื่องแบตเตอรี่สังเวย", ab: [10, 1, 18, 1, 1, 1], ac: 15, hp: 40, cr: 0, walk: 0, disp: -1, size: 2,
    atk: [],
    text: `เครื่องจักร Magitech โบราณที่ประกอบจากชิ้นส่วนที่งมขึ้นมาจากทะเล ผูกกับเก้าอี้ 6 ตัว
## ค่าสถานะ
AC 15 · HP 40 · ภูมิคุ้มกันพิษ พลังจิต · เปราะต่อฟ้าผ่าและไฟ (ดาเมจ ×2)
## ผลเมื่อพัง
- ทหารที่ยังต่ออยู่ทุกคนเซฟ CON DC 12 ไม่ผ่านเหลือ 0 HP (ช่วยได้ด้วย Medicine DC 10)
- เครนเสียความต้านทาน และติด Stunned 1 รอบ
- ถ้าเครื่องพังก่อนปลดทหาร: นาฬิกาห้วงนิทรา +1`},
  // Chapter 4
  { key: "cultist", ch: 4, name: "สาวกห้วงนิทรา", ab: [11, 12, 12, 10, 11, 10], ac: 12, hp: 16, cr: 0.5, walk: 30, disp: -1,
    atk: [["มีดพิธี", true, 4, [1, 6, 2], "piercing", null, I.knife, ""], ["ลูกโม่", false, 3, [1, 10, 1], "piercing", "40/120", I.gun, ""]],
    text: `ชาวเมืองธรรมดาที่ได้ยินเสียงเรียกในฝันจนลงมาใต้ดิน สวมผ้าคลุมเปียกน้ำ
## ค่าสถานะ
AC 12 · HP 16 · CR 1/2
## Action
- มีดพิธี +4 · 1d6+2 · ลูกโม่ +3 ระยะ 40/120 · 1d10+1
## ลักษณะ
- ฝูงคลั่ง: ได้ Advantage ถ้ามีสาวกอีกตัวอยู่ติดเป้า
- ถ้าหมอกจาง (ปิดรอยแยกสำเร็จ) สาวกที่เหลือจะได้สติ หยุดสู้และร้องไห้`},
  { key: "zealot", ch: 4, name: "นักบวชผู้เปิดรอยแยก", ab: [10, 12, 14, 12, 16, 16], ac: 13, hp: 40, cr: 2, walk: 30, disp: -1,
    atk: [["ไม้เท้าห้วงลึก", true, 4, [1, 6, 2], "bludgeoning", null, I.staff, "+1d6 ดาเมจเนโครติก"]],
    text: `ผู้นำพิธีที่แท่นบูชาข้างรอยแยก ถ้ายังมีชีวิตอยู่ พิธีจะเร่งให้ Herald โผล่เร็วขึ้น
## ค่าสถานะ
AC 13 · HP 40 · CR 2 · WIS 16 CHA 16
## Action
- ไม้เท้าห้วงลึก +4 · 1d6+2 + 1d6 เนโครติก
- Hold Person (เซฟ WIS DC 13) 2/วัน · Inflict Wounds (+5 · 3d10 เนโครติก) 1/วัน
## Bonus Action
- สวดเปิดทาง: Herald โผล่เร็วขึ้น 1 รอบ (ปกติโผล่รอบที่ 3 ของการต่อสู้)`},
  { key: "fogspawn", ch: 4, name: "สิ่งที่คลานออกจากหมอก", ab: [16, 14, 14, 3, 12, 5], ac: 12, hp: 39, cr: 2, walk: 30, swim: 30, disp: -1,
    atk: [["หนวด", true, 5, [1, 6, 3], "bludgeoning", null, I.tent, "2 ครั้งต่อ Action · โดนแล้วติด Grappled (DC 13)"]],
    text: `ก้อนหมอกที่มีหนวดและตาเรืองแสงหลายดวง เกิดจากหมอกเขียวที่ลอยออกจากรอยแยก
## ค่าสถานะ
AC 12 · HP 39 · CR 2 · ต้านทานดาเมจกายภาพจากอาวุธไม่วิเศษ (ยกเว้นกระสุนเงิน)
## Action
- หนวด 2 ครั้ง (+5 · 1d6+3) โดนแล้วติด Grappled (DC 13)
## ลักษณะ
- หมอกพิษ: ใครเริ่มเทิร์นในระยะ 10 ฟุต เซฟ CON DC 12 ไม่ผ่านโดน 1d6 พิษ (หน้ากากกันหมอกกันได้)
- เห็นครั้งแรก: ทอยความหวาดผวา DC 13`},
  { key: "tentacle", ch: 4, name: "หนวดของ Herald", ab: [20, 10, 16, 1, 10, 1], ac: 13, hp: 30, cr: 2, walk: 0, disp: -1, size: 1,
    atk: [["ฟาด", true, 7, [2, 8, 4], "bludgeoning", null, I.tent, "เอื้อม 15 ฟุต · โดนแล้วติด Prone หรือ Grappled (เลือก)"]],
    text: `หนวดยักษ์ที่โผล่จากรอยแยกก่อนตัว Herald มี 3 เส้น
## ค่าสถานะ
AC 13 · HP 30 · CR 2 · ไม่ขยับที่
## Action
- ฟาด +7 เอื้อม 15 ฟุต · 2d8+4 · ติด Prone หรือ Grappled (DC 15)
## ลักษณะ
- ตัดหนวดได้ 1 เส้น: Herald เสีย 20 HP และเสีย Reaction รอบนั้น`},
  { key: "herald", ch: 4, name: "The Herald of the Abyss", ab: [24, 8, 22, 18, 18, 22], ac: 16, hp: 200, cr: 10, walk: 0, swim: 40, disp: -1, size: 4,
    atk: [["คลื่นห้วงลึก", false, 9, [3, 10, 0], "psychic", "120/120", I.psy, "เป้าเดียว · พลังจิต"]],
    text: `ร่างจำแลงของ Cthulhu ที่ดันตัวขึ้นจากรอยแยก **ศัตรูตัวนี้ไม่ได้ออกแบบให้ฆ่าด้วยดาเมจ** ผู้เล่นชนะด้วยกลไกในฉากเท่านั้น
## ค่าสถานะ
AC 16 · HP 200 · CR 10 (บอสกลไก) · ตัวใหญ่ 4×4 ช่อง ไม่ขยับออกจากรอยแยก
- ภูมิคุ้มกัน: ดาเมจจากเวทมนตร์ทุกชนิด ("เวทของมนุษย์ไร้ผล")
- ต้านทาน: ดาเมจจากอาวุธ (ยกเว้นกระสุนเงิน)
## Action (ต่อรอบ 1 อย่าง)
- คลื่นห้วงลึก: เป้าในระยะ 120 ฟุต +9 · 3d10 พลังจิต
- จ้องจากห้วงลึก (ชาร์จ 5–6): ทุกคนที่เห็นทอยความหวาดผวา DC 15
## Lair Action (Initiative 20)
- หมอกระเบิด: วงกลม 20 ฟุต เซฟ CON DC 13 · 2d6 พิษ
- ถ้าครบ 3 รอบแล้วยังไม่มีเสาพังเลย: นาฬิกาห้วงนิทรา +1
## วิธีชนะ (เลือกทางใดทางหนึ่ง)
- ไดนาไมต์: ระเบิดเสา Magitech ครบ 4 ต้น (วาง 1 Action จุด 1 Bonus Action ระเบิดต้นรอบถัดไป) เสาแต่ละต้นพัง Herald เสีย 30 HP และ Stunned 1 รอบ ครบ 4 ต้นรอยแยกปิด
- ไอน้ำ: จุดหม้อต้ม (2 Action) แล้วหมุนวาล์ว 3 ตัว (Athletics DC 14 ตัวละ 1 Action) ไอน้ำอัดรอยแยก Herald ถูกผลักกลับ รอยแยกปิดชั่วคราว
- HP เหลือ 0: Herald จมกลับลงรอยแยก แต่รอยแยกยังเปิดอยู่ ต้องปิดต่อ`}
];

function npcWeapon([name, melee, bonus, [n, d, b], type, range, img, note]) {
  const id = foundry.utils.randomID();
  const sys = { type: { value: melee ? "simpleM" : "simpleR" }, equipped: true, proficient: 1, description: { value: note ? `<p>${note}</p>` : "" },
    damage: { base: { number: n, denomination: d, bonus: b ? String(b) : "", types: [type] } },
    activities: { [id]: { _id: id, type: "attack", name: melee ? "โจมตี" : "ยิง",
      attack: { ability: "none", bonus: String(bonus), flat: true, type: { value: melee ? "melee" : "ranged", classification: "weapon" } }, damage: { includeBase: true } } } };
  if (range) { const [a, l] = range.split("/").map(Number); sys.range = { value: a, long: l, units: "ft" }; }
  return { name, type: "weapon", img, system: sys, flags: { [MOD]: { npcWeapon: true } } };
}
async function folder(type, name, color = "#9A6B2C") {
  return game.folders.find((f) => f.name === name && f.type === type) ?? Folder.create({ name, type, color });
}
const NPC_ART = ["hybrid", "rosso", "gunman", "captain", "director", "orderly", "nurse", "tommy", "machine", "cultist", "zealot", "fogspawn", "tentacle", "herald"];  // keys that have painted art in npcs/<key>.webp and npcs/<key>-token.webp
export async function createChapterNpcs(ch) {
  const out = {};
  const f = await folder("Actor", `Arkane 1920s · NPC Chapter ${ch}`);
  for (const n of NPCS.filter((q) => q.ch === ch)) {
    let a = game.actors.find((q) => q.getFlag(MOD, "npc") === n.key);
    if (!a) {
      const img = n.img ?? `modules/${MOD}/npcs/${n.key}.webp`, tok = n.img ?? `modules/${MOD}/npcs/${n.key}-token.webp`;
      const size = n.size ?? 1;
      try {
        a = await Actor.create({ name: n.name, type: "npc", img, folder: f.id,
          system: { abilities: Object.fromEntries(ABS.map((k, i) => [k, { value: n.ab[i] }])),
            attributes: { ac: { calc: "flat", flat: n.ac }, hp: { value: n.hp, max: n.hp }, movement: { walk: n.walk, swim: n.swim ?? 0 }, senses: { darkvision: 60 } },
            details: { cr: n.cr, biography: { value: P(n.text) } }, traits: { size: size >= 4 ? "grg" : size >= 2 ? "lg" : "med" } },
          prototypeToken: { name: n.name, texture: { src: tok }, width: size, height: size, disposition: n.disp, displayName: 20, displayBars: 20,
            bar1: { attribute: "attributes.hp" }, sight: { enabled: true, range: 60 }, actorLink: ["rosso", "director", "herald", "captain", "tommy", "zealot"].includes(n.key) },
          flags: { [MOD]: { npc: n.key, chapter: ch } } });
        if (n.atk.length) await a.createEmbeddedDocuments("Item", n.atk.map(npcWeapon));
      } catch (e) { console.error(MOD, "npc", n.key, e); continue; }
    }
    else if (NPC_ART.includes(n.key) && a.getFlag(MOD, "artVer") !== 1) {  // painted portrait + token supplied by the DM
      const img = `modules/${MOD}/npcs/${n.key}.webp`, tok = `modules/${MOD}/npcs/${n.key}-token.webp`;
      try {
        await a.update({ img, "prototypeToken.texture.src": tok, [`flags.${MOD}.artVer`]: 1 });
        for (const sc of game.scenes) { const ups = sc.tokens.filter((t) => t.actorId === a.id && !t.actorLink).map((t) => ({ _id: t.id, "texture.src": tok })); if (ups.length) await sc.updateEmbeddedDocuments("Token", ups); }
      } catch (e) { console.warn(MOD, "npc art", n.key, e); }
    }
    {  // older actors: swap the made-up tommy gun for the game's .45 automatic pistol
      for (const it of a.items.filter((i) => /ทอมมี่/.test(i.name) && i.getFlag(MOD, "npcWeapon"))) {
        const atk = n.atk.find((q) => /ปืนพกอัตโนมัติ/.test(q[0]));
        if (atk) { const nw = npcWeapon(atk); await it.delete(); await a.createEmbeddedDocuments("Item", [nw]).catch(() => {}); }
      }
    }
    out[n.key] = a;
  }
  return out;
}

/* ---------------- items ---------------- */
// id, name, type, img, description, extra system, effects
const ITEMS = [
  ["c2-part", "ชิ้นส่วนเครื่องจักรที่เต้นตุบ", "loot", "icons/commodities/tech/cog-bronze.webp", "ชิ้นส่วน Magitech โบราณขนาดเท่ากล่องหมวก เต้นเป็นจังหวะเหมือนหัวใจ หนัก 20 ปอนด์ ใครแตะด้วยมือเปล่าครั้งแรกทอยความหวาดผวา DC 10 · C.A.A.M. จ่ายค่าส่งมอบ $150", { weight: { value: 20 } }],
  ["c2-order", "จดหมายสั่งการจากเซนต์อัลดริก", "loot", "icons/sundries/documents/document-sealed-red-white.webp", "จดหมายบนหัวกระดาษโรงพยาบาลทหารผ่านศึกเซนต์อัลดริก: \"ส่งชิ้นส่วนชุดสุดท้ายภายในคืนวันศุกร์ เครื่องต้องพร้อมก่อนน้ำขึ้นสูงสุด\" ลงชื่อ นพ. ก. เครน (เบาะแสไป Chapter 3)"],
  ["c2-ledger", "บัญชีลับของรอสโซ", "loot", "icons/sundries/books/book-worn-blue.webp", "รายชื่อเจ้าหน้าที่ท่าเรือที่รับเงินซินดิเคท และรายการ \"ค่าน้ำจากแท็งก์\" ที่คนงานดื่มทุกคืน · ขายให้ฟินช์ได้ $60 หรือส่ง C.A.A.M. เพื่อลบคดีของผู้เล่น"],
  ["c2-gillring", "แหวนเหงือก", "equipment", "modules/arkane-1920s/items/c2-gillring.webp", "แหวนเงินดำสลักลายเกล็ด (Uncommon, ต้อง Attune) · สวมแล้วหายใจในน้ำได้ และมีความเร็วว่ายน้ำ 30 ฟุต · ผลข้างเคียง: คอเริ่มมีขีดเหมือนเหงือก (ทอยความหวาดผวา DC 10 เมื่อสวมครั้งแรก)",
    { type: { value: "ring" }, rarity: "uncommon", attunement: "required" }, [{ name: "แหวนเหงือก", changes: [{ key: "system.attributes.movement.swim", mode: 4, value: "30" }] }]],
  ["c3-list", "รายชื่อแบตเตอรี่สังเวย", "loot", "icons/sundries/documents/document-symbol-eye.webp", "บัญชีผู้ป่วย 31 คนพร้อมวันที่ \"ต่อสาย\" มีกากบาทแดง 19 ชื่อ ชื่ออาเธอร์ เพนเดิลตันอยู่ในรายการ \"หลบหนี\" · หลักฐานสำคัญให้ C.A.A.M."],
  ["c3-key", "กุญแจห้องใต้ดิน", "loot", "icons/sundries/misc/key-steel.webp", "กุญแจเหล็กดำห้อยป้าย \"B\" ไขประตูลับลงใต้ดิน (หรือ Thieves' Tools DC 16)"],
  ["c3-syringe", "เข็มกล่อมประสาท", "consumable", "modules/arkane-1920s/items/npc-syringe.webp", "ฉีดใส่เป้าที่ติดตัว (Action, โจมตี +ค่าความชำนาญ) เซฟ CON DC 12 ไม่ผ่านติด Poisoned และความเร็ว 0 จนจบเทิร์นถัดไป · ใช้กับตัวเองได้: ลด Dread 1 แต้ม แต่ Disadvantage เซฟ WIS จนกว่าจะพัก",
    { type: { value: "poison" }, quantity: 3, uses: { max: "1", spent: 0, autoDestroy: true } }],
  ["c3-notes", "บันทึกของ นพ. เครน", "loot", "icons/sundries/books/book-eye-purple.webp", "สมุดบันทึกหนังดำ: \"พลังงานจากทหารไหลลงสายเคเบิลเก่าของเหมืองถ่านหิน ไปยังจุดที่เมืองเก่าจมอยู่ใต้อาร์คเคน เมื่อเสาทั้งสี่ชาร์จเต็ม ประตูจะเปิด\" มีแผนที่ร่างทางเข้าเหมืองร้างและท่อระบายน้ำ (เบาะแส Chapter 4)"],
  ["c3-cane", "ไม้เท้าบิดพื้นที่", "equipment", "icons/weapons/staves/staff-ornate-hook.webp", "ไม้เท้าเงินของ นพ. เครน (Uncommon, ต้อง Attune) · 1 ครั้งต่อ Long Rest: ร่าย Misty Step โดยไม่ใช้ช่องเวท · ทุกครั้งที่ใช้ ได้ยินเสียงคลื่นในหัว 1 นาที", { type: { value: "trinket" }, rarity: "uncommon", attunement: "required", uses: { max: "1", spent: 0, recovery: [{ period: "lr", type: "recoverAll" }] } }],
  ["c4-dynamite", "ไดนาไมต์", "consumable", "icons/weapons/thrown/bomb-fuse-red-black.webp", "ขว้างได้ 60 ฟุต หรือวางที่เสา Magitech · ระเบิดวงกลม 10 ฟุต เซฟ DEX DC 13 · 3d6 ไฟ ผ่านได้ครึ่ง · วางที่เสา: เสาพังต้นรอบถัดไป",
    { type: { value: "trinket" }, quantity: 6, uses: { max: "1", spent: 0, autoDestroy: true } }],
  ["c4-mask", "หน้ากากกันหมอก", "equipment", "icons/equipment/head/mask-plague-leather-brown.webp", "หน้ากากกันแก๊สทหารสมัยสงคราม · สวมแล้วไม่ต้องเซฟหมอกพิษ และได้ Advantage เซฟ CON จากพิษทุกชนิด · Disadvantage Perception ที่ใช้กลิ่น", { type: { value: "clothing" } }],
  ["c4-shard", "เศษหินจากรอยแยก", "loot", "icons/commodities/gems/gem-rough-cushion-green.webp", "หินสีเขียวดำที่อุ่นตลอดเวลา C.A.A.M. ขอเก็บไปศึกษา หรือขายฟินช์ได้ $200 (แต่ฟินช์จะหายตัวไปหนึ่งสัปดาห์)"]
];
async function ensureItems() {
  const f = await folder("Item", "Arkane 1920s · ของ Chapter 2–4");
  const need = ITEMS.filter(([id]) => !game.items.find((i) => i.getFlag(MOD, "id") === id));
  if (!need.length) return;
  const docs = need.map(([id, name, type, img, desc, sys = {}, fx = []]) => {
    const d = { name, type, img, folder: f.id, system: { description: { value: P(desc) }, ...sys }, flags: { [MOD]: { id } } };
    if (fx.length) d.effects = fx.map((e) => ({ name: e.name, img, transfer: true, changes: e.changes }));
    if (id === "c4-dynamite") {
      const aid = foundry.utils.randomID();
      d.system.activities = { [aid]: { _id: aid, type: "save", name: "ขว้าง", range: { value: "60", units: "ft" }, target: { template: { type: "sphere", size: "10", units: "ft" } },
        save: { ability: ["dex"], dc: { calculation: "", formula: "13" } }, damage: { onSave: "half", parts: [{ number: 3, denomination: 6, types: ["fire"] }] } } };
    }
    return d;
  });
  try { await Item.createDocuments(docs); } catch (e) {
    console.warn(MOD, "chapter items (retry without activities)", e);
    for (const d of docs) { delete d.system.activities; try { await Item.create(d); } catch (e2) { console.error(MOD, d.name, e2); } }
  }
}
const itemData = (id, qty) => { const s = game.items.find((i) => i.getFlag(MOD, "id") === id); if (!s) return null; const o = s.toObject(); delete o._id; delete o.folder; if (qty && "quantity" in o.system) o.system.quantity = qty; return o; };
async function lootPile(sc, name, [x, y], items, gp = 0, icon = "icons/svg/chest.svg", spot = null) {
  const list = items.map(([id, q]) => itemData(id, q)).filter(Boolean);
  const tflags = spot ? { [MOD]: { spot } } : {};
  if (game.modules.get("item-piles")?.active && game.itempiles?.API?.createItemPile) {
    try {
      const r = await game.itempiles.API.createItemPile({ position: { x: x * G, y: y * G }, sceneId: sc.id, items: list, createActor: true, pileActorName: name,
        tokenOverrides: { name, texture: { src: icon }, flags: tflags }, actorOverrides: gp ? { system: { currency: { gp } } } : {} });
      return r;
    } catch (e) { console.warn(MOD, "pile", name, e); }
  }
  // no Item Piles: a plain "chest" actor with the items inside; players open its sheet and drag items to their own sheet
  try {
    const f = await folder("Actor", "Arkane 1920s · กล่องของ");
    const a = await Actor.create({ name, type: "npc", folder: f.id, img: icon, system: { currency: { gp } }, ownership: { default: 2 },
      prototypeToken: { name, disposition: 0, texture: { src: icon }, displayName: 30, actorLink: true } });
    if (list.length) await a.createEmbeddedDocuments("Item", list);
    const td = (await a.getTokenDocument({ x: Math.round(x * G), y: Math.round(y * G) })).toObject();
    await sc.createEmbeddedDocuments("Token", [{ ...td, x: Math.round(x * G), y: Math.round(y * G), flags: { ...(td.flags ?? {}), ...tflags } }]);
    return a;
  } catch (e) { console.warn(MOD, "chest actor", name, e); return null; }
}

/* ---------------- chapter definitions ---------------- */
const CH = {
  2: {
    title: "Chapter 2: ควันปืนและกลิ่นคาวปลา",
    goal: `## เป้าหมายของบท
ผู้เล่นตามตั๋วและจดหมายจากรังของแม็คมาที่โกดังหมายเลข 4 เพื่อหาว่าซินดิเคทขนอะไรเข้าเมือง และส่งไปให้ใคร
- ผู้เล่นต้องได้รู้ว่า: ของคือชิ้นส่วนเครื่องจักร Magitech โบราณ และผู้รับคือ นพ. ก. เครน แห่งโรงพยาบาลทหารผ่านศึกเซนต์อัลดริก
- ชนะบท: ได้จดหมายสั่งการ (ในตู้เซฟห้องทำงาน หรือจากปากรอสโซ/มือปืน/กัปตัน) ไม่ว่าจะยึดชิ้นส่วนได้หรือไม่
- เลเวลแนะนำ: 2 (จบบทขึ้นเลเวล 3)
## ทางเข้า (ผู้เล่นเลือก)
- ใช้ตั๋วรับของเข้าประตูม้วนตรงๆ: เข้าได้ แต่ยามจำได้ว่าเจ้าของตั๋วตายแล้ว มีเวลา 10 นาทีก่อนถูกล้อม
- แอบเข้าทางน้ำผ่านตะแกรงใต้น้ำ: โผล่ในห้องแท็งก์ เจอคนงานมีเหงือก (หวาดผวา DC 13)
- บุกยิงจากลาน: ซินดิเคทพยายามขนลังขึ้นเรือแมรี่ แอนน์ภายใน 5 รอบ นาฬิกาห้วงนิทรา +1
- ผ่านกัปตันเอซรา: ถ้าช่วยเขา เขาพาขึ้นท่าเทียบเรือโดยไม่มีใครสงสัย
## จุดสำคัญ
- ห้องทำงาน: ตู้เซฟ (Thieves' Tools DC 15) มีจดหมายสั่งการ เงิน $40
- ตู้คอนเทนเนอร์เปิดอยู่: ชิ้นส่วนเครื่องจักรที่เต้นตุบ
- ห้องแท็งก์: ดอน รอสโซ กับคนงานมีเหงือก 2 คน ไฟคือจุดอ่อน (ถังน้ำมันหรือกระสุนเพลิง)
## จบบท
- ชนะและยึดชิ้นส่วน: นาฬิกา −1 · C.A.A.M. จ่าย $150
- ได้แค่จดหมาย: นาฬิกาไม่เปลี่ยน
- แพ้หรือหนี: นาฬิกา +1 ผู้เล่นรู้แค่ชื่อโรงพยาบาลบนลัง`,
    scenes: [{ map: "wh4", name: "Chapter 2: โกดังหมายเลข 4",
      notes: [["1 ลานหน้าโกดัง", 3, 2.5, "ยามซินดิเคท 2 คน (มือปืน) เดินตรวจรอบลาน รถบรรทุกจอดรอขนของไปโรงพยาบาลคืนวันศุกร์\n- Stealth DC 13 ผ่านไปได้ · ยื่นตั๋ว: Deception DC 12 หรือยามจำได้"],
        ["2 ประตูม้วน", 12.5, 4.4, "ประตูหลักของโกดัง เปิดด้วยตั๋วรับของ\n- เปิดเสียงดัง คนในโกดังรู้ตัว ทอย Initiative ถ้ายังไม่มีใครเชื่อตั๋ว"],
        ["3 ห้องทำงาน", 5, 7, "โต๊ะเอกสาร ตู้เซฟ (Thieves' Tools DC 15 / Athletics DC 18)\n- ในตู้เซฟ: จดหมายสั่งการจากเซนต์อัลดริก, บัญชีลับของรอสโซ, $40"],
        ["4 เขาวงกตตู้คอนเทนเนอร์", 11, 12, "ตู้กั้นทางเดินและบังสายตา ใช้หลบยิงได้ (ที่กำบังเต็มตัวหลังตู้)\n- คนงานมีเหงือก 2 คนเดินตรวจ"],
        ["5 ชิ้นส่วนเครื่องจักร", 12.8, 16.8, "ตู้เปิดอยู่ ข้างในคือชิ้นส่วน Magitech ที่เต้นเป็นจังหวะ\n- แตะครั้งแรก: หวาดผวา DC 10 · หนัก 20 ปอนด์ ต้องมีคนแบก"],
        ["6 ห้องแท็งก์ (บอส)", 20, 16.5, "สระน้ำเค็มกลางห้อง ดอน รอสโซนั่งเก้าอี้แดง คนงานมีเหงือก 2 คนซ่อนในน้ำ\n- รอสโซเสนอดีลก่อนเสมอ · HP ต่ำกว่าครึ่งดำหนีลงแท็งก์ออกตะแกรงใต้น้ำ (2 รอบ)\n- ไฟคือจุดอ่อน: โดนไฟ เกล็ดหลุด AC เหลือ 12"],
        ["7 ท่าเทียบเรือ", 29, 9, "กัปตันเอซรา ฮอลล์ยืนสูบบุหรี่ เรือแมรี่ แอนน์จอดอยู่\n- คุยดีๆ (Persuasion DC 12) เขาบอกทุกอย่าง ดูในชีทกัปตัน"],
        ["8 ตะแกรงใต้น้ำ", 20, 21.5, "ทางเข้าลับทางน้ำ ว่ายจากท่าเรือ 60 ฟุต (กลั้นหายใจได้ 1 + CON นาที)\n- เดินเข้าช่องแล้วระบบถามว่าจะลอดตะแกรงไหม"],
        ["9 ประตูข้าง", 1, 14.5, "ประตูเล็กจากตรอกด้านตะวันตก ล็อก (Thieves' Tools DC 12)"]],
      npcs: [["gunman", 4, 2], ["gunman", 21, 2.6], ["hybrid", 7.6, 15.6], ["hybrid", 14.5, 12.5], ["hybrid", 17.6, 14.6, true], ["hybrid", 17.6, 18.5, true], ["rosso", 22.5, 16.5], ["captain", 31, 11.5]],
      loot: [["ตู้เซฟห้องทำงาน", [6.9, 5.8], [["c2-order"], ["c2-ledger"]], 40, "modules/arkane-1920s/items/pile-safe.webp"], ["ตู้คอนเทนเนอร์เปิด", [12.8, 17.5], [["c2-part"]], 0, "modules/arkane-1920s/items/pile-container.webp"], ["ของของรอสโซ", [22.5, 18.5], [["c2-gillring"], ["ammo-กระสุน .45", 20]], 60, "modules/arkane-1920s/items/pile-rosso.webp"]],
      regions: [["⇄ ลอดตะแกรงใต้น้ำ → ห้องแท็งก์", [19, 21, 2, 1], "wh4", [17, 18, 1, 1]], ["⇄ ออกตะแกรง → ทะเล", [18, 19, 1, 1], "wh4", [20, 22, 1, 1]]],
      cover: [["ที่กำบัง: ลังบนท่าเรือ", [28, 6, 2, 2]], ["ที่กำบัง: รถบรรทุก", [15, 1, 4, 2]]] }]
  },
  3: {
    title: "Chapter 3: หอผู้ป่วยจิตเวชที่ถูกลืม",
    goal: `## เป้าหมายของบท
ผู้เล่นแทรกซึมโรงพยาบาลทหารผ่านศึกเซนต์อัลดริก เพื่อหยุด นพ. กาเบรียล เครน ที่ใช้ทหารป่วย PTSD เป็น "แบตเตอรี่สังเวย" ชาร์จเครื่องจักรที่ส่งพลังลงไปใต้เมือง
- ผู้เล่นต้องได้รู้ว่า: พลังงานถูกส่งไปที่เสา Magitech ใต้อาร์คเคน ผ่านเหมืองร้างและท่อระบายน้ำ (บันทึกของ นพ. เครน)
- ชนะบท: ปลดทหารและหยุดเครื่อง หรือฆ่าเครน
- เลเวลแนะนำ: 3–4 (จบบทขึ้นเลเวล 5)
## ก่อนเข้า (จุดพักเชิงเนิน)
- ตี้พักที่โรงเตี๊ยมสาขาเชิงเนิน ห่างโรงพยาบาลราว 450 เมตร (มาโคร "Chapter 2.6: จุดพักเชิงเนิน") เช้าวันที่ 3 สอดแนมจากเนินแล้วเลือกทางเข้า ดูบันทึก "จุดพักก่อน Chapter 3 (DM)"
## ทางเข้า (ผู้เล่นเลือก)
- ปลอมเป็นคนไข้: เข้าหอผู้ป่วย A ง่าย แต่ถูกฉีดยา (Disadvantage เซฟ WIS จนกว่าจะพัก)
- ปลอมเป็นเจ้าหน้าที่: เข้าห้องเวชระเบียนได้ เจอรายชื่อแบตเตอรี่สังเวย
- บุกเข้าไป: ผู้คุมทั้งตึกตื่น เครนเริ่มชาร์จเครื่องทันที นาฬิกา +1
## จุดสำคัญ
- หอผู้ป่วย A: สิบโททอมมี่ เรย์ ผู้ป่วยที่ยังมีสติ บอกทางลงใต้ดิน
- ห้องพยาบาล: กุญแจห้องใต้ดิน เข็มกล่อมประสาท
- ห้อง ผอ.: บันทึกของ นพ. เครน (เบาะแสไป Chapter 4)
- ใต้ดิน: ทางเดินไม่สิ้นสุด (หวาดผวา DC 16) หอผู้ป่วยเนื้อ เครื่องแบตเตอรี่สังเวย
## จบบท
- ช่วยทหารและหยุดเครื่องกลางคัน: นาฬิกา −1
- ฆ่าเครนแต่ปล่อยเครื่อง: นาฬิกา +1
- ล้มเหลว: นาฬิกา +2 · รุ่งเช้าหมอกเขียวลอยจากท่อระบายน้ำ`,
    scenes: [{ map: "hospital", name: "Chapter 3: โรงพยาบาลทหารผ่านศึก (ชั้นล่าง)",
      notes: [["1 ทางเข้าหลัก", 17.5, 20.5, "ประตูไม้โอ๊กคู่ ยามกะดึก 1 คน (ใช้ชีทมือปืนซินดิเคทได้)\n- ปลอมตัว: Deception DC 13 · มีจดหมายของรอสโซ/เครนเป็นหลักฐาน ได้ Advantage"],
        ["2 ล็อบบี้", 17.5, 15, "เคาน์เตอร์ต้อนรับ พยาบาลลัทธิยิ้มตลอดเวลา\n- สมุดเยี่ยมไข้: ชื่ออาเธอร์ เพนเดิลตัน มาเยี่ยม \"ผู้ป่วย 17\" ทุกเดือน"],
        ["3 หอผู้ป่วย A", 7, 5.5, "ทหาร 8 คนนอนนิ่ง ตาเปิดค้าง แขนมีรอยเข็ม\n- สิบโททอมมี่ เรย์ ยังมีสติ บอกทางลงใต้ดิน"],
        ["4 ห้องเวชระเบียน", 15.5, 4, "ตู้เอกสาร (Investigation DC 12): รายชื่อแบตเตอรี่สังเวย"],
        ["5 ห้อง ผอ.", 21.5, 5.5, "โหลดองชิ้นส่วนที่เต้นตุบ 5 โหล พรมแดงปิดช่องลับใต้พื้น\n- ช่องลับ (Perception DC 14): บันทึกของ นพ. เครน · เครนไม่อยู่ เขาอยู่ใต้ดินกับเครื่อง"],
        ["6 หอผู้ป่วย B", 28.5, 5.5, "ห้องพักผู้คุม ผู้คุมกลายพันธุ์ 1 ตัวนอนอยู่ (Stealth DC 13 ผ่านได้โดยไม่ตื่น)"],
        ["7 ห้องพยาบาล", 5, 17, "ตู้ยา: เข็มกล่อมประสาท ×3 · กุญแจห้องใต้ดินอยู่กับพยาบาลหัวหน้า"],
        ["8 ห้องช็อตไฟฟ้า", 10.5, 13.5, "เก้าอี้รัดตัวกับเครื่องช็อต ถ้าผู้เล่นถูกจับได้ จะถูกพามาที่นี่ (2d6 ฟ้าผ่าต่อรอบ จนกว่าจะหลุด Athletics DC 14)"],
        ["9 บันไดลงใต้ดิน", 30, 15, "ประตูลับหลังผนังห้องเก็บของ (กุญแจ B หรือ Thieves' Tools DC 16 หรือ Investigation DC 15 หาเจอ)\n- เดินเข้าช่องบันไดแล้วระบบถามว่าจะลงไหม"]],
      npcs: [["nurse", 17.5, 14.5], ["nurse", 5, 14.5], ["orderly", 28.5, 5.5], ["orderly", 25.5, 18.2], ["tommy", 8, 5.5]],
      loot: [["ตู้เอกสาร", [16.5, 6.5], [["c3-list"]], 0, "modules/arkane-1920s/items/pile-cabinet.webp"], ["ตู้ยา", [3, 16.5], [["c3-syringe", 3], ["c3-key"]], 0, "modules/arkane-1920s/items/pile-medcab.webp"], ["ช่องลับใต้พรม", [20, 7.8], [["c3-notes"]], 35, "modules/arkane-1920s/items/pile-rug.webp"]],
      cover: [["ที่กำบัง: เคาน์เตอร์ล็อบบี้", [15, 13, 5, 1]], ["ที่กำบัง: โต๊ะครัว", [23, 13, 3, 4]]] },
    { map: "basement", name: "Chapter 3: ใต้ดินโรงพยาบาล (หอผู้ป่วยเนื้อ)",
      notes: [["1 บันได", 3.5, 3.5, "บันไดขึ้นชั้นล่าง (เดินเข้าช่องบันได)\n- อากาศชื้น ได้ยินเสียงหัวใจเต้นจากผนัง"],
        ["2 ทางเดินไม่สิ้นสุด", 14, 4, "ทุกคนทอยความหวาดผวา DC 16 (เกินจะรับไหว)\n- ใครหันหลังกลับ: เซฟ WIS DC 13 ไม่ผ่านกลับไปยืนต้นทางเดิน\n- ผนังเต้นเป็นจังหวะเดียวกับเครื่อง"],
        ["3 ห้องขัง", 16, 8.5, "ทหารที่ยังมีสติ 4 คนถูกขัง (ลูกกรง: Athletics DC 15 / กุญแจ B)\n- ปล่อยแล้วพวกเขาช่วยปลดทหารจากเครื่องได้ (ปลดอัตโนมัติ 1 คนต่อรอบ)"],
        ["4 หอผู้ป่วยเนื้อ", 8, 17.5, "พื้นเป็นเนื้อ: พื้นที่ลำบาก · ผนังยื่นมือออกมาจับ (เริ่มเทิร์นติดผนัง เซฟ STR DC 12 ไม่ผ่าน Restrained)\n- ผู้คุมกลายพันธุ์ฟื้น 5 HP ต่อรอบในห้องนี้"],
        ["5 เครื่องแบตเตอรี่สังเวย", 23, 17.5, "เครื่องจักรวงกลมกับเก้าอี้ 6 ตัว ทหารต่อสายครบ 6 คน · ดูวิธีปลดในชีท นพ. เครน และชีทเครื่องจักร"],
        ["6 แผงควบคุม", 29.6, 13.8, "Arcana DC 15 (1 Action): ตัดพลังเครื่อง 1 รอบ เครนเสียความต้านทานรอบนั้น · ทำสำเร็จ 3 ครั้ง เครื่องดับถาวร"]],
      npcs: [["orderly", 20, 4, true], ["orderly", 8, 17], ["director", 25.5, 14.5], ["nurse", 20, 19.5], ["machine", 23, 17.5]],
      loot: [],
      cover: [["ที่กำบัง: เตียงหอผู้ป่วย", [3, 14, 7, 2]]] }],
    links: [["hospital", [30, 16, 1, 1], "basement", [3, 2, 1, 1], "ลงใต้ดิน"], ["basement", [2, 2, 1, 1], "hospital", [29, 16, 1, 1], "ขึ้นชั้นล่าง"]]
  },
  4: {
    title: "Chapter 4: ห้วงนิทราใต้อาร์คเคน",
    goal: `## เป้าหมายของบท
หมอกเขียวพิษปกคลุมอาร์คเคน สาวกลัทธิออกมาเดินเกลื่อนถนน ผู้เล่นต้องลงไปใต้เมืองเพื่อปิดรอยแยก ก่อน The Herald of the Abyss จะโผล่เต็มตัว
- ผู้เล่นต้องรู้ว่า: Herald ฆ่าด้วยเวทไม่ได้ ต้องใช้กลไกในฉาก (ไดนาไมต์ที่เสา 4 ต้น หรือไอน้ำจากวาล์ว 3 ตัว)
- ชนะบท: ปิดรอยแยก (จบแคมเปญ)
- เลเวลแนะนำ: 5
## ทางลง (ผู้เล่นเลือก)
- ท่อระบายน้ำ: เร็ว แต่สาวกซุ่มทุกทางแยก
- เหมืองร้าง: ช้ากว่า แต่เจอไดนาไมต์ หน้ากากกันหมอก และเครื่องจักรไอน้ำ
## จุดสำคัญ
- คลังไดนาไมต์ (6 แท่ง) · ห้องเครื่องจักรไอน้ำกับวาล์ว 3 ตัว
- ถ้ำรอยแยก: นักบวชที่แท่นบูชา สิ่งที่คลานออกจากหมอก หนวดของ Herald 3 เส้น
- Herald โผล่รอบที่ 3 ของการต่อสู้ (เร็วขึ้นถ้านักบวชสวด)
## จบแคมเปญ
- ระเบิดเครื่องด้วยไดนาไมต์: นาฬิกา −2 · "แผ่นดินไหวใต้เมือง หมอกพิษจางหายในชั่วข้ามคืน"
- ใช้ไอน้ำอัดรอยแยก: นาฬิกา −1 · ปิดได้ แต่ Cthulhu รู้แล้วว่ามนุษย์สู้ได้ (ทางไปภาคต่อ)
- ล้มเหลว: นาฬิกา +3 · วันสิ้นโลกมาถึงอาร์คเคน
- ถ้านาฬิกาห้วงนิทราถึง 12 ก่อนจบบท: Herald ไม่ใช่ร่างจำแลงอีกต่อไป`,
    scenes: [{ map: "rift", name: "Chapter 4: ใต้เมืองอาร์คเคน (รอยแยก)",
      notes: [["1 ฝาท่อ", 3.5, 3.8, "ทางลงจากถนน (ทางท่อระบายน้ำ) · หมอกเขียวหนาที่สุดตรงนี้ เซฟ CON DC 12 ทุก 10 นาที ไม่ผ่าน 1d6 พิษ"],
        ["2 ทางแยกท่อ", 10, 8.5, "สาวก 2 คนซุ่มบนทางเดินสองฝั่งท่อ น้ำเชี่ยว: ใครตกน้ำ Athletics DC 13 ไม่ผ่านถูกพัดไป 20 ฟุต"],
        ["3 ปากเหมืองร้าง", 36, 3.5, "ทางลงเหมืองถ่านหินเก่า (ทางเหมือง) · กล่องเครื่องมือมีหน้ากากกันหมอก 3 อัน"],
        ["4 คลังไดนาไมต์", 33, 10.5, "ลังไดนาไมต์ 6 แท่ง (เก่าแต่ยังใช้ได้: ทอย d6 ได้ 1 ด้าน = ด้าน)\n- สาวก 1 คนเฝ้าอยู่"],
        ["5 เครื่องจักรไอน้ำ", 34.5, 16, "หม้อต้มเก่าต่อท่อไปวาล์ว 3 ตัวในถ้ำ · จุดไฟหม้อต้ม 2 Action แล้วรอ 1 รอบให้แรงดันขึ้น"],
        ["6 รอยแยก", 22, 23.5, "รอยแยกเรืองเขียว เสา Magitech 4 ต้นต่อสายเข้าหากลาง · Herald โผล่รอบ 3\n- เสา: AC 15 HP 25 (หรือไดนาไมต์ที่วางติด) พังครบ 4 ต้นรอยแยกปิด\n- วาล์ว 3 ตัว (ริมผนังตะวันออก): Athletics DC 14 ตัวละ 1 Action หลังหม้อต้มติดไฟ"]],
      npcs: [["cultist", 10, 6.5], ["cultist", 14, 10.5], ["cultist", 17.5, 15], ["cultist", 32, 10.5], ["fogspawn", 12, 22], ["fogspawn", 31.5, 25], ["zealot", 22, 20.8],
        ["tentacle", 18.5, 23, true], ["tentacle", 25.5, 23, true], ["tentacle", 22, 26.4, true], ["herald", 22, 23.5, true]],
      loot: [["ลังไดนาไมต์", [33.5, 11.5], [["c4-dynamite", 6]], 0, "modules/arkane-1920s/items/pile-dynamite.webp"], ["กล่องเครื่องมือเหมือง", [35.5, 2.5], [["c4-mask", 3]], 0, "modules/arkane-1920s/items/pile-toolbox.webp"], ["แท่นบูชา", [22, 19.6], [["c4-shard"]], 25, "modules/arkane-1920s/items/pile-altar.webp"]],
      cover: [["ที่กำบัง: เสา Magitech", [15, 20, 1, 1], [29, 20, 1, 1], [15, 25, 1, 1], [29, 25, 1, 1]], ["ที่กำบัง: แท่นบูชา", [20, 19, 3, 1]]] }]
  }
};

/* ---------------- build ---------------- */
// Chapter 3 was too dark (players only saw small pools of light): global light (so everyone sees what is in line of sight, walls still block it,
// fog of war still reveals as they explore), lower darkness, and bigger lamps.
const BRIGHT = { hospital: { d: 0.35, k: 2.5 }, basement: { d: 0.5, k: 2.5 } };
const scaleLights = (ls, k) => (ls ?? []).map((l) => ({ ...l, config: { ...l.config, dim: Math.round((l.config?.dim ?? 0) * k), bright: Math.round((l.config?.bright ?? 0) * k) } }));
export async function brightenCh3(force = false) {
  if (!game.user.isGM) return 0;
  let n = 0;
  for (const [map, B] of Object.entries(BRIGHT)) {
    const def = CH[3]?.scenes?.find((x) => x.map === map);
    const sc = def && game.scenes.getName(def.name);
    if (!sc || (!force && sc.getFlag(MOD, "bright") === 2)) continue;
    try {
      await sc.update({ "environment.darknessLevel": B.d, "environment.globalLight.enabled": true });
      const ups = sc.lights.map((l) => ({ _id: l.id, "config.dim": Math.round((l.config.dim || 0) * B.k), "config.bright": Math.round((l.config.bright || 0) * B.k) }));
      if (ups.length) await sc.updateEmbeddedDocuments("AmbientLight", ups);
      await sc.setFlag(MOD, "bright", 2); n++;
    } catch (e) { console.warn(MOD, "brighten", map, e); }
  }
  if (n) ui.notifications.info(`Chapter 3: ปรับให้สว่างขึ้นแล้ว ${n} ฉาก (เห็นห้องทั้งหมดในแนวสายตา ไม่ใช่แค่ใกล้ไฟ)`);
  return n;
}

async function buildScene(ch, def, keyJournal) {
  let sc = game.scenes.getName(def.name);
  if (sc) return sc;
  const M = CHMAPS[def.map];
  const jName = `แผนที่: ${def.name.replace(/^Chapter \d: /, "")} (DM)`;
  let key = game.journal.getName(jName);
  if (!key) key = await JournalEntry.create({ name: jName, folder: keyJournal.folder?.id ?? keyJournal.folder, ownership: { default: 0 },
    pages: [{ name: "แผนที่ฉบับ DM", type: "image", src: `modules/${MOD}/maps/${def.map}-dm.webp`, sort: 50 },
      ...def.notes.map(([n, , , t], i) => ({ name: n, type: "text", sort: (i + 1) * 100, text: { content: P(t), format: 1 } }))] });
  const notes = def.notes.map(([n, x, y]) => ({ entryId: key.id, pageId: key.pages.getName(n)?.id, x: x * G, y: y * G, text: n, iconSize: 40, fontSize: 24, texture: { src: "icons/svg/book.svg" } }));
  sc = await Scene.create({ name: def.name, folder: (await folder("Scene", `Arkane 1920s · Chapter ${ch}`)).id, navigation: false, navName: def.name.replace(/^Chapter \d: /, ""),
    background: { src: `modules/${MOD}/maps/${def.map}.webp` }, width: M.W * G, height: M.H * G, padding: 0, backgroundColor: "#0b0b0d",
    grid: { type: 1, size: G, distance: 5, units: "ft", alpha: 0.15 }, tokenVision: true, fog: { exploration: true },
    environment: { darknessLevel: BRIGHT[def.map]?.d ?? M.darkness, ...(BRIGHT[def.map] ? { globalLight: { enabled: true } } : {}) }, walls: M.walls,
    lights: BRIGHT[def.map] ? scaleLights(M.lights, BRIGHT[def.map].k) : M.lights, notes });
  try { const { setBackground } = await import("./ch1maps.js?v=21"); await setBackground(sc, `${def.map}.webp`); } catch (e) { console.warn(MOD, e); }
  // cover regions
  try {
    if (def.cover?.length) await sc.createEmbeddedDocuments("Region", def.cover.map(([n, ...rs]) => ({ name: n, color: "#5f9fcf", shapes: rs.map(rect) })));
  } catch (e) { console.warn(MOD, "cover", e); }
  return sc;
}
async function linkRegion(fromSc, exitR, toSc, arriveR, label) {
  const exitName = "↪ " + label, arriveName = "⤓ ปลายทาง: " + label;
  if (fromSc.regions.getName(exitName)) return;
  let arrive = toSc.regions.getName(arriveName);
  if (!arrive) [arrive] = await toSc.createEmbeddedDocuments("Region", [{ name: arriveName, color: "#3a7bd5", shapes: [rect(arriveR)] }]);
  await fromSc.createEmbeddedDocuments("Region", [{ name: exitName, color: "#d58a3a", shapes: [rect(exitR)],
    behaviors: [{ name: label, type: "teleportToken", system: { destination: arrive.uuid, choice: true } }] }]);
}
async function placeNpcs(sc, list, actors) {
  const add = [];
  for (const [i, [key, x, y, hidden]] of list.entries()) {
    const a = actors[key]; if (!a) continue;
    const td = (await a.getTokenDocument()).toObject();
    add.push({ ...td, x: Math.round((x - (td.width ?? 1) / 2) * G), y: Math.round((y - (td.height ?? 1) / 2) * G), hidden: !!hidden,
      flags: { ...(td.flags ?? {}), [MOD]: { ...(td.flags?.[MOD] ?? {}), spot: `${key}@${sc.id}${i}` } } });
  }
  if (add.length) await sc.createEmbeddedDocuments("Token", add);
}

export async function createChapter(ch) {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  ch = Number(ch);
  const C = CH[ch]; if (!C) return ui.notifications.warn("มี Chapter 2, 3, 4");
  ui.notifications.info(`กำลังสร้าง ${C.title} …`);
  await ensureItems();
  const actors = await createChapterNpcs(ch);
  const jf = await folder("JournalEntry", "Arkane 1920s");
  let j = game.journal.getName(C.title + " (DM)");
  if (!j) j = await JournalEntry.create({ name: C.title + " (DM)", folder: jf.id, ownership: { default: 0 },
    pages: [{ name: "เป้าหมายของบท", type: "text", sort: 100, text: { content: P(C.goal), format: 1 } },
      ...NPCS.filter((n) => n.ch === ch).map((n, i) => ({ name: "NPC: " + n.name, type: "text", sort: 200 + i, text: { content: P(n.text), format: 1 } }))] });
  const made = [];
  for (const def of C.scenes) {
    const existed = !!game.scenes.getName(def.name);
    const sc = await buildScene(ch, def, j);
    if (!existed) {
      try { await placeNpcs(sc, def.npcs, actors); } catch (e) { console.warn(MOD, "npcs", e); }
      for (const [n, pos, items, gp, ic] of def.loot ?? []) await lootPile(sc, n, pos, items, gp, ic);
      for (const [label, exitR, , arriveR] of def.regions ?? []) { try { await linkRegion(sc, exitR, sc, arriveR, label); } catch (e) { console.warn(MOD, e); } }
      made.push(def.name);
    }
  }
  for (const [from, exitR, to, arriveR, label] of C.links ?? []) {
    const a = game.scenes.getName(C.scenes.find((s) => s.map === from).name), b = game.scenes.getName(C.scenes.find((s) => s.map === to).name);
    if (a && b) { try { await linkRegion(a, exitR, b, arriveR, label); } catch (e) { console.warn(MOD, "link", e); } }
  }
  ui.notifications.info(`${C.title}: ${made.length ? "สร้างฉาก " + made.join(", ") : "มีฉากอยู่แล้ว"} · NPC ${Object.keys(actors).length} แบบ · ดูบันทึก "${C.title} (DM)"`);
  j.sheet?.render(true);
  const first = game.scenes.getName(C.scenes[0].name);
  return first;
}
export async function createAllChapters() { for (const c of [2, 3, 4]) await createChapter(c); }
export const CHAPTER_INFO = { CH, NPCS, ITEMS };

// loot piles for a scene that is not a chapter scene (e.g. the merged warehouse on the district map). defs: [name, [x,y] squares, [[id,qty]...], gp, icon]
export async function placeLootPiles(sc, defs) {
  await ensureItems();
  let n = 0;
  for (const [name, pos, items, gp, icon] of defs) {
    const spot = `loot-${name}`;
    const have = sc.tokens.find((t) => t.getFlag(MOD, "spot") === spot);
    if (have) { if (have.x !== Math.round(pos[0] * G) || have.y !== Math.round(pos[1] * G)) await have.update({ x: Math.round(pos[0] * G), y: Math.round(pos[1] * G) }, { animate: false }); continue; }
    const r = await lootPile(sc, name, pos, items, gp, icon, spot);
    if (r) n++;
  }
  return n;
}
