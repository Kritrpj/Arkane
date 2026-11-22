// Black-market merchant: one NPC who sells Arkane gear through the Item Piles module (merchant mode).
// Without Item Piles the NPC still exists with a priced inventory; the DM trades by hand.
const MOD = "arkane-1920s";
const P = (s) => `<p>${s}</p>`;
const NAME = "ฟินช์ ลิ้นทอง (พ่อค้าตลาดมืด)";

// [item flag id, stock (0 = unlimited), chapter in which the shelf opens]. Finch only stocks what a fence could get at that point of the story.
const STOCK = [
  // Chapter 1-2: street basics
  ["gun-derringer", 2, 1], ["gun-revolver", 3, 1], ["gun-auto45", 1, 1], ["ammo-กระสุน .38", 0, 1], ["ammo-กระสุน .45", 0, 1],
  ["melee-knuckles", 3, 1], ["melee-switchblade", 3, 1], ["melee-razor", 2, 1], ["melee-blackjack", 2, 1],
  ["armor-suit", 2, 1], ["armor-peacoat", 2, 1],
  ["gear-Speedloader", 4, 1], ["gear-ไฟฉายแบตเตอรี่", 3, 1], ["gear-ตะเกียงน้ำมัน", 2, 1], ["gear-ไฟแช็กทองเหลือง", 3, 1], ["gear-ชุดปฐมพยาบาล", 3, 1], ["gear-ขวดวิสกี้เถื่อน", 0, 1], ["gear-ชุดสะเดาะกุญแจ", 2, 1],
  ["magic-salts", 3, 1],
  // Chapter 3: after the warehouse job (Finch has new contacts)
  ["gun-sawedoff", 1, 3], ["gun-shotgun", 1, 3], ["ammo-ลูกซอง", 0, 3], ["melee-trenchknife", 1, 3], ["melee-machete", 2, 3], ["armor-vest", 2, 3], ["armor-flight", 1, 3],
  ["gear-กล้องถ่ายรูปพับได้", 1, 3], ["ammo-กระสุนเพลิง .38", 6, 3], ["magic-fedora", 1, 3],
  // Chapter 4: late-game stock and magic
  ["gun-rifle", 1, 4], ["ammo-กระสุนไรเฟิล", 0, 4], ["ammo-กระสุนเงิน .38", 12, 4], ["melee-canesword", 1, 4], ["armor-umbrella", 1, 4], ["armor-caam", 1, 4],
  ["magic-brooch", 1, 4], ["magic-watch", 1, 4], ["magic-goggles", 1, 4], ["magic-saltcharm", 2, 4], ["magic-valise", 1, 4], ["melee-magicknuckles", 1, 4], ["gun-magicrevolver", 1, 4]
];
const stage = () => Number(game.settings.get(MOD, "shopStage") ?? 2);

const BIO = [
  "<h3>ฟินช์ \"ลิ้นทอง\" แกรบเบิล</h3>",
  P("ก๊อบลินตัวเล็ก ใส่สูทลายตารางที่ตัดใหญ่กว่าตัวสองไซซ์ ฟันทองสามซี่ แว่นตาข้างเดียวเลนส์อำพัน พูดเร็ว ยิ้มตลอด นับเงินด้วยนิ้วที่ไวกว่าตา"),
  P("<b>ที่ตั้ง:</b> ห้องใต้ป้ายร้านรับซ่อมนาฬิกาในตรอกหลังบาร์ The Rusty Wand · เปิดเฉพาะหลังพลบค่ำ · เคาะประตูสามครั้งแล้วพูดว่า <b>\"มาซ่อมนาฬิกาที่เดินถอยหลัง\"</b>"),
  P("<b>ตอนนี้:</b> บาร์ถูก C.A.A.M. ปิดทาง ฟินช์เลยย้ายมาตั้งแผงรับซ่อมนาฬิกาในซอยแคบระหว่างโกดัง 2 กับโกดัง 4 (หลังโรงเตี๊ยม) ของที่ขายมีตามช่วงเรื่อง ไม่ได้มีครบทุกอย่าง · ประตูเหล็กท้ายซอยล็อกอยู่ ฟินช์ถือกุญแจ"),
  P("<b>สังกัด:</b> ส่งส่วนแบ่งให้ซินดิเคทเหรียญจม (Sunken Coin) ทุกสัปดาห์ ใครทำเรื่องในร้านเขา เท่ากับมีเรื่องกับซินดิเคท"),
  P("<b>ราคา:</b> ขาย 125% ของราคาปกติ · รับซื้อของ 40% · ไม่ถามที่มาของของ แต่จำหน้าคนขายทุกคน"),
  P("<b>เล่นบทบาท:</b> เรียกทุกคนว่า \"ลูกค้าคนพิเศษ\" · ชอบต่อราคา ถ้าผู้เล่นต่อสำเร็จ (Persuasion DC 14) ลดได้ 10% ครั้งเดียวต่อคืน · ถ้าข่มขู่ (Intimidation) เขาจะยิ้มแล้วกดกริ่งใต้โต๊ะ อันธพาลซินดิเคท 2 คนจะมาภายใน 1 นาที"),
  P("<b>ข่าวที่ขายได้ ($5 ต่อเรื่อง):</b> ใครซื้อกระสุนเงินไปเยอะช่วงนี้ (C.A.A.M.) · ทำไมคนงานท่าเรือหายตัว · ใครรับซื้อเหรียญเปียกราคาสูง"),
  P("<b>ความลับ (DM):</b> เขาเคยรับซื้อไข่มุกดำจากแม็คก่อนแม็คกลายร่าง และขายต่อให้ลูกค้าที่ไม่ยอมเปิดหน้า เขากลัวทะเลมาก ไม่ยอมเปิดหน้าต่างด้านที่หันไปทางท่าเรือ"),
  P("<b>ค่าสถานะ:</b> Goblin · AC 13 · HP 12 · ความเร็ว 30 ฟุต · STR 8 DEX 15 CON 10 INT 14 WIS 12 CHA 16 · Deception +7 Insight +5 Persuasion +7 · ใต้เคาน์เตอร์มีเดอร์ริงเจอร์ (+4, 1d6+2) · Nimble Escape: Disengage หรือ Hide เป็น Bonus Action")
].join("");

function ipFlags() {
  const ip = game.itempiles;
  return { pilePath: ip?.flags?.PILE ?? "flags.item-piles.data", itemPath: ip?.flags?.ITEM ?? "flags.item-piles.item",
    pileDefaults: ip?.pile_flag_defaults ?? ip?.API?.PILE_DEFAULTS ?? {}, itemDefaults: ip?.item_flag_defaults ?? ip?.API?.ITEM_DEFAULTS ?? {},
    merchant: ip?.pile_types?.MERCHANT ?? "merchant" };
}
function setIf(obj, defaults, key, value) { if (!Object.keys(defaults).length || key in defaults) obj[key] = value; }

// Item Piles 3.x ships without D&D 5e settings (they live in the add-on "Item Piles: D&D 5e"). Without them every item shows
// "Free" and no quantity. When the add-on is missing, fill in the minimum here: price/quantity attributes and gp/sp/cp.
export async function ensureItemPiles(quiet = false) {
  const api = game.itempiles?.API;
  if (!api || !game.user.isGM) return false;
  const did = [];
  try {
    if (!api.ITEM_QUANTITY_ATTRIBUTE) { await api.setItemQuantityAttribute("system.quantity"); did.push("จำนวนของ"); }
    if (!api.ITEM_PRICE_ATTRIBUTE) { await api.setItemPriceAttribute("system.price.value"); did.push("ราคา (gp)"); }
    if (!api.CURRENCIES?.length) {
      const c = (name, ab, path, rate, primary) => ({ type: "attribute", name, img: "icons/svg/coins.svg", abbreviation: `{#}${ab}`, data: { path }, primary, exchangeRate: rate });
      await api.setCurrencies([c("ทอง (gp)", "gp", "system.currency.gp", 1, true), c("เงิน (sp)", "sp", "system.currency.sp", 0.1, false), c("ทองแดง (cp)", "cp", "system.currency.cp", 0.01, false)]);
      did.push("สกุลเงิน gp/sp/cp");
    }
  } catch (e) { console.warn(MOD, "ensureItemPiles", e); ui.notifications.warn("ตั้งค่า Item Piles ไม่สำเร็จ ดู Console (F12)"); return false; }
  if (did.length) ui.notifications.info(`ตั้งค่า Item Piles ให้แล้ว: ${did.join(", ")} · ปิดแล้วเปิดหน้าต่างร้านใหม่`);
  else if (!quiet) ui.notifications.info("Item Piles ตั้งค่าราคา/จำนวน/สกุลเงินครบอยู่แล้ว");
  return did.length > 0;
}

export async function createBlackMarket() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  await ensureItemPiles(true);
  const hasIP = game.modules.get("item-piles")?.active;
  const { pilePath, itemPath, pileDefaults, itemDefaults, merchant } = ipFlags();
  // items: copy from the Arkane world items (create them first if missing)
  const byId = (id) => game.items.find((i) => i.getFlag(MOD, "id") === id);
  if (!byId("gun-revolver")) { try { await game.arkane?.createItems?.(); } catch {} }
  const items = [], missing = [];
  const st = stage();
  for (const [id, qty, from] of STOCK) {
    if (from > st) continue;
    const src = byId(id);
    if (!src) { missing.push(id); continue; }
    const d = src.toObject(); delete d._id; delete d.folder;
    if ("quantity" in (d.system ?? {})) d.system.quantity = qty || (d.type === "consumable" ? 50 : 10);
    if (d.system?.equipped) d.system.equipped = false;
    if (hasIP) {
      const f = foundry.utils.deepClone(itemDefaults);
      if (!qty) setIf(f, itemDefaults, "infiniteQuantity", typeof itemDefaults.infiniteQuantity === "string" ? "yes" : true);
      foundry.utils.setProperty(d, itemPath, f);
    }
    items.push(d);
  }
  let actor = game.actors.find((a) => a.getFlag(MOD, "merchant"));
  const folder = game.folders.find((f) => f.name === "Arkane 1920s · NPC Chapter 1" && f.type === "Actor");
  if (!actor) {
    actor = await Actor.create({
      name: NAME, type: "npc", folder: folder?.id, img: `modules/${MOD}/npcs/fence.webp`,
      system: {
        abilities: { str: { value: 8 }, dex: { value: 15 }, con: { value: 10 }, int: { value: 14 }, wis: { value: 12 }, cha: { value: 16 } },
        attributes: { ac: { calc: "flat", flat: 13 }, hp: { value: 12, max: 12 }, movement: { walk: 30 } },
        details: { cr: 0.5, biography: { value: BIO } }, currency: { gp: 400, sp: 50, cp: 100 }
      },
      prototypeToken: { name: "ฟินช์ ลิ้นทอง", actorLink: true, disposition: 0, displayName: 30, texture: { src: `modules/${MOD}/npcs/fence-token.webp` } },
      ownership: { default: CONST.DOCUMENT_OWNERSHIP_LEVELS.LIMITED },
      flags: { [MOD]: { merchant: true } }
    });
  } else {
    // restock: replace the shop shelf with a fresh copy
    const old = actor.items.filter((i) => i.getFlag(MOD, "id")).map((i) => i.id);
    if (old.length) await actor.deleteEmbeddedDocuments("Item", old);
  }
  await actor.createEmbeddedDocuments("Item", items);
  try { await actor.update({ "system.details.biography.value": BIO }); } catch {}
  if (hasIP) {
    const data = foundry.utils.deepClone(pileDefaults);
    const set = (k, v) => setIf(data, pileDefaults, k, v);
    set("enabled", true); set("type", merchant);
    set("merchantImage", `modules/${MOD}/npcs/fence.webp`);
    set("buyPriceModifier", 1.25); set("sellPriceModifier", 0.4);
    set("infiniteQuantity", false); set("infiniteCurrencies", false);
    set("displayQuantity", "yes"); set("purchaseOnly", false); set("hideItemsWithZeroCost", false); set("keepZeroQuantity", false);
    set("description", "<p>ร้านรับซ่อมนาฬิกา (ตลาดมืด) · ขาย 125% · รับซื้อ 40%</p>");
    try {
      await actor.update({ [pilePath]: data });
      if (game.itempiles?.API?.updateItemPile) { try { await game.itempiles.API.updateItemPile(actor, data); } catch {} }
    } catch (e) { console.error(MOD, "item piles merchant", e); }
  }
  ui.notifications.info(`${NAME}: วางของ ${items.length} รายการ${hasIP ? " · เปิดร้านแบบ Item Piles แล้ว" : " · ยังไม่ได้เปิด Item Piles (ซื้อขายด้วยมือได้)"}${missing.length ? ` · หาไม่เจอ ${missing.length}` : ""}`);
  if (missing.length) console.warn(MOD, "merchant missing items", missing);
  actor.sheet?.render(true);
  return actor;
}

// DM macro: set which chapter Finch's shelf is stocked for, then restock him
export async function setShopStage() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const cur = Number(game.settings.get(MOD, "shopStage") ?? 2);
  const r = await foundry.applications.api.DialogV2.wait({ window: { title: "ร้านฟินช์: ตั้งด่านสินค้า" },
    content: `<div class="rw-form"><div class="form-group"><label>ด่านปัจจุบัน</label><select name="s">${[[2, "Chapter 1–2 · ของข้างถนน (ปืนพก มีด ชุดสูท ไฟฉาย)"], [3, "Chapter 3 · เพิ่มลูกซอง ปืนยาว เสื้อเกราะ กระสุนเพลิง"], [4, "Chapter 4 · ของหายาก ของวิเศษ กระสุนเงิน ไรเฟิล"]].map(([v, t]) => `<option value="${v}" ${v === cur ? "selected" : ""}>${t}</option>`).join("")}</select></div>
      <p class="rw-hint">กดตกลงแล้วระบบเปลี่ยนของบนชั้นของฟินช์ทันที (รีสต็อกใหม่)</p></div>`,
    buttons: [{ action: "ok", label: "ตกลง", default: true, callback: (e, b) => Number(new FormDataExtended(b.form).object.s) }, { action: "cancel", label: "ยกเลิก" }], rejectClose: false });
  if (!r || r === "cancel") return;
  await game.settings.set(MOD, "shopStage", r);
  await createBlackMarket();
}
