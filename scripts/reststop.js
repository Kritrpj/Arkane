// Rest stop between Chapter 2.5 (road chase) and Chapter 3 (hospital): a hillside branch of the veterans' inn, ~450 m below the hospital.
// restStop() = one macro with three steps: arrive (night, day 2) -> morning (long rest, day 3) -> walk up to the hospital (Chapter 3).
// Reuses the inn's upstairs map (5 rooms off one corridor). Nothing here touches the Chapter 1 inn scene.
import { WALLS, LIGHTS, SUN } from "./inn.js?v=21";
import { setBackground } from "./ch1maps.js?v=21";
import { linkLot, routeWarp } from "./route.js?v=21";
const MOD = "arkane-1920s";
const G = 100;
const D = () => foundry.applications.api.DialogV2;
export const REST_SCENE = "Chapter 2.6: จุดพักเชิงเนิน (โรงเตี๊ยมสาขา)";
export const REST_JOURNAL = "จุดพักก่อน Chapter 3 (DM)";
const HOSP = "Chapter 3: โรงพยาบาลทหารผ่านศึก (ชั้นล่าง)";
const CHASE = "Chapter 2.5: ไล่ล่าบนถนน (ขับรถยิงกัน)";
const rectR = ([x, y, w, h]) => ({ type: "rectangle", x: x * G, y: y * G, width: w * G, height: h * G, rotation: 0, hole: false });
const P = (s) => s.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => l.startsWith("- ") ? `<li>${l.slice(2)}</li>` : `<p>${l}</p>`).join("").replace(/(<li>.*?<\/li>)+/g, (m) => `<ul>${m}</ul>`);
const esc = (s) => foundry.utils.escapeHTML(String(s));
const partyActors = () => game.actors.filter((a) => a.type === "character" && a.getFlag(MOD, "pc") && !a.getFlag(MOD, "later") && !a.getFlag(MOD, "retired"));
async function folderFor(type) { return game.folders.find((f) => f.name === "Arkane 1920s" && f.type === type) ?? Folder.create({ name: "Arkane 1920s", type, color: "#9A6B2C" }); }

const PAGES = [
  ["1 ภาพรวม (จบไล่ล่า → เข้าโรงพยาบาล)", `เวลา: ค่ำวันที่ 2 → เช้าวันที่ 3 · เหตุผลที่แวะ: ตี้อยู่ห่างโรงพยาบาลราว 400–500 เมตร ไม่ควรขับรถตรงเข้าประตู เพราะยามจะรู้ตัวและเครนจะชาร์จเครื่องก่อน (กติกา "บุกเข้าไป" ของบท 3)
- จบไล่ล่า: ผ่าน 4 ช่วง (ท่าเรือ → สะพานอาร์คเคน → ใจกลางเมือง → ถนนขึ้นเนิน) แล้วซินดิเคทถอนตัวเมื่อตี้เลี้ยวเข้าซอยใต้ (ช่อง 61–65) ที่มีป้ายโรงเตี๊ยมนายทหารผ่านศึกสาขาเชิงเนิน และวาร์ปไปลานจอด (จบ Chapter 2) ไม่ตามเข้าซอย แต่จำทะเบียนรถได้ (ไว้ใช้ภายหลัง)
- มาโคร "Chapter 2.6: จุดพักเชิงเนิน" มี 3 ปุ่มตามลำดับ: มาถึงจุดพัก → ขึ้นเช้าวันที่ 3 (พักยาว) → ไปหน้าโรงพยาบาล (Chapter 3)
- ฉากใช้แมพโรงเตี๊ยมชั้นพัก: 5 ห้อง 1 ทางเดิน บันไดอยู่ทางขวา
- รถปาร์ตี้ทิ้งไว้ที่ซอยหลังโรงเตี๊ยม (โทเคนรถยังอยู่ในฉากไล่ล่า)`],
  ["2 อ่านให้ผู้เล่นฟัง (ถึงจุดพัก)", `เสียงปืนเงียบลงที่เบื้องหลัง ไฟหน้ารถซินดิเคทหายไปตรงหัวถนน คุณเลี้ยวเข้าซอยแคบด้านใต้ที่มีป้ายไม้เก่าๆ ว่า "โรงเตี๊ยมนายทหารผ่านศึก" ข้างบนเนินขึ้นไปไม่ไกลมีอาคารอิฐสีซีดยืนมืดอยู่เหนือหมอกบางๆ มันคือโรงพยาบาล เจ้าของโรงเตี๊ยมแขนข้างเดียวหยิบกุญแจให้โดยไม่ถามอะไร "ห้องชั้นบนมีห้าห้อง คืนนี้ไม่มีใครมา"`],
  ["3 เพอร์รี่เข้าตี้ + ทอยล่ากลางคืน (ลับ)", `- เพอร์รี่ (Warlock ที่ซ่อนอยู่) มาเจอตี้ที่นี่ ให้ผู้เล่นของเธอเสนอเหตุผลเข้าตี้ในแชทส่วนตัวก่อน
- ก่อนพักยาวคืนนี้: ใช้มาโคร "เพอร์รี่: ทอยล่ากลางคืน (ลับ)" (ระบบส่งปุ่มทอยลับให้เฉพาะเจ้าของเพอร์รี่ ผลมาที่ DM คนเดียว)
- ผู้เล่นคนอื่นเห็นเพียงว่ามีคนหายไปครู่หนึ่ง ถ้า Passive Perception สูงพอ (ระบบแนะนำใครสังเกตเห็นให้)
- ถ้า Hadar ถูกใช้กับศัตรูวันนี้แล้ว: กดข้าม ไม่ต้องทอย`],
  ["4 เช้าวันที่ 3: มองโรงพยาบาลจากเนิน (สอดแนมก่อนเข้า)", `ทั้งตี้ขึ้นเนินไปมองจากพุ่มไม้ ทอยได้คนละ 1 ครั้ง ผลแต่ละข้อบอกทางเข้าที่ใช้ได้ (ตรงกับตัวเลือกทางเข้าของบท 3)
- Perception DC 12: ยามหน้าประตู 1 คน (กะดึกยังไม่เปลี่ยน) พยาบาลเดินผ่านหน้าต่างชั้นล่างยิ้มค้างตลอดเวลา เห็นแผลรอยเข็มบนแขนคนไข้ที่นั่งรถเข็นอยู่ที่ระเบียง
- Investigation DC 13: รถส่งผ้าซักรีดมาถึงประตูข้างตอน 8 โมงเช้าทุกวัน คนขับไม่ถูกตรวจ → ปลอมเป็นเจ้าหน้าที่ได้ (Deception DC 13 ตามบท ได้ Advantage ถ้ามีจดหมายของรอสโซ/เครน)
- Insight หรือ Medicine DC 12 (หรือถามเจ้าของโรงเตี๊ยม): คนไข้ใหม่รับเข้าทุกเช้า ใครทำท่าสับสนหรือบ่นว่ามีเสียงในหัวจะถูกพาเข้าหอผู้ป่วย A → ปลอมเป็นคนไข้ได้ (แต่ถูกฉีดยา: Disadvantage เซฟ WIS จนกว่าจะพัก)
- ไม่มีใครทอยผ่าน: ยังเห็นว่าประตูหน้าเปิดอยู่ ตี้ต้องเลือกเองระหว่างปลอมตัวแบบเดาสุ่มหรือบุกตรงๆ
- ถ้ารถปาร์ตี้ขับเข้าประตูหน้า = "บุกเข้าไป" (ผู้คุมทั้งตึกตื่น เครนเริ่มชาร์จทันที นาฬิกา +1)`],
  ["5 สรุปก่อนเข้า Chapter 3", `- ฉาก Ch3 เริ่มที่หน้าประตูไม้โอ๊กคู่ (ทางเข้าหลัก) ถ้าไปประตูข้างหรือหอผู้ป่วย ให้ย้ายโทเคนตามที่ตี้เลือก
- ของที่ตี้อาจมี: จดหมายสั่งการจากเซนต์อัลดริก (c2-order) = หลักฐานปลอมตัว
- เสียงหัวใจเต้นตุบเริ่มได้ยินที่ระเบียงหน้าตึก (Perception DC 15 ตอนเข้าใกล้ประตู)
- นาฬิกา (clock) ไม่เพิ่มจากการพักที่โรงเตี๊ยม`]
];

async function mkRegion(sc, name, r, color, dest) {
  const ex = sc.regions.getName(name);
  if (ex) return ex;
  const [reg] = await sc.createEmbeddedDocuments("Region", [{ name, color, shapes: [rectR(r)], behaviors: dest ? [{ name, type: "teleportToken", system: { destination: dest.uuid, choice: true } }] : [] }]);
  return reg;
}

export async function createRestScene() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  let sc = game.scenes.getName(REST_SCENE);
  if (!sc) {
    sc = await Scene.create({ name: REST_SCENE, folder: (await folderFor("Scene"))?.id, navigation: false,
      background: { src: `modules/${MOD}/maps/inn-upper.webp` }, width: 20 * G, height: 7 * G, padding: 0, backgroundColor: "#0b0b0d",
      grid: { type: 1, size: G, distance: 5, units: "ft", alpha: 0.15 }, tokenVision: false, fog: { exploration: false },
      environment: { darknessLevel: 0.6, globalLight: { enabled: true } }, walls: WALLS, lights: LIGHTS });
    await setBackground(sc, "inn-upper.webp");
  }
  if (!game.journal.getName(REST_JOURNAL)) await JournalEntry.create({ name: REST_JOURNAL, folder: (await folderFor("JournalEntry"))?.id, ownership: { default: 0 },
    pages: PAGES.map(([name, txt], i) => ({ name, type: "text", sort: (i + 1) * 100, text: { content: P(txt), format: 1 } })) });
  const arrive = await mkRegion(sc, "⤓ มาจากชั้นล่าง (จุดพัก)", [14, 5, 2, 2], "#3a7bd5");
  const hosp = game.scenes.getName(HOSP);
  if (hosp) {
    const hArr = await mkRegion(hosp, "⤓ มาจากจุดพักเชิงเนิน", [16, 21, 3, 2], "#3a7bd5");
    await mkRegion(sc, "↪ ลงบันได ออกไปหาโรงพยาบาล", [18, 5, 2, 2], "#d58a3a", hArr);
    await mkRegion(hosp, "↪ กลับลงเนินไปโรงเตี๊ยม", [16, 23, 3, 1], "#d58a3a", arrive);
  }
  try { await linkLot(); } catch (e) { console.warn(MOD, "linkLot", e); }
  return sc;
}

// road-chase scene: add the finish note (side street -> rest stop) and retire the "gate = finish line" text
export async function linkRest() {
  if (!game.user.isGM) return;
  const sc = game.scenes.getName(CHASE), key = game.journal.getName("ไล่ล่าบนถนน (DM)");
  if (!sc || !key) return;
  const old = key.pages.find((p) => p.name.startsWith("9 ประตูโรงพยาบาล"));
  if (old) await old.update({ name: "9 ประตูโรงพยาบาล (อย่าเข้า!)", text: { content: P(`ประตูเหล็กกว้าง 4 ช่อง ยามโรงพยาบาลชักปืนมองเข้าถนน ถ้าตี้ขับเข้าไปตรงนี้ = บุกเข้าไปด้วยเสียงดัง (ดู Chapter 3) · ซินดิเคทไม่ไล่ตามเข้าเขตโรงพยาบาล แต่จะไม่ลืม · ตี้ควรเลี้ยวเข้าซอยใต้ (หมายเหตุ 10) ก่อนถึงตรงนี้`), format: 1 } });
  let ten = key.pages.getName("10 ซอยใต้ → จุดพัก (เส้นชัย)");
  if (!ten) [ten] = await key.createEmbeddedDocuments("JournalEntryPage", [{ name: "10 ซอยใต้ → จุดพัก (เส้นชัย)", type: "text", sort: 1000, text: { format: 1, content: P(`ซอยแคบทางใต้ (ช่อง 61–65) ป้ายไม้ "โรงเตี๊ยมนายทหารผ่านศึก" ซินดิเคทถอนตัวเมื่อตี้เลี้ยวเข้าซอย รถปาร์ตี้จอดหลังโรงเตี๊ยม
- กดมาโคร "Chapter 2.6: จุดพักเชิงเนิน" → "1 มาถึงจุดพัก" ทุกคนลงจากรถและย้ายไปชั้นพักอัตโนมัติ`) } }]);
  const ens = key.pages.getName("ศัตรูและการวางตัว");
  if (ens) {
    const c = ens.text.content.replace(/ผู้ขับถอนตัวเมื่อเข้าประตูโรงพยาบาล/g, "ผู้ขับถอนตัวเมื่อตี้เลี้ยวเข้าซอยใต้ (ช่อง 61–65) หรือเมื่อเข้าใกล้ประตูโรงพยาบาล");
    if (c !== ens.text.content) await ens.update({ "text.content": c });
  }
  const oldN = sc.notes.find((n) => /ประตูโรงพยาบาล/.test(n.text ?? ""));
  if (oldN && !/อย่าเข้า/.test(oldN.text)) await oldN.update({ text: "ประตูโรงพยาบาล (อย่าเข้า!)" });
  if (ten && !sc.notes.some((n) => n.entryId === key.id && n.pageId === ten.id))
    await sc.createEmbeddedDocuments("Note", [{ entryId: key.id, pageId: ten.id, x: 63 * G, y: 19.5 * G, text: "ซอยใต้ → จุดพัก (เส้นชัย)", iconSize: 40, fontSize: 24, texture: { src: "icons/svg/book.svg" } }]);
}

const SPOTS = (i) => ({ x: (12 + (i % 6)) * G, y: (4.7 + Math.floor(i / 6)) * G });

async function arrive() {
  const sc = await createRestScene();
  await linkRest();
  const chase = game.scenes.getName(CHASE);
  const pcs = partyActors();
  const ups = [], add = [];
  pcs.forEach((a, i) => { const tk = sc.tokens.find((t) => t.actorId === a.id); if (tk) ups.push({ _id: tk.id, ...SPOTS(i) }); else add.push([a, SPOTS(i)]); });
  if (ups.length) await sc.updateEmbeddedDocuments("Token", ups, { animate: false, teleport: true });
  if (add.length) { const docs = []; for (const [a, pos] of add) docs.push({ ...(await a.getTokenDocument()).toObject(), ...pos }); await sc.createEmbeddedDocuments("Token", docs); }
  // PCs (and riders) leave the chase scene; the vehicle tokens stay parked there
  for (const rs of game.scenes.filter((q) => q.getFlag(MOD, "route") || q === chase)) { const gone = rs.tokens.filter((t) => pcs.some((a) => a.id === t.actorId)).map((t) => t.id); if (gone.length) await rs.deleteEmbeddedDocuments("Token", gone).catch(() => {}); }
  await sc.update({ "environment.darknessLevel": 0.6, "environment.globalLight.enabled": true });
  await sc.activate();
  await ChatMessage.create({ speaker: { alias: "คืนวันที่ 2" }, content: `<div class="rw-card"><div class="rw-title">โรงเตี๊ยมสาขาเชิงเนิน · คืนวันที่ 2</div>
    เสียงปืนเงียบลงเบื้องหลัง ไฟหน้ารถซินดิเคทหายไปตรงหัวถนน คุณเลี้ยวเข้าซอยแคบทางใต้ที่มีป้ายไม้เก่าๆ "โรงเตี๊ยมนายทหารผ่านศึก" เหนือขึ้นไปบนเนินมีอาคารอิฐซีดยืนมืดอยู่ในหมอกบางๆ เจ้าของโรงเตี๊ยมแขนข้างเดียวหยิบกุญแจให้โดยไม่ถามอะไร "ห้องชั้นบนมีห้าห้อง คืนนี้ไม่มีใครมา"</div>` });
  await ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card"><div class="rw-title">DM · จุดพัก คืนวันที่ 2</div>
    เพอร์รี่มาเจอตี้ที่นี่ (เอาธง "later" ออกจากเธอแล้วกด "1 มาถึงจุดพัก" ซ้ำเพื่อดึงเข้าฉาก) · ก่อนพักยาวกดมาโคร "เพอร์รี่: ทอยล่ากลางคืน (ลับ)"<br>
    ตี้ยังไม่ได้พักยาว กด "2 ขึ้นเช้าวันที่ 3" เมื่อทุกคนพร้อมนอน · ข้อมูลอยู่ในบันทึก "${REST_JOURNAL}"</div>` });
  ui.notifications.info("ถึงจุดพักแล้ว · ทุกคนอยู่ที่ทางเดินชั้นพัก");
}

async function morning() {
  const sc = await createRestScene();
  const lines = [];
  for (const a of partyActors()) {
    try {
      try { await a.longRest({ dialog: false, chat: false, newDay: true }); } catch (e) { console.warn(MOD, "rest", e); }
      await a.update({ "system.attributes.hp.value": a.system.attributes.hp.max }, { arkaneInternal: true });   // Temp HP from the dinner is kept (dinner.js puts it back after the rest)
      const d = Number(a.getFlag(MOD, "dread") ?? 0);
      if (d > 0) await a.setFlag(MOD, "dread", d - 1);
      lines.push(`${esc(a.name)}: พักเต็มแล้ว${d > 0 ? ` · Dread ${d} → ${d - 1}` : ""}`);
    } catch (e) { console.warn(MOD, "morning", a.name, e); }
  }
  const old = sc.lights.map((l) => l.id);
  if (old.length) await sc.deleteEmbeddedDocuments("AmbientLight", old);
  await sc.createEmbeddedDocuments("AmbientLight", SUN);
  await sc.update({ "environment.darknessLevel": 0.05, "environment.globalLight.enabled": true });
  await sc.activate();
  await ChatMessage.create({ speaker: { alias: "เช้าวันที่ 3" }, content: `<div class="rw-card"><div class="rw-title">โรงเตี๊ยมสาขาเชิงเนิน · เช้าวันที่ 3</div>
    หมอกบางๆ ลอยอยู่เหนือเนิน กลิ่นกาแฟอ่อนๆ ลอยขึ้นมาจากชั้นล่าง จากหน้าต่างทางเดินคุณเห็นหลังคาโรงพยาบาลเซนต์อัลดริกอยู่ไกลขึ้นไปบนเนิน มีควันบางๆ จากปล่องลอยตรงขึ้นฟ้า ตรงเกินไป เหมือนไม่มีลมมาเลย</div>` });
  await ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card"><div class="rw-title">DM · เช้าวันที่ 3</div>${lines.join("<br>")}<br><br>
    ขั้นต่อไป: ให้ตี้ขึ้นเนินไปสอดแนม (ตารางทอยในบันทึก "${REST_JOURNAL}" หน้า 4) แล้วกดปุ่ม "3 ไปหน้าโรงพยาบาล"</div>` });
  ui.notifications.info("ขึ้นเช้าวันที่ 3 แล้ว · พักยาวทุกคน");
}

async function toHospital() {
  const hosp = game.scenes.getName(HOSP);
  if (!hosp) return ui.notifications.warn("ยังไม่มีฉาก Chapter 3 · กดมาโคร 'สร้าง Chapter 3: โรงพยาบาลทหารผ่านศึก' ก่อน");
  await createRestScene();
  const pcs = partyActors(), rest = game.scenes.getName(REST_SCENE);
  const r = hosp.regions.getName("⤓ มาจากจุดพักเชิงเนิน")?.shapes?.[0];
  const ox = r ? r.x : 16 * G, oy = r ? r.y : 21 * G;
  const ups = [], add = [];
  pcs.forEach((a, i) => {
    const pos = { x: ox + (i % 3) * G, y: oy + Math.floor(i / 3) * G };
    const tk = hosp.tokens.find((t) => t.actorId === a.id);
    if (tk) ups.push({ _id: tk.id, ...pos }); else add.push([a, pos]);
  });
  if (ups.length) await hosp.updateEmbeddedDocuments("Token", ups, { animate: false, teleport: true });
  if (add.length) { const docs = []; for (const [a, pos] of add) docs.push({ ...(await a.getTokenDocument()).toObject(), ...pos }); await hosp.createEmbeddedDocuments("Token", docs); }
  if (rest) { const gone = rest.tokens.filter((t) => pcs.some((a) => a.id === t.actorId)).map((t) => t.id); if (gone.length) await rest.deleteEmbeddedDocuments("Token", gone).catch(() => {}); }
  await hosp.activate();
  ui.notifications.info("ทุกคนอยู่หน้าโรงพยาบาลแล้ว (Chapter 3) · ทางเข้าหลักอยู่ทางเหนือ");
}

export async function restStop() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const r = await D().wait({ window: { title: "Chapter 2.6 · จุดพักเชิงเนิน (ก่อนเข้าโรงพยาบาล)" },
    content: `<div class="rw-form"><p class="rw-hint"><b>0 ไปลานจอด</b>: ย้ายกลุ่มรถไปลานจอดโรงเตี๊ยม (ใช้เมื่อข้ามการไล่ล่า หรือวาร์ปปกติเมื่อถึงซอยใต้แล้ว)<br><b>1 มาถึงจุดพัก</b> (คืนวันที่ 2): ทุกคนลงจากรถ เดินเข้าโรงเตี๊ยม ย้ายไปชั้นพัก · เพอร์รี่เข้าตี้ + ทอยล่ากลางคืน (ลับ) ก่อนนอน<br><b>2 ขึ้นเช้าวันที่ 3</b>: พักยาวทุกคน Dread −1 ฉากเป็นแสงเช้า<br><b>3 ไปหน้าโรงพยาบาล</b>: ย้ายทุกคนไปหน้าประตู Chapter 3 (หลังสอดแนมเสร็จ)</p></div>`,
    buttons: [{ action: "lot", label: "0 ไปลานจอด" }, { action: "arrive", label: "1 มาถึงจุดพัก", default: true }, { action: "morning", label: "2 ขึ้นเช้าวันที่ 3" }, { action: "hosp", label: "3 ไปหน้าโรงพยาบาล" }, { action: "x", label: "ยกเลิก" }], rejectClose: false }).catch(() => null);
  if (r === "lot") return routeWarp();
  if (r === "arrive") return arrive();
  if (r === "morning") return morning();
  if (r === "hosp") return toHospital();
}
