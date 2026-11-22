// Level 1–5 plans for every class (PHB 2024, plus Artificer), with one subclass picked to fit Arkane 1920s
// (noir investigation + cosmic horror + guns). Used by the "เลเวลอัพ" macro for any character whose class has a plan,
// and by the Character Ledger importer to grant level-1 features and spells.
// Uses formulas are native dnd5e formulas, so they grow with level/ability automatically.

// spell: [name, Thai summary, level, school, activation, range ft (0 touch, -1 self), activity, method?]
const atk = (kind, n, d, type) => ({ type: "attack", attack: { type: { value: kind, classification: "spell" } }, damage: { parts: [{ number: n, denomination: d, types: [type] }] } });
const sav = (ab, n, d, type) => ({ type: "save", save: { ability: [ab], dc: { calculation: "spellcasting" } }, damage: n ? { parts: [{ number: n, denomination: d, types: [type] }] } : { parts: [] } });
const heal = (n, d) => ({ type: "heal", healing: { number: n, denomination: d, bonus: "@mod", types: ["healing"] } });
const dmg = (n, d, type, bonus = "") => ({ type: "damage", damage: { parts: [{ number: n, denomination: d, bonus, types: [type] }] } });
const util = () => ({ type: "utility" });
const S = (name, th, lvl, school, act, range, activity, method = "spell") => ({ name, th, method, fb: [lvl, school, act, range, activity] });
// feature: name, Thai text, uses (formula) , effects [[name, [[key, mode, value]]]], recovery period
const F = (name, desc, uses, effects, per) => ({ name, desc, uses, effects, per });
const LR = "lr", SR = "sr";
const PROF = "@prof", CHA = "max(1, @abilities.cha.mod)", WIS = "max(1, @abilities.wis.mod)", INT = "max(1, @abilities.int.mod)", LVL = "@details.level";

// common spells (fallbacks only matter when no compendium has the spell)
const SP = {
  firebolt: S("Fire Bolt", "ยิงไฟ 120 ฟุต · 1d10 ไฟ", 0, "evo", "action", 120, atk("rsak", 1, 10, "fire")),
  magehand: S("Mage Hand", "มือผีหยิบของไกล 30 ฟุต", 0, "conj", "action", 30, util()),
  light: S("Light", "ทำให้ของชิ้นหนึ่งเรืองแสง 20 ฟุต", 0, "evo", "action", 0, util()),
  presti: S("Prestidigitation", "เวทเล็กๆ จุดไฟ ทำความสะอาด ทำเครื่องหมาย", 0, "trs", "action", 10, util()),
  minorill: S("Minor Illusion", "ภาพหรือเสียงลวง 1 นาที", 0, "ill", "action", 30, util()),
  mockery: S("Vicious Mockery", "ด่าเจ็บถึงใจ เซฟ WIS · 1d6 พลังจิต และเสียเปรียบโจมตีครั้งถัดไป", 0, "enc", "action", 60, sav("wis", 1, 6, "psychic")),
  guidance: S("Guidance", "เพื่อนได้ +1d4 กับการเช็คทักษะ", 0, "div", "action", 0, util()),
  sacred: S("Sacred Flame", "เปลวไฟศักดิ์สิทธิ์ เซฟ DEX · 1d8 รังสี", 0, "evo", "action", 60, sav("dex", 1, 8, "radiant")),
  toll: S("Toll the Dead", "เสียงระฆังมรณะ เซฟ WIS · 1d8 (1d12 ถ้าเป้าบาดเจ็บ) เนโครติก", 0, "necro", "action", 60, sav("wis", 1, 8, "necrotic")),
  druidcraft: S("Druidcraft", "เวทธรรมชาติเล็กๆ ทำนายอากาศ ทำให้ดอกไม้บาน", 0, "trs", "action", 30, util()),
  produce: S("Produce Flame", "เปลวไฟในมือ ขว้าง 60 ฟุต · 1d8 ไฟ", 0, "conj", "bonus", -1, atk("rsak", 1, 8, "fire")),
  frost: S("Ray of Frost", "ลำแสงเย็น 60 ฟุต · 1d8 ความเย็น และความเร็วลด 10 ฟุต", 0, "evo", "action", 60, atk("rsak", 1, 8, "cold")),
  eb: S("Eldritch Blast", "ลำแสงจากห้วงลึก 120 ฟุต · 1d10 Force", 0, "evo", "action", 120, atk("rsak", 1, 10, "force")),
  mending: S("Mending", "ซ่อมของแตกหักเล็กๆ (ปืนติดขัดก็ได้)", 0, "trs", "action", 0, util()),
  mindsliver: S("Mind Sliver", "เซฟ INT · 1d6 พลังจิต และลบ 1d4 จากเซฟครั้งถัดไป", 0, "ench", "action", 60, sav("int", 1, 6, "psychic")),
  healword: S("Healing Word", "Bonus Action ฮีลเพื่อนไกล 60 ฟุต · 2d4 + ค่าเวท", 1, "abj", "bonus", 60, heal(2, 4)),
  cure: S("Cure Wounds", "สัมผัสฮีล 2d8 + ค่าเวท", 1, "abj", "action", 0, heal(2, 8)),
  bless: S("Bless", "เพื่อน 3 คนได้ +1d4 โจมตีและเซฟ 1 นาที", 1, "ench", "action", 30, util()),
  whispers: S("Dissonant Whispers", "กระซิบจากใต้ทะเล เซฟ WIS · 3d6 พลังจิต และต้องวิ่งหนี", 1, "ench", "action", 60, sav("wis", 3, 6, "psychic")),
  charm: S("Charm Person", "เซฟ WIS ไม่ผ่านเป้าเป็นมิตรกับคุณ 1 ชั่วโมง · สอบปากคำง่ายขึ้น", 1, "ench", "action", 30, sav("wis", 0)),
  faerie: S("Faerie Fire", "แสงเรืองลูกบาศก์ 20 ฟุต ศัตรูที่ติดถูกตีได้เปรียบ", 1, "evo", "action", 60, sav("dex", 0)),
  guiding: S("Guiding Bolt", "ลำแสง 120 ฟุต · 4d6 รังสี และการโจมตีครั้งถัดไปใส่เป้าได้เปรียบ", 1, "evo", "action", 120, atk("rsak", 4, 6, "radiant")),
  shieldfaith: S("Shield of Faith", "Bonus Action เป้า AC +2 10 นาที", 1, "abj", "bonus", 60, util()),
  entangle: S("Entangle", "เถาวัลย์รัดพื้นที่ 20 ฟุต เซฟ STR ไม่ผ่านติด Restrained", 1, "conj", "action", 90, sav("str", 0)),
  thunder: S("Thunderwave", "คลื่นเสียงลูกบาศก์ 15 ฟุต เซฟ CON · 2d8 Thunder และกระเด็น 10 ฟุต", 1, "evo", "action", -1, sav("con", 2, 8, "thunder")),
  missile: S("Magic Missile", "ลูกดอก 3 ดอกโดนแน่นอน ดอกละ 1d4+1 Force", 1, "evo", "action", 120, dmg(3, 4, "force", "3")),
  shield: S("Shield", "Reaction AC +5 จนถึงต้นเทิร์นถัดไป", 1, "abj", "reaction", -1, util()),
  detect: S("Detect Magic", "รับรู้เวทในระยะ 30 ฟุต (ร่ายพิธีกรรมได้)", 1, "div", "action", -1, util()),
  magearmor: S("Mage Armor", "AC เป็น 13 + DEX 8 ชั่วโมง (ไม่ใส่เกราะ)", 1, "abj", "action", 0, util()),
  sleep: S("Sleep", "เซฟ WIS รัศมี 5 ฟุต ไม่ผ่านง่วงจนหลับ", 1, "ench", "action", 60, sav("wis", 0)),
  familiar: S("Find Familiar", "เรียกสัตว์รับใช้วิญญาณ เช่น อีกาหรือแมว (พิธีกรรม)", 1, "conj", "action", 10, util()),
  hex: S("Hex", "Bonus Action สาปเป้า โจมตีโดนเพิ่ม 1d6 เนโครติก", 1, "ench", "bonus", 90, dmg(1, 6, "necrotic")),
  agathys: S("Armor of Agathys", "ได้ HP ชั่วคราว 5 ใครตีโดนประชิดโดน 5 ความเย็น", 1, "abj", "action", -1, util()),
  laughter: S("Tasha's Hideous Laughter", "เซฟ WIS ไม่ผ่านหัวเราะจนล้ม (Incapacitated)", 1, "ench", "action", 30, sav("wis", 0)),
  huntmark: S("Hunter's Mark", "Bonus Action หมายหัวเป้า โจมตีโดนเพิ่ม 1d6 Force", 1, "div", "bonus", 90, dmg(1, 6, "force")),
  ensnare: S("Ensnaring Strike", "Bonus Action ตีโดนแล้วเถาหนามรัด เซฟ STR", 1, "conj", "bonus", -1, sav("str", 1, 6, "piercing")),
  searing: S("Searing Smite", "ฟันโดนเพิ่ม 1d6 ไฟ และเป้าติดไฟต่อเนื่อง", 1, "evo", "bonus", -1, dmg(1, 6, "fire")),
  divsmite: S("Divine Smite", "Bonus Action หลังตีโดน เพิ่ม 2d8 รังสี (+1d8 ใส่อันเดด/ปีศาจ)", 1, "evo", "bonus", -1, dmg(2, 8, "radiant")),
  bane: S("Bane", "ศัตรู 3 ตัวเซฟ CHA ไม่ผ่าน ลบ 1d4 จากโจมตีและเซฟ", 1, "ench", "action", 30, sav("cha", 0)),
  grease: S("Grease", "พื้นลื่น 10 ฟุต เซฟ DEX ไม่ผ่านล้ม", 1, "conj", "action", 60, sav("dex", 0)),
  burning: S("Burning Hands", "เปลวไฟกรวย 15 ฟุต เซฟ DEX · 3d6 ไฟ", 1, "evo", "action", -1, sav("dex", 3, 6, "fire")),
  fogcloud: S("Fog Cloud", "หมอกหนารัศมี 20 ฟุต", 1, "conj", "action", 120, util()),
  disguise: S("Disguise Self", "เปลี่ยนหน้าตา 1 ชั่วโมง", 1, "ill", "action", -1, util()),
  silent: S("Silent Image", "ภาพลวงขนาด 15 ฟุต 10 นาที", 1, "ill", "action", 60, util()),
  holdperson: S("Hold Person", "เซฟ WIS ไม่ผ่านมนุษย์ติด Paralyzed", 2, "ench", "action", 60, sav("wis", 0)),
  thoughts: S("Detect Thoughts", "อ่านความคิดคนรอบตัว 30 ฟุต · สอบสวนพยานดีที่สุด", 2, "div", "action", -1, util()),
  invis: S("Invisibility", "เป้าล่องหน 1 ชั่วโมง (ตีหรือร่ายแล้วหลุด)", 2, "ill", "action", 0, util()),
  misty: S("Misty Step", "Bonus Action วาร์ป 30 ฟุต", 2, "conj", "bonus", -1, util()),
  spiritual: S("Spiritual Weapon", "Bonus Action อาวุธผีลอยตี 1d8 + ค่าเวท Force", 2, "evo", "bonus", 60, atk("msak", 1, 8, "force")),
  lesser: S("Lesser Restoration", "รักษาสถานะ Blinded, Deafened, Paralyzed หรือ Poisoned", 2, "abj", "action", 0, util()),
  aid: S("Aid", "เพื่อน 3 คน HP สูงสุด +5 8 ชั่วโมง", 2, "abj", "action", 30, util()),
  scorch: S("Scorching Ray", "ลำแสงไฟ 3 ลำ ลำละ 2d6", 2, "evo", "action", 120, atk("rsak", 2, 6, "fire")),
  shatter: S("Shatter", "เสียงแตกรัศมี 10 ฟุต เซฟ CON · 3d8 Thunder", 2, "evo", "action", 60, sav("con", 3, 8, "thunder")),
  moonbeam: S("Moonbeam", "ลำแสงจันทร์ เซฟ CON · 2d10 รังสี ทุกเทิร์น", 2, "evo", "action", 120, sav("con", 2, 10, "radiant")),
  gust: S("Gust of Wind", "ลมแรงเส้นตรง 60 ฟุต ผลักศัตรู", 2, "evo", "action", -1, sav("str", 0)),
  web: S("Web", "ใยหนาลูกบาศก์ 20 ฟุต เซฟ DEX ไม่ผ่าน Restrained", 2, "conj", "action", 60, sav("dex", 0)),
  seeinvis: S("See Invisibility", "มองเห็นสิ่งล่องหนและมิติอื่น 1 ชั่วโมง", 2, "div", "action", -1, util()),
  phantasm: S("Phantasmal Force", "ภาพหลอนในหัวเป้า เซฟ INT · 2d8 พลังจิต", 2, "ill", "action", 60, sav("int", 2, 8, "psychic")),
  silence: S("Silence", "ทรงกลมเงียบ 20 ฟุต ร่ายเวทที่ต้องพูดไม่ได้", 2, "ill", "action", 120, util()),
  passtrace: S("Pass without Trace", "ทั้งทีม Stealth +10 1 ชั่วโมง", 2, "abj", "action", -1, util()),
  spikes: S("Spike Growth", "พื้นหนามรัศมี 20 ฟุต เดินผ่านโดน 2d4 ทุก 5 ฟุต", 2, "trs", "action", 150, util()),
  fireball: S("Fireball", "ลูกไฟรัศมี 20 ฟุต เซฟ DEX · 8d6 ไฟ", 3, "evo", "action", 150, sav("dex", 8, 6, "fire")),
  counter: S("Counterspell", "Reaction ยกเลิกเวทศัตรู · ใช้กับพิธีกรรมลัทธิ", 3, "abj", "reaction", 60, sav("con", 0)),
  dispel: S("Dispel Magic", "ลบเวทหรือผลเวทบนเป้า", 3, "abj", "action", 120, util()),
  hypno: S("Hypnotic Pattern", "ลวดลายสะกด ลูกบาศก์ 30 ฟุต เซฟ WIS ไม่ผ่าน Incapacitated", 3, "ill", "action", 120, sav("wis", 0)),
  guardians: S("Spirit Guardians", "วิญญาณคุ้มกันรัศมี 15 ฟุต เซฟ WIS · 3d8 รังสี", 3, "conj", "action", -1, sav("wis", 3, 8, "radiant")),
  revivify: S("Revivify", "ชุบชีวิตคนที่ตายไม่เกิน 1 นาที (ใช้เพชร $300)", 3, "necro", "action", 0, util()),
  daylight: S("Daylight", "แสงแดดรัศมี 60 ฟุต ลบความมืดเวท", 3, "evo", "action", 60, util()),
  lightning: S("Lightning Bolt", "สายฟ้าเส้นตรง 100 ฟุต เซฟ DEX · 8d6", 3, "evo", "action", -1, sav("dex", 8, 6, "lightning")),
  callLight: S("Call Lightning", "เมฆพายุ เรียกสายฟ้า เซฟ DEX · 3d10 ทุกเทิร์น", 3, "conj", "action", 120, sav("dex", 3, 10, "lightning")),
  waterbreath: S("Water Breathing", "10 คนหายใจใต้น้ำได้ 24 ชั่วโมง", 3, "trs", "action", 30, util()),
  clair: S("Clairvoyance", "มองหรือฟังจากจุดที่รู้จักไกล 1 ไมล์", 3, "div", "action", -1, util()),
  hadar: S("Hunger of Hadar", "ความมืดจากห้วงลึกรัศมี 20 ฟุต · 2d6 ความเย็นทุกเทิร์น", 3, "conj", "action", 150, sav("dex", 2, 6, "cold")),
  findsteed: S("Find Steed", "เรียกพาหนะวิญญาณ (ม้าหรือรถมอเตอร์ไซค์วิญญาณ ตามที่ DM อนุญาต)", 2, "conj", "action", 30, util()),
  revivAid: S("Sending", "ส่งข้อความ 25 คำถึงคนที่รู้จัก", 3, "div", "action", -1, util())
};
const AE = (name, ...ch) => [name, ch];

export const CLASSPLANS = {
  barbarian: {
    title: "Barbarian · สายคลั่งสนามเพลาะ (Path of the Berserker)", hpDie: 7, ac: "unarmoredBarb",
    1: { features: [F("Rage", "Bonus Action เข้าสู่ความคลั่ง 10 นาที: ดาเมจอาวุธ STR +2, ต้านทานดาเมจกายภาพ, ได้เปรียบเช็คและเซฟ STR · ใส่เกราะหนักหรือร่ายเวทไม่ได้", "2"),
      F("Unarmored Defense", "ไม่ใส่เกราะ AC = 10 + DEX + CON (ระบบตั้งให้)"), F("Weapon Mastery", "ใช้คุณสมบัติ Mastery ของอาวุธ 2 ชนิด เช่น ขวาน Cleave, กระบอง Topple")] },
    2: { features: [F("Danger Sense", "ได้เปรียบเซฟ DEX (ถ้าไม่ติด Incapacitated) · หลบระเบิดและกับดัก"), F("Reckless Attack", "โจมตีแบบไม่ห่วงตัว: ได้เปรียบโจมตี STR แต่ศัตรูตีคุณได้เปรียบจนเทิร์นหน้า")] },
    3: { features: [F("Path of the Berserker", "อดีตทหารที่สติแตกในสนามเพลาะ ความคลั่งคือเกราะเดียวที่เหลือ"),
      F("Frenzy", "ใช้ Reckless Attack ระหว่างคลั่ง: การตีโดนครั้งแรกของเทิร์นเพิ่ม 2d6 ดาเมจ"), F("Primal Knowledge", "ได้ทักษะเพิ่ม 1 อย่าง (เลือกกับ DM) และใช้ STR แทนได้บางเช็คระหว่างคลั่ง")], uses: { Rage: "3" } },
    4: { asi: { str: 2 }, features: [F("Ability Score Improvement", "STR +2")] },
    5: { features: [F("Extra Attack", "Action โจมตีได้ 2 ครั้ง"), F("Fast Movement", "ไม่ใส่เกราะหนัก ความเร็ว +10 ฟุต (ระบบใส่ให้)", null, [AE("Fast Movement", ["system.attributes.movement.walk", 2, "10"])])] }
  },
  bard: {
    title: "Bard · นักสืบนักเล่าเรื่อง (College of Lore)", hpDie: 5,
    1: { features: [F("Bardic Inspiration", "Bonus Action ให้เพื่อนลูกเต๋า d6 บวกเช็ค โจมตี หรือเซฟ 1 ครั้ง", CHA)],
      spells: [SP.mockery, SP.minorill, SP.healword, SP.whispers, SP.charm, SP.faerie] },
    2: { features: [F("Expertise", "เลือก 2 ทักษะที่ชำนาญ โบนัสคูณสอง (แนะนำ Persuasion, Insight)"), F("Jack of All Trades", "เช็คทักษะที่ไม่ชำนาญ บวกครึ่งหนึ่งของค่าชำนาญ (ปัดลง)")],
      update: { "system.attributes.jackOfAllTrades": true, "flags.dnd5e.jackOfAllTrades": true }, spells: [SP.laughter] },
    3: { features: [F("College of Lore", "นักข่าว นักประวัติศาสตร์ หรือนักร้องที่รู้ทุกความลับของเมือง"), F("Bonus Proficiencies", "ได้ทักษะเพิ่ม 3 อย่าง (เลือกกับ DM)"),
      F("Cutting Words", "Reaction: ใช้ Bardic Inspiration ลบจากโจมตี ดาเมจ หรือเช็คของศัตรูที่เห็นในระยะ 60 ฟุต")], spells: [SP.holdperson, SP.thoughts] },
    4: { asi: { cha: 2 }, features: [F("Ability Score Improvement", "CHA +2")], spells: [SP.magehand, SP.silence] },
    5: { features: [F("Font of Inspiration", "Bardic Inspiration ได้คืนทั้ง Short Rest และ Long Rest · ลูกเต๋าเป็น d8")], spells: [SP.hypno, SP.dispel], per: { "Bardic Inspiration": SR } }
  },
  cleric: {
    title: "Cleric · นักบวชแห่งแสง (Light Domain)", hpDie: 5,
    1: { features: [F("Divine Order: Protector", "ใส่เกราะหนักได้ และใช้อาวุธ Martial ได้ · ยืนหน้าปกป้องเพื่อนที่ตัวบาง")],
      update: { "system.traits.armorProf.value": ["lgt", "med", "hvy", "shl"], "system.traits.weaponProf.value": ["sim", "mar"] },
      spells: [SP.guidance, SP.sacred, SP.light, SP.bless, SP.cure, SP.guiding, SP.shieldfaith] },
    2: { features: [F("Channel Divinity", "ใช้พลังศักดิ์สิทธิ์: Divine Spark (ฮีลหรือทำดาเมจ 1d8 + WIS) หรือ Turn Undead", "2", null, SR)] },
    3: { features: [F("Light Domain", "แสงคือสิ่งที่สิ่งในความมืดกลัวที่สุด"), F("Warding Flare", "Reaction: ศัตรูในระยะ 30 ฟุตโจมตีคุณหรือเพื่อน ทำให้เสียเปรียบ", WIS),
      F("Radiance of the Dawn", "ใช้ Channel Divinity: แสงรัศมี 30 ฟุต ลบความมืดเวท ศัตรูเซฟ CON · 2d10 + เลเวล รังสี")],
      spells: [SP.burning, SP.faerie, SP.scorch, SP.seeinvis, SP.spiritual, SP.lesser] },
    4: { asi: { wis: 2 }, features: [F("Ability Score Improvement", "WIS +2")], spells: [SP.toll, SP.aid] },
    5: { features: [F("Sear Undead", "Turn Undead ทำดาเมจรังสีเพิ่มเท่า WIS d8")], spells: [SP.daylight, SP.fireball, SP.guardians, SP.revivify] }
  },
  druid: {
    title: "Druid · ผู้พิทักษ์ทะเล (Circle of the Sea)", hpDie: 5,
    1: { features: [F("Druidic", "ภาษาลับของดรูอิด"), F("Primal Order: Warden", "ใส่เกราะกลางได้ และใช้อาวุธ Martial ได้")],
      update: { "system.traits.armorProf.value": ["lgt", "med", "shl"], "system.traits.weaponProf.value": ["sim", "mar"] },
      spells: [SP.druidcraft, SP.produce, SP.healword, SP.entangle, SP.faerie, SP.thunder] },
    2: { features: [F("Wild Shape", "Bonus Action แปลงเป็นสัตว์ที่เคยเห็น (CR ไม่เกิน 1/4 ไม่บิน) นานครึ่งเลเวลชั่วโมง", "2", null, SR), F("Wild Companion", "ใช้ Wild Shape ร่าย Find Familiar โดยไม่ใช้ช่องเวท")] },
    3: { features: [F("Circle of the Sea", "รู้จักทะเลดีกว่าใคร จึงรู้ว่ามีอะไรตื่นอยู่ข้างใต้"),
      F("Wrath of the Sea", "ใช้ Wild Shape: ละอองทะเลรอบตัว 5 ฟุต 10 นาที · Bonus Action ศัตรูเซฟ CON · WIS d6 ความเย็นและถูกผลัก 15 ฟุต")],
      spells: [SP.frost, SP.fogcloud, SP.gust, SP.shatter, SP.moonbeam] },
    4: { asi: { wis: 2 }, features: [F("Ability Score Improvement", "WIS +2")], spells: [SP.guidance], uses: { "Wild Shape": "3" } },
    5: { features: [F("Wild Resurgence", "หมด Wild Shape ใช้ช่องเวทแลกคืนได้ 1 ครั้ง/Long Rest")], spells: [SP.lightning, SP.waterbreath, SP.callLight] }
  },
  fighter: {
    title: "Fighter · ทหารผ่านศึกนักยุทธวิธี (Battle Master)", hpDie: 6,
    1: { features: [F("Fighting Style: Archery", "ยิงปืนและธนู ทอยโจมตี +2 (ระบบใส่ให้)", null, [AE("Archery", ["system.bonuses.rwak.attack", 2, "+2"])]),
      F("Second Wind", "Bonus Action ฟื้น 1d10 + เลเวล HP", "2", null, SR), F("Weapon Mastery", "ใช้ Mastery ของอาวุธ 3 ชนิด")] },
    2: { features: [F("Action Surge", "ได้ Action เพิ่ม 1 ครั้งในเทิร์นนั้น", "1", null, SR), F("Tactical Mind", "เช็คทักษะพลาด ใช้ Second Wind บวก 1d10 แทนการฮีล")] },
    3: { features: [F("Battle Master", "ทหารที่รอดจากสนามเพลาะเพราะคิดเร็วกว่าศัตรู"), F("Combat Superiority", "ลูกเต๋าสุพีเรียริตี d8 จำนวน 4 ลูก ใช้กับท่า Maneuver", "4", null, SR),
      F("Maneuvers", "Precision Attack (บวกลูกเต๋าให้การโจมตี) · Trip Attack (เป้าเซฟ STR ไม่ผ่านล้ม) · Riposte (Reaction สวนกลับเมื่อศัตรูตีพลาด)"),
      F("Student of War", "ชำนาญเครื่องมือช่าง 1 ชนิด และทักษะเพิ่ม 1 อย่าง")] },
    4: { asi: { best: ["str", "dex"], n: 2 }, features: [F("Ability Score Improvement", "ค่าหลัก (STR หรือ DEX ที่สูงกว่า) +2")] },
    5: { features: [F("Extra Attack", "Action โจมตีได้ 2 ครั้ง"), F("Tactical Shift", "ใช้ Second Wind แล้วเดินได้ครึ่งความเร็วโดยไม่โดนตีสวน")] }
  },
  monk: {
    title: "Monk · นักสู้ในเงา (Warrior of Shadow)", hpDie: 5, ac: "unarmoredMonk",
    1: { features: [F("Martial Arts", "หมัดและอาวุธ Monk ใช้ DEX · ดาเมจ 1d6 · ตีเพิ่ม 1 ครั้งด้วย Bonus Action"), F("Unarmored Defense", "ไม่ใส่เกราะ AC = 10 + DEX + WIS (ระบบตั้งให้)")] },
    2: { features: [F("Monk's Focus", "แต้ม Focus เท่าเลเวล: Flurry of Blows (ตี 2 ครั้ง), Patient Defense (Disengage+Dodge), Step of the Wind (Dash+Disengage กระโดดไกลขึ้น)", LVL, null, SR),
      F("Unarmored Movement", "ไม่ใส่เกราะ ความเร็ว +10 ฟุต (ระบบใส่ให้)", null, [AE("Unarmored Movement", ["system.attributes.movement.walk", 2, "10"])]), F("Uncanny Metabolism", "ทอย Initiative แล้วได้ Focus คืนทั้งหมดและฟื้น HP 1 ครั้ง/Long Rest", "1")] },
    3: { features: [F("Deflect Attacks", "Reaction ลดดาเมจกายภาพ 1d10 + DEX + เลเวล · ลดเหลือ 0 ใช้ Focus 1 แต้มเหวี่ยงกลับ"),
      F("Warrior of Shadow", "ฝึกจากสำนักใต้ดินในย่านจีนของอาร์คเคน"), F("Shadow Arts", "ใช้ Focus 1 แต้มร่าย Darkness · มองทะลุความมืดเวทได้ · Darkvision 60 ฟุต")], spells: [SP.minorill] },
    4: { asi: { dex: 2 }, features: [F("Ability Score Improvement", "DEX +2"), F("Slow Fall", "Reaction ลดดาเมจตกจากที่สูง 5 × เลเวล")] },
    5: { features: [F("Extra Attack", "Action โจมตีได้ 2 ครั้ง"), F("Stunning Strike", "ตีโดน ใช้ Focus 1 แต้ม เป้าเซฟ CON ไม่ผ่าน Stunned · Martial Arts ดาเมจเป็น 1d8")] }
  },
  paladin: {
    title: "Paladin · ผู้ล่าลัทธิ (Oath of Vengeance)", hpDie: 6,
    1: { features: [F("Lay on Hands", "แต้มรักษา 5 × เลเวล สัมผัสฮีลหรือรักษาพิษ", "@details.level * 5"), F("Weapon Mastery", "ใช้ Mastery ของอาวุธ 2 ชนิด")],
      spells: [SP.bless, SP.searing] },
    2: { features: [F("Fighting Style: Defense", "ใส่เกราะ AC +1 (ระบบใส่ให้)", null, [AE("Defense", ["system.attributes.ac.bonus", 2, "+1"])]), F("Paladin's Smite", "รู้ Divine Smite ติดตัว ร่ายฟรี 1 ครั้ง/Long Rest")],
      spells: [SP.divsmite, SP.shieldfaith] },
    3: { features: [F("Channel Divinity", "Divine Sense: รู้ตำแหน่งปีศาจ อันเดด และสิ่งจากห้วงลึกในระยะ 60 ฟุต", "2", null, SR),
      F("Oath of Vengeance", "สาบานจะล้างลัทธิที่พรากคนที่รักไป"), F("Vow of Enmity", "ใช้ Channel Divinity: ได้เปรียบโจมตีเป้าหนึ่ง 1 นาที")], spells: [SP.bane, SP.huntmark] },
    4: { asi: { best: ["str", "dex"], n: 2 }, features: [F("Ability Score Improvement", "ค่าหลัก (STR หรือ DEX ที่สูงกว่า) +2")], spells: [SP.cure] },
    5: { features: [F("Extra Attack", "Action โจมตีได้ 2 ครั้ง"), F("Faithful Steed", "รู้ Find Steed ติดตัว ร่ายฟรี 1 ครั้ง/Long Rest")], spells: [SP.holdperson, SP.misty, SP.findsteed, SP.aid] }
  },
  ranger: {
    title: "Ranger · นักล่าในเงามืด (Gloom Stalker)", hpDie: 6,
    1: { features: [F("Favored Enemy", "รู้ Hunter's Mark ติดตัว ร่ายฟรีโดยไม่ใช้ช่องเวท", "2"), F("Weapon Mastery", "ใช้ Mastery ของอาวุธ 2 ชนิด")], spells: [SP.huntmark, SP.cure, SP.ensnare] },
    2: { features: [F("Fighting Style: Archery", "ยิงปืนและธนู ทอยโจมตี +2 (ระบบใส่ให้)", null, [AE("Archery", ["system.bonuses.rwak.attack", 2, "+2"])]),
      F("Deft Explorer", "Expertise 1 ทักษะ (แนะนำ Perception หรือ Survival) และรู้ภาษาเพิ่ม 2 ภาษา")], spells: [SP.fogcloud] },
    3: { features: [F("Gloom Stalker", "นักล่าในความมืด สิ่งที่มองในความมืดมองไม่เห็นคุณ"),
      F("Dread Ambusher", "Initiative + WIS · เทิร์นแรกเดินเพิ่ม 10 ฟุต · Dreadful Strike: ตีโดนเพิ่ม 2d6 พลังจิต", WIS),
      F("Umbral Sight", "Darkvision 60 ฟุต (หรือ +60 ถ้ามีอยู่แล้ว) · อยู่ในความมืด สิ่งที่ใช้ Darkvision มองไม่เห็นคุณ", null, [AE("Umbral Sight", ["system.attributes.senses.darkvision", 4, "60"], ["system.attributes.senses.ranges.darkvision", 4, "60"])])],
      spells: [SP.disguise] },
    4: { asi: { best: ["dex", "wis"], n: 2 }, features: [F("Ability Score Improvement", "ค่าหลัก (DEX หรือ WIS ที่สูงกว่า) +2")] },
    5: { features: [F("Extra Attack", "Action โจมตีได้ 2 ครั้ง")], spells: [SP.passtrace, SP.spikes] }
  },
  rogue: {
    title: "Rogue · จอมโจรแห่งอาร์คเคน (Thief)", hpDie: 5,
    1: { features: [F("Sneak Attack", "1 ครั้งต่อเทิร์น: โจมตีด้วยอาวุธ Finesse หรือระยะไกลแล้วโดน เพิ่ม <b>1d6</b> ถ้าได้เปรียบ หรือมีเพื่อนยืนติดเป้า"),
      F("Expertise", "เลือก 2 ทักษะ โบนัสคูณสอง"), F("Thieves' Cant", "ภาษาลับของโจร อ่านสัญลักษณ์ซินดิเคทตามกำแพงได้"), F("Weapon Mastery", "ใช้ Mastery ของอาวุธ 2 ชนิด")], sneakFeature: 1 },
    2: { features: [F("Cunning Action", "Bonus Action: Dash, Disengage หรือ Hide")] },
    3: { sneak: 2, features: [F("Thief", "นักขโมยมืออาชีพ"), F("Fast Hands", "Bonus Action: Sleight of Hand, Thieves' Tools หรือใช้สิ่งของ"),
      F("Second-Story Work", "ปีนไม่เสียความเร็ว กระโดดไกลขึ้นตาม DEX"), F("Steady Aim", "Bonus Action: ถ้ายังไม่เดิน ได้เปรียบโจมตีครั้งถัดไป")] },
    4: { asi: { dex: 2 }, features: [F("Ability Score Improvement", "DEX +2")] },
    5: { sneak: 3, features: [F("Cunning Strike", "ลดลูกเต๋า Sneak Attack แลกผล: Poison, Trip หรือ Withdraw"), F("Uncanny Dodge", "Reaction ลดดาเมจจากศัตรูที่เห็นครึ่งหนึ่ง")] }
  },
  sorcerer: {
    title: "Sorcerer · ผู้ถูกห้วงลึกแตะต้อง (Aberrant Sorcery)", hpDie: 4,
    1: { features: [F("Innate Sorcery", "Bonus Action 1 นาที: DC เวท +1 และได้เปรียบโจมตีด้วยเวท", "2")], spells: [SP.firebolt, SP.magehand, SP.light, SP.presti, SP.missile, SP.shield] },
    2: { features: [F("Font of Magic", "Sorcery Points เท่าเลเวล แลกเป็นช่องเวทได้ (ช่อง 1 = 2 แต้ม, ช่อง 2 = 3 แต้ม)", LVL), F("Metamagic: Subtle Spell", "1 แต้ม · ร่ายโดยไม่ต้องพูดหรือขยับมือ C.A.A.M. ไม่รู้"),
      F("Metamagic: Quickened Spell", "2 แต้ม · เวท Action เป็น Bonus Action")], spells: [SP.detect] },
    3: { features: [F("Aberrant Sorcery", "พลังมาจากรอยแยก ได้เวทจิตติดตัว"), F("Telepathic Speech", "Bonus Action เชื่อมจิตคุยกับคนในระยะ 30 ฟุต")],
      spells: [SP.mindsliver, SP.whispers, SP.thoughts, SP.misty] },
    4: { asi: { cha: 2 }, features: [F("Ability Score Improvement", "CHA +2")], spells: [SP.holdperson] },
    5: { features: [F("Sorcerous Restoration", "Short Rest ได้ Sorcery Points คืนครึ่งเลเวล 1 ครั้ง/Long Rest")], spells: [SP.hadar, SP.revivAid, SP.fireball, SP.counter] }
  },
  warlock: {
    title: "Warlock · ผู้ทำสัญญากับสิ่งใต้ทะเล (Great Old One)", hpDie: 5, ac: "mage",
    1: { features: [F("Eldritch Invocation: Armor of Shadows", "ร่าย Mage Armor ใส่ตัวเองได้ตลอด AC = 13 + DEX (ระบบตั้งให้)"), F("Pact Magic", "ช่องเวท Warlock ได้คืนทุก Short Rest")],
      spells: [SP.eb, SP.minorill, { ...SP.hex, method: "pact" }, { ...SP.agathys, method: "pact" }] },
    2: { features: [F("Magical Cunning", "พิธี 1 นาที ได้ช่องเวท Pact คืนครึ่งหนึ่ง 1 ครั้ง/Long Rest", "1"), F("Eldritch Invocation: Agonizing Blast", "Eldritch Blast ดาเมจ + CHA (ระบบใส่ให้)"),
      F("Eldritch Invocation: Devil's Sight", "มองเห็นในความมืดและความมืดเวทได้ 120 ฟุต")], agonizing: true },
    3: { features: [F("Great Old One Patron", "ผู้ให้พลังคือสิ่งที่หลับอยู่ใต้มหาสมุทรอาร์คานุม มันรู้จักชื่อคุณ"),
      F("Awakened Mind", "Bonus Action เชื่อมจิตคุยกับคนในระยะ 30 ฟุต"), F("Psychic Spells", "เปลี่ยนดาเมจเวท Warlock เป็นพลังจิตได้ และร่ายเวทจิตโดยไม่ต้องพูด")],
      spells: [{ ...SP.whispers, method: "pact" }, { ...SP.laughter, method: "pact" }, { ...SP.thoughts, method: "pact" }, { ...SP.phantasm, method: "pact" }] },
    4: { asi: { cha: 2 }, features: [F("Ability Score Improvement", "CHA +2")], spells: [SP.mindsliver] },
    5: { features: [F("Eldritch Invocation: Repelling Blast", "Eldritch Blast โดนแล้วผลักเป้า 10 ฟุต")], spells: [{ ...SP.clair, method: "pact" }, { ...SP.hadar, method: "pact" }, { ...SP.counter, method: "pact" }] }
  },
  wizard: {
    title: "Wizard · นักพยากรณ์ (Diviner)", hpDie: 4,
    1: { features: [F("Ritual Adept", "ร่ายเวทพิธีกรรมจากตำราโดยไม่ต้องเตรียม"), F("Arcane Recovery", "Short Rest คืนช่องเวทรวมเลเวลไม่เกินครึ่งเลเวล 1 ครั้ง/Long Rest", "1")],
      spells: [SP.firebolt, SP.magehand, SP.light, SP.missile, SP.shield, SP.detect, SP.magearmor, SP.sleep, SP.familiar] },
    2: { features: [F("Scholar", "Expertise 1 ทักษะ: Arcana, History, Investigation, Medicine, Nature หรือ Religion")], spells: [SP.grease, SP.silent] },
    3: { features: [F("Diviner", "เห็นลางร้ายก่อนใคร ซึ่งในเมืองนี้ไม่ใช่เรื่องดีเสมอไป"), F("Portent", "หลัง Long Rest ทอย d20 สองลูกจดไว้ ใช้แทนการทอยของใครก็ได้ที่เห็น", "2"),
      F("Divination Savant", "คัดลอกเวทสาย Divination ลงตำราได้ถูกและเร็ว")], spells: [SP.misty, SP.thoughts, SP.seeinvis] },
    4: { asi: { int: 2 }, features: [F("Ability Score Improvement", "INT +2")], spells: [SP.mindsliver, SP.web, SP.holdperson] },
    5: { features: [F("Memorize Spell", "Short Rest เปลี่ยนเวทที่เตรียมได้ 1 อย่าง")], spells: [SP.fireball, SP.counter] }
  },
  artificer: {
    title: "Artificer · ช่างปืนเวท (Artillerist)", hpDie: 5,
    1: { features: [F("Tinkerer's Magic", "ใช้เครื่องมือสร้างของเล็กๆ ชั่วคราว (ไฟฉาย เชือก ตะปู)"), F("Magical Tinkering", "ใส่เวทเล็กๆ ลงสิ่งของ: เรืองแสง บันทึกเสียง ส่งกลิ่น")],
      spells: [SP.mending, SP.firebolt, SP.cure, SP.grease, SP.faerie] },
    2: { features: [F("Replicate Magic Item", "สร้างของวิเศษพื้นฐาน 2 ชิ้นหลัง Long Rest (เลือกกับ DM เช่น แว่นมองกลางคืน กระเป๋าใส่ของ)")], spells: [SP.detect] },
    3: { features: [F("Artillerist", "ช่าง Magitech ที่ดัดแปลงปืนสงครามให้ยิงเวทได้"),
      F("Eldritch Cannon", "Action สร้างปืนใหญ่จิ๋ว 1 ชั่วโมง: Flamethrower (กรวย 15 ฟุต 2d8 ไฟ), Force Ballista (2d8 Force ผลัก 5 ฟุต) หรือ Protector (HP ชั่วคราว 1d8 + INT)", "1")],
      spells: [SP.shield, SP.thunder, SP.scorch, SP.shatter] },
    4: { asi: { int: 2 }, features: [F("Ability Score Improvement", "INT +2")], spells: [SP.lesser] },
    5: { features: [F("Arcane Firearm", "สลักปืนเป็นอาวุธเวท: เวทที่ยิงผ่านปืนได้ดาเมจ +1d8")], spells: [SP.aid] }
  }
};
export const CLASS_ALIASES = { barbarian: "barbarian", bard: "bard", cleric: "cleric", druid: "druid", fighter: "fighter", monk: "monk", paladin: "paladin", ranger: "ranger", rogue: "rogue", sorcerer: "sorcerer", warlock: "warlock", wizard: "wizard", artificer: "artificer" };
export function planKey(actor) {
  const cls = actor?.items?.find((i) => i.type === "class");
  const id = String(cls?.system?.identifier || cls?.name || "").toLowerCase().trim();
  return CLASS_ALIASES[id] ?? Object.keys(CLASSPLANS).find((k) => id.includes(k)) ?? null;
}
