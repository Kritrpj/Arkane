// Player characters (level 1) + starting melee weapons + species/feat features
const MOD = "arkane-1920s";
import { grantSpells } from "./spells.js?v=21";
const P = (s) => `<p>${s}</p>`;
const rid = () => foundry.utils.randomID();
const ABS = ["str", "dex", "con", "int", "wis", "cha"];

function weapon(name, img, [n, d], type, base, props, mastery, extra = {}) {
  const sys = { type: { value: base }, properties: props, mastery, equipped: true, proficient: 1,
    damage: { base: { number: n, denomination: d, types: [type] } }, description: { value: P(extra.desc ?? "") } };
  if (extra.vers) sys.damage.versatile = { number: 1, denomination: extra.vers, types: [type] };
  if (props.includes("thr")) sys.range = { value: 20, long: 60, units: "ft" };
  if (extra.range) sys.range = { value: extra.range[0], long: extra.range[1], units: "ft" };
  const id = rid();
  sys.activities = { [id]: { _id: id, type: "attack", name: extra.range ? "ยิง" : "โจมตี", attack: { type: { value: extra.range ? "ranged" : "melee", classification: "weapon" } }, damage: { includeBase: true } } };
  const flags = { id: extra.id ?? (extra.range ? "ranged-" : "melee-") + (extra.key ?? name) };
  if (extra.cap) { sys.uses = { max: String(extra.cap), spent: 0, recovery: [] }; flags.capacity = extra.cap; flags.ammo = extra.ammo; }
  return { name, type: "weapon", img, system: sys, flags: { [MOD]: flags } };
}
function feat(name, desc, uses) {
  const sys = { description: { value: P(desc) }, type: { value: "race" } };
  if (uses) sys.uses = { max: String(uses), spent: 0, recovery: [{ period: "lr", type: "recoverAll" }] };
  return { name, type: "feat", img: "icons/svg/aura.svg", system: sys };
}
function klass(name, identifier, hd, progression, ability = "cha") {
  return { name, type: "class", img: "icons/svg/book.svg",
    system: { identifier, levels: 1, hd: { denomination: hd, spent: 0 }, hitDice: hd, spellcasting: { progression, ability } } };
}
function gear(name, img, type, desc, extra = {}) {
  return { name, type: type === "loot" ? "loot" : "equipment", img, system: { type: { value: type === "loot" ? "" : type }, description: { value: P(desc) },
    equipped: !!extra.armor, armor: extra.armor ? { value: extra.armor, dex: null } : undefined, quantity: extra.qty ?? 1 } };
}

const PCS = [
  {
    key: "vivian", name: "Vivian Spencer", player: /ppiimm|pim|พิม/i,
    ab: [10, 13, 9, 15, 14, 14], hp: 5, ac: 11, saves: ["con", "cha"], skills: ["ins", "per", "ste", "sur"], gp: 25,
    cls: klass("Sorcerer", "sorcerer", "d6", "full"),
    bio: "เผ่า Hexblood · Sorcerer 1 · Background: Guide · Origin Feat: Magic Initiate (Druid) · เครื่องมือ: Cartographer's Tools<br>ไกด์นำทางในสหพันธรัฐวาเลอเรีย หมู่บ้านถูกรอยแยกสีขี้เถ้ากลืน มาที่ The Rusty Wand เพราะจดหมายจ้างวานจาก A.P.",
    items: [
      weapon("ไม้เท้าแกะสลัก", "modules/arkane-1920s/items/weapon-staff.webp", [1, 6], "bludgeoning", "simpleM", ["ver"], "topple", { key: "viv-staff", vers: 8, desc: "Quarterstaff · สองมือ 1d8 · ไม้เท้าประจำตัว ใช้เป็น Arcane Focus ได้" }),
      weapon("มีดสั้น", "modules/arkane-1920s/items/melee-dagger.webp", [1, 4], "piercing", "simpleM", ["fin", "lgt", "thr"], "nick", { key: "dagger", desc: "Dagger · ขว้างได้ 20/60 ฟุต" }),
      feat("Darkvision", "มองในที่มืดได้ 60 ฟุต"),
      feat("Eerie Token (Hexblood)", "Bonus Action: ถอดเล็บหรือเส้นผมทำเป็นเครื่องราง ส่งข้อความ 25 คำ หรือมองผ่านเครื่องรางได้ (ระยะ 10 ไมล์) 1 ครั้ง/Long Rest", 1),
      feat("Hex Magic (Hexblood)", "ร่าย Disguise Self และ Hex ได้อย่างละ 1 ครั้ง/Long Rest โดยไม่ใช้ช่องเวท", 2),
      feat("Magic Initiate (Druid)", "Cantrip ดรูอิด 2 อย่าง + เวทเลเวล 1 อีก 1 อย่าง (ร่ายฟรี 1 ครั้ง/Long Rest) · ได้ Guidance, Druidcraft และ Healing Word (ใส่ให้แล้ว)"),
    ]
  },
  {
    key: "mozxorion", name: "Mozxorion Wildheart", player: /โมส|mos|moz/i,
    ab: [9, 10, 13, 14, 17, 12], hp: 11, ac: 10, saves: ["str", "dex"], skills: ["acr", "ani", "ins", "inv", "prc", "sur"],
    cast: "wis", darkvision: 120, weaponProf: ["sim", "mar"], armorProf: ["lgt", "med", "shl"], acCalc: "default", gp: 27,
    cls: klass("Ranger", "ranger", "d10", "half", "wis"),
    bio: "เผ่า Elf (Drow) · Ranger 1 · Background: Sailor · Origin Feat: Tavern Brawler · เครื่องมือ: Navigator's Tools<br>ทายาทตระกูล Wildheart จากเกาะนิวบริทาเนีย มีพรสวรรค์เวทด้านสอดส่อง แกะรอย และตรวจจับสิ่งผิดปกติจากระยะไกล ทำงานเป็นคนคุ้มกันเรือเดินสมุทรและสินค้า บ้านเกิดถูกพิษสงครามกลืนจนไม่เหลือใคร ชอบดื่ม ฟังเรื่องเล่า มองสาว และไม่เคยปฏิเสธเรื่องต่อยตี",
    items: [
      weapon("ธนูยาว", "modules/arkane-1920s/items/weapon-longbow.webp", [1, 8], "piercing", "martialR", ["two", "hvy"], "slow", { key: "moz-longbow", range: [150, 600], desc: "Longbow · 150/600 ฟุต · Weapon Mastery: Slow (โดนแล้วเป้าช้าลง 10 ฟุต)" }),
      weapon("ดาบโค้ง", `modules/${MOD}/items/melee-scimitar.webp`, [1, 6], "slashing", "martialM", ["fin", "lgt"], "nick", { key: "moz-scimitar", desc: "Scimitar · Weapon Mastery: Nick (ใช้คู่กับดาบสั้นโจมตีเพิ่มได้ใน Action เดียวกัน)" }),
      weapon("ดาบสั้น", "modules/arkane-1920s/items/weapon-shortsword.webp", [1, 6], "piercing", "martialM", ["fin", "lgt"], "vex", { key: "moz-shortsword", desc: "Shortsword" }),
      weapon("หมัด (Tavern Brawler)", "modules/arkane-1920s/items/npc-fist.webp", [1, 4], "bludgeoning", "simpleM", [], "", { key: "moz-fist", desc: "Unarmed Strike 1d4 + STR · ทอยดาเมจได้ 1 ทอยใหม่ · โดนแล้วผลักเป้า 5 ฟุตได้ (1 ครั้ง/เทิร์น)" }),
      gear("เกราะหนังหมุดเงิน (Studded Leather)", `modules/${MOD}/items/armor-leather.webp`, "light", "AC 12 + DEX · ชุดเกราะหนังและผ้าสีเทา เกราะแขนไหล่โลหะสีเงินสลักลาย ผ้าคลุมดำติดฮู้ด", { armor: 12 }),
      gear("ลูกธนู", "modules/arkane-1920s/items/ammo-arrows.webp", "loot", "20 ดอก ในกระบอกใส่ลูกธนู", { qty: 20 }),
      gear("Navigator's Tools", "modules/arkane-1920s/items/gear-sextant.webp", "loot", "เครื่องมือเดินเรือ: เซ็กสแตนท์ เข็มทิศ แผนที่ทะเล"),
      gear("เชือกป่าน 50 ฟุต", "modules/arkane-1920s/items/gear-rope.webp", "loot", "เชือกของคนเรือ"),
      gear("เข็มกลัดทองฝังอัญมณี", "modules/arkane-1920s/items/magic-brooch.webp", "loot", "เข็มกลัดทองกลมกลางอก ยึดผ้าคลุม ของตระกูล Wildheart"),
      feat("Darkvision (Drow)", "มองในที่มืดได้ 120 ฟุต"),
      feat("Drow Magic", "Dancing Lights ใช้ได้ไม่จำกัด · เลเวล 3 ได้ Faerie Fire · เลเวล 5 ได้ Darkness (อย่างละ 1 ครั้ง/Long Rest ไม่ใช้ช่องเวท) · ร่ายด้วย WIS"),
      feat("Fey Ancestry", "ได้เปรียบเซฟไม่ให้ติด Charmed"),
      feat("Trance & Keen Senses", "พักยาว 4 ชั่วโมงแบบภวังค์ · ชำนาญ Perception"),
      feat("Tavern Brawler", "หมัด 1d4 + STR · ทอยดาเมจหมัดได้ 1 ทอยใหม่ · ใช้ของรอบตัวเป็นอาวุธได้อย่างชำนาญ · ผลักเป้า 5 ฟุตเมื่อหมัดโดน")
    ]
  },
  {
    key: "windows", name: "Windowส์", player: /^hn$|window|วินโดว/i,
    ab: [15, 15, 14, 10, 13, 8], hp: 14, ac: 14, saves: ["str", "dex"], skills: ["ani", "inv", "nat", "prc", "ste", "sur"],
    cast: "wis", darkvision: 0, weaponProf: ["sim", "mar"], armorProf: ["lgt", "med", "shl"], acCalc: "default", gp: 37, init: "@prof",
    cls: klass("Ranger", "ranger", "d10", "half", "wis"),
    bio: "คนงานที่มาจากชนบท · เผ่า Harengon (คนกระต่าย) · Ranger 1 · Background: Farmer · Origin Feat: Tough · เครื่องมือ: Carpenter's Tools<br>"
      + "<b>อาชีพ:</b> อดีตตำรวจแนวหน้าของเมือง ต้องเผชิญความรุนแรงและคดีอาชญากรรมยากๆ มานักต่อนัก เป็นคนพละกำลังดีและกล้าได้กล้าเสีย<br>"
      + "<b>สงครามกระทบชีวิต:</b> สูญเสียคู่หูคนสำคัญไปในสงคราม จนเกือบหมดศรัทธาในอาชีพและลาออก แต่ยังพกตราตำรวจเก่าไว้ดูต่างหน้าเสมอ ชีวิตที่สุขสบายตอนนี้มาจากการแอบยักยอกเงินจากที่ทำงานเก่าส่วนหนึ่งในจังหวะชุลมุน<br>"
      + "<b>ทำไมมาที่ The Rusty Wand:</b> อาศัยเครือข่ายและคนรู้จักเก่าในเมืองเพื่อแวะพักผ่อน แต่เป้าหมายหลักคือมา \"แอบฟังข่าวใหญ่\" ที่ได้ยินแว่วมา เพราะยุคนี้ข้อมูลวงในมีค่าและทรงอำนาจที่สุด<br>"
      + "<b>ความลับ:</b> สมัยทำงานเคยมีปากเสียงและลงไม้ลงมือชกต่อยกับเพื่อนร่วมงาน ทำให้ฝังใจกลายเป็นคนไม่ไว้ใจใคร เชื่อว่าทุกคนหักหลังกันได้เสมอเมื่อผลประโยชน์มาถึง ซึ่งตัวเขาเองก็พร้อมทำแบบนั้นเช่นกัน<br>"
      + "<b>รูปลักษณ์:</b> รูปร่างสมส่วน แข็งแรงแบบอดีตตำรวจแนวหน้า สวมเสื้อผ้าชาวเมืองยุคกลางแบบสบายๆ ซ่อนเกราะเบาไว้ด้านใน และห้อย \"ตราสัญลักษณ์ตำรวจเก่า\" ไว้ตลอดเวลา",
    items: [
      weapon("ธนูยาว", "modules/arkane-1920s/items/weapon-longbow.webp", [1, 8], "piercing", "martialR", ["two", "hvy"], "slow", { key: "wnd-longbow", range: [150, 600], desc: "Longbow · 150/600 ฟุต · Weapon Mastery: Slow (โดนแล้วเป้าช้าลง 10 ฟุต)" }),
      weapon("ดาบโค้ง", `modules/${MOD}/items/melee-scimitar.webp`, [1, 6], "slashing", "martialM", ["fin", "lgt"], "nick", { key: "wnd-scimitar", desc: "Scimitar · Weapon Mastery: Nick (ใช้คู่กับดาบสั้นโจมตีเพิ่มได้ใน Action เดียวกัน)" }),
      weapon("ดาบสั้น", "modules/arkane-1920s/items/weapon-shortsword.webp", [1, 6], "piercing", "martialM", ["fin", "lgt"], "vex", { key: "wnd-shortsword", desc: "Shortsword" }),
      weapon("เคียว", `modules/${MOD}/items/melee-wnd-sickle.webp`, [1, 4], "slashing", "simpleM", ["lgt"], "nick", { key: "wnd-sickle", desc: "Sickle 1d4 · เคียวเกี่ยวข้าวจากบ้านไร่ (Background Farmer)" }),
      gear("เกราะหนังหมุด (Studded Leather)", `modules/${MOD}/items/armor-leather.webp`, "light", "AC 12 + DEX (= 14) · ใส่ใต้เสื้อสูทสีเขียวอ่อนสะท้อนแสง", { armor: 12 }),
      gear("ลูกธนู", "modules/arkane-1920s/items/ammo-arrows.webp", "loot", "20 ดอก ในกระบอกใส่ลูกธนู", { qty: 20 }),
      gear("Druidic Focus (กิ่งมิสเซิลโท)", `modules/${MOD}/items/gear-mistletoe.webp`, "loot", "ใช้เป็นสื่อร่ายเวท Ranger"),
      gear("Explorer's Pack", `modules/${MOD}/items/gear-pack.webp`, "loot", "เป้สะพาย ผ้าห่ม ตะเกียง น้ำมัน เสบียง 10 วัน เชือก 50 ฟุต ถุงน้ำ ที่จุดไฟ"),
      gear("Carpenter's Tools", `modules/${MOD}/items/gear-carpenter.webp`, "loot", "เครื่องมือช่างไม้ (Background Farmer)"),
      gear("ชุดปฐมพยาบาล (Healer's Kit)", `modules/${MOD}/items/gear-firstaid.webp`, "loot", "ใช้ได้ 10 ครั้ง · ห้ามเลือดคนที่ล้ม (Background Farmer)"),
      gear("หม้อเหล็ก", `modules/${MOD}/items/gear-pot.webp`, "loot", "หม้อเหล็ก (Background Farmer)"),
      gear("พลั่ว", `modules/${MOD}/items/gear-shovel.webp`, "loot", "พลั่ว (Background Farmer)"),
      gear("ชุดเดินทาง", `modules/${MOD}/items/gear-clothes.webp`, "loot", "เสื้อผ้าสำหรับเดินทาง (Background Farmer)"),
      feat("Hare-Trigger (Harengon)", "บวกค่า Proficiency เข้า Initiative (ใส่ให้แล้ว)"),
      feat("Leporine Senses (Harengon)", "ชำนาญ Perception"),
      feat("Lucky Footwork (Harengon)", "Reaction: เมื่อทอยเซฟ DEX ไม่ผ่าน บวก 1d4 เข้าผลทอย อาจทำให้ผ่าน"),
      feat("Rabbit Hop (Harengon)", "Bonus Action: กระโดดได้ไกล 5 × ค่า Proficiency ฟุต โดยไม่โดนตีสวน · ใช้ได้เท่าค่า Proficiency ต่อ Long Rest", 2),
      feat("Tough", "HP สูงสุดเพิ่ม 2 ต่อเลเวล (ใส่ให้แล้ว: 10 + CON 2 + Tough 2 = 14)")
    ]
  },
  {
    key: "heinz", later: true, name: "Dr. Heinz Doofenshmirtz", player: /ไฮนซ|ฮนซ|heinz|hienz|doof/i,
    ab: [15, 12, 13, 17, 8, 10], hp: 9, ac: 11, saves: ["con", "int"], skills: ["arc", "his", "inv", "nat", "per"],
    cast: "int", darkvision: 0, weaponProf: ["sim"], armorProf: ["lgt", "med", "shl"], acCalc: "default", gp: 16,
    cls: klass("Artificer", "artificer", "d8", "artificer", "int"),
    bio: "ช่างกลหรือช่างฝีมือในโรงงาน · เผ่า Human · Artificer 1 · Background: Artisan · Origin Feat: Crafter + Magic Initiate ไม่มี (Versatile เลือก Feat เพิ่ม) · เครื่องมือ: Tinker's Tools<br>"
      + "<b>อาชีพ:</b> ช่างกลและนักประดิษฐ์อิสระ ผสานเวทมนตร์เข้ากับกลไก ฝึกเองจากโรงงานซ่อมเครื่องจักรและตำราเวทเก่า ตั้งชื่อสิ่งประดิษฐ์ทุกชิ้นลงท้ายว่า \"-อินเนเตอร์\" (Inator)<br>"
      + "<b>สงครามกระทบชีวิต:</b> โรงงานบ้านเกิดถูกยึดไปผลิตยุทโธปกรณ์ แบบแปลนที่ทุ่มเททั้งชีวิตถูกกองทัพเอาไปดัดแปลงเป็นอาวุธ สิ้นเนื้อประดาตัว ต้องมาเป็นช่างรับจ้างอิสระ<br>"
      + "<b>ทำไมมาที่ The Rusty Wand:</b> ตามหาชิ้นส่วนกลไกเวทมนตร์หายากในตลาดมืด และหานายทุนที่ยอมจ่ายเงินสนับสนุนงานวิจัยของเขา<br>"
      + "<b>ความลับ:</b> สิ่งประดิษฐ์ทุกชิ้นมี \"ปุ่มทำลายตัวเอง\" เพราะกลัวว่าผลงานจะถูกคนชั่วขโมยไปทำร้ายผู้คนเหมือนช่วงสงครามอีก<br>"
      + "<b>รูปลักษณ์:</b> ชายวัยกลางคนผอมสูง หลังค่อมเล็กน้อย จมูกแหลม ผมน้ำตาลชี้ฟูยุ่งเหยิง แว่นกันลมทองเหลืองคาดหน้าผาก เสื้อโค้ทยาวเปื้อนคราบน้ำมันเครื่อง",
    items: [
      weapon("ประแจท่อยักษ์", `modules/${MOD}/items/melee-wrench.webp`, [1, 6], "bludgeoning", "simpleM", [], "sap", { key: "hz-wrench", desc: "ประแจเหล็กหนักเท่ากระบอง ใช้ทั้งซ่อมและทุบ · 1d6 Bludgeoning · Weapon Mastery: Sap (โดนแล้วเป้าเสียเปรียบการโจมตีครั้งถัดไป)" }),
      weapon("ปืนยิงสลักเกลียว-อินเนเตอร์", `modules/${MOD}/items/weapon-rivetgun.webp`, [1, 8], "piercing", "simpleR", ["amm", "lod", "two"], "slow", { key: "hz-rivet", range: [80, 320], desc: "หน้าไม้กลไกที่เขาสร้างเอง ยิงสลักเกลียวเหล็กด้วยสปริงอัดไอน้ำ · 1d8 Piercing · 80/320 ฟุต · Loading: ยิงได้เทิร์นละ 1 นัด · Weapon Mastery: Slow (โดนแล้วเป้าช้าลง 10 ฟุต)" }),
      gear("สลักเกลียวเหล็ก", "icons/weapons/ammunition/bullets-cartridge-shell-gray.webp", "loot", "กระสุนสลักเกลียว 20 ดอก สำหรับปืนยิงสลักเกลียว", { qty: 20 }),
      gear("เอี๊ยมหนังช่างบุหมุดเหล็ก (Studded Leather)", `modules/${MOD}/items/armor-overalls.webp`, "light", "AC 12 + DEX (= 13) · เอี๊ยมหนังหนาตอกหมุด ใส่ทำงานในโรงงานจนเป็นผิวหนังชั้นที่สอง", { armor: 12 }),
      gear("Tinker's Tools (เครื่องมือช่างกล)", `modules/${MOD}/items/gear-carpenter.webp`, "loot", "ชุดเครื่องมือช่างกลครบมือ · ใช้เป็นสื่อร่ายเวท Artificer และซ่อมของได้"),
      gear("Thieves' Tools", `modules/${MOD}/items/gear-lockpicks.webp`, "loot", "ชุดสะเดาะกุญแจ · กลอนก็คือกลไกชนิดหนึ่ง"),
      gear("เป้สำรวจ (Dungeoneer's Pack)", `modules/${MOD}/items/gear-pack.webp`, "loot", "เป้ ชะแลง ค้อน ตะปู ตะเกียง น้ำมัน เสบียง 10 วัน เชือก 50 ฟุต"),
      gear("สมุดแบบแปลนสิ่งประดิษฐ์", "icons/sundries/books/book-worn-blue.webp", "loot", "แบบแปลนลายมือแน่นทุกหน้า ทุกเครื่องลงท้ายด้วย -อินเนเตอร์ และทุกแบบมีปุ่มสีแดงปริศนาอยู่มุมเดียวกัน"),
      gear("เครื่องต้นแบบ \"ยังไม่ได้ตั้งชื่อ-อินเนเตอร์\"", `modules/${MOD}/items/gear-inator.webp`, "loot", "เครื่องจักรทองเหลืองขนาดหิ้วได้ มีจานรับสัญญาณ หลอดแก้วเรืองแสง และปุ่มแดงใหญ่ 1 ปุ่ม · ยังไม่มีใครรู้ว่ามันทำอะไร (DM กำหนดได้ตามสถานการณ์ ใช้ได้ 1 ครั้งต่อบท)"),
      feat("Resourceful (Human)", "ได้ Heroic Inspiration ทุกครั้งหลัง Long Rest · ใช้ทอยใหม่ได้ 1 ครั้ง"),
      feat("Skillful (Human)", "ได้ทักษะเพิ่ม 1 อย่าง (ใส่แล้ว: Persuasion)"),
      feat("Versatile (Human)", "ได้ Origin Feat เพิ่ม 1 อย่าง (ใส่แล้ว: Crafter)"),
      feat("Crafter", "ซื้อของที่ไม่ใช่ของวิเศษลด 20% จากร้านที่ยอมต่อ · ประดิษฐ์ของด้วยเครื่องมือเร็วขึ้น · ชำนาญ Artisan's Tools 3 ชนิด"),
      feat("Magical Tinkering", "แตะของชิ้นเล็ก 1 ชิ้น ใส่ลูกเล่นเวท: เปล่งแสง · เล่นเสียงอัดไว้ 6 วินาที · ส่งกลิ่น · ฉายข้อความนิ่ง · มีผลพร้อมกันได้เท่าค่า INT (+3)")
    ]
  },
  {
    key: "nincolas", name: "Nincolas Cage Jr. III", player: /นินนิน|ninnin|nin/i,
    ab: [10, 13, 8, 16, 12, 16], hp: 7, ac: 11, saves: ["dex", "int"], skills: ["ani", "dec", "ins", "prc", "per", "slt", "ste"], expertise: ["dec", "slt"],
    darkvision: 0, weaponProf: ["sim"], armorProf: ["lgt"], acCalc: "default", gp: 30,
    cls: klass("Rogue", "rogue", "d8", "none"),
    bio: "นินโคลัส เคจ จูเนียร์ ที่ III · มนุษย์ · Rogue 1 · Background: Merchant · Origin Feat: Lucky + 1 Feat (Versatile) · เครื่องมือ: Navigator's Tools<br>เกิดในครอบครัวยากจน ดิ้นรนเอาตัวรอดด้วยการขโมย สงครามทำให้ของมีค่าหายากขึ้นและต้องทำทุกอย่างเพื่ออยู่รอด มาที่ The Rusty Wand เพราะได้ข่าวว่ามีนายจ้างจ่ายค่าตอบแทนดี<br>ชุดผ้าสีดำคล้ายนินจา ใส่ฮู้ดและผ้าปิดปาก",
    items: [
      weapon("มีดสั้น", "modules/arkane-1920s/items/melee-dagger.webp", [1, 4], "piercing", "simpleM", ["fin", "lgt", "thr"], "nick", { key: "nin-dagger", desc: "Dagger ×2 · ขว้างได้ 20/60 ฟุต · Weapon Mastery: Nick" }),
      weapon("ดาบสั้น", "modules/arkane-1920s/items/weapon-shortsword.webp", [1, 6], "piercing", "martialM", ["fin", "lgt"], "vex", { key: "nin-shortsword", desc: "Shortsword · Weapon Mastery: Vex (โดนแล้วได้เปรียบโจมตีเป้าเดิมครั้งถัดไป)" }),
      weapon("ธนูสั้น", "modules/arkane-1920s/items/weapon-shortbow.webp", [1, 6], "piercing", "simpleR", ["two"], "vex", { key: "nin-shortbow", range: [80, 320], desc: "Shortbow · 80/320 ฟุต" }),
      gear("เกราะหนัง (Leather Armor)", `modules/${MOD}/items/armor-leather.webp`, "light", "AC 11 + DEX · ใส่ใต้ชุดผ้าสีดำ", { armor: 11 }),
      gear("ลูกธนู", "modules/arkane-1920s/items/ammo-arrows.webp", "loot", "20 ดอก", { qty: 20 }),
      gear("Thieves' Tools", "modules/arkane-1920s/items/gear-lockpicks.webp", "loot", "เครื่องมือโจร: สะเดาะกุญแจ ปลดกับดัก"),
      gear("Navigator's Tools", "modules/arkane-1920s/items/gear-sextant.webp", "loot", "เครื่องมือเดินเรือ (จาก Background Merchant)"),
      gear("ชุดผ้าดำ ฮู้ด และผ้าปิดปาก", "modules/arkane-1920s/items/gear-hood.webp", "loot", "ชุดทำงานกลางคืน · ใส่แล้วไม่มีใครจำหน้าได้ (แต่ใส่เดินกลางวันจะดูน่าสงสัยมาก)"),
      feat("Resourceful (Human)", "ได้ Heroic Inspiration ทุกครั้งที่ Long Rest (ทอยใหม่ได้ 1 ครั้ง)"),
      feat("Skillful (Human)", "ได้ทักษะเพิ่ม 1 อย่าง"),
      feat("Lucky", "แต้มโชค 2 แต้ม/Long Rest: ใช้ให้ตัวเองได้เปรียบการทอย d20 หรือให้ศัตรูที่โจมตีตัวเองเสียเปรียบ", 2),
      feat("Versatile: Origin Feat เพิ่ม", "ได้ Origin Feat เพิ่ม 1 อย่าง · ชีทยังไม่ได้ระบุ ให้ผู้เล่นเลือกกับ DM (แนะนำ Alert: Initiative + Proficiency และสลับลำดับกับเพื่อนได้)")
    ]
  }
];
export const PCS_BIO = Object.fromEntries(PCS.map((p) => [p.key, P(p.bio)]));

// starter kit of one PC (physical items only, fresh copies) + starting money, used by "เริ่ม Chapter 1"
export function starterKit(key) {
  const c = PCS.find((p) => p.key === key);
  if (!c) return null;
  return { gp: c.gp ?? 0, items: c.items.filter((i) => i.type !== "feat").map((i) => foundry.utils.deepClone(i)) };
}
export async function createPlayers() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const folder = game.folders.find((f) => f.name === "Arkane 1920s · ผู้เล่น" && f.type === "Actor")
    ?? await Folder.create({ name: "Arkane 1920s · ผู้เล่น", type: "Actor", color: "#801820" });
  let made = 0, updated = 0;
  const report = [];
  // removed: the first player's old Warlock (มอซโซริอน สตาร์วีเวอร์) and the draft Cleric Father Winslow Graves
  const gone = game.actors.filter((a) => ["mozzorion", "winslow"].includes(a.getFlag(MOD, "pc")) || a.getFlag(MOD, "retired") === "mozzorion"
    || /^(Mozzorion|มอซโซริอน)/i.test(a.name));
  for (const old of gone) {
    try {
      for (const u of game.users.filter((u) => u.character?.id === old.id)) await u.update({ character: null });
      for (const s of game.scenes) {
        const ids = s.tokens.filter((t) => t.actorId === old.id).map((t) => t.id);
        if (ids.length) await s.deleteEmbeddedDocuments("Token", ids);
      }
      const name = old.name;
      await old.delete();
      report.push(`${name}: ลบออกแล้ว`);
    } catch (e) { console.warn(MOD, "remove", e); }
  }
  for (const c of PCS) {
    const img = `modules/${MOD}/pcs/${c.key}.webp`, tok = `modules/${MOD}/pcs/${c.key}-token.webp`;
    const user = game.users.find((u) => !u.isGM && c.player.test(u.name));
    const old = game.actors.find((a) => a.getFlag(MOD, "pc") === c.key);
    try {
      if (old) {
        await old.update({ img, "prototypeToken.texture.src": tok });
        if (c.later && old.getFlag(MOD, "later") === undefined) await old.setFlag(MOD, "later", true);
        const junk = old.items.filter((i) => ["Sorcery (เวท)", "Pact Magic (เวท)"].includes(i.name)).map((i) => i.id);
        if (junk.length) await old.deleteEmbeddedDocuments("Item", junk);
        const g = await grantSpells(old, c.key);
        if (g) report.push(`${c.name}: เพิ่มเวทและความสามารถ ${g} อย่าง`);
        updated++; continue;
      }
      const skills = Object.fromEntries(c.skills.map((s) => [s, { value: (c.expertise ?? []).includes(s) ? 2 : 1 }]));
      const abilities = Object.fromEntries(ABS.map((a, i) => [a, { value: c.ab[i], proficient: c.saves.includes(a) ? 1 : 0 }]));
      const ownership = { default: 0 };
      if (user) ownership[user.id] = 3;
      const actor = await Actor.create({
        name: c.name, type: "character", img, folder: folder.id, ownership,
        system: {
          abilities, skills,
          attributes: { ac: c.acCalc ? { calc: c.acCalc } : { calc: "flat", flat: c.ac }, ...(c.init ? { init: { bonus: c.init } } : {}), hp: { value: c.hp, max: c.hp }, movement: { walk: 30 }, spellcasting: c.cast ?? "cha",
            senses: { darkvision: c.darkvision ?? 60, ranges: { darkvision: c.darkvision ?? 60 } } },
          traits: { weaponProf: { value: c.weaponProf ?? ["sim"] }, armorProf: { value: c.armorProf ?? [] }, ...(c.dr ? { dr: { value: c.dr } } : {}) },
          currency: { gp: c.gp ?? 0 },
          details: { biography: { value: P(c.bio) } }
        },
        prototypeToken: { name: c.name, actorLink: true, disposition: 1, displayName: 30, displayBars: 30, bar1: { attribute: "attributes.hp" },
          texture: { src: tok }, sight: { enabled: true, range: c.darkvision ?? 60, visionMode: (c.darkvision ?? 60) ? "darkvision" : "basic" } }
      });
      await actor.setFlag(MOD, "pc", c.key);
      if (c.later) await actor.setFlag(MOD, "later", true);
      try { await actor.createEmbeddedDocuments("Item", [c.cls]); } catch (e) { console.warn(MOD, "class", e); }
      await actor.createEmbeddedDocuments("Item", c.items);
      await grantSpells(actor, c.key);
      await actor.update({ "system.attributes.hp.value": c.hp, "system.attributes.hp.max": c.hp });
      if (user && !user.character) await user.update({ character: actor.id });
      report.push(`${c.name}: ${user ? "ผูกกับผู้ใช้ " + user.name : "ยังไม่ได้ผูกผู้ใช้ (ตั้ง Ownership เอง)"}`);
      made++;
    } catch (e) { console.error(MOD, "pc", c.name, e); }
  }
  ui.notifications.info(`ตัวละครผู้เล่น: สร้างใหม่ ${made} · อัปเดตรูป ${updated} (โฟลเดอร์ Arkane 1920s · ผู้เล่น)`);
  if (report.length) ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card"><div class="rw-title">ตัวละครผู้เล่น</div>${report.join("<br>")}<br><i>เวทและความสามารถใส่ให้ครบแล้ว</i></div>` });
}
