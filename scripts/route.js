// Chapter 2.5 chase: ONE big scene (88x72 squares) drawn from the DM's own route on the Arkane city map.
// Route: Warehouse district (south-west) -> north along the harbor-industrial street -> east along the avenue over the Arkane bridge ->
// north past the courthouse and park -> diagonal avenue past the central station -> north across the railway -> inn parking lot (end of Chapter 2).
import { setBackground, BIG } from "./ch1maps.js?v=21";
import { createVehicles, boardToken, vehicleRiders, resyncVehicles } from "./vehicle.js?v=23";
import { NOTES, TABLE, ENEMY } from "./chase.js?v=21";
import { ROUTE_WALLS, ROUTE_LAMPS, COORDS } from "./bigdata.js?v=21";
const MOD = "arkane-1920s";
const G = 50;            // grid size of the scene (art is scaled to 50 px per square)
const TOT = COORDS.TOT;   // rows added above the old district part
const SC = G / 100;      // generated data and the old district art are in 100-px units
const DISTRICT = "Chapter 1: ย่านท่าเรือ (แมพใหญ่)";
const D = () => foundry.applications.api.DialogV2;
export const CHASE = "Chapter 2.5: ไล่ล่าอาร์คเคน (ฉากใหญ่)";
export const ROUTE_JOURNAL = "เส้นทางไล่ล่า (DM)";
const REST = "Chapter 2.6: จุดพักเชิงเนิน (โรงเตี๊ยมสาขา)";
// vehicle token top-left (squares) + rotation (art faces up: 0 = north); token box 2x3
const SLOT = { start: { party: [...COORDS.start.party, 0], foes: [[...COORDS.start.foes[0], 0], [...COORDS.start.foes[1], 0]] }, lot: { party: [...COORDS.lot.party, 0] } };
const P = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.startsWith("- ") ? `<li>${l.slice(2)}</li>` : `<p>${l}</p>`).join("").replace(/(<li>.*?<\/li>)+/g, (m) => `<ul>${m}</ul>`);
const rectR = ([x, y, w, h]) => ({ type: "rectangle", x: x * G, y: y * G, width: w * G, height: h * G, rotation: 0, hole: false });
async function folderFor(type) { return game.folders.find((f) => f.name === "Arkane 1920s" && f.type === type) ?? Folder.create({ name: "Arkane 1920s", type, color: "#9A6B2C" }); }

const SECT = [
  ["2 ช่วง 1 · ถนนหน้าโกดัง 4 (ฉากเช้า Ch2) → ถนนใหญ่ (X 4–8, Y 98→73)", `เริ่มที่ถนนสายเหนือ-ใต้ข้างโกดังหมายเลข 4 (แมพฉากเช้า Ch2 เดิม ตัดตึกบาร์ออกแล้ว) รถปาร์ตี้หันหน้าขึ้นเหนือ X 5, Y 62 · ซินดิเคทตามหลัง 2 คัน (Y 67 และ Y 71) · ถนนกว้างแค่ 4 ช่อง รถวิ่งเรียงแถวเดียว ระยะ ราว 25 ช่อง
- ด่าน C.A.A.M. (ไม้กั้นลายแดงขาว) ที่ปลายถนนด้านเหนือ ผ่านได้โดยไม่ต้องหยุด (ถ้าหยุด ศัตรูทัน)
- สิ่งกีดขวาง: ลังและถังริมโกดัง · ประตูทางเข้าโกดังด้านซ้ายของถนน
- รอบแรก: คันที่ 1 ของศัตรูพุ่งชน คันที่ 2 ยิง`],
  ["3 ช่วง 2 · ถนนใหญ่ → สะพานอาร์คเคน (Y 67–73, X 6→132)", `เลี้ยวขวา (ตะวันออก) เข้าถนนใหญ่ (ข้อความบนถนน "ย่านอุตสาหกรรม") ยาว ราว 126 ช่อง (ช่วงแรกผ่านย่านโรงงานและคลังสินค้า มีซอยตัดที่ X 52–56 และ X 66–70 · ข้ามสะพานแล้วเป็นย่านร้านค้า ซอยตัดที่ X 104–108 และ X 118–122) ตัดแม่น้ำอาร์คเคนที่ X 81–90 (สะพานหินกว้าง 6 ช่อง ราวสะพานเป็นกำแพง) ตัดแม่น้ำอาร์คเคนที่ X 81–90 (สะพานหินกว้าง 6 ช่อง ราวสะพานเป็นกำแพง)
- ป้ายบนแมพ: "สะพานอาร์คเคน (ข้ามแม่น้ำ)" ใต้สะพาน, "แม่น้ำอาร์คเคน" บนผิวน้ำ
- สะพานเป็นคอขวด: รถเรียงแถวเดียว ถ้ารถศัตรูโดนยิงยางบนสะพาน ทอยขับ DC 12 ไม่ผ่านชนราว (2d6) · คนตกน้ำ Athletics DC 12 ว่ายกลับ`],
  ["4 ช่วง 3 · ใจกลางเมือง: ศาลาว่าการและสวน (X 129–135, Y 67→37)", `เลี้ยวหักซ้ายขึ้นเหนือที่ถนนหลวง (X 129–135 ตรงยาว 30 ช่อง) ผ่านศาลาว่าการเมืองอาร์คเคน (X 119–127.5, Y 44–53 ทางซ้าย) และสวนสาธารณะทหารผ่านศึก (X 151.5–166, Y 28.5–39.5 ทางขวา) · ระยะ ราว 16 ช่อง
- ฝูงชนหน้าศาลา: ห้ามยิงโดนผู้บริสุทธิ์ (ตารางเหตุการณ์ข้อ 3) ตำรวจเป่านกหวีด (ข้อ 2)
- สวนไม่มีกำแพง ขับตัดสวนได้ ประหยัด 4 ช่อง แต่ต้นไม้และน้ำพุเป็นสิ่งกีดขวาง ทอยขับ DC 12 ไม่ผ่านชนต้นไม้ (2d6)`],
  ["5 ช่วง 4 · ทางตรงยาวไปตะวันออก ผ่านสถานีรถไฟกลาง (X 132→169, Y 34–40)", `เลี้ยวหักขวาฉาก (ไม่มีทางเฉียง) วิ่งตรงตะวันออก ระยะ ราว 37 ช่อง สถานีรถไฟกลางอยู่ทางซ้าย (X 118.5–127, Y 29.5–35 ทางซ้าย) · ป้ายสีเขียว "เนินคฤหาสน์ »" ที่ต้นทาง
- ศัตรูพยายามตัดหน้าด้วยซอยด้านซ้าย (ทอย d6: 1–2 รถศัตรูคันหนึ่งโผล่ข้างหน้า)`],
  ["6 ช่วง 5 · ถนนเนินคฤหาสน์ + ทางรถไฟ (X 169, Y 37→10)", `เลี้ยวหักขึ้นเหนือ ถนนตรง กว้าง 6 ช่อง (X 166–172) ตัดทางรถไฟที่ Y ≈ 31 (ไม้กั้นแดงขาวสองข้างที่ X 166 และ X 172) ก่อนถึงลานจอด · ทางเข้าเขตคฤหาสน์ร้างอยู่ซ้ายมือ
- เหตุการณ์ "รถไฟ": ทอย d6 ทุกรอบ เมื่อถึงทางรถไฟ ถ้าได้ 1 รถไฟแล่นผ่านช่วง X 166–172 (ปิดทาง 1 รอบ) ผู้ที่ข้ามทันทอย DEX DC 13, ศัตรูที่ติดอยู่ถอนตัว
- ป้ายบนแมพ: "ทางรถไฟ ระวังรถไฟ", "โรงเตี๊ยมสาขาเชิงเนิน «"`],
  ["7 ช่วง 6 · ลานจอดโรงเตี๊ยมสาขาเชิงเนิน = จบ Chapter 2", `ลานกรวด X 159.5–174, Y 4.2–9.8 ช่องจอด 5 ช่อง (กว้าง 2.2 ช่อง ลึก 3.2 ช่อง) เลข 1–5 ที่ขอบล่างช่อง · ช่อง 2 มีรถของทหารผ่านศึกจอดอยู่
- ป้ายบนแมพ (ผู้เล่นเห็นทั้งหมด): "โรงเตี๊ยมนายทหารผ่านศึก" บนตัวอาคาร, "ที่จอดรถ (ลูกค้าโรงเตี๊ยม)", "ห้ามจอดขวางทางรถพยาบาล", "โรงเตี๊ยมสาขาเชิงเนิน «" ที่ปากทาง
- ตี้จอดช่อง 3–5 (รถเก๋งกล่อง 2×3 rotation 0) · ประตูโรงเตี๊ยม X 168–170 ที่ผนังด้านล่าง เดินเข้าแถบประตูเพื่อขึ้นชั้นพัก
- ศัตรูถอนตัวเมื่อตี้เลี้ยวเข้าลานจอด · มาโคร "Chapter 2.6: จุดพักเชิงเนิน" → 1 มาถึงจุดพัก
- ไม่มีทางเข้าโรงพยาบาลในฉากนี้: ทุกคนจบที่โรงเตี๊ยม แล้วค่อยไปโรงพยาบาลใน Chapter 3`]
];
const OVERVIEW = `ฉากใหญ่ฉากเดียว (179×110 ช่อง): ต่อจากแมพย่านท่าเรือฉากเช้า Ch2 (ตัดตึกบาร์ออก) แล้วขยายตามเส้นทางที่ DM ขีดบนแผนที่เมืองอาร์คเคน · เล่นได้ทั้งกลางคืน (ค่าเริ่มต้น) และกลางวัน ด้วยปุ่มสลับ
- เส้นทาง: ถนนข้างโกดัง 4 (ใต้ซ้าย) → ขึ้นเหนือ → ถนนใหญ่ตะวันออก → สะพานอาร์คเคน → ถนนหลวงตรงขึ้นเหนือยาว (ศาลาว่าการ/สวน) → เลี้ยวหักขวาฉากวิ่งตรงยาวไปตะวันออก (สถานีรถไฟ) → เลี้ยวหักขึ้นเหนือ ตัดทางรถไฟ → ลานจอดโรงเตี๊ยม
- ระยะบนแมพ ราว 235 ช่อง (ย่อส่วนจากระยะจริงราว 10 ไมล์): รถเก๋งวิ่ง 16 ช่อง/รอบ (Dash 32) ใช้ราว 7–14 รอบ ตามที่ตารางเหตุการณ์ทอยได้
- ศัตรู: ซินดิเคท 2 คัน ตามหลังเริ่มที่ 5 และ 9 ช่อง
- เส้นชัย: ลานจอดโรงเตี๊ยม จบ Chapter 2 แล้วต่อ Chapter 2.6
- มาโคร: "Chapter 2.5: สร้างฉากไล่ล่า" (สร้างฉาก) · "Chapter 2.5: วางรถและศัตรู" · "Chapter 2.5: วาร์ปไล่ล่า" (ไปจุดเริ่ม / ลานจอด / สลับเช้า-ค่ำ)`;
async function journal() {
  let key = game.journal.getName(ROUTE_JOURNAL);
  if (key) return key;
  const pages = [["0 เส้นทางทั้งหมด", OVERVIEW], NOTES[0] && ["1 กฎการขับรถยิงกัน", NOTES[0][3]], ...SECT, ["8 ตารางเหตุการณ์", TABLE], ["9 ศัตรูและการวางตัว", ENEMY]].filter(Boolean);
  key = await JournalEntry.create({ name: ROUTE_JOURNAL, folder: (await folderFor("JournalEntry"))?.id, ownership: { default: 0 },
    pages: pages.map(([name, txt], i) => ({ name, type: "text", sort: (i + 1) * 100, text: { content: P(txt), format: 1 } })) });
  return key;
}
const PINS = COORDS.pins;
// walls/lights of the old district map (x >= 22 squares kept, bar building removed) moved into this scene
const inBar = (x, y) => x >= 3000 && x <= 5600 && y >= 300 && y <= 1100;
function districtParts() {
  const live = game.scenes.getName(DISTRICT);
  const src = live ? live.walls.map((w) => { const o = w.toObject(); delete o._id; delete o._stats; return o; }) : BIG.district.walls;
  const walls = src.filter((w) => { const [a, b, c, e] = w.c; return Math.min(a, c) >= 2200 && !(inBar(a, b) && inBar(c, e)); })
    .map((w) => ({ ...w, c: [(w.c[0] - 2200) * SC, (w.c[1] + (44 + TOT) * 100) * SC, (w.c[2] - 2200) * SC, (w.c[3] + (44 + TOT) * 100) * SC].map(Math.round) }));
  const lights = BIG.district.lights.filter((l) => l.x >= 2200 && !inBar(l.x, l.y)).map((l) => ({ ...l, x: Math.round((l.x - 2200) * SC), y: Math.round((l.y + (44 + TOT) * 100) * SC) }));
  return { walls, lights };
}

export async function createRouteScene() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  let sc = game.scenes.getName(CHASE);
  if (sc) {   // v4.5: scenes made earlier still point at the old art; switch them to the new city chase map (same size and layout)
    try { const cur = sc.levels?.contents?.[0]?.background?.src ?? sc.background?.src ?? ""; if (cur && !cur.includes("chase-city-")) await setBackground(sc, sc.environment.globalLight?.enabled ? "chase-city-day.webp" : "chase-city-night.webp"); } catch (e) { console.warn(MOD, "chase bg", e); }
    await sc.view(); return sc;
  }
  const key = await journal();
  const sf = game.folders.find((f) => f.name === "Arkane 1920s" && f.type === "Scene");
  const cfg = { bright: 8, dim: 18, color: "#ffc070", alpha: 0.45, animation: { type: "torch", speed: 2, intensity: 2 } };
  sc = await Scene.create({
    name: CHASE, folder: sf?.id, navigation: true, background: { src: `modules/${MOD}/maps/chase-city-night.webp` },
    width: COORDS.W * G, height: COORDS.H * G, padding: 0, backgroundColor: "#0b0b0d",
    grid: { type: 0, size: G, distance: 5, units: "ft", alpha: 0.12 },   // gridless: cars move and turn freely (the size stays 50 px so token sizes keep their meaning)
    tokenVision: true, fog: { exploration: true }, environment: { darknessLevel: 0.6 },
    walls: [...districtParts().walls, ...ROUTE_WALLS.map((w) => ({ ...w, c: w.c.map((v) => Math.round(v * SC)) }))],
    lights: [...districtParts().lights, ...ROUTE_LAMPS.map(([x, y]) => ({ x: Math.round(x * SC), y: Math.round(y * SC), config: cfg }))],
    notes: PINS.map(([x, y, pg, t]) => ({ entryId: key.id, pageId: key.pages.find((p) => p.name.startsWith(`${pg} `))?.id, x: x * G, y: y * G, text: t, iconSize: 40, fontSize: 24, texture: { src: "icons/svg/book.svg" } })),
    flags: { [MOD]: { route: "big" } }
  });
  await setBackground(sc, "chase-city-night.webp");
  await sc.createEmbeddedDocuments("Region", [
    { name: "⤓ จุดเริ่มไล่ล่า (หน้าโกดัง 4)", color: "#3a7bd5", shapes: [rectR(COORDS.start.region)], behaviors: [] },
    { name: "⤓ ลานจอดโรงเตี๊ยมสาขา (จบ Ch2)", color: "#3a7bd5", shapes: [rectR(COORDS.lot.region)], behaviors: [] }]);
  try { await linkLot(); } catch (e) { console.warn(MOD, "linkLot", e); }
  ui.notifications.info("สร้างฉากไล่ล่าอาร์คเคน (ฉากใหญ่) แล้ว");
  await sc.view();
  return sc;
}
export const createRouteScenes = createRouteScene;
// grid on/off for the chase map (gridless = free driving; the size stays 50 px so the cars keep their size)
export async function chaseGrid(on) {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const sc = game.scenes.getName(CHASE); if (!sc) return ui.notifications.warn("ยังไม่มีฉากไล่ล่า · กดมาโคร 'Chapter 2.5: สร้างฉากไล่ล่า'");
  const want = on ?? sc.grid.type === 0;
  await sc.update({ "grid.type": want ? 1 : 0, "grid.size": G, "grid.alpha": 0.12 });
  ui.notifications.info(want ? "ฉากไล่ล่า: เปิดกริด" : "ฉากไล่ล่า: ปิดกริด (ขับและหมุนรถอิสระ)");
}
// regions: inn door (up to the rest-stop rooms) and the way back down
export async function linkLot() {
  const sc = game.scenes.getName(CHASE), rest = game.scenes.getName(REST);
  if (!sc || !rest) return;
  const mk = async (s, name, r, color, dest) => s.regions.getName(name) ?? (await s.createEmbeddedDocuments("Region", [{ name, color, shapes: [rectR(r)], behaviors: dest ? [{ name, type: "teleportToken", system: { destination: dest.uuid, choice: true } }] : [] }]))[0];
  const restArr = rest.regions.getName("⤓ มาจากชั้นล่าง (จุดพัก)") ?? (await rest.createEmbeddedDocuments("Region", [{ name: "⤓ มาจากชั้นล่าง (จุดพัก)", color: "#3a7bd5", shapes: [rectR([14, 5, 2, 2])], behaviors: [] }]))[0];
  const back = await mk(sc, "⤓ กลับจากชั้นพัก (หน้าโรงเตี๊ยมเชิงเนิน)", [COORDS.lot.back[0], COORDS.lot.back[1], 2, 1], "#3a7bd5");
  await mk(sc, "↪ เข้าโรงเตี๊ยมเชิงเนิน (ขึ้นชั้นพัก)", [COORDS.lot.door[0], COORDS.lot.door[1], 2, 1], "#e0b020", restArr);
  await mk(rest, "↪ ลงบันไดไปลานจอด", [18, 2, 2, 2], "#d58a3a", back);
}

// ---------- placing the chase ----------
const isVeh = (t) => !!t.actor?.getFlag(MOD, "vehicle");
const isRider = (t) => !!t.getFlag(MOD, "ride");
const partyActors = () => game.actors.filter((a) => a.type === "character" && a.getFlag(MOD, "pc") && !a.getFlag(MOD, "retired") && !a.getFlag(MOD, "later"));
export async function placeRoute() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const sc = await createRouteScene(); if (!sc) return;
  if (sc.tokens.some((t) => t.getFlag(MOD, "chaseTok"))) { await resyncVehicles(sc); return ui.notifications.info("วางรถและศัตรูไล่ล่าแล้ว · จัดคนบนรถเข้าที่นั่งใหม่แล้ว (ลบโทเคนเก่าก่อนถ้าต้องการวางใหม่)"); }
  const pcs = partyActors();
  const opt = await D().wait({ window: { title: "วางรถและศัตรู (Chapter 2.5)" }, content: `<div class="rw-form"><div class="form-group"><label>รถปาร์ตี้</label><select name="veh"><option value="car">รถเก๋งสีดำ (นั่ง 4)</option><option value="van">รถตู้ C.A.A.M. (นั่ง 6)</option></select></div>
      <div class="form-group"><label>คนขับ</label><select name="drv">${pcs.map((a) => `<option value="${a.id}">${foundry.utils.escapeHTML(a.name)}</option>`).join("")}</select></div>
      <p class="rw-hint">วางที่ถนนหน้าโกดัง 4 (ซ้ายล่างของแมพ) หันหน้าขึ้นเหนือ · ตัวละครที่เหลือขึ้นรถอัตโนมัติ · มือปืนซินดิเคทขึ้นรถศัตรู 2 คันตามหลัง · ขับตามถนนแล้วไปจบที่ลานจอดโรงเตี๊ยม (ขวาบน)</p></div>`,
    buttons: [{ action: "ok", label: "วาง", default: true, callback: (ev, btn) => new FormDataExtended(btn.form).object }, { action: "x", label: "ยกเลิก" }], rejectClose: false }).catch(() => null);
  if (!opt || typeof opt !== "object") return;
  const veh = await createVehicles();
  const { createChapterNpcs } = await import("./chapters.js?v=21");
  const npc = await createChapterNpcs(2);
  const td = async (a, x, y, extra = {}) => { const o = (await a.getTokenDocument()).toObject(); return { ...o, x, y, ...extra, flags: { ...(o.flags ?? {}), [MOD]: { chaseTok: 1 } } }; };
  const mk = async (a, sx, sy, rot = 0) => (await sc.createEmbeddedDocuments("Token", [await td(a, sx * G, sy * G, { rotation: rot })]))[0];
  const sl = SLOT.start;
  const party = await mk(veh[opt.veh], sl.party[0], sl.party[1], sl.party[2]), carA = await mk(veh.gang, sl.foes[0][0], sl.foes[0][1], sl.foes[0][2]), carB = await mk(veh.gang, sl.foes[1][0], sl.foes[1][1], sl.foes[1][2]);
  const crew = async (vt, list) => { for (const k of list) { const a = npc[k]; if (!a) continue; const t = (await sc.createEmbeddedDocuments("Token", [await td(a, vt.x, vt.y, { disposition: -1 })]))[0]; await boardToken(vt, t, true); } };
  await crew(carA, ["gunman", "gunman", "gunman"]);
  await crew(carB, ["gunman", "gunman", "hybrid"]);
  const order = [pcs.find((a) => a.id === opt.drv), ...pcs.filter((a) => a.id !== opt.drv)].filter(Boolean);
  for (const a of order) {
    let t = sc.tokens.find((q) => q.actorId === a.id && !isRider(q));
    if (!t) t = (await sc.createEmbeddedDocuments("Token", [await td(a, party.x, party.y, { disposition: 1 })]))[0];
    else await t.update({ x: party.x, y: party.y, [`flags.${MOD}.chaseTok`]: 1 }, { animate: false });
    await boardToken(party, t, true);
  }
  await sc.view();
  ui.notifications.info("วางรถและทีมแล้ว หน้าโกดัง 4 · เพิ่มตัวละครกับมือปืนเข้า Combat แล้วเริ่มไล่ล่า");
}

// ---------- day / night ----------
export async function setChaseTime(day = false) {
  const s = game.scenes.getName(CHASE);
  if (!s) return ui.notifications.warn("ยังไม่มีฉากไล่ล่า · กดมาโคร 'Chapter 2.5: สร้างฉากไล่ล่า'");
  await setBackground(s, day ? "chase-city-day.webp" : "chase-city-night.webp");
  await s.update({ "environment.darknessLevel": day ? 0.05 : 0.6, "environment.globalLight.enabled": !!day });
  const lights = s.lights.map((l) => ({ _id: l.id, hidden: !!day }));
  if (lights.length) await s.updateEmbeddedDocuments("AmbientLight", lights);
  ui.notifications.info(`ฉากไล่ล่า: ${day ? "กลางวัน" : "กลางคืน"}`);
}
export const toggleChaseTime = () => { const s = game.scenes.getName(CHASE); return setChaseTime(!(s && s.environment.globalLight?.enabled)); };

// ---------- shortcut: jump the group inside the scene ----------
async function jumpGroup(sc, slot) {
  const pv = sc.tokens.find((t) => isVeh(t) && t.actor.getFlag(MOD, "vehicle") !== "gang" && vehicleRiders(t).length) ?? sc.tokens.find((t) => isVeh(t) && t.actor.getFlag(MOD, "vehicle") !== "gang");
  if (slot === "lot") {   // the syndicate cars withdraw at the inn lot
    const gone = sc.tokens.filter((t) => (isVeh(t) && t.actor.getFlag(MOD, "vehicle") === "gang") || (isRider(t) && t.disposition === -1) || (t.getFlag(MOD, "chaseTok") && t.disposition === -1)).map((t) => t.id);
    if (gone.length) await sc.deleteEmbeddedDocuments("Token", gone).catch(() => {});
  }
  const sl = SLOT[slot].party;
  if (pv) await pv.update({ x: sl[0] * G, y: sl[1] * G, rotation: sl[2] }, { animate: false });
  const feet = sc.tokens.filter((t) => !isVeh(t) && !isRider(t) && t.actor?.type === "character" && t.actor.hasPlayerOwner);
  let i = 0; for (const t of feet) { await t.update({ x: (sl[0] + (i % 3)) * G, y: (sl[1] + 3.4 + Math.floor(i / 3)) * G }, { animate: false }); i++; }
  ui.notifications.info(slot === "lot" ? "ถึงลานจอดโรงเตี๊ยมแล้ว (จบ Chapter 2)" : "กลับจุดเริ่มไล่ล่า");
}
export async function routeWarp() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const sc = await createRouteScene(); if (!sc) return;
  const r = await D().wait({ window: { title: "Chapter 2.5 · ลัดเส้นทางไล่ล่า" }, content: `<div class="rw-form"><p class="rw-hint">ย้ายรถปาร์ตี้ (และคนบนรถ/คนข้างรถ) ภายในฉากไล่ล่า · ไปลานจอด = ศัตรูถอนตัว</p></div>`,
    buttons: [{ action: "start", label: "ไปจุดเริ่มไล่ล่า (หน้าโกดัง 4)" }, { action: "lot", label: "ไปลานจอดโรงเตี๊ยม (จบ Ch2)", default: true }, { action: "time", label: "สลับกลางวัน / กลางคืน" }, { action: "x", label: "ยกเลิก" }], rejectClose: false }).catch(() => null);
  if (r === "start" || r === "lot") { await sc.view?.(); return jumpGroup(sc, r); }
  if (r === "time") return toggleChaseTime();
}
export function registerRoute() { /* single-scene route: no automatic warp needed */ }
