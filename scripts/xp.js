// Party XP: when a combat ends, XP from every defeated enemy is split evenly among the player characters in it,
// and anyone who crosses a level threshold levels up automatically (same plan as the "เลเวลอัพ" macro).
import { levelUp } from "./spells.js?v=21";
const MOD = "arkane-1920s";
const D = () => foundry.applications?.api?.DialogV2;
const CR_XP = { 0: 10, 0.125: 25, 0.25: 50, 0.5: 100, 1: 200, 2: 450, 3: 700, 4: 1100, 5: 1800, 6: 2300, 7: 2900, 8: 3900, 9: 5000, 10: 5900 };
const NEXT = { 1: 300, 2: 900, 3: 2700, 4: 6500, 5: 14000 }; // XP needed to reach the next level (PHB)
const MAX_LEVEL = 5; // level plans in this module go to 5

function xpOf(actor) {
  const v = actor?.system?.details?.xp?.value;
  if (typeof v === "number" && actor.type === "npc" && v > 0) return v;
  const cr = Number(actor?.system?.details?.cr ?? 0);
  return CR_XP[cr] ?? (cr > 10 ? 5900 : 10);
}
const levelOf = (a) => a.items.find((i) => i.type === "class")?.system.levels ?? a.system.details.level ?? 1;
const pcs = () => game.actors.filter((a) => a.type === "character" && a.getFlag(MOD, "pc") && !a.getFlag(MOD, "later"));

// give XP (each = per character) and level up anyone who crossed a threshold
export async function grantXp(actors, each, reason = "") {
  const lines = [];
  for (const a of actors) {
    const before = Number(a.system.details.xp?.value ?? 0), after = before + each;
    await a.update({ "system.details.xp.value": after });
    let lvl = levelOf(a), ups = 0;
    while (lvl < MAX_LEVEL && after >= (NEXT[lvl] ?? Infinity)) {
      await levelUp(a, { confirm: false });
      const nl = levelOf(a);
      if (nl === lvl) break;
      lvl = nl; ups++;
    }
    const need = NEXT[lvl];
    lines.push(`<b>${a.name}</b> +${each} XP (${after}${lvl < MAX_LEVEL && need ? `/${need}` : ""})${ups ? ` · <b style="color:#8a1820">เลเวลอัพเป็น ${lvl}!</b>` : ""}`);
  }
  ChatMessage.create({ speaker: { alias: "ประสบการณ์" },
    content: `<div class="rw-card"><div class="rw-title">ได้รับ XP${reason ? ` · ${reason}` : ""}</div>${lines.join("<br>")}</div>` });
}

// combat ended: defeated hostile NPCs → XP split among the PCs that fought
async function onCombatEnd(combat) {
  if (!game.users.activeGM?.isSelf || !game.settings.get(MOD, "autoXp") || !combat.started) return;
  if (combat.scene?.name?.startsWith("ฉากซ้อม")) return; // practice scene gives no XP
  const foes = combat.combatants.filter((c) => c.actor?.type === "npc" && c.token?.disposition === -1 && !c.actor.getFlag(MOD, "tutorial")
    && (c.isDefeated || (c.actor.system.attributes?.hp?.value ?? 1) <= 0));
  const party = [...new Set(combat.combatants.filter((c) => c.actor?.type === "character" && c.hasPlayerOwner).map((c) => c.actor))];
  if (!foes.length || !party.length) return;
  const total = foes.reduce((s, c) => s + xpOf(c.actor), 0);
  const each = Math.floor(total / party.length);
  if (!each) return;
  await grantXp(party, each, `ชนะ ${foes.map((c) => c.name).join(", ")} (รวม ${total} ÷ ${party.length} คน)`);
}

// GM button: story XP (milestones, good roleplay, solved a clue)
export async function giveXpDialog() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const list = pcs();
  const content = `<div class="rw-form">
    <label>XP <input type="number" name="xp" value="100" min="1"></label>
    <label class="rw-radio"><input type="radio" name="mode" value="split" checked> หารเท่ากันทั้งตี้</label>
    <label class="rw-radio"><input type="radio" name="mode" value="each"> ให้ทุกคนคนละเท่านี้</label>
    <label>เหตุผล (ขึ้นในแชท) <input type="text" name="why" placeholder="เช่น ไขคดีอาเธอร์ได้"></label>
    <p class="rw-hint">ได้ XP</p>
    ${list.map((a) => `<label class="rw-check"><input type="checkbox" name="a" value="${a.id}" checked> ${a.name} <small>(เลเวล ${levelOf(a)} · ${a.system.details.xp?.value ?? 0} XP)</small></label>`).join("")}
    <p class="rw-hint">เกณฑ์เลเวล: 2 = 300 · 3 = 900 · 4 = 2,700 · 5 = 6,500 XP · ถึงเกณฑ์แล้วเลเวลอัพให้อัตโนมัติ</p>
  </div>`;
  const r = await D().wait({ window: { title: "ให้ XP" }, content,
    buttons: [{ action: "ok", label: "ให้ XP", default: true, callback: (ev, btn) => ({ xp: Number(btn.form.querySelector("input[name=xp]").value) || 0,
      mode: btn.form.querySelector("input[name=mode]:checked").value, why: btn.form.querySelector("input[name=why]").value,
      ids: [...btn.form.querySelectorAll("input[name=a]:checked")].map((i) => i.value) }) }, { action: "cancel", label: "ยกเลิก" }] });
  if (!r || r === "cancel" || !r.xp || !r.ids.length) return;
  const who = r.ids.map((id) => game.actors.get(id)).filter(Boolean);
  await grantXp(who, r.mode === "split" ? Math.floor(r.xp / who.length) : r.xp, r.why);
}

export function registerXp() {
  game.settings.register(MOD, "autoXp", { name: "XP อัตโนมัติหลังต่อสู้", hint: "จบการต่อสู้ (ลบ Combat) แล้วแจก XP ของศัตรูที่ล้มให้ผู้เล่นที่ร่วมสู้ หารเท่ากันทั้งตี้ · ถึงเกณฑ์เลเวลอัพให้อัตโนมัติ (ไม่นับฉากซ้อม)",
    scope: "world", config: true, type: Boolean, default: true });
  Hooks.on("deleteCombat", (c) => onCombatEnd(c).catch((e) => console.error(MOD, "xp", e)));
}
