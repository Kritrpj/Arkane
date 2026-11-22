// Upstairs of the veterans' inn (โรงเตี๊ยมนายทหารผ่านศึก): 5 separate rooms, one per player,
// and the "เช้าวันที่ 2" macro — wake everyone in their own room, full rest, Dread −1, morning light, tail outside.
const MOD = "arkane-1920s";
const G = 100;
export const INN_SCENE = "Chapter 1: โรงเตี๊ยม ชั้นพัก (ห้องแยก)";
import { setBackground } from "./ch1maps.js?v=21";
const D = () => foundry.applications?.api?.DialogV2;

// room order ↔ PC keys; token wakes beside the bed
export const ROOMS = [["vivian", 1], ["mozxorion", 2], ["windows", 3], ["nincolas", 4], ["heinz", 5]];
const spotOf = (room) => ({ x: ((room - 1) * 4 + 1.5) * G, y: 1.5 * G });

const W = 2000;
export const WALLS = [
  { c: [0, 0, W, 0] }, { c: [W, 0, W, 700] }, { c: [0, 700, W, 700] }, { c: [0, 0, 0, 700] },
  ...[1, 2, 3, 4].map((i) => ({ c: [i * 400, 0, i * 400, 400] })),
  // corridor wall with a door per room
  ...[0, 1, 2, 3, 4].flatMap((i) => [{ c: [i * 400, 400, i * 400 + 100, 400] }, { c: [i * 400 + 300, 400, i * 400 + 400, 400] }, { c: [i * 400 + 100, 400, i * 400 + 300, 400], door: 1 }])
];
export const LIGHTS = [200, 800, 1400, 1800].map((x) => ({ x, y: 420, config: { bright: 10, dim: 20, color: "#ffb347", alpha: 0.4, animation: { type: "torch", speed: 2, intensity: 2 } } }));
// morning: sun through each room's window
export const SUN = [0, 1, 2, 3, 4].map((i) => ({ x: i * 400 + 200, y: 60, config: { bright: 15, dim: 25, angle: 160, rotation: 180, color: "#e8f0ff", alpha: 0.25 } }));

async function folderFor(type) {
  return game.folders.find((f) => f.name === "Arkane 1920s" && f.type === type) ?? Folder.create({ name: "Arkane 1920s", type, color: "#9A6B2C" });
}

const rectR = ([x, y, w, h]) => ({ type: "rectangle", x: x * G, y: y * G, width: w * G, height: h * G, rotation: 0, hole: false });
export const LOBBY_SCENE = "Chapter 1: โรงเตี๊ยม ชั้นล่าง (ล็อบบี้)";
async function mkRegion(sc, name, r, color, dest) {
  const ex = sc.regions.getName(name);
  if (ex) {
    // make existing exits ask before teleporting, and keep arrival squares inside the map
    for (const b of ex.behaviors) if (b.type === "teleportToken" && b.system.choice !== true) await b.update({ "system.choice": true });
    if (r && ex.shapes?.[0] && (ex.shapes[0].x !== r[0] * G || ex.shapes[0].y !== r[1] * G || ex.shapes[0].width !== r[2] * G)) await ex.update({ shapes: [rectR(r)] });
    return ex;
  }
  const [reg] = await sc.createEmbeddedDocuments("Region", [{ name, color, shapes: [rectR(r)],
    behaviors: dest ? [{ name, type: "teleportToken", system: { destination: dest.uuid, choice: true } }] : [] }]);
  return reg;
}
export async function createInnLobby() {
  let sc = game.scenes.getName(LOBBY_SCENE);
  if (!sc) {
    sc = await Scene.create({ name: LOBBY_SCENE, folder: (await folderFor("Scene"))?.id, navigation: false,
      background: { src: `modules/${MOD}/maps/inn-lobby.webp` }, width: 16 * G, height: 8 * G, padding: 0, backgroundColor: "#0b0b0d",
      grid: { type: 1, size: G, distance: 5, units: "ft", alpha: 0.15 }, tokenVision: false, fog: { exploration: false },
      environment: { darknessLevel: 0.15, globalLight: { enabled: true } },
      walls: [{ c: [0, 0, 1600, 0] }, { c: [1600, 0, 1600, 800] }, { c: [0, 800, 1600, 800] }, { c: [0, 0, 0, 800] }, { c: [110, 90, 540, 90] }, { c: [540, 90, 540, 180] }, { c: [110, 180, 540, 180] }, { c: [110, 90, 110, 180] }] });
  }
  await setBackground(sc, "inn-lobby.webp");
  return sc;
}
// The inn's ground floor is painted straight into the district map (building at x 3000-3800, y 300-1100).
// Stairs on the map ⇄ upstairs rooms scene; the front door is the map's own door; warehouse 4 gate → Chapter 2.
export async function linkInn() {
  const up = game.scenes.getName(INN_SCENE);
  const street = game.scenes.getName("Chapter 1: ย่านท่าเรือ (แมพใหญ่)");
  if (!up) return;
  if (!street) return ui.notifications.warn("ไม่พบฉาก 'Chapter 1: ย่านท่าเรือ (แมพใหญ่)' · กดมาโคร 'สร้างฉาก: Chapter 1 แมพใหญ่' ก่อน แล้วกดเชื่อมอีกครั้ง");
  // new background (inn interior painted in) + inner wall between the inn and Arthur's room
  await setBackground(street, street.environment.globalLight?.enabled ? "ch1-district-day.webp" : "ch1-district.webp");
  const hasW = (c) => street.walls.some((w) => w.c.join() === c.join());
  const nw = [];
  if (!hasW([3800, 300, 3800, 700])) nw.push({ c: [3800, 300, 3800, 700] });
  if (!hasW([3800, 900, 3800, 1100])) nw.push({ c: [3800, 900, 3800, 1100] });
  if (!hasW([3800, 700, 3800, 900])) nw.push({ c: [3800, 700, 3800, 900], door: 1 });
  if (nw.length) await street.createEmbeddedDocuments("Wall", nw);
  // stairs: on the map ⇄ upstairs
  for (const n of ["↪ เข้าโรงเตี๊ยมทหารผ่านศึก", "⤓ หน้าโรงเตี๊ยม"]) await street.regions.getName(n)?.delete();
  const upArr = await mkRegion(up, "⤓ มาจากชั้นล่าง", [16, 5, 1, 1], "#3a7bd5");
  const stArr = await mkRegion(street, "⤓ มาจากชั้นบน (โรงเตี๊ยม)", [36, 7, 2, 1], "#3a7bd5");
  await mkRegion(street, "↪ ขึ้นบันไดไปชั้นพัก", [36, 4, 2, 3], "#d58a3a", upArr);
  await mkRegion(up, "↪ ลงบันไดไปชั้นล่างโรงเตี๊ยม", [17, 5, 3, 2], "#d58a3a", stArr);
  await up.regions.getName("↪ ลงบันไดไปล็อบบี้")?.delete();
  // warehouse 3+4 are now one big Warehouse 4 painted onto the district map (no teleport)
  for (const n of ["↪ ประตูโกดังหมายเลข 4 (Chapter 2)", "⤓ หน้าโกดัง 4"]) await street.regions.getName(n)?.delete();
  try { await buildWarehouse4(street); await placeWh4Npcs(); await (await import("./blocks.js?v=21")).placeStageBlocks(); } catch (e) { console.warn(MOD, "wh4", e); ui.notifications.warn("โกดัง 4: สร้างกำแพง/NPC ไม่สำเร็จ ดู Console (F12)"); }
  ui.notifications.info("เชื่อมแล้ว: ชั้นพัก ⇄ โรงเตี๊ยมบนแมพย่านท่าเรือ (บันไดในตัวตึก) · โกดัง 4 รวมเป็นหลังใหญ่บนแมพ");
}


// ---------- day / night version of the big district map
export const DISTRICT = "Chapter 1: ย่านท่าเรือ (แมพใหญ่)";
export async function setDistrictTime(day = true) {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const s = game.scenes.getName(DISTRICT);
  if (!s) return ui.notifications.warn("ไม่พบฉากย่านท่าเรือ (แมพใหญ่)");
  if (day && s.getFlag(MOD, "nightDark") === undefined) await s.setFlag(MOD, "nightDark", s.environment.darknessLevel);
  await setBackground(s, day ? "ch1-district-day.webp" : "ch1-district.webp");
  await s.update({ "environment.darknessLevel": day ? 0.05 : (s.getFlag(MOD, "nightDark") ?? 0.75), "environment.globalLight.enabled": !!day });
  const lights = s.lights.map((l) => ({ _id: l.id, hidden: !!day }));
  if (lights.length) await s.updateEmbeddedDocuments("AmbientLight", lights);
  try { await game.arkane?.playTrack?.(day ? "harbor-morning" : "alley-rain"); } catch {}
  ui.notifications.info(`ย่านท่าเรือ: ${day ? "เช้า (สว่าง)" : "กลางคืน"}`);
}
export const toggleDistrictTime = () => {
  const s = game.scenes.getName(DISTRICT);
  return setDistrictTime(!(s && s.environment.globalLight?.enabled));
};

// ---------- warehouse 4: old warehouses 3 + 4 merged into one big hall on the district map (x 3900-5600, y 1400-2700)
const O = [3900, 1400]; // grid-aligned origin of the merged warehouse (squares x39-56, y14-27)
const cwall = (x1, y1, x2, y2, door) => ({ c: [x1, y1, x2, y2], ...(door ? { door: 1 } : {}), flags: { [MOD]: { wh4: 2 } } });
const box = (x, y, w, h) => [cwall(x, y, x + w, y), cwall(x + w, y, x + w, y + h), cwall(x + w, y + h, x, y + h), cwall(x, y + h, x, y)];
// walls of the previous (off-grid) version, removed when the scene is rebuilt
function legacyWh4Walls() {
  const o = [3910, 1410], c = (...a) => a.join();
  const w = [c(4390, 1430, 4390, 1830), c(3930, 1830, 4110, 1830), c(4210, 1830, 4390, 1830), c(4110, 1830, 4210, 1830), c(4860, 1430, 4860, 1790), c(4860, 1890, 4860, 2190), c(4860, 1790, 4860, 1890),
    c(4860, 2190, 5160, 2190), c(5260, 2190, 5570, 2190), c(5160, 2190, 5260, 2190), c(4600, 1400, 4600, 2700), c(4800, 1400, 4800, 2700)];
  for (const [x, y, wd, ht] of [[60, 520, 220, 80], [330, 520, 220, 80], [60, 700, 220, 80], [330, 700, 220, 80], [60, 880, 220, 80], [330, 880, 220, 80], [700, 520, 220, 80], [700, 700, 220, 80], [700, 860, 220, 80], [540, 560, 80, 220]]) {
    const X = o[0] + x, Y = o[1] + y;
    w.push(c(X, Y, X + wd, Y), c(X + wd, Y, X + wd, Y + ht), c(X + wd, Y + ht, X, Y + ht), c(X, Y + ht, X, Y));
  }
  return new Set(w);
}
// container grid: [col, row, w, h] in squares (cross = hospital shipment, coin = syndicate stock)
const WH4_CONT = [[40, 19, 2, 1], [43, 19, 2, 1], [40, 21, 2, 1], [43, 21, 2, 1], [40, 23, 2, 1], [43, 23, 2, 1], [45, 21, 1, 2], [47, 19, 2, 1], [47, 21, 2, 1], [47, 23, 2, 1]];
function wh4Walls() {
  const w = [cwall(4600, 1400, 4800, 1400), cwall(4600, 2700, 4800, 2700),
    // OFFICE (x39-44, y14-18): east wall + south wall with a door at x41-42
    cwall(4400, 1400, 4400, 1800), cwall(3900, 1800, 4100, 1800), cwall(4200, 1800, 4400, 1800), cwall(4100, 1800, 4200, 1800, true),
    // TANK ROOM (x49-56, y14-22): west wall with a door at y17-18, south wall with a door at x52-53
    cwall(4900, 1400, 4900, 1700), cwall(4900, 1800, 4900, 2200), cwall(4900, 1700, 4900, 1800, true),
    cwall(4900, 2200, 5200, 2200), cwall(5300, 2200, 5600, 2200), cwall(5200, 2200, 5300, 2200, true)];
  for (const [cx, cy, cw, ch] of WH4_CONT) w.push(...box(cx * G, cy * G, cw * G, ch * G));
  return w;
}
export async function buildWarehouse4(street) {
  const legacy = legacyWh4Walls();
  const old = street.walls.filter((w) => legacy.has(w.c.join()) || w.getFlag(MOD, "wh4") === 1 || w.getFlag(MOD, "wh4") === 2);
  const keep = new Set(wh4Walls().map((w) => w.c.join()));
  const del = old.filter((w) => !(w.getFlag(MOD, "wh4") === 2 && keep.has(w.c.join()))).map((w) => w.id);
  if (del.length) await street.deleteEmbeddedDocuments("Wall", del);
  const has = new Set(street.walls.filter((w) => !del.includes(w.id)).map((w) => w.c.join()));
  const add = wh4Walls().filter((w) => !has.has(w.c.join()));
  if (add.length) await street.createEmbeddedDocuments("Wall", add);
  if (street.getFlag(MOD, "whLights") !== 3) {
    const inside = street.lights.filter((l) => l.x > 3900 && l.x < 5600 && l.y > 1400 && l.y < 2700).map((l) => l.id);
    if (inside.length) await street.deleteEmbeddedDocuments("AmbientLight", inside);
    const L = [[250, 200], [550, 650], [350, 1000], [850, 650], [700, 1000], [1350, 350], [1250, 700], [1400, 1000], [1000, 1100]].map(([x, y]) => ({ x: O[0] + x, y: O[1] + y, config: { bright: 12, dim: 26, color: "#ffc070", alpha: 0.4, animation: { type: "torch", speed: 2, intensity: 2 } } }));
    await street.createEmbeddedDocuments("AmbientLight", L);
    await street.setFlag(MOD, "whLights", 3); await street.unsetFlag(MOD, "whLights2");
  }
}
// NPCs (grid squares on the district map): maze hybrids stand in the lanes, two more hide in the tank, Rosso sits on his chair
const WH4_NPCS = [["gunman", 41.5, 26.5], ["gunman", 52.5, 26.5], ["hybrid", 42.5, 20.5], ["hybrid", 46.5, 22.5], ["hybrid", 51.5, 16.5, true], ["hybrid", 54.5, 18.5, true], ["rosso", 51.5, 21.5], ["captain", 49.5, 30.5]];
// loot on the district map: [name, [col,row] of the square, [[item id, qty]], gp, icon]
const WH4_LOOT = [
  ["ตู้เซฟห้องทำงาน (ล็อก DC 15)", [43, 14], [["c2-order"], ["c2-ledger"]], 40, "modules/arkane-1920s/items/pile-safe.webp"],
  ["ตู้คอนเทนเนอร์เปิด (ชิ้นส่วนเครื่องจักร)", [48, 21], [["c2-part"]], 0, "modules/arkane-1920s/items/pile-container.webp"],
  ["หีบของวิเศษของรอสโซ (รางวัลบท)", [55, 21], [["c2-gillring"], ["magic-saltcharm"], ["magic-goggles"], ["magic-brooch"], ["magic-watch"], ["gun-magicrevolver"], ["ammo-กระสุน .45", 20]], 60, "modules/arkane-1920s/items/pile-rosso.webp"]];
async function addWh4Lights(sc) {
  if (sc.getFlag(MOD, "whLights2")) return;
  await sc.createEmbeddedDocuments("AmbientLight", [
    { x: O[0] + 900, y: O[1] + 750, config: { bright: 6, dim: 14, color: "#3ee0c0", alpha: 0.35, animation: { type: "pulse", speed: 2, intensity: 3 } } },
    { x: O[0] + 1650, y: O[1] + 750, config: { bright: 4, dim: 9, color: "#7ff0e0", alpha: 0.28 } },
    { x: O[0] + 1350, y: O[1] + 350, config: { bright: 10, dim: 22, color: "#3a8fc0", alpha: 0.3 } }]);
  await sc.setFlag(MOD, "whLights2", true);
}
export async function placeWh4Loot() {
  const sc = game.scenes.getName(DISTRICT);
  if (!sc) return 0;
  const { placeLootPiles } = await import("./chapters.js?v=21");
  try { await addWh4Lights(sc); } catch (e) { console.warn(MOD, "wh4 lights", e); }
  return placeLootPiles(sc, WH4_LOOT);
}
export async function placeWh4Npcs() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const sc = game.scenes.getName(DISTRICT);
  if (!sc) return ui.notifications.warn("ไม่พบฉากย่านท่าเรือ (แมพใหญ่)");
  const { createChapterNpcs } = await import("./chapters.js?v=21");
  const actors = await createChapterNpcs(2);
  const add = [], mv = [];
  for (const [i, [key, x, y, hidden]] of WH4_NPCS.entries()) {
    const a = actors[key]; if (!a) continue;
    const spot = `wh4-${key}@${sc.id}${i}`;
    const have = sc.tokens.find((t) => t.getFlag(MOD, "spot") === spot);
    const td = have ? have.toObject() : (await a.getTokenDocument()).toObject();
    const px = Math.round((x - (td.width ?? 1) / 2) * G), py = Math.round((y - (td.height ?? 1) / 2) * G);
    if (have) { if (have.x !== px || have.y !== py) mv.push({ _id: have.id, x: px, y: py }); continue; }
    add.push({ ...td, x: px, y: py, hidden: !!hidden, flags: { ...(td.flags ?? {}), [MOD]: { ...(td.flags?.[MOD] ?? {}), spot } } });
  }
  if (add.length) await sc.createEmbeddedDocuments("Token", add);
  if (mv.length) await sc.updateEmbeddedDocuments("Token", mv, { animate: false });
  let loot = 0; try { loot = await placeWh4Loot(); } catch (e) { console.warn(MOD, "wh4 loot", e); }
  ui.notifications.info(`โกดัง 4: วาง NPC ${add.length} ตัว · ย้ายที่ ${mv.length} ตัว · วางกล่องของ ${loot} กล่อง`);
}

export async function createInnScene() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  let sc = game.scenes.getName(INN_SCENE);
  if (sc) {
    // old/stale scene (e.g. the 4-room version or a missing background): bring it up to the current layout
    const bg = `modules/${MOD}/maps/inn-upper.webp`;
    await setBackground(sc, "inn-upper.webp");
    if (sc.background.src !== bg || sc.width !== 20 * G || sc.padding !== 0 || sc.height !== 7 * G || sc.walls.size !== WALLS.length) {
      await sc.update({ background: { src: bg }, width: 20 * G, height: 7 * G, padding: 0, backgroundColor: "#0b0b0d", tokenVision: false, "environment.darknessLevel": 0.35, "environment.globalLight.enabled": true });
      if (sc.walls.size) await sc.deleteEmbeddedDocuments("Wall", sc.walls.map((w) => w.id));
      await sc.createEmbeddedDocuments("Wall", WALLS);
      if (!sc.lights.size) await sc.createEmbeddedDocuments("AmbientLight", LIGHTS);
    }
    try { await linkInn(); } catch (e) { console.warn(MOD, "link inn", e); }
    return sc;
  }
  sc = await Scene.create({ name: INN_SCENE, folder: (await folderFor("Scene"))?.id, navigation: false,
    background: { src: `modules/${MOD}/maps/inn-upper.webp` }, width: 20 * G, height: 7 * G, padding: 0, backgroundColor: "#0b0b0d",
    grid: { type: 1, size: G, distance: 5, units: "ft", alpha: 0.15 }, tokenVision: false, fog: { exploration: false },
    environment: { darknessLevel: 0.35, globalLight: { enabled: true } }, walls: WALLS, lights: LIGHTS });
  await setBackground(sc, "inn-upper.webp");
  // PC tokens in their rooms
  const toks = [];
  for (const [key, room] of ROOMS) {
    const a = game.actors.find((x) => x.getFlag(MOD, "pc") === key && !x.getFlag(MOD, "later"));
    if (!a) continue;
    toks.push({ ...(await a.getTokenDocument()).toObject(), ...spotOf(room) });
  }
  if (toks.length) await sc.createEmbeddedDocuments("Token", toks);
  try { await linkInn(); } catch (e) { console.warn(MOD, "link inn", e); }
  return sc;
}

// ---------- เช้าวันที่ 2
export async function morningDay2() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const r = await D().wait({ window: { title: "เช้าวันที่ 2 · โรงเตี๊ยมนายทหารผ่านศึก" },
    content: `<div class="rw-form"><p class="rw-hint">ทุกตัวละคร: ตื่นในห้องแยกของตัวเอง · Long Rest (HP และช่องเวทเต็ม) · Dread −1 · เปิดฉากชั้นพักตอนเช้า · ส่งข้อความตื่นนอน + ทอยสังเกตคนสะกดรอยให้แต่ละคน</p></div>`,
    buttons: [{ action: "ok", label: "ขึ้นเช้าวันที่ 2", default: true }, { action: "cancel", label: "ยกเลิก" }] });
  if (r !== "ok") return;
  const sc = await createInnScene();
  // everyone to their room (add missing tokens, move existing)
  const ups = [], add = [];
  for (const [key, room] of ROOMS) {
    const a = game.actors.find((x) => x.getFlag(MOD, "pc") === key && !x.getFlag(MOD, "later"));
    if (!a) continue;
    const tk = sc.tokens.find((t) => t.actorId === a.id);
    if (tk) ups.push({ _id: tk.id, ...spotOf(room) });
    else add.push({ ...(await a.getTokenDocument()).toObject(), ...spotOf(room) });
  }
  if (ups.length) await sc.updateEmbeddedDocuments("Token", ups, { animate: false, teleport: true });
  if (add.length) await sc.createEmbeddedDocuments("Token", add);
  // rest + dread
  const lines = [];
  for (const a of game.actors.filter((x) => x.type === "character" && x.getFlag(MOD, "pc") && !x.getFlag(MOD, "later"))) {
    try {
      try { await a.longRest({ dialog: false, chat: false, newDay: true }); } catch (e) { console.warn(MOD, "rest", e); }
      await a.update({ "system.attributes.hp.value": a.system.attributes.hp.max, "system.attributes.hp.temp": 0 }, { arkaneInternal: true });
      const d = Number(a.getFlag(MOD, "dread") ?? 0);
      if (d > 0) await a.setFlag(MOD, "dread", d - 1);
      lines.push(`${a.name}: พักเต็มแล้ว${d > 0 ? ` · Dread ${d} → ${d - 1}` : ""}`);
    } catch (e) { console.warn(MOD, "morning", a.name, e); }
  }
  // morning light: dim candles out, sun in
  const old = sc.lights.map((l) => l.id);
  if (old.length) await sc.deleteEmbeddedDocuments("AmbientLight", old);
  await sc.createEmbeddedDocuments("AmbientLight", SUN);
  await sc.update({ "environment.darknessLevel": 0.05, "environment.globalLight.enabled": true, tokenVision: false });
  // daylight on the scenes they walk into this morning (remember the night value so the DM can restore it)
  try { await setDistrictTime(true); } catch (e) { console.warn(MOD, "district day", e); }
  { const lb = game.scenes.getName(LOBBY_SCENE); if (lb) await lb.update({ "environment.darknessLevel": 0.05, "environment.globalLight.enabled": true }).catch(() => {}); }
  await sc.activate();
  // read-aloud + private wake-up with a watcher check
  await ChatMessage.create({ speaker: { alias: "เช้าวันที่ 2" }, content: `<div class="rw-card"><div class="rw-title">โรงเตี๊ยมนายทหารผ่านศึก · เช้าวันที่ 2</div>
    แสงแดดลอดผ้าม่านบางๆ เสียงรถรางดังมาจากถนน กลิ่นกาแฟและขนมปังปิ้งลอยขึ้นมาจากชั้นล่าง คืนที่ผ่านมาเหมือนฝันร้าย... แต่ตั๋วรับของใบนั้นยังอยู่จริง</div>` });
  for (const a of game.actors.filter((x) => x.type === "character" && x.getFlag(MOD, "pc") && !x.getFlag(MOD, "later"))) {
    const owners = game.users.filter((u) => !u.isGM && a.testUserPermission(u, "OWNER")).map((u) => u.id);
    await ChatMessage.create({ whisper: [...owners, game.user.id], speaker: { alias: a.name }, content: `<div class="rw-card"><div class="rw-title">${a.name} ตื่นนอน</div>
      <p>คุณตื่นในห้องพักของตัวเอง ร่างกายหายล้า (HP และพลังเวทคืนเต็ม) · ลองมองออกนอกหน้าต่างดูไหม?</p>
      <p>[[/skill prc dc=13]]{ทอยสังเกต (Perception)} · <i>ผ่าน: บอก DM · ไม่ผ่าน: เช้านี้ดูเป็นเช้าธรรมดาๆ</i></p></div>` });
  }
  await ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card"><div class="rw-title">DM · เช้าวันที่ 2</div>${lines.join("<br>")}<br><br>
    <b>ใครทอยสังเกตผ่าน (DC 13):</b> เห็นชายสูทเทาคนเดิมยืนอ่านหนังสือพิมพ์ฉบับเดิมอยู่ฝั่งตรงข้ามถนน ไม่พลิกหน้าเลยสักครั้ง (สายสะกดรอย C.A.A.M.)<br>
    <b>ออกจากที่พัก:</b> ลงบันได (มุมขวาของโถง) → ชั้นล่างของโรงเตี๊ยมบนแมพย่านท่าเรือ (ฉากเดียวกับถนน) → ประตูหน้าออกถนนโรงงาน · ชายสูทเทายืนอยู่ฝั่งตรงข้ามถนน · ไปต่อท่าเรือ<br>
    <b>ลงบันไดชั้นล่าง:</b> ฮาร์วีย์นั่งกินกาแฟอยู่ เล่าได้ว่าเมื่อคืน C.A.A.M. ขนของออกจากบาร์ทั้งคืน · จากนั้นไปต่อฉาก 5 ท่าเรือ (ตัวช่วย DM)</div>` });
  ui.notifications.info("ขึ้นเช้าวันที่ 2 แล้ว · ทุกคนอยู่ห้องแยกของตัวเอง");
}
