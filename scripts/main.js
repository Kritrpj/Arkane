import { CONTENT } from "./content.js?v=21";
import { registerTimeline, seedTimeline, openTimeline } from "./timeline.js?v=21";
import { createBarScene, createCityScene, createWorldScene, linkBarStairs } from "./scenes.js?v=21";
import { createNpcs } from "./npcs.js?v=21";
import { createPlayers } from "./pcs.js?v=21";
import { levelUp } from "./spells.js?v=21";
import { registerCombatX, throwOil, shove, disengage, clearOil } from "./combatx.js?v=22";
import { registerArmorSwap } from "./gear.js?v=21";
import { registerCover, addBarCover } from "./cover.js?v=21";
import { createBlackMarket } from "./merchant.js?v=21";
import { createTutorial, resetTutorial, startTutorial } from "./tutorial.js?v=21";
import { placeNpcs, clearDistrictLair } from "./placement.js?v=21";
import { createShedScene, linkShed } from "./shed.js?v=21";
import { registerTracker, openCh1Tracker } from "./tracker.js?v=21";
import { registerChTracker, openChTracker } from "./chtracker.js?v=21";
import { createChapter, createAllChapters } from "./chapters.js?v=21";
import { registerActionHud } from "./actions.js?v=22";
import { requestRoll, registerRollPrompt, startChapter1, sendIntros, goToScene, perryHunt } from "./session.js?v=23";
import { setupGmHotbar, initHotbar } from "./hotbar.js?v=21";
import { ensureStoryJournal } from "./story.js?v=21";
import { registerDmNotes, tagDmNotes } from "./notes.js?v=21";
import { registerXp, giveXpDialog } from "./xp.js?v=21";
import { registerMusic, ensureMusic, playTrack, pickTrack } from "./music.js?v=21";
import { registerInventoryLock } from "./lock.js?v=21";
import { registerHandLights, toggleHandLight } from "./light.js?v=21";
import { registerEconomy, balancePrices } from "./economy.js?v=21";
import { partyNote, payCaamReward, joinHeinz } from "./party.js?v=21";
import { heinzFarewell } from "./handoff.js?v=21";
import { registerMoney, giveMoney, openPurse } from "./money.js?v=21";
import { placeStageBlocks } from "./blocks.js?v=21";
import { setShopStage, ensureItemPiles } from "./merchant.js?v=21";
import { registerVehicles, placeVehicle, unloadAll, createVehicles, ram, ridePrompt } from "./vehicle.js?v=23";
import { registerMoveLimit, dash, toggleMoveLimit } from "./movelimit.js?v=21";
import { createChaseScene, placeChase } from "./chase.js?v=21";
import { restStop, linkRest } from "./reststop.js?v=21";
import { registerRoute, routeWarp, createRouteScenes } from "./route.js?v=21";
import { morningDay2, createInnScene, setDistrictTime, toggleDistrictTime, placeWh4Npcs } from "./inn.js?v=21";
import { importLedger, parseLedger, registerImporter, scanImportFolder } from "./importer.js?v=21";
import { setupCurrency, createItems, reload, registerGunFx, fixGuns, testFx, ensureAttack, applyArt } from "./items.js?v=21";
import { createAllCh1, linkCh1, createBigCh1, fixScenes, scaleDialog, applyScale, fixBackgrounds, brightnessDialog, applyBrightness } from "./ch1maps.js?v=21";

const MOD = "arkane-1920s";
const ICON = "icons/svg/terror.svg";

const SYMPTOMS = [
  { n: 1, name: "ฝันร้ายซ้ำ", text: "Long Rest ไม่ลด Dread จนกว่าจะรักษาหาย" },
  { n: 2, name: "กลัวน้ำลึก", text: "Disadvantage ในการทอยเช็กขณะอยู่ใกล้ทะเลหรือน้ำลึก" },
  { n: 3, name: "มือสั่น", text: "Disadvantage ในการโจมตีครั้งแรกของแต่ละการต่อสู้" },
  { n: 4, name: "หูแว่ว", text: "Disadvantage ใน Wisdom (Perception) ที่ใช้การฟัง" },
  { n: 5, name: "หวาดระแวง", text: "ไม่ได้ Advantage จาก Help ของเพื่อน" },
  { n: 6, name: "ได้ยินเสียงเรียก", text: "Disadvantage ในเซฟ Wisdom ครั้งถัดไปที่เกี่ยวกับสิ่งลี้ลับ (ระบบใส่ให้อัตโนมัติ)" }
];

const LEVELS = [
  { dc: 10, label: "รบกวนจิตใจ", ex: "ศพที่ตายผิดธรรมชาติ ของเหลวสีดำ สัญลักษณ์ลัทธิ" },
  { dc: 13, label: "น่าสะพรึง", ex: "เห็นลูกสมุนเต็มตา คนรู้จักกลายร่างต่อหน้า" },
  { dc: 16, label: "เกินจะรับไหว", ex: "นิมิตจากห้วงนิทรา ส่วนหนึ่งของร่างจริง" }
];

const CLOCK_STAGES = [
  { to: 3, text: "ฝันร้ายคล้ายกันแพร่ในเมืองท่า ลูกสมุนเคลื่อนไหวเงียบๆ" },
  { to: 6, text: "เครื่องตรวจจับเวทส่งสัญญาณผิดพลาดบ่อย คนหายตัวมากขึ้น ลัทธิกล้าเคลื่อนไหวมากขึ้น" },
  { to: 9, text: "ลูกสมุนโผล่ในที่สาธารณะ C.A.A.M. ต้องปิดข่าวหนัก DC เซฟหวาดผวา +2" },
  { to: 11, text: "มหาสมุทรอาร์คานุมผิดปกติ ผู้คนในเมืองชายฝั่งเสียสติเป็นกลุ่ม" },
  { to: 12, text: "Cthulhu ตื่นเต็มตัว แคมเปญจบแบบหายนะ" }
];

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const DialogV2 = () => foundry.applications?.api?.DialogV2;

/* ---------- helpers ---------- */
function pcs() {
  return game.actors.filter((a) => a.type === "character" && a.hasPlayerOwner);
}
function getDread(a) { return Number(a.getFlag(MOD, "dread") ?? 0); }
function symptomEffects(a) { return a.effects.filter((e) => e.getFlag(MOD, "symptom")); }
function wisSave(a) {
  const ab = a.system?.abilities?.wis;
  if (!ab) return 0;
  const s = ab.save;
  if (typeof s === "number") return s;
  if (s && typeof s === "object" && typeof s.value === "number") return s.value;
  return ab.mod ?? 0;
}
function clock() { return Number(game.settings.get(MOD, "clock") ?? 3); }
function stageText(v) { return (CLOCK_STAGES.find((s) => v <= s.to) ?? CLOCK_STAGES.at(-1)).text; }
function gmOnly() {
  if (game.user.isGM) return true;
  ui.notifications.warn("เครื่องมือนี้ใช้ได้เฉพาะ DM");
  return false;
}
function gmIds() { return game.users.filter((u) => u.isGM).map((u) => u.id); }

/* ---------- fear check ---------- */
async function fearCheck() {
  if (!gmOnly()) return;
  const D = DialogV2();
  if (!D) return ui.notifications.error("ต้องใช้ Foundry v12 ขึ้นไป");
  const selected = canvas?.tokens?.controlled?.map((t) => t.actor).filter((a) => a && a.type === "character") ?? [];
  const pool = selected.length ? selected : pcs();
  if (!pool.length) return ui.notifications.warn("ไม่พบตัวละครผู้เล่น เลือก Token หรือกำหนดเจ้าของให้ตัวละครก่อน");
  const bump = clock() >= 7 ? 2 : 0;
  const content = `<div class="rw-form">
    <p class="rw-hint">ตัวละครเห็นอะไร${bump ? ` <b>(นาฬิกาห้วงนิทราช่อง ${clock()}: DC +2)</b>` : ""}</p>
    ${LEVELS.map((l, i) => `<label class="rw-radio"><input type="radio" name="lvl" value="${i}" ${i === 1 ? "checked" : ""}>
      <span><b>${l.label}</b> DC ${l.dc + bump}<br><small>${l.ex}</small></span></label>`).join("")}
    <p class="rw-hint" style="margin-top:8px">ใครต้องทอย</p>
    ${pool.map((a) => `<label class="rw-check"><input type="checkbox" name="a" value="${a.id}" checked> ${esc(a.name)} <small>(Dread ${getDread(a)}/3)</small></label>`).join("")}
    <label class="rw-check" style="margin-top:6px"><input type="checkbox" name="fright" checked> ใส่สถานะ Frightened ให้คนที่พลาด ถ้าอยู่ในการต่อสู้</label>
  </div>`;
  const res = await D.wait({
    window: { title: "ตรวจความหวาดผวา" },
    content,
    buttons: [
      { action: "roll", label: "ทอยเซฟ Wisdom", default: true, callback: (ev, btn) => {
        const f = btn.form;
        return { lvl: Number(f.querySelector("input[name=lvl]:checked")?.value ?? 1),
                 ids: [...f.querySelectorAll("input[name=a]:checked")].map((i) => i.value),
                 fright: f.querySelector("input[name=fright]")?.checked };
      } },
      { action: "cancel", label: "ยกเลิก" }
    ],
    rejectClose: false
  });
  if (!res || res === "cancel" || !res.ids?.length) return;
  const dc = LEVELS[res.lvl].dc + bump;
  for (const id of res.ids) {
    const a = game.actors.get(id) ?? pool.find((x) => x.id === id);
    if (a) await rollOne(a, dc, LEVELS[res.lvl].label, res.fright);
  }
}

async function rollOne(actor, dc, label, fright) {
  const bonus = wisSave(actor);
  const voices = actor.getFlag(MOD, "voices");
  const formula = `${voices ? "2d20kl" : "1d20"} + ${bonus}`;
  const roll = await new Roll(formula).evaluate();
  const ok = roll.total >= dc;
  const lines = [`<b>${label}</b> · DC ${dc}${voices ? " · <i>เสียงเรียกทำให้ทอย Disadvantage</i>" : ""}`];
  if (voices) await actor.unsetFlag(MOD, "voices");

  if (ok) {
    lines.push(`<span class="rw-ok">สำเร็จ</span> ตั้งสติได้`);
  } else {
    let dread = getDread(actor) + 1;
    lines.push(`<span class="rw-bad">พลาด</span> Dread ${Math.min(dread, 3)}/3`);
    if (fright && game.combat?.started && game.combat.combatants.some((c) => c.actor?.id === actor.id)) {
      try { await actor.toggleStatusEffect?.("frightened", { active: true }); lines.push("ติด Frightened (DM ถอดออกเมื่อจบเทิร์นถัดไปของเขา)"); } catch (e) { console.warn(MOD, e); }
    }
    if (dread >= 3) {
      dread = 0;
      const have = symptomEffects(actor);
      if (have.length >= 3) {
        lines.push(`<span class="rw-bad">ได้อาการที่ 4: ตัวละครเสียสติ</span> คุยกับผู้เล่นว่าจะเกษียณ หรือกลายเป็น NPC ที่ลัทธิดึงไป`);
      } else {
        const d6 = await new Roll("1d6").evaluate();
        const s = SYMPTOMS[d6.total - 1];
        await actor.createEmbeddedDocuments("ActiveEffect", [{
          name: `อาการ: ${s.name}`, img: ICON, icon: ICON, description: s.text, transfer: false,
          flags: { [MOD]: { symptom: s.n } }
        }]);
        if (s.n === 6) await actor.setFlag(MOD, "voices", true);
        lines.push(`ครบ 3 แต้ม ทอย d6 ได้ ${d6.total}: <b>${s.name}</b><br><small>${s.text}</small>`);
      }
    }
    await actor.setFlag(MOD, "dread", dread);
  }
  await roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor }),
    flavor: `<div class="rw-card"><div class="rw-title">ความหวาดผวา</div>${lines.join("<br>")}</div>`
  });
}

/* ---------- clock ---------- */
function clockHtml(v) {
  const cells = Array.from({ length: 12 }, (_, i) => `<span class="${i < v ? "on" : ""}">${i + 1}</span>`).join("");
  return `<div class="rw-form"><div class="rw-clock">${cells}</div>
    <p><b>ช่อง ${v}/12</b>: ${stageText(v)}</p>
    <p class="rw-hint">+1 เมื่อมีคนตายจำนวนมาก ลัทธิทำพิธีสำเร็จ หรือหยุดการสังเวยไม่ทัน · +2 เมื่อความขัดแย้งใหญ่ปะทุ · −1 เมื่อผู้เล่นผนึก ตัดแหล่งความสูญเสีย หรือทำลายแท่นบูชา</p></div>`;
}
async function clockDialog() {
  if (!gmOnly()) return;
  const D = DialogV2();
  if (!D) return;
  for (;;) {
    const v = clock();
    const act = await D.wait({
      window: { title: "นาฬิกาห้วงนิทรา (DM เท่านั้น)" },
      content: clockHtml(v),
      buttons: [
        { action: "down", label: "−1" },
        { action: "up", label: "+1" },
        { action: "up2", label: "+2" },
        { action: "close", label: "ปิด", default: true }
      ],
      rejectClose: false
    });
    if (!act || act === "close") return;
    const nv = Math.max(0, Math.min(12, v + (act === "down" ? -1 : act === "up" ? 1 : 2)));
    await game.settings.set(MOD, "clock", nv);
    ChatMessage.create({ whisper: gmIds(), content: `<div class="rw-card"><div class="rw-title">นาฬิกาห้วงนิทรา</div>${v} → <b>${nv}</b>/12<br>${stageText(nv)}</div>` });
    if (nv >= 12) ui.notifications.error("นาฬิกาห้วงนิทราครบ 12 ช่อง: Cthulhu ตื่นเต็มตัว");
  }
}

/* ---------- status & rest ---------- */
async function dreadStatus() {
  if (!gmOnly()) return;
  const rows = pcs().map((a) => {
    const sy = symptomEffects(a).map((e) => e.name.replace("อาการ: ", "")).join(", ") || "–";
    return `<tr><td>${esc(a.name)}</td><td>${getDread(a)}/3</td><td>${esc(sy)}</td></tr>`;
  }).join("");
  ChatMessage.create({ whisper: gmIds(), content: `<div class="rw-card"><div class="rw-title">สถานะหวาดผวา · นาฬิกา ${clock()}/12</div>
    <table class="rw-table"><tr><th>ตัวละคร</th><th>Dread</th><th>อาการ</th></tr>${rows || '<tr><td colspan="3">ยังไม่มีตัวละครผู้เล่น</td></tr>'}</table></div>` });
}

async function lowerDread(actor, reason) {
  const nightmares = symptomEffects(actor).some((e) => e.getFlag(MOD, "symptom") === 1);
  const d = getDread(actor);
  if (d <= 0) return null;
  if (nightmares) return `${esc(actor.name)}: ฝันร้ายซ้ำ Dread ไม่ลด (${d}/3)`;
  await actor.setFlag(MOD, "dread", d - 1);
  return `${esc(actor.name)}: Dread ${d} → ${d - 1} (${reason})`;
}

async function restDread() {
  if (!gmOnly()) return;
  const selected = canvas?.tokens?.controlled?.map((t) => t.actor).filter((a) => a?.type === "character") ?? [];
  const list = selected.length ? selected : pcs();
  const out = [];
  for (const a of list) { const r = await lowerDread(a, "ลดด้วยมือ"); if (r) out.push(r); }
  ChatMessage.create({ whisper: gmIds(), content: `<div class="rw-card"><div class="rw-title">ลด Dread</div>${out.join("<br>") || "ไม่มีใครมี Dread ให้ลด"}</div>` });
}

/* ---------- setup ---------- */
async function folder(name, type) {
  return game.folders.find((f) => f.name === name && f.type === type) ?? Folder.create({ name, type, color: "#9A6B2C" });
}
function applyHotbarHide() { try { document.body.classList.toggle("arkane-player", !game.user.isGM); } catch {} try { document.body.classList.toggle("arkane-argon-theme", game.settings.get(MOD, "argonTheme")); } catch {} try { document.body.classList.toggle("arkane-hide-hotbar", !game.user.isGM && game.settings.get(MOD, "hideHotbar")); } catch {} try { document.body.classList.toggle("arkane-hide-wsets", game.settings.get(MOD, "hideWeaponSets")); } catch {} }
async function journal(name, pages, ownership, fid) {
  if (game.journal.getName(name)) return;
  await JournalEntry.create({
    name, folder: fid, ownership: { default: ownership },
    pages: pages.map((p, i) => ({ name: p.name, type: "text", sort: (i + 1) * 100, text: { content: p.html, format: 1 } }))
  });
}
async function setup() {
  if (!game.user.isGM) return;
  const L = CONST.DOCUMENT_OWNERSHIP_LEVELS;
  try {
    const jf = await folder("Arkane 1920s", "JournalEntry");
    await journal("Player Primer", CONTENT.primer, L.OBSERVER, jf?.id);
    await journal("World Bible (DM เท่านั้น)", CONTENT.bible, L.NONE, jf?.id);
    await journal("Arkane 1920s: วิธีใช้ใน Foundry", CONTENT.guide, L.NONE, jf?.id);
  } catch (e) { console.error(MOD, "journal setup", e); ui.notifications.warn("สร้างเจอร์นัลไม่สำเร็จ ดู Console (F12)"); }
  try {
    if (!game.tables.getName("อาการหวาดผวา")) {
      const tf = await folder("Arkane 1920s", "RollTable");
      const T = CONST.TABLE_RESULT_TYPES?.TEXT ?? "text";
      await RollTable.create({
        name: "อาการหวาดผวา", formula: "1d6", replacement: true, folder: tf?.id, img: ICON,
        results: SYMPTOMS.map((s) => ({ type: T, range: [s.n, s.n], weight: 1, img: ICON,
          name: s.name, text: `${s.name}: ${s.text}`, description: `${s.name}: ${s.text}` }))
      });
    }
  } catch (e) { console.error(MOD, "table setup", e); }
  try {
    const mf = await folder("Arkane 1920s", "Macro");
    const macros = [
      ["ตรวจความหวาดผวา", "game.arkane.fearCheck();"],
      ["นาฬิกาห้วงนิทรา", "game.arkane.clockDialog();"],
      ["สถานะหวาดผวา", "game.arkane.dreadStatus();"],
      ["ลด Dread", "game.arkane.restDread();"],
      ["สร้างฉาก: บาร์ The Rusty Wand", "game.arkane.createBarScene();"],
      ["สร้างฉาก: แผนที่เมืองอาร์คเคน", "game.arkane.createCityScene();"],
      ["สร้างฉาก: แผนที่โลก Earth-Prime", "game.arkane.createWorldScene();"]
    ];
    for (const [name, command] of macros) {
      if (!game.macros.getName(name)) await Macro.create({ name, type: "script", command, img: ICON, folder: mf?.id });
    }
  } catch (e) { console.error(MOD, "macro setup", e); }
  await game.settings.set(MOD, "setupDone", true);
  ui.notifications.info("Arkane 1920s: สร้างเจอร์นัล ตาราง และมาโครเรียบร้อย ดูในโฟลเดอร์ Arkane 1920s");
}

/* ---------- hooks ---------- */
Hooks.once("setup", () => { try { setupCurrency(); } catch (e) { console.error(MOD, "currency", e); } });
Hooks.once("init", () => {
  console.log("Arkane 1920s | init v" + (game.modules.get(MOD)?.version ?? "?"));
  game.settings.register(MOD, "hideHotbar", { name: "ซ่อนแถบมาโครของผู้เล่น (ใช้ Argon HUD แทน)", hint: "ผู้เล่นจะไม่เห็นแถบมาโครด้านล่างจอ GM ยังเห็นตามปกติ · มาโครยังอยู่ในแถบที่ซ่อน", scope: "world", config: true, type: Boolean, default: true, onChange: () => applyHotbarHide() });
  game.settings.register(MOD, "argonTheme", { name: "ธีมสี Argon HUD ของเกม Arkane", hint: "ติ๊กออกเพื่อกลับไปใช้สีเดิมของ Argon (ใช้ตอนไล่หาสาเหตุถ้า HUD มีปัญหา)", scope: "world", config: true, type: Boolean, default: true, onChange: () => applyHotbarHide() });
  game.keybindings.register(MOD, "bag", { name: "เปิดกระเป๋า (Arkane)", hint: "เปิดหน้าต่างกระเป๋าของตัวละครที่เลือกอยู่ (หรือตัวละครของผู้เล่น)", editable: [{ key: "KeyB" }], onDown: () => { import("./bag.js?v=21").then((x) => x.openBag()).catch((e) => console.warn(MOD, "bag", e)); return true; } });
  game.settings.register(MOD, "reactionMode", { name: "ระบบ Reaction อัตโนมัติ (โจมตีสวน / Shield)", hint: "ถาม = ขึ้นหน้าต่างถามเจ้าของตัวละคร · อัตโนมัติ = ใช้ทันทีไม่ถาม · ปิด = เหลือแค่ปุ่มในแชต", scope: "world", config: true, type: String, default: "prompt", choices: { prompt: "ถามเจ้าของก่อนใช้", auto: "อัตโนมัติ ไม่ถาม", off: "ปิด (ปุ่มในแชตเท่านั้น)" } });
  game.settings.register(MOD, "sheetMode", { name: "ผู้เล่นกดเปิดชีตตัวละคร → เปิดกระเป๋า Arkane แทน", hint: "bag = ผู้เล่นเปิดชีตเดิม (Tidy/dnd5e) ไม่ได้ จะเด้งเป็นกระเป๋าแทน (GM เปิดชีตได้ตามปกติ) · off = เปิดชีตเดิมได้ตามปกติ", scope: "world", config: true, type: String, choices: { bag: "bag — ใช้กระเป๋า Arkane แทน", off: "off — เปิดชีตเดิมได้" }, default: "bag" });
  game.settings.register(MOD, "hideWeaponSets", { name: "ซ่อนแถบชุดอาวุธของ Argon (ใช้กระเป๋าแทน)", hint: "แถบช่องอาวุธเล็กๆ เหนือปุ่ม ACTION ใน HUD · ปิดไว้แล้ว HUD จะแสดงอาวุธที่ใส่ในช่องอาวุธ/มืออีกข้างของกระเป๋า (กด B) ติ๊กออกเพื่อเอาแถบกลับมา", scope: "world", config: true, type: Boolean, default: true, onChange: () => applyHotbarHide() });
  game.settings.register(MOD, "slotsInit", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register(MOD, "equipSimplified", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register(MOD, "clock", { scope: "world", config: false, type: Number, default: 3 });
  game.settings.register(MOD, "setupDone", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register(MOD, "brightness", { scope: "world", config: false, type: String, default: "mid" });
  game.settings.register(MOD, "mapScale", { scope: "world", config: false, type: Number, default: 2 });
  game.settings.register(MOD, "npcsDone", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register(MOD, "gunSounds", { name: "เสียงปืนอัตโนมัติ", hint: "เล่นเสียงยิงเมื่อทอยโจมตีด้วยปืนของ Arkane และเสียงบรรจุกระสุน", scope: "world", config: true, type: Boolean, default: true });
  game.settings.register(MOD, "autoRange", { name: "คิดระยะยิงอัตโนมัติ", hint: "เกินระยะปกติ = Disadvantage, เกินระยะไกลสุด = ยิงไม่ได้, ศัตรูประชิด 5 ฟุต = Disadvantage (ต้องกด T เลือกเป้าก่อน)", scope: "world", config: true, type: Boolean, default: true });
  game.settings.register(MOD, "autoDamage", { name: "ยิงโดนแล้วทอยดาเมจและลดเลือดเอง", hint: "เมื่อทอยโจมตีด้วยปืนโดนเป้า (กด T) ระบบจะทอย Damage และหักเลือดเป้าให้อัตโนมัติ", scope: "world", config: true, type: Boolean, default: true });
  game.settings.register(MOD, "skipDialog", { name: "ยิงปืนไม่ต้องขึ้นหน้าต่าง Attack Roll", hint: "กดยิงแล้วทอยทันที (ระบบใส่ Disadvantage ให้เองตามระยะ) ปิดถ้าอยากเลือก Advantage/โบนัสเอง", scope: "world", config: true, type: Boolean, default: true });
  registerGunFx();
  registerActionHud();
  registerDmNotes();
  registerXp();
  registerMusic();
  registerInventoryLock();
  registerHandLights();
  registerEconomy();
  registerArmorSwap();
  game.settings.register(MOD, "autoCover", { name: "คิดที่กำบังอัตโนมัติ", hint: "ตอนโจมตีเป้าที่กด T ไว้ ระบบดูกำแพง คน และ Region ชื่อ \"ที่กำบัง...\" ที่ขวางอยู่ แล้วหักทอยโจมตี −2 / −5 หรือห้ามยิงถ้ามิดตัว", scope: "world", config: true, type: Boolean, default: true });
  registerCover();
  import("./stealth.js?v=21").then((x) => x.registerStealth()).catch((e) => console.warn(MOD, "stealth", e));
  import("./rest.js?v=21").then((x) => x.registerRest()).catch((e) => console.warn(MOD, "rest", e));
  registerTracker();
  registerChTracker();
  registerRoute();
  registerImporter();
  game.settings.register(MOD, "contentVer", { scope: "world", config: false, type: Number, default: 0 });
  game.settings.register(MOD, "shedDone", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register(MOD, "npcsPlaceVer", { scope: "world", config: false, type: Number, default: 0 });
  game.settings.register(MOD, "npcsPlaced", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register(MOD, "tutorialDone", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register(MOD, "itemsDone", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register(MOD, "moveLimit", { name: "บังคับระยะเดินใน combat", hint: "ผู้เล่นเดินเกินความเร็วในเทิร์นของตัวเองไม่ได้ และเดินนอกเทิร์นไม่ได้ (GM ไม่ถูกจำกัด)", scope: "world", config: true, type: Boolean, default: true });
  game.settings.register(MOD, "shopStage", { scope: "world", config: false, type: Number, default: 2 });
  game.settings.register(MOD, "perryReady", { scope: "world", config: false, type: Boolean, default: false });
  game.settings.register(MOD, "mapsDone", { scope: "world", config: false, type: Boolean, default: false });
  registerTimeline();
  game.arkane = { bag: (a) => import("./bag.js?v=21").then((x) => x.openBag(a)), equipAll: () => import("./hudtext.js?v=21").then((m) => m.simplifyEquip()).then(() => import("./bag.js?v=21")).then((b) => b.autoSlotAll()).then((n) => ui.notifications.info(`ปิด Auto Equip ของ Argon และจัดช่องสวมใส่ให้ตัวละคร ${n} คน`)), weaponSets: (o) => import("./hudtext.js?v=21").then((m) => m.ensureWeaponSets(o)).then((n) => ui.notifications.info(`จัดชุดอาวุธบน HUD ${n} ตัวละคร`)), throwOil, shove, disengage, clearOil, combatFeats: () => import("./combatx.js?v=22").then((x) => x.ensureCombatFeats()).then((n) => ui.notifications.info(`ใส่ปุ่มต่อสู้ ${n} รายการ`)), applyProfessions: (o) => import("./professions.js?v=21").then((x) => x.applyProfessions(o)), restoreKit: () => import("./session.js?v=23").then((x) => x.restoreKit()), sendHeinzWait: () => import("./session.js?v=23").then((x) => x.sendHeinzWait()), skillIcons: (f) => import("./skillicons.js?v=21").then((x) => x.applySkills(f)), routeWarp, createRouteScenes, chTracker: openChTracker, restStop, perryHunt, ridePrompt, ram, ensureItemPiles, createChaseScene, placeChase, openPurse, dash, toggleMoveLimit, placeVehicle, unloadAll, createVehicles, placeStageBlocks, setShopStage, pickTrack, playTrack, giveMoney, setDistrictTime, toggleDistrictTime, placeWh4Npcs, joinHeinz, partyNote, payCaamReward, linkInn: () => import("./inn.js?v=21").then((x) => x.linkInn()), heinzFarewell, morningDay2, createInnScene, goToScene, balancePrices, toggleLight: () => toggleHandLight(), sendIntros: () => sendIntros().then((m) => ui.notifications.info(m.replace(/<[^>]+>/g, ""))), giveXp: giveXpDialog, openStory: async () => (await ensureStoryJournal())?.sheet?.render(true) ?? game.journal.getName("เนื้อเรื่องผู้เล่น (DM)")?.sheet?.render(true), ensureStoryJournal, startTutorial, setupGmHotbar, requestRoll, startChapter1, fearCheck, clockDialog, dreadStatus, restDread, setup, timeline: openTimeline, createBarScene, createCityScene, createWorldScene, createAllCh1: () => createAllCh1(createBarScene), linkCh1, createBigCh1, fixScenes, scaleDialog, applyScale, fixBackgrounds, brightnessDialog, applyBrightness, createNpcs, createItems, reload, setupCurrency, fixGuns, testFx, createPlayers, applyArt, levelUp, linkBarStairs, addBarCover, createBlackMarket, createTutorial, resetTutorial, placeNpcs, createShedScene, linkShed, ch1Tracker: openCh1Tracker, createChapter, createAllChapters, importLedger, parseLedger, scanImportFolder };
  game.rustyWand = game.arkane;
});

Hooks.once("ready", async () => {
  try {   // Windows: new backstory + portrait (one time), same party/stats
    if (game.user.isGM) {
      const w = game.actors.find((x) => x.type === "character" && x.getFlag(MOD, "pc") === "windows");
      if (w && w.getFlag(MOD, "bioV") !== 2) {
        const { PCS_BIO } = await import("./pcs.js?v=21");
        const bio = PCS_BIO?.windows;
        if (bio) await w.update({ "system.details.biography.value": bio, img: `modules/${MOD}/pcs/windows.webp`, "prototypeToken.texture.src": `modules/${MOD}/pcs/windows-token.webp` });
        for (const t of game.scenes.contents.flatMap((sc) => sc.tokens.filter((tk) => tk.actorId === w.id))) await t.update({ "texture.src": `modules/${MOD}/pcs/windows-token.webp` }).catch(() => {});
        await w.setFlag(MOD, "bioV", 2);
      }
    }
  } catch (e) { console.warn(MOD, "windows update", e); }
  try {   // repair Dr. Heinz: find by flag or name, English name, "later" until he joins, and no token in the inn rooms before then
    if (game.user.isGM) {
      const NM = "Dr. Heinz Doofenshmirtz";
      for (const a of game.actors.filter((x) => x.type === "character" && (x.getFlag(MOD, "pc") === "heinz" || /heinz|ไฮนซ์|ไฮนช์|ดูเฟน/i.test(x.name)))) {
        if (a.getFlag(MOD, "pc") !== "heinz") await a.setFlag(MOD, "pc", "heinz");
        if (a.name !== NM) await a.update({ name: NM, "prototypeToken.name": NM });
        if (!a.getFlag(MOD, "joined") && !a.getFlag(MOD, "later")) await a.setFlag(MOD, "later", true);
        if (!a.getFlag(MOD, "joined")) { const sc = game.scenes.getName("Chapter 1: โรงเตี๊ยม ชั้นพัก (ห้องแยก)"); const ids = sc?.tokens.filter((t) => t.actorId === a.id).map((t) => t.id) ?? []; if (ids.length) await sc.deleteEmbeddedDocuments("Token", ids); }
      }
    }
  } catch (e) { console.warn(MOD, "heinz repair", e); }
  import("./skillicons.js?v=21").then((x) => x.registerSkills()).catch((e) => console.warn(MOD, "skills", e));
  console.log("Arkane 1920s | ready");
  try { registerRollPrompt(); } catch (e) { console.warn(MOD, "rollprompt", e); }
  try { registerMoney(); } catch (e) { console.warn(MOD, "money", e); }
  try { registerMoveLimit(); } catch (e) { console.warn(MOD, "moveLimit", e); }
  applyHotbarHide();
  import("./hudtext.js?v=21").then((x) => x.registerHudText()).catch((e) => console.warn(MOD, "hudtext", e));
  import("./chatcards.js?v=21").then((x) => x.registerChatCards()).catch((e) => console.warn(MOD, "chatcards", e));
  import("./bag.js?v=21").then((x) => x.registerBag()).catch((e) => console.warn(MOD, "bag", e));
  // Argon HUD: show it automatically whenever a token is selected, on every client (client-scope setting, so each browser sets its own)
  try { if (game.modules.get("enhancedcombathud")?.active && game.settings.settings.has("enhancedcombathud.alwaysOn") && !game.settings.get("enhancedcombathud", "alwaysOn")) game.settings.set("enhancedcombathud", "alwaysOn", true); } catch (e) { console.warn(MOD, "argon alwaysOn", e); }
  // same as pressing the "Toggle Argon Combat HUD" button: the HUD then follows whichever token is selected
  setTimeout(() => { try { if (game.modules.get("enhancedcombathud")?.active && ui.ARGON && !ui.ARGON.enabled) ui.ARGON.toggle(true); } catch (e) { console.warn(MOD, "argon toggle", e); } }, 1500);
  try { registerCombatX(); } catch (e) { console.warn(MOD, "combatx", e); }
  try { registerVehicles(); } catch (e) { console.warn(MOD, "vehicles", e); }
  if (!game.user.isGM) return;
  setTimeout(() => ensureItemPiles(true).catch(() => {}), 3000);
  try { if (!game.settings.get(MOD, "setupDone")) await setup(); } catch (e) { console.error(MOD, "setup", e); }
  try { await seedTimeline(); } catch (e) { console.error(MOD, "timeline", e); }
  try {   // v4.5: painted icons for the Chapter 2 loot piles (existing actors + tokens)
    const PL = [[/ตู้เซฟห้องทำงาน/, "pile-safe"], [/ตู้คอนเทนเนอร์เปิด/, "pile-container"], [/หีบของวิเศษของรอสโซ|ของของรอสโซ/, "pile-rosso"], [/^ตู้เอกสาร/, "pile-cabinet"], [/^ตู้ยา/, "pile-medcab"], [/ช่องลับใต้พรม/, "pile-rug"], [/ลังไดนาไมต์/, "pile-dynamite"], [/กล่องเครื่องมือเหมือง/, "pile-toolbox"], [/แท่นบูชา/, "pile-altar"]];
    const icon = (n) => { const k = PL.find(([re]) => re.test(n ?? ""))?.[1]; return k ? `modules/${MOD}/items/${k}.webp` : null; };
    for (const ac of game.actors) { const s = icon(ac.name); if (s && (ac.img !== s || ac.prototypeToken.texture.src !== s)) await ac.update({ img: s, "prototypeToken.texture.src": s }); }
    for (const sc of game.scenes) { const ups = sc.tokens.filter((t) => { const s = icon(t.name); return s && t.texture.src !== s; }).map((t) => ({ _id: t._id ?? t.id, "texture.src": icon(t.name) })); if (ups.length) await sc.updateEmbeddedDocuments("Token", ups); }
  } catch (e) { console.warn(MOD, "pile art", e); }
  try {   // v4.6: painted portraits + tokens for the Chapter 2-4 NPCs (actors made earlier with placeholder art)
    const KEYS = ["rosso", "gunman", "captain", "director", "orderly", "nurse", "tommy", "machine", "cultist", "zealot", "fogspawn", "tentacle", "herald"];
    for (const ac of game.actors) {
      const k = ac.getFlag(MOD, "npc"); if (!KEYS.includes(k) || ac.getFlag(MOD, "artVer") === 1) continue;
      const img = `modules/${MOD}/npcs/${k}.webp`, tok = `modules/${MOD}/npcs/${k}-token.webp`;
      await ac.update({ img, "prototypeToken.texture.src": tok, [`flags.${MOD}.artVer`]: 1 });
      for (const sc of game.scenes) { const ups = sc.tokens.filter((t) => t.actorId === ac.id).map((t) => ({ _id: t.id, "texture.src": tok })); if (ups.length) await sc.updateEmbeddedDocuments("Token", ups); }
    }
  } catch (e) { console.warn(MOD, "npc art", e); }
  try {   // v4.4: rename macros / chase scene to the new chapter numbering (before the macro list below creates anything)
    for (const [a, b] of [["เช้าวันที่ 2 (โรงเตี๊ยม ห้องแยก)", "Chapter 2: เช้าวันที่ 2 (โรงเตี๊ยม)"], ["สร้างฉากไล่ล่าบนถนน (Ch2→3)", "Chapter 2.5: สร้างฉากไล่ล่า"], ["วางรถและศัตรูในฉากไล่ล่า", "Chapter 2.5: วางรถและศัตรู"], ["โกดัง 4: วาง NPC ที่ยืนรอ", "Chapter 2: โกดัง 4 วาง NPC"], ["ไฮนซ์เข้าตี้", "Chapter 2: ไฮนซ์เข้าตี้"]]) { const m = game.macros.getName(a); if (m && !game.macros.getName(b)) await m.update({ name: b }); }
    const sc = game.scenes.getName("Chapter 2→3: ไล่ล่าบนถนน (ขับรถยิงกัน)"); if (sc) await sc.update({ name: "Chapter 2.5: ไล่ล่าบนถนน (ขับรถยิงกัน)" });
  } catch (e) { console.warn(MOD, "rename", e); }
  try {
    const mf = game.folders.find((f) => f.name === "Arkane 1920s" && f.type === "Macro");
    for (const [name, command] of [["สวมอาวุธ+เกราะให้ทุกคน และปิด Auto Equip (Argon)", "game.arkane.equipAll();"], ["จัดชุดอาวุธบน HUD ให้ทุกคน (Argon)", "game.arkane.weaponSets({ force: true });"], ["ขว้างตะเกียงน้ำมัน", "game.arkane.throwOil();"], ["ผลัก (Shove)", "game.arkane.shove();"], ["ถอยตัว (Disengage)", "game.arkane.disengage();"], ["ล้างวงไฟน้ำมัน", "game.arkane.clearOil();"], ["ใส่ปุ่มต่อสู้ให้ตัวละคร (ขว้างน้ำมัน/ผลัก/ถอยตัว)", "game.arkane.combatFeats();"], ["ใส่ชุดความสามารถตามอาชีพ+คลาส (ทุกคน เลเวล 2)", "game.arkane.applyProfessions();"], ["คืนของเริ่มต้น (ตัวละครที่เลือก / ไฮนซ์)", "game.arkane.restoreKit();"], ["ส่งข้อความรอที่แผงฟินช์ให้ผู้เล่นไฮนซ์", "game.arkane.sendHeinzWait();"], ["ใส่รูปและคำอธิบายสกิล", "game.arkane.skillIcons(true);"], ["พาผู้เล่นไปฉาก", "game.arkane.goToScene();"], ["วางรถลงฉาก (เก๋ง / รถตู้)", "game.arkane.placeVehicle();"], ["กระเป๋าเงิน (ลากเหรียญ)", "game.arkane.openPurse();"], ["แก้ร้านฟินช์ขึ้น Free (ตั้งค่า Item Piles)", "game.arkane.ensureItemPiles();"], ["Chapter 2.5: สร้างฉากไล่ล่า", "game.arkane.createChaseScene().then(s => s?.view());"], ["Chapter 2.5: วางรถและศัตรู", "game.arkane.placeChase();"], ["Chapter 2.6: จุดพักเชิงเนิน", "game.arkane.restStop();"], ["Chapter 2.5: วาร์ปไล่ล่า", "game.arkane.routeWarp();"], ["Chapter 2: ตัวช่วย DM", "game.arkane.chTracker('2');"], ["Chapter 2.5–2.6: ตัวช่วย DM (ไล่ล่า+จุดพัก)", "game.arkane.chTracker('25');"], ["Chapter 3: ตัวช่วย DM", "game.arkane.chTracker('3');"], ["Chapter 4: ตัวช่วย DM", "game.arkane.chTracker('4');"], ["วิ่ง (Dash) / เร่งเครื่อง", "game.arkane.dash();"], ["พุ่งชน (รถ)", "game.arkane.ram();"], ["ขึ้น/ลงรถ (เลือกที่นั่ง)", "game.arkane.ridePrompt();"], ["เปิด/ปิดจำกัดระยะเดินใน combat", "game.arkane.toggleMoveLimit();"], ["ให้ทุกคนลงจากรถ", "game.arkane.unloadAll();"], ["ส่งเงินให้เพื่อน", "game.arkane.giveMoney();"], ["เล่นเพลงประกอบ (เลือกเอง)", "game.arkane.pickTrack();"], ["วางด่าน C.A.A.M. + แผงฟินช์ + ประตูเหล็ก", "game.arkane.placeStageBlocks();"], ["ร้านฟินช์: ตั้งด่านสินค้า", "game.arkane.setShopStage();"], ["Chapter 2: เช้าวันที่ 2 (โรงเตี๊ยม)", "game.arkane.morningDay2();"], ["ไฮนซ์ลาตี้ (ส่งต่อ Perry)", "game.arkane.heinzFarewell();"], ["สรุปตี้ & เป้าหมาย (โน้ต)", "game.arkane.partyNote();"], ["Chapter 2: ไฮนซ์เข้าตี้", "game.arkane.joinHeinz();"], ["เชื่อมโรงเตี๊ยม ⇄ ย่านท่าเรือ", "game.arkane.linkInn();"], ["ย่านท่าเรือ: สลับเช้า/กลางคืน", "game.arkane.toggleDistrictTime();"], ["Chapter 2: โกดัง 4 วาง NPC", "game.arkane.placeWh4Npcs();"], ["จ่ายรางวัล C.A.A.M. (+25 gp ทุกคน)", "game.arkane.payCaamReward();"], ["สร้างฉาก: โรงเตี๊ยม ชั้นพัก (ห้องแยก)", "game.arkane.createInnScene();"], ["เปิด/ปิดไฟฉาย", "game.arkane.toggleLight();"], ["ส่งข้อความเปิดเรื่องให้ผู้เล่น", "game.arkane.sendIntros();"], ["ให้ XP", "game.arkane.giveXp();"], ["เนื้อเรื่องผู้เล่น (DM)", "game.arkane.openStory();"], ["เริ่มฉากซ้อม", "game.arkane.startTutorial();"], ["ขอให้ผู้เล่นทอยเช็ค", "game.arkane.requestRoll();"], ["เพอร์รี่: ทอยล่ากลางคืน (ลับ)", "game.arkane.perryHunt();"], ["เริ่ม Chapter 1: ล้างของจากฉากซ้อม", "game.arkane.startChapter1();"], ["Chapter 1: ตัวช่วย DM", "game.arkane.ch1Tracker();"], ["สร้าง Chapter 2: โกดังหมายเลข 4", "game.arkane.createChapter(2).then(s => s?.view());"], ["สร้าง Chapter 3: โรงพยาบาลทหารผ่านศึก", "game.arkane.createChapter(3).then(s => s?.view());"], ["สร้าง Chapter 4: รอยแยกใต้เมือง", "game.arkane.createChapter(4).then(s => s?.view());"], ["นำเข้าตัวละครจาก Character Ledger", "game.arkane.importLedger();"], ["นำเข้าอัตโนมัติ: สแกนโฟลเดอร์ arkane-import", "game.arkane.scanImportFolder(false);"], ["สร้างฉาก: บาร์ The Rusty Wand", "game.arkane.createBarScene();"], ["สร้างฉาก: แผนที่เมืองอาร์คเคน", "game.arkane.createCityScene();"], ["สร้างฉาก: แผนที่โลก Earth-Prime", "game.arkane.createWorldScene();"], ["สร้างฉาก: Chapter 1 ครบทุกแมพ", "game.arkane.createAllCh1();"], ["เชื่อมแมพ Chapter 1", "game.arkane.linkCh1(); game.arkane.linkBarStairs(false);"], ["สร้างฉาก: Chapter 1 แมพใหญ่", "game.arkane.createBigCh1();"], ["ซ่อมขนาดแมพ", "game.arkane.fixScenes();"], ["ปรับขนาดแมพ (×1 / ×2)", "game.arkane.scaleDialog();"], ["ใส่รูปแมพคืน", "game.arkane.fixBackgrounds();"], ["ปรับความสว่างแมพ", "game.arkane.brightnessDialog();"], ["สร้าง NPC Chapter 1", "game.arkane.createNpcs();"], ["สร้างตัวละครผู้เล่น", "game.arkane.createPlayers();"], ["ใส่รูปไอเทม", "game.arkane.applyArt(false);"], ["เลเวลอัพ", "game.arkane.levelUp();"], ["เพิ่มที่กำบังในฉากบาร์", "game.arkane.addBarCover(false);"], ["ตลาดมืด: สร้าง/เติมของร้านฟินช์", "game.arkane.createBlackMarket();"], ["ฉากซ้อม: สร้าง/เปิด", "game.arkane.createTutorial();"], ["ฉากซ้อม: รีเซ็ต", "game.arkane.resetTutorial();"], ["วาง NPC ลงฉาก Chapter 1", "game.arkane.placeNpcs(false, true);"], ["สร้างฉาก: อู่ซ่อมเรือร้าง (ภายใน)", "game.arkane.createShedScene().then(s => s?.view());"], ["สร้างปืนและของในเกม", "game.arkane.createItems();"], ["บรรจุกระสุน", "game.arkane.reload();"], ["ซ่อมปืน (เพิ่มปุ่มยิง)", "game.arkane.fixGuns();"], ["ทดสอบเสียงและเอฟเฟกต์ปืน", "game.arkane.testFx();"]]) {
      if (!game.macros.getName(name)) await Macro.create({ name, type: "script", command, img: "icons/svg/castle.svg", folder: mf?.id, ...(["บรรจุกระสุน", "ทดสอบเสียงและเอฟเฟกต์ปืน", "ขว้างตะเกียงน้ำมัน", "ผลัก (Shove)", "ถอยตัว (Disengage)", "เปิด/ปิดไฟฉาย", "ส่งเงินให้เพื่อน", "กระเป๋าเงิน (ลากเหรียญ)", "วิ่ง (Dash) / เร่งเครื่อง", "พุ่งชน (รถ)", "ขึ้น/ลงรถ (เลือกที่นั่ง)"].includes(name) ? { ownership: { default: 2 } } : {}) });
    }
  } catch (e) { console.error(MOD, "scene macros", e); }
  initHotbar().catch((e) => console.error(MOD, "hotbar early", e));   // do not wait on the slow steps below
  // First launch: build the Chapter 1 big map automatically so it is ready in the Scenes tab
  try {
    if (!game.settings.get(MOD, "mapsDone")) {
      await createBigCh1();
      await game.settings.set(MOD, "mapsDone", true);
    }
  } catch (e) { console.error(MOD, "big map", e); ui.notifications.warn("Arkane 1920s: สร้างแมพใหญ่อัตโนมัติไม่สำเร็จ ลองกดมาโคร 'สร้างฉาก: Chapter 1 แมพใหญ่' หรือดู Console (F12)"); }
  try {
    if (game.user.isGM && game.settings.get(MOD, "contentVer") < 12) {
      await createItems(); await createNpcs(); await createPlayers();
      if (!game.actors.find((a) => a.getFlag(MOD, "merchant"))) await createBlackMarket();
      await game.settings.set(MOD, "itemsDone", true); await game.settings.set(MOD, "npcsDone", true); await game.settings.set(MOD, "contentVer", 12);
    }
  } catch (e) { console.error(MOD, "content v3", e); }
  try { const hz = game.user.isGM && game.actors.find((a) => a.getFlag(MOD, "pc") === "heinz"); if (hz && hz.getFlag(MOD, "later") === undefined && !hz.getFlag(MOD, "joined")) await hz.setFlag(MOD, "later", true); } catch (e) { console.warn(MOD, "heinz later", e); }
  try {
    if (game.user.isGM && (game.settings.get(MOD, "npcsPlaceVer") ?? 0) < 2) {
      await placeNpcs(true, game.settings.get(MOD, "npcsPlaced")); // v2: corrected cellar spots (move tokens placed by v1)
      await game.settings.set(MOD, "npcsPlaced", true); await game.settings.set(MOD, "npcsPlaceVer", 2);
    }
  } catch (e) { console.error(MOD, "place npcs", e); }
  try {
    if (game.user.isGM && !game.settings.get(MOD, "shedDone") && game.scenes.getName("Chapter 1: ย่านท่าเรือ (แมพใหญ่)")) {
      await createShedScene(); await clearDistrictLair(); await game.settings.set(MOD, "shedDone", true);
    }
  } catch (e) { console.error(MOD, "shed", e); }
  try { if (game.user.isGM) await addBarCover(true); } catch (e) { console.error(MOD, "cover", e); }
  try { if (game.user.isGM) await linkBarStairs(true); } catch (e) { console.error(MOD, "stairs", e); }
  try { if (game.user.isGM) await fixGuns(true); } catch (e) { console.error(MOD, "fixGuns", e); }
  try { if (game.user.isGM) await applyArt(true); } catch (e) { console.error(MOD, "art", e); }
  try { if (game.user.isGM && !game.settings.get(MOD, "tutorialDone")) { await createTutorial(); await game.settings.set(MOD, "tutorialDone", true); } } catch (e) { console.error(MOD, "tutorial", e); }
  Hooks.on("createItem", (it) => { if (game.user.isGM && it.isEmbedded) ensureAttack(it).catch(() => {}); });
  try { if (!game.settings.get(MOD, "itemsDone")) { await createItems(); await game.settings.set(MOD, "itemsDone", true); } } catch (e) { console.error(MOD, "items", e); }
  try { if (game.user.isGM) { const n = await (await import("./gear.js?v=21")).migrateUmbrella(); if (n) ui.notifications.info(`เปลี่ยนร่มกันกระสุนเป็นอาวุธแล้ว ${n} ชิ้น`); } } catch (e) { console.error(MOD, "umbrella migrate", e); }
  try { if (!game.settings.get(MOD, "npcsDone")) { await createNpcs(); await game.settings.set(MOD, "npcsDone", true); } } catch (e) { console.error(MOD, "npcs", e); }
  try { if (game.user.isGM && game.settings.get(MOD, "ledgerAuto")) await scanImportFolder(true); } catch (e) { console.error(MOD, "ledger auto import", e); }
  try { const n = await tagDmNotes(); if (n) console.log(MOD, `hid ${n} DM map notes from players`); } catch (e) { console.error(MOD, "dm notes", e); }
  try { await balancePrices(true); } catch (e) { console.error(MOD, "prices", e); }
  try { await ensureMusic(); } catch (e) { console.error(MOD, "music", e); }
  try { await ensureStoryJournal(); } catch (e) { console.error(MOD, "story journal", e); }
  console.log("Arkane 1920s | ready: all startup steps finished");
});

// Long Rest lowers Dread by 1 (runs on the client of whoever took the rest)
Hooks.on("dnd5e.restCompleted", async (actor, result, config) => {
  if (actor?.type !== "character" || !actor.isOwner) return;
  const isLong = result?.longRest ?? config?.longRest ?? (config?.type === "long");
  if (!isLong) return;
  const r = await lowerDread(actor, "Long Rest");
  if (r) ChatMessage.create({ whisper: gmIds(), content: `<div class="rw-card"><div class="rw-title">พักผ่อน</div>${r}</div>` });
});
