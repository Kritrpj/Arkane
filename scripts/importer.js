// Import a character made in the "Rusty Wand Character Ledger" page (its copied text or its .md file) as a dnd5e actor.
const MOD = "arkane-1920s";
const P = (s) => `<p>${s}</p>`;
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const ABS = ["str", "dex", "con", "int", "wis", "cha"];
const SKILL = { Acrobatics: "acr", "Animal Handling": "ani", Arcana: "arc", Athletics: "ath", Deception: "dec", History: "his", Insight: "ins",
  Intimidation: "itm", Investigation: "inv", Medicine: "med", Nature: "nat", Perception: "prc", Performance: "prf", Persuasion: "per",
  Religion: "rel", "Sleight of Hand": "slt", Stealth: "ste", Survival: "sur" };
// hit die, caster progression, casting ability, weapon prof, armor prof, starting kit (Arkane item flag ids)
const CLASS = {
  Barbarian: [12, "none", "str", ["sim", "mar"], ["lgt", "med", "shl"], ["melee-machete", "melee-knuckles"]],
  Bard: [8, "full", "cha", ["sim"], ["lgt"], ["melee-canesword", "gun-derringer", ".38"]],
  Cleric: [8, "full", "wis", ["sim"], ["lgt", "med", "shl"], ["melee-blackjack", "gun-revolver", ".38"]],
  Druid: [8, "full", "wis", ["sim"], ["lgt", "shl"], ["melee-blackjack", "melee-switchblade"]],
  Fighter: [10, "none", "str", ["sim", "mar"], ["lgt", "med", "hvy", "shl"], ["gun-revolver", "melee-trenchknife", "armor-peacoat", ".38"]],
  Monk: [8, "none", "wis", ["sim"], [], ["melee-knuckles", "melee-blackjack"]],
  Paladin: [10, "half", "cha", ["sim", "mar"], ["lgt", "med", "hvy", "shl"], ["melee-canesword", "gun-revolver", ".38"]],
  Ranger: [10, "half", "wis", ["sim", "mar"], ["lgt", "med", "shl"], ["gun-rifle", "melee-machete", "rifle"]],
  Rogue: [8, "none", "dex", ["sim"], ["lgt"], ["melee-switchblade", "gun-derringer", ".38", "gear-ชุดสะเดาะกุญแจ"]],
  Sorcerer: [6, "full", "cha", ["sim"], [], ["melee-switchblade", "gun-derringer", ".38"]],
  Warlock: [8, "pact", "cha", ["sim"], ["lgt"], ["melee-razor", "gun-derringer", ".38"]],
  Wizard: [6, "full", "int", ["sim"], [], ["melee-switchblade", "gun-derringer", ".38"]],
  Artificer: [8, "artificer", "int", ["sim"], ["lgt", "med", "shl"], ["gun-auto45", "melee-switchblade", ".45"]]
};
const AMMO = { ".38": ["ammo-กระสุน .38", 12], ".45": ["ammo-กระสุน .45", 14], rifle: ["ammo-กระสุนไรเฟิล", 10] };
// a starter spell set per caster class (2024 names, taken from any Item compendium that has them); players can swap later
const SPELLS = {
  Bard: ["Vicious Mockery", "Minor Illusion", "Healing Word", "Dissonant Whispers", "Charm Person", "Faerie Fire"],
  Cleric: ["Guidance", "Sacred Flame", "Light", "Bless", "Cure Wounds", "Guiding Bolt", "Shield of Faith"],
  Druid: ["Druidcraft", "Produce Flame", "Healing Word", "Entangle", "Faerie Fire", "Thunderwave"],
  Paladin: ["Bless", "Cure Wounds"],
  Ranger: ["Hunter's Mark", "Cure Wounds"],
  Sorcerer: ["Fire Bolt", "Mage Hand", "Light", "Prestidigitation", "Magic Missile", "Shield"],
  Warlock: ["Eldritch Blast", "Minor Illusion", "Hex", "Armor of Agathys"],
  Wizard: ["Fire Bolt", "Mage Hand", "Light", "Magic Missile", "Shield", "Detect Magic", "Mage Armor", "Sleep"],
  Artificer: ["Mending", "Fire Bolt", "Cure Wounds", "Grease"]
};
const THCLASS = { Barbarian: "บาร์บาเรียน", Bard: "บาร์ด", Cleric: "เคลริก", Druid: "ดรูอิด", Fighter: "ไฟเตอร์", Monk: "มังก์", Paladin: "พาลาดิน",
  Ranger: "เรนเจอร์", Rogue: "โร้ก", Sorcerer: "ซอร์เซอเรอร์", Warlock: "วอร์ล็อก", Wizard: "วิซาร์ด", Artificer: "อาร์ติฟิเซอร์" };

/* ---------- parse the ledger text ---------- */
export function parseLedger(text) {
  const t = String(text ?? "").replace(/\r/g, "");
  const out = { front: {}, abilities: null, saves: [], skills: [], feats: [], sections: {} };
  const fm = t.match(/^---\n([\s\S]*?)\n---/);
  if (fm) for (const line of fm[1].split("\n")) { const m = line.match(/^(\w+):\s*(.*)$/); if (m) out.front[m[1]] = m[2].trim(); }
  const row = t.split("\n").find((l) => /^\|\s*\d+\s*\(/.test(l.trim()));
  if (row) { const n = [...row.matchAll(/(\d+)\s*\(/g)].map((m) => Number(m[1])); if (n.length === 6) out.abilities = n; }
  const li = (label) => { const m = t.match(new RegExp("^- " + label + "[^:]*:\\s*(.+)$", "m")); return m ? m[1].trim() : ""; };
  out.hp = parseInt(li("HP"), 10) || null;
  out.ac = parseInt(li("AC"), 10) || null;
  out.speed = parseInt(li("ความเร็ว"), 10) || 30;
  out.saves = li("Saving Throws").split(/,\s*/).map((s) => s.trim().toLowerCase()).filter((s) => ABS.includes(s));
  out.skills = li("ทักษะ").split(/,\s*/).map((s) => SKILL[s.trim()]).filter(Boolean);
  out.originFeat = li("Origin Feat"); out.tools = li("เครื่องมือ");
  const occ = t.match(/\*\*อาชีพ:\*\*\s*(.+?)\s*\(Background/); out.occupation = occ ? occ[1] : "";
  const sp = t.match(/\*\*เผ่าพันธุ์:\*\*\s*(.+?)\s*$/m); out.speciesLabel = sp ? sp[1] : out.front.species ?? "";
  // sections
  let cur = null;
  for (const line of t.split("\n")) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) { cur = h[1].trim(); out.sections[cur] = []; continue; }
    if (cur) out.sections[cur].push(line);
  }
  for (const line of out.sections["เผ่าพันธุ์"] ?? []) {
    const m = line.match(/^-\s+(.+)$/); if (!m) continue;
    const s = m[1]; const cut = s.lastIndexOf(" — [");
    const body = cut >= 0 ? s.slice(0, cut) : s; const use = cut >= 0 ? s.slice(cut + 3) : "";
    const ci = body.indexOf(":");
    const name = (ci > 0 && ci < 40 ? body.slice(0, ci) : body).trim();
    out.feats.push({ name, desc: body + (use ? ` · ${use}` : ""), use });
  }
  const dv = t.match(/Darkvision\s*(\d+)/i); out.darkvision = dv ? Number(dv[1]) : 0;
  return out;
}

function usesFrom(use) {
  if (!use || /ติดตัว|อัตโนมัติ/.test(use)) return null;
  const per = /Short Rest/i.test(use) ? "sr" : "lr";
  const n = use.match(/(\d+)\s*ครั้ง/); const pb = /\bPB\b|Proficiency/i.test(use);
  if (!n && !pb) return null;
  return { max: pb ? "@prof" : n[1], spent: 0, recovery: [{ period: per, type: "recoverAll" }] };
}

async function findInPacks(type, name) {
  const want = name.toLowerCase().trim();
  let best = null;
  for (const pack of game.packs.filter((p) => p.documentName === "Item")) {
    let idx; try { idx = await pack.getIndex({ fields: ["type", "system.source.rules"] }); } catch { continue; }
    for (const e of idx) {
      if (e.type !== type || e.name.toLowerCase() !== want) continue;
      const score = (e.system?.source?.rules === "2024" ? 2 : 0) + (pack.metadata.packageName === "dnd5e" ? 0 : 1);
      if (!best || score > best.score) best = { pack, id: e._id, score };
    }
  }
  if (!best) return null;
  try { return (await best.pack.getDocument(best.id))?.toObject(); } catch { return null; }
}

function bioHtml(d) {
  const s = d.sections;
  const story = (s["เรื่องราว"] ?? []).join("\n").trim()
    .split(/\n(?=\*\*\d)/).map((block) => {
      const m = block.match(/^\*\*(.+?)\*\*\s*\n?([\s\S]*)$/);
      return m ? `<p><b>${esc(m[1])}</b><br>${esc(m[2].trim()).replace(/\n/g, "<br>")}</p>` : P(esc(block));
    }).join("");
  const look = (s["รูปลักษณ์"] ?? []).join("\n").replace(/\*\(.*\)\*/g, "").trim();
  return [
    P(`<b>อาชีพ:</b> ${esc(d.occupation || "-")} · <b>Background:</b> ${esc(d.front.background || "-")}`),
    P(`<b>เผ่าพันธุ์:</b> ${esc(d.speciesLabel)} · <b>Origin Feat:</b> ${esc(d.originFeat || "-")} · <b>เครื่องมือ:</b> ${esc(d.tools || "-")}`),
    look ? `<h3>รูปลักษณ์</h3>${P(esc(look))}` : "",
    story ? `<h3>เรื่องราว</h3>${story}` : "",
    P(`<i>นำเข้าจาก Character Ledger · ผู้เล่น: ${esc(d.front.player || "-")}</i>`)
  ].join("");
}

export async function createFromLedger(d, { img, userId, kit = true, spells = true } = {}) {
  if (!d.abilities) throw new Error("ไม่พบตารางค่าสถานะ (STR DEX CON ...) ในข้อความ");
  const name = d.front.character && d.front.character !== "-" ? d.front.character : "ตัวละครใหม่";
  const clsName = d.front.class ?? "";
  const C = CLASS[clsName] ?? [8, "none", "int", ["sim"], [], []];
  const mod = (v) => Math.floor((v - 10) / 2);
  const hp = d.hp ?? (C[0] + mod(d.abilities[2]));
  const folder = game.folders.find((f) => f.name === "Arkane 1920s · ผู้เล่น" && f.type === "Actor")
    ?? await Folder.create({ name: "Arkane 1920s · ผู้เล่น", type: "Actor", color: "#801820" });
  const ownership = { default: 0 }; if (userId) ownership[userId] = 3;
  const portrait = img || "icons/svg/mystery-man.svg";
  const abilities = Object.fromEntries(ABS.map((a, i) => [a, { value: d.abilities[i], proficient: d.saves.includes(a) ? 1 : 0 }]));
  const skills = Object.fromEntries(d.skills.map((k) => [k, { value: 1 }]));
  const actor = await Actor.create({
    name, type: "character", img: portrait, folder: folder.id, ownership,
    system: {
      abilities, skills,
      attributes: { ac: { calc: "default" }, hp: { value: hp, max: hp }, movement: { walk: d.speed }, spellcasting: C[2],
        senses: { darkvision: d.darkvision, ranges: { darkvision: d.darkvision } } },
      traits: { weaponProf: { value: C[3] }, armorProf: { value: C[4] } },
      currency: { gp: 15 },
      details: { biography: { value: bioHtml(d) } }
    },
    prototypeToken: { name, actorLink: true, disposition: 1, displayName: 30, displayBars: 30, bar1: { attribute: "attributes.hp" },
      texture: { src: portrait }, sight: { enabled: true, range: d.darkvision, visionMode: d.darkvision ? "darkvision" : "basic" } },
    flags: { [MOD]: { pc: "ledger-" + foundry.utils.randomID(6), ledger: true, dread: 0 } }
  });
  const report = [];
  // class: compendium copy when one exists (keeps its description), else a plain class item
  let cls = clsName ? await findInPacks("class", clsName) : null;
  if (cls) { delete cls._id; cls.system.levels = 1; if (cls.system.hd) cls.system.hd.spent = 0; report.push(`คลาส ${clsName} จาก compendium`); }
  else if (clsName) cls = { name: clsName, type: "class", img: "icons/svg/book.svg",
    system: { identifier: clsName.toLowerCase(), levels: 1, hd: { denomination: "d" + C[0], spent: 0 }, spellcasting: { progression: C[1], ability: C[2] } } };
  const items = [];
  if (cls) items.push(cls);
  // origin feat(s)
  for (const f of (d.originFeat || "").split("+").map((s) => s.trim()).filter((s) => s && !/อีก\s*1/.test(s))) {
    const doc = await findInPacks("feat", f);
    if (doc) { delete doc._id; items.push(doc); }
    else items.push({ name: f, type: "feat", img: "icons/svg/upgrade.svg", system: { type: { value: "feat", subtype: "origin" }, description: { value: P("Origin Feat (เติมรายละเอียดตาม PHB 2024)") } } });
  }
  if (/Versatile/.test(d.originFeat || "")) report.push("มนุษย์: ยังขาด Origin Feat อีก 1 อย่าง (Versatile) ให้ผู้เล่นเลือก");
  // species traits
  for (const f of d.feats) {
    const sys = { description: { value: P(esc(f.desc)) }, type: { value: "race" } };
    const u = usesFrom(f.use); if (u) sys.uses = u;
    items.push({ name: f.name, type: "feat", img: "icons/svg/aura.svg", system: sys });
  }
  // starting kit from the Arkane world items
  if (kit) {
    const byId = (id) => game.items.find((i) => i.getFlag(MOD, "id") === id);
    for (const k of C[5]) {
      const [id, qty] = AMMO[k] ?? [k, 1];
      const src = byId(id);
      if (!src) { report.push(`ไม่พบไอเทม ${id} ในโลก (กดมาโคร "สร้างปืนและของในเกม" ก่อน)`); continue; }
      const o = src.toObject(); delete o._id; delete o.folder;
      if ("quantity" in (o.system ?? {})) o.system.quantity = qty;
      if ("equipped" in (o.system ?? {}) && o.type !== "consumable") o.system.equipped = true;
      items.push(o);
    }
  }
  // starter spells
  if (spells && SPELLS[clsName] && false) {
    let got = 0; const miss = [];
    for (const sn of SPELLS[clsName]) {
      const sp = await findInPacks("spell", sn);
      if (!sp) { miss.push(sn); continue; }
      delete sp._id; sp.system ??= {};
      sp.system.method = clsName === "Warlock" ? "pact" : "spell"; sp.system.prepared = 1;
      sp.system.preparation = { mode: clsName === "Warlock" ? "pact" : "prepared", prepared: true };
      sp.flags = { ...(sp.flags ?? {}), [MOD]: { starter: true } };
      items.push(sp); got++;
    }
    report.push(`เวทชุดเริ่มต้น ${got} อย่าง (ผู้เล่นเปลี่ยนเองได้)` + (miss.length ? ` · หาไม่เจอใน compendium: ${miss.join(", ")}` : ""));
  }
  try { await actor.createEmbeddedDocuments("Item", items); } catch (e) { console.error(MOD, "import items", e); report.push("ใส่ไอเทมบางอย่างไม่สำเร็จ ดูคอนโซล"); }
  // class plan: level-1 features and spells (replaces the generic starter set)
  try {
    const { grantClassStart } = await import("./spells.js?v=21");
    const g = await grantClassStart(actor);
    if (g) report.push(`${g.title}: ความสามารถเลเวล 1 (${g.features.join(", ")})${g.spells.length ? ` · เวท ${g.spells.length} อย่าง` : ""}`);
  } catch (e) { console.warn(MOD, "class start", e); }
  await actor.update({ "system.attributes.hp.value": hp, "system.attributes.hp.max": hp });
  try { await game.arkane?.fixGuns?.(true); } catch {}
  if (userId) { const u = game.users.get(userId); if (u && !u.character) await u.update({ character: actor.id }); }
  if (d.ac && actor.system.attributes?.ac?.value !== undefined && !kit && actor.system.attributes.ac.value !== d.ac) report.push(`AC ใน Foundry ${actor.system.attributes.ac.value} ต่างจากใบ (${d.ac}) ตรวจความสามารถเผ่าพันธุ์`);
  report.push("เลเวลอัพ: เลือกโทเคนแล้วกดมาโคร \"เลเวลอัพ\" (มีแผนถึงเลเวล 5 ทุกคลาส)");
  return { actor, report };
}

/* ---------- dialog ---------- */
export async function importLedger() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const D = foundry.applications?.api?.DialogV2;
  if (!D) return ui.notifications.error("ต้องใช้ Foundry v12 ขึ้นไป");
  const users = game.users.filter((u) => !u.isGM);
  const content = `<div class="ark-imp" style="display:flex;flex-direction:column;gap:8px">
    <p style="margin:0">ในหน้า Character Ledger ขั้น "สรุปและส่ง DM" กด <b>คัดลอกข้อความ</b> แล้ววางด้านล่าง หรือเลือกไฟล์ .md ที่ผู้เล่นส่งมา</p>
    <input type="file" name="file" accept=".md,.txt,.json,text/plain,text/markdown,application/json">
    <textarea name="text" rows="10" placeholder="--- character: ..." style="font-family:monospace;font-size:12px"></textarea>
    <div class="ark-prev" style="font-size:13px;min-height:1.5em;color:#555"></div>
    <label>รูปตัวละคร/โทเคน <div style="display:flex;gap:4px"><input type="text" name="img" placeholder="ว่างไว้ = รูปเงาคน"><button type="button" class="ark-pick" style="flex:0 0 auto;width:auto"><i class="fas fa-file-import"></i></button></div></label>
    <label>ผู้เล่นเจ้าของตัวละคร <select name="user"><option value="">— ยังไม่กำหนด —</option>${users.map((u) => `<option value="${u.id}">${esc(u.name)}</option>`).join("")}</select></label>
    <label><input type="checkbox" name="kit" checked> ใส่อาวุธเริ่มต้นตามคลาส (ปืน มีด กระสุน จากของในเกม) + เงิน $15</label>
    <label><input type="checkbox" name="spells" checked> ใส่เวทชุดเริ่มต้นตามคลาส (ผู้เล่นเปลี่ยนเองได้)</label>
    <p style="margin:0;font-size:12px;color:#666">อัตโนมัติ: วางไฟล์ไว้ในโฟลเดอร์ <b>Data/arkane-import</b> แล้วเปิดโลกใหม่ หรือกดปุ่ม "สแกนโฟลเดอร์"</p>
  </div>`;
  const result = await D.wait({
    window: { title: "นำเข้าตัวละครจาก Character Ledger", icon: "fas fa-user-plus" }, position: { width: 560 }, content,
    render: (event, dialog) => {
      const root = (dialog?.element ?? event?.target?.element ?? document).querySelector(".ark-imp");
      if (!root) return;
      const ta = root.querySelector("[name=text]"), pv = root.querySelector(".ark-prev");
      const preview = () => {
        let src = ta.value; try { const j = JSON.parse(src); if (j.md) src = j.md; } catch {}
        const d = parseLedger(src);
        pv.textContent = d.abilities ? `✓ ${d.front.character ?? "?"} · ${d.front.species ?? "?"} ${d.front.class ?? "?"} · HP ${d.hp ?? "?"} · ทักษะ ${d.skills.length} · ความสามารถเผ่า ${d.feats.length}` : (ta.value.trim() ? "✗ อ่านค่าสถานะไม่ได้ ตรวจว่าวางข้อความครบ" : "");
        const u = users.find((x) => d.front.player && x.name.toLowerCase().includes(d.front.player.toLowerCase()));
        if (u && !root.querySelector("[name=user]").value) root.querySelector("[name=user]").value = u.id;
      };
      ta.addEventListener("input", preview);
      root.querySelector("[name=file]").addEventListener("change", async (e) => { const f = e.target.files?.[0]; if (f) { ta.value = await f.text(); preview(); } });
      root.querySelector(".ark-pick").addEventListener("click", () => {
        const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
        new FP({ type: "image", callback: (p) => { root.querySelector("[name=img]").value = p; } }).render(true);
      });
    },
    buttons: [
      { action: "ok", label: "นำเข้า", icon: "fas fa-check", default: true,
        callback: (event, button) => { const f = button.form.elements; return { text: f.text.value, img: f.img.value.trim(), user: f.user.value, kit: f.kit.checked, spells: f.spells.checked }; } },
      { action: "scan", label: "สแกนโฟลเดอร์", icon: "fas fa-folder-open", callback: () => "scan" },
      { action: "cancel", label: "ยกเลิก" }
    ]
  }).catch(() => null);
  if (result === "scan") return scanImportFolder(false);
  if (!result || result === "cancel" || !result.text) return;
  try {
    const { actor, report } = await importFromText(result.text, { img: result.img, userId: result.user || undefined, kit: result.kit, spells: result.spells });
    ui.notifications.info(`นำเข้า ${actor.name} แล้ว (โฟลเดอร์ Arkane 1920s · ผู้เล่น)`);
    ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card"><div class="rw-title">นำเข้าตัวละคร: ${esc(actor.name)}</div>${report.map((r) => "• " + esc(r)).join("<br>")}</div>` });
    actor.sheet?.render(true);
    return actor;
  } catch (e) { console.error(MOD, e); ui.notifications.error("นำเข้าไม่สำเร็จ: " + e.message); }
}

/* ---------- drop folder: Data/arkane-import ---------- */
const DIR = "arkane-import";
const FP = () => foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
export function registerImporter() {
  game.settings.register(MOD, "ledgerImported", { scope: "world", config: false, type: Array, default: [] });
  game.settings.register(MOD, "ledgerAuto", { scope: "world", config: true, type: Boolean, default: true,
    name: "นำเข้าตัวละครอัตโนมัติ", hint: "ทุกครั้งที่เปิดโลก GM จะนำเข้าไฟล์ใหม่ในโฟลเดอร์ Data/arkane-import (.md หรือ .json จาก Character Ledger)" });
  // a button in the Actors sidebar
  Hooks.on("renderActorDirectory", (app, html) => {
    if (!game.user.isGM) return;
    const root = html instanceof HTMLElement ? html : html?.[0];
    if (!root || root.querySelector(".ark-ledger-btn")) return;
    const bar = root.querySelector(".header-actions") ?? root.querySelector(".directory-header");
    if (!bar) return;
    const b = document.createElement("button"); b.type = "button"; b.className = "ark-ledger-btn";
    b.innerHTML = '<i class="fas fa-user-plus"></i> นำเข้าจาก Ledger';
    b.addEventListener("click", () => importLedger());
    bar.append(b);
  });
}
// a file from Character Ledger: plain .md text, or .json {format, md, img(dataURL)}
async function readBundle(text) {
  const t = text.trim();
  if (t.startsWith("{")) { try { const j = JSON.parse(t); if (j.md) return { md: j.md, img: j.img || "" }; } catch {} }
  return { md: text, img: "" };
}
async function savePortrait(dataUrl, name) {
  if (!dataUrl?.startsWith("data:image")) return "";
  try {
    const blob = await (await fetch(dataUrl)).blob();
    const ext = blob.type.includes("png") ? "png" : blob.type.includes("webp") ? "webp" : "jpg";
    const safe = (name || "pc").replace(/[^\p{L}\p{N}_-]+/gu, "_").slice(0, 40) || "pc";
    const file = new File([blob], `${safe}-${Date.now().toString(36)}.${ext}`, { type: blob.type });
    try { await FP().createDirectory("data", `${DIR}/portraits`); } catch {}
    const r = await FP().upload("data", `${DIR}/portraits`, file, {}, { notify: false });
    return r?.path ?? "";
  } catch (e) { console.warn(MOD, "portrait", e); return ""; }
}
function guessUser(player) {
  if (!player || player === "-") return null;
  const p = player.toLowerCase();
  return game.users.find((u) => !u.isGM && (u.name.toLowerCase().includes(p) || p.includes(u.name.toLowerCase())))?.id ?? null;
}
export async function importFromText(text, opts = {}) {
  const b = await readBundle(text);
  const d = parseLedger(b.md);
  const img = opts.img || await savePortrait(b.img, d.front.character);
  return createFromLedger(d, { ...opts, img, userId: opts.userId ?? guessUser(d.front.player) });
}
export async function scanImportFolder(quiet = true) {
  if (!game.user.isGM) return 0;
  let res;
  try { res = await FP().browse("data", DIR); }
  catch { try { await FP().createDirectory("data", DIR); } catch {} if (!quiet) ui.notifications.info(`สร้างโฟลเดอร์ Data/${DIR} แล้ว วางไฟล์ตัวละครที่ผู้เล่นส่งมาไว้ที่นี่`); return 0; }
  const done = new Set(game.settings.get(MOD, "ledgerImported") ?? []);
  const files = (res.files ?? []).filter((f) => /\.(md|json|txt)$/i.test(f) && !done.has(f));
  const lines = [];
  for (const f of files) {
    try {
      const text = await (await fetch(f + "?t=" + Date.now())).text();
      const { actor, report } = await importFromText(text, { kit: true, spells: true });
      lines.push(`<b>${esc(actor.name)}</b><br>${report.map((r) => "• " + esc(r)).join("<br>")}`);
    } catch (e) { console.error(MOD, f, e); lines.push(`✗ ${esc(decodeURIComponent(f.split("/").pop()))}: ${esc(e.message)}`); }
    done.add(f);
  }
  await game.settings.set(MOD, "ledgerImported", [...done]);
  if (lines.length) ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card"><div class="rw-title">นำเข้าอัตโนมัติจาก ${DIR}</div>${lines.join("<hr>")}</div>` });
  else if (!quiet) ui.notifications.info(`ไม่มีไฟล์ใหม่ใน Data/${DIR}`);
  return files.length;
}
