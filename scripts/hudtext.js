// Argon HUD text: names in English + Thai, descriptions in Thai; Short/Long Rest only for the GM.
const MOD = "arkane-1920s";
const AB = {
  str: ["Strength · พละกำลัง", "<p><b>พละกำลัง (STR)</b> วัดความแข็งแรงของร่างกาย ใช้ตอนยก ผลัก ลาก ทุบ ปีนป่าย และโจมตีระยะประชิดด้วยอาวุธหนัก</p><p>เช็กที่พบบ่อย: ดันประตูที่ติดขัด ยกของหนัก ว่ายน้ำฝ่ากระแส</p>"],
  dex: ["Dexterity · ความคล่องแคล่ว", "<p><b>ความคล่องแคล่ว (DEX)</b> วัดความว่องไว การทรงตัว และปฏิกิริยา ใช้ตอนหลบ ซ่อนตัว ยิงธนูหรือปืน และตอนทอย Initiative</p><p>เซฟ DEX ใช้หลบลูกไฟ กับดัก และวงน้ำมัน</p>"],
  con: ["Constitution · ความทนทาน", "<p><b>ความทนทาน (CON)</b> วัดสุขภาพและความอึด กำหนด HP และใช้เซฟต้านพิษ โรค ความเหนื่อยล้า และการรักษาสมาธิของเวท (Concentration)</p>"],
  int: ["Intelligence · สติปัญญา", "<p><b>สติปัญญา (INT)</b> วัดความจำ ตรรกะ และการวิเคราะห์ ใช้ตอนสืบสวน อ่านตำรา ซ่อมเครื่องกล และรู้เรื่องเวทมนตร์</p>"],
  wis: ["Wisdom · การรับรู้", "<p><b>การรับรู้ (WIS)</b> วัดสัญชาตญาณ ความช่างสังเกต และความตระหนักรู้ ใช้ตอนมองหาของ อ่านใจคน ดูแลสัตว์ และเอาตัวรอดกลางป่า</p><p>เซฟ WIS ใช้ต้านเวทที่ครอบงำจิตใจ</p>"],
  cha: ["Charisma · เสน่ห์", "<p><b>เสน่ห์ (CHA)</b> วัดพลังบุคลิก ความมั่นใจ และการเข้าหาผู้คน ใช้ตอนโน้มน้าว หลอกลวง ข่มขู่ และแสดง</p><p>เป็นค่าร่ายเวทของ Sorcerer</p>"]
};
const SK = {
  acr: ["Acrobatics · กายกรรม", "ทรงตัวบนที่แคบหรือลื่น ตีลังกา กระโดดหลบ ปีนป่ายตามเสาโดยไม่ตก (DEX)"],
  ani: ["Animal Handling · ดูแลสัตว์", "ปลอบหรือคุมสัตว์ อ่านอารมณ์ม้าและสุนัข ขับรถม้าในสถานการณ์ตึงเครียด (WIS)"],
  arc: ["Arcana · เวทมนตร์ศาสตร์", "รู้เรื่องเวท ผนึก สิ่งมีชีวิตเหนือธรรมชาติ และเครื่องจักรเวท (Magitech) (INT)"],
  ath: ["Athletics · กรีฑา", "ปีน กระโดด ว่ายน้ำ ผลัก และปล้ำสู้ ใช้พละกำลังล้วนๆ (STR)"],
  dec: ["Deception · หลอกลวง", "โกหกเนียนๆ ปลอมตัว ปกปิดเจตนา หลอกให้คนเชื่อสิ่งที่ไม่จริง (CHA)"],
  his: ["History · ประวัติศาสตร์", "นึกเรื่องในอดีต ตระกูล สงคราม และเหตุการณ์ที่เกี่ยวกับตัวคนหรือสถานที่ (INT)"],
  ins: ["Insight · หยั่งรู้", "อ่านใจคน ดูว่าใครโกหก ซ่อนอะไร หรือกำลังรู้สึกอย่างไร (WIS)"],
  itm: ["Intimidation · ข่มขู่", "ใช้คำพูด ท่าทาง หรืออาวุธให้อีกฝ่ายกลัวจนยอมทำตาม (CHA)"],
  inv: ["Investigation · สืบสวน", "ค้นหาเบาะแส ต่อชิ้นส่วนเหตุการณ์ อ่านร่องรอยในที่เกิดเหตุ (INT)"],
  med: ["Medicine · การแพทย์", "ปฐมพยาบาล ห้ามเลือด วินิจฉัยบาดแผลหรือโรค และรู้สาเหตุการตาย (WIS)"],
  nat: ["Nature · ธรรมชาติ", "รู้เรื่องพืช สัตว์ ภูมิประเทศ และอากาศ (INT)"],
  prc: ["Perception · สังเกต", "มองเห็น ได้ยิน หรือได้กลิ่นสิ่งผิดปกติ ใช้เฝ้ายามและหาของที่ซ่อนอยู่ (WIS)"],
  prf: ["Performance · การแสดง", "ร้องเพลง เล่นดนตรี เล่าเรื่อง หรือแสดงให้คนดูหลงใหล (CHA)"],
  per: ["Persuasion · โน้มน้าว", "พูดดีๆ ต่อรอง ขอร้อง หรือหว่านล้อมให้คนเห็นด้วยอย่างจริงใจ (CHA)"],
  rel: ["Religion · ศาสนา", "รู้เรื่องลัทธิ พิธีกรรม สัญลักษณ์ศักดิ์สิทธิ์ และเทพเจ้า รวมถึงพิธีกรรมต้องห้าม (INT)"],
  slt: ["Sleight of Hand · มือไว", "ล้วงกระเป๋า ซ่อนของในมือ ปลดกุญแจมือ หรือเปลี่ยนของโดยไม่มีใครเห็น (DEX)"],
  ste: ["Stealth · ลอบเร้น", "เคลื่อนที่เงียบๆ ซ่อนตัวจากสายตา และหลบการตรวจตรา (DEX)"],
  sur: ["Survival · เอาตัวรอด", "ตามรอย หาทาง หาอาหารและที่พัก และอ่านสภาพแวดล้อมกลางป่าหรือในเมืองร้าง (WIS)"]
};

// DOM fallback (works whatever the data flow is): translate names and tooltips as Argon draws them
const EN = new Map();
for (const [k, v] of Object.entries(AB)) EN.set(v[0].split(" · ")[0], { label: v[0], desc: v[1] });
for (const [k, v] of Object.entries(SK)) EN.set(v[0].split(" · ")[0], { label: v[0], desc: `<p>${v[1]}</p>` });
for (const v of [...Object.values(AB), ...Object.values(SK)]) EN.set(v[0], EN.get(v[0].split(" · ")[0]));
// basic actions (Argon "Main Action" panel): Thai name + tooltip, rules per D&D 2024
const ACT = {
  Dash: ["Dash · วิ่งเร็ว", "<p><b>วิ่งเร็ว (Dash)</b> ใช้ 1 Action เพื่อเดินเพิ่มได้อีกเท่ากับความเร็วของคุณในเทิร์นนี้ เช่น ความเร็ว 30 ฟุต เดินได้รวม 60 ฟุต · ใช้ตอนวิ่งหนี หรือไล่ตามให้ทัน</p>"],
  Disengage: ["Disengage · ถอยออกจากการประชิด", "<p><b>ถอยออกจากการประชิด (Disengage)</b> ใช้ 1 Action แล้วตลอดเทิร์นนี้ การเดินของคุณจะไม่ทำให้ศัตรูได้โจมตีตอบโต้ (Opportunity Attack) · ใช้ตอนติดอยู่กับศัตรูแล้วอยากถอยหรือหนีโดยไม่โดนฟันหลัง</p>"],
  Dodge: ["Dodge · หลบ", "<p><b>หลบ (Dodge)</b> ใช้ 1 Action แล้วจนถึงต้นเทิร์นหน้าของคุณ ศัตรูที่คุณมองเห็นจะโจมตีคุณแบบเสียเปรียบ และคุณทอยเซฟ DEX แบบได้เปรียบ · ผลหายถ้าคุณสลบหรือความเร็วเหลือ 0 · ใช้ตอนโดนรุม หรืออยากถ่วงเวลาให้เพื่อน</p>"],
  Ready: ["Ready · เตรียมพร้อม", "<p><b>เตรียมพร้อม (Ready)</b> ใช้ 1 Action เลือก \"เงื่อนไข\" กับ \"สิ่งที่จะทำ\" ไว้ก่อน เช่น \"ถ้าประตูเปิด ฉันยิง\" เมื่อเงื่อนไขเกิดก่อนเทิร์นหน้า คุณใช้ Reaction ทำสิ่งนั้นทันที · ถ้าเตรียมเป็นเวท ต้องเสียช่องเวทตั้งแต่ตอนเตรียม ต้องรักษา Concentration และเวทหลุดไปถ้าเงื่อนไขไม่เกิด</p>"],
  Hide: ["Hide · ซ่อนตัว", "<p><b>ซ่อนตัว (Hide)</b> ใช้ 1 Action ทอยทักษะ Stealth (DEX) ตอนที่อยู่หลังที่กำบังหรือในที่มืดทึบ ถ้าผลสูงกว่าความตั้งใจค้นหาของศัตรู คุณจะ \"ซ่อนอยู่\" ศัตรูมองไม่เห็นและคุณโจมตีจากที่ซ่อนได้แบบได้เปรียบ แต่ถ้าโจมตีหรือส่งเสียงจะถูกเปิดโปง</p>"],
  Shove: ["Shove · ผลัก", "<p><b>ผลัก (Shove)</b> เป็นการโจมตีมือเปล่าแบบพิเศษ (แทนหนึ่งครั้งใน Attack action) เป้าหมายต้องไม่ใหญ่เกินคุณเกิน 1 ขนาด และทอยเซฟ STR หรือ DEX เทียบกับค่า 8 + STR + Proficiency ของคุณ ถ้าไม่ผ่าน คุณเลือกผลักให้ถอยหลัง 5 ฟุต หรือให้ล้มลงนอนราบ (Prone) · ใช้ผลักศัตรูให้พ้นที่กำบังหรือดึงให้ล้มก่อนเพื่อนตี</p>"]
};
const SHORT = { Dash: "วิ่งเร็ว", Disengage: "ถอยหนี", Dodge: "หลบ", Ready: "เตรียมพร้อม", Hide: "ซ่อนตัว", Shove: "ผลัก" };
for (const [en, v] of Object.entries(ACT)) { const e = { label: v[0], short: SHORT[en], desc: v[1] }; EN.set(en, e); EN.set(v[0], e); EN.set(SHORT[en], e); }
for (const [en, th] of [["Long Rest", "Long Rest · พักยาว"], ["Short Rest", "Short Rest · พักสั้น"]]) { const e = { label: th, desc: null }; EN.set(en, e); EN.set(th, e); }
function hideMacro(root) {
  if (game.user.isGM || !root?.querySelectorAll) return;
  const only = (el) => /^(\s*macro\s*)+$/i.test(el.textContent ?? "");
  for (const t of root.querySelectorAll(".action-element-title")) {
    if (!/^\s*macro\s*$/i.test(t.textContent)) continue;
    let el = t;
    while (el.parentElement && el.parentElement !== root && only(el.parentElement)) el = el.parentElement;
    el.style.display = "none";
  }
}

// ---- what an item costs: tooltip line "ใช้แล้วเสีย: Action / Bonus Action / Reaction"
const COST = {
  action: ["Action", "action"], bonus: ["Bonus Action", "bonus"], reaction: ["Reaction", "reaction"],
  minute: ["เวลาร่ายนาน (นาที)", "long"], hour: ["เวลาร่ายนาน (ชั่วโมง)", "long"], day: ["เวลาร่ายนาน (วัน)", "long"],
  special: ["พิเศษ (ดูคำอธิบาย)", "free"], legendary: ["Legendary Action", "long"], lair: ["Lair Action", "long"]
};
function costTypes(item) {
  const set = new Set();
  for (const a of [...(item.system?.activities ?? [])]) { const t = a.activation?.type || item.system?.activation?.type; if (t) set.add(t); }
  const t0 = item.system?.activation?.type; if (!set.size && t0) set.add(t0);
  if (!set.size && item.type === "weapon") set.add("action");
  return [...set].filter((t) => COST[t]);
}
function findItem(tip) {
  const name = tip.querySelector(".ech-tooltip-header h2")?.textContent?.trim(); if (!name) return {};
  const actor = ui.ARGON?._actor ?? canvas.tokens?.controlled?.[0]?.actor ?? game.user.character; if (!actor) return {};
  const clean = (x) => x.replace(/\s*·.*$/, "").trim().toLowerCase();
  return { actor, item: actor.items.find((i) => i.name === name) ?? actor.items.find((i) => clean(i.name) === clean(name)) };
}
// TARGET row: weapons have no fixed target, so show who is actually targeted right now and how far away
function addTarget(tip) {
  const { actor, item } = findItem(tip); if (!item || !["weapon", "spell"].includes(item.type)) return;
  const row = [...tip.querySelectorAll(".ech-tooltip-details > div")].find((d) => /^\s*target\s*$/i.test(d.children[0]?.textContent ?? "")); if (!row) return;
  const val = row.children[1]; if (!val || val.dataset.arkane) return;
  const src = ui.ARGON?._token ?? actor.getActiveTokens?.()[0];
  const ts = [...game.user.targets];
  const txt = ts.length ? ts.map((t) => { let d = ""; try { if (src) d = ` (${Math.round(canvas.grid.measurePath([src.center, t.center]).distance)} ${canvas.scene.grid.units || "ft"})`; } catch {} return `${t.name}${d}`; }).join(", ") : "ยังไม่ได้เล็ง (คลิกศัตรูแล้วกด T)";
  const cur = val.textContent.trim();
  val.textContent = (cur && cur !== "-" ? `${cur} → ` : "") + txt; val.dataset.arkane = "1";
}
function addCost(tip) {
  if (tip.querySelector(".arkane-cost")) return;
  const { actor, item } = findItem(tip);
  if (!item) return;
  const types = costTypes(item); if (!types.length) return;
  const c = game.combat?.started && game.combat.combatants.find((x) => x.actorId === actor.id);
  const spent = types.includes("reaction") && c?.getFlag(MOD, "reaction");
  const el = document.createElement("div"); el.className = "arkane-cost";
  el.innerHTML = `<span class="arkane-cost-l">ใช้แล้วเสีย</span>` + types.map((t) => `<b class="arkane-cost-b c-${COST[t][1]}">${COST[t][0]}</b>`).join(`<i>หรือ</i>`) + (spent ? `<em>ใช้ไปแล้วในรอบนี้ (กลับมาตอนเริ่มเทิร์นตัวเอง)</em>` : types.includes("reaction") ? `<em>ใช้ได้ 1 ครั้งต่อรอบ นอกเทิร์นตัวเอง</em>` : "");
  const body = tip.querySelector(".ech-tooltip-body"); if (!body) return;
  body.style.display = "";
  // Argon pins the subtitle badge (e.g. "Cantrip Illusion") over the top of the body, so go after the description instead of first
  const after = body.querySelector(".ech-tooltip-description") ?? body.querySelector(".ech-tooltip-subtitle");
  if (after) after.after(el); else body.prepend(el);
}
function tr(node) {
  if (!node || node.nodeType !== 1) return;
  if (node.matches?.(".ech-tooltip") || node.querySelector?.(".ech-tooltip")) {
    for (const t of node.matches(".ech-tooltip") ? [node] : node.querySelectorAll(".ech-tooltip")) {
      try { addCost(t); addTarget(t); } catch (er) { console.warn(MOD, "cost", er); }
      const h = t.querySelector(".ech-tooltip-header h2"); const e = h && EN.get(h.textContent.trim());
      if (!e) continue;
      h.textContent = e.label;
      const d = t.querySelector(".ech-tooltip-description"); if (d && e.desc) d.innerHTML = e.desc;
    }
  }
  const root = node.closest?.(".extended-combat-hud") ? node : node.querySelector?.(".extended-combat-hud") ?? (node.matches?.(".extended-combat-hud") ? node : null);
  if (!root) return;
  hideMacro(root);
  const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  for (let n = w.nextNode(); n; n = w.nextNode()) {
    const txt = n.nodeValue.trim(); const e = EN.get(txt);
    if (e && e.short) n.parentElement?.closest?.(".action-element")?.classList.add("arkane-act");
    if (e && (e.short ?? e.label) !== txt) n.nodeValue = n.nodeValue.replace(txt, e.short ?? e.label);
  }
}

// Argon's movement column counts grid squares; show feet instead (remaining now, and the size of one move)
function fixMove() {
  const d = canvas.scene?.grid?.distance || 5, u = canvas.scene?.grid?.units || "ft";
  for (const h of document.querySelectorAll(".extended-combat-hud .movement-hud")) {
    const cur = h.querySelector(".movement-current"), mx = h.querySelector(".movement-max"), n = h.querySelectorAll(".movement-space").length;
    if (!cur || !mx || !n) continue;
    const c = cur.textContent.trim(), m = mx.textContent.trim();
    if (c === cur.dataset.shown && m === mx.dataset.shown) continue;
    const rc = parseFloat(c), rm = parseFloat(m); if (!Number.isFinite(rc) || !Number.isFinite(rm)) continue;
    cur.textContent = String(Math.round(rc * d)); cur.dataset.shown = cur.textContent;
    mx.textContent = String(Math.round(n * d)); mx.dataset.shown = mx.textContent;
    cur.dataset.unit = u; mx.dataset.unit = u;
    h.title = `เหลือเดินได้ ${Math.round(rc * d)} ${u} จาก ${Math.round(n * d)} ${u} · เดินไปแล้วในเทิร์นนี้ ${Math.round((rm - rc) * d)} ${u}`;
  }
}
let mvRaf = 0;
let obs = null;
function startObserver() {
  if (obs) return;
  obs = new MutationObserver((muts) => { if (!mvRaf && muts.some((m) => m.target?.closest?.(".movement-hud") || [...m.addedNodes].some((n) => n.nodeType === 1 && (n.matches?.(".movement-hud") || n.querySelector?.(".movement-hud"))))) mvRaf = requestAnimationFrame(() => { mvRaf = 0; try { fixMove(); } catch (e) { console.warn(MOD, "move", e); } }); for (const m of muts) for (const n of m.addedNodes) { if (n.nodeType === 1) tr(n); else if (n.nodeType === 3 && n.parentElement?.closest?.(".extended-combat-hud")) { const e = EN.get(n.nodeValue.trim()); if (e && e.label !== n.nodeValue.trim()) n.nodeValue = e.label; } } });
  obs.observe(document.body, { childList: true, subtree: true });
  document.querySelectorAll(".extended-combat-hud, .ech-tooltip").forEach(tr);
  console.log(MOD, "hudtext observer on");
}

// chat card for the basic actions: a short Thai line first, the full rule folded away
const BRIEF = {
  Dash: "เดินเพิ่มอีกเท่าความเร็วของคุณในเทิร์นนี้",
  Disengage: "เทิร์นนี้ เดินหนีแล้วศัตรูไม่ได้โจมตีตอบโต้",
  Dodge: "ศัตรูที่มองเห็นคุณโจมตีแบบเสียเปรียบ และคุณเซฟ DEX แบบได้เปรียบ จนถึงต้นเทิร์นหน้า",
  Ready: "เลือกเงื่อนไขกับสิ่งที่จะทำ แล้วใช้ Reaction ทำตอนเงื่อนไขเกิด",
  Hide: "ทอย Stealth ถ้าสูงกว่า Perception ของศัตรู เขาจะมองไม่เห็นคุณ",
  Shove: "ใช้แทนการโจมตี 1 ครั้ง ทอย Athletics ชนะเป้าหมาย แล้วทำให้ล้มหรือผลักออก 5 ฟุต (เป้าหมายใหญ่กว่าคุณได้ไม่เกิน 1 ขนาด)"
};
function actCard(msg, html) {
  try {
    const box = html.querySelector?.(".message-content"); if (!box || box.dataset.arkaneAct) return;
    let name = msg.flags?.dnd5e?.item?.name;
    if (!name) { const u = msg.flags?.dnd5e?.item?.uuid; if (u) name = fromUuidSync(u)?.name; }
    if (!name) name = box.querySelector(".name-stacked .title, .card-header .name, .card-header h3, header h3")?.textContent?.trim();
    const key = Object.keys(ACT).find((k) => k === name || ACT[k][0] === name || SHORT[k] === name); if (!key) return;
    const d = box.querySelector(".card-description, .description"); if (!d) return;
    box.dataset.arkaneAct = "1";
    d.innerHTML = `<p><b>${SHORT[key]}</b> · ${BRIEF[key]}</p><details><summary>อ่านกฎเต็ม</summary>${ACT[key][1]}</details>`;
    const t = box.querySelector(".name-stacked .title, .card-header .name, .card-header h3, header h3"); if (t) t.textContent = SHORT[key];
  } catch (e) { console.warn(MOD, "act card", e); }
}
export function registerHudText() {
  Hooks.on("renderChatMessageHTML", actCard);
  startObserver();
  watchWeaponSets();
  try {
    const tr = game.i18n.translations;
    for (const t of [tr, game.i18n._fallback].filter(Boolean)) {
      for (const [k, v] of Object.entries(AB)) foundry.utils.setProperty(t, `enhancedcombathud-dnd5e.abilities.${k}.tooltip`, v[1]);
      for (const [k, v] of Object.entries(SK)) foundry.utils.setProperty(t, `enhancedcombathud-dnd5e.skills.${k}.tooltip`, `<p>${v[1]}</p>`);
    }
  } catch (e) { console.warn(MOD, "hud tooltips", e); }
  try {
    for (const [k, v] of Object.entries(AB)) { const o = CONFIG.DND5E.abilities[k]; if (o) o.label = v[0]; }
    for (const [k, v] of Object.entries(SK)) { const o = CONFIG.DND5E.skills[k]; if (o) o.label = v[0]; }
  } catch (e) { console.warn(MOD, "hud labels", e); }
  // rest is a GM decision: block it for players (the HUD buttons are also hidden by CSS)
  const block = (actor) => { if (!game.user.isGM) { ui.notifications.warn("การพักผ่อน (Short/Long Rest) ให้ DM เป็นคนกดให้เท่านั้น"); return false; } };
  for (const h of ["dnd5e.preRest", "dnd5e.preShortRest", "dnd5e.preLongRest"]) Hooks.on(h, block);
}

// Weapon sets: Argon shows weapons only when they sit in its weapon sets (flag on the actor). Fill them for the PCs once.
const isRanged = (i) => /R$/.test(i.system?.type?.value ?? "") || !!i.system?.range?.long;
const isFist = (i) => /หมัด|unarmed/i.test(i.name);
export async function ensureWeaponSets(opts = {}) {
  if (!game.user.isGM) return 0;
  let n = 0;
  for (const a of game.actors.filter((x) => x.type === "character" && x.getFlag(MOD, "pc"))) {
    const cur = a.getFlag("enhancedcombathud", "weaponSets");
    if (!opts.force && cur && Object.values(cur).some((x) => x?.primary || x?.secondary)) continue;
    const ws = a.items.filter((i) => i.type === "weapon").sort((x, y) => (isFist(x) ? 1 : 0) - (isFist(y) ? 1 : 0));
    if (!ws.length) continue;
    const ranged = ws.filter(isRanged), melee = ws.filter((i) => !isRanged(i));
    const light = (i) => i?.system?.properties?.has?.("lgt");
    const sets = {
      1: { primary: (ranged[0] ?? melee[0])?.uuid ?? null, secondary: null },
      2: { primary: (ranged[0] ? melee[0] : melee[1])?.uuid ?? null, secondary: ((ranged[0] ? melee[0] : melee[1]) && light(melee[ranged[0] ? 0 : 1]) && light(melee[ranged[0] ? 1 : 2])) ? melee[ranged[0] ? 1 : 2].uuid : null },
      3: { primary: (ranged[1] ?? melee[2] ?? null)?.uuid ?? null, secondary: null }
    };
    try { await a.setFlag("enhancedcombathud", "weaponSets", sets); await a.setFlag("enhancedcombathud", "activeWeaponSet", "1"); n++; } catch (e) { console.warn(MOD, "weaponSets", a.name, e); }
  }
  try { ui.ARGON?.refresh?.(); } catch {}
  return n;
}
let wsTimer = null;
export function watchWeaponSets() {
  if (!game.user.isGM) return;
  setTimeout(() => ensureWeaponSets().catch((e) => console.warn(MOD, "weaponSets", e)), 2500);
  setTimeout(async () => { try { if (!game.settings.get(MOD, "equipSimplified")) { await simplifyEquip(); await game.settings.set(MOD, "equipSimplified", true); } } catch (e) { console.warn(MOD, "equipSimplified", e); } }, 3500);
  // with the weapon-set strip hidden, what a character holds comes from the bag slots: set them up once for every PC
  setTimeout(async () => { try { if (game.settings.get(MOD, "hideWeaponSets") && !game.settings.get(MOD, "slotsInit")) { const n = await (await import("./bag.js?v=21")).autoSlotAll(); await game.settings.set(MOD, "slotsInit", true); console.log(MOD, "slots set for", n, "characters"); } } catch (e) { console.warn(MOD, "slotsInit", e); } }, 5500);
  Hooks.on("createItem", (item) => { if (item.type !== "weapon" || !item.parent?.getFlag?.(MOD, "pc")) return; clearTimeout(wsTimer); wsTimer = setTimeout(() => ensureWeaponSets().catch(() => {}), 1500); });
}

// Equip state: Argon's "Auto Equip" flips the equip toggles every time a weapon set changes, which confuses players.
// Turn it off once and equip what every PC carries (all weapons + one body armor), so the toggles stay put.
export async function simplifyEquip() {
  if (!game.user.isGM) return 0;
  try { if (game.settings.settings.has("enhancedcombathud-dnd5e.switchEquip") && game.settings.get("enhancedcombathud-dnd5e", "switchEquip")) await game.settings.set("enhancedcombathud-dnd5e", "switchEquip", false); } catch (e) { console.warn(MOD, "switchEquip", e); }
  // equipping is now done by dragging items into slots in the bag window (bag.js), so nothing is force-equipped here
  let n = 0;
  return n;
}
