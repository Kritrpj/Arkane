// Tutorial: Finch's old warehouse — a practice scene to teach movement, looting, shopping and combat.
import { createBlackMarket } from "./merchant.js?v=21";
const MOD = "arkane-1920s";
const G = 100;
export const TUT_SCENE = "ฉากซ้อม: โกดังเก่าของฟินช์";
const JOURNAL = "สอนเล่น Arkane 1920s";
const FOLDER = "Arkane 1920s · ฉากซ้อม";
const MAP = {"W": 24, "H": 16, "darkness": 0.6, "walls": [{"c": [400, 100, 1000, 100]}, {"c": [1700, 100, 2300, 100]}, {"c": [300, 300, 400, 300]}, {"c": [300, 400, 400, 400]}, {"c": [1700, 400, 2300, 400]}, {"c": [1000, 500, 2300, 500]}, {"c": [1000, 600, 1100, 600]}, {"c": [400, 700, 600, 700]}, {"c": [700, 700, 1000, 700]}, {"c": [400, 800, 600, 800]}, {"c": [700, 800, 1000, 800]}, {"c": [400, 1500, 1000, 1500]}, {"c": [1100, 1500, 2300, 1500]}, {"c": [300, 0, 300, 300]}, {"c": [300, 400, 300, 1600]}, {"c": [400, 100, 400, 300]}, {"c": [400, 400, 400, 700]}, {"c": [400, 800, 400, 1500]}, {"c": [600, 700, 600, 800]}, {"c": [700, 700, 700, 800]}, {"c": [1000, 100, 1000, 500]}, {"c": [1000, 600, 1000, 700]}, {"c": [1000, 800, 1000, 1500]}, {"c": [1100, 600, 1100, 1500]}, {"c": [1700, 100, 1700, 400]}, {"c": [2300, 100, 2300, 400]}, {"c": [2300, 500, 2300, 1500]}, {"c": [400, 300, 400, 400], "door": 1}, {"c": [600, 800, 700, 800], "door": 1}, {"c": [1100, 500, 1100, 600], "door": 1}], "lights": [{"x": 150, "y": 200, "config": {"dim": 25, "bright": 8, "color": "#ffc070", "alpha": 0.4, "animation": {"type": "torch", "speed": 2, "intensity": 2}}}, {"x": 650, "y": 350, "config": {"dim": 15, "bright": 5, "color": "#ffd8a0", "alpha": 0.35, "animation": {"type": null}}}, {"x": 1400, "y": 700, "config": {"dim": 20, "bright": 8, "color": "#ffdcaa", "alpha": 0.35, "animation": {"type": null}}}, {"x": 1900, "y": 700, "config": {"dim": 20, "bright": 8, "color": "#ffdcaa", "alpha": 0.35, "animation": {"type": null}}}, {"x": 1600, "y": 1250, "config": {"dim": 20, "bright": 8, "color": "#ffdcaa", "alpha": 0.35, "animation": {"type": null}}}, {"x": 1950, "y": 250, "config": {"dim": 15, "bright": 5, "color": "#ffbe78", "alpha": 0.4, "animation": {"type": "torch", "speed": 2, "intensity": 2}}}]};
const cell = (x, y) => ({ x: x * G, y: y * G });
const rect = ([x, y, w, h]) => ({ type: "rectangle", x: x * G, y: y * G, width: w * G, height: h * G, rotation: 0, hole: false });
const P = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.startsWith("- ") ? `<li>${l.slice(2)}</li>` : l.startsWith("## ") ? `<h3>${l.slice(3)}</h3>` : `<p>${l}</p>`).join("").replace(/(<li>.*?<\/li>)+/g, (m) => `<ul>${m}</ul>`);

// ---------- player-facing pages
const PAGES = [
["0 ภารกิจซ้อม: งานแรกจากฟินช์", `
ฟินช์ "ลิ้นทอง" พ่อค้าตลาดมืดจ้างพวกคุณมาเคลียร์โกดังเก่าของเขา ค่าจ้าง $15 จ่ายล่วงหน้าไว้ในลังแล้ว
## สิ่งที่ต้องทำ
- ① เดินเข้าโกดังจากถนน (ประตูไม้ฝั่งซ้าย)
- ② เข้าห้องเก็บของมืดๆ หาลังที่มีกากบาท เก็บค่าจ้างกับของที่ฟินช์ฝากไว้
- ③ ขึ้นบันไดไปชั้นลอย ซื้ออุปกรณ์จากฟินช์
- ④ ไปลานซ้อม ยิงหุ่นให้คล่อง แล้วประลองกับจ่าโทบี้
ฉากนี้เป็นการซ้อม ไม่นับเป็นเนื้อเรื่องจริง ลองผิดลองถูกได้เต็มที่`],
["1 เดินและมองเห็น", `
- <b>เดิน:</b> คลิกค้างที่โทเคนของคุณแล้วลาก 1 ช่องเท่ากับ 5 ฟุต เดินได้ตามความเร็ว (ส่วนใหญ่ 30 ฟุต = 6 ช่องต่อเทิร์น)
- <b>วัดระยะ:</b> ระหว่างลากจะเห็นตัวเลขระยะ หรือกด <b>M</b> แล้วลากไม้บรรทัด
- <b>กำแพง:</b> เดินทะลุไม่ได้และมองทะลุไม่ได้ ส่วนที่ยังไม่เคยเห็นจะเป็นสีดำ (Fog of War)
- <b>ประตู:</b> คลิกที่ไอคอนประตูเพื่อเปิดหรือปิด
- <b>ความมืด:</b> ห้องที่ไม่มีไฟจะมืด ตัวละครที่มี Darkvision มองเห็นเป็นภาพขาวดำ คนอื่นต้องมีไฟ
- <b>บันได:</b> เดินไปที่ขั้นบันได ระบบจะถามว่าจะขึ้นไหม กดตกลงแล้ววาร์ปไปชั้นลอย
- <b>ดูชีท:</b> ดับเบิลคลิกโทเคนของตัวเอง`],
["2 เก็บของและใส่ของ", `
- <b>เก็บของ:</b> ดับเบิลคลิกลังของฟินช์ หน้าต่างลังจะเปิดขึ้น กด <b>Take</b> หรือลากของเข้าชีทตัวเอง
- <b>แบ่งเงิน:</b> ในหน้าต่างลังกด Split เพื่อแบ่งเงินเท่ากันทุกคน
- <b>ใส่ชุด:</b> เปิดชีท แท็บ Inventory กดไอคอนเสื้อ (Equip) ข้างชุด AC จะเปลี่ยนเอง
- <b>ของวิเศษ:</b> บางชิ้นต้องกด Attune (ไอคอนดาว) ก่อน ผลถึงจะขึ้น ใช้พร้อมกันได้ไม่เกิน 3 ชิ้น
- <b>ลองดู:</b> ใส่แว่นตาเลนส์อำพันในห้องมืด จะเห็นทันทีว่า Darkvision ทำงานอย่างไร
- <b>ของในเนื้อเรื่อง:</b> จดหมาย ตั๋ว ใบเสร็จ อ่านได้โดยคลิกชื่อของในชีท`],
["3 ซื้อขายกับฟินช์", `
- เดินไปยืนหน้าเคาน์เตอร์ แล้ว<b>ดับเบิลคลิกโทเคนฟินช์</b> หน้าร้านจะเปิดขึ้น
- กดของที่อยากได้แล้วกด <b>Buy</b> เงินในชีทจะลดเอง ของเข้าชีทเอง
- ขายของคืน: ลากของจากชีทไปวางในหน้าร้าน ฟินช์รับซื้อ 40% ของราคา
- อยากต่อราคา บอก DM แล้วทอย <b>Persuasion</b> (DC 14) สำเร็จลด 10% ได้คืนละครั้ง
- เงิน: $10 = ธนบัตรสิบดอลลาร์ (pp) · $1 = ดอลลาร์วาเลอเรีย (gp) · 50¢ (ep) · 10¢ ไดม์ (sp) · 1¢ เซนต์ (cp)
- ของแนะนำสำหรับมือใหม่: กระสุนให้ปืน ชุดปฐมพยาบาล ไฟฉาย`],
["4 เล็งเป้าและโจมตี", `
- <b>1. เล็ง:</b> เอาเมาส์ชี้ศัตรูแล้วกด <b>T</b> จะมีวงเป้าขึ้นรอบตัวมัน
- <b>2. โจมตี:</b> เปิดชีท กดอาวุธหรือเวท แล้วกด <b>Attack</b>
- <b>3. ผลลัพธ์:</b> ทอย d20 + โบนัส ถ้าได้เท่ากับหรือมากกว่า AC ของเป้าถือว่าโดน ระบบทอยดาเมจและหักเลือดให้เอง
- ทอยได้ 20 = คริติคอล ลูกเต๋าดาเมจคูณสอง · ทอยได้ 1 = พลาดแน่นอน
- ปืนกับธนูมีเสียงและกระสุนพุ่ง เวทมีลำแสง ถ้าพลาดจะขึ้นคำว่า "พลาด!" บนหัวเป้า
- <b>ลองดู:</b> ยิงหุ่นฟางที่ยืนโล่งก่อน แล้วค่อยยิงหุ่นหลังลัง เทียบกันว่าต่างกันอย่างไร`],
["5 ระยะ ที่กำบัง และกระสุน", `
- <b>ระยะยิง:</b> อาวุธมีสองตัวเลข เช่น ลูกโม่ 40/120 ยิงเกินตัวแรกจะ<b>เสียเปรียบ</b> (ทอยสองลูกเอาค่าต่ำ) เกินตัวหลังยิงไม่ได้ ระบบเตือนก่อนทอย
- <b>ศัตรูประชิดตัว:</b> ยิงหรือร่ายเวทระยะไกลจะเสียเปรียบ
- <b>ที่กำบัง:</b> ถ้ามีลัง โต๊ะ หรือคนขวาง ทอยโจมตี −2 · หลังกระสอบทรายหรือเคาน์เตอร์ −5 · มิดตัว ยิงไม่ได้
- <b>ฝึก:</b> ลานซ้อมมีเส้นบอกระยะ 10 / 30 / 50 ฟุตจากประตู ลองยิงจากแต่ละเส้น
- <b>กระสุน:</b> ยิงหนึ่งนัดหักหนึ่งนัดในปืน หมดแล้วคลิกโทเคนตัวเองแล้วกดมาโคร <b>"บรรจุกระสุน"</b>
- ลูกโม่ ลูกซอง ไรเฟิล บรรจุใช้แทนการโจมตี 1 ครั้ง · แม็ก .45 หรือ Speedloader ใช้ Bonus Action`],
["6 เทิร์นต่อสู้", `
- เริ่มต่อสู้: ทุกคนทอย <b>Initiative</b> (ปุ่มใน Combat Tracker) เรียงลำดับ แต่ละรอบยาว 6 วินาที
- <b>ในเทิร์นของคุณ:</b> เดินได้ตามความเร็ว + <b>Action</b> 1 ครั้ง + <b>Bonus Action</b> ถ้ามีความสามารถ
- <b>Action:</b> โจมตี · ร่ายเวท · Dash (วิ่งเพิ่ม) · Disengage (ถอยไม่โดนตีสวน) · Dodge (ศัตรูโจมตีเสียเปรียบ) · Hide · Help · ใช้ของ
- <b>Reaction:</b> 1 ครั้งต่อรอบ ใช้นอกเทิร์น เช่น ตีศัตรูที่เดินหนีจากข้างตัว หรือร่าย Shield
- <b>จบเทิร์น:</b> กด End Turn ใน Combat Tracker
- <b>HP เหลือ 0:</b> หมดสติ ทอย Death Save ทุกเทิร์น (10 ขึ้นไปผ่าน) ผ่าน 3 ครั้งรอด ไม่ผ่าน 3 ครั้งตาย เพื่อนรักษาแม้ 1 HP ก็ฟื้น
- <b>ประลองกับจ่าโทบี้:</b> เขาใช้กระบองยางกับกระสุนยาง ถ้าคุณล้ม เขาจะหยุดและช่วยพยุงขึ้น`],
["7 ความหวาดผวา", `
- โลกนี้มีสิ่งที่จิตใจคนรับไม่ไหว เมื่อเจอ DM จะให้ทอย <b>เซฟ Wisdom</b>
- ไม่ผ่าน: ได้แต้ม <b>Dread</b> 1 แต้ม และถ้าอยู่ในการต่อสู้จะติด Frightened ชั่วครู่ (โจมตีเสียเปรียบ เดินเข้าหาสิ่งนั้นไม่ได้)
- Dread ครบ 3 แต้ม ได้ "อาการ" ทางจิตใจ 1 อย่าง แล้วแต้มกลับเป็น 0
- Long Rest ในที่ปลอดภัยลด Dread ได้ 1 แต้ม
- <b>ไม่ใช่ทุกอย่างที่ฆ่าได้ด้วยกระสุน</b> การหนี ปิดประตู และหาวิธีอื่น ก็เป็นทางรอด`],
["8 สรุปปุ่มลัด", `
- <b>ลากโทเคน</b> = เดิน · <b>ดับเบิลคลิก</b> = เปิดชีท / เปิดลัง / เปิดร้าน
- <b>T</b> = เล็งเป้า · <b>M</b> = ไม้บรรทัดวัดระยะ
- <b>คลิกขวาโทเคน</b> = เมนูโทเคน (สถานะ เป้า ซ่อน)
- <b>Attack</b> → ระบบทอยดาเมจและหักเลือดเอง
- มาโคร <b>"บรรจุกระสุน"</b> = เติมนัดในปืน
- ไม่แน่ใจว่าต้องกดอะไร บอก DM ว่าอยากทำอะไร แล้ว DM จะบอกว่าต้องทอยอะไร`]
];
const DM_PAGE = ["DM: ลำดับการสอน", `
## ก่อนเริ่ม
- เปิดฉาก "${TUT_SCENE}" (Activate) ผู้เล่นทุกคนยืนอยู่ที่ถนนฝั่งซ้าย
- เปิดเจอร์นัลหน้า "0 ภารกิจซ้อม" ให้ผู้เล่นดู (Show Players)
## ① ทางเข้า (5 นาที)
- ให้ทุกคนลากโทเคนเข้าประตู เปิดประตูเอง ลองวัดระยะด้วย M
- ให้ขึ้นบันไดไปชั้นลอยแล้วลงมาอีกครั้ง
## ② ห้องมืด (10 นาที)
- คนไม่มี Darkvision จะมองไม่เห็น ให้เพื่อนที่มี Darkvision นำ หรือใส่แว่นตาเลนส์อำพันที่อยู่ในลัง
- ดับเบิลคลิกลัง เก็บของ แบ่งเงิน ใส่เสื้อกั๊กกันกระสุนแล้วดู AC เปลี่ยน
- <b>เงาในความมืด</b> ซ่อนอยู่มุมห้อง (โทเคนถูกซ่อน) ยังไม่ต้องเผย เก็บไว้ตอนจบ
## ③ ร้านฟินช์ (5–10 นาที)
- ให้แต่ละคนซื้อของ 1 ชิ้น ลองต่อราคาด้วย Persuasion DC 14
## ④ ลานซ้อม (15 นาที)
- ยิงหุ่นฟางที่โล่ง (AC 10) → ยิงหุ่นหลังลัง (ที่กำบัง −2) → ยิงหุ่นฟางที่ไกล 50 ฟุต (ปืนพก/เวท เกินระยะปกติบางอย่าง)
- ให้ยิงจนกระสุนหมด แล้วกดมาโคร "บรรจุกระสุน"
- เริ่มการต่อสู้กับ <b>จ่าโทบี้</b> (Initiative) เขาอยู่หลังกระสอบทราย (−5) ต้องเดินอ้อมหรือใช้เวทที่ไม่ต้องทอยโจมตี
- จ่าโทบี้ทำดาเมจแบบไม่ถึงตาย ถ้าใครล้มให้ทอย Death Save หนึ่งรอบเพื่อสอน แล้วจ่าโทบี้ช่วยพยุง
## ตอนจบ: เงาในความมืด
- ไฟในโกดังกะพริบแล้วดับ (ลด Darkness ของฉาก) เผยโทเคนเงาในห้องมืด
- ทุกคนที่เห็นทอยเซฟ WIS DC 10 (ความหวาดผวา) ไม่ผ่านติด Frightened 1 รอบ
- เงามี HP แค่ 9 ฆ่าได้ หรือหนีออกจากโกดังก็จบเหมือนกัน
- ฟินช์บอกว่า "นั่นแหละ ที่ผมไม่ยอมเข้าไปเอง"
## ซ้อมซ้ำ
- มาโคร <b>"ฉากซ้อม: รีเซ็ต"</b> คืนเลือดหุ่น เติมของในลัง และย้ายทุกคนกลับจุดเริ่ม
- ของที่ผู้เล่นได้ในฉากซ้อม ถ้าไม่อยากให้ติดไปเกมจริง ลบออกจากชีทหลังจบ`];

// ---------- actors used only here
const W = (name, melee, bonus, [n, d, b], type, range, img, note) => {
  const id = foundry.utils.randomID();
  const sys = { type: { value: melee ? "simpleM" : "simpleR" }, equipped: true, proficient: 1, description: { value: note ? `<p>${note}</p>` : "" },
    damage: { base: { number: n, denomination: d, bonus: b ? String(b) : "", types: [type] } },
    activities: { [id]: { _id: id, type: "attack", name: melee ? "โจมตี" : "ยิง", attack: { ability: "none", bonus: String(bonus), flat: true, type: { value: melee ? "melee" : "ranged", classification: "weapon" } }, damage: { includeBase: true } } } };
  if (range) { const [a, l] = range.split("/").map(Number); sys.range = { value: a, long: l, units: "ft" }; }
  return { name, type: "weapon", img, system: sys, flags: { [MOD]: { npcWeapon: true } } };
};
const ACTORS = [
  { role: "dummyA", name: "หุ่นฟาง (โล่ง)", img: "tokens/dummy.webp", ac: 10, hp: 40, ab: [10, 1, 10, 1, 1, 1], at: [20, 6], disp: -1, bio: "หุ่นซ้อม AC 10 ยืนโล่ง ไม่มีที่กำบัง ไม่ตีกลับ" },
  { role: "dummyB", name: "หุ่นฟาง (หลังลัง)", img: "tokens/dummy.webp", ac: 10, hp: 40, ab: [10, 1, 10, 1, 1, 1], at: [15, 8], disp: -1, bio: "หุ่นซ้อมหลังลังไม้ ยิงจากประตูจะติดที่กำบังครึ่งตัว (−2)" },
  { role: "dummyC", name: "หุ่นฟาง (ไกล 50 ฟุต)", img: "tokens/dummy.webp", ac: 10, hp: 40, ab: [10, 1, 10, 1, 1, 1], at: [21, 9], disp: -1, bio: "หุ่นซ้อมไกลจากประตู 50 ฟุต ใช้สอนเรื่องระยะยิง" },
  { role: "sarge", name: "จ่าโทบี้ แฮมเมอร์ (ครูฝึก)", img: "tokens/sarge.webp", ac: 13, hp: 22, ab: [14, 12, 14, 10, 12, 10], at: [19, 11], disp: -1,
    bio: "ทหารผ่านศึกที่ฟินช์จ้างมาเฝ้าโกดัง ใช้กระบองยางกับกระสุนยาง ตั้งใจสอนไม่ได้ตั้งใจฆ่า ถ้าใครล้มเขาหยุดทันที · ยืนหลังกระสอบทราย (ที่กำบังสามในสี่)",
    items: [W("กระบองยาง", true, 3, [1, 4, 1], "bludgeoning", null, "icons/svg/sword.svg", "ไม่ถึงตาย: ทำให้ HP เหลือ 0 แล้วหมดสติแทนตาย"), W("ลูกโม่กระสุนยาง", false, 3, [1, 4, 0], "bludgeoning", "40/120", "icons/svg/target.svg", "กระสุนยาง ไม่ถึงตาย")] },
  { role: "shadow", name: "เงาในความมืด", img: "tokens/shadow.webp", ac: 11, hp: 9, ab: [6, 14, 10, 6, 10, 8], at: [4, 8], disp: -1, hidden: true,
    bio: "สิ่งที่ขดตัวอยู่ในมุมมืดของห้องเก็บของ เห็นครั้งแรกเซฟ WIS DC 10 (ความหวาดผวา) · ไม่ชอบแสง ถ้าโดนไฟฉายส่องจะถอยหนี",
    items: [W("สัมผัสเย็นเฉียบ", true, 3, [1, 4, 0], "necrotic", null, "icons/svg/skull.svg", "")] }
];
const ABS = ["str", "dex", "con", "int", "wis", "cha"];
async function folder() {
  return game.folders.find((f) => f.name === FOLDER && f.type === "Actor") ?? Folder.create({ name: FOLDER, type: "Actor", color: "#5a6a3a" });
}
async function ensureActors() {
  const f = await folder();
  const out = {};
  for (const a of ACTORS) {
    let actor = game.actors.find((x) => x.getFlag(MOD, "tutorial") === a.role);
    if (!actor) {
      actor = await Actor.create({ name: a.name, type: "npc", folder: f.id, img: `modules/${MOD}/${a.img}`,
        system: { abilities: Object.fromEntries(ABS.map((k, i) => [k, { value: a.ab[i] }])), attributes: { ac: { calc: "flat", flat: a.ac }, hp: { value: a.hp, max: a.hp }, movement: { walk: a.role.startsWith("dummy") ? 0 : 30 } },
          details: { cr: 0, biography: { value: `<p>${a.bio}</p>` } } },
        prototypeToken: { name: a.name, actorLink: false, disposition: a.disp, displayName: 30, displayBars: 30, bar1: { attribute: "attributes.hp" }, texture: { src: `modules/${MOD}/${a.img}` } },
        flags: { [MOD]: { tutorial: a.role } } });
      if (a.items) await actor.createEmbeddedDocuments("Item", a.items);
    }
    out[a.role] = actor;
  }
  return out;
}
async function lootItems() {
  const byId = (id) => game.items.find((i) => i.getFlag(MOD, "id") === id);
  const want = [["armor-vest", 1], ["magic-goggles", 1], ["magic-salts", 1], ["ammo-กระสุน .38", 12], ["gear-ไฟฉายแบตเตอรี่", 1], ["story-letter-ap", 0]];
  const out = [];
  for (const [id, q] of want) {
    if (!q) continue;
    const src = byId(id); if (!src) continue;
    const d = src.toObject(); delete d._id; delete d.folder;
    if ("quantity" in (d.system ?? {})) d.system.quantity = q;
    out.push(d);
  }
  return out;
}
async function placeLoot(scene) {
  const items = await lootItems();
  const pos = cell(6, 11);
  if (game.modules.get("item-piles")?.active && game.itempiles?.API?.createItemPile) {
    const opts = { position: pos, sceneId: scene.id, items, createActor: true, pileActorName: "ลังของฟินช์",
      tokenOverrides: { name: "ลังของฟินช์ (ดับเบิลคลิกเพื่อเปิด)", texture: { src: "icons/svg/chest.svg" } },
      actorOverrides: { system: { currency: { gp: 15 } }, flags: { [MOD]: { tutorial: "loot" } } } };
    try { return await game.itempiles.API.createItemPile(opts); }
    catch (e) { try { return await game.itempiles.API.createItemPile(pos, { ...opts, sceneId: scene.id }); } catch (e2) { console.warn(MOD, "item pile", e, e2); } }
  }
  // fallback: a plain NPC "crate" the DM can hand items from
  const f = await folder();
  const crate = await Actor.create({ name: "ลังของฟินช์", type: "npc", folder: f.id, img: "icons/svg/chest.svg", system: { currency: { gp: 15 } },
    prototypeToken: { name: "ลังของฟินช์", disposition: 0, texture: { src: "icons/svg/chest.svg" } }, flags: { [MOD]: { tutorial: "loot" } } });
  await crate.createEmbeddedDocuments("Item", items);
  await scene.createEmbeddedDocuments("Token", [{ ...(await crate.getTokenDocument()).toObject(), ...pos }]);
}

export async function createTutorial() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  let scene = game.scenes.getName(TUT_SCENE);
  if (scene) { ui.notifications.info("มีฉากซ้อมอยู่แล้ว เปิดให้"); return scene.view(); }
  // journal
  let jr = game.journal.getName(JOURNAL);
  if (!jr) {
    const jf = game.folders.find((f) => f.name === "Arkane 1920s" && f.type === "JournalEntry");
    jr = await JournalEntry.create({ name: JOURNAL, folder: jf?.id, ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER },
      pages: [...PAGES.map(([name, txt], i) => ({ name, type: "text", sort: (i + 1) * 100, text: { content: P(txt), format: 1 } })),
        { name: DM_PAGE[0], type: "text", sort: 9000, ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE }, text: { content: P(DM_PAGE[1]), format: 1 } },
        { name: "แผนที่ฉบับ DM", type: "image", sort: 9100, ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE }, src: `modules/${MOD}/maps/tutorial-dm.webp` }] });
  }
  const pid = (n) => jr.pages.find((p) => p.name.startsWith(n))?.id;
  const notes = [["0", 1.5, 6], ["1", 6.5, 2.5], ["2", 7, 10], ["3", 18.5, 2.5], ["4", 13, 6], ["5", 13, 12], ["6", 16, 6], ["7", 5, 13]]
    .map(([k, x, y]) => ({ entryId: jr.id, pageId: pid(k), x: x * G, y: y * G, iconSize: 40, fontSize: 22, text: jr.pages.get(pid(k))?.name ?? "", texture: { src: "icons/svg/book.svg" } }));
  const sf = game.folders.find((f) => f.name === "Arkane 1920s" && f.type === "Scene") ?? await Folder.create({ name: "Arkane 1920s", type: "Scene", color: "#9A6B2C" });
  scene = await Scene.create({
    name: TUT_SCENE, folder: sf.id, navigation: true, background: { src: `modules/${MOD}/maps/tutorial.webp` },
    width: MAP.W * G, height: MAP.H * G, padding: 0, backgroundColor: "#0b0b0d",
    grid: { type: 1, size: G, distance: 5, units: "ft", alpha: 0.2 },
    tokenVision: true, fog: { exploration: true }, environment: { darknessLevel: MAP.darkness },
    walls: MAP.walls, lights: MAP.lights, notes
  });
  try { const { setBackground } = await import("./ch1maps.js?v=21"); await setBackground(scene, "tutorial.webp"); } catch (e) { console.warn(MOD, e); }
  // regions: stairs + cover
  try {
    const [toLoft, toEntry] = await scene.createEmbeddedDocuments("Region", [
      { name: "⤓ ปลายทาง: ชั้นลอย", color: "#3a7bd5", shapes: [rect([18, 2, 1, 1])] },
      { name: "⤓ ปลายทาง: ห้องทางเข้า", color: "#3a7bd5", shapes: [rect([8, 2, 1, 1])] }]);
    await scene.createEmbeddedDocuments("Region", [
      { name: "↪ ขึ้นบันได → ชั้นลอย (ร้านฟินช์)", color: "#d58a3a", shapes: [rect([9, 1, 1, 1])], behaviors: [{ name: "ขึ้นบันได", type: "teleportToken", system: { destination: toLoft.uuid, choice: true } }] },
      { name: "↪ ลงบันได → ห้องทางเข้า", color: "#d58a3a", shapes: [rect([17, 1, 1, 1])], behaviors: [{ name: "ลงบันได", type: "teleportToken", system: { destination: toEntry.uuid, choice: true } }] },
      { name: "ที่กำบัง: ลังไม้", color: "#5f9fcf", shapes: [rect([14, 8, 1, 2]), rect([14, 12, 1, 1])] },
      { name: "ที่กำบัง 3/4: กระสอบทราย", color: "#2f6f9f", shapes: [rect([17, 10, 2, 3])] },
      { name: "ที่กำบัง: ถังไม้", color: "#5f9fcf", shapes: [rect([12.5, 13, 1.5, 1])] }]);
  } catch (e) { console.warn(MOD, "tutorial regions", e); }
  // tokens: training actors, Finch, loot crate, player characters
  const actors = await ensureActors();
  const toks = [];
  for (const a of ACTORS) {
    const td = (await actors[a.role].getTokenDocument()).toObject();
    toks.push({ ...td, ...cell(...a.at), hidden: !!a.hidden, flags: { ...(td.flags ?? {}), [MOD]: { tutorial: a.role, home: cell(...a.at) } } });
  }
  let finch = game.actors.find((x) => x.getFlag(MOD, "merchant"));
  if (!finch) { try { finch = await createBlackMarket(); finch?.sheet?.close(); } catch (e) { console.warn(MOD, e); } }
  if (finch) { const td = (await finch.getTokenDocument()).toObject(); toks.push({ ...td, ...cell(20, 1), flags: { ...(td.flags ?? {}), [MOD]: { tutorial: "finch", home: cell(20, 1) } } }); }
  const pcs = game.actors.filter((x) => x.getFlag(MOD, "pc") && !x.getFlag(MOD, "later"));
  for (const [i, pc] of pcs.entries()) {
    const at = cell(1, 5 + i);
    const td = (await pc.getTokenDocument()).toObject();
    toks.push({ ...td, ...at, flags: { ...(td.flags ?? {}), [MOD]: { tutorial: "pc", home: at } } });
  }
  await scene.createEmbeddedDocuments("Token", toks);
  await placeLoot(scene);
  await scene.view();
  ui.notifications.info("สร้างฉากซ้อมแล้ว · เปิดเจอร์นัล \"สอนเล่น Arkane 1920s\" หน้า DM: ลำดับการสอน");
  jr.sheet?.render(true);
  return scene;
}

export async function resetTutorial() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const scene = game.scenes.getName(TUT_SCENE);
  if (!scene) return createTutorial();
  const ups = [];
  for (const t of scene.tokens) {
    const f = t.getFlag(MOD, "tutorial"), home = t.getFlag(MOD, "home");
    if (!f) continue;
    const u = { _id: t.id };
    if (home) Object.assign(u, home);
    if (f === "shadow") u.hidden = true;
    ups.push(u);
    if (f !== "pc" && f !== "finch" && t.actor) {
      const max = t.actor.system.attributes?.hp?.max;
      if (max) { try { await t.actor.update({ "system.attributes.hp.value": max }); } catch {} }
    }
  }
  if (ups.length) await scene.updateEmbeddedDocuments("Token", ups, { animate: false, teleport: true });
  // fresh loot crate
  const loot = scene.tokens.filter((t) => t.actor?.getFlag(MOD, "tutorial") === "loot" || /ลังของฟินช์/.test(t.name));
  for (const t of loot) { const a = t.actor; await t.delete(); if (a && !a.isToken) { try { await a.delete(); } catch {} } }
  await placeLoot(scene);
  try { await scene.update({ "environment.darknessLevel": MAP.darkness }); } catch {}
  try { await game.combats.filter((c) => c.scene?.id === scene.id).forEach((c) => c.delete()); } catch {}
  ui.notifications.info("รีเซ็ตฉากซ้อมแล้ว: หุ่นเต็มเลือด เงากลับไปซ่อน ลังเติมของใหม่ ทุกคนกลับจุดเริ่ม");
}

// ---------- one button: build (if needed), add every current PC, reset, and move all players to the practice scene
export async function startTutorial() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  let scene = game.scenes.getName(TUT_SCENE);
  if (!scene) scene = await createTutorial();
  if (!scene) return;
  // drop tokens whose actor no longer exists, add PCs that joined after the scene was built
  const dead = scene.tokens.filter((t) => t.getFlag(MOD, "tutorial") === "pc" && !t.actor).map((t) => t.id);
  if (dead.length) await scene.deleteEmbeddedDocuments("Token", dead);
  const have = new Set(scene.tokens.filter((t) => t.getFlag(MOD, "tutorial") === "pc").map((t) => t.actorId));
  const pcs = game.actors.filter((x) => x.getFlag(MOD, "pc") && !x.getFlag(MOD, "later"));
  const add = [];
  let row = scene.tokens.filter((t) => t.getFlag(MOD, "tutorial") === "pc").length;
  for (const pc of pcs) {
    if (have.has(pc.id)) continue;
    const at = cell(1, 5 + row++);
    const td = (await pc.getTokenDocument()).toObject();
    add.push({ ...td, ...at, flags: { ...(td.flags ?? {}), [MOD]: { tutorial: "pc", home: at } } });
  }
  if (add.length) await scene.createEmbeddedDocuments("Token", add);
  await resetTutorial();
  await scene.activate();
  game.journal.getName(JOURNAL)?.sheet?.render(true);
  ChatMessage.create({ speaker: { alias: "ฟินช์" }, content: `<div class="rw-card"><div class="rw-title">ฉากซ้อม: โกดังเก่าของฟินช์</div>
    "ก่อนจะไปทำงานจริง มาลองมือกันหน่อย" · ลองเดิน เปิดประตู ค้นลัง ยิงหุ่น และต่อสู้กับครูฝึก<br>
    <i>ของที่ได้ในฉากซ้อมจะถูกล้างตอนเริ่ม Chapter 1</i></div>` });
  ui.notifications.info(`เริ่มฉากซ้อมแล้ว · ผู้เล่นทุกคนถูกย้ายมาที่ฉากนี้${add.length ? ` · เพิ่มโทเคนผู้เล่นใหม่ ${add.length} คน` : ""}`);
  return scene;
}
