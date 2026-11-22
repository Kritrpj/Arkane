// 1920s firearms, ammunition, gear, story items and Valerian currency for dnd5e (4.x+ activities, tested logic only)
const MOD = "arkane-1920s";
import { gearList } from "./gear.js?v=21";
const P = (s) => `<p>${s}</p>`;

// ---------- currency: same D&D ratios, Valerian names
export function setupCurrency() {
  const c = CONFIG.DND5E?.currencies;
  if (!c) return;
  const names = {
    pp: ["ธนบัตรสิบดอลลาร์", "$10"], gp: ["ดอลลาร์วาเลอเรีย", "$"], ep: ["ครึ่งดอลลาร์", "50¢"],
    sp: ["ไดม์ (10 เซนต์)", "10¢"], cp: ["เซนต์", "¢"]
  };
  for (const [k, [label, abbr]] of Object.entries(names)) if (c[k]) { c[k].label = label; c[k].abbreviation = abbr; }
}

// ---------- data
const GUNS = [
  { key: "derringer", name: "เดอร์ริงเจอร์", img: "icons/weapons/guns/gun-pistol-flintlock-metal.webp", dmg: [1, 6], range: [20, 60], cap: 2, ammo: ".38", props: ["lgt"], mastery: "nick", price: 10, weight: 1,
    desc: "ปืนพกสองลำกล้องตัวเล็ก ซ่อนในแขนเสื้อได้ (ได้เปรียบ Sleight of Hand ตอนซ่อน) บรรจุ 2 นัด" },
  { key: "revolver", name: "ลูกโม่ .38", img: "icons/weapons/guns/gun-pistol-flintlock-white.webp", dmg: [1, 10], range: [40, 120], cap: 6, ammo: ".38", props: [], mastery: "vex", price: 25, weight: 2,
    desc: "ลูกโม่หกนัด ปืนที่พบบ่อยที่สุดในอาร์คเคน บรรจุใหม่ใช้แทนการโจมตี 1 ครั้ง (มี Speedloader ใช้ Bonus Action)" },
  { key: "auto45", name: "ปืนพกอัตโนมัติ .45", img: "icons/weapons/guns/gun-pistol-brass.webp", dmg: [1, 10], range: [50, 150], cap: 7, ammo: ".45", props: [], mastery: "vex", price: 40, weight: 3,
    desc: "ปืนพกใช้แม็กกาซีน 7 นัด เปลี่ยนแม็กเป็น Bonus Action" },
  { key: "sawedoff", name: "ลูกซองตัดสั้น", img: "modules/arkane-1920s/items/gun-sawedoff.webp", dmg: [2, 4], range: [15, 30], cap: 2, ammo: "shell", props: [], mastery: "push", price: 20, weight: 4,
    desc: "ลูกซองสองลำกล้องตัดสั้น ซ่อนใต้เสื้อโค้ตได้" },
  { key: "shotgun", name: "ลูกซองสองลำกล้อง", img: "icons/weapons/guns/gun-blunderbuss-bronze.webp", dmg: [2, 6], range: [30, 60], cap: 2, ammo: "shell", props: ["two"], mastery: "push", price: 30, weight: 7,
    desc: "ลูกซองยาวสองลำกล้อง แบบที่แจ็คซ่อนไว้ใต้เคาน์เตอร์" },
  { key: "rifle", name: "ไรเฟิลลูกเลื่อน", img: "icons/weapons/guns/rifle-brown.webp", dmg: [1, 12], range: [80, 240], cap: 5, ammo: "rifle", props: ["two", "hvy"], mastery: "slow", price: 50, weight: 9,
    desc: "ไรเฟิลทหารแบบลูกเลื่อน บรรจุ 5 นัด" }
];
const AMMO = [
  { key: ".38", name: "กระสุน .38", qty: 20, price: 0.05, desc: "กล่องละ 20 นัด ราคา $1 ใช้กับลูกโม่ .38 และเดอร์ริงเจอร์" },
  { key: ".45", name: "กระสุน .45", qty: 20, price: 0.05, desc: "กล่องละ 20 นัด ราคา $1" },
  { key: "shell", name: "ลูกซอง", qty: 10, price: 0.1, desc: "10 นัด ราคา $1" },
  { key: "rifle", name: "กระสุนไรเฟิล", qty: 10, price: 0.2, desc: "10 นัด ราคา $2" },
  { key: ".38", name: "กระสุนเพลิง .38", qty: 3, price: 4, special: "fire", desc: "ตลาดมืดท่าเรือ นัดละ $4 ดาเมจเปลี่ยนเป็น Fire (ยิงโดนบอสแล้ว AC เหลือ 11) บรรจุเป็นนัดแรกของโม่" },
  { key: ".38", name: "กระสุนเงิน .38", qty: 6, price: 2, special: "silver", desc: "นัดละ $2 นับเป็นอาวุธ Silvered" }
];
const MELEE = [
  // key, name, img, dice, type, base, props, mastery, price, versatile die, desc
  ["knuckles", "สนับมือทองเหลือง", "icons/weapons/fist/fist-knuckles-brass.webp", [1, 4], "bludgeoning", "simpleM", ["lgt"], "nick", 2, null, "ใส่แล้วต่อยหนักขึ้น ซ่อนในกระเป๋าเสื้อได้ อาวุธมาตรฐานของลูกน้องซินดิเคท"],
  ["switchblade", "มีดพับสปริง", "modules/arkane-1920s/items/melee-dagger.webp", [1, 4], "piercing", "simpleM", ["fin", "lgt", "thr"], "nick", 3, null, "กดปุ่มใบมีดเด้งออก ขว้างได้ 20/60 ฟุต"],
  ["razor", "มีดโกนพับ", "modules/arkane-1920s/items/melee-razor.webp", [1, 4], "slashing", "simpleM", ["fin", "lgt"], "nick", 1, null, "มีดโกนช่างตัดผม ไม่มีใครสงสัยถ้าพกติดตัว"],
  ["blackjack", "กระบองหนัง (Sap)", "icons/weapons/clubs/club-simple-black.webp", [1, 4], "bludgeoning", "simpleM", ["lgt"], "sap", 1, null, "ถุงหนังใส่ตะกั่ว ตีให้สลบ (ลด HP เหลือ 0 แล้วเลือกให้หมดสติแทนตายได้)"],
  ["bat", "ไม้เบสบอล", "icons/weapons/clubs/club-baton-brown.webp", [1, 6], "bludgeoning", "simpleM", ["ver"], "push", 1, 8, "สองมือ 1d8"],
  ["crowbar", "ชะแลง", "icons/tools/hand/pickaxe-steel-white.webp", [1, 6], "bludgeoning", "simpleM", ["ver"], "sap", 2, 8, "สองมือ 1d8 · ได้เปรียบ Athletics เวลางัดประตูหรือลัง"],
  ["trenchknife", "มีดสนามเพลาะ", "icons/weapons/daggers/dagger-jeweled-black.webp", [1, 6], "piercing", "simpleM", ["fin", "lgt"], "vex", 6, null, "มีดทหารผ่านศึกมีสนับมือในตัว ของที่ระลึกจากสงคราม"],
  ["machete", "มีดพร้า", "icons/weapons/swords/scimitar-worn-blue.webp", [1, 6], "slashing", "martialM", ["fin", "lgt"], "nick", 5, null, "มีดของคนงานท่าเรือ ใช้ตัดเชือกและตาข่าย"],
  ["canesword", "ไม้เท้าซ่อนดาบ", "modules/arkane-1920s/items/melee-canesword.webp", [1, 8], "piercing", "martialM", ["fin"], "vex", 25, null, "ดูเหมือนไม้เท้าสุภาพบุรุษ ดึงด้ามออกเป็นดาบเรียว"],
  ["fireaxe", "ขวานดับเพลิง", "modules/arkane-1920s/items/melee-fireaxe.webp", [1, 8], "slashing", "martialM", ["ver"], "topple", 5, 10, "สองมือ 1d10 · ใช้พังประตูไม้ได้"]
];
const GEAR = [
  ["Speedloader", "icons/tools/hand/lockpicks-steel-grey.webp", 1, "ตัวบรรจุเร็วสำหรับลูกโม่ บรรจุใหม่เป็น Bonus Action"],
  ["ไฟฉายแบตเตอรี่", "icons/sundries/lights/torch-black.webp", 2, "แสงสว่าง 30 ฟุต (Bright) อีก 30 ฟุต (Dim) ส่องเป็นลำ ใช้ได้ 6 ชั่วโมงต่อถ่าน"],
  ["ตะเกียงน้ำมัน", "icons/sundries/lights/lantern-iron-yellow.webp", 5, "แสง 30/30 ฟุต ขว้างแตกแล้วไฟลุกในรัศมี 5 ฟุต (1d4 Fire) ใช้กับจุดอ่อนของบอสได้"],
  ["ไฟแช็กทองเหลือง", "modules/arkane-1920s/items/gear-lighter.webp", 0.5, "จุดไฟได้ทันที"],
  ["นาฬิกาพก", "modules/arkane-1920s/items/gear-pocketwatch.webp", 5, "บอกเวลาแม่นยำ"],
  ["กล้องถ่ายรูปพับได้", "icons/tools/scribal/lens-blue.webp", 15, "ถ่ายรูปหลักฐานขาวดำ ล้างรูป 1 วัน"],
  ["ชุดปฐมพยาบาล", "icons/consumables/potions/bottle-round-corked-red.webp", 5, "เหมือน Healer's Kit ใช้ได้ 10 ครั้ง"],
  ["ขวดวิสกี้เถื่อน", "icons/consumables/drinks/alcohol-spirits-bottle-blue.webp", 0.5, "ดื่มแล้วได้เปรียบเซฟความกลัวครั้งถัดไป แต่เสียเปรียบเช็ก DEX 1 ชั่วโมง"],
  ["ชุดสะเดาะกุญแจ", "icons/tools/hand/lockpicks-steel-grey.webp", 25, "ใช้เป็น Thieves' Tools"],
  ["หนังสือพิมพ์อาร์คเคนเดลี่", "icons/sundries/documents/document-sealed-brown-red.webp", 0.02, "ข่าวลือประจำวัน DM ใส่ข่าวตามเส้นเวลา Nexus"]
];
const STORY = [
  ["ตั๋วรับของโกดัง 4", "icons/sundries/documents/document-torn-diagram-tan.webp", "ตั๋วรับสินค้าของซินดิเคท ระบุโกดังหมายเลข 4 ท่าเรืออุตสาหกรรม (พาไป Chapter 2)"],
  ["เหรียญที่เปียกตลอดเวลา", "icons/commodities/currency/coin-embossed-octopus-gold.webp", "เหรียญโบราณที่ชื้นและคาวปลาตลอดเวลา สัญลักษณ์ของซินดิเคทเหรียญจมน้ำ"],
  ["หลอดยาวิปลาสเปล่า", "icons/consumables/potions/vial-cork-empty.webp", "หลอดแก้วเปล่ามีคราบเขียวเรืองแสง"],
  ["จดหมายจ้างวาน (A.P.)", "icons/sundries/documents/envelope-sealed-red-tan.webp", "จดหมายที่อาเธอร์ส่งจ้างไกด์ (ของ Vivian Spencer)"],
  ["ใบเสร็จ นพ. ก.", "icons/sundries/documents/document-official-capital.webp", "ใบเสร็จรับเงินลงชื่อย่อ นพ. ก. พบในห้องเช่าอาเธอร์ (ปูทาง Chapter 3)"],
  ["จดหมายสั่งของถึงโกดัง 4", "icons/sundries/documents/document-letter-blue.webp", "พบในรังของแม็ค ระบุของที่จะมาถึงโกดัง 4 (เบาะแส Chapter 2)"]
];

function validProps(list) {
  const ok = CONFIG.DND5E?.validProperties?.weapon;
  return ok ? list.filter((p) => ok.has?.(p) ?? true) : list;
}
async function folder(name) {
  return game.folders.find((f) => f.name === name && f.type === "Item") ?? Folder.create({ name, type: "Item", color: "#9A6B2C" });
}
async function makeItem(data) {
  const old = game.items.find((i) => i.getFlag(MOD, "id") === data.flags[MOD].id);
  if (old) return old;
  try { return await Item.create(data); } catch (e) { console.error(MOD, "item", data.name, e); }
}
export async function createItems() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const fGun = await folder("Arkane 1920s · ปืนและกระสุน"), fGear = await folder("Arkane 1920s · ของใช้ยุค 1920s"), fStory = await folder("Arkane 1920s · ของสำคัญ Chapter 1");
  let n = 0;
  for (const g of GUNS) {
    const item = await makeItem({
      name: g.name, type: "weapon", img: g.img, folder: fGun.id,
      flags: { [MOD]: { id: "gun-" + g.key, capacity: g.cap, ammo: g.ammo } },
      system: {
        description: { value: P(g.desc) + P(`บรรจุ ${g.cap} นัด · ยิง 1 นัดใช้ 1 ช่อง Uses · ยิงหมดแล้วกดมาโคร "บรรจุกระสุน"`) },
        type: { value: "martialR" }, properties: validProps(g.props), mastery: g.mastery,
        damage: { base: { number: g.dmg[0], denomination: g.dmg[1], types: ["piercing"] } },
        range: { value: g.range[0], long: g.range[1], units: "ft" },
        uses: { max: String(g.cap), spent: 0, recovery: [] },
        price: { value: g.price, denomination: "gp" }, weight: { value: g.weight, units: "lb" }
      }
    });
    // make each shot spend one round from the cylinder/magazine (Uses)
    try {
      if (item) await ensureAttack(item);
    } catch (e) { console.warn(MOD, "activity", g.name, e); }
    if (item) n++;
  }
  for (const a of AMMO) {
    const id = "ammo-" + a.name;
    if (await makeItem({ name: a.name, type: "consumable", img: "icons/weapons/ammunition/bullets-cartridge-shell-gray.webp", folder: fGun.id,
      flags: { [MOD]: { id, ammo: a.key, special: a.special ?? null } },
      system: { description: { value: P(a.desc) }, type: { value: "ammo" }, quantity: a.qty, price: { value: a.price, denomination: "gp" }, weight: { value: 0.02, units: "lb" } } })) n++;
  }
  const fMelee = await folder("Arkane 1920s · อาวุธประชิด");
  for (const [key, name, img, dmg, dtype, base, props, mastery, price, vers, desc] of MELEE) {
    const sys = { description: { value: P(desc) }, type: { value: base }, properties: validProps(props), mastery,
      damage: { base: { number: dmg[0], denomination: dmg[1], types: [dtype] } }, price: { value: price, denomination: "gp" }, weight: { value: 1, units: "lb" } };
    if (vers) sys.damage.versatile = { number: 1, denomination: vers, types: [dtype] };
    if (props.includes("thr")) sys.range = { value: 20, long: 60, units: "ft" };
    const item = await makeItem({ name, type: "weapon", img, folder: fMelee.id, flags: { [MOD]: { id: "melee-" + key } }, system: sys });
    if (item) { await ensureAttack(item); n++; }
  }
  // clothing, armor, magic & Magitech items
  const fMagic = await folder("Arkane 1920s · ชุดและของวิเศษ");
  const rv = GUNS.find((g) => g.key === "revolver");
  const magicRev = { name: "ลูกโม่เงินสลักอักขระ +1", type: "weapon", img: rv.img,
    flags: { [MOD]: { id: "gun-magicrevolver", capacity: 6, ammo: ".38" } },
    system: { description: { value: P("ลูกโม่ .38 ตัวเงินสลักอักขระกันสิ่งชั่วร้าย · โจมตีและดาเมจ +1 · นับเป็นอาวุธเวทและอาวุธเงิน (Silvered) · บรรจุ 6 นัด") },
      type: { value: "martialR" }, properties: validProps(["mgc", "sil"]), magicalBonus: 1, rarity: "uncommon", mastery: "vex",
      damage: { base: { number: 1, denomination: 10, types: ["piercing"] } }, range: { value: 40, long: 120, units: "ft" },
      uses: { max: "6", spent: 0, recovery: [] }, price: { value: 800, denomination: "gp" }, weight: { value: 2, units: "lb" } } };
  for (const d of gearList({ revolver: magicRev })) {
    const item = await makeItem({ ...d, folder: fMagic.id });
    if (item) { if (item.type === "weapon") await ensureAttack(item); n++; }
  }
  for (const [name, img, price, desc] of GEAR) {
    if (await makeItem({ name, type: "loot", img, folder: fGear.id, flags: { [MOD]: { id: "gear-" + name } },
      system: { description: { value: P(desc) }, price: { value: price, denomination: "gp" }, weight: { value: 1, units: "lb" } } })) n++;
  }
  for (const [name, img, desc] of STORY) {
    if (await makeItem({ name, type: "loot", img, folder: fStory.id, flags: { [MOD]: { id: "story-" + name } },
      system: { description: { value: P(desc) }, price: { value: 0, denomination: "gp" } } })) n++;
  }
  ui.notifications.info(`สร้างปืน กระสุน ของใช้ และของสำคัญแล้ว ${n} ชิ้น (แท็บ Items)`);
}

// ---------- reload macro: refill a gun's Uses from matching ammo in the same inventory
export async function reload(actorArg) {
  const actor = actorArg ?? canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor) return ui.notifications.warn("เลือกโทเคนก่อน หรือผูกตัวละครกับผู้ใช้");
  const guns = actor.items.filter((i) => i.type === "weapon" && i.getFlag(MOD, "capacity"));
  if (guns.length && isGunExpert(actor)) return ui.notifications.info(`${actor.name} ถนัดปืน ไม่ต้องบรรจุกระสุน ยิงได้ตลอด`);
  if (!guns.length) return ui.notifications.warn(`${actor.name} ไม่มีปืน`);
  const out = [];
  for (const g of guns) {
    const cap = Number(g.getFlag(MOD, "capacity")), spent = Number(g.system.uses?.spent ?? 0);
    if (!spent) continue;
    const ammo = actor.items.find((i) => i.type === "consumable" && i.getFlag(MOD, "ammo") === g.getFlag(MOD, "ammo") && (i.system.quantity ?? 0) > 0);
    if (!ammo) { out.push(`${g.name}: ไม่มีกระสุนเหลือ`); playSfx("dryfire", true); continue; }
    const take = Math.min(spent, ammo.system.quantity);
    await g.update({ "system.uses.spent": spent - take });
    playSfx(RELOAD_SOUND[g.getFlag(MOD, "ammo")] ?? "reload-revolver", true);
    await ammo.update({ "system.quantity": ammo.system.quantity - take });
    out.push(`${g.name}: บรรจุ ${take} นัด (${cap - spent + take}/${cap}) ใช้ ${ammo.name} เหลือ ${ammo.system.quantity - take}`);
  }
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<div class="rw-card"><div class="rw-title">บรรจุกระสุน</div>${out.join("<br>") || "ปืนเต็มอยู่แล้ว"}<br><i>ลูกโม่/ลูกซอง/ไรเฟิล ใช้แทนการโจมตี 1 ครั้ง · แม็ก .45 หรือ Speedloader ใช้ Bonus Action</i></div>` });
}

// ---------- combat sound + optional bullet effect
const SND = (f) => `modules/${MOD}/sounds/${f}.ogg`;
const GUN_SOUND = { derringer: "derringer", revolver: "revolver", auto45: "auto45", sawedoff: "shotgun", shotgun: "shotgun", rifle: "rifle" };
const RELOAD_SOUND = { ".38": "reload-revolver", ".45": "reload-magazine", rifle: "reload-magazine", shell: "reload-shotgun" };
export function playSfx(name, broadcast = false) {
  try {
    if (!game.settings.get(MOD, "gunSounds")) return;
    const AH = foundry.audio?.AudioHelper ?? globalThis.AudioHelper;
    AH.play({ src: SND(name), volume: 0.8, autoplay: true, loop: false }, broadcast);
  } catch (e) { console.warn(MOD, "sfx", e); }
}
function gunKeyOf(item) {
  if (!item || item.type !== "weapon") return null;
  const id = item.getFlag?.(MOD, "id");
  if (id?.startsWith("gun-")) return id.slice(4);
  const n = (item.name ?? "").toLowerCase();
  if (/ลูกซอง|shotgun|sawed/.test(n)) return "shotgun";
  if (/ไรเฟิล|rifle|carbine/.test(n)) return "rifle";
  if (/ทอมมี่|tommy|ปืนกล/.test(n)) return "auto45";
  if (/เดอร์ริงเจอร์|derringer/.test(n)) return "derringer";
  if (/ปืน|ลูกโม่|revolver|pistol|\.38|\.45|firearm/.test(n)) return "revolver";
  return null;
}
let lastFx = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const dist = (a, b) => {
  try { return canvas.grid.measurePath([a.center, b.center]).distance; }
  catch { return canvas.grid.measureDistance(a.center, b.center); }
};
function shooterToken(item, tokenId) {
  return (tokenId && canvas.tokens.get(tokenId)) || canvas.tokens.controlled.find((t) => t.actor === item?.actor) || item?.actor?.getActiveTokens?.()[0] || canvas.tokens.controlled[0];
}
function isHit(roll, tgt) {
  if (!roll) return true;
  if (roll.isCritical) return true;
  if (roll.isFumble) return false;
  const ac = tgt?.actor?.system?.attributes?.ac?.value;
  return ac == null ? true : roll.total >= ac;
}
// ---------- floating text over a token, shown to everyone (socket)
const SOCK = `module.${MOD}`;
const COLORS = { warn: "#FFB347", bad: "#FF4B4B", miss: "#C8C8C8", hit: "#FF2A2A" };
function floatText(token, text, kind = "warn", local = false) {
  if (!token) return;
  if (!local) game.socket.emit(SOCK, { t: "text", scene: canvas.scene?.id, token: token.id ?? token.document?.id, text, kind });
  try {
    const tk = token.center ? token : canvas.tokens.get(token.id);
    canvas.interface.createScrollingText(tk.center, text, {
      anchor: CONST.TEXT_ANCHOR_POINTS.TOP, direction: CONST.TEXT_ANCHOR_POINTS.TOP, distance: tk.h * 1.2, duration: 2600,
      fontSize: 34, fill: COLORS[kind] ?? "#FFFFFF", stroke: 0x000000, strokeThickness: 5, jitter: 0
    });
  } catch (e) { console.warn(MOD, "text", e); }
}

// ---------- after the attack roll: sound + bullet, then (on a hit) roll damage and apply it
async function waitDice(msgId) {
  try {
    if (game.dice3d && msgId) await Promise.race([game.dice3d.waitFor3DAnimationByMessageID(msgId), sleep(6000)]);
    else if (game.dice3d) await sleep(2200);
  } catch {}
}
async function fire(item, { tokenId, roll, msgId, act } = {}) {
  if (!item || !["weapon", "spell"].includes(item.type)) return false;
  const key = gunKeyOf(item);
  if (!key) return strike(item, { tokenId, roll, msgId, act });
  if (Date.now() - lastFx < 1500) return true;
  lastFx = Date.now();
  await waitDice(msgId);
  const src = shooterToken(item, tokenId), tgt = [...game.user.targets][0];
  const hit = tgt ? isHit(roll, tgt) : null;
  playSfx(GUN_SOUND[key] ?? "revolver", true);
  if (tgt && game.modules.get("sequencer")?.active && src) {
    try {
      const has = (f) => { try { return !!Sequencer.Database.entryExists(f); } catch { return false; } };
      const want = key === "sawedoff" || key === "shotgun" ? "jb2a.bullet.02.orange" : "jb2a.bullet.01.orange";
      const file = [want, "jb2a.bullet.01.orange", "jb2a.bullet.orange", "jb2a.bullet"].find(has);
      if (file) new Sequence().effect().file(file).atLocation(src).stretchTo(tgt).missed(!hit).play();
      else console.warn(MOD, "JB2A bullet effect not found");
    } catch (e) { console.warn(MOD, "sequencer", e); }
  }
  if (!tgt) return true;
  await sleep(450);
  if (!hit) {
    playSfx("ricochet", true);
    floatText(tgt, roll?.isFumble ? "พลาดเป้า! (1)" : "พลาด!", "miss");
    return true;
  }
  playSfx("hit", true);
  if (roll?.isCritical) floatText(tgt, "คริติคอล!", "hit");
  return autoDamage(item, tgt, roll, act);
}
async function autoDamage(item, tgt, roll, act) {
  if (!tgt || !game.settings.get(MOD, "autoDamage")) return true;
  // roll damage with no dialog
  const activity = act ?? item.system.activities?.find?.((a) => a.type === "attack");
  if (!activity?.rollDamage) return true;
  let dmg;
  try {
    dmg = await activity.rollDamage({ isCritical: !!roll?.isCritical, attackMode: roll?.options?.attackMode, event: new Event("click") }, { configure: false }, {});
  } catch (e) { console.warn(MOD, "rollDamage", e); return true; }
  if (!dmg?.length) return true;
  const msg2 = game.messages.contents.findLast((m) => m.author?.id === game.user.id && m.rolls?.includes(dmg[0]));
  await waitDice(msg2?.id);
  const damages = dmg.map((r) => ({ value: r.total, type: r.options?.type ?? "piercing" }));
  await applyTo(tgt.actor?.uuid ?? tgt.document.uuid, damages);
  return true;
}
// melee / any non-gun weapon: whoosh, then thud or miss, then auto damage
async function strike(item, { tokenId, roll, msgId, act } = {}) {
  if (Date.now() - lastFx < 1500) return true;
  lastFx = Date.now();
  await waitDice(msgId);
  const tgt = [...game.user.targets][0];
  const spell = item.type === "spell";
  const bow = !spell && /ธนู|bow|crossbow/i.test(item.name);
  playSfx(spell ? "spell" : bow ? "bow" : "swing", true);
  if ((spell || bow) && tgt && game.modules.get("sequencer")?.active && act?.attack?.type?.value === "ranged") {
    try {
      const has = (f) => { try { return !!Sequencer.Database.entryExists(f); } catch { return false; } };
      const want = bow ? ["jb2a.arrow.physical.white.01", "jb2a.arrow.physical.white", "jb2a.arrow"] : /eldritch/i.test(item.name) ? ["jb2a.eldritch_blast.purple", "jb2a.eldritch_blast"] : /fire/i.test(item.name) ? ["jb2a.fire_bolt.orange", "jb2a.fire_bolt"] : ["jb2a.magic_missile.purple", "jb2a.magic_missile"];
      const file = [...want, "jb2a.bullet.01.orange"].find(has);
      const src = shooterToken(item, tokenId);
      if (file && src) new Sequence().effect().file(file).atLocation(src).stretchTo(tgt).missed(!isHit(roll, tgt)).play();
    } catch (e) { console.warn(MOD, "spell fx", e); }
  }
  if (!tgt) return true;
  await sleep(250);
  if (!isHit(roll, tgt)) { floatText(tgt, roll?.isFumble ? "พลาดเป้า! (1)" : "พลาด!", "miss"); return true; }
  playSfx(spell ? "hit" : "punch", true);
  if (roll?.isCritical) floatText(tgt, "คริติคอล!", "hit");
  return autoDamage(item, tgt, roll, act);
}
async function applyTo(uuid, damages) {
  const doc = fromUuidSync(uuid);
  const actor = doc?.actor ?? doc;
  if (actor?.isOwner) {
    const list = damages.map((d) => ({ value: d.value, type: d.type, properties: new Set() }));
    try { await actor.applyDamage(list); } catch (e) { console.warn(MOD, "applyDamage", e); await actor.applyDamage(damages.reduce((s, d) => s + d.value, 0)); }
  } else game.socket.emit(SOCK, { t: "apply", uuid, damages });
}

function spellCheck(act, config) {
  const item = act?.item;
  const r = item.system.range ?? {};
  const reach = r.units === "touch" ? 5 : r.units === "ft" ? Number(r.value) || 0 : 0;
  const src = shooterToken(item), tgt = [...game.user.targets][0];
  if (!src) return;
  if (tgt && reach) {
    const d = Math.round(dist(src, tgt));
    if (d > reach) {
      playSfx("warn-impossible", true);
      floatText(src, "เป็นไปไม่ได้ที่จะร่าย! (ไกลเกิน)", "bad");
      ui.notifications.warn(`${tgt.name} อยู่ห่าง ${d} ฟุต ${item.name} ไปได้แค่ ${reach} ฟุต`);
      return false;
    }
  }
  if (act.attack?.type?.value !== "ranged") return;
  const disp = src.document.disposition;
  const near = canvas.tokens.placeables.find((t) => t !== src && disp !== 0 && t.document.disposition === -disp && !t.document.hidden
    && (t.actor?.system?.attributes?.hp?.value ?? 1) > 0 && dist(src, t) <= 5);
  if (!near) return;
  config.disadvantage = true;
  for (const r2 of config.rolls ?? []) { r2.options ??= {}; r2.options.disadvantage = true; }
  playSfx("warn-disadv", true);
  floatText(src, "Disadvantage", "warn");
  ui.notifications.info(`ร่ายแบบเสียเปรียบ: ${near.name} ประชิดตัว`);
}
function meleeCheck(act) {
  const item = act?.item;
  if (!item || item.type !== "weapon" || act.attack?.type?.value !== "melee") return;
  const props = item.system.properties;
  if (props?.has?.("thr")) return; // thrown: dnd5e handles mode
  const reach = props?.has?.("rch") ? 10 : 5;
  const src = shooterToken(item), tgt = [...game.user.targets][0];
  if (!src || !tgt) return;
  const d = Math.round(dist(src, tgt));
  if (d <= reach) return;
  playSfx("warn-impossible", true);
  floatText(src, "เป็นไปไม่ได้ที่จะโจมตี! (ไกลเกิน)", "bad");
  ui.notifications.warn(`${tgt.name} อยู่ห่าง ${d} ฟุต ${item.name} ตีถึงแค่ ${reach} ฟุต เดินเข้าไปก่อน`);
  return false;
}
function rangedInfo(act) {
  const item = act?.item;
  if (!item || item.type !== "weapon") return null;
  const ranged = act.attack?.type?.value === "ranged" || !!gunKeyOf(item);
  if (!ranged && act.attack?.type?.value === "melee") return null;
  if (!ranged) return null;
  const r = item.system.range ?? {};
  const normal = Number(r.value) || 0, long = Number(r.long) || normal;
  return normal ? { item, normal, long } : null;
}
// ---------- before the attack roll: range check with sound + floating text over the shooter
function preAttack(config, dialog) {
  try {
    if (!game.settings.get(MOD, "autoRange")) return;
    const act = config?.subject ?? config?.activity;
    if (act?.item?.type === "spell") return spellCheck(act, config);
    const info = rangedInfo(act);
    if (!info) return meleeCheck(act);
    const src = shooterToken(info.item), tgt = [...game.user.targets][0];
    if (gunKeyOf(info.item) && dialog && game.settings.get(MOD, "skipDialog")) dialog.configure = false;
    if (!src) return;
    const notes = [];
    if (tgt) {
      const d = Math.round(dist(src, tgt));
      if (d > info.long) {
        playSfx("warn-impossible", true);
        floatText(src, "เป็นไปไม่ได้ที่จะยิง!", "bad");
        ui.notifications.warn(`${tgt.name} อยู่ห่าง ${d} ฟุต เกินระยะไกลสุดของ ${info.item.name} (${info.long} ฟุต)`);
        return false;
      }
      if (d > info.normal) notes.push(`ไกลเกินไป ${d}/${info.normal} ฟุต`);
    }
    const disp = src.document.disposition;
    const near = canvas.tokens.placeables.find((t) => t !== src && disp !== 0 && t.document.disposition === -disp && !t.document.hidden
      && (t.actor?.system?.attributes?.hp?.value ?? 1) > 0 && dist(src, t) <= 5);
    if (near) notes.push(`${near.name} ประชิดตัว`);
    if (!notes.length) return; // normal range: nothing shown
    config.disadvantage = true;
    for (const r of config.rolls ?? []) { r.options ??= {}; r.options.disadvantage = true; }
    playSfx("warn-disadv", true);
    floatText(src, "Disadvantage", "warn");
    ui.notifications.info(`ยิงแบบเสียเปรียบ: ${notes.join(", ")}`);
  } catch (e) { console.warn(MOD, "autoRange", e); }
}

// ---------- ammo warnings + "ถนัดปืน" (gun expert: never needs to reload)
export const GUN_EXPERT = "ถนัดปืน (Gun Expert)";
const featExpert = (actor) => !!actor?.items?.some((i) => i.type === "feat" && (i.getFlag?.(MOD, "gunExpert") || /ถนัดปืน|Gunner|Gunslinger/i.test(i.name)));
// gun skill by practice: every shot counts; <15 shots clumsy (-2 to hit, must cast the reload spell), 15-39 steady, 40+ expert (no reload, +proficiency)
const XP_FLAG = "gunXp", XP_TRAINED = 15, XP_EXPERT = 40, RELOAD_FLAG = "gunReloadSpell";
export const gunXp = (actor) => Number(actor?.getFlag?.(MOD, XP_FLAG) || 0);
export function isGunExpert(actor) { return featExpert(actor) || gunXp(actor) >= XP_EXPERT; }
export function gunLevel(actor) { if (isGunExpert(actor)) return 2; return gunXp(actor) >= XP_TRAINED ? 1 : 0; }
export const GUN_XP = { trained: XP_TRAINED, expert: XP_EXPERT };
const gunChat = (actor, text) => ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<div class="rw-card"><div class="rw-title">ฝึกยิงปืน</div>${text}</div>` });
// GM client only: add practice shots, announce level-ups, add/remove the reload spell
export async function gmGunXp(d) {
  const actor = fromUuidSync(d.actor); if (!actor || actor.type !== "character" || featExpert(actor)) return;
  const old = gunXp(actor), now = old + (d.add || 1);
  await actor.setFlag(MOD, XP_FLAG, now);
  if (old < XP_TRAINED && now >= XP_TRAINED) gunChat(actor, `<b>${actor.name}</b> เริ่มคุ้นมือกับปืน (${now}/${XP_EXPERT}) · ไม่เสียแต้มยิงพลาดอีกแล้ว`);
  if (old < XP_EXPERT && now >= XP_EXPERT) { gunChat(actor, `<b>${actor.name}</b> ชำนาญปืนแล้ว! ยิงแม่น (บวก Proficiency) และไม่ต้องบรรจุกระสุนอีก`); await syncReloadSpell(actor); }
}
const sendGunXp = (actor, add = 1) => { const d = { t: "x-gunxp", actor: actor.uuid, add }; if (game.user.isGM) return gmGunXp(d); if (game.users.activeGM) game.socket.emit(`module.${MOD}`, d); };
export async function syncReloadSpell(actor) {
  if (!actor || actor.type !== "character") return;
  const slots = actor.getFlag(MOD, "slots") ?? {};
  const held = [slots.weapon, slots.shield].map((id) => actor.items.get(id)).filter((i) => capOf(i));
  const have = actor.items.filter((i) => i.getFlag?.(MOD, RELOAD_FLAG));
  const need = held.length > 0 && !isGunExpert(actor);
  if (need && !have.length) {
    const [sp] = await actor.createEmbeddedDocuments("Item", [{ name: "บรรจุกระสุน", type: "spell", img: `modules/${MOD}/items/gun-revolver.webp`,
      system: { level: 0, school: "trs", description: { value: P("ร่ายใช้ 1 Action: บรรจุปืนที่ถืออยู่จนเต็มและหักกระสุนจากกระเป๋า · สเปลล์นี้อยู่ได้ตราบที่ถือปืนและยังไม่ชำนาญ · ยิงบ่อย ๆ จนชำนาญแล้วไม่ต้องบรรจุอีก") } },
      flags: { [MOD]: { [RELOAD_FLAG]: true } } }]);
    try { await sp.createActivity("utility", { name: "บรรจุกระสุน", activation: { type: "action", value: 1 } }, { renderSheet: false }); } catch (e) { console.warn(MOD, "reload spell activity", e); }
  } else if (!need && have.length) await actor.deleteEmbeddedDocuments("Item", have.map((i) => i.id));
}
function gunXpUse(activity) {
  const item = activity?.item;
  if (activity?.type === "attack" && capOf(item) && item.actor?.type === "character" && !isGunExpert(item.actor)) sendGunXp(item.actor, 1);
  if (item?.getFlag?.(MOD, RELOAD_FLAG)) reload(item.actor);
}
const hasPB = (item) => {
  const p = item.system?.prof; if (p && "multiplier" in p) return p.multiplier > 0;
  const w = item.actor?.system?.traits?.weaponProf?.value; return !!w?.has?.("mar");
};
// clumsy shooter: -2; expert shooter without weapon proficiency: add the proficiency bonus
function gunSkill(config) {
  try {
    const item = (config?.subject ?? config?.activity)?.item;
    if (item?.type !== "weapon" || !capOf(item) || item.actor?.type !== "character") return;
    const r = config.rolls?.[0] ?? config; r.parts = r.parts ?? [];
    const lvl = gunLevel(item.actor);
    if (lvl === 0) r.parts.push("-2");
    else if (lvl === 2 && !hasPB(item)) r.parts.push("@prof");
  } catch (e) { console.warn(MOD, "gunSkill", e); }
}
const capOf = (item) => item?.type === "weapon" ? Number(item.getFlag?.(MOD, "capacity")) || 0 : 0;
function ammoPreUse(activity, usage) {
  const item = activity?.item, cap = capOf(item);
  if (!cap || activity.type !== "attack") return;
  if (isGunExpert(item.actor)) { usage.consume = false; return; }
  const left = cap - Number(item.system.uses?.spent ?? 0);
  if (left > 0) return;
  playSfx("dryfire", true);
  floatText(shooterToken(item), "กระสุนหมด! ต้องบรรจุก่อน", "bad");
  ui.notifications.warn(`${item.name}: กระสุนหมด · ร่ายสเปลล์ "บรรจุกระสุน" ในชีท (ใช้ 1 Action) แล้วยิงต่อ`);
  return false;
}
function ammoPostUse(activity) {
  const item = activity?.item, cap = capOf(item);
  if (!cap || activity.type !== "attack" || isGunExpert(item.actor)) return;
  const left = cap - Number(item.system.uses?.spent ?? 0);
  if (left === 0) { floatText(shooterToken(item), "นัดสุดท้าย! กระสุนหมด", "warn"); ui.notifications.info(`${item.name}: กระสุนหมดแล้ว เทิร์นหน้าต้องบรรจุ (มาโคร "บรรจุกระสุน")`); }
  else if (left === 1) floatText(shooterToken(item), "เหลือ 1 นัด", "warn");
}
async function ensureGunExpertItem() {
  if (!game.users.activeGM?.isSelf || game.items.find((i) => i.getFlag(MOD, "gunExpert"))) return;
  const f = await folder("Arkane 1920s · ชุดและของวิเศษ");
  await Item.create({ name: GUN_EXPERT, type: "feat", img: `modules/${MOD}/items/gun-revolver.webp`, folder: f.id, flags: { [MOD]: { gunExpert: true } },
    system: { type: { value: "feat" }, description: { value: P("มือปืนที่ชำนาญจนบรรจุกระสุนได้ในจังหวะเดียวกับการยิง · <b>ปืนทุกกระบอกไม่ต้องบรรจุกระสุนและไม่หักนัด</b> ยิงต่อเนื่องได้ตลอด") + P("DM ลากความสามารถนี้ใส่ชีทตัวละครที่ถนัดปืน (เช่น ได้จาก Feat, ทหารผ่านศึก หรือรางวัลในเนื้อเรื่อง)") } } });
}

// occupations that come with "ถนัดปืน": matched against the character's biography; GM edits the list in Settings
const jobsOf = () => String(game.settings.get(MOD, "gunJobs") ?? "").split(/[,،\n]/).map((s) => s.trim()).filter(Boolean);
function gunJobOf(actor) {
  const bio = String(actor?.system?.details?.biography?.value ?? "").replace(/<[^>]+>/g, " ");
  const m = bio.match(/อาชีพ[:\s]*([^\n]{0,80})/);
  const text = m ? m[1] : bio;
  const classes = actor?.items?.filter((i) => i.type === "class").map((i) => `${i.name} ${i.system?.identifier ?? ""}`.toLowerCase()) ?? [];
  return jobsOf().find((j) => text.includes(j) || classes.some((c) => c.includes(j.toLowerCase()))) ?? null;
}
export async function grantGunExperts(quiet = true) {
  if (!game.users.activeGM?.isSelf) return;
  const src = game.items.find((i) => i.getFlag(MOD, "gunExpert"));
  if (!src) return;
  const got = [];
  for (const a of game.actors.filter((x) => x.type === "character")) {
    if (isGunExpert(a) || a.getFlag(MOD, "gunExpertOptOut")) continue;
    const job = gunJobOf(a);
    if (!job) continue;
    const data = src.toObject(); delete data._id; delete data.folder;
    data.system.description.value = `<p><b>ได้จากอาชีพ: ${job}</b></p>` + data.system.description.value;
    await a.createEmbeddedDocuments("Item", [data]);
    got.push(`${a.name} (${job})`);
  }
  if (got.length) ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card"><div class="rw-title">ถนัดปืนตามอาชีพ</div>${got.join("<br>")}<br><i>ไม่อยากให้ใคร ลบความสามารถ "ถนัดปืน" ออกจากชีทคนนั้นได้ ระบบจะไม่ใส่คืน</i></div>` });
  else if (!quiet) ui.notifications.info("ไม่มีตัวละครที่อาชีพตรงกับรายการถนัดปืน");
}

export function registerGunFx() {
  game.settings.register(MOD, "gunJobs", { name: "อาชีพที่ถนัดปืน", hint: "คั่นด้วยจุลภาค · ใส่ชื่อคลาสได้ด้วย (เช่น Ranger) · ตัวละครที่ประวัติ (บรรทัด 'อาชีพ' หรือทั้งประวัติ) มีคำเหล่านี้ จะได้ความสามารถ 'ถนัดปืน' ไม่ต้องบรรจุกระสุน",
    scope: "world", config: true, type: String, default: "ตำรวจ, ทหาร, มือปืน, นักสืบเอกชน, เจ้าหน้าที่ C.A.A.M., นักล่าค่าหัว, Ranger",
    onChange: () => grantGunExperts(false) });
  // GM removed the feat from a character: remember, never give it back automatically
  Hooks.on("deleteItem", (it) => { if (game.user.isGM && it.parent?.documentName === "Actor" && it.getFlag(MOD, "gunExpert")) it.parent.setFlag(MOD, "gunExpertOptOut", true); });
  Hooks.on("dnd5e.preUseActivity", ammoPreUse);
  Hooks.on("dnd5e.postUseActivity", ammoPostUse);
  Hooks.on("dnd5e.postUseActivity", gunXpUse);
  for (const h of ["dnd5e.preRollAttack", "dnd5e.preRollAttackV2"]) Hooks.on(h, gunSkill);
  Hooks.once("ready", () => ensureGunExpertItem().then(() => grantGunExperts(true)).catch((e) => console.warn(MOD, "gun expert", e)));
  Hooks.once("ready", () => {
    game.socket.on(SOCK, async (d) => {
      if (d.t === "text" && d.scene === canvas.scene?.id) floatText(canvas.tokens.get(d.token), d.text, d.kind, true);
      if (d.t === "apply" && game.users.activeGM?.isSelf) {
        const doc = fromUuidSync(d.uuid); const actor = doc?.actor ?? doc;
        if (!actor) return;
        const list = d.damages.map((x) => ({ value: x.value, type: x.type, properties: new Set() }));
        try { await actor.applyDamage(list); } catch { await actor.applyDamage(d.damages.reduce((s, x) => s + x.value, 0)); }
      }
    });
  });
  for (const h of ["dnd5e.preRollAttack", "dnd5e.preRollAttackV2"]) Hooks.on(h, preAttack);
  const onAttack = (rolls, data) => {
    const act = data?.subject ?? data?.activity;
    const item = act?.item ?? data?.item;
    if (!["weapon", "spell"].includes(item?.type)) return;
    const roll = rolls?.[0];
    const msg = game.messages.contents.findLast((m) => m.author?.id === game.user.id && m.rolls?.some((r) => r === roll));
    fire(item, { roll, act, msgId: msg?.id, tokenId: msg?.speaker?.token });
  };
  for (const h of ["dnd5e.rollAttack", "dnd5e.rollAttackV2"]) Hooks.on(h, onAttack);
  Hooks.on("dnd5e.postUseActivity", (activity) => { if (activity?.type === "heal") playSfx("heal", true); });
  // fallback if the roll hooks above did not fire
  Hooks.on("createChatMessage", async (msg) => {
    if (msg.author?.id !== game.user.id) return;
    const f = msg.flags?.dnd5e;
    if (!f || (f.roll?.type ?? "") !== "attack") return;
    await sleep(400);
    if (Date.now() - lastFx < 2000) return;
    let item = null;
    try { item = msg.getAssociatedItem?.(); } catch {}
    if (!item && f.item?.uuid) item = fromUuidSync(f.item.uuid);
    fire(item, { roll: msg.rolls?.[0], msgId: msg.id, tokenId: msg.speaker?.token });
  });
}

// ---------- make sure every gun (world items + actors) has an Attack activity that spends 1 Use per shot
const ATTACK = { type: "attack", name: "ยิง", attack: { type: { value: "ranged", classification: "weapon" } }, damage: { includeBase: true },
  consumption: { targets: [{ type: "itemUses", target: "", value: "1" }] } };
const MELEE_ATTACK = { type: "attack", name: "โจมตี", attack: { type: { value: "melee", classification: "weapon" } }, damage: { includeBase: true } };
export async function ensureAttack(item) {
  if (item?.type === "weapon" && (item.getFlag?.(MOD, "id")?.startsWith("melee-") || item.getFlag?.(MOD, "id") === "armor-umbrella")) {
    if (item.system.activities?.find?.((a) => a.type === "attack")) return false;
    if (item.createActivity) await item.createActivity("attack", foundry.utils.deepClone(MELEE_ATTACK), { renderSheet: false });
    else { const id = foundry.utils.randomID(); await item.update({ [`system.activities.${id}`]: { ...foundry.utils.deepClone(MELEE_ATTACK), _id: id } }); }
    return true;
  }
  if (!gunKeyOf(item)) return false;
  try {
    const props = item.system.properties;
    if (item.getFlag(MOD, "capacity") && props?.has?.("amm")) await item.update({ "system.properties": [...props].filter((p) => p !== "amm") });
  } catch (e) { console.warn(MOD, "amm", e); }
  const acts = item.system.activities;
  const atk = acts?.find?.((a) => a.type === "attack");
  const counted = !!item.getFlag(MOD, "capacity");
  if (atk) {
    if (counted && !atk.consumption?.targets?.length) await atk.update({ "consumption.targets": ATTACK.consumption.targets });
    return false;
  }
  const data = foundry.utils.deepClone(ATTACK);
  if (!counted) delete data.consumption;
  if (item.createActivity) await item.createActivity("attack", data, { renderSheet: false });
  else {
    const id = foundry.utils.randomID();
    await item.update({ [`system.activities.${id}`]: { ...data, _id: id } });
  }
  return true;
}
export async function fixGuns(quiet = false) {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  let n = 0, all = [...game.items];
  for (const a of game.actors) all.push(...a.items);
  for (const s of game.scenes) for (const t of s.tokens) if (!t.actorLink && t.actor) all.push(...t.actor.items);
  for (const it of all) { try { if (await ensureAttack(it)) n++; } catch (e) { console.warn(MOD, "fixGun", it.name, e); } }
  if (!quiet || n) ui.notifications.info(`ตรวจปืนแล้ว · เพิ่มปุ่มยิง (Attack) ให้ ${n} กระบอก`);
}
export async function testFx() {
  const seq = game.modules.get("sequencer")?.active, jb = [...game.modules].find((m) => /jb2a/i.test(m.id) && m.active);
  playSfx("revolver");
  const lines = [`เสียง: ${game.settings.get(MOD, "gunSounds") ? "เปิด (ถ้าไม่ได้ยิน เช็คแถบเสียง Interface/Environment ในแท็บ Playlists)" : "ปิดอยู่ใน Settings"}`,
    `Sequencer: ${seq ? "เปิด" : "ไม่ได้เปิด"}`, `JB2A: ${jb ? jb.id : "ไม่ได้เปิด"}`,
    `เลือกโทเคน: ${canvas.tokens.controlled.length} · เป้า (T): ${game.user.targets.size}`];
  if (seq) { try { lines.push(`เอฟเฟกต์กระสุน: ${Sequencer.Database.entryExists("jb2a.bullet.01.orange") ? "เจอ" : "ไม่เจอ"}`); } catch {} }
  const src = canvas.tokens.controlled[0], tgt = [...game.user.targets][0];
  if (seq && src && tgt) try { new Sequence().effect().file("jb2a.bullet.01.orange").atLocation(src).stretchTo(tgt).play(); } catch (e) { lines.push("เล่นเอฟเฟกต์ไม่ได้: " + e.message); }
  ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card"><div class="rw-title">ทดสอบเสียงและเอฟเฟกต์ปืน</div>${lines.join("<br>")}</div>` });
}

// ---------- item art: files in modules/arkane-1920s/items/<art>.webp replace the default icons (add more files any time)
const AMMO_ART = { "กระสุน .38": "ammo-38", "กระสุน .45": "ammo-45", "ลูกซอง": "ammo-shell", "กระสุนไรเฟิล": "ammo-rifle", "กระสุนเพลิง .38": "ammo-38-fire", "กระสุนเงิน .38": "ammo-38-silver" };
const GEAR_ART = { "Speedloader": "gear-speedloader", "ไฟฉายแบตเตอรี่": "gear-flashlight", "ตะเกียงน้ำมัน": "gear-lantern", "ไฟแช็กทองเหลือง": "gear-lighter", "นาฬิกาพก": "gear-pocketwatch",
  "กล้องถ่ายรูปพับได้": "gear-camera", "ชุดปฐมพยาบาล": "gear-firstaid", "ขวดวิสกี้เถื่อน": "gear-whiskey", "ชุดสะเดาะกุญแจ": "gear-lockpicks", "หนังสือพิมพ์อาร์คเคนเดลี่": "gear-newspaper" };
const STORY_ART = { "ตั๋วรับของโกดัง 4": "story-ticket", "เหรียญที่เปียกตลอดเวลา": "story-wetcoin", "หลอดยาวิปลาสเปล่า": "story-vial", "จดหมายจ้างวาน (A.P.)": "story-letter-ap",
  "ใบเสร็จ นพ. ก.": "story-receipt-drk", "จดหมายสั่งของถึงโกดัง 4": "story-order-wh4" };
const NPC_ART = [[/^เดอร์ริงเจอร์/, "gun-derringer"], [/^ลูกโม่/, "gun-revolver"], [/^ลูกซองตัดสั้น/, "gun-sawedoff"], [/^ลูกซอง/, "gun-shotgun"], [/^มีดพับ/, "melee-switchblade"], [/^สนับมือ/, "melee-knuckles"],
  // Chapter 1 NPC weapons (and the same attacks in later chapters / the tutorial)
  [/^ร่มดาบ/, "armor-umbrella"], [/^ปืนลูกดอก/, "npc-dartgun"], [/^กระบองยาง/, "npc-baton"], [/^กระบองสนามเพลาะ/, "npc-trenchclub"], [/^ตะขอ/, "npc-hook"],
  [/^ตะปบ/, "npc-claw"], [/^หมัดเหล็ก/, "melee-magicknuckles"], [/^ปิ่นปักผม/, "npc-hairpin"], [/^ไพ่ใบมีด/, "npc-cards"], [/^มีด$/, "melee-switchblade"],
  [/^กัด/, "npc-bite"], [/^ทุบ/, "npc-fist"]];
// core icons that do not exist in every Foundry install, and plain bag icons, swapped for module art
const IMG_ART = { "icons/equipment/neck/amulet-round-engraved-gold.webp": "magic-brooch", "icons/sundries/survival/rope-wrapped-brown.webp": "gear-rope", "icons/weapons/ammunition/arrows-war-white.webp": "ammo-arrows", "icons/weapons/bows/longbow-leather-green.webp": "weapon-longbow", "icons/weapons/bows/shortbow-recurve.webp": "weapon-shortbow", "icons/weapons/staves/staff-simple-carved.webp": "weapon-staff", "icons/weapons/swords/shortsword-guard-brass.webp": "weapon-shortsword", "icons/commodities/gems/pearl-swirl-white.webp": "gear-pocketwatch", "icons/creatures/tentacles/tentacle-eyes-yellow-green.webp": "npc-tentacle", "icons/equipment/chest/breastplate-leather-brown.webp": "armor-leather", "icons/equipment/chest/coat-collared-studded-brown.webp": "armor-peacoat", "icons/equipment/finger/ring-band-engraved-scrolls-teal.webp": "c2-gillring", "icons/equipment/head/hood-cloth-black.webp": "gear-hood", "icons/sundries/misc/lighter.webp": "gear-lighter", "icons/tools/hand/syringe-glass.webp": "npc-syringe", "icons/tools/navigation/sextant-brass.webp": "gear-sextant", "icons/weapons/axes/axe-broad-red.webp": "melee-fireaxe", "icons/weapons/daggers/dagger-curved-thin.webp": "melee-razor", "icons/weapons/daggers/dagger-straight-steel.webp": "melee-dagger", "icons/weapons/guns/gun-blunderbuss-worn.webp": "gun-sawedoff", "icons/weapons/swords/rapier-simple-gold.webp": "melee-canesword", "icons/weapons/swords/scimitar-guard-purple.webp": "melee-scimitar", "icons/svg/cog.svg": null };
const IMG_ART_PATH = (k) => `modules/${MOD}/items/${k}.webp`;
const NAME_ART = [[/^Druidic Focus/, "gear-mistletoe"], [/^Explorer's Pack/, "gear-pack"], [/^Carpenter's Tools/, "gear-carpenter"], [/^พลั่ว/, "gear-shovel"],
  [/^หม้อเหล็ก/, "gear-pot"], [/^ชุดเดินทาง/, "gear-clothes"], [/^ดาบโค้ง/, "melee-scimitar"], [/^เกราะหนัง/, "armor-leather"], [/^Thieves' Tools/, "gear-lockpicks"], [/^หมัด \(Tavern/, "npc-fist"]];
function artFor(item) {
  if (IMG_ART[item.img]) return IMG_ART[item.img];
  const byName = NAME_ART.find(([re]) => re.test(item.name ?? ""))?.[1];
  if (byName) return byName;
  const id = item.getFlag?.(MOD, "id") ?? "";
  if (/^(gun|melee|armor|magic)-/.test(id) || /^c[234]-/.test(id)) return id;
  if (id.startsWith("ammo-")) return AMMO_ART[id.slice(5)];
  if (id.startsWith("gear-")) return GEAR_ART[id.slice(5)];
  if (id.startsWith("story-")) return STORY_ART[id.slice(6)];
  if (item.getFlag?.(MOD, "npcWeapon")) return NPC_ART.find(([re]) => re.test(item.name))?.[1];
  return null;
}
export async function applyArt(quiet = true) {
  if (!game.user.isGM) return;
  const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
  let files = [];
  try { files = (await FP.browse("data", `modules/${MOD}/items`)).files ?? []; } catch (e) { console.warn(MOD, "browse items", e); return; }
  const have = new Set(files.map((f) => decodeURIComponent(f.split("/").pop()).replace(/\.\w+$/, "")));
  const path = (k) => files.find((f) => decodeURIComponent(f.split("/").pop()).replace(/\.\w+$/, "") === k);
  let n = 0;
  const fix = async (items, parent) => {
    const ups = [];
    for (const it of items) { const k = artFor(it); if (k && have.has(k)) { const src = path(k); if (it.img !== src) ups.push({ _id: it.id, img: src }); } }
    if (!ups.length) return;
    n += ups.length;
    if (parent) await parent.updateEmbeddedDocuments("Item", ups); else await Item.updateDocuments(ups);
  };
  try {
    await fix(game.items.contents);
    for (const a of game.actors) await fix(a.items.contents, a);
  } catch (e) { console.warn(MOD, "applyArt", e); }
  if (!quiet || n) ui.notifications.info(`ใส่รูปไอเทมแล้ว ${n} ชิ้น (มีรูปในโมดูล ${have.size} ไฟล์)`);
}
