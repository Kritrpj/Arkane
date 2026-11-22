// Combat extras: throw an oil lantern (fire circle on the map), Shove (D&D 2024 unarmed option), Disengage,
// and automatic Reactions: an Opportunity Attack prompt (asked on the right player's screen) when a creature walks out of an enemy's reach,
// a Shield prompt when an attack would hit by 1-4 points, and reaction bookkeeping (one Reaction per round, back at the start of the owner's turn).
// Players cannot edit other tokens/actors, so damage / pushing / templates go to the GM client by socket.
// NOTE: written against dnd5e 6.0.6 / Foundry v14 APIs but NOT yet tested in a live world; every dnd5e call is wrapped defensively.
const MOD = "arkane-1920s";
const SOCK = `module.${MOD}`;
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const D = () => foundry.applications.api.DialogV2;
const SIZES = ["tiny", "sm", "med", "lg", "huge", "grg"];
const BAD = ["unconscious", "paralyzed", "petrified", "stunned", "incapacitated", "dead"];

// ---------------------------------------------------------------- geometry (works in feet using the current grid)
const gridFt = () => canvas.grid.distance || 5;
const rectOf = (t) => { const s = canvas.grid.size; return { x: t.x, y: t.y, w: t.width * s, h: t.height * s }; };
const centerOf = (t) => { const r = rectOf(t); return { x: r.x + r.w / 2, y: r.y + r.h / 2 }; };
function gapFt(a, b) {   // empty space between two token rectangles, in feet (0 = touching, also diagonally)
  const A = rectOf(a), B = rectOf(b), s = canvas.grid.size;
  const dx = Math.max(A.x - (B.x + B.w), B.x - (A.x + A.w), 0), dy = Math.max(A.y - (B.y + B.h), B.y - (A.y + A.h), 0);
  return Math.max(dx, dy) / s * gridFt();
}
const saveMod = (actor, ab) => {
  const a = actor?.system?.abilities?.[ab]; if (!a) return 0;
  const v = typeof a.save === "object" ? a.save?.value : a.save;
  return Number(v ?? a.mod ?? 0) || 0;
};
const abMod = (actor, ab) => Number(actor?.system?.abilities?.[ab]?.mod ?? 0) || 0;
const prof = (actor) => Number(actor?.system?.attributes?.prof ?? 2) || 0;
const hp = (actor) => Number(actor?.system?.attributes?.hp?.value ?? 1);
const down = (t) => !t?.actor || hp(t.actor) <= 0 || [...(t.actor.statuses ?? [])].some((s) => BAD.includes(s));
const cbtOf = (id) => game.combat?.combatants.find((c) => c.tokenId === id);
const say = (content, token) => ChatMessage.create({ speaker: ChatMessage.getSpeaker({ token }), content: `<div class="rw-card">${content}</div>` });

// ---------------------------------------------------------------- GM executor (a player's client asks, the GM client does it)
async function gmDo(d) {
  const scene = game.scenes.get(d.scene);
  const tok = scene?.tokens.get(d.token);
  switch (d.t) {
    case "x-dmg": {
      if (!tok?.actor || !(d.amount > 0)) return;
      try { await tok.actor.applyDamage([{ value: d.amount, type: d.type || "fire" }]); }
      catch { try { await tok.actor.applyDamage(d.amount); } catch (e) { console.warn(MOD, "applyDamage", e); } }
      return;
    }
    case "x-gunxp": return (await import("./items.js?v=21")).gmGunXp(d);
    case "x-gunspell": return (await import("./items.js?v=21")).syncReloadSpell(fromUuidSync(d.actor));
    case "x-steal": return (await import("./stealth.js?v=21")).gmSteal(d);
    case "x-give": return (await import("./bag.js?v=21")).gmGive(d);
    case "x-ground": return (await import("./bag.js?v=21")).gmGround(d);
    case "x-move": if (tok) await tok.update({ x: d.x, y: d.y }, { arkaneInternal: true, animate: true }); return;
    case "x-prone": try { await tok?.actor?.toggleStatusEffect?.("prone", { active: true }); } catch (e) { console.warn(MOD, "prone", e); } return;
    case "x-tpl": await scene?.createEmbeddedDocuments("MeasuredTemplate", [{ t: "circle", x: d.x, y: d.y, distance: d.dist, user: d.user,
      fillColor: "#ff6a00", borderColor: "#ff3300", flags: { [MOD]: { oil: true, round: d.round ?? null, dc: d.dc ?? null } } }]); return;
    case "x-flag": { const c = scene && game.combats.find((k) => k.combatants.get(d.cbt)); const cb = c?.combatants.get(d.cbt); if (cb) await cb.setFlag(MOD, d.key, d.val); return; }
  }
}
function asGM(d) {
  if (game.user.isGM) return gmDo(d);
  if (!game.users.activeGM) { ui.notifications.warn("ไม่มี GM ออนไลน์ ระบบทำผลให้ไม่ได้ ให้ DM ทำเอง"); return; }
  game.socket.emit(SOCK, d);
}

// ---------------------------------------------------------------- throw an oil lantern
function pickPoint() {
  return new Promise((resolve) => {
    ui.notifications.info("คลิกบนแมพตรงจุดที่จะขว้าง (กด Esc ยกเลิก)");
    const done = (v) => { canvas.stage.off("pointerdown", onDown); window.removeEventListener("keydown", onKey, true); resolve(v); };
    const onDown = (ev) => { let p; try { p = ev.getLocalPosition(canvas.stage); } catch { p = canvas.mousePosition; } done(p ? { x: p.x, y: p.y } : null); };
    const onKey = (ev) => { if (ev.key === "Escape") done(null); };
    canvas.stage.once("pointerdown", onDown); window.addEventListener("keydown", onKey, true);
  });
}
export async function throwOil() {
  const me = canvas.tokens.controlled[0]?.document;
  if (!me?.actor) return ui.notifications.warn("เลือกโทเคนของตัวเองก่อน");
  const actor = me.actor;
  const lamp = actor.items.find((i) => i.name === "ตะเกียงน้ำมัน");
  if (!lamp && !game.user.isGM) return ui.notifications.warn("ไม่มีตะเกียงน้ำมันในกระเป๋า");
  const tgt = game.user.targets.first();
  let pt = tgt ? centerOf(tgt.document) : await pickPoint();
  if (!pt) return;
  if (!tgt) { const sn = canvas.grid.getSnappedPoint?.(pt, { mode: CONST.GRID_SNAPPING_MODES?.VERTEX ?? 1 }); if (sn) pt = sn; }
  const from = centerOf(me), range = canvas.grid.measurePath([from, pt]).distance;
  if (range > 60.01) return ui.notifications.warn(`ไกลเกินไป (${Math.round(range)} ฟุต) ขว้างได้ไกลสุด 60 ฟุต`);
  if (lamp) { const q = Number(lamp.system?.quantity ?? 1); try { await lamp.update({ "system.quantity": Math.max(0, q - 1) }); if (q <= 1) await lamp.delete(); } catch (e) { console.warn(MOD, "lamp", e); } }
  const dc = 8 + abMod(actor, "dex") + prof(actor), s = canvas.grid.size, R = 5;
  const hit = canvas.scene.tokens.contents.filter((t) => {
    const r = rectOf(t), nx = Math.min(Math.max(pt.x, r.x), r.x + r.w), ny = Math.min(Math.max(pt.y, r.y), r.y + r.h);
    return !t.hidden && Math.hypot(pt.x - nx, pt.y - ny) / s * gridFt() <= R + 0.01 && !!t.actor;
  });
  const rows = [];
  for (const t of hit) {
    const sv = await new Roll("1d20 + @m", { m: saveMod(t.actor, "dex") }).evaluate();
    const ok = sv.total >= dc;
    let amt = 0;
    if (!ok) { const r = await new Roll("1d4").evaluate(); amt = r.total; await asGM({ t: "x-dmg", scene: canvas.scene.id, token: t.id, amount: amt, type: "fire" }); }
    rows.push(`<li><b>${esc(t.name)}</b> เซฟ DEX ${sv.total} (DC ${dc}) → ${ok ? "ผ่าน ไม่โดน" : `ไฟลวก <b>${amt}</b> Fire`}</li>`);
  }
  await asGM({ t: "x-tpl", scene: canvas.scene.id, x: pt.x, y: pt.y, dist: R, user: game.user.id, round: game.combat?.round ?? null, dc });
  await say(`<div class="rw-title">${esc(me.name)} ขว้างตะเกียงน้ำมัน!</div>ระยะ ${Math.round(range)} ฟุต · ตะเกียงแตก ไฟลุกเป็นวงรัศมี ${R} ฟุต<br>${rows.length ? `<ul>${rows.join("")}</ul>` : "ไม่มีใครอยู่ในวงไฟ"}<small>ไฟค้างบนพื้นอยู่ 3 รอบ คนที่เริ่มเทิร์นในวงไฟ ระบบทอยเซฟ DEX ให้เองอัตโนมัติ ไม่ผ่านโดน 1d4 Fire · คนที่เดินเข้าไป DM ตัดสินเอง</small>`, me);
}
export async function clearOil() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const ids = canvas.scene.templates.filter((t) => t.getFlag(MOD, "oil")).map((t) => t.id);
  if (ids.length) await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", ids);
  ui.notifications.info(`ล้างวงไฟน้ำมัน ${ids.length} วง`);
}

// ---------------------------------------------------------------- Shove (2024: target STR or DEX save vs 8 + STR mod + prof; push 5 ft or knock prone)
const sizeIdx = (a) => Math.max(0, SIZES.indexOf(a?.system?.traits?.size ?? "med"));
export async function shove() {
  const me = canvas.tokens.controlled[0]?.document, tgt = game.user.targets.first()?.document;
  if (!me?.actor) return ui.notifications.warn("เลือกโทเคนของตัวเองก่อน");
  if (!tgt?.actor) return ui.notifications.warn("เล็งเป้าก่อน (คลิกศัตรูแล้วกด T)");
  if (tgt.id === me.id) return ui.notifications.warn("ผลักตัวเองไม่ได้");
  if (gapFt(me, tgt) > 0.01) return ui.notifications.warn("ต้องอยู่ติดกับเป้าหมายถึงจะผลักได้");
  if (sizeIdx(tgt.actor) > sizeIdx(me.actor) + 1) return ui.notifications.warn("เป้าหมายตัวใหญ่เกินไป (ใหญ่กว่าเรามากกว่า 1 ขนาด)");
  const dc = 8 + abMod(me.actor, "str") + prof(me.actor);
  const useStr = saveMod(tgt.actor, "str") >= saveMod(tgt.actor, "dex"), ab = useStr ? "str" : "dex";
  const sv = await new Roll("1d20 + @m", { m: saveMod(tgt.actor, ab) }).evaluate();
  const ok = sv.total >= dc;
  await sv.toMessage({ speaker: ChatMessage.getSpeaker({ token: tgt }), flavor: `${esc(tgt.name)} ต้านการผลักของ ${esc(me.name)} (เซฟ ${ab.toUpperCase()} · DC ${dc})` });
  if (ok) return say(`<b>${esc(tgt.name)}</b> ยืนมั่น ไม่ถูกผลัก`, me);
  const how = await D().wait({ window: { title: `ผลัก ${tgt.name}` }, content: "<p>เลือกผลที่ต้องการ</p>",
    buttons: [{ action: "push", label: "ผลักออกไป 5 ฟุต", default: true }, { action: "prone", label: "ล้มลง (Prone)" }] }).catch(() => null);
  if (!how || how === "cancel") return;
  if (how === "prone") { await asGM({ t: "x-prone", scene: tgt.parent.id, token: tgt.id }); return say(`<b>${esc(me.name)}</b> ผลัก <b>${esc(tgt.name)}</b> ล้มลง (Prone)`, me); }
  // push one grid square directly away
  const s = canvas.grid.size, a = centerOf(me), b = centerOf(tgt), len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const nx = tgt.x + Math.round((b.x - a.x) / len) * s, ny = tgt.y + Math.round((b.y - a.y) / len) * s;
  const c0 = centerOf(tgt), c1 = { x: c0.x + (nx - tgt.x), y: c0.y + (ny - tgt.y) };
  let blocked = false;
  try { blocked = !!CONFIG.Canvas.polygonBackends.move.testCollision(c0, c1, { type: "move", mode: "any" }); } catch (e) { console.warn(MOD, "collision", e); }
  const occupied = tgt.parent.tokens.some((t) => t.id !== tgt.id && Math.abs(t.x - nx) < s * 0.5 && Math.abs(t.y - ny) < s * 0.5);
  if (blocked || occupied) return say(`<b>${esc(me.name)}</b> ผลัก <b>${esc(tgt.name)}</b> แต่${blocked ? "มีกำแพงขวาง" : "มีคนยืนอยู่ด้านหลัง"} เลยไม่เลื่อน`, me);
  await asGM({ t: "x-move", scene: tgt.parent.id, token: tgt.id, x: nx, y: ny });
  return say(`<b>${esc(me.name)}</b> ผลัก <b>${esc(tgt.name)}</b> ถอยไป 5 ฟุต`, me);
}

// ---------------------------------------------------------------- Disengage + Opportunity Attack
export async function disengage(mode) {
  const me = canvas.tokens.controlled[0]?.document;
  if (!me?.actor) return ui.notifications.warn("เลือกโทเคนของตัวเองก่อน");
  const c = cbtOf(me.id);
  if (!c || game.combat?.combatant?.id !== c.id) return ui.notifications.warn("ต้องเป็นเทิร์นของตัวละครนี้ (ใน combat)");
  await asGM({ t: "x-flag", scene: me.parent.id, cbt: c.id, key: "disengage", val: true });
  if (mode === "dive") await say(`<b>${esc(me.name)}</b> ดิฟหลบ · หักรถหลบออกจากวงล้อมศัตรู เทิร์นนี้ไม่โดนโจมตีสวน`, me);
  else await say(`<b>${esc(me.name)}</b> ถอยตัว (Disengage) · เดินออกจากศัตรูในเทิร์นนี้ไม่โดนโจมตีสวน`, me);
}
const enemies = (a, b) => (a.disposition ?? 0) * (b.disposition ?? 0) < 0;
const reachOf = (actor) => (actor?.items?.some?.((i) => i.type === "weapon" && i.system?.equipped && i.system?.properties?.has?.("rch")) ? 10 : 5);

const oaActivity = (actor) => {
  const acts = (actor?.items ?? []).filter((i) => i.type === "weapon").flatMap((i) => [...(i.system.activities ?? [])].filter((a) => a.type === "attack"));
  return acts.find((a) => a.attack?.type?.value === "melee") ?? acts[0] ?? null;
};
const rmode = () => { try { return game.settings.get(MOD, "reactionMode"); } catch { return "prompt"; } };
// who answers for this creature: its (online) player owner, otherwise the GM
function responderId(actor) {
  const owners = game.users.filter((u) => u.active && !u.isGM && actor?.testUserPermission?.(u, "OWNER")).map((u) => u.id).sort();
  return owners[0] ?? game.users.activeGM?.id ?? null;
}
// small timed yes/no window (closes itself so an absent player never blocks anything)
function ask(title, html, yes, no, secs = 30) {
  return new Promise((resolve) => {
    let done = false; const fin = (v) => { if (!done) { done = true; resolve(v); } };
    try {
      const dlg = new (D())({ window: { title }, content: `<p>${html}</p><p><small>หน้าต่างนี้ปิดเองใน ${secs} วินาที (นับเป็นไม่ใช้)</small></p>`,
        buttons: [{ action: "y", label: yes, default: true, callback: () => fin(true) }, { action: "n", label: no, callback: () => fin(false) }] });
      dlg.addEventListener?.("close", () => fin(false));
      dlg.render({ force: true });
      setTimeout(() => { fin(false); try { dlg.close(); } catch {} }, secs * 1000);
    } catch (e) { console.warn(MOD, "ask", e); fin(false); }
  });
}
const used = (c) => !!c?.getFlag(MOD, "reaction");
const markReaction = (actor) => { const c = game.combat?.started && game.combat.combatants.find((x) => x.actorId === actor?.id); return c ? asGM({ t: "x-flag", scene: c.token?.parent?.id ?? canvas.scene?.id, cbt: c.id, key: "reaction", val: true }) : null; };

async function chatOA(e, doc) {
  await ChatMessage.create({ speaker: { alias: "ระบบ combat" }, content: `<div class="rw-card"><div class="rw-title">โจมตีสวน (Opportunity Attack)</div><b>${esc(doc.name)}</b> เดินออกจากระยะของ <b>${esc(e.name)}</b><br><button type="button" class="arkane-oa" data-att="${e.id}" data-tgt="${doc.id}" data-scene="${doc.parent.id}">${esc(e.name)} ใช้ Reaction โจมตีสวน</button></div>` });
}

// every client gets "r-*" requests; only the responder (owner or GM) acts on them
async function onReactionMsg(d) {
  try {
    const scene = game.scenes.get(d.scene), att = scene?.tokens.get(d.att);
    if (!att?.actor || responderId(att.actor) !== game.user.id) return;
    const c = cbtOf(att.id); if (used(c) || down(att)) return;
    if (d.t === "r-oa") {
      const tgt = scene.tokens.get(d.tgt); if (!tgt || !oaActivity(att.actor)) return;
      if (rmode() !== "auto" && !(await ask("โจมตีสวน (Reaction)", `<b>${esc(tgt.name)}</b> เดินออกจากระยะของ <b>${esc(att.name)}</b><br>ใช้ Reaction โจมตีสวนไหม? (ใช้แล้วเสีย Reaction ของรอบนี้)`, "โจมตีสวน", "ไม่ใช้"))) return;
      return oaUse(att.id, tgt.id, scene.id);
    }
    if (d.t === "r-shield") {
      const sh = att.actor.items.find((i) => i.type === "spell" && /^\s*shield\s*$/i.test(i.name)); if (!sh) return;
      const ok = rmode() === "auto" || await ask("Shield (Reaction)", `<b>${esc(att.name)}</b> ถูกโจมตี ทอยได้ <b>${d.total}</b> เทียบ AC <b>${d.ac}</b> (โดนพอดี)<br>ร่าย <b>Shield</b> +5 AC จนถึงเทิร์นหน้า ทำให้พลาดไหม? (เสีย Reaction + ช่องเวท 1 ช่อง)`, "ร่าย Shield", "ไม่ร่าย");
      if (!ok) return;
      try { await sh.use({}, { configure: false }, {}); await markReaction(att.actor); } catch (e) { console.warn(MOD, "shield use", e); ui.notifications.warn("ร่าย Shield อัตโนมัติไม่สำเร็จ ให้กดร่ายบนชีตเอง"); return; }
      await say(`<b>${esc(att.name)}</b> ร่าย <b>Shield</b> ตอบโต้ · AC +5 → ${d.ac + 5} · การโจมตีที่ทอยได้ ${d.total} จึง<b>${d.total < d.ac + 5 ? "พลาด" : "ยังโดน"}</b>`, att);
    }
  } catch (err) { console.warn(MOD, "reaction msg", err); }
}
const hasSlot = (a) => { const sp = a?.system?.spells; if (!sp) return true; return Object.entries(sp).some(([k, v]) => (/^spell[1-9]$/.test(k) || k === "pact") && Number(v?.value) > 0); };

async function oaUse(attId, tgtId, sceneId) {
  const scene = game.scenes.get(sceneId), att = scene?.tokens.get(attId), tgt = scene?.tokens.get(tgtId);
  if (!att?.actor || !tgt) return;
  if (!game.user.isGM && !att.actor.isOwner) return ui.notifications.warn("ปุ่มนี้สำหรับเจ้าของตัวละครที่จะโจมตีสวน หรือ GM");
  const c = cbtOf(att.id);
  if (c?.getFlag(MOD, "reaction")) return ui.notifications.warn(`${att.name} ใช้ Reaction ไปแล้วในรอบนี้`);
  const act = oaActivity(att.actor);
  if (!act) return ui.notifications.warn(`${att.name} ไม่มีอาวุธที่ตีได้ ใช้ปุ่มโจมตีบนชีตเอง`);
  try { tgt.object?.setTarget?.(true, { user: game.user, releaseOthers: true, groupSelection: false }); } catch {}
  if (c) await asGM({ t: "x-flag", scene: sceneId, cbt: c.id, key: "reaction", val: true });
  try { await act.use({ event: new Event("click") }, { configure: false }, {}); }
  catch (e) { console.warn(MOD, "oa use", e); ui.notifications.warn("โจมตีอัตโนมัติไม่สำเร็จ ให้กดอาวุธบนชีตเอง (Reaction ถูกหักไปแล้ว)"); }
}

// manual Opportunity Attack (Argon "Reaction" button): target = the one you targeted, otherwise the nearest enemy inside your reach
export async function manualOA() {
  const me = canvas.tokens.controlled[0]?.document;
  if (!me?.actor) return ui.notifications.warn("เลือกโทเคนของตัวเองก่อน");
  if (!game.combat?.started || !cbtOf(me.id)) return ui.notifications.warn("ใช้ได้เฉพาะตอนอยู่ใน combat");
  if (used(cbtOf(me.id))) return ui.notifications.warn(`${me.name} ใช้ Reaction ไปแล้วในรอบนี้ (กลับมาตอนเริ่มเทิร์นของตัวเอง)`);
  const reach = reachOf(me.actor);
  const picked = [...game.user.targets].map((t) => t.document).find((t) => t && enemies(me, t) && !down(t));
  const cands = me.parent.tokens.filter((e) => e.id !== me.id && enemies(me, e) && !down(e) && gapFt(me, e) <= reach - gridFt() + 0.01)
    .sort((a, b) => gapFt(me, a) - gapFt(me, b));
  const tgt = picked ?? cands[0];
  if (!tgt) return ui.notifications.warn("ไม่มีศัตรูอยู่ในระยะเอื้อม · เลือกเป้า (กด T) ก่อนแล้วกดใหม่ได้");
  return oaUse(me.id, tgt.id, me.parent.id);
}
export async function readyReaction() {
  const me = canvas.tokens.controlled[0]?.document;
  if (!me?.actor) return ui.notifications.warn("เลือกโทเคนของตัวเองก่อน");
  const c = cbtOf(me.id);
  if (!c || !game.combat?.started) return ui.notifications.warn("ใช้ได้เฉพาะตอนอยู่ใน combat");
  if (used(c)) return ui.notifications.warn(`${me.name} ใช้ Reaction ไปแล้วในรอบนี้`);
  await asGM({ t: "x-flag", scene: me.parent.id, cbt: c.id, key: "reaction", val: true });
  await say(`<b>${esc(me.name)}</b> ใช้ Reaction ทำตามที่เตรียมพร้อมไว้ (Ready) · เงื่อนไขเกิดขึ้นแล้ว ทำสิ่งที่ตั้งไว้ได้เลย`, me);
}
// keep Argon's own Reaction pips in step with our reaction flag
function syncArgonReaction(c) {
  try {
    if (!ui.ARGON?.enabled || ui.ARGON._actor?.id !== c.actorId) return;
    const panel = ui.ARGON.components?.main?.find((p) => p.label === "DND5E.Reaction"); if (!panel) return;
    panel.isActionUsed = !!(c.getFlag(MOD, "reaction") || c.getFlag(MOD, "economy")?.reaction); panel.updateActionUse?.();
  } catch (e) { console.warn(MOD, "argon reaction sync", e); }
}

export function registerCombatX() {
  Hooks.on("updateCombatant", (c, ch) => { if (foundry.utils.hasProperty(ch, `flags.${MOD}.reaction`)) syncArgonReaction(c); });
  Hooks.on("controlToken", () => setTimeout(() => { try { const c = game.combat?.combatants.find((x) => x.actorId === ui.ARGON?._actor?.id); if (c) syncArgonReaction(c); } catch {} }, 600));
  hookCombatFeats();
  // socket: only the active GM client executes requests
  game.socket.on(SOCK, (d) => { if (d?.t?.startsWith?.("x-") && game.users.activeGM?.isSelf) gmDo(d).catch((e) => console.warn(MOD, "gmDo", e)); else if (d?.t?.startsWith?.("r-")) onReactionMsg(d); });
  hookReactions();

  // remember where the mover started; once the move is done, look for enemies it just left
  Hooks.on("preUpdateToken", (doc, ch, opt) => {
    if (("x" in ch || "y" in ch) && !opt?.arkaneInternal && !opt?.arkaneRide) opt.arkaneFrom = { x: doc.x, y: doc.y };
  });
  Hooks.on("updateToken", async (doc, ch, opt, userId) => {
    try {
      if (userId !== game.user.id || !opt?.arkaneFrom || !game.combat?.started || doc.parent?.id !== canvas.scene?.id) return;
      const mc = cbtOf(doc.id); if (!mc || mc.getFlag(MOD, "disengage") || down(doc)) return;
      const from = { ...doc.toObject(), x: opt.arkaneFrom.x, y: opt.arkaneFrom.y, width: doc.width, height: doc.height };
      for (const e of doc.parent.tokens) {
        if (e.id === doc.id || !enemies(doc, e) || down(e) || !cbtOf(e.id)) continue;
        const reach = reachOf(e.actor), within = (g) => g <= reach - gridFt() + 0.01;
        if (within(gapFt(from, e)) && !within(gapFt(doc, e))) {
          if (cbtOf(e.id)?.getFlag(MOD, "reaction") || !oaActivity(e.actor)) continue;
          const msg = { t: "r-oa", scene: doc.parent.id, att: e.id, tgt: doc.id };
          if (rmode() === "off" || !responderId(e.actor)) await chatOA(e, doc);
          else { game.socket.emit(SOCK, msg); onReactionMsg(msg); }
        }
      }
    } catch (err) { console.warn(MOD, "opportunity attack", err); }
  });
  Hooks.on("renderChatMessageHTML", (msg, html) => {
    html.querySelectorAll?.("button.arkane-oa").forEach((b) => b.addEventListener("click", () => oaUse(b.dataset.att, b.dataset.tgt, b.dataset.scene)));
  });
  // new turn: reaction and disengage come back for the one whose turn starts; oil fire fades after 3 rounds
  Hooks.on("updateCombat", async (combat, ch) => {
    if (!game.users.activeGM?.isSelf || !("turn" in ch || "round" in ch)) return;
    const c = combat.combatant; if (c) await c.update({ [`flags.${MOD}.reaction`]: false, [`flags.${MOD}.disengage`]: false });
    const old = canvas.scene?.templates.filter((t) => t.getFlag(MOD, "oil") && t.getFlag(MOD, "round") != null && combat.round - t.getFlag(MOD, "round") >= 3).map((t) => t.id) ?? [];
    if (old.length) await canvas.scene.deleteEmbeddedDocuments("MeasuredTemplate", old);
    try { await oilFireTurnStart(combat, old); } catch (err) { console.warn(MOD, "oil fire", err); }
  });
}
// whoever starts their turn standing in an oil fire circle rolls a DEX save (DC = the thrower's, 10 for older fires) or takes 1d4 Fire
async function oilFireTurnStart(combat, gone = []) {
  const tok = combat.combatant?.token; if (!tok?.actor || tok.parent?.id !== canvas.scene?.id || tok.hidden || down(tok)) return;
  const fires = canvas.scene.templates.filter((t) => t.getFlag(MOD, "oil") && !gone.includes(t.id));
  const r = rectOf(tok), s = canvas.grid.size;
  const fire = fires.find((t) => {
    const nx = Math.min(Math.max(t.x, r.x), r.x + r.w), ny = Math.min(Math.max(t.y, r.y), r.y + r.h);
    return Math.hypot(t.x - nx, t.y - ny) / s * gridFt() <= (Number(t.distance) || 5) + 0.01;
  });
  if (!fire) return;
  const dc = Number(fire.getFlag(MOD, "dc")) || 10;
  const sv = await new Roll("1d20 + @m", { m: saveMod(tok.actor, "dex") }).evaluate(), ok = sv.total >= dc;
  let amt = 0;
  if (!ok) { amt = (await new Roll("1d4").evaluate()).total; await gmDo({ t: "x-dmg", scene: canvas.scene.id, token: tok.id, amount: amt, type: "fire" }); }
  await say(`<div class="rw-title">${esc(tok.name)} เริ่มเทิร์นในวงไฟ!</div>เซฟ DEX ${sv.total} (DC ${dc}) → ${ok ? "ผ่าน ไม่โดนไฟ" : `ไฟลวก <b>${amt}</b> Fire`}`, tok);
}

// ---------------------------------------------------------------- reaction bookkeeping + Shield prompt
function hookReactions() {
  const isReaction = (a) => (a?.activation?.type || a?.item?.system?.activation?.type) === "reaction";
  Hooks.on("dnd5e.preUseActivity", (activity) => {
    try {
      if (!isReaction(activity) || game.user.isGM) return;
      const c = game.combat?.started && game.combat.combatants.find((x) => x.actorId === activity.actor?.id);
      if (used(c)) { ui.notifications.warn(`${activity.actor.name} ใช้ Reaction ไปแล้วในรอบนี้ (จะกลับมาตอนเริ่มเทิร์นของตัวเอง) · ถ้า GM อนุญาต ให้ GM ใช้แทน`); return false; }
    } catch (e) { console.warn(MOD, "reaction pre", e); }
  });
  Hooks.on("dnd5e.postUseActivity", (activity) => {
    try { if (isReaction(activity)) markReaction(activity.actor); } catch (e) { console.warn(MOD, "reaction post", e); }
  });
  // an attack that beats the target's AC by less than 5 → offer Shield to its owner
  Hooks.on("createChatMessage", async (msg) => {
    try {
      if (!game.users.activeGM?.isSelf || !game.combat?.started) return;
      if (msg.type !== "attack") return;   // dnd5e 6: attack rolls are their own message type, targets live in msg.system
      const roll = msg.rolls?.[0]; const total = Number(roll?.total);
      if (!Number.isFinite(total) || roll.isCritical || roll.isFumble) return;
      for (const t of msg.system?.targets ?? []) {
        if (t.ac == null) continue; const ac = Number(t.ac); if (!(total >= ac && total < ac + 5)) continue;
        const doc = await fromUuid(t.token ?? t.actor); const tok = doc?.documentName === "Token" ? doc : doc?.getActiveTokens?.()[0]?.document; if (!tok?.actor) continue;
        if (!tok.actor.items.some((i) => i.type === "spell" && /^\s*shield\s*$/i.test(i.name)) || !hasSlot(tok.actor) || used(cbtOf(tok.id)) || down(tok)) continue;
        const d = { t: "r-shield", scene: tok.parent.id, att: tok.id, total, ac };
        game.socket.emit(SOCK, d); onReactionMsg(d);
      }
    } catch (e) { console.warn(MOD, "shield prompt", e); }
  });
}

// ---------------------------------------------------------------- combat buttons as real feats (Argon HUD / character sheet)
// A feat with a utility activity shows up in Argon's Action / Bonus Action lists; using it runs the matching script.
const LEGACY_FEATS = [{ key: "oil", fn: () => throwOil() }, { key: "disengage", fn: () => disengage() }];
const RETIRED = ["oil", "disengage", "shove"];   // buttons that were replaced: removed from characters (oil -> "ใช้ของในกระเป๋า", disengage -> Argon's own Disengage button)
const COMBAT_FEATS = [
  { key: "ram", name: "พุ่งชน", type: "action", img: "modules/arkane-1920s/hud/hud-dash.webp", fn: () => import("./vehicle.js?v=23").then((m) => m.ram()),
    desc: "Action (คนขับเท่านั้น): พุ่งรถชนเป้าที่ Target ไว้ ต้องอยู่ติดรถไม่เกิน 2 ช่อง ทอยโจมตีด้วย DEX + Proficiency เทียบ AC เป้า โดนแล้วเป้ารับดาเมจและถูกผลักถอย รถเสียหายจากแรงกระแทกด้วย" },
  { key: "dive", name: "ดิฟหลบ", type: "action", img: "modules/arkane-1920s/hud/hud-disengage.webp", fn: () => disengage("dive"),
    desc: "Action (คนขับเท่านั้น): หักรถหลบออกจากวงล้อมศัตรู เหมือน Disengage เทิร์นนี้ขับออกจากศัตรูโดยไม่โดนโจมตีสวน" },
  { key: "useitem", name: "ใช้ของในกระเป๋า", type: "action", img: "modules/arkane-1920s/hud/hud-useitem.webp", fn: () => useBagItem(),
    desc: "Action: เปิดรายการของที่ตัวละครมีและใช้ได้ (ยา ของใช้ ตะเกียงน้ำมันที่ขว้างได้ ฯลฯ) เลือกอย่างที่จะใช้ · ตะเกียงน้ำมัน: ขว้างไม่เกิน 60 ฟุต เป้าเซฟ DEX ไม่ผ่านโดน 1d4 Fire วงไฟลุกต่ออีก 3 รอบ" },
  { key: "askcheck", name: "ขอทอยเช็ค", type: "action", img: "modules/arkane-1920s/hud/hud-askcheck.webp", fn: () => import("./session.js?v=21").then((m) => m.askCheck()),
    desc: "ขอ GM ให้ทอย Ability Check / ทักษะ (เช่น โน้มน้าว สังเกต ลอบเร้น) · เลือกทักษะ พิมพ์ว่ากำลังทำอะไร ทั้งตี้จะเห็น แล้ว GM กำหนด DC และให้ทอย · ไม่เสีย Action ในการต่อสู้" },
  { key: "oa", name: "โจมตีสวน (Opportunity Attack)", type: "reaction", img: "modules/arkane-1920s/hud/hud-oa.webp", fn: () => manualOA(),
    desc: "Reaction: เมื่อศัตรูที่คุณมองเห็นเดินออกจากระยะเอื้อมของคุณ ตีมันได้ 1 ครั้งด้วยอาวุธที่ถืออยู่ · ระบบเด้งถามให้เองอยู่แล้ว ปุ่มนี้ไว้กดเองเวลาที่ไม่เด้ง (เลือกเป้าไว้ก่อน หรือให้ระบบเลือกศัตรูที่อยู่ติดตัว) · ใช้ได้ 1 ครั้งต่อรอบ" },
  { key: "readyact", name: "ทำตามที่เตรียมพร้อมไว้ (Ready)", type: "reaction", img: "modules/arkane-1920s/hud/hud-ready-react.webp", fn: () => readyReaction(),
    desc: "Reaction: เมื่อเงื่อนไขที่คุณตั้งไว้ตอนใช้ Ready เกิดขึ้น ให้กดปุ่มนี้แล้วทำสิ่งที่เตรียมไว้ (ยิง ตี หรือเดิน) ทันที · ใช้แล้วเสีย Reaction ของรอบนี้" }
];
// ---------------------------------------------------------------- generic throwable items (shown in the bag dialog with "· ขว้าง")
// An item is throwable when it has the flag arkane-1920s.throw: true (= improvised object, 1d4 bludgeoning), or an object like
// { kind:"hit"|"area", dmg:"1d4", type:"bludgeoning", range:[20,60], prof:false }  (hit = attack roll vs AC, beyond the first range = disadvantage)
// { kind:"area", dmg:"2d6", type:"acid", radius:5, save:"dex", half:false, template:false }  (area = everyone within radius saves, DC 8 + DEX + prof)
// or when its name matches an entry of THROW_CATALOG (empty until the DM approves a list).
const THROW_CATALOG = [   // [{ match: /regex/, def }]  (def.dc = fixed save DC; otherwise 8 + DEX + proficiency of the thrower)
  { match: /^ไดนาไมต์$/, def: { kind: "area", dmg: "3d6", type: "fire", radius: 10, save: "dex", half: true, dc: 13, range: [60, 60] } }   // Chapter 4 loot: throw 60 ft, 10 ft burst, DEX DC 13, 3d6 fire (half on save)
];
// weapons with the Thrown property (e.g. มีดพับสปริง, Dagger) are listed too; dnd5e asks melee / thrown when the item is used
const isThrownWeapon = (i) => i.type === "weapon" && !!i.system?.properties?.has?.("thr");
export function throwDef(item) {
  try {
    const f = item.getFlag(MOD, "throw");
    if (f && typeof f === "object") return f;
    if (f === true) return { kind: "hit", dmg: "1d4", type: "bludgeoning" };
    return THROW_CATALOG.find((x) => x.match.test(item.name))?.def ?? null;
  } catch { return null; }
}
async function spendOne(item) {
  const q = Number(item.system?.quantity ?? 1);
  try { if (q > 1) await item.update({ "system.quantity": q - 1 }); else await item.delete(); } catch (e) { console.warn(MOD, "spend", e); }
}
export async function throwItem(item) {
  const tok = canvas.tokens.controlled[0], me = tok?.document;
  if (!me?.actor) return ui.notifications.warn("เลือกโทเคนของตัวเองก่อน");
  const actor = me.actor, def = throwDef(item); if (!def) return;
  const [near, far] = def.range ?? [20, 60];
  const tgt = game.user.targets.first(), from = centerOf(me);
  if (def.kind === "area") {
    let pt = tgt ? centerOf(tgt.document) : await pickPoint();
    if (!pt) return;
    if (!tgt) { const sn = canvas.grid.getSnappedPoint?.(pt, { mode: CONST.GRID_SNAPPING_MODES?.VERTEX ?? 1 }); if (sn) pt = sn; }
    const range = canvas.grid.measurePath([from, pt]).distance;
    if (range > far + 0.01) return ui.notifications.warn(`ไกลเกินไป (${Math.round(range)} ฟุต) ขว้างได้ไกลสุด ${far} ฟุต`);
    await spendOne(item);
    const ab = def.save ?? "dex", dc = def.dc ?? (8 + abMod(actor, "dex") + prof(actor)), s = canvas.grid.size, R = def.radius ?? 5;
    const hit = canvas.scene.tokens.contents.filter((t) => {
      const r = rectOf(t), nx = Math.min(Math.max(pt.x, r.x), r.x + r.w), ny = Math.min(Math.max(pt.y, r.y), r.y + r.h);
      return !t.hidden && Math.hypot(pt.x - nx, pt.y - ny) / s * gridFt() <= R + 0.01 && !!t.actor;
    });
    const rows = [];
    for (const t of hit) {
      const sv = await new Roll("1d20 + @m", { m: saveMod(t.actor, ab) }).evaluate(), ok = sv.total >= dc;
      let amt = 0;
      if (!ok || def.half) { const r = await new Roll(def.dmg ?? "1d4").evaluate(); amt = ok ? Math.floor(r.total / 2) : r.total; if (amt > 0) await asGM({ t: "x-dmg", scene: canvas.scene.id, token: t.id, amount: amt, type: def.type ?? "fire" }); }
      rows.push(`<li><b>${esc(t.name)}</b> เซฟ ${ab.toUpperCase()} ${sv.total} (DC ${dc}) → ${ok ? (amt ? `ผ่าน ครึ่งเดียว <b>${amt}</b>` : "ผ่าน ไม่โดน") : `โดน <b>${amt}</b> ${esc(def.type ?? "fire")}`}</li>`);
    }
    if (def.template) await asGM({ t: "x-tpl", scene: canvas.scene.id, x: pt.x, y: pt.y, dist: R, user: game.user.id, round: game.combat?.round ?? null });
    return say(`<div class="rw-title">${esc(me.name)} ขว้าง${esc(item.name)}!</div>ระยะ ${Math.round(range)} ฟุต · รัศมี ${R} ฟุต<br>${rows.length ? `<ul>${rows.join("")}</ul>` : "ไม่มีใครอยู่ในวง"}`, me);
  }
  if (!tgt) return ui.notifications.warn("Target เป้าหมายก่อน (กดที่โทเคนศัตรูแล้วกด T)");
  const range = canvas.grid.measurePath([from, centerOf(tgt.document)]).distance;
  if (range > far + 0.01) return ui.notifications.warn(`ไกลเกินไป (${Math.round(range)} ฟุต) ขว้างได้ไกลสุด ${far} ฟุต`);
  await spendOne(item);
  const dis = range > near + 0.01;
  const atk = await new Roll(`${dis ? "2d20kl1" : "1d20"} + @m`, { m: abMod(actor, "dex") + (def.prof ? prof(actor) : 0) }).evaluate();
  const nat = atk.dice[0]?.results?.find((r) => r.active)?.result ?? 0;
  const ac = Number(tgt.actor?.system?.attributes?.ac?.value ?? 10), ok = nat !== 1 && (nat === 20 || atk.total >= ac);
  let line = `ทอยโจมตี <b>${atk.total}</b>${dis ? " (ไกลกว่า " + near + " ฟุต = Disadvantage)" : ""} vs AC ${ac} → `;
  if (ok) {
    const f = def.dmg ?? "1d4", dmg = await new Roll(nat === 20 ? `${f} + ${f}` : f).evaluate();
    await asGM({ t: "x-dmg", scene: canvas.scene.id, token: tgt.document.id, amount: dmg.total, type: def.type ?? "bludgeoning" });
    line += `โดน${nat === 20 ? " (คริติคอล!)" : ""} <b>${dmg.total}</b> ${esc(def.type ?? "bludgeoning")}`;
  } else line += "พลาด";
  await say(`<div class="rw-title">${esc(me.name)} ขว้าง${esc(item.name)} ใส่ ${esc(tgt.name)}</div>ระยะ ${Math.round(range)} ฟุต<br>${line}`, me);
}
// the "use item from bag" dialog: lists what this character carries that can be used
export async function useBagItem() {
  const tok = canvas.tokens?.controlled?.[0];
  const actor = tok?.actor ?? game.user.character;
  if (!actor) return ui.notifications.warn("เลือกโทเคนของตัวเองก่อน");
  const usable = actor.items.filter((i) => !i.getFlag(MOD, "combatAction") && Number(i.system?.quantity ?? 1) > 0 && (
    i.name === "ตะเกียงน้ำมัน" || !!throwDef(i) || isThrownWeapon(i) || (i.type === "consumable" && i.system?.type?.value !== "ammo") ||
    (!["feat", "weapon", "spell", "class", "subclass", "background", "race"].includes(i.type) && [...(i.system?.activities ?? [])].length)));
  if (!usable.length) return ui.notifications.info("ไม่มีของที่ใช้ได้ในกระเป๋า");
  const q = (i) => Number(i.system?.quantity ?? 1);
  const pick = await foundry.applications.api.DialogV2.wait({
    window: { title: `ใช้ของในกระเป๋า · ${actor.name}`, icon: "fa-solid fa-bag-shopping" }, position: { width: 420 }, rejectClose: false,
    content: `<p style="margin:4px 0">เลือกของที่จะใช้</p>`,
    buttons: [...usable.map((i, n) => ({ action: i.id, label: `${i.name}${q(i) > 1 ? ` ×${q(i)}` : ""}${i.name === "ตะเกียงน้ำมัน" || throwDef(i) || isThrownWeapon(i) ? " · ขว้าง" : ""}`, default: n === 0 })), { action: "cancel", label: "ยกเลิก" }] }).catch(() => null);
  if (!pick || pick === "cancel") return;
  const item = actor.items.get(pick); if (!item) return;
  try { if (tok && !tok.controlled) tok.control({ releaseOthers: true }); } catch {}
  if (item.name === "ตะเกียงน้ำมัน") return throwOil();
  if (throwDef(item)) return throwItem(item);
  try { await item.use(); } catch (e) { console.warn(MOD, "use item", e); ui.notifications.warn(`ใช้ ${item.name} ไม่สำเร็จ`); }
}
export async function ensureCombatFeats(actors) {
  if (!game.user.isGM) return 0;
  let n = 0;
  for (const a of actors ?? game.actors.filter((x) => x.type === "character" && x.getFlag(MOD, "pc"))) {
    const have = new Set(a.items.map((i) => i.getFlag(MOD, "combatAction")).filter(Boolean));
    for (const it of a.items) { const f0 = COMBAT_FEATS.find((x) => x.key === it.getFlag(MOD, "combatAction")); if (f0 && it.img !== f0.img) { try { await it.update({ img: f0.img }); } catch {} } }
    const gone = a.items.filter((i) => RETIRED.includes(i.getFlag(MOD, "combatAction"))).map((i) => i.id);
    if (gone.length) { try { await a.deleteEmbeddedDocuments("Item", gone); } catch (e) { console.warn(MOD, "retired feat remove", e); } }
    const add = COMBAT_FEATS.filter((f) => !have.has(f.key)).map((f) => {
      const id = foundry.utils.randomID();
      return { name: f.name, type: "feat", img: f.img, flags: { [MOD]: { combatAction: f.key } },
        system: { description: { value: `<p>${f.desc}</p>`, chat: "" }, type: { value: "class" }, activation: { type: f.type, value: 1 },
          activities: { [id]: { _id: id, type: "utility", name: f.name, activation: { type: f.type, value: 1, override: true } } } } };
    });
    if (add.length) { await a.createEmbeddedDocuments("Item", add); n += add.length; }
  }
  return n;
}
// Argon packs small feat buttons two to a column; pull the "ขอทอยเช็ค" button out so it is a full-size button like Cast Spell
// Argon's own "ถอยหนี / Disengage" button: during your own combat turn it runs our disengage() so the flag that skips opportunity attacks is set
let disHook = false;
function hookArgonDisengage() {
  if (disHook) return; disHook = true;
  document.addEventListener("click", (ev) => {
    try {
      const t = ev.target?.closest?.(".extended-combat-hud .action-element, .extended-combat-hud .feature-element"); if (!t) return;
      const title = (t.querySelector(".action-element-title, .feature-element-title")?.textContent ?? "").trim();
      if (!/^(ถอยหนี|Disengage)$/i.test(title)) return;
      const me = canvas.tokens?.controlled?.[0]?.document; const c = me && cbtOf(me.id);
      if (!c || game.combat?.combatant?.id !== c.id) return;     // not in combat / not your turn: leave Argon's normal chat card alone
      ev.stopPropagation(); ev.preventDefault(); disengage();
    } catch (e) { console.warn(MOD, "argon disengage", e); }
  }, true);
}
// body.arkane-driver while the player's own token is the driver of a vehicle (the CSS then trims the Argon HUD down to drive / ram / dive / ask-check)
function isDriverTok(td) {
  const ride = td?.getFlag?.(MOD, "ride"); if (!ride) return false;
  const vt = td.parent?.tokens?.get(ride.on);
  return (vt?.getFlag(MOD, "riders") ?? []).find((x) => x.seat === 0)?.id === td.id;
}
function syncDriverClass() {
  try {
    const td = canvas?.tokens?.controlled?.[0]?.document ?? canvas?.tokens?.placeables?.find((t) => t.actor?.id === game.user.character?.id && t.isOwner)?.document;
    document.body.classList.toggle("arkane-driver", !game.user.isGM && isDriverTok(td));
  } catch (e) { console.warn(MOD, "driver class", e); }
}
function hookDriverClass() {
  for (const h of ["controlToken", "updateToken", "canvasReady", "createToken", "deleteToken"]) Hooks.on(h, () => setTimeout(syncDriverClass, 150));
  syncDriverClass();
}
let bigRaf = 0, bigObs = null;
function bigAskButton() {
  bigRaf = 0;
  // driver-only buttons (พุ่งชน / ดิฟหลบ) and the ones a driver keeps; the CSS hides everything else for a driver and the driver-only ones for everyone else
  for (const t of document.querySelectorAll(".extended-combat-hud .action-element-title, .extended-combat-hud .feature-element-title")) {
    const nm = t.textContent.trim(), el = t.parentElement; if (!el) continue;
    if (nm === "พุ่งชน" || nm === "ดิฟหลบ") el.classList.add("arkane-keep", "arkane-drv-only");
    else if (nm.includes("ขอทอยเช็ค")) el.classList.add("arkane-keep");
  }
  // "ใช้ของในกระเป๋า" sits right beside the Dash column (replaces the old big Shove tile)
  const dashBox = [...document.querySelectorAll(".extended-combat-hud .action-element-title")].find((x) => x.textContent.trim() === "วิ่งเร็ว")?.closest(".action-element-container");
  for (const t of document.querySelectorAll(".extended-combat-hud .action-element-title, .extended-combat-hud .feature-element-title")) {
    if (t.textContent.trim() !== "ใช้ของในกระเป๋า") continue;
    const el = t.parentElement; if (!el) continue;
    el.classList.add("arkane-big-bag");
    if (dashBox && el !== dashBox && el.previousElementSibling !== dashBox && dashBox.parentElement) dashBox.after(el);
  }
  for (const t of document.querySelectorAll(".extended-combat-hud .action-element-title, .extended-combat-hud .feature-element-title")) {
    if (!t.textContent.includes("ขอทอยเช็ค")) continue;
    const el = t.parentElement; if (!el || el.classList.contains("arkane-big-ask")) continue;
    el.classList.add("arkane-big-ask");
    const box = el.parentElement;
    if (box?.classList.contains("action-element-container")) box.after(el);
  }
}
function startBigAsk() {
  if (bigObs) return;
  bigObs = new MutationObserver(() => { if (!bigRaf) bigRaf = requestAnimationFrame(bigAskButton); });
  bigObs.observe(document.body, { childList: true, subtree: true });
  bigAskButton();
}
let lastCa = 0;
function hookCombatFeats() {
  Hooks.on("dnd5e.preUseActivity", (activity) => {
    const key = activity?.item?.getFlag?.(MOD, "combatAction");
    const f = COMBAT_FEATS.find((x) => x.key === key) ?? LEGACY_FEATS.find((x) => x.key === key);
    if (!f) return;
    if (Date.now() - lastCa > 600) {   // guard against the hook firing twice for one click
      lastCa = Date.now();
      try { const tok = activity.actor?.getActiveTokens?.()[0]; if (tok && !tok.controlled) tok.control({ releaseOthers: true }); } catch {}
      setTimeout(() => Promise.resolve(f.fn()).catch((e) => console.warn(MOD, "combat feat", e)), 0);
    }
    return false;   // cancel the empty activity use (no chat card, no slot spent)
  });
  // registerCombatX() already runs inside the "ready" hook, so Hooks.once("ready") would never fire: run now (or on ready if called earlier)
  const addFeats = () => { if (game.user.isGM) ensureCombatFeats().then((n) => n && ui.notifications.info(`ใส่ปุ่มต่อสู้ (ขว้างน้ำมัน/ผลัก/ถอยตัว/โจมตีสวน/Ready) ให้ตัวละคร ${n} รายการ`)).catch((e) => console.warn(MOD, "ensureCombatFeats", e)); };
  if (game.ready) setTimeout(addFeats, 1500); else Hooks.once("ready", addFeats);
  try { startBigAsk(); hookArgonDisengage(); hookDriverClass(); } catch (e) { console.warn(MOD, "big ask button", e); }
  // players: top up the "ขอทอยเช็ค" button on their own character if the GM has not added it yet (waits for the GM first to avoid duplicates)
  const addAsk = async () => {
    if (game.user.isGM) return;
    for (const a of game.actors.filter((x) => x.type === "character" && x.isOwner && !x.getFlag(MOD, "retired"))) {
      for (const it of a.items) { const f0 = COMBAT_FEATS.find((x) => x.key === it.getFlag(MOD, "combatAction")); if (f0 && it.img !== f0.img) { try { await it.update({ img: f0.img }); } catch {} } }
      const old = a.items.filter((i) => RETIRED.includes(i.getFlag(MOD, "combatAction"))).map((i) => i.id);
      if (old.length) { try { await a.deleteEmbeddedDocuments("Item", old); } catch (e) { console.warn(MOD, "retired feat remove", e); } }
      for (const key of ["askcheck", "useitem"]) {
        if (a.items.some((i) => i.getFlag(MOD, "combatAction") === key)) continue;
        const f = COMBAT_FEATS.find((x) => x.key === key); const id = foundry.utils.randomID();
        try { await a.createEmbeddedDocuments("Item", [{ name: f.name, type: "feat", img: f.img, flags: { [MOD]: { combatAction: f.key } },
          system: { description: { value: `<p>${f.desc}</p>`, chat: "" }, type: { value: "class" }, activation: { type: f.type, value: 1 },
            activities: { [id]: { _id: id, type: "utility", name: f.name, activation: { type: f.type, value: 1, override: true } } } } }]); } catch (e) { console.warn(MOD, "combat feat top-up", e); }
      }
    }
  };
  setTimeout(addAsk, 7000);

}
