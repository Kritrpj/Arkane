// Movement limit in combat. Foundry and the D&D system only show a ruler; nothing stops a token walking farther than its speed.
// On a player's own turn the distance walked is added up; a move past the speed is refused. Out of turn players cannot move combatants.
// The GM is never restricted. A driver moving a vehicle uses the vehicle's speed (feet per turn). "Dash" doubles the allowance.
import { vehicleDef, driverToken } from "./vehicle.js?v=23";
const MOD = "arkane-1920s";
const STOP = ["paralyzed", "unconscious", "stunned", "petrified", "restrained", "grappled", "incapacitated"];
const on = () => game.settings.get(MOD, "moveLimit");
const isVeh = (t) => !!t.actor?.getFlag(MOD, "vehicle");
const walkSpeed = (a) => {
  if (!a) return 30;
  if ([...(a.statuses ?? [])].some((s) => STOP.includes(s))) return 0;
  const m = a.system?.attributes?.movement ?? {};
  return Number(m.walk) || Math.max(Number(m.swim) || 0, Number(m.fly) || 0, Number(m.climb) || 0, Number(m.burrow) || 0) || 0;
};
const cbtOf = (tokenId) => game.combat?.combatants.find((c) => c.tokenId === tokenId);

function who(doc) {   // [combatant, speed in ft] for whoever is spending the movement
  if (isVeh(doc)) {
    const drv = driverToken(doc), def = vehicleDef(doc);
    return drv ? [cbtOf(drv.id), def?.speed ?? 60] : [null, 0];
  }
  return [cbtOf(doc.id), walkSpeed(doc.actor)];
}

export async function dash() {
  const tok = canvas.tokens.controlled[0]?.document;
  if (!tok) return ui.notifications.warn("เลือกโทเคนของตัวเองก่อน");
  const combat = game.combat;
  if (!combat?.started) return ui.notifications.info("ยังไม่ได้อยู่ใน combat");
  let drv = tok;
  const ride = tok.getFlag(MOD, "ride");
  if (ride) { const vt = tok.parent.tokens.get(ride.on); drv = vt ? driverToken(vt) : null; if (!drv || drv.id !== tok.id) return ui.notifications.warn("เฉพาะคนขับเท่านั้นที่เร่งเครื่องได้"); }
  const c = cbtOf(drv.id);
  if (!c || combat.combatant?.id !== c.id) return ui.notifications.warn("ต้องเป็นเทิร์นของตัวละครนี้");
  if (c.getFlag(MOD, "dash")) return ui.notifications.info("วิ่ง/เร่งเครื่องไปแล้วในเทิร์นนี้");
  await c.setFlag(MOD, "dash", true);
  await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ token: tok }), content: `<div class="rw-card"><b>${foundry.utils.escapeHTML(tok.name)}</b> ใช้ Action วิ่ง (Dash) · ระยะเดินเทิร์นนี้เป็น 2 เท่า</div>` });
}
export async function toggleMoveLimit() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const v = !on(); await game.settings.set(MOD, "moveLimit", v);
  ui.notifications.info(`จำกัดระยะเดินใน combat: ${v ? "เปิด" : "ปิด"}`);
}

export function registerMoveLimit() {
  Hooks.on("preUpdateToken", (doc, ch, opt, userId) => {
    try {
      if (!on() || !("x" in ch || "y" in ch) || opt?.arkaneRide || opt?.arkaneInternal) return;
      if (game.users.get(userId)?.isGM) return;
      const combat = game.combat;
      if (!combat?.started || doc.getFlag(MOD, "ride")) return;
      const [c, speed] = who(doc);
      if (!c) return;   // not part of this combat: free
      if (combat.combatant?.id !== c.id) { ui.notifications.warn("ยังไม่ถึงเทิร์น เคลื่อนที่ไม่ได้"); return false; }
      const g = canvas.grid, s = g.size, cx0 = doc.x + doc.width * s / 2, cy0 = doc.y + doc.height * s / 2;
      const cx1 = (ch.x ?? doc.x) + doc.width * s / 2, cy1 = (ch.y ?? doc.y) + doc.height * s / 2;
      const cost = g.measurePath([{ x: cx0, y: cy0 }, { x: cx1, y: cy1 }]).distance;
      const used = c.getFlag(MOD, "used") ?? 0, limit = speed * (c.getFlag(MOD, "dash") ? 2 : 1);
      if (used + cost > limit + 0.01) {
        const left = Math.max(0, limit - used);
        ui.notifications.warn(`เดินเกินระยะ: เทิร์นนี้เหลือ ${Math.floor(left)} ฟุต (ความเร็ว ${limit} ฟุต)${limit && !c.getFlag(MOD, "dash") ? " · กด 'วิ่ง (Dash)' ถ้าต้องการเพิ่ม" : ""}`);
        return false;
      }
      opt.arkaneCost = cost;
    } catch (e) { console.warn(MOD, "moveLimit", e); }
  });
  Hooks.on("updateToken", async (doc, ch, opt, userId) => {
    if (userId !== game.user.id || !opt?.arkaneCost) return;
    const [c, speed] = who(doc); if (!c) return;
    const used = (c.getFlag(MOD, "used") ?? 0) + opt.arkaneCost;
    await c.setFlag(MOD, "used", used);
    const limit = speed * (c.getFlag(MOD, "dash") ? 2 : 1);
    ui.notifications.info(`เดินแล้ว ${Math.round(used)} ฟุต · เหลือ ${Math.max(0, Math.floor(limit - used))} ฟุต`);
  });
  Hooks.on("updateCombat", async (combat, ch) => {
    if (!game.users.activeGM?.isSelf || !("turn" in ch || "round" in ch)) return;
    const c = combat.combatant; if (!c) return;
    await c.update({ [`flags.${MOD}.used`]: 0, [`flags.${MOD}.dash`]: false });
  });
}
