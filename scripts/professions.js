// Profession kits: every PC gets class + profession abilities as a fixed set (no choices for the player).
// Class steps come from LEVELS (spells.js) / CLASSPLANS; this file adds the profession layer on top.
// Rules: D&D 5e (2024) spells only; "talent" features are small, text-based, DM-adjudicated.
import { S, F, addStep, LEVELS } from "./spells.js?v=21";
import { CLASSPLANS, planKey } from "./classplans.js?v=21";
const MOD = "arkane-1920s";
const util = () => ({ type: "utility" });
const per = (f, p) => ({ ...f, per: p });

export const PROFESSIONS = {
  vivian: {
    title: "ไกด์ผู้อ่านใจคน (Guide · Aberrant Sorcerer)",
    // module-granted items to retire when this kit is applied (only items the module itself created)
    swap: { spells: [], features: [] },
    2: {
      features: [
        per(F("อาชีพไกด์: อ่านบรรยากาศ (Read the Room)", "Bonus Action · 2 ครั้ง/Long Rest: ถาม DM 1 ข้อเกี่ยวกับคนที่เห็นในระยะ 30 ฟุต เช่น กลัวอะไรอยู่ กำลังโกหกไหม อารมณ์ตอนนี้เป็นอย่างไร DM ตอบตามจริงสั้นๆ · นี่คือ \"อ่านใจคน\" ในเรื่องของเธอ (ของจริงแบบเต็มคือ Telepathic Speech เลเวล 3)", 2), "lr"),
        per(F("อาชีพไกด์: ไม่เคยหลงทาง (Trail Sense)", "ไม่หลงทางในเมืองหรือป่าที่เคยผ่านมาแล้ว · 1 ครั้ง/Short Rest: ได้เปรียบเช็ก Survival หรือเช็กนำทางด้วย Cartographer's Tools 1 ครั้ง", 1), "sr")
      ],
      spells: [S("Comprehend Languages", "(ไกด์ · ร่ายแบบพิธีกรรมได้ไม่เสียช่อง) เข้าใจภาษาพูด/เขียนทุกภาษา 1 ชั่วโมง · อ่านป้ายและจดหมายคนต่างถิ่น", "spell", [1, "div", "action", -1, util()])]
    }
  },
  mozxorion: {
    title: "ผู้คุ้มกันเรือ · นักธนูเงา (Sailor · Ranger)",
    // Ensnaring Strike (restrains + ongoing damage, concentration) swapped for an archer-friendly spell
    swap: { spells: ["Ensnaring Strike"], features: [] },
    2: {
      features: [
        per(F("อาชีพคุ้มกัน: สัญญาณขบวน (Convoy Call)", "Bonus Action · 1 ครั้ง/Short Rest: ตะโกนสั่งเพื่อน 1 คนในระยะ 30 ฟุต ได้ +1d4 กับทอยโจมตีหรือเซฟครั้งถัดไปก่อนเทิร์นของคุณมาถึงอีกครั้ง", 1), "sr"),
        F("อาชีพลูกเรือ: ขาทะเล (Sea Legs)", "ได้เปรียบเซฟ STR และ DEX ที่กันล้มบนเรือโคลง พื้นลื่น หรือดาดฟ้าเปียก · ปีนเชือกและเสากระโดงไม่เสียความเร็ว")
      ],
      spells: [S("Hail of Thorns", "Bonus Action ก่อนยิง: โดนแล้วลูกธนูแตกเป็นหนามพุ่งใส่เป้าและคนรอบเป้า 5 ฟุต เซฟ DEX ไม่ผ่านโดน 1d10 Piercing · เวทนักธนู ไม่มีพื้นที่ค้างบนสนาม", "spell", [1, "conj", "bonus", -1, { type: "save", save: { ability: ["dex"], dc: { calculation: "spellcasting" } }, damage: { parts: [{ number: 1, denomination: 10, types: ["piercing"] }] } }])]
    }
  },
  windows: {
    title: "อดีตตำรวจ · นักสืบชนบท (Police · Hunter Ranger)",
    // Cure Wounds replaced by Detect Magic (Cure Wounds duty goes to Heinz, Vivian, Mozxorion)
    swap: { spells: ["Cure Wounds"], features: ["Fighting Style: Archery"] },
    2: {
      features: [
        per(F("อาชีพตำรวจ: ตาสืบสวน (Interrogator's Eye)", "1 ครั้ง/Short Rest: ตอนสอบปากคำหรือซักถาม ได้เปรียบ 1 ครั้งกับเช็ก Insight หรือ Intimidation · ถ้าเป้าติด Hunter's Mark DM บอกด้วยว่ามันกำลังซ่อนอะไรเกี่ยวกับคดี", 1), "sr"),
        F("อาชีพตำรวจ: ตราและระเบียบ (Badge of Old Law)", "ตราตำรวจเก่าทำให้ได้เปรียบเช็ก Persuasion กับตำรวจ ทหาร และเจ้าหน้าที่ที่ยังเคารพกฎหมาย (ไม่ใช้กับ C.A.A.M.) · เล่นบทบาทเรื่องคู่หูที่เสียไปในสงคราม")
      ],
      spells: [S("Detect Magic", "รับรู้เวทมนตร์ในระยะ 30 ฟุต 10 นาที · ร่ายแบบพิธีกรรมได้ไม่เสียช่อง · ตรวจหาของ Magitech เถื่อนในที่เกิดเหตุ", "spell", [1, "div", "action", -1, util()])]
    }
  },
  heinz: {
    title: "ช่างกลนักประดิษฐ์ (Artisan · Artificer)",
    swap: { spells: [], features: [] },
    2: {
      features: [
        per(F("อาชีพช่างกล: โอเวอร์คล็อก (Overclock)", "Bonus Action · 1 ครั้ง/Short Rest: ปรับสปริงไอน้ำของประแจหรือปืนสลักเกลียว การโจมตีด้วยอาวุธนั้นที่โดนครั้งถัดไปภายใน 1 นาที ดาเมจ +1d6 Fire", 1), "sr"),
        F("อาชีพช่างกล: ซ่อมด่วน (Quick Fix)", "ซ่อมของกลไกที่ติดขัดหรือแตกเล็กน้อยด้วย Tinker's Tools ใน Bonus Action (ไม่ต้องรอ 1 นาทีของ Mending) · ปืนติดขัดแล้วกลับมายิงได้ในเทิร์นเดียวกัน")
      ],
      spells: [S("Catapult", "ขว้างของหนักไม่เกิน 5 ปอนด์ 90 ฟุต เซฟ DEX ไม่ผ่านโดน 3d8 Bludgeoning · ยิงประแจ น็อต หรือเศษเหล็กจากเครื่อง (-อินเนเตอร์)", "spell", [1, "trs", "action", 90, { type: "save", save: { ability: ["dex"], dc: { calculation: "spellcasting" } }, damage: { parts: [{ number: 3, denomination: 8, types: ["bludgeoning"] }] } }])]
    }
  },
  nincolas: {
    title: "พ่อค้าหน้าเนียน · นินจาเงามืด (Merchant · Rogue)",
    swap: { spells: [], features: [] },
    2: {
      features: [
        per(F("อาชีพพ่อค้า: ตาประเมินราคา (Appraiser's Eye)", "1 ครั้ง/Short Rest: ได้เปรียบเช็ก Insight หรือ Persuasion ตอนต่อรองซื้อขาย · ดูของ 1 ชิ้นแล้ว DM บอกมูลค่าตลาดคร่าวๆ และบอกว่าเป็นของปลอมหรือของเถื่อนหรือไม่", 1), "sr"),
        per(F("อาชีพนินจา: ลูกควัน (Smoke Pellets)", "Bonus Action · 2 ครั้ง/Long Rest: ปาลูกควันในระยะ 20 ฟุต ได้กลุ่มควัน 5 ฟุตที่ Heavily Obscured จนจบเทิร์นถัดไปของคุณ · ใช้คู่ Cunning Action: Hide หรือหนีตอนโดนล้อม", 2), "lr")
      ],
      spells: []
    }
  }
};

function pcLevel(actor) { return actor.items.find((i) => i.type === "class")?.system.levels ?? actor.system.details.level ?? 1; }

// idempotent: adds only what is missing; retires module-created items listed in `swap`; never touches player-made items
export async function applyProfessions(opts = {}) {
  if (!game.user.isGM) return ui.notifications.warn("มาโครนี้ใช้ได้เฉพาะ GM");
  const only = opts.keys ?? null;
  const report = [];
  for (const actor of game.actors.filter((a) => a.type === "character")) {
    const key = actor.getFlag(MOD, "pc");
    const prof = PROFESSIONS[key];
    if (!prof || (only && !only.includes(key))) continue;
    const lvl = pcLevel(actor);
    const classPlan = LEVELS[key] ?? CLASSPLANS[actor.getFlag(MOD, "plan") ?? planKey(actor)] ?? {};
    const added = [], removed = [];
    try {
      for (let l = 2; l <= lvl; l++) {
        const steps = [classPlan[l], prof[l]].filter(Boolean);
        for (const step of steps) {
          const before = new Set(actor.items.map((i) => i.id));
          if (step.update) { try { await actor.update(step.update); } catch {} }
          await addStep(actor, step, l);
          for (const it of actor.items) if (!before.has(it.id)) added.push(it.name);
        }
      }
      // retire swapped-out items only if the module created them (flagged) and the replacement now exists
      const ids = [];
      for (const n of prof.swap?.spells ?? []) { const it = actor.items.find((i) => i.getFlag(MOD, "spell") === n); if (it) ids.push(it.id), removed.push(it.name); }
      for (const n of prof.swap?.features ?? []) { const it = actor.items.find((i) => i.getFlag(MOD, "feature") === n); if (it) ids.push(it.id), removed.push(it.name); }
      if (ids.length) await actor.deleteEmbeddedDocuments("Item", ids);
      await actor.setFlag(MOD, "profession", prof.title);
    } catch (e) { console.error(MOD, "profession", key, e); report.push(`<b>${actor.name}</b>: ผิดพลาด ${e.message}`); continue; }
    report.push(`<b>${actor.name}</b> (เลเวล ${lvl}) · ${prof.title}<br>+ ${added.length ? added.join(", ") : "ครบอยู่แล้ว"}${removed.length ? `<br>− ${removed.join(", ")}` : ""}`);
  }
  const html = `<div class="rw-card"><div class="rw-title">ชุดอาชีพ + คลาส</div>${report.join("<hr>") || "ไม่พบตัวละครผู้เล่นที่มีแฟลก pc"}</div>`;
  ChatMessage.create({ content: html, whisper: ChatMessage.getWhisperRecipients("GM") });
  return report.length;
}
