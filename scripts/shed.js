// Detailed interior of the abandoned boat shed (Mack's lair), linked to the big district map like the bar cellar.
const MOD = "arkane-1920s";
const G = 100;
export const SHED_SCENE = "Chapter 1: อู่ซ่อมเรือร้าง (ภายใน)";
const DISTRICT = "Chapter 1: ย่านท่าเรือ (แมพใหญ่)";
const MAP = {"W": 30, "H": 22, "darkness": 0.8, "walls": [{"c": [300, 200, 2200, 200]}, {"c": [0, 800, 300, 800]}, {"c": [2300, 1000, 2900, 1000]}, {"c": [0, 1200, 300, 1200]}, {"c": [300, 2000, 1100, 2000]}, {"c": [1700, 2000, 2200, 2000]}, {"c": [2300, 2100, 2900, 2100]}, {"c": [300, 200, 300, 800]}, {"c": [300, 1200, 300, 2000]}, {"c": [1100, 2000, 1100, 2200]}, {"c": [1700, 2000, 1700, 2200]}, {"c": [2200, 200, 2200, 2000]}, {"c": [2300, 1000, 2300, 2100]}, {"c": [2900, 1000, 2900, 2100]}, {"c": [300, 900, 300, 1000], "door": 1}, {"c": [800, 200, 800, 600]}, {"c": [300, 600, 500, 600]}, {"c": [500, 600, 600, 600], "door": 1}, {"c": [600, 600, 800, 600]}, {"c": [1100, 2000, 1200, 2000]}, {"c": [1600, 2000, 1700, 2000]}], "lights": [{"x": 700, "y": 900, "config": {"dim": 18, "bright": 6, "color": "#ffaa5a", "alpha": 0.5, "animation": {"type": "torch", "speed": 2, "intensity": 2}}}, {"x": 1800, "y": 800, "config": {"dim": 18, "bright": 6, "color": "#ffaa5a", "alpha": 0.5, "animation": {"type": "torch", "speed": 2, "intensity": 2}}}, {"x": 1000, "y": 1500, "config": {"dim": 16, "bright": 5, "color": "#ffaa5a", "alpha": 0.5, "animation": {"type": "torch", "speed": 2, "intensity": 2}}}, {"x": 500, "y": 300, "config": {"dim": 10, "bright": 3, "color": "#dcc8a0", "alpha": 0.3, "animation": {"type": null}}}, {"x": 1400, "y": 1950, "config": {"dim": 30, "bright": 0, "color": "#96b4e6", "alpha": 0.25, "animation": {"type": null}}}, {"x": 2600, "y": 1700, "config": {"dim": 8, "bright": 2, "color": "#78dc96", "alpha": 0.35, "animation": {"type": "fog", "speed": 2, "intensity": 2}}}]};
const rect = ([x, y, w, h]) => ({ type: "rectangle", x: x * G, y: y * G, width: w * G, height: h * G, rotation: 0, hole: false });
const P = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.startsWith("- ") ? `<li>${l.slice(2)}</li>` : `<p>${l}</p>`).join("").replace(/(<li>.*?<\/li>)+/g, (m) => `<ul>${m}</ul>`);
const NOTES = [
  ["1 ประตูหน้าอู่", 1.5, 10, `ประตูไม้บวมน้ำ ล็อกด้วยโซ่สนิม (Athletics DC 12 กระชาก หรือ Thieves' Tools DC 10 ปลดเงียบ)
- ถ้ากระชาก: เสียงดัง อันธพาลในอู่รู้ตัว ทอย Initiative ทันที
- ถ้าปลดเงียบ: ผู้เล่นได้เซอร์ไพรส์อันธพาล (ศัตรูทอย Initiative เสียเปรียบ)
- กลิ่นปลาเน่าและน้ำมันเครื่องคละคลุ้ง`],
  ["2 ห้องทำงานเก่า", 5.5, 4, `โต๊ะ เอกสารเปียกน้ำ และตู้เซฟเหล็ก (Thieves' Tools DC 15 หรือ Athletics DC 18 งัด)
- ในตู้เซฟ: เงิน $30, บัญชีรับของของซินดิเคท (เรือ "แมรี่ แอนน์" ส่งของเข้าโกดัง 4 ทุกคืนวันพฤหัส)
- Investigation DC 12 บนโต๊ะ: ภาพถ่ายแม็คก่อนกลายร่าง ยืนกับคนใส่ฮู้ดที่มีรอยสักดวงตากับหนวดที่ข้อมือ`],
  ["3 รางลากเรือ", 14, 12, `เรือประมงเก่าบนรางลาก ใช้เป็นที่กำบังครึ่งตัว
- ร่องน้ำลึก 10 ฟุตไหลออกทะเล แม็คจะหนีทางนี้เมื่อ HP เหลือต่ำกว่าครึ่ง หรือได้ตั๋วแล้ว
- ตะขอเครนแขวนเหนือร่องน้ำ: Action ปลดตะขอให้ตกใส่ศัตรูใต้มัน DEX DC 13 ไม่ผ่านโดน 2d6`],
  ["4 ถังน้ำมัน", 19.6, 17.4, `ถังน้ำมัน 4 ถัง (AC 10, HP 5) ยิงหรือจุดไฟ ระเบิด 2d6 Fire รัศมี 10 ฟุต (DEX DC 13 ครึ่ง)
- ไฟคือจุดอ่อนของแม็ค: โดนดาเมจไฟ เกล็ดหลุด AC เหลือ 11`],
  ["5 พื้นผุ", 10.3, 13.2, `ช่องสีดำคือพื้นที่ผุจนทะลุ เดินเหยียบ DEX save DC 12 ไม่ผ่านตกลงน้ำใต้อู่ (ติด Prone ในน้ำลึก 5 ฟุต ปีนขึ้นใช้ครึ่งความเร็ว)
- Perception DC 12 มองเห็นก่อนเหยียบ`],
  ["6 ฝากล", 5.5, 16.5, `ฝาไม้มีรอยลากเปียกๆ จากร่องน้ำมาถึงฝา ลงไปใต้ถุนด้วยบันไดลิง (เดินเข้าช่องแล้วระบบถามว่าจะลงไหม)
- ได้ยินเสียงฮัมเพลงแปลกๆ จากข้างล่าง Insight DC 12: เป็นเพลงที่ลูกเรือร้องเวลาจะออกทะเลลึก`],
  ["7 ใต้ถุน: รังของแม็ค", 26, 15, `เสาไม้ผุ โคลน กระดูกปลา หลอดยาวิปลาสเปล่าเป็นกอง เกล็ดสีดำเต็มพื้น
- เข้าครั้งแรกตรวจความหวาดผวา (เซฟ WIS DC 12)
- กองของในรัง: สร้อยไข่มุกดำ (ต้องสาป) และจดหมายสั่งของถึงโกดัง 4 (เบาะแสไป Chapter 2)
- ถ้าแม็คถูกต้อนลงมาที่นี่ เขาสู้จนตาย ไม่มีทางหนีลงน้ำ`]
];
// [npc key, x, y]
export const SHED_NPCS = [["mack", 25.5, 16], ["thug", 9, 12], ["thug", 18, 11.5]];

async function folderFor(type) {
  return game.folders.find((f) => f.name === "Arkane 1920s" && f.type === type) ?? Folder.create({ name: "Arkane 1920s", type, color: "#9A6B2C" });
}
export async function createShedScene() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  let sc = game.scenes.getName(SHED_SCENE);
  if (sc) return sc;
  const keyName = "แผนที่: อู่ซ่อมเรือร้าง ภายใน (DM)";
  let key = game.journal.getName(keyName);
  if (!key) key = await JournalEntry.create({ name: keyName, folder: (await folderFor("JournalEntry"))?.id, ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE },
    pages: [{ name: "แผนที่ฉบับ DM", type: "image", src: `modules/${MOD}/maps/shed-dm.webp`, sort: 50 },
      ...NOTES.map(([name, , , txt], i) => ({ name, type: "text", sort: (i + 1) * 100, text: { content: P(txt), format: 1 } }))] });
  const notes = NOTES.map(([name, x, y]) => ({ entryId: key.id, pageId: key.pages.getName(name)?.id, x: x * G, y: y * G, text: name, iconSize: 40, fontSize: 24, texture: { src: "icons/svg/book.svg" } }));
  sc = await Scene.create({ name: SHED_SCENE, folder: (await folderFor("Scene"))?.id, navigation: false,
    background: { src: `modules/${MOD}/maps/shed.webp` }, width: MAP.W * G, height: MAP.H * G, padding: 0, backgroundColor: "#0b0b0d",
    grid: { type: 1, size: G, distance: 5, units: "ft", alpha: 0.15 }, tokenVision: true, fog: { exploration: true },
    environment: { darknessLevel: MAP.darkness }, walls: MAP.walls, lights: MAP.lights, notes });
  try { const { setBackground } = await import("./ch1maps.js?v=21"); await setBackground(sc, "shed.webp"); } catch (e) { console.warn(MOD, e); }
  // inside: trapdoor ↔ ladder, cover
  try {
    const [toNest, toShed] = await sc.createEmbeddedDocuments("Region", [
      { name: "⤓ ปลายทาง: ใต้ถุน", color: "#3a7bd5", shapes: [rect([25, 11, 1, 1])] },
      { name: "⤓ ปลายทาง: ข้างฝากล", color: "#3a7bd5", shapes: [rect([4, 15, 1, 1])] }]);
    await sc.createEmbeddedDocuments("Region", [
      { name: "↪ ลงฝากล → ใต้ถุน", color: "#d58a3a", shapes: [rect([5, 16, 1, 1])], behaviors: [{ name: "ลงใต้ถุน", type: "teleportToken", system: { destination: toNest.uuid, choice: true } }] },
      { name: "↪ ปีนบันไดลิง → อู่", color: "#d58a3a", shapes: [rect([24, 10, 1, 1])], behaviors: [{ name: "ขึ้นอู่", type: "teleportToken", system: { destination: toShed.uuid, choice: true } }] },
      { name: "ที่กำบัง: เรือบนราง", color: "#5f9fcf", shapes: [rect([13, 5, 2, 4])] },
      { name: "ที่กำบัง: ลังไม้", color: "#5f9fcf", shapes: [rect([8, 17, 2, 2]), rect([19, 10, 1, 1])] },
      { name: "ที่กำบัง: ถังน้ำมัน", color: "#5f9fcf", shapes: [rect([19, 17, 2, 2])] }]);
  } catch (e) { console.warn(MOD, "shed regions", e); }
  await linkShed();
  await placeShedNpcs(sc);
  await placeNestLoot(sc);
  ui.notifications.info(`สร้างฉาก "${SHED_SCENE}" แล้ว · เชื่อมกับประตูอู่ในแมพใหญ่`);
  return sc;
}
// big district map door (4,29) ↔ shed front door
export async function linkShed() {
  const sc = game.scenes.getName(SHED_SCENE), dist = game.scenes.getName(DISTRICT);
  if (!sc || !dist) return 0;
  let made = 0;
  const pair = async (from, exitR, to, arriveR, label) => {
    const exitName = "↪ " + label, arriveName = "⤓ ปลายทาง: " + label;
    if (from.regions.getName(exitName)) return;
    let arrive = to.regions.getName(arriveName);
    if (!arrive) [arrive] = await to.createEmbeddedDocuments("Region", [{ name: arriveName, color: "#3a7bd5", shapes: [rect(arriveR)] }]);
    await from.createEmbeddedDocuments("Region", [{ name: exitName, color: "#d58a3a", shapes: [rect(exitR)],
      behaviors: [{ name: label, type: "teleportToken", system: { destination: arrive.uuid, choice: true } }] }]);
    made++;
  };
  try {
    await pair(dist, [4, 29, 1, 1], sc, [2, 9, 1, 2], "เข้าอู่ซ่อมเรือร้าง");
    await pair(sc, [0, 8, 1, 4], dist, [4, 27, 1, 1], "ออกจากอู่ → ถนนท่าเรือ");
  } catch (e) { console.warn(MOD, "link shed", e); }
  return made;
}
async function placeShedNpcs(sc) {
  const add = [];
  for (const [i, [key, x, y]] of SHED_NPCS.entries()) {
    const a = game.actors.find((q) => q.getFlag(MOD, "npc") === key);
    if (!a) continue;
    const td = (await a.getTokenDocument()).toObject();
    add.push({ ...td, x: x * G, y: y * G, flags: { ...(td.flags ?? {}), [MOD]: { ...(td.flags?.[MOD] ?? {}), spot: `${key}@shed${i}` } } });
  }
  if (add.length) await sc.createEmbeddedDocuments("Token", add);
}
async function placeNestLoot(sc) {
  const byId = (id) => game.items.find((i) => i.getFlag(MOD, "id") === id);
  const items = ["magic-pearl", "story-order-wh4", "story-vial"].map(byId).filter(Boolean).map((i) => { const d = i.toObject(); delete d._id; delete d.folder; return d; });
  const pos = { x: 27 * G, y: 19 * G };
  if (game.modules.get("item-piles")?.active && game.itempiles?.API?.createItemPile) {
    try {
      return await game.itempiles.API.createItemPile({ position: pos, sceneId: sc.id, items, createActor: true, pileActorName: "รังของแม็ค",
        tokenOverrides: { name: "กองของในรัง", texture: { src: "icons/svg/chest.svg" } }, actorOverrides: { system: { currency: { gp: 12, sp: 30 } } } });
    } catch (e) { console.warn(MOD, "nest pile", e); }
  }
}
