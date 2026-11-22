// Lodge of Madame Odile (Chapter 2.6): ground floor + upper floor, both finished night maps supplied by the DM (2376x1008 each, 23.76x10.08 cells).
// createLodgeScene() = ground-floor scene + refit of the upper-floor rest scene (walls, doors, lights), NPC tokens, and stair/door links.
import { setBackground } from "./ch1maps.js?v=21";
import { REST_SCENE, createRestScene } from "./reststop.js?v=22";
const MOD = "arkane-1920s";
const G = 100, SW = 2376, SH = 1008;
export const LODGE_SCENE = "Chapter 2.6: ลอดจ์ชั้น 1 (โรงเตี๊ยมสาขา)";
const HOSP = "Chapter 3: โรงพยาบาลทหารผ่านศึก (ชั้นล่าง)";
async function folderFor(type) { return game.folders.find((f) => f.name === "Arkane 1920s" && f.type === type) ?? Folder.create({ name: "Arkane 1920s", type, color: "#9A6B2C" }); }
// [x1, y1, x2, y2, door] in map pixels, traced from the supplied maps
const toWalls = (a) => a.map(([x1, y1, x2, y2, d]) => ({ c: [x1, y1, x2, y2], ...(d ? { door: 1 } : {}) }));
const toLights = (a) => a.map(([x, y]) => ({ x, y, config: { bright: 3, dim: 6, color: "#ffa94d", alpha: 0.22, animation: { type: "torch", speed: 2, intensity: 2 } } }));
const GW = [
  [127,83,2243,83,0],
  [127,83,127,693,0],
  [127,693,1130,693,0],
  [1130,693,1240,693,1],
  [1240,693,2243,693,0],
  [2243,83,2243,410,0],
  [2243,410,2243,510,1],
  [2243,510,2243,693,0],
  [811,83,811,415,0],
  [811,415,811,500,1],
  [811,500,811,693,0],
  [1518,83,1518,416,0],
  [1518,416,1518,525,1],
  [1518,525,1518,693,0],
  [1973,83,1973,170,0],
  [1973,170,1973,250,1],
  [1973,250,1973,335,0],
  [1973,335,2243,335,0]
];
const GL = [[261, 116], [636, 184], [511, 166], [154, 244], [356, 618], [642, 618], [1200, 190], [986, 653], [1443, 651], [944, 722], [1420, 722], [1645, 119], [1806, 178], [1901, 665], [2204, 469], [505, 255]];
const UW = [
  [128,83,2243,83,0],
  [128,83,128,804,0],
  [2243,83,2243,804,0],
  [128,804,2243,804,0],
  [128,475,493,475,0],
  [493,475,493,804,0],
  [505,410,618,410,0],
  [618,410,677,410,1],
  [677,410,814,410,0],
  [814,83,814,410,0],
  [1527,83,1527,410,0],
  [1527,410,1699,410,0],
  [1699,410,1746,410,1],
  [1746,410,1889,410,0],
  [1879,83,1879,410,0],
  [1974,333,2243,333,0],
  [1974,333,1974,457,0],
  [1974,457,1974,523,1],
  [1974,523,1974,529,0],
  [1974,529,2243,529,0],
  [497,543,541,543,0],
  [541,543,600,543,1],
  [600,543,808,543,0],
  [808,543,927,543,0],
  [927,543,986,543,1],
  [986,543,1004,543,0],
  [1004,543,1010,543,0],
  [1010,543,1075,543,1],
  [1075,543,1182,543,0],
  [1182,543,1277,543,0],
  [1277,543,1331,543,1],
  [1331,543,1340,543,0],
  [1340,543,1420,543,0],
  [1420,543,1473,543,1],
  [1473,543,1524,543,0],
  [1524,543,1800,543,0],
  [1800,543,1853,543,1],
  [1853,543,1875,543,0],
  [1875,543,1889,543,0],
  [1889,543,1948,543,1],
  [1948,543,2243,543,0],
  [808,543,808,804,0],
  [1004,543,1004,804,0],
  [1182,543,1182,804,0],
  [1340,543,1340,804,0],
  [1524,543,1524,804,0],
  [1875,543,1875,804,0]
];
const UL = [[220, 131], [505, 184], [630, 107], [760, 95], [1200, 190], [1580, 119], [1806, 178], [1639, 119], [2204, 291], [2216, 380], [214, 499], [1550, 618], [879, 754], [1378, 618], [2192, 760]];
const GROUND_WALLS = toWalls(GW);
const GROUND_LIGHTS = toLights(GL);
const UPPER_WALLS = toWalls(UW);
const UPPER_LIGHTS = toLights(UL);
const rect = (x, y, w, h) => ({ type: "rectangle", x, y, width: w, height: h, rotation: 0, hole: false });
const NPC_DEF = [
  { key: "innkeeper", name: "ซาร์จ ซิลาส เวย์น", x: 880, y: 580, ac: 10, hp: 11 }   // the one-armed veteran: owner, cook and waiter (Madame Odile was dropped from the scene)
];
async function ensureNpc(n) {
  let a = game.actors.find((q) => q.getFlag(MOD, "npc") === n.key);
  if (a) { if (a.name !== n.name) { try { await a.update({ name: n.name, "prototypeToken.name": n.name }); } catch (e) { console.warn(MOD, "rename npc", e); } } return a; }
  const img = `modules/${MOD}/npcs/${n.key}.webp`, tok = `modules/${MOD}/npcs/${n.key}-token.webp`;
  a = await Actor.create({ name: n.name, type: "npc", img, folder: (await folderFor("Actor"))?.id,
    system: { attributes: { ac: { calc: "flat", flat: n.ac }, hp: { value: n.hp, max: n.hp }, movement: { walk: 30 } }, details: { cr: 0 } },
    prototypeToken: { name: n.name, texture: { src: tok }, width: 1, height: 1, disposition: 1, displayName: 20, actorLink: true },
    flags: { [MOD]: { npc: n.key, chapter: 2 } } });
  return a;
}
async function refit(sc, file, walls, lights) {
  await sc.update({ width: SW, height: SH, padding: 0, tokenVision: true, "fog.exploration": false,
    "environment.darknessLevel": 0, "environment.globalLight.enabled": true, "grid.size": G });
  await setBackground(sc, file);
  const wl = sc.walls.map((x) => x.id); if (wl.length) await sc.deleteEmbeddedDocuments("Wall", wl);
  const ll = sc.lights.map((x) => x.id); if (ll.length) await sc.deleteEmbeddedDocuments("AmbientLight", ll);
  await sc.createEmbeddedDocuments("Wall", walls); await sc.createEmbeddedDocuments("AmbientLight", lights);
}
async function region(sc, name, r, color, dest) {
  const ex = sc.regions.getName(name);
  if (ex) { await ex.update({ shapes: [rect(...r)] }); return ex; }
  const [reg] = await sc.createEmbeddedDocuments("Region", [{ name, color, shapes: [rect(...r)], behaviors: dest ? [{ name, type: "teleportToken", system: { destination: dest.uuid, choice: true } }] : [] }]);
  return reg;
}
export async function createLodgeScene() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  let sc = game.scenes.getName(LODGE_SCENE);
  if (!sc) {
    sc = await Scene.create({ name: LODGE_SCENE, folder: (await folderFor("Scene"))?.id, navigation: false,
      background: { src: `modules/${MOD}/maps/lodge-ground-night.webp` }, width: SW, height: SH, padding: 0, backgroundColor: "#0b0b0d",
      grid: { type: 1, size: G, distance: 5, units: "ft", alpha: 0.12 }, tokenVision: true, fog: { exploration: false },
      environment: { darknessLevel: 0, globalLight: { enabled: true } }, walls: GROUND_WALLS, lights: GROUND_LIGHTS });
    await setBackground(sc, "lodge-ground-night.webp");
  } else await refit(sc, "lodge-ground-night.webp", GROUND_WALLS, GROUND_LIGHTS);
  const toks = [];
  try { const gone = sc.tokens.filter((t) => t.actor?.getFlag(MOD, "npc") === "odile").map((t) => t.id); if (gone.length) await sc.deleteEmbeddedDocuments("Token", gone); } catch (e) { console.warn(MOD, "remove odile token", e); }
  for (const n of NPC_DEF) {
    try { const a = await ensureNpc(n); for (const t of sc.tokens.filter((q) => q.actorId === a.id && q.name !== n.name)) await t.update({ name: n.name }); if (!sc.tokens.some((t) => t.actorId === a.id)) toks.push({ ...(await a.getTokenDocument({ x: n.x, y: n.y })).toObject(), x: n.x, y: n.y }); }
    catch (e) { console.warn(MOD, "lodge npc", n.key, e); }
  }
  if (toks.length) await sc.createEmbeddedDocuments("Token", toks);
  // upper floor = the rest-stop scene (Chapter 2.6), refit to the supplied upper map
  let up = game.scenes.getName(REST_SCENE);
  if (!up) { try { up = await createRestScene(); } catch (e) { console.warn(MOD, "rest scene", e); } }
  if (up) {
    await refit(up, "lodge-upper-night.webp", UPPER_WALLS, UPPER_LIGHTS);
    try {
      const gArr = await region(sc, "⤓ มาจากชั้น 2", [830, 430, 150, 90], "#3a7bd5");
      const uArr = await region(up, "⤓ มาจากชั้นล่าง (จุดพัก)", [880, 440, 260, 70], "#3a7bd5");
      await region(sc, "⤒ ขึ้นบันไดไปชั้น 2", [832, 250, 100, 170], "#d58a3a", uArr);
      const old = up.regions.getName("↪ ลงบันได ออกไปหาโรงพยาบาล"); if (old) await up.deleteEmbeddedDocuments("Region", [old.id]);
      await region(up, "↪ ลงบันไดไปชั้น 1", [925, 215, 100, 180], "#d58a3a", gArr);
      const hosp = game.scenes.getName(HOSP);
      const hArr = hosp?.regions.getName("⤓ มาจากจุดพักเชิงเนิน");
      if (hArr) await region(sc, "↪ ออกประตูหน้า ไปโรงพยาบาล", [1130, 680, 110, 80], "#d58a3a", hArr);
    } catch (e) { console.warn(MOD, "lodge regions", e); }
  }
  ui.notifications.info("ลอดจ์: ตั้งฉากชั้น 1 และชั้น 2 (แมพกลางคืน) แล้ว · ผนัง/ประตู/แสงลากตามภาพ อาจต้องขยับเล็กน้อย");
  return sc;
}

// Authoring uses the square grid (everything is sized to 100 px cells); for play the grid can be switched off so tokens walk freely.
// lodgeGrid(false) = gridless (play) · lodgeGrid(true) = square grid again (editing). Token size and map scale stay the same.
// Sarge Silas Wayne plays owner / cook / waiter: same man, different clothes. Swaps the actor portrait, the prototype token and every placed token of him.
const SARGE = { owner: ["innkeeper", "เจ้าของโรงเตี๊ยม"], chef: ["innkeeper-chef", "เชฟ"], waiter: ["innkeeper-waiter", "พนักงานเสิร์ฟ"], night: ["innkeeper-night", "ชุดนอน"] };
export async function sargeOutfit(role) {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const a = game.actors.find((q) => q.getFlag(MOD, "npc") === "innkeeper");
  if (!a) return ui.notifications.warn("ยังไม่มีซาร์จ (กดมาโคร 'Chapter 2.6: สร้างฉากลอดจ์ชั้น 1' ก่อน)");
  if (!SARGE[role]) {
    role = await foundry.applications.api.DialogV2.wait({ window: { title: "ซาร์จ: เปลี่ยนชุด" }, content: "<p>ซาร์จรับบทอะไรตอนนี้</p>", rejectClose: false,
      buttons: [...Object.entries(SARGE).map(([k, v]) => ({ action: k, label: v[1], callback: () => k })), { action: "x", label: "ยกเลิก", callback: () => null }] });
    if (!SARGE[role]) return;
  }
  const [file, label] = SARGE[role], img = `modules/${MOD}/npcs/${file}.webp`, tok = `modules/${MOD}/npcs/${file}-token.webp`;
  await a.update({ img, "prototypeToken.texture.src": tok, [`flags.${MOD}.outfit`]: role });
  let n = 0;
  for (const sc of game.scenes) { const ts = sc.tokens.filter((t) => t.actorId === a.id); if (ts.length) { await sc.updateEmbeddedDocuments("Token", ts.map((t) => ({ _id: t._id, "texture.src": tok }))); n += ts.length; } }
  ui.notifications.info(`ซาร์จ: ${label}${n ? ` (เปลี่ยนโทเคน ${n} ตัว)` : " (ยังไม่มีโทเคนบนฉาก)"}`);
}

export async function lodgeGrid(on) {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const scenes = [game.scenes.getName(LODGE_SCENE), game.scenes.getName(REST_SCENE)].filter(Boolean);
  if (!scenes.length) return ui.notifications.warn("ยังไม่มีฉากลอดจ์ (กดมาโครสร้างฉากก่อน)");
  const show = on ?? (scenes[0].grid.type === 0);
  for (const sc of scenes) await sc.update({ "grid.type": show ? 1 : 0, "grid.size": G, "grid.alpha": 0.12 });
  ui.notifications.info(show ? "ฉากลอดจ์: เปิดกริด (โหมดจัดฉาก)" : "ฉากลอดจ์: ปิดกริด (โหมดเล่น เดินอิสระ)");
}

// lodgeVision(true) = walls block sight (fog of war for players) · lodgeVision(false) = everything visible. GM always sees all.
export async function lodgeVision(on) {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const scenes = [game.scenes.getName(LODGE_SCENE), game.scenes.getName(REST_SCENE)].filter(Boolean);
  if (!scenes.length) return ui.notifications.warn("ยังไม่มีฉากลอดจ์ (กดมาโครสร้างฉากก่อน)");
  const vis = on ?? !scenes[0].tokenVision;
  for (const sc of scenes) {
    await sc.update({ tokenVision: vis, "fog.exploration": false });
    if (vis) {
      const fix = sc.tokens.filter((t) => t.actor?.type === "character" && !t.sight?.enabled).map((t) => ({ _id: t.id, "sight.enabled": true, "sight.range": 0 }));
      if (fix.length) await sc.updateEmbeddedDocuments("Token", fix);
    }
  }
  ui.notifications.info(vis ? "ฉากลอดจ์: เปิดบังวิสัยทัศน์ (กำแพงบังสายตาผู้เล่น)" : "ฉากลอดจ์: ปิดบังวิสัยทัศน์ (เห็นทั้งแมพ)");
}
