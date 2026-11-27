/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  MOD
} from "./chunk-VELQ4LWX.js";
import {
  SPELLS,
  casterKeyOf
} from "./chunk-FIVJTHGI.js";

// src/foundry/castIcon.ts
var DURATION_MS = 1800;
var KEY = `${MOD}.castIcon`;
var castIconEnabled = () => {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
};
var setCastIconEnabled = (on) => {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
  }
  return on;
};
function iconFrame(t) {
  const c = Math.min(1, Math.max(0, t));
  const alpha = c < 0.15 ? c / 0.15 : c < 0.6 ? 1 : 1 - (c - 0.6) / 0.4;
  const rise = 1 - Math.pow(1 - c, 3);
  const scale = c < 0.2 ? 0.6 + 0.4 * (c / 0.2) : 1;
  return { alpha, rise, scale };
}
var listeners = [];
var onCast = (fn) => {
  listeners.push(fn);
};
async function showCastIcon(token, img) {
  if (!token || !img || !canvas?.interface || !canvas.app) return;
  if (token.visible === false) return;
  const load = foundry.canvas?.loadTexture ?? globalThis.loadTexture;
  const tex = await load(img).catch(() => null);
  if (!tex || !canvas?.interface) return;
  const grid = canvas.grid?.size ?? 100;
  const size = Math.min(grid * 1.4, Math.max(grid * 0.7, (token.w ?? grid) * 0.45));
  const box = new PIXI.Container();
  box.eventMode = "none";
  box.zIndex = 1e3;
  const bg = new PIXI.Graphics().beginFill(1118481, 0.85).drawCircle(0, 0, size / 2 + 3).endFill();
  const sprite = new PIXI.Sprite(tex);
  sprite.anchor.set(0.5);
  sprite.width = size;
  sprite.height = size;
  const mask = new PIXI.Graphics().beginFill(16777215).drawCircle(0, 0, size / 2).endFill();
  sprite.mask = mask;
  const ring = new PIXI.Graphics().lineStyle(2, 15260072, 0.9).drawCircle(0, 0, size / 2 + 3);
  box.addChild(bg, sprite, mask, ring);
  canvas.interface.addChild(box);
  const cx = token.center.x, top = token.center.y - (token.h ?? grid) / 2;
  const start = performance.now(), ticker = canvas.app.ticker;
  const tick = () => {
    const t = (performance.now() - start) / DURATION_MS;
    if (t >= 1 || box.destroyed) {
      ticker.remove(tick);
      if (!box.destroyed) box.destroy({ children: true });
      return;
    }
    const f = iconFrame(t);
    box.alpha = f.alpha;
    box.scale.set(f.scale);
    box.position.set(cx, top - size * 0.1 - f.rise * grid * 0.7);
  };
  ticker.add(tick);
}
var recent = /* @__PURE__ */ new Map();
function itemOf(msg) {
  try {
    const it = msg.getAssociatedItem?.();
    if (it) return it;
  } catch {
  }
  const ref = msg.flags?.dnd5e?.item;
  try {
    if (ref?.uuid) {
      const it = fromUuidSync(ref.uuid);
      if (it) return it;
    }
    const actor = game.actors?.get(msg.speaker?.actor);
    if (ref?.id && actor) return actor.items.get(ref.id);
  } catch {
  }
  return null;
}
function tokenOf(msg) {
  const sp = msg.speaker ?? {};
  if (sp.scene && sp.scene !== canvas?.scene?.id) return null;
  return canvas?.tokens?.get(sp.token) ?? game.actors?.get(sp.actor)?.getActiveTokens?.()[0] ?? null;
}
function targetsOf(msg) {
  try {
    const list = msg.flags?.dnd5e?.targets;
    if (Array.isArray(list) && list.length) {
      const toks = list.map((t) => {
        const d = fromUuidSync(t?.uuid);
        return d?.object ?? d?.getActiveTokens?.()[0];
      }).filter(Boolean);
      if (toks.length) return toks;
    }
  } catch {
  }
  return [...game.user?.targets ?? []];
}
function catalogIcon(item, token) {
  try {
    const caster = casterKeyOf(token?.actor?.name ?? token?.name);
    const via = [item.system?.method, item.getFlag?.(MOD, "via")].flat().filter((v) => typeof v === "string" && v);
    return SPELLS.icon(item.name, caster, via);
  } catch {
    return void 0;
  }
}
function onChatMessage(msg) {
  if (!canvas?.ready) return;
  const d = msg.flags?.dnd5e;
  if (!d?.item) return;
  if (d.messageType && d.messageType !== "usage") return;
  if (msg.timestamp && Date.now() - msg.timestamp > 5e3) return;
  const token = tokenOf(msg), item = itemOf(msg);
  if (!token || !item) return;
  const img = catalogIcon(item, token) ?? item.img;
  if (!img) return;
  const key = `${token.id}:${item.id}`, now = Date.now();
  if (now - (recent.get(key) ?? 0) < 400) return;
  recent.set(key, now);
  const targets = targetsOf(msg);
  for (const fn of listeners) {
    try {
      fn({ token, item, targets });
    } catch (e) {
      console.warn(MOD, "castIcon listener", e);
    }
  }
  if (castIconEnabled()) showCastIcon(token, img).catch((e) => console.warn(MOD, "castIcon", e));
}

export {
  castIconEnabled,
  setCastIconEnabled,
  onCast,
  showCastIcon,
  onChatMessage
};
