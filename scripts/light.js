// Hand lights: a token whose actor carries a flashlight / lantern gets a light button on its Token HUD
// (and the macro "เปิด/ปิดไฟฉาย"). Flashlight = 60° beam that turns with the token, lantern = flickering 360° glow.
const MOD = "arkane-1920s";
const SOCK = `module.${MOD}`;
const KINDS = [
  { re: /ไฟฉาย|flashlight/i, name: "ไฟฉาย", light: { bright: 30, dim: 60, angle: 60, color: "#fff2cc", alpha: 0.35, animation: { type: null } } },
  { re: /ตะเกียง|lantern|lamp/i, name: "ตะเกียง", light: { bright: 30, dim: 30, angle: 360, color: "#ffb347", alpha: 0.45, animation: { type: "torch", speed: 3, intensity: 3 } } },
  { re: /^ไฟแช็ก|lighter/i, name: "ไฟแช็ก", light: { bright: 5, dim: 10, angle: 360, color: "#ffb347", alpha: 0.4, animation: { type: "torch", speed: 5, intensity: 4 } } }
];
const kindOf = (actor) => {
  for (const k of KINDS) { const it = actor?.items?.find((i) => k.re.test(i.name)); if (it) return { ...k, item: it }; }
  return null;
};

async function setLight(doc, on, kind) {
  const upd = on
    ? { light: kind.light, [`flags.${MOD}.handLight`]: { prev: doc.light.toObject?.() ?? foundry.utils.deepClone(doc.light), kind: kind.name } }
    : { light: doc.getFlag(MOD, "handLight")?.prev ?? { bright: 0, dim: 0 }, [`flags.${MOD}.-=handLight`]: null };
  if (doc.isOwner) { try { return await doc.update(upd); } catch (e) { console.warn(MOD, "light", e); } }
  game.socket.emit(SOCK, { t: "light", scene: doc.parent.id, token: doc.id, upd });
}

export async function toggleHandLight(token) {
  token ??= canvas.tokens.controlled[0] ?? game.user.character?.getActiveTokens()[0];
  if (!token) return ui.notifications.warn("เลือกโทเคนก่อน");
  const doc = token.document ?? token;
  const on = !!doc.getFlag(MOD, "handLight");
  if (on) { await setLight(doc, false); return ui.notifications.info(`${doc.name}: ปิดไฟ`); }
  const kind = kindOf(doc.actor);
  if (!kind) return ui.notifications.warn(`${doc.name} ไม่มีไฟฉาย ตะเกียง หรือไฟแช็ก (ซื้อได้ที่ร้านฟินช์)`);
  await setLight(doc, true, kind);
  ui.notifications.info(`${doc.name}: เปิด${kind.name}${kind.name === "ไฟฉาย" ? " · หันลำแสงโดยหมุนโทเคน (Shift + ล้อเมาส์)" : ""}`);
}

export function registerHandLights() {
  Hooks.once("ready", () => {
    game.socket.on(SOCK, async (d) => {
      if (d.t !== "light" || !game.users.activeGM?.isSelf) return;
      await game.scenes.get(d.scene)?.tokens.get(d.token)?.update(d.upd);
    });
  });
  // Token HUD button
  Hooks.on("renderTokenHUD", (hud, html) => {
    const doc = hud.object?.document;
    if (!doc?.isOwner || !(kindOf(doc.actor) || doc.getFlag(MOD, "handLight"))) return;
    const root = html instanceof HTMLElement ? html : html[0];
    const col = root.querySelector(".col.left") ?? root.querySelector(".left");
    if (!col) return;
    const on = !!doc.getFlag(MOD, "handLight");
    const btn = document.createElement("div");
    btn.className = `control-icon arkane-keep ${on ? "active" : ""}`;
    btn.dataset.action = "arkane-light";
    btn.title = on ? "ปิดไฟ" : `เปิด${kindOf(doc.actor)?.name ?? "ไฟ"}`;
    btn.innerHTML = `<i class="fas fa-lightbulb"></i>`;
    btn.addEventListener("click", async (ev) => { ev.preventDefault(); ev.stopPropagation(); await toggleHandLight(hud.object); hud.render?.(); });
    col.appendChild(btn);
  });
}
