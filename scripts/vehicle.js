// Vehicles: a car/van token. A character boards with a button (token HUD car icon, or the macro 'ขึ้น/ลงรถ'), picks a seat, and later leaves the same way.
// Only the driver (seat 0) can move the vehicle; riders cannot be dragged by hand and are carried along. All changes run on the active GM's client.
const MOD = "arkane-1920s";
const G = 100;
const SCALE = 0.55;   // riders shrink to fit the seats
const VEHICLES = {
  // speed = feet per turn when driven in combat (5 ft per square)
  car: { name: "รถเก๋งสีดำ", img: `modules/${MOD}/vehicles/car.webp`, w: 2, h: 3, speed: 80, ac: 14, hp: 40, labels: ["คนขับ (หน้าซ้าย)", "หน้าขวา", "หลังซ้าย", "หลังขวา"], seats: [[-40, -20], [40, -20], [-40, 70], [40, 70]] },
  van: { name: "รถตู้ C.A.A.M.", img: `modules/${MOD}/vehicles/van.webp`, w: 2, h: 4, speed: 60, ac: 14, hp: 55, labels: ["คนขับ (หน้าซ้าย)", "หน้าขวา", "กลางซ้าย", "กลางขวา", "ท้ายซ้าย", "ท้ายขวา"], seats: [[-40, -30], [40, -30], [-40, 35], [40, 35], [-40, 100], [40, 100]] },
  gang: { name: "รถเก๋งซินดิเคท", img: `modules/${MOD}/vehicles/gang.webp`, w: 2, h: 3, speed: 80, ac: 14, hp: 40, labels: ["คนขับ", "หน้าขวา", "หลังซ้าย", "หลังขวา"], seats: [[-40, -20], [40, -20], [-40, 70], [40, 70]] }
};
export const vehicleDef = (t) => VEHICLES[t.actor?.getFlag(MOD, "vehicle")];
export const vehicleRiders = (vt) => riders(vt);
export const driverToken = (vt) => { const r = riders(vt).find((q) => q.seat === 0); return r ? vt.parent.tokens.get(r.id) : null; };   // seat 0 is the driver
export const boardToken = (vt, rt, quiet = true, seat) => board(vt, rt, quiet, seat);
const gm = () => game.users.activeGM?.isSelf === true;
const isVehicle = (t) => !!t.actor?.getFlag(MOD, "vehicle");

async function patchVehicles() {
  for (const a of game.actors.filter((q) => q.getFlag(MOD, "vehicle"))) {
    const def = VEHICLES[a.getFlag(MOD, "vehicle")]; if (!def) continue;
    const up = {};
    if (a.prototypeToken.lockRotation) up["prototypeToken.lockRotation"] = false;   // locked art cannot turn with the car
    if (!(a.system.attributes?.hp?.max > 0)) up["system.attributes.hp"] = { value: def.hp, max: def.hp };
    if (Object.keys(up).length) await a.update(up).catch(() => {});
  }
  for (const sc of game.scenes) {
    const ups = sc.tokens.filter((t) => isVehicle(t) && t.lockRotation).map((t) => ({ _id: t.id, lockRotation: false }));
    if (ups.length) await sc.updateEmbeddedDocuments("Token", ups, { arkaneRide: true }).catch(() => {});
  }
}
async function folderFor() {
  let f = game.folders.find((q) => q.type === "Actor" && q.name === "Arkane 1920s · ยานพาหนะ");
  if (!f) f = await Folder.create({ name: "Arkane 1920s · ยานพาหนะ", type: "Actor", color: "#4a5a6a" });
  return f;
}
export async function createVehicles() {
  const f = await folderFor(), out = {};
  for (const [key, v] of Object.entries(VEHICLES)) {
    let a = game.actors.find((q) => q.getFlag(MOD, "vehicle") === key);
    if (!a) {
      const data = { name: v.name, img: v.img, folder: f.id, ownership: { default: 1 }, flags: { [MOD]: { vehicle: key } },
        system: { attributes: { hp: { value: v.hp, max: v.hp }, ac: { flat: v.ac, calc: "flat" } } },
        prototypeToken: { name: v.name, texture: { src: v.img }, width: v.w, height: v.h, actorLink: key !== "gang", displayName: 30, disposition: 1, lockRotation: false } };
      a = await Actor.create({ ...data, type: "vehicle" }).catch(() => null) ?? await Actor.create({ ...data, type: "npc" });
    }
    out[key] = a;
  }
  return out;
}
export async function placeVehicle() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  if (!canvas?.scene) return ui.notifications.warn("เปิดฉากก่อน");
  const acts = await createVehicles();
  const D = foundry.applications.api.DialogV2;
  const key = await D.wait({ window: { title: "วางรถลงฉากนี้" }, content: `<p>วางที่กลางหน้าจอ (ลากย้ายได้) · ตัวละครอยู่ติดรถแล้วคลิกขวาที่โทเคนตัวเอง กดไอคอนรถเพื่อขึ้น/เลือกที่นั่ง/ลงรถ (หรือมาโคร 'ขึ้น/ลงรถ') มีแต่คนขับที่ขยับรถได้</p>`,
    buttons: [...Object.entries(VEHICLES).map(([k, v]) => ({ action: k, label: v.name, callback: () => k })), { action: "x", label: "ยกเลิก", callback: () => null }], rejectClose: false, modal: true }).catch(() => null);
  if (!key || key === "x") return;
  const td = (await acts[key].getTokenDocument()).toObject();
  const c = canvas.stage.pivot, v = VEHICLES[key];
  const g = canvas.scene.grid.size || G, x = Math.round((c.x - v.w * g / 2) / g) * g, y = Math.round((c.y - v.h * g / 2) / g) * g;
  await canvas.scene.createEmbeddedDocuments("Token", [{ ...td, x, y }]);
  ui.notifications.info(`วาง ${v.name} แล้ว`);
}

const riders = (vt) => (vt.getFlag(MOD, "riders") ?? []).filter((r) => vt.parent.tokens.has(r.id));
const gs = (t) => t?.parent?.grid?.size || G;   // grid size of the scene the token is in (the chase map uses 50 px squares, the other maps 100)
const half = (t) => [t.width * gs(t) / 2, t.height * gs(t) / 2];

function seatPos(vt, rt, seatIdx, rot) {
  const def = VEHICLES[vt.actor.getFlag(MOD, "vehicle")] ?? VEHICLES.car;
  const [sx0, sy0] = def.seats[seatIdx] ?? [0, 0], k = gs(vt) / G, sx = sx0 * k, sy = sy0 * k;
  const th = (rot ?? vt.rotation ?? 0) * Math.PI / 180;
  const [hw, hh] = half(vt);
  const cx = vt.x + hw + sx * Math.cos(th) - sy * Math.sin(th), cy = vt.y + hh + sx * Math.sin(th) + sy * Math.cos(th);
  const [rw, rh] = half(rt);
  return { x: Math.round(cx - rw), y: Math.round(cy - rh) };
}
export async function resyncVehicles(scene) { for (const vt of scene.tokens) if (vt.actor?.getFlag(MOD, "vehicle")) { if (riders(vt).length) await syncRiders(vt, vt.rotation ?? 0); } }
async function syncRiders(vt, rot) {
  const list = riders(vt);
  const ups = list.map((r) => ({ _id: r.id, ...seatPos(vt, vt.parent.tokens.get(r.id), r.seat, rot) }))
    .filter((u) => { const rt = vt.parent.tokens.get(u._id); return !rt || Math.abs(rt.x - u.x) > 1 || Math.abs(rt.y - u.y) > 1; });
  if (ups.length) await vt.parent.updateEmbeddedDocuments("Token", ups, { arkaneRide: true });
}
async function setDriver(vt) {
  const list = riders(vt);
  const old = vt.getFlag(MOD, "driverUsers") ?? [];
  const d0 = list.find((q) => q.seat === 0), drv = d0 ? vt.parent.tokens.get(d0.id) : null;   // only the driver's seat controls the vehicle
  const want = drv?.actor ? game.users.filter((u) => !u.isGM && drv.actor.testUserPermission(u, "OWNER")).map((u) => u.id) : [];
  const patch = {};
  for (const id of old) if (!want.includes(id)) patch[`ownership.-=${id}`] = null;
  for (const id of want) patch[`ownership.${id}`] = CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
  if (Object.keys(patch).length) await vt.actor.update(patch);
  await vt.setFlag(MOD, "driverUsers", want);
  return drv;
}
async function board(vt, rt, quiet = false, seat) {
  const def = VEHICLES[vt.actor.getFlag(MOD, "vehicle")] ?? VEHICLES.car;
  const list = riders(vt);
  const free = seat !== undefined && !list.some((r) => r.seat === seat) ? seat : def.seats.map((_, i) => i).find((i) => !list.some((r) => r.seat === i));
  if (free === undefined) return ui.notifications.warn(`${vt.name} เต็มแล้ว`);
  await rt.update({ [`flags.${MOD}.ride`]: { on: vt.id, scaleX: rt.texture.scaleX ?? 1, scaleY: rt.texture.scaleY ?? 1, sort: rt.sort ?? 0 }, "texture.scaleX": SCALE, "texture.scaleY": SCALE, lockRotation: true, rotation: 0, sort: (vt.sort ?? 0) + 100 + free, ...seatPos(vt, rt, free) }, { arkaneRide: true });
  await vt.setFlag(MOD, "riders", [...list, { id: rt.id, seat: free }]);
  const drv = await setDriver(vt);
  await syncRiders(vt);
  if (!quiet) ChatMessage.create({ content: `<div class="rw-card"><b>${foundry.utils.escapeHTML(rt.name)}</b> ขึ้น ${foundry.utils.escapeHTML(vt.name)} · นั่ง${foundry.utils.escapeHTML((def.labels ?? [])[free] ?? "")}${drv && free !== 0 ? ` · คนขับ: ${foundry.utils.escapeHTML(drv.name)}` : ""}</div>` });
}
// where a rider steps out: beside the vehicle (the side of their seat first), on a free square with no wall in between
function exitSpot(vt, rt, seat) {
  const [hw, hh] = half(vt), th = (vt.rotation ?? 0) * Math.PI / 180, [rw, rh] = half(rt), g = gs(vt);
  const def = VEHICLES[vt.actor.getFlag(MOD, "vehicle")] ?? VEHICLES.car, sx = Math.sign((def.seats[seat] ?? [-1])[0]) || -1;
  const loc = [];
  for (const side of [sx, -sx]) for (const ly of [0, -hh * 0.6, hh * 0.6]) loc.push([side * (hw + g * 0.6), ly]);
  loc.push([0, hh + g * 0.6], [0, -(hh + g * 0.6)]);
  const cx = vt.x + hw, cy = vt.y + hh, others = vt.parent.tokens.filter((q) => q.id !== rt.id && q.id !== vt.id);
  let first = null;
  for (const [lx, ly] of loc) {
    const px = cx + lx * Math.cos(th) - ly * Math.sin(th), py = cy + lx * Math.sin(th) + ly * Math.cos(th);
    const x = Math.round((px - rw) / g) * g, y = Math.round((py - rh) / g) * g;
    first ??= { x, y };
    let blocked = false;
    try { blocked = CONFIG.Canvas.polygonBackends.move.testCollision({ x: cx, y: cy }, { x: x + rw, y: y + rh }, { type: "move", mode: "any" }); } catch {}
    const taken = others.some((q) => Math.hypot(q.x + q.width * g / 2 - (x + rw), q.y + q.height * g / 2 - (y + rh)) < g * 0.7);
    if (!blocked && !taken) return { x, y };
  }
  return first;
}
async function leave(vt, rt, quiet = false) {
  const ride = rt.getFlag(MOD, "ride");
  const spot = vt && ride ? exitSpot(vt, rt, riders(vt).find((q) => q.id === rt.id)?.seat ?? 0) : null;
  if (ride) await rt.update({ lockRotation: false, "texture.scaleX": ride.scaleX, "texture.scaleY": ride.scaleY, sort: ride.sort, ...(spot ?? {}), [`flags.${MOD}.-=ride`]: null }, { arkaneRide: true }).catch(() => {});
  if (vt) {
    await vt.setFlag(MOD, "riders", riders(vt).filter((r) => r.id !== rt.id));
    await setDriver(vt);
    if (!quiet) ChatMessage.create({ content: `<div class="rw-card"><b>${foundry.utils.escapeHTML(rt.name)}</b> ลงจาก ${foundry.utils.escapeHTML(vt.name)}</div>` });
  }
}
export async function unloadAll() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  for (const vt of canvas.scene.tokens.filter(isVehicle)) for (const r of riders(vt)) { const rt = canvas.scene.tokens.get(r.id); if (rt) await leave(vt, rt, true); }
  ui.notifications.info("ทุกคนลงจากรถแล้ว (ยืนข้างรถ)");
}


async function turnVehicle(t, deg) { try { const r = Math.round(deg * 10) / 10 % 360; await t.update({ rotation: r, [`flags.${MOD}.heading`]: r }); } catch (e) { console.warn(MOD, "turn", e); } }
// aim mode: the car follows the mouse pointer (any angle), left click = keep, Esc / right click = cancel
let aiming = null;
// aim mode: the car follows the mouse pointer (any angle). hold = true: middle button held (released = keep); otherwise left click = keep, Esc / right click = cancel
function aimVehicle(t, hold = false, e0 = null) {
  aiming?.(false);
  const tok = t.object, cv = canvas.app?.canvas ?? canvas.app?.view; if (!tok || !cv) return;
  const start = t.rotation ?? 0; let pending = start, last = 0;
  const angle = (e) => { const p = canvas.canvasCoordinatesFromClient({ x: e.clientX, y: e.clientY }), c = tok.center; return ((Math.round(Math.atan2(p.y - c.y, p.x - c.x) * 180 / Math.PI + 90) % 360) + 360) % 360; };
  const move = (e) => { pending = angle(e); const now = performance.now(); if (now - last > 90) { last = now; turnVehicle(t, pending); } };
  const done = (keep) => { window.removeEventListener("pointermove", move, true); cv.removeEventListener("pointerdown", click, true); window.removeEventListener("pointerup", up, true); window.removeEventListener("keydown", key, true); aiming = null; if (keep === false) turnVehicle(t, start); else if (keep) turnVehicle(t, pending); };
  const click = (e) => { e.preventDefault(); e.stopPropagation(); done(e.button === 0); };
  const up = (e) => { if (e.button === 1) done(true); };
  const key = (e) => { if (e.key === "Escape") { e.stopPropagation(); done(false); } };
  window.addEventListener("pointermove", move, true); window.addEventListener("keydown", key, true);
  if (hold) window.addEventListener("pointerup", up, true); else cv.addEventListener("pointerdown", click, true);
  aiming = done;
  if (e0) move(e0);
  if (!hold) ui.notifications.info("ขยับเมาส์เพื่อหมุนรถ · คลิกซ้ายเพื่อยืนยัน · Esc หรือคลิกขวาเพื่อยกเลิก");
}
// middle mouse button (M3) pressed on a car you own: it turns to face the pointer while the button is held
const carAt = (e) => {
  const p = canvas.canvasCoordinatesFromClient({ x: e.clientX, y: e.clientY });
  for (const tok of canvas.tokens.placeables) {
    const d = tok.document; if (!isVehicle(d) || !d.testUserPermission(game.user, "OWNER")) continue;
    const [hw, hh] = half(d), c = tok.center, th = -(d.rotation ?? 0) * Math.PI / 180, dx = p.x - c.x, dy = p.y - c.y;
    if (Math.abs(dx * Math.cos(th) - dy * Math.sin(th)) <= hw && Math.abs(dx * Math.sin(th) + dy * Math.cos(th)) <= hh) return d;
  }
  return null;
};
function registerM3() {
  const h = (e) => {
    if (e.button !== 1 || !canvas?.ready || e.target !== (canvas.app?.canvas ?? canvas.app?.view)) return;
    const t = carAt(e); if (!t) return;
    e.preventDefault(); e.stopPropagation();
    if (e.type === "pointerdown") aimVehicle(t, true, e);
  };
  window.addEventListener("pointerdown", h, true); window.addEventListener("mousedown", h, true);
}
// the selection frame and the click area of a car follow its heading (the core ones stay upright)
function registerFrame() {
  Hooks.on("refreshToken", (tok) => {
    try {
      const d = tok.document; if (!isVehicle(d)) return;
      const g = gs(d), hw = d.width * g / 2, hh = d.height * g / 2, th = (d.rotation ?? 0) * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
      const pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => [hw + x * c - y * s, hh + x * s + y * c]);
      tok.hitArea = new PIXI.Polygon(pts.flat());
      let f = tok._arkFrame; if (!f || f.destroyed) { f = tok._arkFrame = new PIXI.Graphics(); tok.addChild(f); }
      f.clear();
      if (tok.hover || tok.controlled) {
        const col = tok.controlled ? 0xff9800 : 0xffffff;
        if (typeof f.lineStyle === "function") f.lineStyle(3, col, 1);
        f.moveTo(...pts[0]); for (let i = 1; i < 4; i++) f.lineTo(...pts[i]); f.closePath();
        if (typeof f.lineStyle !== "function") f.stroke({ width: 3, color: col });
      }
      if (tok.border) tok.border.visible = false;
    } catch (e) { console.warn(MOD, "vehicle frame", e); }
  });
}
async function askAngle(t) {
  const D = foundry.applications.api.DialogV2;
  const r = await D.wait({ window: { title: `หมุน ${t.name}` }, content: `<div class="rw-form"><div class="form-group"><label>องศา (0 = หัวรถชี้ขึ้น, 90 = ขวา, 180 = ลง, 270 = ซ้าย)</label><input type="number" name="deg" value="${Math.round(t.rotation ?? 0)}" step="1" autofocus></div></div>`,
    buttons: [{ action: "ok", label: "หมุน", default: true, callback: (ev, btn) => new foundry.applications.ux.FormDataExtended(btn.form).object }, { action: "x", label: "ยกเลิก" }], rejectClose: false }).catch(() => null);
  if (r && typeof r === "object" && Number.isFinite(Number(r.deg))) await turnVehicle(t, ((Number(r.deg) % 360) + 360) % 360);
}
// the whole car body (not just its centre) must not cross a wall: test nine points of the body along the move
function bodyBlocked(t, ch) {
  try {
    if (game.user.isGM && game.keyboard?.isModifierActive?.("Control")) return false;
    const g = gs(t), [hw, hh] = half(t), nx = ch.x ?? t.x, ny = ch.y ?? t.y;
    const deg = "rotation" in ch ? ch.rotation : (t.rotation ?? 0);
    const th = deg * Math.PI / 180, c = Math.cos(th), s = Math.sin(th);
    for (const [fx, fy] of [[0, 0], [-0.7, -0.85], [0.7, -0.85], [-0.7, 0.85], [0.7, 0.85], [0, -0.9], [0, 0.9], [-0.85, 0], [0.85, 0]]) {
      const ox = fx * hw, oy = fy * hh, rx = ox * c - oy * s, ry = ox * s + oy * c;
      if (CONFIG.Canvas.polygonBackends.move.testCollision({ x: t.x + hw + rx, y: t.y + hh + ry }, { x: nx + hw + rx, y: ny + hh + ry }, { type: "move", mode: "any" })) return true;
    }
  } catch (e) { console.warn(MOD, "bodyBlocked", e); }
  return false;
}
// self-healing: the active GM re-seats every rider that has drifted off its seat, and unlocks the art of every vehicle, about once a second (idempotent)
let reconciling = false;
async function reconcile() {
  if (reconciling || !gm()) return;
  reconciling = true;
  try {
    for (const sc of game.scenes) for (const vt of sc.tokens) {
      if (!isVehicle(vt)) {   // people never show tilted artwork (with the grid off the core turns tokens towards where they walk)
        if (["character", "npc"].includes(vt.actor?.type) && !vt.lockRotation) await vt.update({ lockRotation: true }, { arkaneRide: true }).catch(() => {});
        continue;
      }
      const patch = {};
      if (vt.lockRotation) patch.lockRotation = false;
      const hd = vt.getFlag(MOD, "heading");
      if (hd === undefined) patch[`flags.${MOD}.heading`] = vt.rotation ?? 0; else if ((vt.rotation ?? 0) !== hd) patch.rotation = hd;   // undo any turn the core made on its own
      if (Object.keys(patch).length) await vt.update(patch, { arkaneRide: true }).catch(() => {});
      if (riders(vt).length) await syncRiders(vt, vt.rotation ?? 0);
    }
  } catch (e) { console.warn(MOD, "reconcile", e); }
  reconciling = false;
}
export function registerVehicles() {
  setInterval(reconcile, 1200);
  registerM3(); registerFrame();
  if (game.user.isGM) patchVehicles().catch((e) => console.warn(MOD, "patchVehicles", e));
  // The art faces up. Foundry's own auto-rotation assumes art faces down, which fought with this and made cars flip/drive backwards, so rotation
  // is locked for vehicles and set here: the heading is computed from the drag itself and sent in the very same update.
  Hooks.on("preUpdateToken", (t, ch, opt, userId) => {
    if (opt?.arkaneRide) return;
    const moves = "x" in ch || "y" in ch;
    if (moves && !game.users.get(userId)?.isGM) {
      if (t.getFlag(MOD, "ride")) { ui.notifications.warn("ตัวละครที่อยู่บนรถขยับเองไม่ได้ · กดไอคอนรถที่โทเคน (หรือมาโคร 'ขึ้น/ลงรถ') เพื่อเปลี่ยนที่นั่งหรือลงรถ"); return false; }
      if (isVehicle(t) && !(t.getFlag(MOD, "driverUsers") ?? []).includes(userId)) { ui.notifications.warn("เฉพาะคนขับเท่านั้นที่ขับรถได้"); return false; }
    }
    if (!isVehicle(t)) return;
    const hd = t.getFlag(MOD, "heading") ?? t.rotation ?? 0;
    let deg = hd, turned = false;
    if (moves) { const dx = (ch.x ?? t.x) - t.x, dy = (ch.y ?? t.y) - t.y; if (Math.hypot(dx, dy) >= gs(t) * 0.75) { deg = (Math.round(Math.atan2(dy, dx) * 180 / Math.PI + 90) % 360 + 360) % 360; turned = true; } }   // nose always points the way it is driven (no reversing)
    if (moves && bodyBlocked(t, { ...ch, rotation: deg })) { ui.notifications.warn("รถชนกำแพง/อาคาร ขับผ่านไม่ได้ (GM กด Ctrl ค้างตอนลากเพื่อข้าม)"); return false; }
    // turn on the spot first, then drive: otherwise the car slides with the old nose and only swings round at the end (looks like reversing)
    if (moves && turned && !opt?.arkaneTurn) {
      const diff = Math.abs(((deg - hd + 540) % 360) - 180);
      if (diff > 8) {
        const nx = ch.x ?? t.x, ny = ch.y ?? t.y;
        t.update({ rotation: deg, [`flags.${MOD}.heading`]: deg }, { arkaneTurn: true })
          .then(() => new Promise((r) => setTimeout(r, Math.min(600, 120 + diff * 2.5))))
          .then(() => t.update({ x: nx, y: ny }, { arkaneTurn: true }))
          .catch((e) => console.warn(MOD, "turn-then-drive", e));
        return false;
      }
    }
    if (moves) { ch.rotation = deg; if (turned) { ch.flags = ch.flags ?? {}; ch.flags[MOD] = { ...(ch.flags[MOD] ?? {}), heading: deg }; } }   // our heading always wins over the core auto-rotate (it assumes art that faces down)
    else if ("rotation" in ch) { ch.flags = ch.flags ?? {}; ch.flags[MOD] = { ...(ch.flags[MOD] ?? {}), heading: ch.rotation }; }   // turned by hand: remember it
  });
  game.socket.on(`module.${MOD}`, (d) => {
    if (!gm()) return;
    if (d?.t === "ram") applyRam(d).catch((e) => console.warn(MOD, "ram", e));
    else if (d?.t === "ride") handleRide(d).catch((e) => console.warn(MOD, "ride", e));
  });
  // token HUD: a car icon on your own token when it is next to a vehicle (board / change seat / get out)
  Hooks.on("renderTokenHUD", (hud, html) => {
    try {
      const t = hud.object?.document;
      if (game.user.isGM && t?.actor?.getFlag(MOD, "npc") === "innkeeper") {   // Sarge: change outfit (owner / cook / waiter)
        const el = html instanceof HTMLElement ? html : html[0], col = el?.querySelector(".col.right"); if (!col) return;
        const b = document.createElement("button"); b.type = "button"; b.className = "control-icon arkane-keep"; b.dataset.tooltip = "เปลี่ยนชุดซาร์จ (เจ้าของ / เชฟ / เสิร์ฟ / ชุดนอน)"; b.innerHTML = `<i class="fa-solid fa-shirt"></i>`;
        b.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); hud.close?.(); game.arkane?.sarge?.(); });
        col.append(b); return;
      }
      if (t?.actor && isVehicle(t)) {   // vehicle: turn by hand, any angle
        const el = html instanceof HTMLElement ? html : html[0], col = el?.querySelector(".col.right"); if (!col) return;
        for (const [icon, tip, fn] of [["fa-rotate-left", "หมุนซ้าย 15° (Shift = 45°)", (e) => -(e.shiftKey ? 45 : 15)], ["fa-rotate-right", "หมุนขวา 15° (Shift = 45°)", (e) => (e.shiftKey ? 45 : 15)], ["fa-compass", "ตั้งองศา (0 = หัวรถชี้ขึ้น)", null], ["fa-computer-mouse", "หมุนตามเมาส์ (คลิกซ้ายยืนยัน)", "aim"]]) {
          const b = document.createElement("button"); b.type = "button"; b.className = "control-icon arkane-keep"; b.dataset.tooltip = tip; b.innerHTML = `<i class="fa-solid ${icon}"></i>`;
          b.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); fn === "aim" ? (hud.close?.(), aimVehicle(t)) : fn ? turnVehicle(t, ((t.rotation ?? 0) + fn(ev) + 360) % 360) : askAngle(t); });
          col.append(b);
        }
        return;
      }
      if (!t?.actor) return;
      const ride = t.getFlag(MOD, "ride");
      if (!ride && !nearVehicle(t)) return;
      const el = html instanceof HTMLElement ? html : html[0];
      const col = el?.querySelector(".col.right"); if (!col) return;
      const b = document.createElement("button");
      b.type = "button"; b.className = "control-icon arkane-keep"; b.dataset.tooltip = ride ? "ที่นั่ง / ลงรถ" : "ขึ้นรถ";
      b.innerHTML = '<i class="fa-solid fa-car-side"></i>';
      b.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); hud.close?.(); ridePrompt(t); });
      col.append(b);
    } catch (e) { console.warn(MOD, "vehicle HUD", e); }
  });
  Hooks.on("deleteToken", async (t) => {
    if (!gm()) return;
    if (isVehicle(t)) { for (const r of t.getFlag(MOD, "riders") ?? []) { const rt = t.parent.tokens.get(r.id); if (rt) await leave(null, rt, true); } }
    else if (t.getFlag(MOD, "ride")) { const vt = t.parent.tokens.get(t.getFlag(MOD, "ride").on); if (vt) { await vt.setFlag(MOD, "riders", riders(vt).filter((r) => r.id !== t.id)); await setDriver(vt); } }
  });
  Hooks.on("updateToken", async (t, ch, opt) => {
    if (!gm() || opt?.arkaneRide) return;
    if (!("x" in ch || "y" in ch || "rotation" in ch)) return;
    try {
      if (isVehicle(t)) {
        await syncRiders(t, 0);
        console.log(MOD, "vehicle moved", t.name, { x: t.x, y: t.y, grid: gs(t), riders: riders(t).length });
        return;
      }
      if (!("x" in ch || "y" in ch)) return;
      const ride = t.getFlag(MOD, "ride");
      if (ride) {   // a rider nudged by the GM: back into the seat
        const vt = t.parent.tokens.get(ride.on), r = vt && riders(vt).find((q) => q.id === t.id);
        if (r) await t.update(seatPos(vt, t, r.seat), { arkaneRide: true });
      }
    } catch (e) { console.warn(MOD, "vehicle", e); }
  });
}

// ---------------- ramming: the driver slams the vehicle into a target (creature or vehicle): attack roll, damage, shove back, recoil
const SOCK = `module.${MOD}`;
const rectGap = (a, b) => {   // gap between two token rectangles, in pixels
  const ga = gs(a), gb = gs(b), ax0 = a.x, ax1 = a.x + a.width * ga, ay0 = a.y, ay1 = a.y + a.height * ga, bx0 = b.x, bx1 = b.x + b.width * gb, by0 = b.y, by1 = b.y + b.height * gb;
  return Math.hypot(Math.max(0, bx0 - ax1, ax0 - bx1), Math.max(0, by0 - ay1, ay0 - by1));
};
async function dmg(actor, n) { try { if (actor?.applyDamage) await actor.applyDamage(n); else await actor?.update({ "system.attributes.hp.value": Math.max(0, (actor.system.attributes.hp.value ?? 0) - n) }); } catch (e) { console.warn(MOD, "ram damage", e); } }
async function applyRam({ scene, vt: vtId, tt: ttId, hit, damage, recoil, user }) {
  const sc = game.scenes.get(scene), vt = sc?.tokens.get(vtId), tt = sc?.tokens.get(ttId);
  if (!vt || !tt) return;
  const u = game.users.get(user);
  if (!u?.isGM && !vt.actor?.testUserPermission(u, "OWNER")) return;   // only someone who controls the vehicle may ram with it
  if (recoil) await dmg(vt.actor, recoil);
  if (!hit) return;
  await dmg(tt.actor, damage);
  // shove: 2 squares away from the ram (1 square for a vehicle), stopping at walls
  const g = gs(vt), c = (t) => ({ x: t.x + t.width * g / 2, y: t.y + t.height * g / 2 });
  const a = c(vt), b = c(tt), len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  const ux = (b.x - a.x) / len, uy = (b.y - a.y) / len, steps = isVehicle(tt) ? 1 : 2;
  let nx = tt.x, ny = tt.y;
  for (let i = 1; i <= steps; i++) {
    const tx = Math.round((tt.x + ux * g * i) / (g / 2)) * (g / 2), ty = Math.round((tt.y + uy * g * i) / (g / 2)) * (g / 2);
    let blocked = false;
    try { blocked = CONFIG.Canvas.polygonBackends.move.testCollision({ x: nx + tt.width * g / 2, y: ny + tt.height * g / 2 }, { x: tx + tt.width * g / 2, y: ty + tt.height * g / 2 }, { type: "move", mode: "any" }); } catch { blocked = false; }
    if (blocked) break;
    nx = tx; ny = ty;
  }
  if (nx !== tt.x || ny !== tt.y) { await tt.update({ x: nx, y: ny }, { arkaneRide: true }); if (isVehicle(tt)) await syncRiders(tt, tt.rotation ?? 0); }
  if (!isVehicle(tt)) { try { await tt.actor?.toggleStatusEffect?.("prone", { active: true }); } catch {} }
}
export async function ram() {
  let vt = canvas.tokens.controlled[0]?.document;
  if (!vt) return ui.notifications.warn("เลือกรถหรือคนขับก่อน");
  const ride = vt.getFlag(MOD, "ride");
  if (ride) vt = vt.parent.tokens.get(ride.on);
  if (!vt || !isVehicle(vt)) return ui.notifications.warn("ต้องเลือกรถ หรือตัวละครที่ขับรถอยู่");
  const drv = driverToken(vt);
  if (!drv?.actor) return ui.notifications.warn("รถคันนี้ไม่มีคนขับ");
  const sel = canvas.tokens.controlled[0]?.document;
  if (ride && sel?.id !== drv.id && !game.user.isGM) return ui.notifications.warn("เฉพาะคนขับพุ่งชนได้");
  const tt = [...game.user.targets][0]?.document;
  if (!tt || tt.id === vt.id) return ui.notifications.warn("เล็งเป้า (กด T ที่เป้า) ก่อนกดพุ่งชน");
  if (rectGap(vt, tt) > gs(vt) * 2.01) return ui.notifications.warn("เป้าไกลเกินไป: ต้องอยู่ติดรถ (ห่างไม่เกิน 2 ช่อง)");
  const a = drv.actor, dex = a.system.abilities?.dex?.mod ?? 0, prof = a.system.attributes?.prof ?? 2;
  const tdef = vehicleDef(tt), ac = Number(tt.actor?.system.attributes?.ac?.value) || tdef?.ac || 10;
  const roll = await new Roll("1d20 + @d + @p", { d: dex, p: prof }).evaluate();
  const hit = roll.total >= ac || roll.dice[0].total === 20, miss1 = roll.dice[0].total === 1;
  const dRoll = hit ? await new Roll(isVehicle(tt) ? "3d6" : "2d6").evaluate() : null;
  const recoil = hit ? (isVehicle(tt) ? Math.floor(dRoll.total / 2) : Math.ceil(dRoll.total / 3)) : (miss1 ? 5 : 0);
  await roll.toMessage({ speaker: ChatMessage.getSpeaker({ token: drv }), flavor: `<b>${foundry.utils.escapeHTML(vt.name)}</b> พุ่งชน <b>${foundry.utils.escapeHTML(tt.name)}</b> (AC ${ac}) ${hit ? `· <b>โดน</b> ดาเมจ ${dRoll.total} + ผลักถอย` : "· พลาด"}${recoil ? ` · รถกระแทกกลับเสียหาย ${recoil}` : ""}` });
  const d = { t: "ram", scene: vt.parent.id, vt: vt.id, tt: tt.id, hit, damage: dRoll?.total ?? 0, recoil, user: game.user.id };
  if (gm()) applyRam(d); else if (game.users.activeGM) game.socket.emit(SOCK, d); else ui.notifications.warn("ไม่มี GM ออนไลน์ ระบบไม่ลดเลือดและไม่ผลักให้");
}

// ---------------- boarding UI + requests (players ask, the GM client does it)
function nearVehicle(rt) {
  let best = null;
  for (const vt of rt.parent.tokens.filter(isVehicle)) { const g = rectGap(vt, rt); if (g <= gs(vt) * 2.01 && (!best || g < best.g)) best = { vt, g }; }
  return best?.vt ?? null;
}
const request = (d) => { const msg = { t: "ride", scene: d.vt.parent.id, vt: d.vt.id, rt: d.rt.id, op: d.op, seat: d.seat, user: game.user.id }; if (gm()) return handleRide(msg); if (!game.users.activeGM) return ui.notifications.warn("ไม่มี GM ออนไลน์ ขึ้น/ลงรถไม่ได้"); game.socket.emit(SOCK, msg); };
export async function ridePrompt(rt) {
  rt ??= canvas.tokens.controlled[0]?.document;
  if (!rt?.actor) return ui.notifications.warn("เลือกโทเคนตัวเองก่อน");
  if (isVehicle(rt)) return ui.notifications.warn("เลือกโทเคนตัวละคร ไม่ใช่โทเคนรถ");
  const ride = rt.getFlag(MOD, "ride");
  const vt = ride ? rt.parent.tokens.get(ride.on) : nearVehicle(rt);
  if (!vt) return ui.notifications.warn(ride ? "ไม่พบรถของตัวละครนี้" : "ไม่มีรถอยู่ใกล้ (ต้องยืนติดรถ ห่างไม่เกิน 2 ช่อง)");
  const def = VEHICLES[vt.actor.getFlag(MOD, "vehicle")] ?? VEHICLES.car, list = riders(vt);
  const row = (i) => {
    const occ = list.find((r) => r.seat === i), mine = occ?.id === rt.id;
    const who = occ ? ` — ${foundry.utils.escapeHTML(rt.parent.tokens.get(occ.id)?.name ?? "")}${mine ? " (ที่นั่งปัจจุบัน)" : ""}` : "";
    return `<label style="display:flex;gap:8px;align-items:center;margin:4px 0;${occ ? "opacity:.5" : ""}"><input type="radio" name="seat" value="${i}" ${occ ? "disabled" : ""} ${!occ && i === def.seats.findIndex((_, k) => !list.some((r) => r.seat === k)) ? "checked" : ""}> ${foundry.utils.escapeHTML(def.labels?.[i] ?? `ที่นั่ง ${i + 1}`)}${who}</label>`;
  };
  const D2 = foundry.applications.api.DialogV2;
  const pick = await D2.wait({ window: { title: `${ride ? "ที่นั่ง / ลงรถ" : "ขึ้นรถ"}: ${vt.name}` },
    content: `<div class="rw-form"><p class="rw-hint" style="margin:0 0 4px">${ride ? "เลือกที่นั่งใหม่ หรือกด 'ลงรถ'" : "เลือกที่นั่ง"} · มีแต่คนขับที่ขับรถได้ ที่นั่งอื่นยิงปืนและร่ายเวทได้ตามปกติ</p>${def.seats.map((_, i) => row(i)).join("")}</div>`,
    buttons: [{ action: "ok", label: ride ? "ย้ายที่นั่ง" : "ขึ้นรถ", default: true, callback: (ev, btn) => { const v = new FormDataExtended(btn.form).object.seat; return v === undefined || v === null ? null : { op: ride ? "seat" : "board", seat: Number(v) }; } },
      ...(ride ? [{ action: "leave", label: "ลงรถ", callback: () => ({ op: "leave" }) }] : []), { action: "x", label: "ยกเลิก", callback: () => null }], rejectClose: false }).catch(() => null);
  if (!pick || typeof pick !== "object") return;
  request({ vt, rt, op: pick.op, seat: pick.seat });
}
async function handleRide(d) {
  const sc = game.scenes.get(d.scene), vt = sc?.tokens.get(d.vt), rt = sc?.tokens.get(d.rt), u = game.users.get(d.user);
  if (!vt || !rt || !u || !isVehicle(vt) || (!u.isGM && !rt.actor?.testUserPermission(u, "OWNER"))) return;
  const list = riders(vt), ride = rt.getFlag(MOD, "ride");
  if (d.op === "board") {
    if (ride || (!u.isGM && rectGap(vt, rt) > gs(vt) * 2.01) || list.some((r) => r.seat === d.seat)) return ui.notifications.warn("ขึ้นรถไม่ได้ (ที่นั่งไม่ว่างหรืออยู่ไกลเกินไป)");
    await board(vt, rt, false, d.seat);
  } else if (d.op === "seat") {
    if (!ride || ride.on !== vt.id || list.some((r) => r.seat === d.seat)) return;
    await vt.setFlag(MOD, "riders", list.map((r) => (r.id === rt.id ? { ...r, seat: d.seat } : r)));
    await rt.update({ sort: (vt.sort ?? 0) + 100 + d.seat }, { arkaneRide: true });
    await setDriver(vt); await syncRiders(vt);
    const def = VEHICLES[vt.actor.getFlag(MOD, "vehicle")] ?? VEHICLES.car;
    ChatMessage.create({ content: `<div class="rw-card"><b>${foundry.utils.escapeHTML(rt.name)}</b> ย้ายไปนั่ง${foundry.utils.escapeHTML(def.labels?.[d.seat] ?? "")}</div>` });
  } else if (d.op === "leave") {
    if (ride?.on === vt.id) await leave(vt, rt, false);
  }
}
