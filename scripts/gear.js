// 1920s clothing/armor + magic & Magitech items with Active Effects (apply automatically when equipped/attuned)
const MOD = "arkane-1920s";
const P = (s) => `<p>${s}</p>`;
const ADD = 2, OVERRIDE = 5, UPGRADE = 4;
const fx = (name, img, changes) => ({ name, img, transfer: true, disabled: false, changes: changes.map(([key, mode, value]) => ({ key, mode, value: String(value) })) });

// [key, name, armorType, ac, maxDex, str, stealthDis, price, desc, effects]
const ARMOR = [
  ["armor-suit", "สูทสามชิ้นบุซับใน", "light", 11, null, 0, false, 10, "AC 11 + DEX · ดูเป็นชุดสุภาพธรรมดา เข้าที่หรูได้ ไม่มีใครรู้ว่าบุผ้าหนาไว้ข้างใน", []],
  ["armor-peacoat", "โค้ทกะลาสีบุผ้าใบ", "light", 11, null, 0, false, 15, "AC 11 + DEX · โค้ทสีกรมท่าของคนเรือ ได้เปรียบเซฟ CON ต่อความหนาวและลมทะเล", []],
  ["armor-flight", "แจ็คเก็ตหนังนักบิน", "light", 12, null, 0, false, 45, "AC 12 + DEX · หนังหนาจากสมัยสงคราม ทนมีดและเศษกระจก", []],
  ["armor-vest", "เสื้อกั๊กกันกระสุนผ้าไหม", "medium", 13, 2, 0, false, 75, "AC 13 + DEX (สูงสุด +2) · ผ้าไหมซ้อนหลายชั้นใส่ใต้เสื้อเชิ้ต มองไม่เห็นจากข้างนอก · ของเถื่อนจากตลาดมืด", []],
  ["armor-caam", "สูทบุแผ่นตะกั่ว C.A.A.M.", "medium", 15, 2, 0, true, 300, "AC 15 + DEX (สูงสุด +2) · เสียเปรียบ Stealth · ของหน่วยงาน มีไว้ผิดกฎหมาย · ตะกั่วกันพลังเวท: ได้เปรียบเซฟต่อเวทมนตร์", [["ตะกั่วกันเวท", [["system.attributes.ac.bonus", ADD, 0]]]]],
  ["armor-diving", "ชุดดำน้ำหมวกทองเหลือง", "heavy", 16, 0, 13, true, 150, "AC 16 · ต้องมี STR 13 · เสียเปรียบ Stealth · ถังอากาศหายใจใต้น้ำได้ 1 ชั่วโมง · ว่ายน้ำ 20 ฟุต · ของจำเป็นถ้าจะลงไปหาสิ่งที่อยู่ใต้ท่าเรือ", [["ชุดดำน้ำ: ว่ายน้ำ", [["system.attributes.movement.swim", UPGRADE, 20]]]]]
];
// [key, name, eqType, rarity, attune, price, desc, effects, extra]
const MAGIC = [
  ["magic-brooch", "เข็มกลัดโล่เวท", "wondrous", "uncommon", true, 500, "เข็มกลัดทองเหลืองลายอาร์ตเดโค ปล่อยโล่บาง ๆ รอบตัว · <b>AC +1</b>", [["เข็มกลัดโล่เวท", [["system.attributes.ac.bonus", ADD, "+1"]]]]],
  ["magic-watch", "นาฬิกาพกเร่งจังหวะ", "wondrous", "uncommon", true, 400, "เข็มวินาทีเดินเร็วกว่าปกติ · <b>Initiative +3</b> และจู่โจมแบบไม่รู้ตัวไม่ได้ (ไม่ติด Surprised)", [["นาฬิกาเร่งจังหวะ", [["system.attributes.init.bonus", ADD, "+3"]]]]],
  ["magic-goggles", "แว่นตาเลนส์อำพัน", "wondrous", "uncommon", false, 300, "แว่นนักบินเลนส์อำพันขัดเวท · <b>Darkvision 60 ฟุต</b> · มองทะลุหมอกบางได้ 30 ฟุต", [["แว่นเลนส์อำพัน", [["system.attributes.senses.darkvision", UPGRADE, 60], ["system.attributes.senses.ranges.darkvision", UPGRADE, 60]]]]],
  ["magic-saltcharm", "เครื่องรางเกลือทะเล", "wondrous", "uncommon", true, 350, "ถุงผ้าใส่เกลือทะเลกับเกล็ดปลาที่ถูกเผา ชาวประมงเก่าเชื่อว่ากันสิ่งใต้น้ำ · <b>เซฟ WIS +2</b> · ได้เปรียบการตรวจความหวาดผวาที่เกิดจากสิ่งมีชีวิตใต้ทะเล", [["เครื่องรางเกลือทะเล", [["system.abilities.wis.bonuses.save", ADD, "+2"]]]]],
  ["magic-fedora", "หมวกเฟดอร่าเงามืด", "clothing", "uncommon", true, 400, "เงาใต้ปีกหมวกลึกผิดธรรมชาติ · <b>ได้เปรียบ Stealth</b> · Bonus Action ดึงปีกหมวกลงทำให้หน้าจำไม่ได้ (คนที่เห็นจำหน้าไม่ได้ภายหลัง)", [["เฟดอร่าเงามืด", [["system.skills.ste.roll.mode", UPGRADE, 1]]]]],
  ["magic-pearl", "สร้อยไข่มุกดำ (ต้องสาป)", "wondrous", "rare", true, 0, "ไข่มุกเย็นเฉียบที่พบในรังของแม็ค · <b>ว่ายน้ำ 30 ฟุต หายใจใต้น้ำได้ เซฟ CHA +1</b><br><b>คำสาป (DM):</b> ถอดไม่ออกหลังผูกพัน · ทุก Long Rest เซฟ CON DC 12 ไม่ผ่าน 3 ครั้งจะมีเหงือกขึ้นที่คอ ได้ยินเสียงร้องเพลงจากทะเลตอนหลับ", [["สร้อยไข่มุกดำ", [["system.attributes.movement.swim", UPGRADE, 30], ["system.abilities.cha.bonuses.save", ADD, "+1"]]]]],
  ["magic-valise", "กระเป๋าเดินทางก้นลึก", "wondrous", "uncommon", false, 500, "กระเป๋าหนังของพ่อค้า Magitech ข้างในกว้างกว่าข้างนอก ใส่ของได้ 500 ปอนด์ แต่หนักแค่ 15 ปอนด์ (เหมือน Bag of Holding)", []]
];

function armorData([key, name, type, ac, maxDex, str, stealth, price, desc, effects]) {
  return {
    name, type: "equipment", img: "modules/arkane-1920s/items/armor-peacoat.webp",
    system: { type: { value: type }, armor: { value: ac, dex: maxDex }, strength: str || null, properties: stealth ? ["stealthDisadvantage"] : [],
      description: { value: P(desc) }, price: { value: price, denomination: "gp" }, weight: { value: type === "heavy" ? 50 : type === "medium" ? 12 : 6, units: "lb" } },
    effects: effects.filter(([, ch]) => ch.some((c) => c[2] !== 0)).map(([n, ch]) => fx(n, "icons/svg/shield.svg", ch)),
    flags: { [MOD]: { id: key } }
  };
}
function magicData([key, name, type, rarity, attune, price, desc, effects]) {
  return {
    name, type: "equipment", img: "icons/commodities/gems/gem-faceted-round-white.webp",
    system: { type: { value: type }, rarity, attunement: attune ? "required" : "", properties: ["mgc"],
      description: { value: P(desc) + (attune ? P("<i>ต้องผูกพัน (Attunement) ก่อนใช้ · ใช้ได้พร้อมกันสูงสุด 3 ชิ้น</i>") : "") },
      price: { value: price, denomination: "gp" }, weight: { value: key === "magic-valise" ? 15 : 0.5, units: "lb" } },
    effects: effects.map(([n, ch]) => fx(n, "icons/svg/aura.svg", ch)),
    flags: { [MOD]: { id: key } }
  };
}

// ร่มกันกระสุน: อาวุธประชิดที่ตีได้ และให้ AC +2 ตราบที่ถืออยู่ในช่องอาวุธ/มืออีกข้าง (effect ทำงานเมื่อ equipped)
export function umbrellaData() {
  return {
    name: "ร่มกันกระสุน C.A.A.M.", type: "weapon", img: "modules/arkane-1920s/items/armor-umbrella.webp",
    system: { type: { value: "simpleM" }, properties: ["fin"], mastery: "sap",
      damage: { base: { number: 1, denomination: 4, types: ["bludgeoning"] } },
      description: { value: P("ร่มผ้าเคลือบเวท ด้ามเหล็ก · ตีได้ 1d4 · <b>ถืออยู่ AC +2</b> (กางร่มกำบัง) · พับแล้วดูเป็นร่มธรรมดา") },
      price: { value: 40, denomination: "gp" }, weight: { value: 2, units: "lb" } },
    effects: [fx("ร่มกันกระสุน (กางกำบัง)", "icons/svg/shield.svg", [["system.attributes.ac.bonus", ADD, "+2"]])],
    flags: { [MOD]: { id: "armor-umbrella" } }
  };
}
// เปลี่ยนร่มเดิมที่เป็น "โล่" (equipment) ในโลกและในตัวละคร/ร้าน ให้เป็นอาวุธ (GM เท่านั้น ทำครั้งเดียวต่อชิ้น)
export async function migrateUmbrella() {
  if (!game.user.isGM) return 0;
  let n = 0;
  const conv = async (old, parent) => {
    const d = umbrellaData();
    if (parent) { d.system.quantity = old.system?.quantity ?? 1; }
    else d.folder = old.folder?.id ?? null;
    const [made] = await (parent ? parent.createEmbeddedDocuments("Item", [d]) : Item.createDocuments([d]));
    await old.delete();
    if (made) { try { await (await import("./items.js?v=21")).ensureAttack(made); } catch (e) { console.warn(MOD, "umbrella attack", e); } }
    n++;
  };
  const isOld = (i) => i.type === "equipment" && i.getFlag?.(MOD, "id") === "armor-umbrella";
  for (const i of game.items.filter(isOld)) await conv(i, null);
  for (const a of game.actors) for (const i of a.items.filter(isOld)) await conv(i, a);
  return n;
}
// +1 weapons and the consumable are built from items.js data (passed in)
export function gearList({ revolver }) {
  const list = [...ARMOR.map(armorData), ...MAGIC.map(magicData)];
  if (revolver) list.push(revolver);
  list.push(umbrellaData());
  list.push({
    name: "ขวดเกลือดมปลุกสติ", type: "consumable", img: "icons/consumables/potions/bottle-round-corked-green.webp",
    system: { type: { value: "trinket" }, quantity: 1, uses: { max: "3", spent: 0, recovery: [], autoDestroy: true },
      description: { value: P("Action จ่อจมูกคนข้าง ๆ: หายจาก Frightened ทันที หรือปลุกคนที่หมดสติแต่ยังไม่ตาย (Stable) ให้ฟื้นมี HP 1 · ใช้ได้ 3 ครั้ง") },
      price: { value: 25, denomination: "gp" } },
    flags: { [MOD]: { id: "magic-salts" } }
  });
  list.push({
    name: "สนับมือแม็กเทค +1", type: "weapon", img: "icons/weapons/fist/fist-knuckles-brass.webp",
    system: { type: { value: "simpleM" }, properties: ["lgt", "mgc"], magicalBonus: 1, rarity: "uncommon", attunement: "required", mastery: "nick",
      damage: { base: { number: 1, denomination: 4, types: ["bludgeoning"] } },
      uses: { max: "1", spent: 0, recovery: [{ period: "lr", type: "recoverAll" }] },
      description: { value: P("สนับมือทองเหลืองมีขดลวดและแก้วเรืองแสง · โจมตีและดาเมจ +1 · <b>ช็อตเต็มกำลัง</b> 1 ครั้ง/Long Rest: ต่อยโดนแล้วเพิ่ม 2d6 Lightning (บอก DM)") },
      price: { value: 600, denomination: "gp" } },
    flags: { [MOD]: { id: "melee-magicknuckles" } }
  });
  return list;
}

// equipping real armor switches the AC formula from flat/Mage Armor to normal armor (and back)
export function registerArmorSwap() {
  Hooks.on("updateItem", async (item, change, options, userId) => {
    if (userId !== game.user.id || item.type !== "equipment" || !("equipped" in (change.system ?? {}))) return;
    const actor = item.actor;
    if (!actor || actor.type !== "character") return;
    const isArmor = ["light", "medium", "heavy"].includes(item.system.type?.value);
    if (!isArmor) return;
    const calc = actor.system.attributes.ac.calc;
    try {
      if (item.system.equipped && ["flat", "mage", "natural", "unarmoredMonk", "unarmoredBarb", "draconic"].includes(calc)) {
        await actor.update({ "system.attributes.ac.calc": "default", [`flags.${MOD}.prevAc`]: calc }, { arkaneInternal: true });
        ui.notifications.info(`${actor.name}: ใส่ ${item.name} · AC คิดจากชุดเกราะแล้ว`);
      } else if (!item.system.equipped && actor.getFlag(MOD, "prevAc")) {
        const stillArmored = actor.items.some((i) => i.id !== item.id && i.system.equipped && ["light", "medium", "heavy"].includes(i.system.type?.value));
        if (!stillArmored) {
          const prev = actor.getFlag(MOD, "prevAc");
          await actor.update({ "system.attributes.ac.calc": prev === "flat" ? "default" : prev, [`flags.${MOD}.-=prevAc`]: null }, { arkaneInternal: true });
          ui.notifications.info(`${actor.name}: ถอด ${item.name} · AC กลับเป็นแบบเดิม`);
        }
      }
    } catch (e) { console.warn(MOD, "armor swap", e); }
  });
}
