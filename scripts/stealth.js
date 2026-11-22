// Stealth (Hide) and stealing (pickpocket from NPCs, GM approves)
import { takeCopy, removeFrom } from "./bag.js?v=21";
const MOD = "arkane-1920s", SOCK = `module.${MOD}`;
const esc = (s) => foundry.utils.escapeHTML(String(s ?? ""));
const num = (x) => Number(x) || 0;
const passive = (a) => num(a?.system?.skills?.prc?.passive ?? 10);
const hostiles = () => (canvas.tokens?.placeables ?? []).filter((t) => t.actor && t.document.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE && !t.document.hidden && num(t.actor.system?.attributes?.hp?.value ?? 1) > 0);
const ownersOf = (a) => [...game.users].filter((u) => u.isGM || a.testUserPermission(u, "OWNER")).map((u) => u.id);
const gmIds = () => [...game.users].filter((u) => u.isGM).map((u) => u.id);
const HIDE_ALPHA = 0.45;
const hideOf = (actor) => actor?.getFlag?.(MOD, "hide") ?? null;
const rollTotal = (r) => (Array.isArray(r) ? r[0]?.total : r?.total);

// ---------------------------------------------------------------- Hide
const inCombat = () => !!game.combat?.started;
export function banner(title, sub) {
  const d = document.createElement("div");
  d.style.cssText = "position:fixed;left:50%;top:30%;transform:translateX(-50%);z-index:100000;padding:18px 44px;text-align:center;background:linear-gradient(#2a2218f0,#15110bf0);border:2px solid #C9A25D;border-radius:10px;box-shadow:0 10px 40px #000;color:#FFF1C9;font:700 28px/1.3 Sarabun,sans-serif;pointer-events:none;opacity:0;transition:opacity .35s";
  d.innerHTML = `<div>${esc(title)}</div>${sub ? `<div style="font-size:16px;font-weight:400;color:#E8DCC0;margin-top:4px">${esc(sub)}</div>` : ""}`;
  document.body.append(d); requestAnimationFrame(() => (d.style.opacity = "1"));
  setTimeout(() => { d.style.opacity = "0"; setTimeout(() => d.remove(), 400); }, 3800);
}
const MODES = { advantage: "ได้เปรียบ", disadvantage: "เสียเปรียบ" };

// entry point (Hide button / token HUD): GM chooses the roll mode, players may only do it in combat
export async function requestHide(actor) {
  if (!actor) return;
  if (!game.user.isGM) {
    if (!inCombat()) return ui.notifications.warn("นอกการต่อสู้ ซ่อนตัวไม่ได้ ให้ DM เป็นคนสั่ง");
    return callHide({ actor: actor.uuid, mode: null, self: true });
  }
  const mode = await foundry.applications.api.DialogV2.wait({
    window: { title: `สั่งซ่อนตัว · ${actor.name}` }, content: `<p>เลือกรูปแบบการทอย Stealth</p>`, rejectClose: false,
    buttons: [{ action: "normal", label: "ปกติ", default: true }, { action: "advantage", label: "ได้เปรียบ" }, { action: "disadvantage", label: "เสียเปรียบ" }]
  });
  if (!mode) return;
  callHide({ actor: actor.uuid, mode: mode === "normal" ? null : mode, self: false });
}
function callHide(d) {
  const actor = fromUuidSync(d.actor);
  const owner = [...game.users].find((u) => u.active && !u.isGM && actor?.testUserPermission(u, "OWNER"));
  d = { ...d, t: "s-hidecall", by: game.user.id, roller: d.self ? game.user.id : (owner?.id ?? game.users.activeGM?.id ?? game.user.id) };
  game.socket.emit(SOCK, d); onCall(d);
}
async function onCall(d) {
  const actor = await fromUuid(d.actor); if (!actor) return;
  banner(`${actor.name} กำลังซ่อนตัว`, d.mode ? `ทอย Stealth แบบ${MODES[d.mode]}` : "ทอย Stealth");
  if (d.roller !== game.user.id) return;
  if (!game.user.isGM) {
    const go = await foundry.applications.api.DialogV2.prompt({ window: { title: `ซ่อนตัว · ${actor.name}` }, content: `<p style="text-align:center">ทอย Stealth เพื่อซ่อนตัว${d.mode ? ` (DM สั่งให้ทอยแบบ${MODES[d.mode]})` : ""}</p>`, ok: { label: "ทอย", callback: () => true }, rejectClose: false });
    if (!go) return;
  }
  return rollHide(actor, d.mode);
}
async function rollHide(actor, mode) {
  let total; try { const cfg = { skill: "ste" }; if (mode) cfg[mode] = true; total = rollTotal(await actor.rollSkill(cfg, { configure: false })); } catch (e) { console.warn(MOD, "stealth roll", e); }
  if (total == null) return;
  const hs = hostiles(), seen = hs.filter((t) => passive(t.actor) >= total), unseen = hs.filter((t) => passive(t.actor) < total);
  await actor.setFlag(MOD, "hide", { total, seen: seen.map((t) => t.id) });
  for (const t of actor.getActiveTokens()) t.document.update({ alpha: HIDE_ALPHA }, { arkaneHide: true }).catch(() => {});
  try { if (CONFIG.statusEffects.some((s) => s.id === "hiding")) await actor.toggleStatusEffect("hiding", { active: true }); } catch {}
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<div class="rw-card"><div class="rw-title">ซ่อนตัว</div><b>${esc(actor.name)}</b> หลบเข้าเงามืด (Stealth ${total}) · โจมตีจากที่ซ่อนได้แบบได้เปรียบ แต่โจมตีหรือส่งเสียงแล้วจะถูกเปิดโปง</div>` });
  await ChatMessage.create({ whisper: gmIds(), speaker: { alias: "ซ่อนตัว (DM)" }, content: `<div class="rw-card"><b>${esc(actor.name)}</b> Stealth ${total}<br>เห็นตัว: ${seen.map((t) => `${esc(t.name)} (${passive(t.actor)})`).join(", ") || "ไม่มี"}<br>มองไม่เห็น: ${unseen.map((t) => `${esc(t.name)} (${passive(t.actor)})`).join(", ") || "ไม่มี"}</div>` });
}
export async function endHide(actor, why = "ถูกเปิดโปง") {
  if (!hideOf(actor)) return;
  await actor.unsetFlag(MOD, "hide");
  for (const t of actor.getActiveTokens()) t.document.update({ alpha: 1 }, { arkaneHide: true }).catch(() => {});
  try { await actor.toggleStatusEffect?.("hiding", { active: false }); } catch {}
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<div class="rw-card"><b>${esc(actor.name)}</b> ${esc(why)} · ไม่ซ่อนอยู่แล้ว</div>` });
}
const isHideItem = (item) => item?.name === "Hide" || item?.flags?.statusId?.id === "dnd5ehiding00000" || item?.getFlag?.("core", "statusId") === "hiding";
function onUse(item, activity) {
  try {
    const actor = item?.actor; if (!actor) return;
    if (isHideItem(item)) return requestHide(actor);
    if (hideOf(actor) && ["attack", "save", "damage"].includes(activity?.type)) endHide(actor, "โจมตีจากที่ซ่อน");
  } catch (e) { console.warn(MOD, "stealth use", e); }
}
const setAdv = (config, key) => { config[key] = true; for (const r of config.rolls ?? []) { r.options ??= {}; r.options[key] = true; } };
function preAttack(config) {
  try {
    const act = config?.subject ?? config?.activity, item = act?.item, actor = item?.actor; if (!actor) return;
    if (hideOf(actor)) { setAdv(config, "advantage"); ui.notifications.info(`${actor.name} โจมตีจากที่ซ่อน · ได้เปรียบ`); return; }
    const tgt = [...game.user.targets][0], hide = hideOf(tgt?.actor); if (!hide) return;
    const src = actor.getActiveTokens()[0];
    if (src && src.document.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE && !hide.seen?.includes(src.id)) { setAdv(config, "disadvantage"); ui.notifications.info(`${tgt.name} ซ่อนอยู่ · ${src.name} มองไม่เห็น โจมตีแบบเสียเปรียบ`); }
  } catch (e) { console.warn(MOD, "stealth attack", e); }
}

// ---------------------------------------------------------------- stealing
const STEAL_TYPES = ["loot", "consumable", "tool", "equipment", "weapon"];
const edgeDist = (a, b) => { const g = canvas.grid, d = g.distance; try { return Math.max(0, g.measurePath([a.center, b.center]).distance - ((a.document.width + b.document.width) / 2) * d); } catch { return 0; } };
const sendGM = (d) => { if (game.user.isGM) return gmSteal(d); if (!game.users.activeGM) return ui.notifications.warn("ไม่มี GM ออนไลน์ ขโมยไม่ได้"); game.socket.emit(SOCK, d); };
export async function stealFrom(target) {
  const thief = canvas.tokens.controlled.find((t) => t.actor?.type === "character" && t.actor.isOwner && t !== target);
  if (!thief) return ui.notifications.warn("เลือกโทเคนของตัวเองก่อน");
  if (!target?.actor || target.actor.type === "character") return ui.notifications.warn("ขโมยได้เฉพาะ NPC");
  if (edgeDist(thief, target) > 5.5) return ui.notifications.warn("ต้องอยู่ติดตัวเป้าหมาย (ไม่เกิน 5 ฟุต)");
  const items = target.actor.items.filter((i) => STEAL_TYPES.includes(i.type) && i.getFlag(MOD, "stealable") !== false);
  if (!items.length) return ui.notifications.info(`${target.name} ไม่มีของให้ล้วง`);
  const D = foundry.applications.api.DialogV2;
  const id = await D.prompt({ window: { title: `ล้วงกระเป๋า ${target.name}` }, content: `<div class="form-group"><label>ของที่จะล้วง</label><select name="it">${items.map((i) => `<option value="${i.id}">${esc(i.name)}</option>`).join("")}</select></div><p>DM ต้องอนุญาต แล้วทอย Sleight of Hand เทียบกับ Perception ของเป้าหมาย ถ้าพลาดเขาจะรู้ตัว</p>`, ok: { label: "ส่งให้ DM", callback: (ev, btn) => btn.form.elements.it.value }, rejectClose: false });
  if (!id) return;
  sendGM({ t: "x-steal", thief: thief.actor.uuid, target: target.document.uuid, item: id, by: game.user.id });
}
export async function gmSteal(d) {
  try {
    const thief = await fromUuid(d.thief), tokDoc = await fromUuid(d.target), victim = tokDoc?.actor, it = victim?.items.get(d.item);
    if (!thief || !victim || !it) return;
    const to = ownersOf(thief), p = passive(victim);
    const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: "ขอขโมย" }, content: `<p><b>${esc(thief.name)}</b> ขอล้วง <b>${esc(it.name)}</b> จาก <b>${esc(tokDoc.name)}</b> (Perception passive ${p}) อนุญาตไหม?</p>`, yes: { label: "อนุญาต" }, no: { label: "ไม่อนุญาต" }, rejectClose: false });
    if (!ok) return ChatMessage.create({ whisper: to, speaker: { alias: "DM" }, content: `<div class="rw-card">DM ไม่อนุญาตให้ล้วง ${esc(it.name)}</div>` });
    const total = rollTotal(await thief.rollSkill({ skill: "slt" }, { configure: false }));
    if (total == null) return;
    if (total > p) {
      const { o, n, have } = await takeCopy(victim, it, 1);
      const same = thief.items.find((i) => i.type === it.type && i.name === it.name && i.img === it.img && i.system?.quantity !== undefined && !i.system?.equipped);
      if (same) await same.update({ "system.quantity": num(same.system.quantity) + n }); else await thief.createEmbeddedDocuments("Item", [o]);
      await removeFrom(victim, it, n, have);
      ChatMessage.create({ whisper: to, speaker: { alias: "ล้วงกระเป๋า" }, content: `<div class="rw-card"><b>${esc(thief.name)}</b> ล้วง <b>${esc(it.name)}</b> สำเร็จ (${total} เทียบ ${p}) ไม่มีใครรู้ตัว</div>` });
    } else {
      ChatMessage.create({ speaker: { alias: "ล้วงกระเป๋า" }, content: `<div class="rw-card"><b>${esc(tokDoc.name)}</b> รู้ตัวว่า <b>${esc(thief.name)}</b> พยายามล้วงกระเป๋า! (${total} เทียบ ${p})</div>` });
    }
  } catch (e) { console.warn(MOD, "steal", e); ui.notifications.warn("ขโมยไม่สำเร็จ ดู Console (F12)"); }
}

// ---------------------------------------------------------------- hooks
export function registerStealth() {
  const attach = () => game.socket.on(SOCK, (d) => { if (d?.t === "s-hidecall") onCall(d).catch((e) => console.warn(MOD, "hidecall", e)); });
  if (game.ready) attach(); else Hooks.once("ready", attach);
  // only the DM picks advantage / disadvantage: players keep a single roll button
  Hooks.on("renderApplicationV2", (app, el) => {
    if (game.user.isGM || !el?.querySelectorAll) return;
    for (const b of el.querySelectorAll("button")) {
      const k = b.dataset.action, t = b.textContent.trim().toLowerCase();
      if (k === "advantage" || k === "disadvantage" || t === "advantage" || t === "disadvantage") b.style.display = "none";
      else if (k === "normal" || t === "normal") b.textContent = "ทอย";
    }
  });
  Hooks.on("dnd5e.postUseActivity", (activity) => onUse(activity?.item, activity));
  Hooks.on("dnd5e.useItem", (item) => onUse(item, null));
  for (const h of ["dnd5e.preRollAttack", "dnd5e.preRollAttackV2"]) Hooks.on(h, preAttack);
  Hooks.on("deleteCombat", () => { if (!game.user.isGM) return; for (const a of game.actors) if (hideOf(a)) endHide(a, "การต่อสู้จบแล้ว"); });
  Hooks.on("renderTokenHUD", (hud, html) => {
    try {
      const t = hud.object, el = html instanceof HTMLElement ? html : html[0], col = el?.querySelector(".col.right"); if (!t?.actor || !col) return;
      const mk = (icon, tip, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = "control-icon arkane-keep"; b.dataset.tooltip = tip; b.innerHTML = `<i class="fa-solid ${icon}"></i>`; b.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); hud.close?.(); fn(); }); col.append(b); };
      if (!hideOf(t.actor) && (game.user.isGM || (t.actor.type === "character" && t.actor.isOwner && inCombat()))) mk("fa-user-secret", "ซ่อนตัว", () => requestHide(t.actor));
      if (hideOf(t.actor) && (game.user.isGM || t.actor.isOwner)) mk("fa-eye", "เลิกซ่อนตัว", () => endHide(t.actor, "เลิกซ่อนตัว"));
      if (t.actor.type !== "character" && canvas.tokens.controlled.some((c) => c.actor?.type === "character" && c.actor.isOwner && c !== t)) mk("fa-hand-holding", "ล้วงกระเป๋า (ขโมย)", () => stealFrom(t));
    } catch (e) { console.warn(MOD, "stealth HUD", e); }
  });
}
