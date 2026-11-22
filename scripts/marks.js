// Hunter's Mark + Hex automation
//  - casting the spell on a targeted token "marks" it (one target per caster per spell; a new cast moves the mark)
//  - every attack-roll damage the caster rolls against the marked token gets +1d6 (force / necrotic) added automatically
//  - the marked token shows a coloured ring + badge for everybody
//  - the mark ends when: the target drops to 0 HP or is deleted, the caster stops concentrating on it, or a long rest
// Marks live on the CASTER's actor flag: flags.arkane-1920s.marks.<kind> = { tokenUuid, actorUuid, name }
const MOD = "arkane-1920s";
const KINDS = {
  huntmark: { match: /^hunter['’`]?s mark/i, name: "Hunter's Mark", type: "force", color: 0xe04a3a, label: "HM" },
  hex: { match: /^hex\b/i, name: "Hex", type: "necrotic", color: 0x9b5cff, label: "HEX" },
};
const kindOf = (name) => Object.keys(KINDS).find((k) => KINDS[k].match.test(String(name ?? "").trim()));
const on = () => { try { return game.settings.get(MOD, "marksAuto") !== false; } catch { return true; } };
const marksOf = (actor) => foundry.utils.deepClone(actor?.getFlag(MOD, "marks") ?? {});

async function setMark(actor, kind, tok) {
  const td = tok.document ?? tok;
  await actor.update({ [`flags.${MOD}.marks.${kind}`]: { tokenUuid: td.uuid, actorUuid: td.actor?.uuid ?? null, name: td.name } });
}
export async function clearMark(actor, kind) {
  if (!actor) return;
  const kinds = kind ? [kind] : Object.keys(marksOf(actor));
  const upd = {};
  for (const k of kinds) upd[`flags.${MOD}.marks.-=${k}`] = null;
  if (Object.keys(upd).length) await actor.update(upd);
}
const chars = () => game.actors.filter((a) => a.type === "character");

// ---- visual ----
const NAME = "arkaneMark";
function drawMark(token, list) {
  const w = token.w ?? token.document.width * canvas.grid.size, h = token.h ?? token.document.height * canvas.grid.size;
  const c = new PIXI.Container(); c.name = NAME; c.eventMode = "none"; c.zIndex = 50;
  const v8 = Number(String(PIXI.VERSION ?? "7").split(".")[0]) >= 8;
  list.forEach((k, i) => {
    const K = KINDS[k], r = Math.min(w, h) / 2 - 2 - i * 5, g = new PIXI.Graphics();
    const bx = w - Math.min(w, h) * 0.18 - i * Math.min(w, h) * 0.34, by = Math.min(w, h) * 0.18, br = Math.min(w, h) * 0.17;
    if (v8) { g.circle(w / 2, h / 2, r).stroke({ width: 4, color: K.color, alpha: 0.95 }); g.circle(bx, by, br).fill({ color: 0x120d08, alpha: 0.9 }).stroke({ width: 2, color: K.color }); }
    else { g.lineStyle(4, K.color, 0.95); g.drawCircle(w / 2, h / 2, r); g.lineStyle(2, K.color); g.beginFill(0x120d08, 0.9); g.drawCircle(bx, by, br); g.endFill(); }
    c.addChild(g);
    const style = { fontFamily: "Signika, sans-serif", fontSize: Math.max(9, br * 0.9), fontWeight: "bold", fill: K.color };
    const t = v8 ? new PIXI.Text({ text: K.label, style }) : new PIXI.Text(K.label, style);
    t.anchor.set(0.5); t.position.set(bx, by); c.addChild(t);
  });
  token.addChild(c);
}
function markedKinds(token) {
  const out = [];
  for (const a of chars()) {
    const m = a.getFlag(MOD, "marks") ?? {};
    for (const k of Object.keys(m)) if (KINDS[k] && m[k]?.tokenUuid === token.document.uuid && !out.includes(k)) out.push(k);
  }
  return out;
}
function paint(token, force) {
  try {
    const old = token.children?.find((x) => x.name === NAME);
    const kinds = markedKinds(token);
    if (old && !force && kinds.length) return;
    if (old) { token.removeChild(old); old.destroy({ children: true }); }
    if (kinds.length) drawMark(token, kinds);
  } catch (e) { console.warn(MOD, "mark overlay", e); }
}
const paintAll = () => { for (const t of canvas?.tokens?.placeables ?? []) paint(t, true); };

// ---- rules ----
export function registerMarks() {
  game.arkane ??= {};
  game.arkane.clearMark = (actor, kind) => clearMark(actor ?? canvas.tokens.controlled[0]?.actor ?? game.user.character, kind);
  game.arkane.markTarget = async (kind = "huntmark") => {
    const actor = canvas.tokens.controlled[0]?.actor ?? game.user.character, tok = game.user.targets.first();
    if (!actor || !tok) return ui.notifications.warn("เลือกตัวละครของคุณและกด Target เป้าก่อน");
    await setMark(actor, kind, tok);
  };

  // 1) cast -> mark the targeted token
  Hooks.on("dnd5e.postUseActivity", async (activity, usage, results) => {
    try {
      if (!on()) return;
      const kind = kindOf(activity?.item?.name), actor = activity?.actor;
      if (!kind || !actor || !actor.isOwner) return;
      const tok = game.user.targets.first();
      if (!tok) { ui.notifications.warn(`${KINDS[kind].name}: ไม่ได้เลือกเป้า — กด Target เป้า แล้วร่ายใหม่ หรือพิมพ์ game.arkane.markTarget("${kind}")`); return; }
      await setMark(actor, kind, tok);
      ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<p><b>${KINDS[kind].name}</b> — ${actor.name} มาร์ก <b>${tok.name}</b> (โจมตีโดนเพิ่ม 1d6 ${KINDS[kind].type === "force" ? "Force" : "Necrotic"} อัตโนมัติ)</p>` });
    } catch (e) { console.warn(MOD, "mark cast", e); }
  });

  // 2) attack damage vs marked target -> add 1d6
  Hooks.on("dnd5e.preRollDamageV2", (config, dialog, message) => {
    try {
      if (!on()) return;
      const act = config?.subject;
      if (!act || act.type !== "attack" || kindOf(act.item?.name)) return;
      const marks = act.actor?.getFlag(MOD, "marks");
      if (!marks || !config.rolls?.length) return;
      const targets = Array.from(game.user.targets).map((t) => t.document.uuid);
      const added = [];
      for (const k of Object.keys(marks)) {
        const K = KINDS[k]; if (!K || !targets.includes(marks[k]?.tokenUuid)) continue;
        config.rolls.push({ parts: ["1d6"], data: config.rolls[0].data, options: { type: K.type, types: [K.type], properties: [] } });
        added.push(K.name);
      }
      if (added.length && message?.data) message.data.flavor = `${message.data.flavor ?? ""} (+${added.join(", ")})`;
    } catch (e) { console.warn(MOD, "mark damage", e); }
  });

  // 3) visual
  Hooks.on("canvasReady", () => setTimeout(paintAll, 300));
  Hooks.on("refreshToken", (t) => paint(t, false));
  Hooks.on("updateActor", (a, ch) => { if (foundry.utils.hasProperty(ch, `flags.${MOD}.marks`) || ch?.flags?.[MOD] !== undefined) paintAll(); });

  // 4) ending the mark (GM client does the clean-up so permissions are never a problem)
  const gm = () => game.user.isGM && game.users.activeGM?.isSelf;
  const dropWhere = async (test) => { for (const a of chars()) { const m = marksOf(a); for (const k of Object.keys(m)) if (test(m[k], k, a)) await clearMark(a, k); } };
  Hooks.on("updateActor", (actor, ch) => {
    try { if (!gm()) return; const hp = foundry.utils.getProperty(ch, "system.attributes.hp.value"); if (hp !== undefined && hp <= 0) dropWhere((m) => m.actorUuid === actor.uuid); } catch (e) { console.warn(MOD, "mark hp", e); }
  });
  Hooks.on("deleteToken", (td) => { try { if (gm()) dropWhere((m) => m.tokenUuid === td.uuid); } catch (e) { console.warn(MOD, "mark del", e); } });
  Hooks.on("deleteActiveEffect", (eff) => {
    try {
      if (!gm() || !(eff.parent instanceof Actor)) return;
      if (!(eff.statuses?.has?.("concentrating") || eff.system?.type === "concentrating")) return;
      const nm = fromUuidSync(eff.origin ?? "")?.name ?? eff.getFlag?.("dnd5e", "item")?.data?.name ?? eff.name;
      const kind = kindOf(String(nm).replace(/^[^:]*:\s*/, ""));
      if (kind) clearMark(eff.parent, kind);
    } catch (e) { console.warn(MOD, "mark conc", e); }
  });
  Hooks.on("dnd5e.restCompleted", (actor, result) => { try { if (gm() && (result?.longRest || result?.type === "long")) clearMark(actor); } catch (e) { console.warn(MOD, "mark rest", e); } });
}
