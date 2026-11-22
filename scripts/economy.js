// Economy balance + corpse loot.
// Money in the story (per party): Arthur's job $50 · Ch2 C.A.A.M. pays $150 · Rosso's safe $40 · ledger sells $60 · corpses a few dollars each.
// Prices are set so basic guns/gear are affordable from the start and one uncommon magic item per party is reachable around Chapter 2–3.
const MOD = "arkane-1920s";
const PRICES = {
  "gun-derringer": 10, "gun-revolver": 20, "gun-auto45": 35, "gun-sawedoff": 20, "gun-shotgun": 30, "gun-rifle": 45, "gun-magicrevolver": 400,
  "ammo-กระสุน .38": 0.05, "ammo-กระสุน .45": 0.05, "ammo-ลูกซอง": 0.1, "ammo-กระสุนไรเฟิล": 0.2, "ammo-กระสุนเพลิง .38": 4, "ammo-กระสุนเงิน .38": 2,
  "melee-knuckles": 2, "melee-switchblade": 3, "melee-razor": 1, "melee-blackjack": 1, "melee-bat": 1, "melee-crowbar": 2, "melee-trenchknife": 5,
  "melee-machete": 4, "melee-canesword": 20, "melee-fireaxe": 5, "melee-magicknuckles": 300,
  "armor-suit": 10, "armor-peacoat": 15, "armor-flight": 35, "armor-vest": 60, "armor-umbrella": 40, "armor-caam": 250, "armor-diving": 150,
  "gear-Speedloader": 2, "gear-ไฟฉายแบตเตอรี่": 2, "gear-ตะเกียงน้ำมัน": 3, "gear-ไฟแช็กทองเหลือง": 0.5, "gear-นาฬิกาพก": 5, "gear-กล้องถ่ายรูปพับได้": 15,
  "gear-ชุดปฐมพยาบาล": 5, "gear-ขวดวิสกี้เถื่อน": 0.5, "gear-ชุดสะเดาะกุญแจ": 15, "gear-หนังสือพิมพ์อาร์คเคนเดลี่": 0.02,
  "magic-brooch": 300, "magic-watch": 250, "magic-goggles": 150, "magic-saltcharm": 200, "magic-fedora": 250, "magic-valise": 300, "magic-salts": 20
};
const BUY = 1.1, SELL = 0.5; // Finch: sells at 110%, buys at 50%

export async function balancePrices(quiet = true) {
  if (!game.users.activeGM?.isSelf) return 0;
  const fix = (items) => items.filter((i) => { const p = PRICES[i.getFlag(MOD, "id")]; return p !== undefined && Number(i.system.price?.value) !== p; })
    .map((i) => ({ _id: i.id, "system.price.value": PRICES[i.getFlag(MOD, "id")], "system.price.denomination": "gp" }));
  let n = 0;
  const w = fix(game.items.contents); if (w.length) { await Item.updateDocuments(w); n += w.length; }
  const shop = game.actors.find((a) => a.getFlag(MOD, "merchant"));
  if (shop) {
    const s = fix(shop.items.contents); if (s.length) { await shop.updateEmbeddedDocuments("Item", s); n += s.length; }
    try {
      const api = game.itempiles?.API;
      if (api?.updateItemPile) await api.updateItemPile(shop, { buyPriceModifier: BUY, sellPriceModifier: SELL, description: `<p>ร้านรับซ่อมนาฬิกา (ตลาดมืด) · ขาย ${Math.round(BUY * 100)}% · รับซื้อ ${Math.round(SELL * 100)}%</p>` });
    } catch (e) { console.warn(MOD, "merchant modifiers", e); }
  }
  if (!quiet || n) ui.notifications.info(`ปรับราคาของให้สมดุลแล้ว ${n} รายการ · ร้านฟินช์ขาย ${Math.round(BUY * 100)}% รับซื้อ ${Math.round(SELL * 100)}%`);
  return n;
}

// ---------- corpse loot: a hostile NPC that drops to 0 HP becomes lootable with some small change
const NATURAL = /^(ตะปบ|กัด|ทุบ|หนวด|ฟาด|แส้จิต|คลื่นห้วงลึก|ตะครุบ)/;
const roll = async (f) => (await new Roll(f).evaluate()).total;
async function changeFor(cr) {
  if (cr >= 2) return { gp: await roll("2d6+2"), sp: await roll("1d10"), cp: await roll("2d10") };
  if (cr >= 0.5) return { gp: await roll("1d4"), sp: await roll("1d6"), cp: await roll("2d10") };
  return { gp: 0, sp: await roll("1d6"), cp: await roll("3d10") };
}
async function onNpcDown(actor, changes) {
  if (!game.users.activeGM?.isSelf || !game.settings.get(MOD, "corpseLoot")) return;
  const hp = foundry.utils.getProperty(changes, "system.attributes.hp.value");
  if (hp === undefined || hp > 0 || actor.type !== "npc" || actor.getFlag(MOD, "tutorial") || actor.getFlag(MOD, "merchant")) return;
  const tok = actor.isToken ? actor.token : actor.getActiveTokens(false, true)[0];
  if (!tok || tok.disposition !== -1 || tok.getFlag(MOD, "looted")) return;
  if (tok.parent?.name?.startsWith("ฉากซ้อม")) return;
  await tok.setFlag(MOD, "looted", true);
  const c = await changeFor(Number(actor.system.details?.cr ?? 0));
  const cur = actor.system.currency ?? {};
  await actor.update({ "system.currency": { ...cur, gp: (cur.gp ?? 0) + c.gp, sp: (cur.sp ?? 0) + c.sp, cp: (cur.cp ?? 0) + c.cp } });
  // natural attacks are not loot (only for this token's own copy)
  if (actor.isToken) { const nat = actor.items.filter((i) => NATURAL.test(i.name)).map((i) => i.id); if (nat.length) await actor.deleteEmbeddedDocuments("Item", nat); }
  const api = game.itempiles?.API;
  if (api?.turnTokensIntoItemPiles && game.settings.get(MOD, "corpseLootPile")) {
    try { await api.turnTokensIntoItemPiles([tok], { pileSettings: { enabled: true, type: "pile", deleteWhenEmpty: false, displayOne: false, showItemName: false } }); }
    catch (e) { console.warn(MOD, "corpse pile", e); }
  }
  const money = [c.gp ? `$${c.gp}` : "", c.sp ? `${c.sp} ไดม์` : "", c.cp ? `${c.cp} เซนต์` : ""].filter(Boolean).join(" ");
  ChatMessage.create({ whisper: game.users.filter((u) => u.isGM).map((u) => u.id),
    content: `<div class="rw-card"><div class="rw-title">ค้นศพ: ${actor.name}</div>ในกระเป๋ามีเศษเงิน ${money}${api ? " · ผู้เล่นดับเบิลคลิกศพเพื่อค้นของ" : ""}</div>` });
}

export function registerEconomy() {
  game.settings.register(MOD, "corpseLoot", { name: "ค้นศพได้เศษเงิน", hint: "ศัตรูที่ล้ม (HP 0) มีเศษเงินตามความแกร่ง (ไม่นับฉากซ้อม)", scope: "world", config: true, type: Boolean, default: true });
  game.settings.register(MOD, "corpseLootPile", { name: "ค้นศพ: ดับเบิลคลิกศพเพื่อค้น (Item Piles)", hint: "เปลี่ยนศพศัตรูเป็นกองของที่ผู้เล่นดับเบิลคลิกค้นเองได้", scope: "world", config: true, type: Boolean, default: true });
  Hooks.on("updateActor", (actor, changes) => { onNpcDown(actor, changes).catch((e) => console.warn(MOD, "corpse loot", e)); });
  // unlinked tokens: damage lands on the token's delta
  Hooks.on("updateToken", (doc, ch) => {
    const hp = foundry.utils.getProperty(ch, "delta.system.attributes.hp.value");
    if (hp !== undefined && doc.actor) onNpcDown(doc.actor, { system: { attributes: { hp: { value: hp } } } }).catch((e) => console.warn(MOD, "corpse loot", e));
  });
}
