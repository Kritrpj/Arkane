// Inventory lock: players can't add items, raise quantities or add money on their own sheets.
// Using things up (ammo, rations, spending) still works; the GM (and Item Piles, which runs through the GM) is never blocked.
const MOD = "arkane-1920s";
const PHYSICAL = ["weapon", "equipment", "consumable", "tool", "loot", "container", "backpack"];
const active = (userId) => game.settings.get(MOD, "lockInventory") && userId === game.user.id && !game.user.isGM;
const isPc = (actor) => actor?.type === "character";
let last = 0;
function warn(msg) { if (Date.now() - last > 1500) { last = Date.now(); ui.notifications.warn(msg); } }

export function registerInventoryLock() {
  game.settings.register(MOD, "lockInventory", { name: "ล็อกของในกระเป๋าผู้เล่น", hint: "ผู้เล่นเพิ่มของ เพิ่มจำนวน หรือเพิ่มเงินในชีทเองไม่ได้ (ลดได้ตามปกติ เช่น ใช้กระสุน) · ได้ของจากลัง/ร้าน (Item Piles) และจาก GM ได้เหมือนเดิม",
    scope: "world", config: true, type: Boolean, default: true });

  Hooks.on("preUpdateItem", (item, changes, options, userId) => {
    if (!active(userId) || !isPc(item.parent)) return;
    const q = foundry.utils.getProperty(changes, "system.quantity");
    if (q !== undefined && Number(q) > Number(item.system.quantity ?? 0)) { warn("เพิ่มจำนวนของเองไม่ได้ ขอ DM เพิ่มให้"); return false; }
  });
  Hooks.on("preCreateItem", (item, data, options, userId) => {
    if (!active(userId) || !isPc(item.parent) || !PHYSICAL.includes(item.type)) return;
    warn("เพิ่มของเข้ากระเป๋าเองไม่ได้ ขอ DM หรือหยิบจากลัง/ร้านในเกม");
    return false;
  });
  game.settings.register(MOD, "lockSheet", { name: "ล็อกชีทผู้เล่น", hint: "ผู้เล่นแก้ค่าสถานะ HP สูงสุด AC XP ทักษะ ความเร็ว ช่องเวท หรือดาเมจอาวุธในชีทเองไม่ได้ · พัก (Rest) โดนดาเมจ/ฮีล ทอยเซฟ และใช้ของยังทำงานปกติ",
    scope: "world", config: true, type: Boolean, default: true });
  // short windows in which HP may rise legitimately (healing applied, hit dice rolled)
  const allowed = new Map();
  const allow = (actor) => { if (actor?.id) allowed.set(actor.id, Date.now() + 4000); };
  Hooks.on("dnd5e.preApplyDamage", (actor) => allow(actor));
  for (const h of ["dnd5e.preRollHitDieV2", "dnd5e.preRollHitDie", "dnd5e.rollHitDieV2"]) Hooks.on(h, (cfg, ...rest) => allow(cfg?.subject ?? cfg?.actor ?? cfg));
  const sheetLocked = (userId) => game.settings.get(MOD, "lockSheet") && userId === game.user.id && !game.user.isGM;
  const flat = (o) => Object.keys(foundry.utils.flattenObject(o ?? {}));
  const ACTOR_BLOCK = [/^system\.abilities\./, /^system\.attributes\.(hp\.max|ac|init|movement|senses|prof|spellcasting)/, /^system\.details\.(xp|level)/,
    /^system\.skills\./, /^system\.bonuses\./, /^system\.traits\./, /^system\.attributes\.hp\.(tempmax|bonuses)/];
  Hooks.on("preUpdateActor", (actor, changes, options, userId) => {
    if (!sheetLocked(userId) || !isPc(actor)) return;
    if (options.isRest || options.isAdvancement || options.arkaneInternal) return; // rests, level-up and module automation go through
    if (allowed.get(actor.id) > Date.now()) return; // damage / healing / hit dice in progress
    if (flat(changes).some((k) => k.startsWith("system.attributes.death."))) return; // death saves (a natural 20 brings you back)
    const keys = flat(changes);
    const bad = keys.find((k) => ACTOR_BLOCK.some((re) => re.test(k)));
    if (bad) { warn("แก้ค่าในชีทเองไม่ได้ (ล็อกโดย DM) · ถ้าค่าผิด บอก DM"); return false; }
    const hp = foundry.utils.getProperty(changes, "system.attributes.hp.value"), temp = foundry.utils.getProperty(changes, "system.attributes.hp.temp");
    if ((hp !== undefined && Number(hp) > Number(actor.system.attributes.hp.value)) || (temp !== undefined && Number(temp) > Number(actor.system.attributes.hp.temp ?? 0))) {
      warn("เพิ่ม HP เองไม่ได้ ใช้การรักษา พัก หรือบอก DM"); return false;
    }
    for (const k of keys.filter((x) => /^system\.spells\.[^.]+\.value$/.test(x))) {
      const lvl = k.split(".")[2];
      if (Number(foundry.utils.getProperty(changes, k)) > Number(actor.system.spells?.[lvl]?.value ?? 0)) { warn("เพิ่มช่องเวทเองไม่ได้ ใช้การพักหรือบอก DM"); return false; }
    }
  });
  const ITEM_BLOCK = [/^system\.(damage|magicalBonus|properties|range|armor|type|proficient|levels|level|attack|price|weight|rarity|attunement)/, /^system\.activities\.[^.]+\.(attack|damage|healing|save|range|target)/, /^name$/];
  Hooks.on("preUpdateItem", (item, changes, options, userId) => {
    if (!sheetLocked(userId) || !isPc(item.parent)) return;
    const bad = flat(changes).find((k) => ITEM_BLOCK.some((re) => re.test(k)));
    if (bad) { warn("แก้ค่าอาวุธ/ความสามารถเองไม่ได้ (ล็อกโดย DM)"); return false; }
  });
  // money: a player may spend or convert coins (total value never goes up), never raise it
  const CP = { pp: 1000, gp: 100, ep: 50, sp: 10, cp: 1 };
  const worth = (c) => Object.entries(CP).reduce((t, [k, v]) => t + (Number(c?.[k]) || 0) * v, 0);
  Hooks.on("preUpdateActor", (actor, changes, options, userId) => {
    if (!active(userId) || !isPc(actor)) return;
    const cur = foundry.utils.getProperty(changes, "system.currency");
    if (!cur) return;
    const before = actor.system.currency ?? {};
    if (worth({ ...before, ...cur }) > worth(before) + 0.001) { warn("เพิ่มเงินเองไม่ได้ ขอ DM เพิ่มให้ (แลกเหรียญให้มูลค่าเท่าเดิมหรือลดลงได้)"); return false; }
  });
  // Safety net on the GM client: whatever path a player used (console, a macro, another module), a rise in a PC's money that
  // did not come from the GM is put back to the last known balance.
  const snap = new Map();
  const take = (a) => { if (isPc(a)) snap.set(a.id, foundry.utils.deepClone(a.system.currency ?? {})); };
  const init = () => game.actors.forEach(take);
  if (game.ready) init(); else Hooks.once("ready", init);
  Hooks.on("createActor", (a) => take(a));
  Hooks.on("updateActor", async (actor, changes, options, userId) => {
    try {
      if (!isPc(actor) || !game.users.activeGM?.isSelf || foundry.utils.getProperty(changes, "system.currency") === undefined) return;
      const u = game.users.get(userId), prev = snap.get(actor.id);
      if (prev && u && !u.isGM && game.settings.get(MOD, "lockInventory") && worth(actor.system.currency) > worth(prev) + 0.001) {
        await actor.update({ "system.currency": prev }, { arkaneInternal: true, arkaneRevert: true });
        await ChatMessage.create({ whisper: ChatMessage.getWhisperRecipients("GM").map((g) => g.id), speaker: { alias: "ระบบล็อกเงิน" },
          content: `<div class="rw-card">ผู้เล่น <b>${foundry.utils.escapeHTML(u.name)}</b> พยายามเพิ่มเงินของ <b>${foundry.utils.escapeHTML(actor.name)}</b> จากมูลค่า ${worth(prev)} cp เป็น ${worth(actor.system.currency)} cp · ระบบคืนค่าเดิมให้แล้ว</div>` });
        return;
      }
      take(actor);
    } catch (e) { console.warn(MOD, "money guard", e); }
  });
}
