// Cosmetic only: when a token uses an item/spell/feature, its icon fades up above that token.
// Local to each client (every player's screen reacts to the same chat message, so no socket is needed).
// Later (not now): an effect layer can hook into the same moment (see `onCast`) to fly a beam from caster to target.
import { MOD } from "./snapshot";
import { SPELLS } from "../data/spells";
import { casterKeyOf } from "../data/casters";

const DURATION_MS = 1800;
const KEY = `${MOD}.castIcon`;

export const castIconEnabled = (): boolean => { try { return localStorage.getItem(KEY) !== "off"; } catch { return true; } };
export const setCastIconEnabled = (on: boolean): boolean => { try { localStorage.setItem(KEY, on ? "on" : "off"); } catch { /* ignore */ } return on; };

// t: 0..1 through the animation -> how the icon looks at that moment (pure, easy to tune)
export function iconFrame(t: number): { alpha: number; rise: number; scale: number } {
  const c = Math.min(1, Math.max(0, t));
  const alpha = c < 0.15 ? c / 0.15 : c < 0.6 ? 1 : 1 - (c - 0.6) / 0.4;
  const rise = 1 - Math.pow(1 - c, 3);                       // ease-out: fast at first, then settles
  const scale = c < 0.2 ? 0.6 + 0.4 * (c / 0.2) : 1;
  return { alpha, rise, scale };
}

// extra hooks for the future effect layer: called with the caster token, the item, and the targets at cast time
type CastListener = (cast: { token: any; item: any; targets: any[] }) => void;
const listeners: CastListener[] = [];
export const onCast = (fn: CastListener): void => { listeners.push(fn); };

export async function showCastIcon(token: any, img: string): Promise<void> {
  if (!token || !img || !canvas?.interface || !canvas.app) return;
  if (token.visible === false) return;                        // hidden from this player (fog / hidden token)
  const load = foundry.canvas?.loadTexture ?? (globalThis as any).loadTexture;
  const tex = await load(img).catch(() => null);
  if (!tex || !canvas?.interface) return;

  const grid = canvas.grid?.size ?? 100;
  const size = Math.min(grid * 1.4, Math.max(grid * 0.7, (token.w ?? grid) * 0.45));
  const box = new PIXI.Container();
  box.eventMode = "none"; box.zIndex = 1000;
  const bg = new PIXI.Graphics().beginFill(0x111111, 0.85).drawCircle(0, 0, size / 2 + 3).endFill();
  const sprite = new PIXI.Sprite(tex); sprite.anchor.set(0.5); sprite.width = size; sprite.height = size;
  const mask = new PIXI.Graphics().beginFill(0xffffff).drawCircle(0, 0, size / 2).endFill();
  sprite.mask = mask;
  const ring = new PIXI.Graphics().lineStyle(2, 0xe8d9a8, 0.9).drawCircle(0, 0, size / 2 + 3);
  box.addChild(bg, sprite, mask, ring);
  canvas.interface.addChild(box);

  const cx = token.center.x, top = token.center.y - (token.h ?? grid) / 2;
  const start = performance.now(), ticker = canvas.app.ticker;
  const tick = () => {
    const t = (performance.now() - start) / DURATION_MS;
    if (t >= 1 || box.destroyed) { ticker.remove(tick); if (!box.destroyed) box.destroy({ children: true }); return; }
    const f = iconFrame(t);
    box.alpha = f.alpha; box.scale.set(f.scale);
    box.position.set(cx, top - size * 0.1 - f.rise * grid * 0.7);
  };
  ticker.add(tick);
}

// ---- the chat message dnd5e posts when an item is used (same on every client)
const recent = new Map<string, number>();

function itemOf(msg: any): any {
  try { const it = msg.getAssociatedItem?.(); if (it) return it; } catch { /* older/newer dnd5e: fall through */ }
  const ref = msg.flags?.dnd5e?.item;
  try {
    if (ref?.uuid) { const it = fromUuidSync(ref.uuid); if (it) return it; }
    const actor = game.actors?.get(msg.speaker?.actor);
    if (ref?.id && actor) return actor.items.get(ref.id);
  } catch { /* ignore */ }
  return null;
}

function tokenOf(msg: any): any {
  const sp = msg.speaker ?? {};
  if (sp.scene && sp.scene !== canvas?.scene?.id) return null;   // used on another scene
  return canvas?.tokens?.get(sp.token) ?? game.actors?.get(sp.actor)?.getActiveTokens?.()[0] ?? null;
}

// the targets of THIS cast. Every client runs this for the same chat message, but game.user.targets is only the caster's own,
// so read the targets dnd5e stored on the message first (flags.dnd5e.targets, token uuids; unverified on real dnd5e) and fall back to ours
function targetsOf(msg: any): any[] {
  try {
    const list = msg.flags?.dnd5e?.targets;
    if (Array.isArray(list) && list.length) {
      const toks = list.map((t: any) => { const d = fromUuidSync(t?.uuid); return d?.object ?? d?.getActiveTokens?.()[0]; }).filter(Boolean);
      if (toks.length) return toks;
    }
  } catch { /* fall through */ }
  return [...(game.user?.targets ?? [])];
}

// the catalog's icon for this item and caster (his/her own picture, else the spell's default); null = keep the item's own picture
function catalogIcon(item: any, token: any): string | undefined {
  try {
    const caster = casterKeyOf(token?.actor?.name ?? token?.name);
    const via = [item.system?.method, item.getFlag?.(MOD, "via")].flat().filter((v) => typeof v === "string" && v);   // "spell" / "pact" / "innate" + a flag the GM can set
    return SPELLS.icon(item.name, caster, via);
  } catch { return undefined; }
}

export function onChatMessage(msg: any): void {
  if (!canvas?.ready) return;
  const d = msg.flags?.dnd5e;
  if (!d?.item) return;
  if (d.messageType && d.messageType !== "usage") return;        // attack/damage rolls of the same use don't repeat it
  if (msg.timestamp && Date.now() - msg.timestamp > 5000) return;
  const token = tokenOf(msg), item = itemOf(msg);
  if (!token || !item) return;
  const img = catalogIcon(item, token) ?? item.img;
  if (!img) return;
  const key = `${token.id}:${item.id}`, now = Date.now();
  if (now - (recent.get(key) ?? 0) < 400) return;                // double message for one use
  recent.set(key, now);
  const targets = targetsOf(msg);
  for (const fn of listeners) { try { fn({ token, item, targets }); } catch (e) { console.warn(MOD, "castIcon listener", e); } }
  if (castIconEnabled()) showCastIcon(token, img).catch((e) => console.warn(MOD, "castIcon", e));
}
