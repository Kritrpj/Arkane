// Status looks on tokens: players cannot read the tiny corner icons from the top-down view, so the token itself changes.
//   หลับ/หมดสติ  -> token turned on its side (90°), darkened blue, floating "Z z z"
//   ล้ม (Prone)   -> token turned on its side (90°) with a ground shadow
//   ตาย           -> grey + big red X
//   สตัน/ตัวชา    -> yellow tint + double gold ring        ถูกจับ/ติดกับ -> brown dashed ring
//   กลัว          -> violet tint + violet ring             พิษ -> green tint + green ring
//   ซ่อนตัว       -> half transparent + white dashed ring
// Only the picture on screen changes (never the actor or token data). Each player can switch it off: setting "statusFx".
const MOD = "arkane-1920s";
const on = () => { try { return game.settings.get(MOD, "statusFx") !== false; } catch { return true; } };
const NAME = "arkaneStatusFx", SHADOW = "arkaneStatusShadow";
const v8 = () => Number(String(globalThis.PIXI?.VERSION ?? "7").split(".")[0]) >= 8;

const ID = {
  sleep: ["unconscious", "asleep", "sleeping"], dead: ["dead"], prone: ["prone"],
  stun: ["stunned", "paralyzed"], held: ["restrained", "grappled"],
  fear: ["frightened"], poison: ["poisoned"], hide: ["hiding"]
};
function states(tok) {
  const st = new Set(); const a = tok?.actor; if (!a) return st;
  const have = new Set([...(a.statuses ?? [])]);
  for (const [k, ids] of Object.entries(ID)) if (ids.some((i) => have.has(i))) st.add(k);
  return st;
}

// ---- change a property of the token picture, remembering the untouched value so it can be put back ----
function mod(tok, prop, fn) {
  const m = tok.mesh; if (!m) return;
  const rec = (tok._fx ??= {})[prop];
  const base = rec && m[prop] === rec.val ? rec.base : m[prop];   // if the core refreshed the picture since, its value is the new base
  const nv = fn ? fn(base) : null;
  if (nv == null) { if (rec && m[prop] === rec.val) m[prop] = base; delete tok._fx[prop]; return; }
  m[prop] = nv; tok._fx[prop] = { val: m[prop], base };
}
const mulTint = (a, b) => { const r = ((a >> 16) & 255) * ((b >> 16) & 255) / 255, g = ((a >> 8) & 255) * ((b >> 8) & 255) / 255, bl = (a & 255) * (b & 255) / 255; return (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(bl); };

// ---- drawing helpers (Pixi 7 and 8) ----
function line(g, pts, color, width, alpha = 1) {
  if (v8()) { g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke({ width, color, alpha }); }
  else { g.lineStyle(width, color, alpha); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); }
}
function ring(g, cx, cy, r, color, width, dashes = 0, alpha = 0.95) {
  if (!dashes) { if (v8()) g.circle(cx, cy, r).stroke({ width, color, alpha }); else { g.lineStyle(width, color, alpha); g.drawCircle(cx, cy, r); } return; }
  const step = (Math.PI * 2) / dashes;
  for (let i = 0; i < dashes; i++) {
    const a0 = i * step, a1 = a0 + step * 0.55, pts = [];
    for (let k = 0; k <= 4; k++) { const a = a0 + (a1 - a0) * k / 4; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    line(g, pts, color, width, alpha);
  }
}
function ellipse(g, cx, cy, rx, ry, color, alpha) {
  if (v8()) g.ellipse(cx, cy, rx, ry).fill({ color, alpha }); else { g.beginFill(color, alpha); g.drawEllipse(cx, cy, rx, ry); g.endFill(); }
}
function text(str, size, color, bold = true) {
  const style = { fontFamily: "Signika, sans-serif", fontSize: size, fontWeight: bold ? "bold" : "normal", fill: color, stroke: v8() ? { color: 0x000000, width: 3 } : 0x000000, strokeThickness: 3 };
  return v8() ? new PIXI.Text({ text: str, style }) : new PIXI.Text(str, style);
}

function clearOverlay(tok) {
  for (const n of [NAME, SHADOW]) { const old = tok.children?.find((x) => x.name === n); if (old) { tok.removeChild(old); old.destroy({ children: true }); } }
  tok._fxZ = null;
}

function paint(tok) {
  try {
    if (!tok?.mesh || tok.destroyed) return;
    const st = on() ? states(tok) : new Set();
    clearOverlay(tok);
    if (!st.size) { mod(tok, "angle", null); mod(tok, "tint", null); mod(tok, "alpha", null); return; }

    const w = tok.w ?? tok.document.width * canvas.grid.size, h = tok.h ?? tok.document.height * canvas.grid.size;
    const cx = w / 2, cy = h / 2, R = Math.min(w, h) / 2, c = new PIXI.Container();
    c.name = NAME; c.eventMode = "none"; c.zIndex = 40;
    const g = new PIXI.Graphics(); c.addChild(g);

    // --- the picture itself ---
    let tint = 0xffffff, alpha = 1, turn = false;
    if (st.has("dead")) { tint = mulTint(tint, 0x7a7a7a); alpha = 0.9; }
    if (st.has("sleep")) { tint = mulTint(tint, 0x6a74a8); turn = true; }
    if (st.has("prone")) turn = true;
    if (st.has("stun")) tint = mulTint(tint, 0xffe38a);
    if (st.has("fear")) tint = mulTint(tint, 0xc9b0ff);
    if (st.has("poison")) tint = mulTint(tint, 0xa4e28a);
    if (st.has("hide")) alpha *= 0.5;
    mod(tok, "tint", tint === 0xffffff ? null : (base) => mulTint(base ?? 0xffffff, tint));
    mod(tok, "alpha", alpha === 1 ? null : (base) => base * alpha);
    mod(tok, "angle", turn ? (base) => base + 90 : null);

    // --- rings and marks on top ---
    if (st.has("stun")) { ring(g, cx, cy, R - 2, 0xf2c230, 4); ring(g, cx, cy, R - 8, 0xf2c230, 2, 0, 0.8); }
    if (st.has("held")) ring(g, cx, cy, R - 2, 0xb0763a, 5, 14);
    if (st.has("fear")) ring(g, cx, cy, R - 2, 0x9b5cff, 3);
    if (st.has("poison")) ring(g, cx, cy, R - 2, 0x58c840, 3);
    if (st.has("hide")) ring(g, cx, cy, R - 2, 0xffffff, 3, 16, 0.85);
    if (st.has("sleep")) ring(g, cx, cy, R - 2, 0x4a5ec8, 3);
    if (st.has("dead")) { const d = R * 0.6; line(g, [[cx - d, cy - d], [cx + d, cy + d]], 0xb81414, Math.max(5, R * 0.18)); line(g, [[cx + d, cy - d], [cx - d, cy + d]], 0xb81414, Math.max(5, R * 0.18)); }
    if (st.has("sleep") && !st.has("dead")) {
      tok._fxZ = [];
      [[0.62, -0.62, 0.7], [0.9, -0.95, 0.95], [1.1, -1.35, 1.25]].forEach(([dx, dy, sc], i) => {
        const t = text(i === 0 ? "z" : i === 1 ? "Z" : "Z", Math.max(12, R * 0.55 * sc), 0xd6e0ff); t.anchor.set(0.5);
        t.position.set(cx + dx * R, cy + dy * R * 0.8); t._bx = t.position.x; t._by = t.position.y; t._ph = i * 0.9;
        c.addChild(t); tok._fxZ.push(t);
      });
    }
    tok.addChild(c);

    // ground shadow for anyone lying down (under the picture)
    if (turn) {
      const s = new PIXI.Container(); s.name = SHADOW; s.eventMode = "none";
      const sg = new PIXI.Graphics(); ellipse(sg, cx + R * 0.12, cy + R * 0.18, R * 0.95, R * 0.8, 0x000000, 0.35); s.addChild(sg);
      tok.addChildAt(s, 0);
    }
  } catch (e) { console.warn(MOD, "statusfx", e); }
}
const paintAll = () => { for (const t of canvas?.tokens?.placeables ?? []) paint(t); };

let tickOn = false;
function startTicker() {
  if (tickOn || !canvas?.app?.ticker) return; tickOn = true;
  canvas.app.ticker.add(() => {
    const now = performance.now() / 1000;
    for (const t of canvas?.tokens?.placeables ?? []) {
      if (!t._fxZ) continue;
      for (const z of t._fxZ) { if (z.destroyed) continue; z.position.y = z._by - ((now * 0.6 + z._ph) % 1.2) * 10; z.alpha = 0.55 + 0.45 * Math.abs(Math.sin(now * 1.4 + z._ph)); }
    }
  });
}

export function registerStatusFx() {
  game.arkane ??= {};
  game.arkane.statusFx = paintAll;
  Hooks.on("refreshToken", (tok) => paint(tok));
  Hooks.on("canvasReady", () => { startTicker(); setTimeout(paintAll, 300); });
  const again = (eff) => { try { const a = eff?.parent; if (a?.getActiveTokens) for (const t of a.getActiveTokens()) paint(t); } catch {} };
  Hooks.on("createActiveEffect", again); Hooks.on("deleteActiveEffect", again); Hooks.on("updateActiveEffect", again);
  Hooks.on("updateActor", (a) => { try { for (const t of a.getActiveTokens?.() ?? []) paint(t); } catch {} });
  startTicker(); paintAll();
}
