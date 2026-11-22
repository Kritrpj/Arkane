// "ส่งเงินให้เพื่อน": give gold/silver/copper between party members without typing into two sheets.
// Players cannot edit another player's sheet, so the request goes to the GM's client by socket and the GM client applies it.
const MOD = "arkane-1920s";
const SOCK = `module.${MOD}`;
const D = () => foundry.applications?.api?.DialogV2;
const esc = (s) => foundry.utils.escapeHTML(String(s ?? ""));
const COINS = [["gp", "ทอง (gp)"], ["sp", "เงิน (sp)"], ["cp", "ทองแดง (cp)"]];
const pcs = () => game.actors.filter((a) => a.type === "character" && a.getFlag(MOD, "pc") && !a.getFlag(MOD, "retired") && !a.getFlag(MOD, "later"));
const purse = (a) => ({ gp: Number(a.system.currency?.gp ?? 0), sp: Number(a.system.currency?.sp ?? 0), cp: Number(a.system.currency?.cp ?? 0) });

function mine() {
  const t = canvas?.tokens?.controlled?.[0]?.actor;
  if (t && t.type === "character") return t;
  if (game.user.character) return game.user.character;
  return game.user.isGM ? null : pcs().find((a) => a.isOwner) ?? null;
}

async function apply({ from, to, gp = 0, sp = 0, cp = 0 }) {
  const a = game.actors.get(from), b = game.actors.get(to);
  if (!a || !b) return false;
  const pa = purse(a);
  if (gp > pa.gp || sp > pa.sp || cp > pa.cp) return false;
  const pb = purse(b);
  await a.update({ "system.currency.gp": pa.gp - gp, "system.currency.sp": pa.sp - sp, "system.currency.cp": pa.cp - cp }, { arkaneInternal: true });
  await b.update({ "system.currency.gp": pb.gp + gp, "system.currency.sp": pb.sp + sp, "system.currency.cp": pb.cp + cp }, { arkaneInternal: true });
  const txt = COINS.map(([k]) => ({ gp, sp, cp })[k] ? `${{ gp, sp, cp }[k]} ${k}` : "").filter(Boolean).join(" + ");
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor: a }), content: `<div class="rw-card"><div class="rw-title">ส่งเงิน</div><b>${esc(a.name)}</b> ให้ <b>${esc(b.name)}</b>: ${txt}</div>` });
  return true;
}

// ---------- draggable coins: a purse window; drag a coin chip onto a friend's token on the map or onto their character sheet
const MIME_TYPE = "ArkaneCoin";
const CSS = `<style>
.rw-purse{display:flex;flex-direction:column;gap:6px}.rw-purse .row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.rw-coin{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:15px;cursor:grab;user-select:none;border:3px solid rgba(0,0,0,.55);box-shadow:inset 0 2px 3px rgba(255,255,255,.5),0 2px 4px rgba(0,0,0,.5);color:#2a1a05}
.rw-coin:active{cursor:grabbing}.rw-coin.gp{background:radial-gradient(circle at 35% 30%,#fff3b0,#d9a82a 60%,#9a6f10)}
.rw-coin.sp{background:radial-gradient(circle at 35% 30%,#ffffff,#b9c0c8 60%,#7a838c)}.rw-coin.cp{background:radial-gradient(circle at 35% 30%,#ffd2b0,#c47a45 60%,#7a4420)}
.rw-coin small{font-size:9px;display:block;line-height:1;margin-top:-1px;text-align:center}</style>`;
const CH = [["gp", [1, 5, 10, 25, 50]], ["sp", [1, 5, 10]], ["cp", [1, 5, 10]]];
export async function openPurse() {
  let from = mine();
  if (!from && game.user.isGM) from = pcs()[0];
  if (!from) return ui.notifications.warn("เลือกโทเคนของตัวเองก่อน");
  const D2 = foundry.applications.api.DialogV2;
  const p = purse(from);
  const chip = (k, n) => `<div class="rw-coin ${k}" draggable="true" data-k="${k}" data-n="${n}" title="ลากไปวางบนโทเคนหรือชีตของเพื่อน"><span>${n}<small>${k}</small></span></div>`;
  const rows = CH.map(([k, vals]) => `<div class="row"><b style="width:34px">${k}</b>${vals.filter((n) => n <= p[k]).map((n) => chip(k, n)).join("") || '<span class="rw-hint">ไม่มี</span>'}<span class="rw-hint">มี ${p[k]}</span></div>`).join("");
  const dlg = new D2({ window: { title: `กระเป๋าเงิน: ${from.name}` }, position: { width: 340 }, modal: false,
    content: `${CSS}<div class="rw-purse"><p class="rw-hint" style="margin:0">ลากเหรียญไปวางบนโทเคนของเพื่อนบนแมพ หรือบนชีตตัวละครของเพื่อน</p>${rows}
      <div class="row"><input type="number" name="n" value="1" min="1" style="width:70px"><select name="k"><option value="gp">gp</option><option value="sp">sp</option><option value="cp">cp</option></select>
      <div class="rw-coin gp" draggable="true" data-custom="1" title="ลากเหรียญตามจำนวนที่กรอก"><span>จำนวน<small>ที่กรอก</small></span></div></div></div>`,
    buttons: [{ action: "close", label: "ปิด", default: true }] });
  await dlg.render({ force: true });
  const el = dlg.element;
  el.addEventListener("dragstart", (ev) => {
    const c = ev.target.closest?.(".rw-coin"); if (!c) return;
    let k = c.dataset.k, n = Number(c.dataset.n);
    if (c.dataset.custom) { k = el.querySelector("[name=k]").value; n = Math.max(1, Math.floor(Number(el.querySelector("[name=n]").value) || 1)); }
    ev.dataTransfer.setData("text/plain", JSON.stringify({ type: MIME_TYPE, from: from.id, [k]: n }));
    ev.dataTransfer.effectAllowed = "copy";
    window.__arkCoinDrag = true;
  });
  el.addEventListener("dragend", () => { window.__arkCoinDrag = false; });
}
function targetActor(ev) {
  const el = document.elementFromPoint(ev.clientX, ev.clientY);
  const app = el?.closest?.(".application, .app");
  if (app) {
    const a = foundry.applications?.instances?.get(app.id) ?? ui.windows?.[app.dataset?.appid];
    const doc = a?.document ?? a?.actor;
    if (doc?.documentName === "Actor") return doc;
    return null;
  }
  if (el?.closest?.("#board, canvas")) {
    const pt = canvas.canvasCoordinatesFromClient?.({ x: ev.clientX, y: ev.clientY });
    if (!pt) return null;
    const t = canvas.tokens.placeables.filter((q) => q.visible && q.actor && q.bounds.contains(pt.x, pt.y)).sort((a, b) => b.document.sort - a.document.sort)[0];
    return t?.actor ?? null;
  }
  return null;
}
function onDrop(ev) {
  let d; try { d = JSON.parse(ev.dataTransfer?.getData("text/plain") || "null"); } catch { return; }
  if (d?.type !== MIME_TYPE) return;
  ev.preventDefault(); ev.stopPropagation();
  const to = targetActor(ev), from = game.actors.get(d.from);
  if (!to || !from) return ui.notifications.warn("วางเหรียญบนโทเคนหรือชีตของเพื่อน");
  if (to.id === from.id) return;
  if (to.type !== "character") return ui.notifications.warn("ส่งเงินได้เฉพาะตัวละครผู้เล่น");
  const give = { from: from.id, to: to.id, gp: d.gp ?? 0, sp: d.sp ?? 0, cp: d.cp ?? 0 };
  const q = purse(from);
  if (give.gp > q.gp || give.sp > q.sp || give.cp > q.cp) return ui.notifications.warn("เงินไม่พอ");
  if (game.users.activeGM?.isSelf) return void apply(give);
  if (!game.users.activeGM) return ui.notifications.warn("ไม่มี GM ออนไลน์ ส่งเงินไม่ได้");
  game.socket.emit(SOCK, { t: "give", user: game.user.id, ...give });
}

export function registerMoney() {
  document.addEventListener("drop", onDrop, true);
  document.addEventListener("dragover", (ev) => { if (window.__arkCoinDrag) ev.preventDefault(); }, true);
  game.socket.on(SOCK, async (d) => {
    if (d?.t !== "give" || !game.users.activeGM?.isSelf) return;
    const from = game.actors.get(d.from);
    const sender = game.users.get(d.user);
    if (!from || !sender || !from.testUserPermission(sender, "OWNER")) return;   // only the owner of the sending sheet may send
    const ok = await apply(d).catch((e) => { console.warn(MOD, "give", e); return false; });
    if (!ok) ui.notifications.warn("ส่งเงินไม่สำเร็จ: เงินไม่พอ หรือไม่พบตัวละคร");
  });
}

export async function giveMoney() {
  let from = mine();
  const all = pcs();
  if (!from) {
    if (!game.user.isGM) return ui.notifications.warn("เลือกโทเคนของตัวเองก่อน หรือให้ GM ผูกตัวละครกับผู้ใช้");
    from = all[0];
  }
  if (!from) return ui.notifications.warn("ไม่พบตัวละครผู้เล่น");
  const others = all.filter((a) => a.id !== from.id);
  if (!others.length) return ui.notifications.warn("ไม่มีเพื่อนในตี้ให้ส่งเงิน");
  const p = purse(from);
  const froms = game.user.isGM ? all : [from];
  const row = ([k, label]) => `<div class="form-group" style="align-items:center"><label style="width:110px">${label}</label>
    <input type="number" name="${k}" value="0" min="0" max="${p[k]}" step="1" style="width:80px">
    <span class="rw-hint" data-have="${k}" style="margin:0 6px">มี ${p[k]}</span>
    <button type="button" data-add="${k}:1">+1</button><button type="button" data-add="${k}:5">+5</button><button type="button" data-add="${k}:10">+10</button><button type="button" data-add="${k}:25">+25</button><button type="button" data-all="${k}">ทั้งหมด</button></div>`;
  const r = await D().wait({
    window: { title: "ส่งเงินให้เพื่อน" },
    content: `<div class="rw-form">
      <div class="form-group"><label>จาก</label><select name="from" ${froms.length > 1 ? "" : "disabled"}>${froms.map((a) => `<option value="${a.id}" ${a.id === from.id ? "selected" : ""}>${esc(a.name)}</option>`).join("")}</select></div>
      <div class="form-group"><label>ให้</label><select name="to">${others.map((a) => `<option value="${a.id}">${esc(a.name)}</option>`).join("")}</select></div>
      ${COINS.map(row).join("")}
      <p class="rw-hint">กดปุ่ม +1 / +5 / +10 / +25 เพื่อเพิ่มทีละก้อน หรือ "ทั้งหมด" เพื่อส่งทั้งกระเป๋า ผู้รับไม่ต้องกดอะไร</p></div>`,
    render: (ev, dlg) => {
      const el = dlg.element ?? ev.target?.element ?? document;
      const f = el.querySelector("form") ?? el;
      const cur = () => purse(game.actors.get(f.querySelector("[name=from]").value) ?? from);
      f.querySelector("[name=from]")?.addEventListener("change", () => { const q = cur(); for (const [k] of COINS) { const i = f.querySelector(`[name=${k}]`); i.max = q[k]; i.value = 0; f.querySelector(`[data-have=${k}]`).textContent = `มี ${q[k]}`; } });
      f.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => { const [k, n] = b.dataset.add.split(":"); const i = f.querySelector(`[name=${k}]`); i.value = Math.min(Number(i.max), Number(i.value || 0) + Number(n)); }));
      f.querySelectorAll("[data-all]").forEach((b) => b.addEventListener("click", () => { const k = b.dataset.all; const i = f.querySelector(`[name=${k}]`); i.value = i.max; }));
    },
    buttons: [{ action: "ok", label: "ส่งเงิน", default: true, callback: (ev, btn) => { const fd = new FormDataExtended(btn.form).object; return fd; } }, { action: "cancel", label: "ยกเลิก" }],
    rejectClose: false });
  if (!r || r === "cancel" || typeof r !== "object") return;
  const fromId = r.from || from.id;
  const give = { from: fromId, to: r.to, gp: Math.max(0, Math.floor(Number(r.gp) || 0)), sp: Math.max(0, Math.floor(Number(r.sp) || 0)), cp: Math.max(0, Math.floor(Number(r.cp) || 0)) };
  if (!give.gp && !give.sp && !give.cp) return ui.notifications.info("ไม่ได้ใส่จำนวนเงิน");
  const src = game.actors.get(fromId), q = purse(src);
  if (give.gp > q.gp || give.sp > q.sp || give.cp > q.cp) return ui.notifications.warn("เงินไม่พอ");
  if (game.users.activeGM?.isSelf) { await apply(give); return; }
  if (!game.users.activeGM) return ui.notifications.warn("ไม่มี GM ออนไลน์ ส่งเงินไม่ได้");
  game.socket.emit(SOCK, { t: "give", user: game.user.id, ...give });
}
