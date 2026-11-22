// Table helpers: ask players for a roll, and reset the player characters before Chapter 1
import { starterKit } from "./pcs.js?v=21";
const MOD = "arkane-1920s";
const D = () => foundry.applications?.api?.DialogV2;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const SKILLS = [["prc", "Perception สังเกต"], ["inv", "Investigation สืบสวน"], ["ins", "Insight อ่านใจคน"], ["ste", "Stealth ลอบเร้น"], ["ath", "Athletics กรีฑา"],
  ["acr", "Acrobatics กายกรรม"], ["slt", "Sleight of Hand มือไว"], ["per", "Persuasion โน้มน้าว"], ["dec", "Deception หลอกลวง"], ["itm", "Intimidation ข่มขู่"],
  ["sur", "Survival เอาตัวรอด"], ["med", "Medicine การแพทย์"], ["arc", "Arcana ความรู้เวท"], ["his", "History ประวัติศาสตร์"], ["rel", "Religion ศาสนา"],
  ["nat", "Nature ธรรมชาติ"], ["ani", "Animal Handling จัดการสัตว์"], ["prf", "Performance การแสดง"]];
const ABIL = [["str", "STR พละกำลัง"], ["dex", "DEX ความว่องไว"], ["con", "CON ความอดทน"], ["int", "INT สติปัญญา"], ["wis", "WIS วิจารณญาณ"], ["cha", "CHA เสน่ห์"]];

// ---------- 1. ask the players for a roll: posts a chat card with a button each player clicks
export async function requestRoll() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const Dlg = D();
  const grp = (label, kind, list) => `<optgroup label="${label}">${list.map(([k, l]) => `<option value="${kind}:${k}">${esc(l)}</option>`).join("")}</optgroup>`;
  const players = game.users.filter((u) => !u.isGM && u.active);
  const content = `<div class="rw-form">
    <label>ให้ทอยอะไร <select name="what" style="font-size:1.1em">${grp("ทักษะ (Skill)", "skill", SKILLS)}${grp("เช็คค่าสถานะ (Ability Check)", "check", ABIL)}${grp("เซฟ (Saving Throw)", "save", ABIL)}</select></label>
    <label>DC <input type="number" name="dc" value="13" min="1" max="30"></label>
    <label class="rw-check"><input type="checkbox" name="hidedc"> ไม่บอก DC ให้ผู้เล่นเห็น</label>
    <div style="margin:6px 0"><b>ส่งให้</b><br>${players.map((u) => `<label class="rw-check"><input type="checkbox" name="u_${u.id}" checked> ${esc(u.character?.name ?? u.name)}</label>`).join("") || "<i>ไม่มีผู้เล่นออนไลน์</i>"}</div>
    <label>บอกผู้เล่นว่า (ไม่ใส่ก็ได้) <input type="text" name="why" placeholder="เช่น ได้ยินเสียงอะไรบางอย่างจากห้องใต้ดิน"></label>
  </div>`;
  const r = await Dlg.wait({ window: { title: "ขอให้ผู้เล่นทอยเช็ค" }, content,
    buttons: [{ action: "ok", label: "ส่งให้ผู้เล่น", default: true, callback: (ev, btn) => Object.fromEntries(new FormData(btn.form)) }, { action: "cancel", label: "ยกเลิก" }] });
  if (!r || r === "cancel") return;
  const dc = Number(r.dc) || 10;
  const [kind, key] = String(r.what).split(":");
  const name = (kind === "skill" ? SKILLS : ABIL).find((x) => x[0] === key)?.[1];
  const targets = Object.keys(r).filter((k) => k.startsWith("u_")).map((k) => k.slice(2));
  if (!targets.length) return ui.notifications.warn("ไม่ได้เลือกผู้เล่น");
  const msg = { t: "rollprompt", kind, skill: key, abil: key, dc, hidedc: !!r.hidedc, name, why: r.why ?? "", users: targets, gm: game.user.id };
  game.socket.emit(`module.${MOD}`, msg);
  ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card">ส่งหน้าต่างทอย <b>${esc(name)}</b>${kind === "save" ? " (เซฟ)" : ""} DC <b>${dc}</b>${r.hidedc ? " (ซ่อน)" : ""} ให้: ${targets.map((id) => esc(game.users.get(id)?.character?.name ?? game.users.get(id)?.name)).join(", ")}<br><small>ผลของแต่ละคนจะขึ้นกระซิบถึงคุณ</small></div>` });
}

// every client listens; the chosen players get a dialog in the middle of their screen
export function registerRollPrompt() {
  game.socket.on(`module.${MOD}`, (d) => {
    if (d?.t === "checkask") {
      if (d.from !== game.user.id) ui.notifications.info(`🎲 ${d.who} ขอทอย ${d.name}${d.why ? `: ${d.why}` : ""}`);
      if (game.users.activeGM?.isSelf) gmAsk(d);
    } else if (d?.t === "checkdeny") {
      if (d.to === game.user.id) ui.notifications.warn(d.closed ? `GM ยังไม่ตอบคำขอทอย ${d.name} (ลองขออีกครั้ง)` : `GM: ไม่ต้องทอย ${d.name}`);
    } else if (d?.t === "rollprompt" && d.users?.includes(game.user.id) && !game.user.isGM) showRollPrompt(d);
    else if (d?.t === "rollresult" && game.user.id === d.gm && d.hunt) huntResult(d);
    else if (d?.t === "rollresult" && game.user.id === d.gm) {
      const pass = d.dc ? (d.total >= d.dc ? "ผ่าน ✓" : "ไม่ผ่าน ✗") : "";
      ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card"><b>${esc(d.who)}</b> ทอย ${esc(d.name)} ได้ <b>${d.total}</b>${d.dc ? ` (DC ${d.dc}) ${pass}` : ""}</div>` });
    }
  });
}
// ---------- 1c. a player asks the GM for a check ("ขอทอยเช็ค"): the party sees who is doing what, the GM sets the DC, the player rolls
export async function askCheck(pre) {
  if (game.user.isGM) return ui.notifications.warn("ปุ่มนี้สำหรับผู้เล่น (GM ใช้มาโคร \"ขอให้ผู้เล่นทอยเช็ค\")");
  const actor = myActor();
  if (!actor) return ui.notifications.warn("ไม่พบตัวละครของคุณ");
  if (!game.users.activeGM) return ui.notifications.warn("ไม่มี GM ออนไลน์");
  const grp = (label, kind, list) => `<optgroup label="${label}">${list.map(([k, l]) => `<option value="${kind}:${k}"${pre && pre.kind === kind && pre.key === k ? " selected" : ""}>${esc(l)}</option>`).join("")}</optgroup>`;
  const content = `<div class="rw-form">
    <label>อยากทอยอะไร <select name="what" style="font-size:1.1em">${grp("ทักษะ (Skill)", "skill", SKILLS)}${grp("เช็คค่าสถานะ (Ability Check)", "check", ABIL)}</select></label>
    <label>คุณกำลังทำอะไร <input type="text" name="why" maxlength="120" placeholder="เช่น ขอโน้มน้าวยามให้เปิดประตู" autofocus></label>
    <p class="rw-hint">ทุกคนในตี้จะเห็นว่าคุณกำลังทำอะไร แล้ว GM จะกำหนด DC ให้</p></div>`;
  let r;
  try { r = await D().wait({ window: { title: `ขอทอยเช็ค · ${actor.name}`, icon: "fa-solid fa-dice-d20" }, position: { width: 380 }, content, rejectClose: false,
    buttons: [{ action: "ok", label: "ส่งให้ GM", default: true, icon: "fa-solid fa-paper-plane", callback: (ev, btn) => Object.fromEntries(new FormData(btn.form)) }, { action: "cancel", label: "ยกเลิก" }] }); } catch { r = null; }
  if (!r || r === "cancel") return;
  const [kind, key] = String(r.what).split(":");
  const name = (kind === "skill" ? SKILLS : ABIL).find((x) => x[0] === key)?.[1] ?? key;
  const why = String(r.why ?? "").trim().slice(0, 120);
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<div class="rw-card">🎲 <b>${esc(actor.name)}</b> ขอทอย <b>${esc(name)}</b>${why ? `<br><i>“${esc(why)}”</i>` : ""}<br><small>รอ GM กำหนด DC</small></div>` });
  game.socket.emit(`module.${MOD}`, { t: "checkask", from: game.user.id, who: actor.name, kind, key, name, why });
}
// Argon HUD: a player clicking a skill / ability check in the Skills panel asks the GM instead of rolling straight away
export function hookArgonAsk() {
  const proto = CONFIG.Actor?.documentClass?.prototype; if (!proto) return;
  for (const [fn, kind, field] of [["rollSkill", "skill", "skill"], ["rollAbilityCheck", "check", "ability"]]) {
    const orig = proto[fn]; if (typeof orig !== "function" || orig._arkAsk) continue;
    const wrapped = function (config, ...rest) {
      try {
        const ev = config?.event; const key = config?.[field];
        if (!game.user.isGM && key && ev?.target?.closest?.(".extended-combat-hud")) {
          askCheck({ kind, key }); return undefined;
        }
      } catch (e) { console.warn(MOD, "argon ask", e); }
      return orig.call(this, config, ...rest);
    };
    wrapped._arkAsk = true; proto[fn] = wrapped;
  }
}
// the active GM sees the request, picks the DC and sends the usual roll window to that player
async function gmAsk(d) {
  const quick = [10, 13, 15, 18, 20].map((n) => `<button type="button" style="flex:1" onclick="this.closest('form').elements.dc.value=${n}">${n}</button>`).join("");
  const content = `<div class="rw-form"><p style="font-size:1.15em;margin:4px 0"><b>${esc(d.who)}</b> ขอทอย <b>${esc(d.name)}</b></p>${d.why ? `<p><i>“${esc(d.why)}”</i></p>` : ""}
    <label>DC <input type="number" name="dc" value="13" min="1" max="30"></label><div style="display:flex;gap:4px;margin:4px 0">${quick}</div>
    <label class="rw-check"><input type="checkbox" name="hidedc"> ไม่บอก DC ให้ผู้เล่นเห็น</label></div>`;
  let r;
  try { r = await D().wait({ window: { title: `ผู้เล่นขอทอย: ${d.name}`, icon: "fa-solid fa-dice-d20" }, position: { width: 380 }, content, rejectClose: false,
    buttons: [{ action: "ok", label: "ทอย (ส่งให้ผู้เล่น)", default: true, icon: "fa-solid fa-dice-d20", callback: (ev, btn) => Object.fromEntries(new FormData(btn.form)) }, { action: "deny", label: "ไม่ต้องทอย" }] }); } catch { r = null; }
  if (!r || r === "deny") return game.socket.emit(`module.${MOD}`, { t: "checkdeny", to: d.from, who: d.who, name: d.name, closed: !r });
  const dc = Number(r.dc) || 10;
  game.socket.emit(`module.${MOD}`, { t: "rollprompt", kind: d.kind, skill: d.key, abil: d.key, dc, hidedc: !!r.hidedc, name: d.name, why: d.why ?? "", users: [d.from], gm: game.user.id });
  ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card">ส่งทอย <b>${esc(d.name)}</b> DC <b>${dc}</b>${r.hidedc ? " (ซ่อน)" : ""} ให้ <b>${esc(d.who)}</b></div>` });
}
function myActor() {
  return game.user.character ?? canvas?.tokens?.controlled?.[0]?.actor ?? game.actors.find((a) => a.type === "character" && a.isOwner && !a.getFlag(MOD, "later"));
}
async function showRollPrompt(d) {
  const actor = myActor();
  if (!actor) return ui.notifications.warn("ไม่พบตัวละครของคุณ");
  const roll = async () => {
    const fn = d.kind === "skill" ? "rollSkill" : d.kind === "save" ? "rollSavingThrow" : "rollAbilityCheck";
    const cfg = d.kind === "skill" ? { skill: d.skill } : { ability: d.abil };
    let res;
    const msgOpt = d.rollMode ? { rollMode: d.rollMode } : undefined;
    try { res = await actor[fn]({ ...cfg, ...(d.hidedc ? {} : { target: d.dc }) }, { configure: false }, msgOpt); }
    catch (e) {
      try { res = await actor[fn](d.kind === "skill" ? d.skill : d.abil, { fastForward: true, chatMessage: true, ...(d.rollMode ? { rollMode: d.rollMode } : {}) }); } catch (e2) { console.warn(MOD, "roll", e, e2); ui.notifications.error("ทอยไม่สำเร็จ ลองกดปุ่มบนชีตตัวละครแทน"); return; }
    }
    const r = Array.isArray(res) ? res[0] : res;
    if (r?.total !== undefined) game.socket.emit(`module.${MOD}`, { t: "rollresult", gm: d.gm, who: actor.name, name: d.name, total: r.total, dc: d.hidedc ? 0 : d.dc, hdc: d.dc, hunt: !!d.hunt, actorId: actor.id, notice: d.notice });
  };
  new (D())({ window: { title: `DM ขอให้ทอย: ${d.name}`, icon: "fa-solid fa-dice-d20" }, position: { width: 340 },
    content: `<div class="rw-form" style="text-align:center"><p style="font-size:1.3em;margin:6px 0"><b>${esc(d.name)}</b>${d.kind === "save" ? " (เซฟ)" : ""}</p>${d.hidedc ? "" : `<p>DC <b>${d.dc}</b></p>`}${d.why ? `<p><i>${esc(d.why)}</i></p>` : ""}<p class="rw-hint">ตัวละคร: ${esc(actor.name)}</p></div>`,
    buttons: [{ action: "n", label: "ทอย", default: true, icon: "fa-solid fa-dice-d20", callback: roll }] }).render({ force: true });
}

// ---------- 1b. Perry's secret nightly hunt: only her player gets a prompt (private roll), the result comes back to the GM alone
export async function perryHunt() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const pcs = game.actors.filter((a) => a.type === "character" && a.hasPlayerOwner && !a.getFlag(MOD, "retired"));
  const perry = pcs.find((a) => a.getFlag(MOD, "pc") === "perry" || /เพอร์รี่|perry/i.test(a.name));
  if (!perry) return ui.notifications.warn("ยังไม่มีตัวละครเพอร์รี่ในระบบ (สร้างตัวละครก่อน แล้วกดมาโครนี้อีกครั้ง)");
  const owner = game.users.find((u) => !u.isGM && perry.testUserPermission(u, "OWNER"));
  const days = perry.getFlag(MOD, "huntDays") ?? 0;
  const Dlg = D();
  const r = await Dlg.wait({ window: { title: "Midnight Hunt (ลับ) · เพอร์รี่" },
    content: `<div class="rw-form"><p class="rw-hint">ก่อน Long Rest ของวัน · ถ้าวันนี้เพอร์รี่ใช้คาถา Hadar สูบเหยื่อไปแล้ว กด "Hadar กินแล้ว" ไม่ต้องทอย<br>อดล่ามาแล้ว <b>${days}</b> วัน ${days >= 3 ? "(ครบ 3–4 วัน: พิจารณา Exhaustion)" : ""}</p>
      <label>DC (Stealth หรือ Survival ที่ดีกว่า) <select name="dc"><option>13</option><option selected>14</option><option>15</option></select></label>
      <label>เพื่อนสังเกตเห็นเมื่อ Passive Perception ≥ <input type="number" name="notice" value="15" min="5" max="25"></label>
      ${owner?.active ? "" : `<p style="color:#a33">ผู้เล่นเพอร์รี่ยังไม่ออนไลน์</p>`}</div>`,
    buttons: [{ action: "roll", label: "ส่งทอยลับให้เพอร์รี่", default: true, callback: (ev, btn) => Object.fromEntries(new FormData(btn.form)) },
      { action: "fed", label: "Hadar กินแล้ววันนี้ (ข้าม)" }, { action: "skip", label: "เธอไม่ได้ล่า (+1 วัน)" }, { action: "cancel", label: "ปิด" }] });
  const whisper = (html) => ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card">${html}</div>` });
  if (r === "fed") { await perry.setFlag(MOD, "huntDays", 0); return whisper(`<b>${esc(perry.name)}</b>: Hadar กินแล้ววันนี้ ไม่ต้องทอย (ตัวนับอดล่า = 0)`); }
  if (r === "skip") { const n = days + 1; await perry.setFlag(MOD, "huntDays", n); return whisper(`<b>${esc(perry.name)}</b>: ไม่ได้ล่าคืนนี้ อดมา ${n} วัน${n >= 3 ? " · ครบ 3–4 วัน พิจารณาให้ติด Exhaustion" : ""}`); }
  if (!r || r === "cancel") return;
  if (!owner?.active) return ui.notifications.warn("ผู้เล่นเพอร์รี่ยังไม่ออนไลน์");
  const mod = (k) => perry.system.skills?.[k]?.total ?? perry.system.skills?.[k]?.mod ?? 0;
  const key = mod("ste") >= mod("sur") ? "ste" : "sur";
  const name = SKILLS.find((x) => x[0] === key)[1];
  game.socket.emit(`module.${MOD}`, { t: "rollprompt", kind: "skill", skill: key, abil: key, dc: Number(r.dc), hidedc: true, name, why: "", users: [owner.id], gm: game.user.id, hunt: true, rollMode: "gmroll", notice: Number(r.notice) || 15 });
  whisper(`ส่งทอยลับ ${esc(name)} (DC ${r.dc}) ให้ผู้เล่นของ <b>${esc(perry.name)}</b> แล้ว · ผลจะขึ้นที่นี่เฉพาะคุณ`);
}
async function huntResult(d) {
  const perry = game.actors.get(d.actorId);
  const ok = d.total >= d.hdc;
  const loss = ok ? 0 : (await new Roll("1d4").evaluate()).total;
  if (perry) await perry.setFlag(MOD, "huntDays", 0);
  let lensNote = ""; if (perry) { try { const g = await import("./gauge.js?v=1"); const o = await g.huntOutcome(perry, d.total - d.hdc); lensNote = `<br><small>ระบบ Gauge: ${o === "pass" ? "กินอิ่มเงียบ" : o === "minor" ? "กินอิ่ม แต่มีคราบเลือด" : "พลาดหนัก ไม่อิ่ม (RSF ยังนับต่อ)"}</small>`; } catch (e) { console.warn(MOD, "lens hunt", e); } }
  const seers = game.actors.filter((a) => a.type === "character" && a.hasPlayerOwner && a.id !== d.actorId && !a.getFlag(MOD, "later") && !a.getFlag(MOD, "retired") && (a.system.skills?.prc?.passive ?? 10) >= (d.notice ?? 15));
  const html = ok
    ? `<b>${esc(d.who)}</b> ทอย ${esc(d.name)} ได้ <b>${d.total}</b> (DC ${d.hdc}) <b>ผ่าน ✓</b><br>ล่าเงียบเชียบ ป้อน Hadar สำเร็จ กลับมาพักได้ไม่มีร่องรอย`
    : `<b>${esc(d.who)}</b> ทอย ${esc(d.name)} ได้ <b>${d.total}</b> (DC ${d.hdc}) <b>ไม่ผ่าน ✗</b><br>ป้อน Hadar สำเร็จแต่ทุลักทุเล · เสีย HP <b>${loss}</b> (1d4 ยังไม่ได้หักให้) หรือมีคราบเลือดดำ/ไอเย็นติดเสื้อ<br>
      เช้าวันถัดไป ผู้ที่ Passive Perception ≥ ${d.notice ?? 15}: <b>${seers.map((a) => esc(a.name)).join(", ") || "ไม่มี"}</b> สังเกตเห็นรอยผิดปกติ · คนอื่นขอทอย Perception/Medicine ได้<br>
      ถ้าใครแอบตื่นมาดูตอนกลางคืน ให้ทอย Stealth/Perception แข่งกับเพอร์รี่`;
  ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card">${html}<br><small>ตัวนับอดล่ารีเซ็ตเป็น 0 แล้ว</small>${lensNote}</div>` });
}

// ---------- 2. before Chapter 1: remove everything picked up in the practice scene, give the starter kit back, full rest
const PHYSICAL = ["weapon", "equipment", "consumable", "tool", "loot", "container", "backpack"];
export async function startChapter1() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const pcs = game.actors.filter((a) => a.type === "character" && a.getFlag(MOD, "pc") && !a.getFlag(MOD, "later"));
  if (!pcs.length) return ui.notifications.warn("ไม่พบตัวละครผู้เล่นของโมดูล");
  const content = `<div class="rw-form">
    <p class="rw-hint">ตัวละครที่เลือกจะถูก <b>ล้างของในกระเป๋าทั้งหมด</b> (อาวุธ เกราะ ของใช้ ของที่เก็บจากฉากซ้อม) แล้วได้ <b>ของเริ่มต้นและเงินเริ่มต้น</b> กลับมา · HP เต็ม ช่องเวทและความสามารถคืนครบ · เวท ความสามารถ และเลเวลไม่ถูกแตะ · ย้อนกลับไม่ได้</p>
    ${pcs.map((a) => `<label class="rw-check"><input type="checkbox" name="a" value="${a.id}" checked> ${esc(a.name)} <small>(ของ ${a.items.filter((i) => PHYSICAL.includes(i.type)).length} ชิ้น)</small></label>`).join("")}
    <label class="rw-check" style="margin-top:6px"><input type="checkbox" name="dread" checked> ล้างแต้มหวาดผวา (Dread) และอาการทั้งหมดเป็น 0</label>
    <label class="rw-check"><input type="checkbox" name="scene" checked> เปิดฉาก Chapter 1: บาร์ The Rusty Wand ให้ทุกคน</label>
    <label class="rw-check"><input type="checkbox" name="intro" checked> ส่งข้อความเปิดเรื่องส่วนตัวให้ผู้เล่นแต่ละคน (รหัสผ่าน / จดหมาย A.P.)</label>
  </div>`;
  const r = await D().wait({ window: { title: "เริ่ม Chapter 1: รีเซ็ตตัวละครหลังฉากซ้อม" }, content,
    buttons: [{ action: "ok", label: "รีเซ็ตและเริ่มเล่น", default: true, callback: (ev, btn) => ({
      ids: [...btn.form.querySelectorAll("input[name=a]:checked")].map((i) => i.value),
      dread: btn.form.querySelector("input[name=dread]").checked, scene: btn.form.querySelector("input[name=scene]").checked,
      intro: btn.form.querySelector("input[name=intro]").checked }) },
      { action: "cancel", label: "ยกเลิก" }] });
  if (!r || r === "cancel") return;
  const lines = [];
  for (const id of r.ids) {
    const a = game.actors.get(id); if (!a) continue;
    try {
      const kit = starterKit(a.getFlag(MOD, "pc"));
      const old = a.items.filter((i) => PHYSICAL.includes(i.type)).map((i) => i.id);
      if (old.length) await a.deleteEmbeddedDocuments("Item", old);
      if (kit) {
        await a.createEmbeddedDocuments("Item", kit.items);
        await a.update({ "system.currency": { pp: 0, gp: kit.gp, ep: 0, sp: 0, cp: 0 } });
      }
      try { await a.longRest({ dialog: false, chat: false, newDay: true }); } catch (e) { console.warn(MOD, "rest", e); }
      await a.update({ "system.attributes.hp.value": a.system.attributes.hp.max, "system.attributes.hp.temp": 0, "system.attributes.death.success": 0, "system.attributes.death.failure": 0 });
      if (r.dread) {
        await a.setFlag(MOD, "dread", 0); await a.unsetFlag(MOD, "voices");
        const fx = a.effects.filter((e) => e.getFlag(MOD, "symptom")).map((e) => e.id);
        if (fx.length) await a.deleteEmbeddedDocuments("ActiveEffect", fx);
        for (const s of ["frightened", "poisoned", "unconscious", "prone"]) { try { await a.toggleStatusEffect?.(s, { active: false }); } catch {} }
      }
      lines.push(`${esc(a.name)}: ล้างของ ${old.length} ชิ้น · ได้ของเริ่มต้น ${kit?.items.length ?? 0} ชิ้น · เงิน $${kit?.gp ?? 0}`);
    } catch (e) { console.error(MOD, "start ch1", a.name, e); lines.push(`${esc(a.name)}: ผิดพลาด (ดู Console F12)`); }
  }
  try { await game.arkane?.fixGuns?.(true); await game.arkane?.applyArt?.(true); } catch {}
  try { await game.arkane?.createBlackMarket?.(); game.actors.find((x) => x.getFlag(MOD, "merchant"))?.sheet?.close(); const n = await game.arkane?.balancePrices?.(true); lines.push(`ร้านฟินช์เติมของใหม่และปรับราคา (ขาย 110% · รับซื้อ 50%)`); } catch (e) { console.warn(MOD, "shop", e); }
  if (r.scene) {
    const sc = game.scenes.find((s) => /Rusty Wand/i.test(s.name) && /Chapter 1/i.test(s.name)) ?? game.scenes.find((s) => /Rusty Wand/i.test(s.name));
    if (sc) { await sc.activate(); lines.push(`เปิดฉาก: ${esc(sc.name)}`); lines.push(await lineUpPcs(sc, r.ids)); } else lines.push("ไม่พบฉากบาร์ The Rusty Wand (กดมาโคร สร้างฉาก ก่อน)");
  }
  if (r.intro) lines.push(await sendIntros(r.ids));
  ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card"><div class="rw-title">พร้อมเริ่ม Chapter 1</div>${lines.join("<br>")}</div>` });
}

// put every PC token in one column next to the left-most PC already on the map (outside the bar), adding missing ones
async function lineUpPcs(scene, ids) {
  const g = scene.grid.size;
  const actors = ids.map((id) => game.actors.get(id)).filter(Boolean);
  const toks = scene.tokens.filter((t) => actors.some((a) => a.id === t.actorId));
  const anchor = [...toks].sort((a, b) => a.x - b.x || a.y - b.y)[0];
  const x = anchor?.x ?? Math.round(scene.dimensions.sceneX / g) * g + g;
  const top = toks.filter((t) => Math.abs(t.x - x) < g).reduce((m, t) => Math.min(m, t.y), anchor?.y ?? Math.round(scene.dimensions.sceneY / g) * g + g);
  const ups = [], add = [];
  for (const [i, a] of actors.entries()) {
    const at = { x, y: top + i * g };
    const tk = toks.find((t) => t.actorId === a.id);
    if (tk) ups.push({ _id: tk.id, ...at });
    else add.push({ ...(await a.getTokenDocument()).toObject(), ...at });
  }
  if (ups.length) await scene.updateEmbeddedDocuments("Token", ups, { animate: false, teleport: true });
  if (add.length) await scene.createEmbeddedDocuments("Token", add);
  return `วางโทเคนผู้เล่น ${actors.length} คนเรียงกันหน้าร้าน${add.length ? ` (เพิ่มใหม่ ${add.length})` : ""}`;
}

// ---------- private opening messages: how each character knows about the bar tonight
const LETTER = `<div style="background:#F6EEDB;border:1px solid #9A6B2C;padding:8px 10px;font-family:serif;font-style:italic;color:#2B2620">
ถึงคุณ Spencer ผู้นำทาง<br><br>ผมได้ยินว่าคุณรู้ทางออกจากเมืองโดยไม่ผ่านด่าน พบผมที่ The Rusty Wand คืนพรุ่งนี้หลังพลบค่ำ
เคาะประตูหลังร้านตัดสูทย่านโรงงาน ถ้าถูกถามว่าวัดตัวสูทสีไหน ตอบ <b>"สีดำ ไม่ต้องรีด"</b><br><br>
ค่าจ้าง 50 ดอลลาร์ จ่ายครึ่งหนึ่งเมื่อพบกัน<br><div style="text-align:right">— A.P.</div></div>`;
const INTRO = {
  vivian: { title: "จดหมายในกระเป๋าของคุณ", body: `เมื่อวานมีเด็กส่งจดหมายผนึกครั่งแดงมาให้คุณ ไม่มีชื่อผู้ส่ง มีแค่อักษรย่อท้ายจดหมาย:${LETTER}
      <p>คุณไม่รู้จัก "A.P." และไม่เคยเห็นหน้าเขา คืนนี้คุณมาตามนัด · จดหมายฉบับนี้อยู่ในกระเป๋าของคุณ (ดูในชีท แท็บ Inventory)</p>`, letter: true },
  mozxorion: { title: "สิ่งที่ลูกเรือรุ่นพี่บอกคุณ", body: `<p>เรือที่คุณคุ้มกันเพิ่งเทียบท่าอาร์คเคนบ่ายนี้ ลูกเรือรุ่นพี่ตบไหล่คุณแล้วกระซิบ:</p>
      <p><i>"อยากได้เหล้าดีๆ กับเรื่องเล่าดีๆ ไปที่ร้านตัดสูทย่านโรงงาน เดินเข้าซอยข้างร้านไปประตูหลัง ถ้าเขาถามว่าวัดตัวสูทสีไหน ตอบว่า <b>'สีดำ ไม่ต้องรีด'</b> ที่นั่นทหารผ่านศึกเยอะ เรื่องสงครามมีให้ฟังทั้งคืน"</i></p>
      <p>คืนนี้เรือยังไม่ออก คุณมีเวลาทั้งคืน</p>` },
  nincolas: { title: "ข่าวลือที่คุณได้ยินมา", body: `<p>ที่โต๊ะพนันในตรอก มีคนพูดถึงนายจ้างคนหนึ่งที่ <b>จ่ายค่าตอบแทนดีมาก</b> และคืนนี้จะไปนั่งที่บาร์ลับ The Rusty Wand</p>
      <p>คุณรู้แค่ว่าบาร์อยู่ใต้ร้านตัดสูทย่านโรงงาน เข้าทางประตูหลัง และ <b>ต้องมีรหัสผ่าน</b> ซึ่งคุณยังไม่รู้</p>
      <p><i>หาทางเข้าเอาเอง: แอบฟังคนอื่นตอบรหัส ล้วงกระดาษจากคนที่รอคิว หรือหว่านเงินใส่คนเฝ้าประตู</i></p>` },
  heinz: { title: "สิ่งที่คุณตามหามาถึงที่นี่", body: `<p>ช่างฝีมือรุ่นเก่าที่คุณรู้จักกระซิบว่า มีร้านตัดสูทย่านโรงงานที่ด้านหลังเป็นบาร์ใต้ดิน คนที่นั่นซื้อขายชิ้นส่วนกลไกเวทมนตร์ที่หาไม่ได้ในร้านทั่วไป และบางครั้งมีนายทุนที่ยอมจ่ายเงินให้นักประดิษฐ์ที่มีฝีมือจริง</p>
      <p>คุณมาคืนนี้พร้อมสมุดแบบแปลน เครื่องต้นแบบหิ้วมือหนึ่งเครื่อง และเงินติดตัวไม่กี่เหรียญ · ปุ่มแดงบนเครื่องต้นแบบยังไม่เคยถูกกด และคุณตั้งใจให้เป็นแบบนั้นต่อไป</p>
      <p><i>ก่อนเริ่มเล่น บอก DM: คุณรู้รหัสเข้าบาร์จากใคร หรือจะหาทางเข้าเอง (ฟังคนอื่น เสนอซ่อมของให้คนเฝ้าประตู ฯลฯ)</i></p>` },
  heinz2: { title: "เช้าวันที่ 2 · ที่แผงฟินช์ (รอตี้มา)", body: `<p>คุณมายืนรอที่ซอยแคบระหว่างโกดัง 2 กับโกดัง 4 ตั้งแต่เช้า ที่นี่ <b>ฟินช์ ลิ้นทอง</b> พ่อค้าตลาดมืดตั้งแผงขายของเถื่อน และเมื่อคืนเขาบอกว่าคุณมาถูกที่แล้ว</p>
      <p>สิ่งที่คุณตามหาคือ <b>เกียร์หัวใจ</b> ชิ้นส่วนกลไกเวทหายากที่ฟินช์เคยมีไว้ในมือ แต่เขา <b>ขายให้กลุ่มซินดิเคทไปแล้ว</b> ฟินช์รู้ว่าพวกนั้นเก็บของไว้ในตู้คอนเทนเนอร์ที่ผูกกลไกให้เต้นตุบๆ ในโกดัง 4 และเปิดเองไม่ได้ ต้องใช้คนที่เข้าใจกลไกอย่างคุณ</p>
      <p>ตอนนี้ถนนรอบๆ มีรถของ C.A.A.M. ปิดทางไว้ และมีกลุ่มคนแปลกหน้าไม่กี่คนกำลังเดินมาทางซอย ฟินช์กระซิบว่า <i>"พวกนั้นก็ตามหาของเดียวกัน อาจเป็นพวกเดียวกับคุณ หรืออาจเป็นคู่แข่ง"</i></p>
      <p><i>ระหว่างรอ บอก DM: คุณจะทำตัวยังไงเมื่อคนแปลกหน้ามาถึง (ทักก่อน แอบดู หรือรอให้ฟินช์แนะนำ) และคุณยอมเสนออะไรเพื่อแลกกับการเข้าโกดัง</i></p>` },
  windows: { title: "คืนนี้คุณมาที่นี่ทำไม", body: `<p>คุณรู้จักร้านตัดสูทย่านโรงงานดี เพราะมันอยู่ในเขตที่คุณดูแล และคุณรู้ว่าใต้ร้านมีบาร์เถื่อนชื่อ The Rusty Wand คนเฝ้าประตูจำหน้าคุณได้ <b>ไม่ต้องใช้รหัส</b></p>
      <p>ก่อนเริ่มเล่น ตอบ DM หนึ่งข้อ: <b>คืนนี้คุณมาที่นี่ทำไม</b></p><ul>
      <li>มาเก็บ "ค่าคุ้มครอง" จากเจ้าของร้านตามปกติ</li><li>มาสืบคดีเงียบๆ เผื่อได้คดีใหญ่ที่จะทำให้คุณก้าวหน้า</li><li>ได้ข่าวว่ามีของมีค่ามาอยู่ในบาร์คืนนี้</li><li>หรือเหตุผลของคุณเอง</li></ul>` }
};
const ownersOf = (a) => game.users.filter((u) => !u.isGM && a.testUserPermission(u, "OWNER")).map((u) => u.id);
export async function sendIntros(ids, alt = {}) {
  const actors = (ids ?? game.actors.filter((a) => a.getFlag(MOD, "pc") && !a.getFlag(MOD, "later")).map((a) => a.id)).map((id) => game.actors.get(id)).filter(Boolean);
  const out = [];
  for (const a of actors) {
    const key = a.getFlag(MOD, "pc"), it = INTRO[alt[key] ?? key];
    if (!it) continue;
    if (it.letter && !alt[key] && !a.items.find((i) => /จดหมายจ้างวาน/.test(i.name))) {
      await a.createEmbeddedDocuments("Item", [{ name: "จดหมายจ้างวาน (A.P.)", type: "loot", img: `modules/${MOD}/items/story-letter-ap.webp`,
        flags: { [MOD]: { id: "story-จดหมายจ้างวาน (A.P.)" } }, system: { description: { value: LETTER } } }]);
    }
    const to = ownersOf(a);
    await ChatMessage.create({ whisper: [...to, game.user.id], speaker: { alias: a.name },
      content: `<div class="rw-card"><div class="rw-title">${esc(a.name)} · ${it.title}</div>${it.body}<p style="font-size:11px;opacity:.7">ข้อความนี้เห็นแค่คุณกับ DM</p></div>` });
    out.push(`${esc(a.name)}${to.length ? "" : " (ยังไม่มีผู้เล่นเป็นเจ้าของ ส่งให้ DM อย่างเดียว)"}`);
  }
  return `ส่งข้อความเปิดเรื่องให้: ${out.join(", ") || "-"}`;
}

// Heinz's player gets his waiting-at-Finch's-stall intro before he officially joins the party
export async function sendHeinzWait() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const a = game.actors.find((x) => x.getFlag(MOD, "pc") === "heinz");
  if (!a) return ui.notifications.warn("ยังไม่มีตัวละครไฮนซ์ · กดมาโคร 'สร้างตัวละครผู้เล่น' ก่อน");
  await sendIntros([a.id], { heinz: "heinz2" });
  await a.setFlag(MOD, "introSent", true);
  ui.notifications.info("ส่งข้อความรอที่แผงฟินช์ให้ผู้เล่นไฮนซ์แล้ว (ตัวละครยังไม่เข้าตี้)");
}

// Give back any starter-kit item a character is missing (matched by name). Adds only, never removes. Default target: selected token, else Dr. Heinz.
export async function restoreKit() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const a = canvas?.tokens?.controlled?.[0]?.actor ?? game.actors.find((x) => x.getFlag(MOD, "pc") === "heinz");
  if (!a) return ui.notifications.warn("เลือกโทเคนตัวละครก่อน (หรือยังไม่มีตัวละครไฮนซ์)");
  const key = a.getFlag(MOD, "pc");
  const kit = starterKit(key);
  if (!kit) return ui.notifications.warn(`${a.name}: ไม่มีชุดของเริ่มต้นในโมดูล`);
  const have = new Set(a.items.map((i) => i.name));
  const miss = kit.items.filter((i) => !have.has(i.name));
  if (miss.length) await a.createEmbeddedDocuments("Item", miss);
  const msg = miss.length ? `คืนของให้ ${esc(a.name)} ${miss.length} ชิ้น: ${miss.map((i) => esc(i.name)).join(", ")}` : `${esc(a.name)} มีของเริ่มต้นครบแล้ว`;
  await ChatMessage.create({ whisper: [game.user.id], speaker: { alias: "ระบบ" }, content: `<div class="rw-card">${msg}</div>` });
  ui.notifications.info(msg.replace(/&amp;/g, "&"));
}

// ---------- move the whole party to a scene (and line their tokens up)
export async function goToScene() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const scenes = game.scenes.contents.slice().sort((a, b) => a.name.localeCompare(b.name, "th"));
  const pcs = game.actors.filter((a) => a.getFlag(MOD, "pc") && !a.getFlag(MOD, "later"));
  const content = `<div class="rw-form">
    <label>ไปฉาก <select name="scene">${scenes.map((s) => `<option value="${s.id}" ${s.id === game.scenes.active?.id ? "selected" : ""}>${esc(s.name)}</option>`).join("")}</select></label>
    <label class="rw-check"><input type="checkbox" name="line" checked> วางโทเคนผู้เล่นทุกคนเรียงกันในฉากนั้น (ยังไม่มีก็สร้างให้)</label>
    <p class="rw-hint">ระบบจะ Activate ฉากให้ทุกคนย้ายตามทันที · เพลงประกอบเปลี่ยนเองตามฉาก</p>
  </div>`;
  const r = await D().wait({ window: { title: "พาผู้เล่นไปฉาก" }, content,
    buttons: [{ action: "ok", label: "ไป", default: true, callback: (ev, btn) => ({ id: btn.form.querySelector("select[name=scene]").value, line: btn.form.querySelector("input[name=line]").checked }) },
      { action: "cancel", label: "ยกเลิก" }] });
  if (!r || r === "cancel") return;
  const sc = game.scenes.get(r.id);
  if (!sc) return;
  let note = "";
  if (r.line) { try { note = " · " + await lineUpPcs(sc, pcs.map((a) => a.id)); } catch (e) { console.warn(MOD, "goToScene", e); } }
  await sc.activate();
  ui.notifications.info(`พาทุกคนไปที่ ${sc.name}${note}`);
}
