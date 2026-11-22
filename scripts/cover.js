// Automatic cover (D&D 2024): checked when an attack is rolled against a targeted token (key T).
//  - walls that block sight (open doors and windows don't)            → lines blocked from the attacker's best corner
//      1–2 of 4 lines = half cover (−2) · 3 = three-quarters (−5) · 4 = total cover (can't be targeted)
//  - other creatures in the way                                         → half cover
//  - Regions named "ที่กำบัง ..." (tables, crates)                        → half cover
//    Regions named "ที่กำบัง 3/4 ..." (bar counter, thick crates)        → three-quarters cover
// The penalty is added to the attack roll (same as raising the target's AC).
const MOD = "arkane-1920s";
const G = 100;
const NAMES = { 2: "ที่กำบังครึ่งตัว", 5: "ที่กำบังสามในสี่", 99: "ที่กำบังมิดตัว" };

function wallBlocks(a, b) {
  try {
    const backend = CONFIG.Canvas.polygonBackends?.sight ?? foundry.canvas?.geometry?.ClockwiseSweepPolygon;
    if (backend?.testCollision) return !!backend.testCollision(a, b, { type: "sight", mode: "any" });
  } catch (e) { /* fall through */ }
  try { return !!canvas.walls.checkCollision(new Ray(a, b), { type: "sight", mode: "any" }); } catch { return false; }
}
// segment a→b crosses rectangle r (Liang–Barsky)
function segHitsRect(a, b, r) {
  let t0 = 0, t1 = 1;
  const dx = b.x - a.x, dy = b.y - a.y;
  const p = [-dx, dx, -dy, dy], q = [a.x - r.x, r.x + r.w - a.x, a.y - r.y, r.y + r.h - a.y];
  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) { if (q[i] < 0) return false; continue; }
    const t = q[i] / p[i];
    if (p[i] < 0) { if (t > t1) return false; if (t > t0) t0 = t; } else { if (t < t0) return false; if (t < t1) t1 = t; }
  }
  return t1 - t0 > 0.02;
}
const inRect = (pt, r) => pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h;
function tokenRect(t, inset = 0) {
  const s = canvas.grid.size, w = (t.document.width ?? 1) * s, h = (t.document.height ?? 1) * s;
  return { x: t.document.x + inset, y: t.document.y + inset, w: w - 2 * inset, h: h - 2 * inset };
}
const corners = (r) => [{ x: r.x, y: r.y }, { x: r.x + r.w, y: r.y }, { x: r.x, y: r.y + r.h }, { x: r.x + r.w, y: r.y + r.h }];
function coverRegions() {
  const out = [];
  for (const reg of canvas.scene?.regions ?? []) {
    const name = reg.name ?? "";
    if (!name.startsWith("ที่กำบัง")) continue;
    const val = /3\/4|สามในสี่/.test(name) ? 5 : 2;
    for (const sh of reg.shapes ?? []) {
      const x = sh.x ?? Math.min(...(sh.points ?? [0]).filter((_, i) => i % 2 === 0));
      const y = sh.y ?? Math.min(...(sh.points ?? [0, 0]).filter((_, i) => i % 2 === 1));
      const w = sh.width ?? (sh.radiusX ? sh.radiusX * 2 : 0), h = sh.height ?? (sh.radiusY ? sh.radiusY * 2 : 0);
      if (sh.radiusX) out.push({ x: sh.x - sh.radiusX, y: sh.y - sh.radiusY, w, h, val, name });
      else if (w && h) out.push({ x, y, w, h, val, name });
    }
  }
  return out;
}

export function computeCover(src, tgt) {
  const A = tokenRect(src, 2), T = tokenRect(tgt, 4);
  const tc = corners(T);
  // walls: best attacker corner = fewest blocked lines
  let best = 4;
  for (const a of corners(A)) {
    let blocked = 0;
    for (const t of tc) if (wallBlocks(a, t)) blocked++;
    best = Math.min(best, blocked);
    if (best === 0) break;
  }
  let val = best >= 4 ? 99 : best === 3 ? 5 : best >= 1 ? 2 : 0;
  let why = val ? "กำแพง" : "";
  // objects & creatures on the line between centres (both edges of the target too)
  const ac = src.center, lines = [tgt.center, ...tc];
  for (const r of coverRegions()) {
    if (inRect(ac, r) || inRect(tgt.center, r)) continue; // standing in/behind it yourself
    const hits = lines.filter((p) => segHitsRect(ac, p, r)).length;
    if (hits >= 3 && r.val > val) { val = r.val; why = r.name.replace(/^ที่กำบัง\s*(3\/4)?\s*:?\s*/, "") || "สิ่งของ"; }
  }
  if (val < 2) {
    for (const t of canvas.tokens.placeables) {
      if (t === src || t === tgt || t.document.hidden) continue;
      if ((t.actor?.system?.attributes?.hp?.value ?? 1) <= 0) continue;
      const r = tokenRect(t, 6);
      if (segHitsRect(ac, tgt.center, r)) { val = 2; why = t.name; break; }
    }
  }
  return { val, label: val ? NAMES[val] : "", why };
}

function attackerToken(item) {
  return canvas.tokens.controlled.find((t) => t.actor === item?.actor) || item?.actor?.getActiveTokens?.()[0] || canvas.tokens.controlled[0];
}
function float(token, text, color) {
  try {
    canvas.interface.createScrollingText(token.center, text, { anchor: CONST.TEXT_ANCHOR_POINTS.TOP, direction: CONST.TEXT_ANCHOR_POINTS.TOP,
      distance: token.h, duration: 2400, fontSize: 30, fill: color, stroke: 0x000000, strokeThickness: 5, jitter: 0 });
    game.socket.emit(`module.${MOD}`, { t: "text", scene: canvas.scene?.id, token: token.id, text, kind: color === "#FF4B4B" ? "bad" : "warn" });
  } catch {}
}

function coverHook(config) {
  try {
    if (!game.settings.get(MOD, "autoCover")) return;
    const act = config?.subject ?? config?.activity;
    const item = act?.item;
    if (!item) return;
    const tgt = [...game.user.targets][0], src = attackerToken(item);
    if (!tgt || !src || tgt === src) return;
    const c = computeCover(src, tgt);
    if (!c.val) return;
    if (c.val === 99) {
      float(tgt, "หลบมิดที่กำบัง!", "#FF4B4B");
      ui.notifications.warn(`${tgt.name} หลบอยู่หลัง${c.why}มิดตัว มองไม่เห็นช่องยิง ขยับไปหามุมอื่นก่อน`);
      return false;
    }
    for (const r of config.rolls ?? []) { r.parts ??= []; r.parts.push(String(-c.val)); }
    float(tgt, `${c.label} (−${c.val})`, "#9FD3FF");
    ui.notifications.info(`${tgt.name} มี${c.label} (${c.why}) · ทอยโจมตี −${c.val}`);
  } catch (e) { console.warn(MOD, "cover", e); }
}
export function registerCover() {
  // registered after the range/disadvantage hook, so "out of range" still wins
  Hooks.once("ready", () => { for (const h of ["dnd5e.preRollAttack", "dnd5e.preRollAttackV2"]) Hooks.on(h, coverHook); });
}

// ---------- cover objects in the bar scenes (tables = half, counter = three-quarters)
const BAR = [
  ["ที่กำบัง 3/4: เคาน์เตอร์บาร์", 22, 4.5, 0.8, 6],
  ["ที่กำบัง: โต๊ะเล่นไพ่", 23.75, 10.25, 1, 1], ["ที่กำบัง: โต๊ะกลาง", 24.25, 5.75, 1, 1], ["ที่กำบัง: โต๊ะฮาร์วีย์", 26.25, 7.75, 1, 1],
  ["ที่กำบัง: โต๊ะหน้าเวที", 27.75, 6.25, 1, 1], ["ที่กำบัง: โต๊ะอาเธอร์", 31.75, 7.75, 1, 1], ["ที่กำบัง: โต๊ะข้างอาเธอร์", 29.75, 8.25, 1, 1],
  ["ที่กำบัง: โต๊ะคนแปลกหน้า", 28.75, 10.25, 1, 1], ["ที่กำบัง: ซุ้มนั่ง", 23, 3, 3, 1]
];
const SCENES = [["Chapter 1: บาร์ The Rusty Wand (2 ชั้น)", 0], ["Chapter 1: บาร์ The Rusty Wand ชั้นใต้ดิน", -19]];
export async function addBarCover(quiet = true) {
  if (!game.user.isGM) return 0;
  let made = 0;
  for (const [sceneName, dx] of SCENES) {
    const sc = game.scenes.getName(sceneName);
    if (!sc) continue;
    const add = BAR.filter(([n]) => !sc.regions.getName(n)).map(([name, x, y, w, h]) => ({
      name, color: name.includes("3/4") ? "#2f6f9f" : "#5f9fcf",
      shapes: [{ type: "rectangle", x: (x + dx) * G, y: y * G, width: w * G, height: h * G, rotation: 0, hole: false }]
    }));
    if (!add.length) continue;
    try { await sc.createEmbeddedDocuments("Region", add); made += add.length; } catch (e) { console.warn(MOD, "cover regions", sceneName, e); }
  }
  if (!quiet || made) ui.notifications.info(`เพิ่มที่กำบังในฉากบาร์ ${made} จุด (โต๊ะ = ครึ่งตัว, เคาน์เตอร์ = สามในสี่)`);
  return made;
}
