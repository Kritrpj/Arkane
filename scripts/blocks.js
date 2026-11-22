// District blocks for the morning of day 2: C.A.A.M. cordons that close every way west to the bar, a Finch stall in the alley
// between warehouses 2 and 4, a locked gate behind the stall, and syndicate sentries on the harbor street.
const MOD = "arkane-1920s";
const G = 100;
const DISTRICT = "Chapter 1: ย่านท่าเรือ (แมพใหญ่)";
const NOMOVE = { move: 20, sight: 0, light: 0, sound: 0 };   // blocks walking, not sight

const WALLS = [
  // C.A.A.M. cordons (x=2650): top street, mouth of the alley behind the pawn shop, harbor street + planks + water edge
  { c: [2650, 0, 2650, 300], ...NOMOVE }, { c: [2650, 1400, 2650, 1600], ...NOMOVE }, { c: [2650, 2700, 2650, 4000], ...NOMOVE },
  // Finch's counter across the alley and the locked chain-link gate behind it
  { c: [3700, 1600, 3900, 1600], ...NOMOVE }, { c: [3700, 1900, 3900, 1900], door: 1, ds: 2 },
  // bricked-in gap in the north wall of warehouse 4 (blocks movement, sight, light and sound)
  { c: [4600, 1400, 4800, 1400] }
].map((w) => ({ ...w, flags: { [MOD]: { blk: 1 } } }));

// [actor key (flag npc), center x, center y in squares, disposition, label]
const TOKENS = [
  ["agent", 27.5, 1.0, 0], ["agent", 27.5, 2.0, 0],
  ["leader", 27.5, 14.5, 0], ["agent", 27.5, 15.5, 0],
  ["agent", 27.5, 28.5, 0], ["agent", 27.5, 30.5, 0],
  ["thug", 32.5, 28.0, -1], ["thug", 35.5, 28.0, -1]
];
const lights = (hidden) => [
  { x: 3724, y: 1472, hidden, config: { bright: 6, dim: 14, color: "#ffc070", alpha: 0.4, animation: { type: "torch", speed: 2, intensity: 2 } } },
  { x: 3310, y: 2850, hidden, config: { bright: 8, dim: 18, color: "#ff8a2a", alpha: 0.45, animation: { type: "torch", speed: 4, intensity: 3 } } },
  { x: 2688, y: 20, hidden, config: { bright: 3, dim: 8, color: "#ff3a2a", alpha: 0.4, animation: { type: "pulse", speed: 3, intensity: 3 } } },
  { x: 2688, y: 1410, hidden, config: { bright: 3, dim: 8, color: "#ff3a2a", alpha: 0.4, animation: { type: "pulse", speed: 3, intensity: 3 } } },
  { x: 2688, y: 2710, hidden, config: { bright: 3, dim: 8, color: "#ff3a2a", alpha: 0.4, animation: { type: "pulse", speed: 3, intensity: 3 } } }
];

export async function placeStageBlocks() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const sc = game.scenes.getName(DISTRICT);
  if (!sc) return ui.notifications.warn("ไม่พบฉากย่านท่าเรือ (แมพใหญ่)");
  const warn = [];
  // walls
  const have = new Set(sc.walls.filter((w) => w.getFlag(MOD, "blk")).map((w) => w.c.join()));
  const addW = WALLS.filter((w) => !have.has(w.c.join()));
  if (addW.length) await sc.createEmbeddedDocuments("Wall", addW);
  // the two roll doors on the harbor side of warehouse 4 stay locked (Thieves' Tools DC 15 / Athletics DC 17, loud)
  const roll = sc.walls.filter((w) => [[4000, 2700, 4400, 2700], [5000, 2700, 5400, 2700]].some((r) => r.join() === w.c.join()) && w.ds !== 2);
  if (roll.length) await sc.updateEmbeddedDocuments("Wall", roll.map((w) => ({ _id: w.id, door: 1, ds: 2 })));
  // lights
  if (!sc.getFlag(MOD, "blkLights")) {
    await sc.createEmbeddedDocuments("AmbientLight", lights(!!sc.environment.globalLight?.enabled));
    await sc.setFlag(MOD, "blkLights", true);
  }
  // C.A.A.M. agents and syndicate sentries
  const byKey = (k) => game.actors.find((a) => a.getFlag(MOD, "npc") === k);
  const add = [];
  for (const [i, [key, x, y, disp]] of TOKENS.entries()) {
    const a = byKey(key);
    if (!a) { if (!warn.includes(key)) warn.push(key); continue; }
    const spot = `blk-${key}-${i}`;
    if (sc.tokens.find((t) => t.getFlag(MOD, "spot") === spot)) continue;
    const td = (await a.getTokenDocument()).toObject();
    add.push({ ...td, x: Math.round((x - (td.width ?? 1) / 2) * G), y: Math.round((y - (td.height ?? 1) / 2) * G), disposition: disp, flags: { ...(td.flags ?? {}), [MOD]: { ...(td.flags?.[MOD] ?? {}), spot } } });
  }
  // Finch behind his counter
  let finch = game.actors.find((a) => a.getFlag(MOD, "merchant"));
  if (!finch) { try { const m = await import("./merchant.js?v=21"); finch = await m.createBlackMarket(); finch?.sheet?.close(); } catch (e) { console.warn(MOD, "finch", e); } }
  if (finch && !sc.tokens.find((t) => t.getFlag(MOD, "spot") === "blk-finch")) {
    const td = (await finch.getTokenDocument()).toObject();
    add.push({ ...td, x: Math.round(3800 - (td.width ?? 1) * G / 2), y: Math.round(1690 - (td.height ?? 1) * G / 2), flags: { ...(td.flags ?? {}), [MOD]: { ...(td.flags?.[MOD] ?? {}), spot: "blk-finch" } } });
  }
  if (add.length) await sc.createEmbeddedDocuments("Token", add);
  const missing = warn.length ? ` (ไม่พบ NPC: ${warn.join(", ")} กดมาโครวาง NPC Chapter 1 ก่อน)` : "";
  ui.notifications.info(`วางด่านแล้ว: ปิดทางไปบาร์ 3 จุด · แผงฟินช์ในซอยโกดัง · ประตูเหล็กล็อก · ยามซินดิเคท${missing}`);
  await ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card"><div class="rw-title">ด่านที่วางไว้ (DM)</div><ul>
    <li><b>ด่าน C.A.A.M. 3 จุด</b> ถนนบนสุด · ปากตรอกหลังร้านรับจำนำ (มีรถตู้ หัวหน้าทีมคุม) · ถนนริมท่าเรือ: ปิดทางทั้งหมดไปฝั่งบาร์/ร้านตัดสูท ("คำสั่งหัวหน้า: ไปได้แค่ทางโกดัง")</li>
    <li><b>แผงฟินช์</b> ซอยแคบระหว่างโกดัง 2 กับ 4 ปากซอยอยู่ถนนหลังโรงเตี๊ยม ฟินช์อยู่หลังเคาน์เตอร์ ดับเบิลคลิกเพื่อเปิดร้าน (ของมีตามช่วงเรื่อง ใช้มาโคร "ร้านฟินช์: ตั้งด่านสินค้า")</li>
    <li><b>ประตูเหล็กท้ายซอย</b> ล็อก (Thieves' Tools DC 13 หรือ Athletics DC 15 งัด ดังมาก) ฟินช์ถือกุญแจ ขายทางผ่านได้ถ้าผู้เล่นยื่นข้อเสนอ</li>
    <li><b>โกดัง 4</b> ช่องเปิดด้านเหนือถูกก่ออิฐ/ปิดม้วนเหล็ก (ผ่านไม่ได้) ประตูม้วนทั้งสองฝั่งท่าเรือล็อก (Thieves' Tools DC 15 หรือ Athletics DC 17 ดังมาก) ผู้เล่นต้องสะเดาะ งัด หรือให้คนข้างในเปิดให้</li>
    <li><b>ยามซินดิเคท 2 คน</b> บนถนนริมท่าเรือ ทางอ้อมที่ไปประตูม้วนโกดัง (Stealth DC 13 ผ่านได้ หรือคุย/สู้)</li></ul></div>` });
}
