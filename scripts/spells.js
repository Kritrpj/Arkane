// Spells + class features for the player characters, granted automatically (no drag & drop).
// Each spell is copied from the dnd5e SRD compendium when found (2024 rules preferred) so its
// activities work out of the box; otherwise a Thai-described fallback is built here.
import { CLASSPLANS, planKey } from "./classplans.js?v=21";
const MOD = "arkane-1920s";
const P = (s) => `<p>${s}</p>`;
const rid = () => foundry.utils.randomID();

// how a spell is cast: "spell" = normal slots, "pact" = warlock slot, "innate" = free 1/Long Rest
export const S = (name, th, method, fb) => ({ name, th, method, fb });
// fallback data: [level, school, actionType, range ft (0 = touch, -1 = self), activity]
const atk = (kind, n, d, type) => ({ type: "attack", attack: { type: { value: kind, classification: "spell" } }, damage: { parts: [{ number: n, denomination: d, types: [type] }] } });
const save = (ab, n, d, type) => ({ type: "save", save: { ability: [ab], dc: { calculation: "spellcasting" } }, damage: n ? { parts: [{ number: n, denomination: d, types: [type] }] } : { parts: [] } });
const heal = (n, d) => ({ type: "heal", healing: { number: n, denomination: d, bonus: "@mod", types: ["healing"] } });
const dmg = (n, d, type) => ({ type: "damage", damage: { parts: [{ number: n, denomination: d, types: [type] }] } });
const util = () => ({ type: "utility" });

export const SPELLBOOK = {
  vivian: {
    title: "Vivian Spencer · ไกด์ผู้อ่านใจคน (Sorcerer)",
    spells: [
      S("Fire Bolt", "ยิงลูกไฟ 120 ฟุต · โจมตีด้วยเวท โดน 1d10 Fire · ตัวโจมตีหลักของเธอ", "spell", [0, "evo", "action", 120, atk("ranged", 1, 10, "fire")]),
      S("Shocking Grasp", "แตะไฟฟ้า · โจมตีด้วยเวทระยะประชิด 1d8 Lightning และเป้าใช้ Reaction ไม่ได้ ใช้หนีออกจากศัตรูประชิดตัว", "spell", [0, "evo", "action", 0, atk("melee", 1, 8, "lightning")]),
      S("Message", "กระซิบหาเพื่อน 120 ฟุต อีกฝ่ายตอบกลับได้ · ประสานทีมในบาร์โดยไม่มีใครได้ยิน", "spell", [0, "trs", "action", 120, util()]),
      S("Minor Illusion", "สร้างเสียงหรือภาพลวงขนาดลัง 5 ฟุต · ทำเสียงนกหวีดตำรวจ หรือสร้างลังไว้หลบ", "spell", [0, "ill", "action", 30, util()]),
      S("Shield", "Reaction เมื่อโดนโจมตี: AC +5 จนถึงเทิร์นถัดไป · สำคัญมากเพราะ HP แค่ 5", "spell", [1, "abj", "reaction", -1, util()]),
      S("Sleep", "เป้าในรัศมี 5 ฟุต ระยะ 60 ฟุต เซฟ WIS ไม่ผ่านติด Incapacitated แล้วหลับ · จบการต่อสู้กับลูกน้องซินดิเคทได้โดยไม่ต้องฆ่า", "spell", [1, "enc", "action", 60, save("wis", 0)]),
      S("Guidance", "(Magic Initiate) แตะเพื่อน +1d4 กับเช็ก 1 ครั้ง · ใช้ตอนสืบสวน ตอนเปิดกุญแจ ตอนโกหก", "spell", [0, "div", "action", 0, util()]),
      S("Druidcraft", "(Magic Initiate) ทำนายอากาศ 24 ชั่วโมง ทำดอกไม้บาน จุดหรือดับเทียน · เหมาะกับอาชีพไกด์", "spell", [0, "trs", "action", 30, util()]),
      S("Healing Word", "(Magic Initiate · ฟรี 1 ครั้ง/Long Rest) Bonus Action รักษาเพื่อนในระยะ 60 ฟุต 2d4 + ค่าเวท · ปลุกเพื่อนที่ล้มได้", "innate", [1, "abj", "bonus", 60, heal(2, 4)]),
      S("Disguise Self", "(Hex Magic · ฟรี 1 ครั้ง/Long Rest) เปลี่ยนหน้าตาและเสื้อผ้า 1 ชั่วโมง · หนีด่าน C.A.A.M.", "innate", [1, "ill", "action", -1, util()]),
      S("Hex", "(Hex Magic · ฟรี 1 ครั้ง/Long Rest) Bonus Action สาปเป้า 90 ฟุต · โจมตีโดนเพิ่ม 1d6 Necrotic และเป้าเสียเปรียบเช็กค่าที่เลือก", "innate", [1, "enc", "bonus", 90, dmg(1, 6, "necrotic")])
    ],
    features: [
      { name: "Innate Sorcery", uses: 2, desc: "Bonus Action ปลุกพลังเวท 1 นาที: Spell Save DC +1 และได้เปรียบการโจมตีด้วยเวท · 2 ครั้ง/Long Rest" },
      { name: "Spellcasting (Sorcerer)", desc: "ร่ายด้วย CHA · ช่องเวทเลเวล 1 จำนวน 2 ช่อง · Cantrip ใช้ได้ไม่จำกัด" }
    ]
  },
  mozxorion: {
    title: "Mozxorion Wildheart · คนคุ้มกันเรือเชื้อสายดราว (Ranger)",
    spells: [
      S("Dancing Lights", "(Drow Magic) ดวงไฟลอยได้ 4 ดวง ระยะ 120 ฟุต · ส่องตรอกมืดหรือล่อศัตรู", "spell", [0, "ill", "action", 120, util()]),
      Object.assign(S("Hunter's Mark", "(Favored Enemy · ฟรี 2 ครั้ง/Long Rest หรือใช้ช่องเวท) Bonus Action หมายหัวเป้า 90 ฟุต · โจมตีโดนเพิ่ม 1d6 Force และได้เปรียบตอนตามรอยเป้า · ใช้คู่กับธนูทุกนัด", "innate", [1, "div", "bonus", 90, dmg(1, 6, "force")]), { uses: 2 }),
      S("Cure Wounds", "แตะเพื่อน รักษา 2d8 + WIS · ปาร์ตี้นี้ต้องการคนรักษาเพิ่ม", "spell", [1, "abj", "action", 0, heal(2, 8)]),
      S("Ensnaring Strike", "Bonus Action ก่อนยิง: โดนแล้วเถาวัลย์รัดเป้า เซฟ STR ไม่ผ่านติด Restrained และโดน 1d6 ทุกเทิร์น · หยุดคนที่กำลังหนี", "spell", [1, "conj", "bonus", -1, save("str", 1, 6, "piercing")])
    ],
    features: [
      { name: "Spellcasting (Ranger)", desc: "ร่ายด้วย WIS · ช่องเวทเลเวล 1 จำนวน 2 ช่อง · เตรียมเวทได้ 2 อย่าง + Hunter's Mark ติดตัว" },
      { name: "Favored Enemy", desc: "Hunter's Mark ติดตัวเสมอ ร่ายฟรี 2 ครั้ง/Long Rest (ระบบนับให้ในเวท)" },
      { name: "Weapon Mastery", desc: "ใช้ความสามารถพิเศษของอาวุธ 2 ชนิด: ธนูยาว (Slow: เป้าช้าลง 10 ฟุต) และดาบโค้ง (Nick: โจมตีดาบสั้นเพิ่มใน Action เดียวกัน)" }
    ]
  },
  windows: {
    title: "Windowส์ · ตำรวจคนกระต่ายจากชนบท (Ranger)",
    spells: [
      Object.assign(S("Hunter's Mark", "(Favored Enemy · ฟรี 2 ครั้ง/Long Rest หรือใช้ช่องเวท) Bonus Action หมายหัวผู้ต้องสงสัย 90 ฟุต · โจมตีโดนเพิ่ม 1d6 Force และได้เปรียบ Perception/Survival ตอนตามรอยเป้า", "innate", [1, "div", "bonus", 90, dmg(1, 6, "force")]), { uses: 2 }),
      S("Ensnaring Strike", "Bonus Action ก่อนโจมตี: โดนแล้วเถาวัลย์รัด เซฟ STR ไม่ผ่านติด Restrained และโดน 1d6 ทุกเทิร์น · จับคนร้ายที่กำลังหนี", "spell", [1, "conj", "bonus", -1, save("str", 1, 6, "piercing")]),
      S("Cure Wounds", "แตะเพื่อน รักษา 2d8 + WIS", "spell", [1, "abj", "action", 0, heal(2, 8)])
    ],
    features: [
      { name: "Spellcasting (Ranger)", desc: "ร่ายด้วย WIS · ช่องเวทเลเวล 1 จำนวน 2 ช่อง · เตรียมเวทได้ 2 อย่าง (Ensnaring Strike, Cure Wounds) + Hunter's Mark ติดตัว · ใช้กิ่งมิสเซิลโทเป็นสื่อ" },
      { name: "Favored Enemy", desc: "Hunter's Mark ติดตัวเสมอ ร่ายฟรี 2 ครั้ง/Long Rest (ระบบนับให้ในเวท)" },
      { name: "Weapon Mastery", desc: "ธนูยาว (Slow: เป้าช้าลง 10 ฟุต) และดาบสั้น (Vex: โดนแล้วได้เปรียบโจมตีเป้าเดิมครั้งถัดไป)" }
    ]
  },
  heinz: {
    title: "ดร. ไฮนซ์ ดูเฟนชเมิร์ตซ์ · ช่างกลนักประดิษฐ์ (Artificer)",
    spells: [
      S("Mending", "ซ่อมของแตกหักเล็กๆ · ปืนติดขัด กลอนหัก แว่นร้าว ซ่อมได้ใน 1 นาที", "spell", [0, "trs", "minute", 0, util()]),
      S("Fire Bolt", "ยิงลูกไฟจากอุปกรณ์ 120 ฟุต · 1d10 Fire · ตัวโจมตีเวทหลัก", "spell", [0, "evo", "action", 120, atk("rsak", 1, 10, "fire")]),
      S("Cure Wounds", "แตะเพื่อน รักษา 2d8 + INT · เครื่องฟื้นฟูพกพา", "spell", [1, "abj", "action", 0, heal(2, 8)]),
      S("Grease", "พื้นลื่นน้ำมันเครื่อง 10 ฟุต ใครอยู่ในนั้นเซฟ DEX ไม่ผ่านล้มหงาย · ปิดทางไล่ล่า", "spell", [1, "conj", "action", 60, save("dex", 0)]),
      S("Faerie Fire", "แสงเรืองลูกบาศก์ 20 ฟุต ศัตรูที่ติดแสงถูกโจมตีได้เปรียบ · มองเห็นของล่องหน", "spell", [1, "evo", "action", 60, save("dex", 0)])
    ],
    features: [
      { name: "Spellcasting (Artificer)", desc: "ร่ายด้วย INT · ช่องเวทเลเวล 1 จำนวน 2 ช่อง · ใช้ Tinker's Tools เป็นสื่อ (เวทที่เห็นเป็นอุปกรณ์กลไก) · เตรียมเวทได้ 2 อย่าง" },
      { name: "Tinkerer's Magic", desc: "Magic Action: ใช้ Tinker's Tools สร้างของเล็กๆ ชั่วคราว (ไฟฉาย เชือก ตะปู ประแจ) เท่าค่า INT (3) ครั้งต่อ Long Rest" },
      { name: "ปุ่มแดงของไฮนซ์", desc: "ทุกสิ่งประดิษฐ์ของเขามี \"ปุ่มทำลายตัวเอง\" · ใช้ได้เมื่อ DM อนุญาต: เครื่องพังทันที แต่ศัตรูใกล้ๆ อาจได้รับผลข้างเคียง (เล่นตามเรื่อง ไม่ใช่กติกา)" }
    ]
  },
  nincolas: {
    title: "Nincolas Cage Jr. III · พ่อค้าหน้าเนียนกับนินจาเงามืด (Rogue)",
    spells: [],
    features: [
      { name: "Sneak Attack", sneak: 1, desc: "1 ครั้งต่อเทิร์น: โจมตีด้วยอาวุธ Finesse หรืออาวุธระยะไกลแล้วโดน เพิ่ม <b>1d6</b> ถ้าได้เปรียบ หรือมีเพื่อนยืนติดเป้า (และตัวเองไม่เสียเปรียบ) · กดปุ่ม Damage ในความสามารถนี้เพื่อทอยเพิ่ม" },
      { name: "Expertise", desc: "Deception และ Sleight of Hand โบนัสคูณสอง (ใส่ให้แล้ว: Deception +7, Sleight of Hand +5) · ผู้เล่นเปลี่ยนเป็นทักษะอื่นได้" },
      { name: "Thieves' Cant", desc: "ภาษาลับของโจร พูดซ่อนความหมายในบทสนทนาธรรมดา และอ่านสัญลักษณ์ลับตามกำแพงได้ · คุยกับคนของซินดิเคทได้โดยคนอื่นไม่รู้" },
      { name: "Weapon Mastery", desc: "มีดสั้น (Nick: แทงมีดเล่มที่สองได้ใน Action เดียวกัน) และดาบสั้น (Vex: โดนแล้วได้เปรียบโจมตีเป้าเดิมครั้งถัดไป)" }
    ]
  }
};

// ---------- compendium lookup (built once)
let INDEX = null;
async function buildIndex() {
  if (INDEX) return INDEX;
  INDEX = new Map();
  for (const pack of game.packs.filter((p) => p.metadata.type === "Item")) {
    let idx;
    try { idx = await pack.getIndex({ fields: ["type", "system.source.rules"] }); } catch { continue; }
    for (const e of idx) {
      if (e.type !== "spell") continue;
      const k = e.name.toLowerCase();
      const rules = e.system?.source?.rules ?? "";
      const score = (rules === "2024" ? 2 : 0) + (/24|2024|modern/i.test(pack.collection) ? 1 : 0) + (pack.metadata.packageName === "dnd5e" ? 1 : 0);
      const cur = INDEX.get(k);
      if (!cur || score > cur.score) INDEX.set(k, { pack, id: e._id, score });
    }
  }
  return INDEX;
}
function fallback(s) {
  const [level, school, act, range, activity] = s.fb;
  const id = rid();
  return {
    name: s.name, type: "spell", img: "icons/svg/explosion.svg",
    system: {
      level, school, properties: ["vocal", "somatic"],
      activation: { type: act, value: 1 },
      range: range > 0 ? { value: range, units: "ft" } : { units: range === 0 ? "touch" : "self" },
      activities: { [id]: { _id: id, ...foundry.utils.deepClone(activity), activation: { type: act, value: 1, override: false } } }
    }
  };
}
async function spellData(s) {
  const idx = await buildIndex();
  const hit = idx.get(s.name.toLowerCase());
  let data = null;
  if (hit) { try { data = (await hit.pack.getDocument(hit.id))?.toObject(); } catch {} }
  if (!data) data = fallback(s);
  delete data._id;
  data.system ??= {};
  const desc = data.system.description?.value ?? "";
  data.system.description = { ...(data.system.description ?? {}), value: `<p><b>สรุป:</b> ${s.th}</p>${desc}` };
  // preparation (dnd5e 4.x uses preparation.mode, 5.x+ uses method/prepared — set both, the schema keeps what it knows)
  const mode = s.method === "innate" ? "innate" : s.method === "pact" ? "pact" : (data.system.level ? "prepared" : "prepared");
  data.system.preparation = { mode: mode === "prepared" ? "always" : mode, prepared: true };
  data.system.method = s.method === "innate" ? "innate" : s.method === "pact" ? "pact" : "spell";
  data.system.prepared = 2; // always prepared
  if (s.method === "innate") data.system.uses = { max: String(s.uses ?? 1), spent: 0, recovery: [{ period: "lr", type: "recoverAll" }] };
  data.flags = { ...(data.flags ?? {}), [MOD]: { spell: s.name } };
  return data;
}

export async function grantSpells(actor, key) {
  const book = SPELLBOOK[key];
  if (!book) return 0;
  const have = new Set(actor.items.filter((i) => i.getFlag(MOD, "spell") || i.getFlag(MOD, "feature")).map((i) => i.getFlag(MOD, "spell") ?? i.getFlag(MOD, "feature")));
  const add = [];
  for (const s of book.spells) if (!have.has(s.name)) add.push(await spellData(s));
  for (const f of book.features) {
    if (have.has(f.name)) continue;
    const sys = { description: { value: P(f.desc) }, type: { value: "class" } };
    if (f.uses) sys.uses = { max: String(f.uses), spent: 0, recovery: [{ period: "lr", type: "recoverAll" }] };
    if (f.sneak) { const id = foundry.utils.randomID(); sys.activities = { [id]: { _id: id, type: "damage", name: "ทอย Sneak Attack", damage: { parts: [{ number: f.sneak, denomination: 6, types: ["piercing"] }] } } }; }
    add.push({ name: f.name, type: "feat", img: f.sneak ? "icons/skills/melee/strike-dagger-blood-red.webp" : "icons/svg/upgrade.svg", system: sys, flags: { [MOD]: { feature: f.name } } });
  }
  if (!add.length) return 0;
  const made = await actor.createEmbeddedDocuments("Item", add);
  // innate spells: spend the item's own Use instead of a spell slot
  for (const it of made) {
    if (it.type !== "spell" || !it.system.uses?.max) continue;
    for (const a of it.system.activities ?? []) {
      try { await a.update({ "consumption.spellSlot": false, "consumption.targets": [{ type: "itemUses", target: "", value: "1" }] }); } catch {}
    }
  }
  // Armor of Shadows: Mage Armor always on
  const acf = book.features.find((f) => f.ac);
  if (acf) { try { await actor.update({ "system.attributes.ac.calc": acf.ac }); } catch (e) { console.warn(MOD, "ac", e); } }
  return made.length;
}

// ---------- level 2–5 progression (PHB 2024) — applied by the "เลเวลอัพ" macro
const dmgB = (n, d, b, type) => ({ type: "damage", damage: { parts: [{ number: n, denomination: d, bonus: String(b), types: [type] }] } });
export const F = (name, desc, uses, effects) => ({ name, desc, uses, effects });
export const LEVELS = {
  vivian: {
    hpDie: 4, // d6 average
    2: { features: [F("Font of Magic", "Sorcery Points เท่าเลเวล ได้คืน Long Rest · แลกเป็นช่องเวทได้ (ช่อง 1 = 2 แต้ม, ช่อง 2 = 3 แต้ม) หรือแลกช่องเวทกลับเป็นแต้ม", "@lvl"),
          F("Metamagic: Subtle Spell", "1 แต้ม · ร่ายเวทโดยไม่ต้องพูดหรือขยับมือ ไม่มีใครรู้ว่าเธอร่าย · เหมาะกับเมืองที่ C.A.A.M. จับตาผู้ใช้เวท"),
          F("Metamagic: Quickened Spell", "2 แต้ม · เปลี่ยนเวทที่ใช้ Action เป็น Bonus Action")],
      spells: [S("Detect Magic", "รับรู้เวทมนตร์ในระยะ 30 ฟุต 10 นาที · ร่ายแบบพิธีกรรมได้ไม่เสียช่อง · หาของ Magitech เถื่อน", "spell", [1, "div", "action", -1, util()]),
               S("Magic Missile", "ลูกดอกพลังงาน 3 ดอก โดนแน่นอนไม่ต้องทอย ดอกละ 1d4+1 Force · ปิดงานศัตรูที่เหลือเลือดน้อย", "spell", [1, "evo", "action", 120, dmgB(3, 4, 3, "force")])] },
    3: { features: [F("Aberrant Sorcery (สายจิต)", "พลังของเธอมาจากรอยแยกสีขี้เถ้า · ได้เวทจิตติดตัว (ไม่นับจำนวนเวทที่เตรียม)"),
          F("Telepathic Speech", "Bonus Action เชื่อมจิตกับคนที่เห็นในระยะ 30 ฟุต คุยกันทางจิตได้ไกลเท่าค่า CHA ไมล์ นาน = เลเวล นาที · นี่คือ \"อ่านใจคน\" ในเรื่องของเธอ")],
      spells: [S("Mind Sliver", "(สายจิต) เป้าเซฟ INT ไม่ผ่านโดน 1d6 Psychic และลบ 1d4 จากเซฟครั้งถัดไป", "spell", [0, "enc", "action", 60, save("int", 1, 6, "psychic")]),
               S("Arms of Hadar", "(สายจิต) หนวดมืดรอบตัว 10 ฟุต เซฟ STR ไม่ผ่านโดน 2d6 Necrotic และใช้ Reaction ไม่ได้", "spell", [1, "conj", "action", -1, save("str", 2, 6, "necrotic")]),
               S("Dissonant Whispers", "(สายจิต) กระซิบเสียงจากใต้ทะเล เซฟ WIS ไม่ผ่านโดน 3d6 Psychic และต้องวิ่งหนี", "spell", [1, "enc", "action", 60, save("wis", 3, 6, "psychic")]),
               S("Calm Emotions", "(สายจิต) ระงับความกลัวหรือความโกรธในรัศมี 20 ฟุต · ใช้แก้อาการหวาดผวาของเพื่อนได้", "spell", [2, "enc", "action", 60, save("cha", 0)]),
               S("Detect Thoughts", "(สายจิต) อ่านความคิดผิวเผินของคนในระยะ 30 ฟุต · สอบสวนพยานได้ดีที่สุด", "spell", [2, "div", "action", -1, util()]),
               S("Mirror Image", "ร่างลวง 3 ร่าง การโจมตีที่โดนอาจไปโดนร่างลวงแทน · ป้องกันตัวชั้นดี", "spell", [2, "ill", "action", -1, util()]),
               S("Misty Step", "Bonus Action วาร์ป 30 ฟุต · ทางหนีฉุกเฉิน", "spell", [2, "conj", "bonus", -1, util()])] },
    4: { asi: { cha: 2 }, features: [F("Ability Score Improvement", "CHA +2 (14 → 16) · เวททุกอย่างแม่นและแรงขึ้น")],
      spells: [S("Hold Person", "เป้ามนุษย์เซฟ WIS ไม่ผ่านติด Paralyzed · ตีโดนระยะ 5 ฟุตเป็นคริติคอลเสมอ", "spell", [2, "enc", "action", 60, save("wis", 0)]),
               S("Prestidigitation", "เวทเล็ก ๆ ทำความสะอาด จุดไฟ ทำเครื่องหมาย", "spell", [0, "trs", "action", 10, util()])] },
    5: { features: [F("Sorcerous Restoration", "Short Rest ได้ Sorcery Points คืนครึ่งหนึ่งของเลเวล (ปัดลง) 1 ครั้ง/Long Rest")],
      spells: [S("Hunger of Hadar", "(สายจิต) ทรงกลมความมืดว่างเปล่าจากห้วงลึก รัศมี 20 ฟุต · ในนั้นโดน 2d6 Cold ทุกเทิร์น", "spell", [3, "conj", "action", 150, save("dex", 2, 6, "cold")]),
               S("Sending", "(สายจิต) ส่งข้อความ 25 คำถึงคนที่รู้จักได้ไม่จำกัดระยะ", "spell", [3, "div", "action", -1, util()]),
               S("Fireball", "ลูกไฟระเบิดรัศมี 20 ฟุต เซฟ DEX โดน 8d6 Fire · ระวังเผาบาร์ทั้งหลัง", "spell", [3, "evo", "action", 150, save("dex", 8, 6, "fire")]),
               S("Counterspell", "Reaction ยกเลิกเวทของศัตรู · ไว้ใช้กับพิธีกรรมของลัทธิ", "spell", [3, "abj", "reaction", 60, save("con", 0)])] }
  },
  mozxorion: {
    hpDie: 6, // d10 average
    2: { features: [F("Fighting Style: Archery", "ยิงธนูและปืน ทอยโจมตี +2 (ใส่ให้อัตโนมัติ)", null, [["Archery", [["system.bonuses.rwak.attack", 2, "+2"]]]]),
          F("Deft Explorer", "Expertise ใน Perception (โบนัสคูณสอง ใส่ให้แล้ว) และรู้เพิ่ม 2 ภาษา (เลือกกับ DM)")],
      update: { "system.skills.prc.value": 2 },
      spells: [S("Speak with Animals", "คุยกับสัตว์ 10 นาที · ถามนกนางนวลหรือหนูท่าเรือว่าเห็นอะไร", "spell", [1, "div", "action", -1, util()])] },
    3: { features: [F("Gloom Stalker (นักล่าในเงามืด)", "สายนักล่าในความมืด เข้ากับเชื้อสายดราว · ได้เวท Disguise Self ติดตัว"),
          F("Dread Ambusher", "Initiative + WIS (ใส่ให้แล้ว) · เทิร์นแรกของการต่อสู้เดินเพิ่ม 10 ฟุต · Dreadful Strike: โจมตีโดนเพิ่ม 2d6 Psychic ใช้ได้เท่าค่า WIS ต่อ Long Rest", "@wis", [["Dread Ambusher", [["system.attributes.init.bonus", 2, "+@abilities.wis.mod"]]]]),
          F("Umbral Sight", "Darkvision เพิ่มอีก 60 ฟุต (รวม 180) · อยู่ในความมืด สิ่งที่ใช้ Darkvision มองไม่เห็นเขา", null, [["Umbral Sight", [["system.attributes.senses.darkvision", 2, "60"], ["system.attributes.senses.ranges.darkvision", 2, "60"]]]]),
          F("Drow Magic: Faerie Fire", "ร่าย Faerie Fire ฟรี 1 ครั้ง/Long Rest")],
      spells: [S("Disguise Self", "(Gloom Stalker) เปลี่ยนหน้าตา 1 ชั่วโมง", "spell", [1, "ill", "action", -1, util()]),
               S("Faerie Fire", "(Drow Magic · ฟรี 1 ครั้ง/Long Rest) แสงเรืองลูกบาศก์ 20 ฟุต ศัตรูที่ติดแสงถูกโจมตีได้เปรียบ", "innate", [1, "evo", "action", 60, save("dex", 0)]),
               S("Fog Cloud", "หมอกหนารัศมี 20 ฟุต · ทางหนีหรือซุ่มยิง", "spell", [1, "conj", "action", 120, util()])] },
    4: { asi: { wis: 1, con: 1 }, features: [F("Ability Score Improvement", "WIS +1, CON +1 (WIS 18, CON 14) · HP เพิ่มย้อนหลังเลเวลละ 1")],
      spells: [S("Alarm", "สัญญาณเตือนเมื่อมีคนบุกรุกพื้นที่ 20 ฟุต 8 ชั่วโมง · คนคุ้มกันสินค้าต้องมี (ร่ายแบบพิธีกรรมได้)", "spell", [1, "abj", "action", 30, util()])] },
    5: { features: [F("Extra Attack", "Action โจมตีได้ 2 ครั้ง"), F("Drow Magic: Darkness", "ร่าย Darkness ฟรี 1 ครั้ง/Long Rest · ใช้คู่กับ Umbral Sight")],
      spells: [S("Rope Trick", "(Gloom Stalker) ห้องลับมิติอื่นปลายเชือก 1 ชั่วโมง ซ่อนตัวได้ 8 คน", "spell", [2, "trs", "action", 0, util()]),
               S("Darkness", "(Drow Magic · ฟรี 1 ครั้ง/Long Rest) ความมืดเวทรัศมี 15 ฟุต", "innate", [2, "evo", "action", 60, util()]),
               S("Pass without Trace", "ทั้งทีม Stealth +10 1 ชั่วโมง · แทรกซึมโกดัง 4", "spell", [2, "abj", "action", -1, util()])],
      uses: { "Dread Ambusher": "@wis" } }
  },
  windows: {
    hpDie: 8, // d10 average 6 + Tough 2
    2: { features: [F("Fighting Style: Defense", "ตำรวจแนวหน้าต้องทนรับแรงปะทะ · สวมเกราะอยู่ AC +1 (ใส่ให้อัตโนมัติ · ถ้าถอดเกราะให้ปิด Effect นี้)", null, [["Defense", [["system.attributes.ac.bonus", 2, "+1"]]]]),
          F("Deft Explorer", "Expertise ใน Investigation (โบนัสคูณสอง ใส่ให้แล้ว) เหมาะกับงานตำรวจ และรู้เพิ่ม 2 ภาษา (เลือกกับ DM)")],
      update: { "system.skills.inv.value": 2 },
      spells: [S("Speak with Animals", "คุยกับสัตว์ 10 นาที · สอบปากคำหนู แมว นกพิราบในตรอกว่าเห็นอะไร", "spell", [1, "div", "action", -1, util()])] },
    3: { features: [F("Hunter (สายนักล่า)", "ตำรวจที่ไล่ล่าเป้าหมายจนถึงที่สุด"),
          F("Hunter's Lore", "ขณะเป้าติด Hunter's Mark รู้ว่ามันมีภูมิคุ้มกัน ต้านทาน หรือแพ้ดาเมจอะไร"),
          F("Hunter's Prey: Colossus Slayer", "1 ครั้งต่อเทิร์น: โจมตีด้วยอาวุธโดนเป้าที่เสีย HP ไปแล้ว เพิ่ม 1d8 ดาเมจ")],
      spells: [S("Alarm", "สัญญาณเตือนเมื่อมีคนบุกรุกพื้นที่ 20 ฟุต 8 ชั่วโมง · ซุ่มเฝ้าคดี (ร่ายแบบพิธีกรรมได้)", "spell", [1, "abj", "action", 30, util()])] },
    4: { asi: { dex: 2 }, features: [F("Ability Score Improvement", "DEX +2 (15 → 17) · ยิง AC และ Initiative ดีขึ้น")],
      spells: [S("Fog Cloud", "หมอกหนารัศมี 20 ฟุต · ปิดทางหนีหรือซุ่มยิง", "spell", [1, "conj", "action", 120, util()])] },
    5: { features: [F("Extra Attack", "Action โจมตีได้ 2 ครั้ง")],
      spells: [S("Pass without Trace", "ทั้งทีม Stealth +10 1 ชั่วโมง · บุกจับแบบเงียบ", "spell", [2, "abj", "action", -1, util()]),
               S("Spike Growth", "พื้นหนามรัศมี 20 ฟุต เดินผ่านโดน 2d4 ทุก 5 ฟุต · ปิดตรอกไม่ให้คนร้ายหนี", "spell", [2, "trs", "action", 150, util()])],
      uses: { "Hunter's Mark": "3", "Rabbit Hop": "@prof" } }
  },
  nincolas: {
    hpDie: 5, // d8 average
    2: { features: [F("Cunning Action", "Bonus Action: Dash, Disengage หรือ Hide · ตีแล้วหนีได้ในเทิร์นเดียว")] },
    3: { sneak: 2, features: [F("Thief (สายจอมโจร)", "สายนักขโมยมืออาชีพ เข้ากับเรื่องราวพ่อค้าหน้าเนียนกับนินจาเงามืด"),
          F("Fast Hands", "Bonus Action: Sleight of Hand, ใช้ Thieves' Tools, หรือใช้สิ่งของ (เช่น ขวดเกลือดม ไฟแช็ก)"),
          F("Second-Story Work", "ปีนป่ายไม่เสียความเร็ว · กระโดดไกลขึ้นตาม DEX · หนีขึ้นหลังคาตอนไล่ล่าในตรอก"),
          F("Steady Aim", "Bonus Action: ถ้ายังไม่ได้เดินในเทิร์นนี้ ได้เปรียบการโจมตีครั้งถัดไป (ความเร็วเป็น 0) · ทำให้ได้ Sneak Attack แน่นอน")] },
    4: { asi: { dex: 2 }, features: [F("Ability Score Improvement", "DEX +2 (13 → 15) · โจมตี AC และ Initiative ดีขึ้น")] },
    5: { sneak: 3, features: [F("Cunning Strike", "ลดลูกเต๋า Sneak Attack เพื่อเพิ่มผล: Poison (1d6: เป้าติด Poisoned), Trip (1d6: ล้มลง), Withdraw (1d6: ถอยครึ่งความเร็วโดนไม่ตีสวน)"),
          F("Uncanny Dodge", "Reaction: โดนโจมตีจากศัตรูที่เห็น ลดดาเมจครึ่งหนึ่ง")] }
  }
};

function resolveUses(v, actor, lvl) {
  if (v === "@lvl") return lvl;
  if (v === "@prof") return actor.system.attributes.prof ?? Math.ceil(lvl / 4) + 1;
  if (v === "@cha") return Math.max(1, actor.system.abilities.cha.mod);
  if (v === "@wis") return Math.max(1, actor.system.abilities.wis.mod);
  return v;
}
const isFeature = (actor, name) => actor.items.find((i) => i.name === name || i.getFlag(MOD, "feature") === name);

// features, spells, sheet updates, AC formula, recovery changes and Agonizing Blast for one plan step
export async function addStep(actor, step, lvl) {
  const add = [];
  for (const f of step.features ?? []) {
    if (isFeature(actor, f.name)) continue;
    const sys = { description: { value: P(f.desc) }, type: { value: "class" } };
    if (f.uses) sys.uses = { max: String(resolveUses(f.uses, actor, lvl)), spent: 0, recovery: [{ period: f.per ?? "lr", type: "recoverAll" }] };
    if (f.name === "Sneak Attack") { const id = foundry.utils.randomID(); sys.activities = { [id]: { _id: id, type: "damage", name: "ทอย Sneak Attack", damage: { parts: [{ number: step.sneakFeature ?? step.sneak ?? 1, denomination: 6, types: ["piercing"] }] } } }; }
    const effects = (f.effects ?? []).map(([n, ch]) => ({ name: n, img: "icons/svg/upgrade.svg", transfer: true, disabled: false, changes: ch.map(([key, mode, value]) => ({ key, mode, value })) }));
    add.push({ name: f.name, type: "feat", img: f.name === "Sneak Attack" ? "icons/skills/melee/strike-dagger-blood-red.webp" : "icons/svg/upgrade.svg", system: sys, effects, flags: { [MOD]: { feature: f.name } } });
  }
  for (const s of step.spells ?? []) if (!actor.items.find((i) => i.getFlag(MOD, "spell") === s.name || i.name === s.name)) add.push(await spellData(s));
  if (add.length) await actor.createEmbeddedDocuments("Item", add);
  const made = actor.items.filter((i) => i.type === "spell" && i.system.uses?.max && i.getFlag(MOD, "spell"));
  for (const it of made) for (const a of it.system.activities ?? []) { try { if (a.consumption?.spellSlot !== false) await a.update({ "consumption.spellSlot": false, "consumption.targets": [{ type: "itemUses", target: "", value: "1" }] }); } catch {} }
  for (const [name, per] of Object.entries(step.per ?? {})) {
    const it = actor.items.find((i) => i.name.startsWith(name));
    if (it?.system.uses) { try { await it.update({ "system.uses.recovery": [{ period: per, type: "recoverAll" }] }); } catch {} }
  }
  if (step.agonizing) {
    const eb = actor.items.find((i) => /eldritch blast/i.test(i.name));
    for (const a of eb?.system.activities ?? []) {
      try { const parts = a.toObject().damage?.parts ?? []; if (parts.length && !parts[0].bonus) { parts[0].bonus = "@mod"; await a.update({ "damage.parts": parts }); } } catch (e) { console.warn(MOD, "agonizing", e); }
    }
  }
  return add.length;
}
// level-1 package for a character imported from the Character Ledger (any class with a plan)
export async function grantClassStart(actor) {
  const key = planKey(actor); const plan = CLASSPLANS[key];
  if (!plan) return null;
  const step = plan[1] ?? {};
  if (step.update) { try { await actor.update(step.update); } catch (e) { console.warn(MOD, "class start update", e); } }
  if (plan.ac) { try { await actor.update({ "system.attributes.ac.calc": plan.ac }); } catch {} }
  const n = await addStep(actor, step, 1);
  await actor.setFlag(MOD, "plan", key);
  return { key, title: plan.title, n, features: (step.features ?? []).map((f) => f.name), spells: (step.spells ?? []).map((s) => s.name) };
}
export async function levelUp(actorArg, opts = {}) {
  const actor = actorArg ?? canvas.tokens.controlled[0]?.actor ?? game.user.character;
  if (!actor) return ui.notifications.warn("เลือกโทเคนตัวละครผู้เล่นก่อน");
  const key = actor.getFlag(MOD, "pc");
  const plan = LEVELS[key] ?? CLASSPLANS[actor.getFlag(MOD, "plan") ?? planKey(actor)];
  if (!plan) return ui.notifications.warn(`${actor.name} ไม่มีแผนเลเวลอัพในโมดูล`);
  const cls = actor.items.find((i) => i.type === "class");
  const cur = cls?.system.levels ?? actor.system.details.level ?? 1;
  const next = cur + 1;
  const step = plan[next];
  if (!step) return ui.notifications.info(`${actor.name} เลเวล ${cur} แล้ว · ออกแบบไว้ถึงเลเวล 5`);
  const ok = opts.confirm === false ? true : await (foundry.applications?.api?.DialogV2 ?? Dialog).confirm?.({
    window: { title: "เลเวลอัพ" }, title: "เลเวลอัพ",
    content: `<p><b>${actor.name}</b> เลเวล ${cur} → <b>${next}</b></p><p>${step.features.map((f) => f.name).join(", ")}</p>`
  });
  if (!ok) return;
  const lines = [];
  // class level + HP (fixed average)
  if (cls) await cls.update({ "system.levels": next });
  const conMod = (v) => Math.floor((v - 10) / 2);
  const con0 = actor.system.abilities.con.value, con1 = con0 + (step.asi?.con ?? 0);
  // fixed average + CON, plus retroactive HP if CON modifier went up
  const hpGain = plan.hpDie + conMod(con1) + (conMod(con1) - conMod(con0)) * (next - 1);
  const upd = {};
  if (step.asi) {
    const asi = step.asi.best ? { [step.asi.best.reduce((a, b) => (actor.system.abilities[b].value > actor.system.abilities[a].value ? b : a))]: step.asi.n ?? 2 } : step.asi;
    for (const [ab, v] of Object.entries(asi)) upd[`system.abilities.${ab}.value`] = Math.min(20, actor.system.abilities[ab].value + v);
    lines.push(`ค่าสถานะ: ${Object.entries(asi).map(([a, v]) => `${a.toUpperCase()} +${v}`).join(", ")}`);
  }
  const hp = actor.system.attributes.hp;
  upd["system.attributes.hp.max"] = (hp.max ?? 0) + hpGain;
  upd["system.attributes.hp.value"] = (hp.value ?? 0) + hpGain;
  Object.assign(upd, step.update ?? {});
  if (step.sneak) {
    const sa = actor.items.find((i) => i.getFlag(MOD, "feature") === "Sneak Attack");
    for (const a of sa?.system.activities ?? []) {
      try { const parts = a.toObject().damage?.parts ?? []; if (parts[0]) { parts[0].number = step.sneak; await a.update({ "damage.parts": parts }); } } catch {}
    }
    if (sa) try { await sa.update({ "system.description.value": sa.system.description.value.replace(/<b>\dd6<\/b>/, `<b>${step.sneak}d6</b>`) }); } catch {}
  }
  await actor.update(upd);
  lines.push(`HP +${hpGain} (สูงสุด ${(hp.max ?? 0) + hpGain})`);
  // features + spells
  await addStep(actor, step, next);
  try { const pr = (await import("./professions.js?v=21")).PROFESSIONS[key]?.[next]; if (pr) { await addStep(actor, pr, next); lines.push(`อาชีพ: ${[...(pr.features ?? []), ...(pr.spells ?? [])].map((x) => x.name).join(", ")}`); } } catch (e) { console.warn(MOD, "profession step", e); }
  lines.push(`ความสามารถ: ${step.features.map((f) => f.name).join(", ")}`);
  if (step.spells?.length) lines.push(`เวทใหม่: ${step.spells.map((s) => s.name).join(", ")}`);
  // scaling uses (Font of Magic = level, Fey Step = proficiency, Steps of the Fey = CHA)
  const scale = { "Font of Magic": "@lvl", "Steps of the Fey": "@cha", ...(step.uses ?? {}) };
  for (const [name, v] of Object.entries(scale)) {
    const it = actor.items.find((i) => i.name.startsWith(name));
    if (it?.system.uses?.max) { try { await it.update({ "system.uses.max": String(resolveUses(v, actor, next)) }); } catch {} }
  }
  // Agonizing Blast: CHA to Eldritch Blast damage
  if (step.after === "agonizing" || next >= 2) {
    const eb = actor.items.find((i) => /eldritch blast/i.test(i.name));
    if (eb && key === "warlock-legacy") for (const a of eb.system.activities ?? []) {
      try {
        const parts = a.toObject().damage?.parts ?? [];
        if (parts.length && !parts[0].bonus) { parts[0].bonus = "@mod"; await a.update({ "damage.parts": parts }); }
      } catch (e) { console.warn(MOD, "agonizing", e); }
    }
  }
  try { (foundry.audio?.AudioHelper ?? AudioHelper).play({ src: `modules/${MOD}/sounds/heal.ogg`, volume: 0.8, autoplay: true, loop: false }, true); } catch {}
  ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<div class="rw-card"><div class="rw-title">เลเวลอัพ! ${actor.name} เลเวล ${next}</div>${lines.join("<br>")}</div>` });
}
