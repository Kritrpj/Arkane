// Chapter 1 map v2: The Rusty Wand — street level (left) and cellar (right) in one scene.
// Cellar x = street x + 19 cells. Move tokens across manually when they use the stairs.
const MOD = "arkane-1920s";
import { setBackground } from "./ch1maps.js?v=21";
const SCENE = "Chapter 1: บาร์ The Rusty Wand (2 ชั้น)";
const KEY = "แผนที่: บาร์ The Rusty Wand 2 ชั้น (DM)";
const G = 100;
const WALLS = [{"c":[200,300,300,300]},{"c":[300,300,600,300],"sight":0,"light":0},{"c":[600,300,700,300]},{"c":[700,300,800,300],"door":1},{"c":[800,300,900,300],"door":1},{"c":[900,300,1000,300]},{"c":[1000,300,1300,300],"sight":0,"light":0},{"c":[1300,300,1400,300]},{"c":[200,300,200,1900]},{"c":[1400,300,1400,500]},{"c":[1400,500,1400,700],"sight":0,"light":0},{"c":[1400,700,1400,1900]},{"c":[200,1900,1100,1900]},{"c":[1100,1900,1200,1900],"door":1},{"c":[1200,1900,1400,1900]},{"c":[200,1000,500,1000]},{"c":[500,1000,600,1000],"door":1},{"c":[600,1000,900,1000]},{"c":[900,1000,950,1000]},{"c":[950,1000,1100,1000],"door":1,"sound":0},{"c":[1100,1000,1200,1000]},{"c":[1200,1000,1350,1000],"door":1,"sound":0},{"c":[1350,1000,1400,1000]},{"c":[900,1000,900,1300]},{"c":[1150,1000,1150,1300]},{"c":[900,1300,1000,1300]},{"c":[1000,1300,1100,1300],"door":2},{"c":[1100,1300,1400,1300]},{"c":[900,1300,900,1400]},{"c":[900,1400,900,1500],"door":1},{"c":[900,1500,900,1900]},{"c":[200,1600,500,1600]},{"c":[500,1600,600,1600],"door":1},{"c":[600,1600,900,1600]},{"c":[1200,1300,1200,1750]},{"c":[1200,1750,1200,1850],"door":1},{"c":[1200,1850,1200,1900]},{"c":[1600,300,1600,1900]},{"c":[2100,300,3300,300]},{"c":[3300,300,3300,1900]},{"c":[2100,300,2100,1600]},{"c":[2100,1600,2100,1700],"door":2},{"c":[2100,1700,2100,1900]},{"c":[2100,1900,2800,1900]},{"c":[2800,1900,2900,1900],"door":2},{"c":[2900,1900,3300,1900]},{"c":[2100,1200,2200,1200]},{"c":[2200,1200,2300,1200],"door":1},{"c":[2300,1200,2700,1200]},{"c":[2700,1200,2800,1200],"door":1},{"c":[2800,1200,3100,1200]},{"c":[3100,1200,3150,1200]},{"c":[3150,1200,3250,1200],"door":1},{"c":[3250,1200,3300,1200]},{"c":[2700,1200,2700,1650]},{"c":[2700,1650,2700,1750],"door":1},{"c":[2700,1750,2700,1900]},{"c":[2700,1550,3100,1550]},{"c":[3100,1200,3100,1900]},{"c":[2000,1600,2100,1600]},{"c":[2000,1700,2100,1700]}];
const LIGHT = (x, y, dim, bright, color, alpha = 0.45, anim = "torch") =>
  ({ x: x * G, y: y * G, config: { dim, bright, color, alpha, animation: { type: anim, speed: 2, intensity: 2 } } });
const LIGHTS = [
  // street level
  LIGHT(1, 2.5, 25, 10, "#ffc070", 0.4, null), LIGHT(10.5, 2.5, 25, 10, "#ffc070", 0.4, null), LIGHT(16.8, 2.5, 25, 10, "#ffc070", 0.4, null),
  LIGHT(11.5, 19.3, 15, 5, "#ffc070", 0.4, null), LIGHT(10.6, 16.5, 10, 3, "#ffd9a0", 0.35, null), LIGHT(5, 17.5, 8, 2, "#ffd9a0", 0.3, null),
  // cellar
  LIGHT(25, 5, 25, 10, "#ffb060"), LIGHT(29.5, 4.5, 25, 10, "#ffb060"), LIGHT(25.5, 9.3, 25, 10, "#ffb060"), LIGHT(30, 9.8, 25, 10, "#ffb060"),
  LIGHT(31, 4.5, 20, 8, "#8899ff", 0.5, "pulse"), LIGHT(24.4, 10.6, 8, 3, "#7dff9a", 0.35, "fog"),
  LIGHT(24, 16.2, 15, 5, "#ffb060", 0.4, "torch"), LIGHT(29.5, 12.9, 10, 4, "#ffd28c", 0.4, null),
  LIGHT(30, 16.6, 12, 4, "#ff7a2a", 0.5, "fire")
];
const p = (t) => t.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.startsWith("-") ? "<li>" + l.slice(1).trim() + "</li>" : "<p>" + l + "</p>").join("").replace(/(<li>.*?<\/li>)+/g, (m) => "<ul>" + m + "</ul>");
const PAGES = [
  ["0 วิธีใช้ฉาก 2 ชั้น", 18.95, 1.5, `
ซ้ายคือชั้นถนน ขวาคือชั้นใต้ดินใต้ร้านเดียวกัน (ตำแหน่งชั้นใต้ดิน = ชั้นถนน + 19 ช่องไปทางขวา)
- เดินถึงปลายบันไดแล้วระบบถามว่าจะลงหรือขึ้นไหม แล้ววาร์ปข้ามฝั่งให้เอง (ช่องเทถ่านหินก็เหมือนกัน)
- ช่องเทถ่านหิน: ฝาเหล็กในตรอก (9.5,19.5) ↔ ห้องถ่านหิน (28.5,19)
- ประตูลับเป็น Secret Door ผู้เล่นจะเห็นเมื่อ DM เปิดหรือหาเจอ`],
  ["1 ประตูหลังร้าน (ด่านรหัสผ่าน)", 11.5, 19.6, `
ร้านตัดสูทปิดไฟไปนานแล้ว ผู้เล่นเดินอ้อมซอยข้างมาที่ตรอกหลังร้าน เคาะประตูหลัง ช่องเลื่อนเปิด "มาวัดตัวสูทสีไหน"
- รหัสคืนนี้: "สีดำ ไม่ต้องรีด"
- ไม่รู้รหัส: ให้เล่าว่ามาได้ยังไง หรือใครพามา
- คนเฝ้าประตูนั่งเก้าอี้ในโถงหลัง เปิดประตูหัวบันไดให้ลงไป`],
  ["2 ร้านตัดสูทและประตูลับ", 8, 6, `
ห้องโชว์ปิดไฟ ลูกค้าประจำที่มาตอนกลางวันใช้ทางห้องลองชุด: ผนังหลังห้องลองชุดบานซ้ายเป็นประตูลับไปโถงหลัง
ห้องตัดเย็บและห้องทำงานช่างไม่มีอะไรสำคัญ (แต่ซ่อนตัวได้ถ้าหนีขึ้นมา)`],
  ["3 ประตูหัวบันได", 12.5, 18, `
C.A.A.M. พังประตูนี้แล้วเดินลงบันไดในรอบที่ 4 หลังอาเธอร์ล้ม (เร็วขึ้น 1 รอบถ้ามีเสียงปืน)
ลงมาถึงประตูบาร์ใต้ดินที่ (32,12)
- ปิดประตูบาร์แล้วขวางด้วยโต๊ะ: Athletics DC 13 ซื้อเวลาได้ 1 รอบ`],
  ["4 ที่นั่งและสิ่งที่เห็นตอนอาเธอร์ล้ม", 26.6, 8.4, `
- เคาน์เตอร์ (แจ็ค, ชายสูทลายทาง): ชายสูทลายทางลุกขึ้นก่อนทุกคน เหมือนรู้อยู่แล้ว
- โต๊ะใกล้เวที (โลล่า): แสงเวทกระพริบดับหมด 1 วินาทีก่อนอาเธอร์ล้ม
- โต๊ะกลาง (ฮาร์วีย์): "เหมือนที่รอยแยก... เหมือนกันเป๊ะ"
- โต๊ะไพ่มุมมืด (วินนี่): ไพ่ทุกใบบนโต๊ะพลิกเป็นสีดำเอง
- โต๊ะข้างอาเธอร์: เห็นเขากำกระเป๋าเสื้อด้านในไว้แน่น (ที่ซ่อนตั๋ว)
- โต๊ะใกล้ประตู: คนแปลกหน้าสูทเทา ออกไปก่อนอาเธอร์ล้ม 1 นาที`],
  ["5 อาเธอร์ (ผนังตะวันออก)", 32.2, 8.4, `
นั่งคนเดียว หันหลังชนกำแพง มองประตูบาร์ตลอด พึมพำ "สี่..."
- ค้นศพ Investigation DC 10: ปืน .38, เหรียญเปียก, ตั๋วโกดัง 4 (15+ เจอหลอดยาวิปลาสเปล่า)
- ตรวจศพ Medicine/Arcana DC 13 · ช่วยชีวิต Medicine DC 12 (ตรวจความหวาดผวา DC 13)`],
  ["6 เคาน์เตอร์และชั้นขวดเหล้า", 22.4, 7.5, `
- แจ็คยืนหลังเคาน์เตอร์ มีลูกซอง "ใบแจ้งหนี้" ใต้เคาน์เตอร์ · กล่องตรวจจับเวทวางบนเคาน์เตอร์ (ไม่ดังตอนเลือดดำคลาน)
- ยิงขวดบนชั้น: ไฟลุกแนวหลังเคาน์เตอร์ ขวางทางไปห้องเก็บเหล้า
- หลบหลังเคาน์เตอร์ได้ Three-Quarters Cover`],
  ["7 โคมไฟเพดาน (AC 12) และเวที", 29.5, 4.5, `
ยิงโคมไฟ AC 12 ดวงไหนแตก ปิด Light ดวงนั้น แตกครบ 4 ดวงห้องมืดเกือบทั้งหมด
โลล่าดับไฟบนเวที (ปิด Light สีฟ้า) ถ้าผู้เล่นดีกับเธอ · ถีบโต๊ะล้มเป็น Half Cover`],
  ["8 ทางหนี: ห้องเก็บเหล้าและอุโมงค์", 23.5, 16, `
ประตูหลังเคาน์เตอร์พาเข้าห้องเก็บเหล้า แจ็คชี้ทางให้ถ้าคุยดีด้วย หรือ Investigation DC 13 หาเอง
- ประตูลับผนังตะวันตก (หลังกองลัง): อุโมงค์ลักลอบขนเหล้าเก่า เดินใต้ดิน 2 ช่วงตึกไปออกท่อระบายน้ำริมท่าเรือ ไม่มีใครตามมาทัน แต่ไปโผล่ใกล้ย่านของซินดิเคท
- ทั้งกลุ่มทอย Stealth DC 12 ถ้าเกินครึ่งผ่าน หนีพ้นทั้งกลุ่ม`],
  ["9 ทางหนี: ช่องเทถ่านหิน", 28.5, 18.4, `
ปีนกองถ่านขึ้นช่องเทถ่านไปโผล่ฝาเหล็กในตรอกหลังร้าน (9.5,19.5)
- ทีละคน Athletics DC 10 · ขนาด Small ผ่านสบาย ขนาด Medium ใช้การเคลื่อนที่ 2 เท่า
- ออกมาแล้วเจ้าหน้าที่ที่เฝ้าประตูหลังอาจเห็น (Stealth DC 12)`],
  ["10 ห้องทำงานแจ็ค", 29, 13.3, `
โต๊ะ ตู้เซฟ เตียงพับ แจ็คเก็บบัญชีลูกค้าและเงินสดไว้ในเซฟ (Thieves' Tools DC 15)
ถ้าผู้เล่นได้ความไว้ใจจากแจ็ค เขาให้ซ่อนในห้องนี้ตอน C.A.A.M. บุก (Stealth ได้เปรียบ)`]
];

export async function createBarScene() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const old = game.scenes.getName(SCENE);
  if (old) { ui.notifications.info("มีฉากนี้อยู่แล้ว เปิดให้"); return old.view(); }
  const jf = game.folders.find((f) => f.name === "Arkane 1920s" && f.type === "JournalEntry");
  let key = game.journal.getName(KEY);
  if (!key) key = await JournalEntry.create({
    name: KEY, folder: jf?.id, ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE },
    pages: [{ name: "แผนที่ฉบับ DM", type: "image", src: `modules/${MOD}/maps/rusty-wand-bar-v2-dm.webp`, sort: 50 },
      ...PAGES.map(([name, , , txt], i) => ({ name, type: "text", sort: (i + 1) * 100, text: { content: p(txt), format: 1 } }))]
  });
  const notes = PAGES.map(([name, x, y]) => ({ entryId: key.id, pageId: key.pages.getName(name)?.id, x: x * G, y: y * G,
    text: name, iconSize: 40, fontSize: 24, texture: { src: "icons/svg/book.svg" } }));
  const sf = game.folders.find((f) => f.name === "Arkane 1920s" && f.type === "Scene") ?? await Folder.create({ name: "Arkane 1920s", type: "Scene", color: "#9A6B2C" });
  const scene = await Scene.create({
    name: SCENE, folder: sf?.id, navigation: true,
    background: { src: `modules/${MOD}/maps/rusty-wand-bar-v2.webp` },
    width: 3400, height: 2200, padding: 0, backgroundColor: "#0b0b0d",
    grid: { type: 1, size: G, distance: 5, units: "ft", alpha: 0.15 },
    tokenVision: true, fog: { exploration: true }, environment: { darknessLevel: 0.75 },
    initial: { x: 2700, y: 1000, scale: 0.6 }, walls: WALLS, lights: LIGHTS, notes
  });
  await setBackground(scene, "rusty-wand-bar-v2.webp");
  try { await linkBarStairs(); } catch (e) { console.warn(MOD, e); }
  ui.notifications.info("สร้างฉาก Chapter 1: บาร์ The Rusty Wand (2 ชั้น) แล้ว ดูในแท็บ Scenes");
  return scene;
}

// Arkane city overview (theatre-of-mind map, no grid). Player version as scene, DM version in a journal.
const CITY = "แผนที่เมืองอาร์คเคน";
const CITY_KEY = "แผนที่เมืองอาร์คเคน (DM)";
export async function createCityScene() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const old = game.scenes.getName(CITY);
  if (old) { ui.notifications.info("มีฉากนี้อยู่แล้ว เปิดให้"); return old.view(); }
  const jf = game.folders.find((f) => f.name === "Arkane 1920s" && f.type === "JournalEntry");
  if (!game.journal.getName(CITY_KEY)) await JournalEntry.create({
    name: CITY_KEY, folder: jf?.id, ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.NONE },
    pages: [
      { name: "เส้นทางแคมเปญ 4 บท", type: "image", src: `modules/${MOD}/maps/arkane-city-dm.webp`, sort: 100 },
      { name: "ฉบับผู้เล่น", type: "image", src: `modules/${MOD}/maps/arkane-city.webp`, sort: 200 }
    ]
  });
  const sf = game.folders.find((f) => f.name === "Arkane 1920s" && f.type === "Scene") ?? await Folder.create({ name: "Arkane 1920s", type: "Scene", color: "#9A6B2C" });
  const scene = await Scene.create({
    name: CITY, folder: sf?.id, navigation: true,
    background: { src: `modules/${MOD}/maps/arkane-city.webp` },
    width: 4000, height: 2800, padding: 0, backgroundColor: "#0b0b0d",
    grid: { type: 0, size: 100 }, tokenVision: false, fog: { exploration: false },
    environment: { darknessLevel: 0 }, initial: { x: 2000, y: 1400, scale: 0.35 }
  });
  await setBackground(scene, "arkane-city.webp");
  ui.notifications.info("สร้างฉากแผนที่เมืองอาร์คเคนแล้ว ดูในแท็บ Scenes");
  return scene;
}

// World map Earth-Prime (player handout scene)
const WORLD = "แผนที่โลก Earth-Prime";
export async function createWorldScene() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const old = game.scenes.getName(WORLD);
  if (old) { ui.notifications.info("มีฉากนี้อยู่แล้ว เปิดให้"); return old.view(); }
  const sf = game.folders.find((f) => f.name === "Arkane 1920s" && f.type === "Scene") ?? await Folder.create({ name: "Arkane 1920s", type: "Scene", color: "#9A6B2C" });
  const scene = await Scene.create({
    name: WORLD, folder: sf?.id, navigation: true,
    background: { src: `modules/${MOD}/maps/earth-prime.webp` },
    width: 1200, height: 896, padding: 0, backgroundColor: "#1a140c",
    grid: { type: 0, size: 100 }, tokenVision: false, fog: { exploration: false },
    environment: { darknessLevel: 0 }, initial: { x: 600, y: 448, scale: 1 }
  });
  await setBackground(scene, "earth-prime.webp");
  ui.notifications.info("สร้างฉากแผนที่โลก Earth-Prime แล้ว ดูในแท็บ Scenes");
  return scene;
}

// ---------- stairs / coal chute teleports inside the 2-floor bar scene (street panel ↔ cellar panel)
const BAR_LINKS = [
  // [exit rect (cells), arrive rect, label]
  [[12, 13, 2, 1], [31, 13, 2, 1], "ลงบันได → ชั้นใต้ดิน (บาร์)"],
  [[31, 18, 2, 1], [12, 17, 2, 1], "ขึ้นบันได → ร้านตัดสูท"],
  [[28, 18, 1, 1], [10, 20, 1, 1], "ปีนช่องเทถ่านหิน → ตรอกหลังร้าน"],
  [[9, 19, 1, 1], [29, 18, 1, 1], "ลงช่องเทถ่านหิน → ห้องถ่านหิน"]
];
export async function linkBarStairs(quiet = true) {
  if (!game.user.isGM) return;
  const sc = game.scenes.getName(SCENE);
  if (!sc) { if (!quiet) ui.notifications.warn("ยังไม่มีฉากบาร์ 2 ชั้น"); return 0; }
  const rect = ([x, y, w, h]) => ({ type: "rectangle", x: x * G, y: y * G, width: w * G, height: h * G, rotation: 0, hole: false });
  let made = 0;
  for (const [exitR, arriveR, label] of BAR_LINKS) {
    const exitName = "↪ " + label, arriveName = "⤓ ปลายทาง: " + label;
    if (sc.regions.getName(exitName)) continue;
    try {
      let arrive = sc.regions.getName(arriveName);
      if (!arrive) [arrive] = await sc.createEmbeddedDocuments("Region", [{ name: arriveName, color: "#3a7bd5", shapes: [rect(arriveR)] }]);
      await sc.createEmbeddedDocuments("Region", [{ name: exitName, color: "#d58a3a", shapes: [rect(exitR)],
        behaviors: [{ name: label, type: "teleportToken", system: { destination: arrive.uuid, choice: true } }] }]);
      made++;
    } catch (e) { console.error(MOD, "bar stairs", label, e); }
  }
  if (!quiet || made) ui.notifications.info(`ฉากบาร์ 2 ชั้น: เพิ่มทางวาร์ป ${made} ทาง (บันได + ช่องเทถ่านหิน)`);
  return made;
}
