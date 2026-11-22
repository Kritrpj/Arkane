// Combat action tracker: shows each player what is left this turn (Action / Bonus Action / Reaction / movement)
// and ticks them off automatically when an activity is used or the token moves. Click a box to fix it by hand.
const MOD = "arkane-1920s";
const KEY = "economy";
const SOCK = `module.${MOD}`;

const blank = () => ({ action: false, bonus: false, reaction: false, moved: 0, dash: false, attacks: 0 });
const stateOf = (c) => ({ ...blank(), ...(c?.getFlag(MOD, KEY) ?? {}) });
const live = () => (game.combat?.started ? game.combat : null);

function combatantOf(actor) {
  const cb = live();
  if (!cb || !actor) return null;
  return cb.combatants.find((c) => c.actor === actor || c.actorId === actor.id && c.token?.actorLink) ?? null;
}
function speedOf(c) {
  const mv = c?.actor?.system?.attributes?.movement ?? {};
  return Number(mv.walk) || 30;
}
function maxAttacks(actor) {
  return actor?.items?.some((i) => /^Extra Attack/i.test(i.name)) ? 2 : 1;
}

// write: owners write directly, everyone else asks the GM through the socket
async function patch(c, data) {
  if (!c) return;
  const next = { ...stateOf(c), ...data };
  if (c.isOwner) {
    try { return await c.setFlag(MOD, KEY, next); } catch (e) { console.warn(MOD, "economy", e); }
  }
  game.socket.emit(SOCK, { t: "economy", combat: c.parent.id, combatant: c.id, data: next });
}

const LABEL = { action: "Action", bonus: "Bonus Action", reaction: "Reaction" };

// ---------- players can't act out of turn or use the same Action/Bonus twice
function preUse(activity) {
  try {
    if (game.user.isGM || !game.settings.get(MOD, "limitMove")) return;
    const actor = activity?.actor ?? activity?.item?.actor;
    const c = combatantOf(actor);
    const type = activity?.activation?.type;
    if (!c || !["action", "bonus"].includes(type)) return;
    const cb = c.parent;
    if (cb.combatant?.id !== c.id) { ui.notifications.warn(`${c.name}: ยังไม่ถึงตาของคุณ (นอกเทิร์นใช้ได้แค่ Reaction)`); return false; }
    const s = stateOf(c);
    if (type === "bonus" && s.bonus) { ui.notifications.warn(`${c.name}: ใช้ Bonus Action ไปแล้วในเทิร์นนี้`); return false; }
    if (type === "action" && s.action) {
      const extra = activity.type === "attack" && s.attacks > 0 && s.attacks < maxAttacks(actor);
      if (!extra) { ui.notifications.warn(`${c.name}: ใช้ Action ไปแล้วในเทิร์นนี้ (กด End Turn ใน Combat Tracker เมื่อเสร็จ)`); return false; }
    }
  } catch (e) { console.warn(MOD, "economy preUse", e); }
}

// ---------- automatic tracking
function onUse(activity) {
  try {
    const actor = activity?.actor ?? activity?.item?.actor;
    const c = combatantOf(actor);
    if (!c || !c.isOwner) return;
    const type = activity.activation?.type;
    if (!["action", "bonus", "reaction"].includes(type)) return;
    const s = stateOf(c), cb = c.parent;
    const myTurn = cb.combatant?.id === c.id;
    if (type !== "reaction" && !myTurn) ui.notifications.info(`${c.name}: ยังไม่ถึงตาของคุณ`);
    const upd = {};
    if (type === "action" && activity.type === "attack") {
      const n = s.attacks + 1, max = maxAttacks(actor);
      upd.attacks = n;
      if (s.action && n > max) ui.notifications.warn(`${c.name}: ใช้ Action ไปแล้วในเทิร์นนี้`);
      upd.action = true;
      if (n < max) ui.notifications.info(`${c.name}: Extra Attack · โจมตีได้อีก ${max - n} ครั้งใน Action นี้`);
    } else {
      if (s[type]) ui.notifications.warn(`${c.name}: ใช้ ${LABEL[type]} ไปแล้ว${type === "reaction" ? "ในรอบนี้" : "ในเทิร์นนี้"}`);
      upd[type] = true;
    }
    patch(c, upd);
  } catch (e) { console.warn(MOD, "economy use", e); }
}

function measure(a, b) {
  const s = canvas.grid.size / 2, p = { x: a.x + s, y: a.y + s }, q = { x: b.x + s, y: b.y + s };
  let d = 0;
  try { d = canvas.grid.measurePath([p, q]).distance; } catch { try { d = canvas.grid.measureDistance(p, q); } catch { d = 0; } }
  const step = canvas.scene?.grid?.distance || 5;
  return Math.round(d / step) * step;
}
function onPreMove(doc, changes, options, userId) {
  if (!("x" in changes || "y" in changes)) return;
  options.arkaneFrom = { x: doc.x, y: doc.y };
  // movement limit: players only, during a started combat, only for tokens in that combat
  if (game.user.isGM || userId !== game.user.id || !game.settings.get(MOD, "limitMove")) return;
  const cb = live();
  const c = cb?.combatants.find((q) => q.tokenId === doc.id);
  if (!c || options.teleport) return;
  if (cb.combatant?.id !== c.id) { ui.notifications.warn(`${c.name}: ยังไม่ถึงตาของคุณ รอเทิร์นก่อนค่อยเดิน`); return false; }
  const to = { x: changes.x ?? doc.x, y: changes.y ?? doc.y };
  const d = Math.round(measure(doc, to) * 10) / 10;
  const st = stateOf(c), max = speedOf(c) * (st.dash ? 2 : 1), left = Math.max(0, max - st.moved);
  if (d > left + 0.01) {
    ui.notifications.warn(`${c.name}: เดินได้อีกแค่ ${left} ฟุต (จะเดิน ${d} ฟุต)${st.dash ? "" : " · กด Dash ในแผงมุมซ้ายล่างเพื่อเดินเพิ่ม (ใช้ Action)"}`);
    return false;
  }
}
function onMove(doc, changes, options, userId) {
  if (userId !== game.user.id || !options.arkaneFrom || !("x" in changes || "y" in changes)) return;
  const cb = live();
  const c = cb?.combatants.find((q) => q.tokenId === doc.id);
  if (!c || cb.combatant?.id !== c.id) return;
  if (game.user.isGM && c.hasPlayerOwner) return; // GM pushing a player's token doesn't spend their movement
  const d = measure(options.arkaneFrom, { x: doc.x, y: doc.y });
  if (!d) return;
  const st = stateOf(c), moved = st.moved + d, max = speedOf(c) * (st.dash ? 2 : 1);
  if (moved > max) ui.notifications.warn(`${c.name}: เดินเกินแล้ว ${moved}/${max} ฟุต${st.dash ? "" : " (ใช้ Dash เพื่อเดินเพิ่ม)"}`);
  patch(c, { moved });
}

// new turn: the GM resets the combatant whose turn starts (Reaction comes back at the start of your own turn)
async function onTurn(cb, changes) {
  if (!("turn" in changes || "round" in changes) || !game.users.activeGM?.isSelf || !cb.started) return;
  const c = cb.combatant;
  if (!c) return;
  await c.setFlag(MOD, KEY, blank());
  const owners = game.users.filter((u) => !u.isGM && c.actor?.testUserPermission(u, "OWNER"));
  if (owners.length) ChatMessage.create({
    whisper: owners.map((u) => u.id), speaker: { alias: "ลำดับการต่อสู้" },
    content: `<div class="rw-card"><div class="rw-title">ถึงตาของ ${c.name}!</div>มี <b>Action 1</b> · <b>Bonus Action 1</b> · <b>เดิน ${speedOf(c)} ฟุต</b> · <b>Reaction 1</b> (ใช้ได้จนถึงต้นเทิร์นหน้า)<br><i>ดูช่องที่เหลือได้ที่แผงมุมซ้ายล่าง</i></div>`
  });
}

// ---------- Argon HUD: mirror our own Action / Bonus / Reaction tracking onto Argon's three sections (its own tick only
// happens for buttons pressed inside the HUD, so anything used another way never looked spent)
function syncArgon() {
  try {
    const cb = live(); if (!cb || !ui.ARGON?.enabled) return;
    const actor = ui.ARGON._actor; if (!actor) return;
    const c = cb.combatants.find((q) => q.actorId === actor.id && (q.actor === actor || q.token?.actorLink || q.token?.actor === actor)); if (!c) return;
    const s = stateOf(c);
    const want = { "DND5E.Action": !!s.action, "DND5E.BonusAction": !!s.bonus, "DND5E.Reaction": !!(s.reaction || c.getFlag(MOD, "reaction")) };
    for (const p of ui.ARGON.components?.main ?? []) {
      if (!(p?.label in want) || !p.element) continue;
      if (p.isActionUsed !== want[p.label]) { p.isActionUsed = want[p.label]; p.updateActionUse?.(); }
    }
  } catch (e) { console.warn(MOD, "argon economy sync", e); }
}

// ---------- panel
let el = null;
function box(c, k, used, label) {
  return `<span class="ae-box ${used ? "used" : ""}" data-c="${c.id}" data-k="${k}" title="${game.user.isGM ? "คลิกเพื่อสลับ" : "ระบบขีดให้เอง"}">${used ? "✕" : "●"} ${label}</span>`;
}
function render() {
  const cb = live();
  if (!cb || !game.settings.get(MOD, "actionHud")) { el?.remove(); el = null; return; }
  // players see their own characters; the GM sees whoever's turn it is
  const list = game.user.isGM ? (cb.combatant ? [cb.combatant] : []) : cb.combatants.filter((c) => c.isOwner && !c.isDefeated);
  if (!list.length) { el?.remove(); el = null; return; }
  if (!el) {
    el = document.createElement("div");
    el.id = "arkane-ae";
    document.body.appendChild(el);
    el.addEventListener("click", (ev) => {
      const t = ev.target.closest("[data-k]");
      if (!t) return;
      const c = live()?.combatants.get(t.dataset.c);
      if (!c) return;
      const s = stateOf(c), k = t.dataset.k;
      const myTurn = live()?.combatant?.id === c.id;
      if (k === "dash") {
        if (!game.user.isGM && !myTurn) return ui.notifications.warn("ยังไม่ถึงตาของคุณ");
        if (!game.user.isGM && s.dash) return;
        if (!game.user.isGM && s.action && s.bonus) return ui.notifications.warn("ไม่มี Action หรือ Bonus Action เหลือให้ Dash");
        return patch(c, s.dash ? { dash: false } : { dash: true, ...(!s.action ? { action: true } : !s.bonus ? { bonus: true } : {}) });
      }
      if (!game.user.isGM) return ui.notifications.info("ช่องนี้ระบบขีดให้เองเมื่อใช้ความสามารถ (ถ้าผิด บอก DM)");
      if (k === "moved") return patch(c, { moved: 0 });
      patch(c, { [k]: !s[k], ...(k === "action" && s.action ? { attacks: 0 } : {}) });
    });
  }
  el.innerHTML = list.map((c) => {
    const s = stateOf(c), mine = cb.combatant?.id === c.id, max = speedOf(c) * (s.dash ? 2 : 1);
    const left = Math.max(0, Math.round((max - s.moved) / 5) * 5);
    const ma = maxAttacks(c.actor);
    const atk = ma > 1 && s.action && s.attacks < ma ? ` <small>(ตีได้อีก ${ma - s.attacks})</small>` : "";
    return `<div class="ae-row ${mine ? "mine" : ""}">
      <div class="ae-name">${c.name} ${mine ? '<span class="ae-turn">ตาของคุณ</span>' : '<span class="ae-wait">รอเทิร์น</span>'}</div>
      <div class="ae-boxes">${box(c, "action", s.action, "Action" + atk)}${box(c, "bonus", s.bonus, "Bonus")}${box(c, "reaction", s.reaction, "Reaction")}</div>
      <div class="ae-move"><span data-c="${c.id}" data-k="moved" title="${game.user.isGM ? "คลิกเพื่อรีเซ็ตระยะเดิน" : ""}">เดินได้อีก <b>${left}</b> / ${max} ฟุต</span>
        <span class="ae-box ${s.dash ? "on" : ""}" data-c="${c.id}" data-k="dash" title="ใช้ Action (หรือ Bonus ถ้ามี Cunning Action) เพื่อ Dash">Dash</span></div>
    </div>`;
  }).join("");
}

const CSS = `#arkane-ae{position:fixed;left:12px;bottom:112px;z-index:70;display:flex;flex-direction:column;gap:6px;pointer-events:auto;font-family:var(--font-primary,sans-serif)}
#arkane-ae .ae-row{background:rgba(18,14,12,.92);border:1px solid #7a5a2c;border-radius:6px;padding:6px 8px;color:#eadfc8;min-width:230px;box-shadow:0 2px 8px #000a}
#arkane-ae .ae-row.mine{border-color:#d9a441;box-shadow:0 0 10px #d9a44188}
#arkane-ae .ae-name{font-weight:bold;font-size:13px;margin-bottom:4px}
#arkane-ae .ae-turn{background:#8a1820;color:#fff;border-radius:3px;padding:0 5px;font-size:11px;margin-left:4px}
#arkane-ae .ae-wait{color:#9a8f7c;font-size:11px;margin-left:4px}
#arkane-ae .ae-boxes{display:flex;gap:4px;flex-wrap:wrap}
#arkane-ae .ae-box{cursor:pointer;border:1px solid #c9a04a;border-radius:4px;padding:1px 6px;font-size:12px;background:#2c4a2a;color:#d8f2c8;user-select:none}
#arkane-ae .ae-box.used{background:#3a2020;color:#a08080;border-color:#5a3a3a;text-decoration:line-through}
#arkane-ae .ae-box.on{background:#6a4a10;color:#ffe2a0}
#arkane-ae .ae-move{display:flex;justify-content:space-between;align-items:center;margin-top:4px;font-size:12px}
#arkane-ae .ae-move > span:first-child{cursor:pointer}
/* Argon HUD: a spent Action / Bonus Action / Reaction section is greyed out and its label bar says so */
.extended-combat-hud .action-hud .actions-container:has(.action-pip.actions-used) > :not(.actions-uses-container){filter:grayscale(1) brightness(.45);opacity:.6;transition:filter .3s,opacity .3s}
.extended-combat-hud .action-hud .actions-container:has(.action-pip.actions-used):before{content:attr(data-title) "  ✕ ใช้แล้ว" !important;background-color:#4a1818 !important;border-color:#a33a3a !important;color:#ffc9c9 !important}
.extended-combat-hud .actions-container .action-pip.actions-used{background-color:#b83a3a !important;box-shadow:none !important}`;

export function registerActionHud() {
  game.settings.register(MOD, "limitMove", { name: "จำกัดระยะเดินตอนต่อสู้", hint: "ผู้เล่นเดินได้เฉพาะในเทิร์นของตัวเอง และไม่เกินความเร็ว (Dash เพิ่มเป็นสองเท่า) · GM ลากได้อิสระ",
    scope: "world", config: true, type: Boolean, default: true });
  game.settings.register(MOD, "actionHud", { name: "แผงแอคชันในการต่อสู้", hint: "แสดง Action / Bonus / Reaction / ระยะเดินที่เหลือของตัวละครระหว่างต่อสู้ (มุมซ้ายล่าง)",
    scope: "client", config: true, type: Boolean, default: true, onChange: () => render() });
  Hooks.once("ready", () => {
    const st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    game.socket.on(SOCK, async (d) => {
      if (d.t !== "economy" || !game.users.activeGM?.isSelf) return;
      const c = game.combats.get(d.combat)?.combatants.get(d.combatant);
      if (c) await c.setFlag(MOD, KEY, d.data);
    });
    render();
  });
  Hooks.on("dnd5e.preUseActivity", preUse);
  Hooks.on("dnd5e.postUseActivity", onUse);
  Hooks.on("preUpdateToken", onPreMove);
  Hooks.on("updateToken", onMove);
  Hooks.on("updateCombat", (cb, ch) => { onTurn(cb, ch); render(); });
  for (const h of ["createCombat", "deleteCombat", "updateCombatant", "createCombatant", "deleteCombatant", "combatStart"]) Hooks.on(h, () => { setTimeout(render, 50); setTimeout(syncArgon, 120); });
  Hooks.on("updateCombat", () => setTimeout(syncArgon, 300));
  Hooks.on("controlToken", () => setTimeout(syncArgon, 600));
  setInterval(syncArgon, 700);   // cheap: only touches a section whose state differs (covers the HUD being rebuilt)
}
