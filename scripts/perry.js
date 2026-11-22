// Perry Platypus (Dr. Heinz's daughter) — Warlock (Archfey, Pact of the Blade), joins the party at the party's level with the party's XP.
// Data: perrydata.js (generated from the player's Skillbook v8.2, balanced for this world, levels 1-5 only).
// This file: creates the actor (GM macro "เพอร์รี่: สร้างตัวละคร"), plugs her into the shared level-up (spells.js LEVELS.perry),
// and the join macro "เพอร์รี่: เข้าตี้" (matches XP + level to the party, hands the sheet to Heinz's player, places the token).
// The Lens / Hunger Gauge / Sanity / Dread automation is NOT here yet (later).
import { LEVELS, addStep, S as mkS } from "./spells.js?v=21";
import { PERRY } from "./perrydata.js?v=1";
const MOD = "arkane-1920s";
const P = (s) => `<p>${s}</p>`;
const IMG = `modules/${MOD}/pcs/perry.webp`, TOK = `modules/${MOD}/pcs/perry-token.webp`;
const ICON = (id) => `modules/${MOD}/perry/icons/${id}.webp`;
const ICONS = { "Hex": "hex", "Arms of Hadar": "arms_of_hadar", "Misty Step": "misty_step_spell", "Eldritch Invocation: Pact of the Blade": "pact_of_the_blade" };

// ---- level plan for the shared "เลเวลอัพ" (spells.js levelUp reads LEVELS[flag pc])
const plan = { hpDie: PERRY.hpDie };
for (const [lv, st] of Object.entries(PERRY.steps)) {
  plan[lv] = {
    features: st.features.map((f) => ({ name: f.name, desc: f.desc, uses: f.uses ?? undefined, per: f.per ?? undefined, effects: [] })),
    spells: st.spells.map((s) => ({ ...mkS(s.name, s.th, s.method, [s.level, "abj", "action", -1, { type: "utility" }]), ...(s.uses ? { uses: s.uses } : {}) })),
    ...(st.agonizing ? { agonizing: true } : {}), ...(st.asi ? { asi: st.asi } : {}), ...(st.update ? { update: st.update } : {})
  };
}
LEVELS.perry = plan;

async function findInPacks(type, name) {
  const want = name.toLowerCase().trim();
  let best = null;
  for (const pack of game.packs.filter((p) => p.documentName === "Item")) {
    let idx; try { idx = await pack.getIndex({ fields: ["type", "system.source.rules"] }); } catch { continue; }
    for (const e of idx) {
      if (e.type !== type || e.name.toLowerCase() !== want) continue;
      const score = (e.system?.source?.rules === "2024" ? 2 : 0) + (pack.metadata.packageName === "dnd5e" ? 0 : 1);
      if (!best || score > best.score) best = { pack, id: e._id, score };
    }
  }
  if (!best) return null;
  try { return (await best.pack.getDocument(best.id))?.toObject(); } catch { return null; }
}
const gear = (name, img, desc) => ({ name, type: "loot", img, system: { description: { value: P(desc) }, quantity: 1 } });

const BIO = [
  P("<b>อายุ 17 · Elf (High Elf) สายเลือดครึ่งเอลฟ์ · Warlock (Archfey) · Background: Charlatan</b>"),
  P("<b>เรื่องราว:</b> ลูกสาวของ ดร. ไฮนซ์ ช่วยพ่อซ่อมเครื่องจักรในร้านมาตั้งแต่เด็ก จนวันหนึ่งเกิดเหตุการณ์ที่หอดูดาวร้าง ทำให้เธอใช้เวทมนตร์ผ่านไม้กายสิทธิ์ได้ · เธอออกเดินทางเพื่อ<b>ตามหาพ่อ</b>"),
  P("<b>รูปลักษณ์:</b> เอลฟ์ผมดำยาวยุ่ง ตาแดง สวมหมวกเบเร่ต์กับเสื้อโค้ทสีน้ำตาลเข้ม ถือไม้เรียวสีเข้มเหมือนก้านเถาวัลย์"),
  P("<b>ความลับ:</b> แดกไรก็ไม่อร่อย แต่ชอบโกโก้นะ กินแล้วหลับ"),
  P("<b>ชอบ:</b> โกโก้ร้อนข้างเตาผิง")
].join("");

export async function createPerry() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const old = game.actors.find((a) => a.getFlag(MOD, "pc") === "perry");
  if (old) { await old.update({ img: IMG, "prototypeToken.texture.src": TOK }); return ui.notifications.info("มีเพอร์รี่ในระบบแล้ว · อัปเดตรูปให้ใหม่"); }
  const folder = game.folders.find((f) => f.name === "Arkane 1920s · ผู้เล่น" && f.type === "Actor")
    ?? await Folder.create({ name: "Arkane 1920s · ผู้เล่น", type: "Actor", color: "#801820" });
  // the sheet belongs to Dr. Heinz's player
  const heinz = game.actors.find((a) => a.getFlag(MOD, "pc") === "heinz");
  const ownership = { default: 0 };
  const owners = heinz ? game.users.filter((u) => !u.isGM && heinz.testUserPermission(u, "OWNER")) : [];
  for (const u of owners) ownership[u.id] = 3;
  const ab = { str: 8, dex: 16, con: 13, int: 8, wis: 12, cha: 17 };   // 27-point buy: base 8/15/13/8/12/15 + Charlatan (DEX +1, CHA +2)
  const abilities = Object.fromEntries(Object.entries(ab).map(([k, v]) => [k, { value: v, proficient: ["wis", "cha"].includes(k) ? 1 : 0 }]));
  const skills = Object.fromEntries(["arc", "dec", "itm", "prc", "slt"].map((s) => [s, { value: 1 }]));
  const actor = await Actor.create({
    name: "Perry Platypus", type: "character", img: IMG, folder: folder.id, ownership,
    system: {
      abilities, skills,
      attributes: { ac: { calc: "default" }, hp: { value: 9, max: 9 }, movement: { walk: 30 }, spellcasting: "cha",
        senses: { darkvision: 60, ranges: { darkvision: 60 } } },
      traits: { weaponProf: { value: ["sim"] }, armorProf: { value: ["lgt"] } },
      currency: { gp: 15 },
      details: { biography: { value: BIO } }
    },
    prototypeToken: { name: "Perry Platypus", actorLink: true, disposition: 1, displayName: 30, displayBars: 30, bar1: { attribute: "attributes.hp" },
      texture: { src: TOK }, sight: { enabled: true, range: 60, visionMode: "darkvision" } }
  });
  await actor.setFlag(MOD, "pc", "perry");
  await actor.setFlag(MOD, "later", true);
  await actor.setFlag(MOD, "dread", 0);
  // class
  let cls = await findInPacks("class", "Warlock");
  if (cls) { delete cls._id; cls.system.levels = 1; if (cls.system.hd) cls.system.hd.spent = 0; }
  else cls = { name: "Warlock", type: "class", img: "icons/svg/book.svg", system: { identifier: "warlock", levels: 1, hd: { denomination: "d8", spent: 0 }, spellcasting: { progression: "pact", ability: "cha" } } };
  const rid = foundry.utils.randomID();
  const rapier = { name: "Shadow Rapier (เรเปียร์เงา · อาวุธ Pact)", type: "weapon", img: ICON("pact_of_the_blade"),
    system: { type: { value: "martialM" }, properties: ["fin", "lgt"], equipped: true, proficient: 1,
      damage: { base: { number: 1, denomination: 8, types: ["necrotic"] } },
      description: { value: P("อาวุธ Pact of the Blade ที่เรียกจากเงา · ใช้ CHA โจมตีและดาเมจ · ดาเมจ Necrotic · หายไปเมื่อเลนส์แตก (Stage 3) หรือ Mental Break") },
      activities: { [rid]: { _id: rid, type: "attack", name: "โจมตี (CHA)", attack: { ability: "cha", type: { value: "melee", classification: "weapon" } },
        damage: { includeBase: true, parts: [{ bonus: "@abilities.cha.mod", types: ["necrotic"] }] } } } },
    flags: { [MOD]: { id: "melee-pact-rapier" } } };
  const wand = gear("ไม้กายสิทธิ์ของ Lady (Arcane Focus)", `modules/${MOD}/items/perry-wand.webp`,
    "ไม้เรียวสีเข้ม ลำไม้เป็นข้อ มีลูกกลมสลักลายดาวสี่แฉกเรียงลดหลั่นสี่ลูกไปจนถึงปลายแหลม ด้ามมีวงแหวนสีทองแดง · เป็น Arcane Focus ไม่ใช่อาวุธ · ลำแสง Eldritch Blast ออกจากไม้นี้ · เพื่อนที่แตะไม้ใส่เพอร์รี่ขณะดึงสติ (Persuasion/Arcana DC 15) ได้ Advantage");
  const forge = gear("Forgery Kit (ชุดปลอมแปลงเอกสาร)", "icons/sundries/documents/document-sealed-red-tan.webp", "ปากกา หมึก ตราปลอม และกระดาษเก่า · ชำนาญจาก Background Charlatan");
  try { await actor.createEmbeddedDocuments("Item", [cls, rapier, wand, forge]); } catch (e) { console.error(MOD, "perry items", e); }
  const n = await addStep(actor, plan[1], 1);
  await actor.update({ "system.attributes.hp.value": 9, "system.attributes.hp.max": 9 });
  await applyIcons(actor);
  ui.notifications.info(`สร้าง Perry Platypus แล้ว (เลเวล 1 · ใส่สกิล/เวท ${n} อย่าง · สถานะ "ยังไม่เข้าตี้") · เจ้าของ: ${owners.map((u) => u.name).join(", ") || "ยังไม่ได้ตั้ง Ownership เอง"}`);
  return actor;
}

async function applyIcons(actor) {
  for (const it of actor.items) {
    const id = ICONS[it.name]; if (!id || it.img === ICON(id)) continue;
    try { await it.update({ img: ICON(id) }); } catch {}
  }
}

const levelOf = (a) => a.items.find((i) => i.type === "class")?.system.levels ?? a.system.details.level ?? 1;
export async function joinPerry() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const perry = game.actors.find((a) => a.getFlag(MOD, "pc") === "perry");
  if (!perry) return ui.notifications.warn("ยังไม่มีเพอร์รี่ · กดมาโคร 'เพอร์รี่: สร้างตัวละคร' ก่อน");
  const others = game.actors.filter((a) => a.type === "character" && a.getFlag(MOD, "pc") && a.id !== perry.id && !a.getFlag(MOD, "later") && !a.getFlag(MOD, "retired"));
  const xp = Math.max(0, ...others.map((a) => a.system.details.xp?.value ?? 0));
  const target = Math.min(5, Math.max(2, ...others.map(levelOf)));
  await perry.update({ "system.details.xp.value": xp });
  const { levelUp } = await import("./spells.js?v=21");
  let guard = 0;
  while (levelOf(perry) < target && guard++ < 6) await levelUp(perry, { confirm: false });
  await applyIcons(perry);
  await perry.unsetFlag(MOD, "later"); await perry.setFlag(MOD, "joined", true);
  // the sheet goes to whoever played Dr. Heinz
  const heinz = game.actors.find((a) => a.getFlag(MOD, "pc") === "heinz");
  const users = heinz ? game.users.filter((u) => !u.isGM && heinz.testUserPermission(u, "OWNER")) : [];
  for (const u of users) {
    if (!perry.testUserPermission(u, "OWNER")) await perry.update({ [`ownership.${u.id}`]: 3 });
    await u.update({ character: perry.id });
  }
  const sc = game.scenes.active;
  if (sc && !sc.tokens.find((t) => t.actorId === perry.id)) {
    const r = sc.dimensions?.sceneRect ?? { x: 0, y: 0, width: 1000, height: 1000 };
    await sc.createEmbeddedDocuments("Token", [{ ...(await perry.getTokenDocument()).toObject(), x: Math.round(r.x + r.width / 2), y: Math.round(r.y + r.height / 2) }]);
  }
  try { await (await import("./party.js?v=21")).partyNote(false); } catch {}
  ui.notifications.info(`Perry เข้าตี้แล้ว · เลเวล ${levelOf(perry)} · XP ${xp} (เท่าตี้)${users.length ? " · เจ้าของ: " + users.map((u) => u.name).join(", ") : " · ยังไม่พบเจ้าของ ตั้ง Ownership เอง"}`);
}

export function registerPerry() {
  game.arkane ??= {};
  game.arkane.perry = { create: createPerry, join: joinPerry };
  Hooks.on("createItem", async (item) => {
    if (!game.user.isGM || item.parent?.getFlag?.(MOD, "pc") !== "perry") return;
    const id = ICONS[item.name]; if (id && item.img !== ICON(id)) { try { await item.update({ img: ICON(id) }); } catch {} }
  });
}
