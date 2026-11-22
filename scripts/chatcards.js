// Chat cards for attacks and damage: a framed banner that says who hit whom, whether it landed, and how the damage was made.
// Written against dnd5e 6.0.6 chat message models (message.type "attack" / "damage" / "healing", targets in message.system.targets).
const MOD = "arkane-1920s";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const chip = (t) => `<span class="arkane-chip">${t.img ? `<img src="${esc(t.img)}" alt="">` : ""}${esc(t.name)}</span>`;
const who = (msg) => msg.speaker?.alias || msg.getAssociatedActor?.()?.name || msg.author?.name || "ใครสักคน";
const showAC = () => { try { return game.user.isGM || dnd5e.settings.attackRollVisibility === "all"; } catch { return game.user.isGM; } };
const showRes = () => { try { return game.user.isGM || dnd5e.settings.attackRollVisibility !== "none"; } catch { return true; } };

// "1d10[3] + 2" : each dice term with the faces that were actually rolled
function expr(roll) {
  const Dice = foundry.dice.terms.DiceTerm;
  return roll.terms.map((t) => t instanceof Dice
    ? `${t.expression}[${(t.results ?? []).filter((r) => r.active !== false && !r.discarded).map((r) => r.result).join("+")}]`
    : (t.expression ?? String(t.total ?? ""))).join(" ").replace(/\s+/g, " ").trim();
}
function diceSum(roll) {
  const Dice = foundry.dice.terms.DiceTerm; let n = 0;
  for (const t of roll.terms) if (t instanceof Dice) n += (t.results ?? []).filter((r) => r.active !== false && !r.discarded).reduce((a, r) => a + r.result, 0);
  return n;
}
const typeLabel = (roll) => {
  const t = roll.options?.type ?? roll.options?.types?.[0]; if (!t) return "";
  const c = CONFIG.DND5E?.damageTypes?.[t] ?? CONFIG.DND5E?.healingTypes?.[t];
  return c?.label ?? t;
};

function attackBanner(msg) {
  const roll = msg.rolls?.[0]; if (!roll) return null;
  const d20 = roll.dice?.[0]; const res = d20?.results ?? [];
  const faces = res.length > 1 ? res.map((r) => (r.discarded || r.active === false ? `<s>${r.result}</s>` : `<b>${r.result}</b>`)).join(" , ") : `<b>${res[0]?.result ?? "?"}</b>`;
  const mod = Math.round(roll.total - (d20?.total ?? 0));
  const item = msg.getAssociatedItem?.()?.name;
  const tg = msg.system?.evaluatedTargets ?? [];
  const head = `<div class="arkane-rc-title">⚔ ${esc(who(msg))} โจมตี ${tg.length ? tg.map(chip).join(" ") : "<i>(ไม่ได้เล็งเป้า)</i>"}${item ? ` ด้วย <b>${esc(item)}</b>` : ""}</div>`;
  const calc = `<div class="arkane-rc-line">ทอย d20 ได้ ${faces}${mod ? ` ${mod > 0 ? "+" : "−"} ${Math.abs(mod)} (โบนัสโจมตี)` : ""} = <b>${roll.total}</b>${roll.isCritical ? ` <span class="arkane-tag crit">คริติคอล!</span>` : roll.isFumble ? ` <span class="arkane-tag miss">ทอยได้ 1 พลาดเสมอ</span>` : ""}</div>`;
  const rows = tg.map((t) => {
    const hit = !t.isMiss;
    const ac = showAC() && t.ac != null ? ` · เทียบ AC ${t.ac}` : "";
    return `<div class="arkane-rc-row">${chip(t)} ${showRes() ? `<span class="arkane-tag ${hit ? "hit" : "miss"}">${hit ? "โดน" : "พลาด"}</span>` : ""}<small>${roll.total}${ac}</small></div>`;
  }).join("");
  return `${head}${calc}${rows}`;
}

function damageBanner(msg) {
  const rolls = msg.rolls ?? []; if (!rolls.length) return null;
  const heal = msg.type === "healing";
  const tg = msg.system?.targets ?? [];
  const item = msg.getAssociatedItem?.()?.name;
  const head = `<div class="arkane-rc-title">${heal ? "✚" : "💥"} ${esc(who(msg))} ${heal ? "รักษา" : "ทำดาเมจใส่"} ${tg.length ? tg.map(chip).join(" ") : "<i>(ยังไม่ได้เล็งเป้า)</i>"}${item ? ` · <b>${esc(item)}</b>` : ""}</div>`;
  let total = 0;
  const lines = rolls.map((r) => {
    const dsum = diceSum(r), flat = Math.round(r.total - dsum), tl = typeLabel(r);
    total += Math.max(0, r.total);
    const dice = r.terms.filter((t) => t.results).map((t) => t.expression).join(" + ");
    const why = dice ? `ลูกเต๋า ${esc(dice)} ออก <b>${dsum}</b>${flat ? ` ${flat > 0 ? "+" : "−"} โบนัสคงที่ <b>${Math.abs(flat)}</b>` : ""} = <b>${r.total}</b>` : `ค่าคงที่ <b>${r.total}</b>`;
    return `<div class="arkane-rc-line">${why}${tl ? ` <span class="arkane-tag type">${esc(tl)}</span>` : ""}${r.isCritical ? ` <span class="arkane-tag crit">คริติคอล: ลูกเต๋าเพิ่มเป็น 2 เท่า</span>` : ""}<br><small>${esc(expr(r))} = ${r.total}</small></div>`;
  }).join("");
  const sum = rolls.length > 1 ? `<div class="arkane-rc-line">รวมทั้งหมด <b>${total}</b></div>` : "";
  const note = heal ? "" : `<div class="arkane-rc-note">ตัวเลขนี้ยังไม่ถูกหัก HP จนกว่าจะกดปุ่ม Apply ด้านล่าง (ลดครึ่ง/ต้านทาน/ตัวคูณ เลือกได้ที่นั่น)</div>`;
  return `${head}${lines}${sum}${note}`;
}

export function registerChatCards() {
  Hooks.on("renderChatMessageHTML", (msg, html) => {
    try {
      if (!["attack", "damage", "healing"].includes(msg.type) || !msg.isContentVisible) return;
      const box = html.querySelector?.(".message-content"); if (!box || box.querySelector(":scope > .arkane-rc-banner")) return;
      const inner = msg.type === "attack" ? attackBanner(msg) : damageBanner(msg); if (!inner) return;
      const el = document.createElement("div");
      el.className = `arkane-rc-banner ${msg.type === "attack" ? "atk" : "dmg"}`; el.innerHTML = inner;
      box.prepend(el);
      html.classList.add("arkane-rc", msg.type === "attack" ? "arkane-rc-atk" : "arkane-rc-dmg");
    } catch (e) { console.warn(MOD, "chat card", e); }
  });
  // old messages already in the log get redrawn once the hook exists
  try { ui.chat?.render?.(); } catch {}
}
