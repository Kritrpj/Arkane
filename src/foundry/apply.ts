// Turns Effects into real changes. Two paths:
//   - chat lines are written by the player who acted (so the speaker is right)
//   - everything that edits tokens/actors needs GM rights: a player sends it to the GM client by socket,
//     the same pattern as asGM() in combatx.js (but with its own message type "c-fx", so the old
//     handler ignores it and nothing in combatx.js has to change)
import type { Effect } from "../model/effect";
import { formatCheck } from "../rules/check";
import { MOD, SOCK, topLeftOf } from "./snapshot";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const NEEDS_GM = new Set<Effect["kind"]>(["push", "prone", "damage", "spendItem"]);

export interface FxMessage { t: "c-fx"; scene: string; effects: Effect[] }

async function say(e: Extract<Effect, { kind: "log" }>, speaker: any) {
  const check = e.check ? `<small>${esc(formatCheck(e.check))}</small>` : "";
  await ChatMessage.create({
    speaker: ChatMessage.getSpeaker({ token: speaker }),
    content: `<div class="rw-card">${esc(e.text)}${check}</div>`,
  });
}

export async function applyEffects(effects: Effect[], sceneId: string, speaker?: any): Promise<void> {
  for (const e of effects) if (e.kind === "log") await say(e, speaker);

  const remote = effects.filter((e) => NEEDS_GM.has(e.kind));
  if (!remote.length) return;                                  // (spendCost: Argon HUD tracks action economy, nothing to do)
  const msg: FxMessage = { t: "c-fx", scene: sceneId, effects: remote };
  if (game.user.isGM) return gmApply(msg);
  if (!game.users.activeGM) { ui.notifications.warn("ไม่มี GM ออนไลน์ จึงผลัก/ทำดาเมจไม่ได้ ลองบอก DM ให้เข้าเกม"); return; }
  game.socket.emit(SOCK, msg);
}

// runs on the GM client. Player data is never trusted blindly: only known kinds, only whole cells inside the map.
export async function gmApply(msg: FxMessage): Promise<void> {
  const scene = game.scenes.get(msg.scene);
  if (!scene) return;
  const s = scene.grid?.size || 100, d = scene.dimensions ?? {};
  const cols = Number.isFinite(d.sceneWidth) ? Math.floor(d.sceneWidth / s) : Infinity;
  const rows = Number.isFinite(d.sceneHeight) ? Math.floor(d.sceneHeight / s) : Infinity;

  for (const e of msg.effects ?? []) {
    try {
      const tok = scene.tokens.get((e as any).target ?? (e as any).owner);
      if (!tok) continue;
      if (e.kind === "push") {
        const { col, row } = e.to ?? ({} as any);
        if (!Number.isInteger(col) || !Number.isInteger(row) || col < 0 || row < 0 || col >= cols || row >= rows) continue;
        await tok.update(topLeftOf(scene, { col, row }), { arkaneInternal: true, animate: true });   // arkaneInternal: no Opportunity Attack for a shove
      } else if (e.kind === "prone") {
        await tok.actor?.toggleStatusEffect?.("prone", { active: true });
      } else if (e.kind === "damage") {
        if (!(e.amount > 0) || !tok.actor) continue;
        try { await tok.actor.applyDamage([{ value: e.amount, type: e.type || "bludgeoning" }]); }
        catch { await tok.actor.applyDamage(e.amount); }
      } else if (e.kind === "spendItem") {
        const it = tok.actor?.items?.get(e.itemId);
        if (!it) continue;
        const left = (Number(it.system?.quantity) || 1) - Math.max(1, e.qty | 0);
        if (left > 0) await it.update({ "system.quantity": left }); else await it.delete();
      }
    } catch (err) { console.warn(MOD, "core effect", e.kind, err); }
  }
}
