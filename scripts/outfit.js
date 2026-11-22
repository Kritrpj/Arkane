// Outfits (clothes) for player characters.
//  - Anyone who owns a character can right-click the token, press the shirt button, pick an outfit, or add a new one:
//    upload a picture, name it, adjust the round token, save. The new outfit is put on right away.
//  - Pictures are saved in the world folder worlds/<world>/arkane-outfits/. A player who is not allowed to upload files
//    sends the pictures to the GM, who saves them (the GM has to be online).
//  - Outfits made by the module itself (like Mozxorion's chef outfit) are listed in SETS below.
// Data per actor: flags.arkane-1920s.outfit (the id now worn) · .outfits {id:{name,img,tok}} (added by players) · .outfitBase {img,tok} (original look when no pcs/ image exists)
const MOD = "arkane-1920s", SOCK = `module.${MOD}`;
const SETS = {   // module-made outfits: files modules/arkane-1920s/pcs/<file>.webp (portrait) and <file>-token.webp (round token)
  mozxorion: { name: "Mozxorion", outfits: { default: ["mozxorion", "ชุดปกติ"], chef: ["mozxorion-chef", "ชุดเชฟ"] } }
};
const MAX_CUSTOM = 12, RING = "rgb(120,170,169)";
const FRAME = new Image(); FRAME.src = `modules/${MOD}/pcs/token-frame.webp`;
const esc = (s) => foundry.utils.escapeHTML(String(s ?? ""));
const FP = () => foundry.applications.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
const DIR = () => `worlds/${game.world.id}/arkane-outfits`;
const pcKey = (a) => a?.getFlag?.(MOD, "pc");
const DlgV2 = () => foundry.applications.api.DialogV2;

// ---------- the list of outfits of one actor
function listOutfits(actor) {
  const key = pcKey(actor), set = SETS[key], out = [];
  const base = actor.getFlag(MOD, "outfitBase");
  if (set?.outfits.default) out.push({ id: "default", name: set.outfits.default[1], img: `modules/${MOD}/pcs/${set.outfits.default[0]}.webp`, tok: `modules/${MOD}/pcs/${set.outfits.default[0]}-token.webp` });
  else if (key) out.push({ id: "default", name: "ชุดปกติ", img: `modules/${MOD}/pcs/${key}.webp`, tok: `modules/${MOD}/pcs/${key}-token.webp` });
  else if (base) out.push({ id: "default", name: "ชุดปกติ", img: base.img, tok: base.tok });
  for (const [id, v] of Object.entries(set?.outfits ?? {})) if (id !== "default") out.push({ id, name: v[1], img: `modules/${MOD}/pcs/${v[0]}.webp`, tok: `modules/${MOD}/pcs/${v[0]}-token.webp` });
  for (const [id, v] of Object.entries(actor.getFlag(MOD, "outfits") ?? {})) if (v?.img) out.push({ id, name: v.name, img: v.img, tok: v.tok, custom: true });
  return out;
}

async function applyOutfit(actor, o) {
  const upd = { img: o.img, "prototypeToken.texture.src": o.tok, [`flags.${MOD}.outfit`]: o.id };
  if (!actor.getFlag(MOD, "outfit") && !pcKey(actor) && !actor.getFlag(MOD, "outfitBase")) upd[`flags.${MOD}.outfitBase`] = { img: actor.img, tok: actor.prototypeToken?.texture?.src ?? actor.img };   // remember the original look
  await actor.update(upd);
  let n = 0;
  for (const sc of game.scenes) {
    const ts = sc.tokens.filter((t) => t.actorId === actor.id); if (!ts.length) continue;
    try { await sc.updateEmbeddedDocuments("Token", ts.map((t) => ({ _id: t._id, "texture.src": o.tok }))); n += ts.length; } catch (e) { console.warn(MOD, "outfit token", e); }
  }
  ui.notifications.info(`${actor.name}: ${o.name}${n ? "" : " (ยังไม่มีโทเคนบนฉาก)"}`);
}

// ---------- adding a new outfit (record only; the files are already saved)
async function addRecord(actor, name, img, tok) {
  const cur = actor.getFlag(MOD, "outfits") ?? {};
  if (Object.keys(cur).length >= MAX_CUSTOM) { ui.notifications.warn(`ชุดเต็มแล้ว (สูงสุด ${MAX_CUSTOM} ชุด) ลบชุดเก่าก่อน`); return null; }
  const id = "u" + Date.now().toString(36);
  const nm = String(name ?? "").trim().slice(0, 24) || "ชุดใหม่";
  await actor.setFlag(MOD, "outfits", { ...cur, [id]: { name: nm, img, tok } });
  return { id, name: nm, img, tok };
}

async function ensureDir() {
  try { await FP().browse("data", DIR()); } catch { try { await FP().createDirectory("data", DIR()); } catch (e) { console.warn(MOD, "outfit dir", e); } }
}
async function uploadFile(blob, name) {
  const r = await FP().upload("data", DIR(), new File([blob], name, { type: blob.type || "image/webp" }), {}, { notify: false });
  if (!r?.path) throw new Error("upload refused");
  return r.path;
}
const toDataURL = (blob) => new Promise((res, rej) => { const f = new FileReader(); f.onload = () => res(f.result); f.onerror = rej; f.readAsDataURL(blob); });

// ---------- picture processing (done in the browser)
async function loadImage(file) { const u = URL.createObjectURL(file), im = new Image(); im.src = u; await im.decode(); return im; }
function portraitBlob(im) {
  const k = Math.min(1, 900 / Math.max(im.naturalWidth, im.naturalHeight)), c = document.createElement("canvas");
  c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k); c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
  return new Promise((r) => c.toBlob(r, "image/webp", 0.88));
}
function drawToken(c, im, { zoom, ox, oy }) {
  const S = c.width, g = c.getContext("2d"), side = Math.min(im.naturalWidth, im.naturalHeight) / zoom;
  const sx = Math.max(0, Math.min(im.naturalWidth - side, (im.naturalWidth - side) * ox)), sy = Math.max(0, Math.min(im.naturalHeight - side, (im.naturalHeight - side) * oy));
  g.clearRect(0, 0, S, S); g.save(); g.beginPath(); g.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); g.clip(); g.drawImage(im, sx, sy, side, side, 0, 0, S, S); g.restore();
  if (FRAME.complete && FRAME.naturalWidth) g.drawImage(FRAME, 0, 0, S, S);   // same gold frame as the other player tokens
  else { g.strokeStyle = RING; g.lineWidth = S * 9 / 512 * 2; g.beginPath(); g.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); g.stroke(); }
}
function tokenBlob(im, p) { const c = document.createElement("canvas"); c.width = c.height = 512; drawToken(c, im, p); return new Promise((r) => c.toBlob(r, "image/webp", 0.9)); }

// ---------- dialogs
async function addDialog(actor) {
  let im = null;
  const css = `<style>.ao-add label{display:block;margin:.4em 0 .15em;font-weight:600}.ao-add input[type=text]{width:100%}.ao-add input[type=range]{width:100%}.ao-add .ao-pv{display:flex;gap:12px;align-items:center;margin-top:.5em}.ao-add canvas{width:150px;height:150px;border-radius:50%;background:#222;flex:none}.ao-add small{opacity:.75}</style>`;
  const content = `${css}<div class="ao-add">
    <label>ชื่อชุด (เช่น ชุดนอน ชุดเชฟ ชุดออกงาน)</label><input type="text" name="nm" maxlength="24" placeholder="ชื่อชุด">
    <label>รูปตัวละครในชุดนี้</label><input type="file" name="f" accept="image/*">
    <div class="ao-pv"><canvas width="300" height="300"></canvas><div style="flex:1">
      <label>ซูมโทเคน</label><input type="range" name="z" min="1" max="3" step="0.05" value="1">
      <label>เลื่อนซ้าย-ขวา</label><input type="range" name="x" min="0" max="1" step="0.01" value="0.5">
      <label>เลื่อนบน-ล่าง</label><input type="range" name="y" min="0" max="1" step="0.01" value="0"></div></div>
    <small>รูปใหญ่ที่เห็นทั้งตัวหรือครึ่งตัวใช้ได้ ระบบตัดโทเคนกลมจากด้านบนของรูปให้ ปรับตำแหน่งได้ด้วยแถบด้านบน</small></div>`;
  return DlgV2().wait({
    window: { title: `${actor.name}: เพิ่มชุดใหม่` }, content, rejectClose: false, position: { width: 420 },
    render: (ev, dlg) => {
      const root = dlg.element, q = (n) => root.querySelector(`[name=${n}]`), cv = root.querySelector("canvas");
      const params = () => ({ zoom: +q("z").value, ox: +q("x").value, oy: +q("y").value });
      const redraw = () => { if (im) drawToken(cv, im, params()); };
      q("f").addEventListener("change", async () => { const f = q("f").files?.[0]; if (!f) return; try { im = await loadImage(f); redraw(); } catch { ui.notifications.warn("เปิดรูปนี้ไม่ได้ ลองไฟล์ png / jpg / webp"); } });
      for (const n of ["z", "x", "y"]) q(n).addEventListener("input", redraw);
      dlg._ao = () => ({ im, name: q("nm").value, file: q("f").files?.[0], p: params() });
    },
    buttons: [
      { action: "ok", label: "บันทึกและใส่เลย", default: true, callback: (ev, btn, dlg) => dlg._ao?.() ?? null },
      { action: "no", label: "ยกเลิก", callback: () => null }
    ]
  });
}

export async function openOutfits(actor) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor) return ui.notifications.warn("เลือกโทเคนของตัวละครก่อน");
  if (!actor.isOwner) return ui.notifications.warn("เปลี่ยนชุดได้เฉพาะตัวละครของตัวเอง");
  const now = actor.getFlag(MOD, "outfit") ?? "default", list = listOutfits(actor);
  const cards = list.map((o) => `<div class="ao-card${o.id === now ? " on" : ""}"><img src="${esc(o.tok)}"><span>${esc(o.name)}</span><button type="button" data-act="wear" data-id="${esc(o.id)}">${o.id === now ? "ใส่อยู่" : "ใส่"}</button>${o.custom ? `<button type="button" data-act="del" data-id="${esc(o.id)}" title="ลบชุดนี้">✕ ลบ</button>` : ""}</div>`).join("");
  const css = `<style>.ao-grid{display:flex;flex-wrap:wrap;gap:10px}.ao-card{width:104px;text-align:center;display:flex;flex-direction:column;gap:3px;align-items:center;padding:6px;border:1px solid #6665;border-radius:8px}.ao-card.on{border-color:#7aa;background:#7aa2}.ao-card img{width:80px;height:80px;border-radius:50%;object-fit:cover}.ao-card span{font-size:12px;line-height:1.2;min-height:2.4em}.ao-card button{width:100%;line-height:1.3}</style>`;
  let pick = null;
  const res = await DlgV2().wait({
    window: { title: `${actor.name}: ชุดของฉัน` }, content: `${css}<div class="ao-grid">${cards || "<p>ยังไม่มีชุด</p>"}</div>`, rejectClose: false, position: { width: 470 },
    render: (ev, dlg) => dlg.element.querySelectorAll("[data-act]").forEach((b) => b.addEventListener("click", () => { pick = { act: b.dataset.act, id: b.dataset.id }; dlg.close(); })),
    buttons: [{ action: "add", label: "＋ เพิ่มชุดใหม่ (อัปโหลดรูป)", callback: () => ({ act: "add" }) }, { action: "close", label: "ปิด", callback: () => null }]
  }).catch(() => null);
  pick ??= res;
  if (!pick) return;
  if (pick.act === "add") return addFlow(actor);
  const o = listOutfits(actor).find((x) => x.id === pick.id); if (!o) return;
  if (pick.act === "wear") return applyOutfit(actor, o);
  if (pick.act === "del" && o.custom) {
    await actor.update({ [`flags.${MOD}.outfits.-=${o.id}`]: null });
    if ((actor.getFlag(MOD, "outfit") ?? "default") === o.id) { const d = listOutfits(actor).find((x) => x.id === "default"); if (d) await applyOutfit(actor, d); }
    ui.notifications.info(`ลบชุด "${o.name}" แล้ว`);
  }
}

async function addFlow(actor) {
  const r = await addDialog(actor);
  if (!r) return;
  if (!r.file || !r.im) return ui.notifications.warn("ยังไม่ได้เลือกรูป");
  if (r.file.size > 15e6) return ui.notifications.warn("รูปใหญ่เกิน 15 MB");
  const name = String(r.name ?? "").trim();
  if (!name) return ui.notifications.warn("ตั้งชื่อชุดก่อน");
  ui.notifications.info("กำลังบันทึกชุด…");
  const [pb, tb] = await Promise.all([portraitBlob(r.im), tokenBlob(r.im, r.p)]);
  const stamp = `${actor.id}-${Date.now().toString(36)}`;
  try {   // direct upload (the GM, or a player who may upload files)
    if (!game.user.isGM && !game.user.can("FILES_UPLOAD")) throw new Error("no upload permission");
    const [img, tok] = [await uploadFile(pb, `${stamp}.webp`), await uploadFile(tb, `${stamp}-token.webp`)];
    const rec = await addRecord(actor, name, img, tok); if (rec) await applyOutfit(actor, rec);
  } catch (e) {   // otherwise ask the GM to save the pictures
    if (game.user.isGM) { console.error(MOD, "outfit upload", e); return ui.notifications.error("อัปโหลดรูปไม่สำเร็จ (ดู F12)"); }
    if (!game.users.activeGM) return ui.notifications.error("ตอนนี้ไม่มี GM ออนไลน์ ให้ GM ช่วยบันทึกรูปไม่ได้");
    game.socket.emit(SOCK, { t: "o-up", actorId: actor.id, name, portrait: await toDataURL(pb), token: await toDataURL(tb) });
    ui.notifications.info("ส่งรูปให้ GM บันทึกแล้ว รอสักครู่ ชุดจะถูกใส่ให้เอง");
  }
}

// GM side: saves the pictures a player sent
async function gmSave(d, uid) {
  const user = game.users.get(uid), actor = game.actors.get(d?.actorId);
  if (!user || !actor || !actor.testUserPermission(user, "OWNER")) return;
  const ok = (u) => typeof u === "string" && u.startsWith("data:image/webp;base64,") && u.length < 1.6e6;
  if (!ok(d.portrait) || !ok(d.token)) return game.socket.emit(SOCK, { t: "o-no", to: uid });
  try {
    await ensureDir();
    const stamp = `${actor.id}-${Date.now().toString(36)}`, blob = async (u) => (await fetch(u)).blob();
    const img = await uploadFile(await blob(d.portrait), `${stamp}.webp`), tok = await uploadFile(await blob(d.token), `${stamp}-token.webp`);
    const rec = await addRecord(actor, d.name, img, tok); if (rec) await applyOutfit(actor, rec);
    game.socket.emit(SOCK, { t: "o-ok", to: uid, name: rec?.name });
  } catch (e) { console.error(MOD, "outfit relay", e); game.socket.emit(SOCK, { t: "o-no", to: uid }); }
}

// GM macro: game.arkane.outfit() asks · game.arkane.outfit(actor, "chef") puts a listed outfit on straight away
export async function changeOutfit(actor, outfit) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor;
  if (!actor) return ui.notifications.warn("เลือกโทเคนของตัวละครก่อน (หรือกดปุ่มรูปเสื้อบนโทเคน)");
  const o = outfit ? listOutfits(actor).find((x) => x.id === outfit) : null;
  if (o) return applyOutfit(actor, o);
  return openOutfits(actor);
}

export function registerOutfits() {
  if (game.user.isGM) ensureDir();
  game.socket.on(SOCK, (d, uid) => {
    if (d?.t === "o-up" && game.users.activeGM?.isSelf) gmSave(d, uid);
    else if (d?.t === "o-ok" && d.to === game.user.id) ui.notifications.info(`ใส่ชุด "${d.name ?? ""}" แล้ว`);
    else if (d?.t === "o-no" && d.to === game.user.id) ui.notifications.error("GM บันทึกรูปไม่สำเร็จ ลองรูปที่เล็กลง หรือแจ้ง GM");
  });
  // token HUD (right-click the token): a shirt button for the owner of a character
  Hooks.on("renderTokenHUD", (hud, html) => {
    try {
      const actor = hud.object?.document?.actor;
      if (!actor?.isOwner || actor.type !== "character") return;
      const el = html instanceof HTMLElement ? html : html[0], col = el?.querySelector(".col.right"); if (!col) return;
      const b = document.createElement("button"); b.type = "button"; b.className = "control-icon arkane-keep"; b.dataset.tooltip = "เปลี่ยนชุด"; b.innerHTML = `<i class="fa-solid fa-shirt"></i>`;
      b.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); hud.close?.(); openOutfits(actor); });
      col.append(b);
    } catch (e) { console.warn(MOD, "outfit hud", e); }
  });
}
