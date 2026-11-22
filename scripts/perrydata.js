// Generated from Perry_DM_Master_Dossier v8.2 / perry_skills.json (89 skills), balanced for Arkane 1920s. Levels 1-5 only.
export const PERRY = {
 "hpDie": 5,
 "steps": {
  "1": {
   "features": [
    {
     "name": "Darkvision",
     "desc": "มองเห็นในที่มืดและแสงสลัว 60 ฟุต<br><i>(ติดตัว)</i>",
     "uses": null,
     "per": null,
     "id": "darkvision",
     "cat": "species"
    },
    {
     "name": "Fey Ancestry",
     "desc": "Advantage ใน Save ต้านสถานะ Charmed<br><i>(ติดตัว)</i>",
     "uses": null,
     "per": null,
     "id": "fey_ancestry",
     "cat": "species"
    },
    {
     "name": "Keen Senses",
     "desc": "มีความชำนาญ Perception<br><i>(ติดตัว)</i>",
     "uses": null,
     "per": null,
     "id": "keen_senses",
     "cat": "species"
    },
    {
     "name": "Trance",
     "desc": "พักยาวแบบสมาธิใช้ 4 ชั่วโมง (ภาพลวงตาที่นอนหลับใช้หลอก Norm ได้)<br><i>(ติดตัว)</i>",
     "uses": null,
     "per": null,
     "id": "trance",
     "cat": "species"
    },
    {
     "name": "Background: Charlatan (Skilled)",
     "desc": "Deception, Sleight of Hand, Forgery Kit + feat Skilled (ชำนาญเพิ่ม 3 อย่าง)<br><i>(ติดตัว)</i>",
     "uses": null,
     "per": null,
     "id": "bg_charlatan",
     "cat": "species"
    },
    {
     "name": "Pact Magic",
     "desc": "ช่องเวทน้อยแต่ระดับสูง ฟื้นหมดทุก Short Rest (ดูตารางเลเวล) ใช้ CHA ร่ายเวท<br>การใช้: ฟื้นทุก Short Rest<br>เงื่อนไข: ใช้ CHA ร่ายเวท; ช่องเวทฟื้นทุก Short Rest<br><i>(ติดตัว)</i>",
     "uses": null,
     "per": null,
     "id": "pact_magic",
     "cat": "class_feature"
    },
    {
     "name": "Eldritch Invocation: Pact of the Blade",
     "desc": "Bonus Action เรียกอาวุธระยะประชิด Simple/Martial ขึ้นมาในมือ (ค่าตั้งต้น = เรเปียร์เงา) หรือผูกกับอาวุธเวทที่สัมผัส ได้ proficiency ใช้ CHA โจมตี/ดาเมจ และใช้เป็น Spellcasting Focus ได้ · ดาเมจเป็น Necrotic เท่านั้น · ใช้ไม่ได้เมื่อเลนส์แตก (Stage 3) หรือ Mental Break<br>เงื่อนไข: Bonus Action เรียกดาบ; ต้องมือว่างอย่างน้อย 1 ข้าง (เรียกขึ้นมาในมือ ไม่ได้แปลงจากไม้); ดาบหายไปถ้าห่างเกิน 5 ฟุตเป็นเวลา 1 นาที (ตามกฎ Pact weapon)<br>ใช้ไม่ได้เมื่อ: Incapacitated; เลนส์แตก Stage 3 (ดาบหาย); Mental Break<br><i>(Bonus Action)</i>",
     "uses": null,
     "per": null,
     "id": "pact_of_the_blade",
     "cat": "pact_blade"
    },
    {
     "name": "Conjure Pact Weapon",
     "desc": "เรียกอาวุธระยะประชิด Simple/Martial ที่เลือกขึ้นมาในมือ เลือกรูปทรงใหม่ได้ทุกครั้งที่เรียก ถือได้ทีละหนึ่ง<br>การใช้: 1 Bonus Action<br>เงื่อนไข: Bonus Action; ต้องมือว่างอย่างน้อย 1 ข้าง; ใช้ได้ Stage 1–2<br>ใช้ไม่ได้เมื่อ: Incapacitated; Stage 3 หรือ Mental Break<br><i>(Bonus Action)</i>",
     "uses": null,
     "per": null,
     "id": "conjure_pact_weapon",
     "cat": "pact_blade"
    },
    {
     "name": "Bond with a Magic Weapon",
     "desc": "ผูกกับอาวุธเวทที่สัมผัส (ไม่มีคนอื่น attune และไม่มี Warlock อื่นผูกอยู่) ได้ proficiency และใช้เป็น Focus ได้ ไม่ต้องพิธี 1 ชั่วโมงใน 2024<br>การใช้: 1 Bonus Action<br>เงื่อนไข: Bonus Action; ต้องสัมผัสอาวุธเวทนั้น; อาวุธนั้นไม่มีคน attune และไม่มี Warlock อื่นผูกอยู่<br>ใช้ไม่ได้เมื่อ: Incapacitated; Stage 3 หรือ Mental Break<br><i>(Bonus Action · ตรวจกฎกับ PHB 2024)</i>",
     "uses": null,
     "per": null,
     "id": "bond_magic_weapon",
     "cat": "pact_blade"
    },
    {
     "name": "End or Change the Bond",
     "desc": "ใช้ Bonus Action ของ Pact of the Blade ซ้ำ พันธะเดิมสิ้นสุด (อาวุธที่เรียกหายไป) แล้วเรียกหรือผูกใหม่ได้ ถ้าอาวุธห่างตัวเกิน 5 ฟุตนานเกิน 1 นาที หรือเราตาย พันธะก็สิ้นสุดเช่นกัน<br>การใช้: 1 Bonus Action<br>เงื่อนไข: ใช้ Bonus Action ของ Pact of the Blade ซ้ำ<br>ใช้ไม่ได้เมื่อ: Incapacitated<br><i>(Bonus Action)</i>",
     "uses": null,
     "per": null,
     "id": "release_pact_weapon",
     "cat": "pact_blade"
    },
    {
     "name": "Lens Shift",
     "desc": "ปรับเลนส์ของ Lady ระหว่าง Pure Fey (ร่ายเวท Hadar ไม่ได้ ไม่มี Glitch) กับ Open Lens (ร่ายทั้งสองได้ แต่ผสมเวท Fey+Hadar ในเทิร์นเดียวเกิด Glitch) ใช้ได้เฉพาะ Stage 1–2<br>การใช้: 1 Bonus Action<br>เงื่อนไข: Bonus Action; ใช้ได้เฉพาะ Stage 1–2 (เลนส์ยังไม่แตก)<br>ใช้ไม่ได้เมื่อ: Incapacitated; Stage 3 หรือ Mental Break (เลนส์แตกแล้ว)<br><i>(Bonus Action)</i>",
     "uses": null,
     "per": null,
     "id": "lens_shift",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Lens Stages",
     "desc": "เลนส์ของ Lady แตกเป็น 4 ช่วงตาม Sanity: 1 ยังอยู่ (10–7), 2 ร้าว (6–4), 3 แตก (3–1), 4 Mental Break (0)<br>เงื่อนไข: กำหนดโดยค่า Sanity ปัจจุบัน<br>ใช้ไม่ได้เมื่อ: -<br><i>(สถานะ)</i>",
     "uses": null,
     "per": null,
     "id": "lens_stage",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Fear Check",
     "desc": "เมื่อมีตัวกระตุ้น ทอย WIS save DC 12 + Dread พลาด Sanity −1 (−2 ถ้าพลาดเกิน 5 หรือ Dread ≥ 4) และ Dread +1 ไม่เกิน 1 ครั้งต่อรอบ<br>ทอย: WIS save DC 12 + Dread (โปรฟิเชียนซี WIS save ของ Warlock); พลาด: Sanity −1 (−2 ถ้าเกิน 5 หรือ Dread ≥ 4), Dread +1<br>เงื่อนไข: เมื่อเกิดตัวกระตุ้น (ดูแท็บ Sanity); ไม่เกิน 1 ครั้งต่อรอบ<br>ใช้ไม่ได้เมื่อ: -<br><i>(พิเศษ)</i>",
     "uses": null,
     "per": null,
     "id": "fear_check",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Sanity",
     "desc": "HP ของจิตใจ (0–10) ลดเมื่อทอย Fear Check พลาด ฟื้นด้วยการพักที่ปลอดภัย (Stage 1–2) Lady Anchor และฉากเรื่องราว ถึง 0 = Mental Break<br>เงื่อนไข: เริ่มที่ 10 ฟื้นตามกฎในแท็บ Sanity<br>ใช้ไม่ได้เมื่อ: -<br><i>(ทรัพยากร)</i>",
     "uses": null,
     "per": null,
     "id": "sanity",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Dread",
     "desc": "ความกลัวของเพอร์รี่ตอนนี้ (0–5) เป็นโบนัส DC ของ Fear Check ที่ 4 Sanity เสียเพิ่ม ที่ 5 เกิดภาพหลอนฉากเดียวแล้วลดเหลือ 3<br>เงื่อนไข: 0–5<br>ใช้ไม่ได้เมื่อ: -<br><i>(ทรัพยากร)</i>",
     "uses": null,
     "per": null,
     "id": "dread",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Mental Break A: Hollow Dream",
     "desc": "Sanity 0 ขณะ Gauge ยังอิ่ม: จิตเข้าโลกลวง ผู้เล่นเล่นในแผนที่จิตใจ DM คุมร่างจริงในแผนที่จริง ร่างมีหนวด/เงาตามที่ DM เลือก<br>ทอย: Bleed: Insight หรือ WIS DC 15 (ดูแท็บ Sanity)<br>เงื่อนไข: Sanity 0 ขณะที่ Gauge ยังอิ่ม/เกินครึ่ง<br>ใช้ไม่ได้เมื่อ: -<br><i>(สถานะ)</i>",
     "uses": null,
     "per": null,
     "id": "mental_break_a",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Mental Break B: Ravenous",
     "desc": "Sanity 0 ขณะ Gauge ต่ำ/หิว: เสียการควบคุม DM คุมร่าง ทิ้งไม้ ร่ายเวท Hadar มือเปล่าไล่เติม Gauge จนเต็ม<br>ทอย: DM คุมร่าง; เพื่อนทอย Persuasion/Arcana DC 15 เพื่อดึงสติ; Anchor: ผู้เล่นทอย WIS DC 15 ต่อฉาก<br>เงื่อนไข: Sanity 0 ขณะที่ Gauge ต่ำ/หิว<br>ใช้ไม่ได้เมื่อ: -<br><i>(สถานะ)</i>",
     "uses": null,
     "per": null,
     "id": "mental_break_b",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Anchor",
     "desc": "บุคคลหนึ่งคนที่เพอร์รี่จะไม่ทำร้ายแม้ใน Mental Break (ผู้เล่นทอย WIS DC 15 ต่อฉากใน Break B)<br>ทอย: WIS DC 15 ต่อฉากใน Break B<br>เงื่อนไข: เลือกก่อนเริ่มแคมเปญ<br>ใช้ไม่ได้เมื่อ: -<br><i>(พิเศษ)</i>",
     "uses": null,
     "per": null,
     "id": "anchor",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Hadar Hunger Gauge",
     "desc": "ความจุ 10×PB (20/30/40) เติมด้วยดาเมจ Necrotic ที่เราสร้าง/เวท Hadar 100% และ Eldritch Blast 50%<br><i>(ทรัพยากร)</i>",
     "uses": null,
     "per": null,
     "id": "hadar_hunger_gauge",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Satiated",
     "desc": "ช่วง 0–X ชม. หลัง Gauge เต็ม: Lens Shift ไม่ต้องทอย ไม่มี Glitch Temp HP = เลเวล Warlock + CHA mod และ Lady สัมผัสตัวจริงได้<br>เงื่อนไข: Gauge เต็ม<br><i>(สถานะ)</i>",
     "uses": null,
     "per": null,
     "id": "satiated",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Midnight Hunt",
     "desc": "ทอย Stealth DC 13 ทุกคืนในสถานะ Hungry ผ่าน = กินอิ่มเงียบ พลาดน้อย (1–4) = อิ่มแต่มีคราบเลือดให้เพื่อนสังเกต พลาดมาก (5+) = อดอาหาร (ถ้าเพื่อนรู้ความลับแล้วไม่มีคราบเลือด)<br>ทอย: ทอย Stealth DC 13 (เพื่อนไม่รู้ความลับ; พลาดน้อย 1–4 = อิ่มแต่มีคราบเลือด; พลาดมาก 5+ = อดอาหาร)<br>เงื่อนไข: สถานะ Hungry (24–72 ชม.); ทอยก่อน Long Rest; ต้องมีเป้าหมายที่เหมาะสม (อาชญากร/มอนสเตอร์)<br>ใช้ไม่ได้เมื่อ: ถูกจับตา/ไม่มีทางออกจากค่าย<br><i>(พิเศษ)</i>",
     "uses": null,
     "per": null,
     "id": "midnight_hunt",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Finishing Blow",
     "desc": "ฆ่าศัตรู CR ≥ 1/4 ด้วยดาบ Necrotic หรือเวท Hadar = เติม Gauge เต็มทันที<br>เงื่อนไข: ฆ่าเป้าหมาย CR ≥ 1/4; ด้วยดาบ Necrotic หรือเวท Hadar<br><i>(ติดตัว)</i>",
     "uses": null,
     "per": null,
     "id": "finishing_blow",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Lady's Wand",
     "desc": "Arcane Focus (ไม่ใช่อาวุธ ไม่มี proficiency) ไม้เรียวสีเข้ม ลำไม้เป็นข้อ มีลูกกลมสลักลายดาวสี่แฉกสี่ลูกและด้ามวงแหวนทองแดง เพื่อนที่แตะไม้นี้ใส่เพอร์รี่ขณะดึงสติ (Persuasion/Arcana DC 15) ได้ Advantage<br>เงื่อนไข: ต้องถือ/พกไม้; เป็น Arcane Focus ไม่ใช่อาวุธ ไม่มี proficiency; ตีด้วยไม้ = Improvised Weapon 1d4 (ไม่บวก proficiency) หรือ Unarmed Strike ไม่แนะนำ [ตรวจ]<br>ใช้ไม่ได้เมื่อ: ไม้ตกพื้นตอน Mental Break B; Stage 3 (ไม้ไม่ตอบสนอง)<br><i>(ไอเทม)</i>",
     "uses": null,
     "per": null,
     "id": "lady_wand",
     "cat": "hadar_mechanic"
    },
    {
     "name": "Calm the Hunger (ally action)",
     "desc": "เพื่อนใช้ Action ทอย Persuasion/Arcana DC 15 ปลุกสติขณะ Mental Break B ถ้าถือไม้ Lady แตะตัวเพอร์รี่ = Advantage<br>ทอย: เพื่อนทอย Persuasion หรือ Arcana DC 15<br>เงื่อนไข: เพื่อนอยู่ติดตัว Perry; Action ของเพื่อน; ถือไม้ Lady แตะตัวเพื่อ Advantage<br>ใช้ไม่ได้เมื่อ: เพื่อน Incapacitated; ไม่มีไม้ (ยังทอยได้แต่ไม่ Advantage)<br><i>(Action)</i>",
     "uses": null,
     "per": null,
     "id": "calm_the_hunger",
     "cat": "hadar_mechanic"
    }
   ],
   "spells": [
    {
     "name": "Prestidigitation",
     "th": "เล่นกลเวทเล็กๆ ทำความสะอาด อุ่น/เย็นเครื่องดื่ม ปรุงรสอาหาร (เหมาะกับ Perry ที่ลิ้นไม่รับรส)",
     "method": "spell",
     "level": 0,
     "id": "elven_prestidigitation"
    },
    {
     "name": "Eldritch Blast",
     "th": "ลำแสงดำขอบแดง ยิง 1 ลำ (L5: 2 ลำ, L11: 3 ลำ) พร้อม Agonizing Blast บวก CHA ต่อลำ",
     "method": "spell",
     "level": 0,
     "id": "eldritch_blast"
    },
    {
     "name": "Minor Illusion",
     "th": "สร้างเสียงหรือภาพนิ่งขนาด 5 ฟุตลูกบาศก์ นาน 1 นาที (ใช้หลอก Norm/ศัตรู)",
     "method": "spell",
     "level": 0,
     "id": "minor_illusion"
    },
    {
     "name": "Hex",
     "th": "สาปเป้าหมาย 1 ตัว ทุกครั้งที่เราตีโดนได้ Necrotic +1d6 และเลือกค่าความสามารถให้ทอยเช็กเสียเปรียบ ย้ายเมื่อเป้าตายได้",
     "method": "pact",
     "level": 1,
     "id": "hex"
    },
    {
     "name": "Armor of Agathys",
     "th": "ได้ Temp HP 5 (+5 ต่อระดับช่อง) ศัตรูที่ตีประชิดโดนเราจะรับ Cold 5 (+5 ต่อระดับช่อง) ขณะ Temp HP ยังเหลือ",
     "method": "pact",
     "level": 1,
     "id": "armor_of_agathys"
    }
   ]
  },
  "2": {
   "features": [
    {
     "name": "Magical Cunning",
     "desc": "พิธี 1 นาที ฟื้นช่อง Pact Magic ครึ่งหนึ่ง (ปัดขึ้น)<br>การใช้: 1/Long Rest<br>เงื่อนไข: พิธี 1 นาที (ไม่ใช่ใน combat); ฟื้นช่อง Pact ครึ่งหนึ่ง; ใช้ได้ 1 ครั้ง/Long Rest<br>ใช้ไม่ได้เมื่อ: อยู่ใน combat; ถูกรบกวนตลอดพิธี<br><i>(พิเศษ · ตรวจกฎกับ PHB 2024)</i>",
     "uses": "1",
     "per": "lr",
     "id": "magical_cunning",
     "cat": "class_feature"
    },
    {
     "name": "Eldritch Invocation: Agonizing Blast",
     "desc": "บวก CHA mod เข้าดาเมจของ Eldritch Blast ทุกลำแสง<br><i>(ติดตัว)</i>",
     "uses": null,
     "per": null,
     "id": "agonizing_blast",
     "cat": "invocation"
    }
   ],
   "spells": [
    {
     "name": "Arms of Hadar",
     "th": "หนวดดำพุ่งจากเงาโดยรอบ ศัตรูทุกตัวในระยะ 10 ฟุตทอย STR save พลาดรับดาเมจเต็มและใช้ Reaction ไม่ได้ ผ่านรับครึ่ง",
     "method": "pact",
     "level": 1,
     "id": "arms_of_hadar"
    }
   ],
   "agonizing": true
  },
  "3": {
   "features": [
    {
     "name": "Steps of the Fey",
     "desc": "ใช้ Misty Step ฟรีตามจำนวน CHA mod ต่อ Long Rest พร้อมผลเสริมให้เลือก (ตรวจ PHB 2024 สำหรับผลเสริม)<br>การใช้: CHA mod ครั้ง/Long Rest<br>เงื่อนไข: ต้องเห็นจุดปลายทาง 30 ฟุต; จำกัดตาม CHA mod ต่อ Long Rest<br>ใช้ไม่ได้เมื่อ: เลนส์แตก (Stage 3) หรืออยู่ใน Mental Break — เวท Fey ใช้ไม่ได้; Incapacitated; ถูก Silence; ใช้ครบแล้ว<br><i>(Bonus Action · ตรวจกฎกับ PHB 2024)</i>",
     "uses": "@cha",
     "per": "lr",
     "id": "steps_of_the_fey",
     "cat": "subclass_archfey"
    },
    {
     "name": "Psychic Spells (เลนส์แตก Stage 3)",
     "desc": "ในช่วงเลนส์แตก (Stage 3) ใช้ชุดสกิลสาย Great Old One: เปลี่ยนดาเมจเวท Warlock เป็น Psychic ได้ (ตรวจ PHB 2024)<br>เงื่อนไข: ต้องอยู่ใน Stage 3 (เลนส์แตก)<br>ใช้ไม่ได้เมื่อ: Stage 1–2 (เลนส์ยังไม่แตก)<br><i>(ติดตัว · ตรวจกฎกับ PHB 2024)</i>",
     "uses": null,
     "per": null,
     "id": "psychic_spells",
     "cat": "subclass_hadar"
    }
   ],
   "spells": [
    {
     "name": "Detect Magic",
     "th": "รับรู้เวทในรัศมี 30 ฟุต (ฟรี 1 ครั้ง/Long Rest ตามกฎ High Elf; ตรวจเลเวลที่ได้)",
     "method": "innate",
     "level": 1,
     "id": "elven_detect_magic",
     "uses": 1
    },
    {
     "name": "Faerie Fire",
     "th": "(Archfey) ลูกบาศก์ 20 ฟุต DEX save พลาด: เรืองแสง ศัตรูโดนโจมตีเปรียบ ล่องหนไม่ได้",
     "method": "pact",
     "level": 1,
     "id": "faerie_fire"
    },
    {
     "name": "Sleep",
     "th": "(Archfey) ศัตรูในพื้นที่ทอย WIS save พลาดเข้าสู่ภาวะหลับตามกฎ 2024 (ตรวจรายละเอียด)",
     "method": "pact",
     "level": 1,
     "id": "sleep"
    },
    {
     "name": "Mirror Image",
     "th": "สร้างภาพลวงเหมือนตัวเรา 3 ร่าง ศัตรูอาจโจมตีโดนภาพแทนตัวจริง นาน 1 นาที ไม่ต้อง Concentration",
     "method": "pact",
     "level": 2,
     "id": "mirror_image"
    },
    {
     "name": "Misty Step",
     "th": "(Archfey) วาร์ป 30 ฟุตไปจุดที่เห็น (ใช้ผ่านช่อง Pact, Steps of the Fey หรือ High Elf ฟรี)",
     "method": "pact",
     "level": 2,
     "id": "misty_step_spell"
    },
    {
     "name": "Phantasmal Force",
     "th": "(Archfey) ฝังภาพลวงในหัวเป้าหมายที่ทอย INT save พลาด ทำให้ได้รับดาเมจ Psychic ต่อเทิร์น",
     "method": "pact",
     "level": 2,
     "id": "phantasmal_force"
    },
    {
     "name": "Calm Emotions",
     "th": "(Archfey) ลูกทรงกลม 20 ฟุต WIS save ระงับ/สงบอารมณ์ (ใช้ช่วยปลดสติเพื่อนในฉาก Mental Break B ได้ตามดุลยพินิจ DM)",
     "method": "pact",
     "level": 2,
     "id": "calm_emotions"
    }
   ]
  },
  "4": {
   "features": [
    {
     "name": "Eldritch Invocation: Armor of Shadows",
     "desc": "ร่าย Mage Armor ใส่ตัวเองได้ไม่จำกัด ไม่เสียช่อง AC = 13 + DEX (ระบบตั้งให้) · ตอนได้ฟีเจอร์นี้จะได้ AC 17 (เรียนรู้ได้เมื่อมีประสบการณ์ผจญภัยพอ: เลเวล 4)<br>การใช้: ไม่จำกัด (ไม่ใช้ช่อง)<br>เงื่อนไข: ร่าย Mage Armor ใส่ตัวเอง; ต้องไม่ใส่เกราะ; ไม่ต้องใช้ช่อง ร่ายใหม่ทุกเช้า<br>ใช้ไม่ได้เมื่อ: ใส่เกราะ; Incapacitated; ถูก Silence<br><i>(Action · ตรวจกฎกับ PHB 2024)</i>",
     "uses": null,
     "per": null,
     "id": "armor_of_shadows",
     "cat": "invocation"
    }
   ],
   "spells": [
    {
     "name": "Booming Blade",
     "th": "โจมตีด้วยดาบ Pact ศัตรูที่ขยับออกจากที่จะรับดาเมจ Thunder เพิ่ม (ดาเมจขยายที่ L5, L11) — ตัวเลือกแทน Mage Hand",
     "method": "spell",
     "level": 0,
     "id": "booming_blade"
    },
    {
     "name": "Invisibility",
     "th": "ล่องหนจนกว่าจะโจมตีหรือร่ายเวท Concentration 1 ชั่วโมง ใช้กับ Midnight Hunt ได้",
     "method": "pact",
     "level": 2,
     "id": "invisibility"
    }
   ],
   "asi": {
    "dex": 2
   },
   "update": {
    "system.attributes.ac.calc": "mage"
   }
  },
  "5": {
   "features": [
    {
     "name": "Thirsting Blade",
     "desc": "Attack action โจมตีด้วยดาบ Pact ได้ 2 ครั้ง<br>เงื่อนไข: ใช้กับ Attack action ด้วยดาบ Pact (Stage 1–2)<br><i>(ติดตัว)</i>",
     "uses": null,
     "per": null,
     "id": "thirsting_blade",
     "cat": "pact_blade"
    },
    {
     "name": "Eldritch Smite",
     "desc": "หนึ่งครั้งต่อเทิร์น เมื่อตีโดนด้วย Pact weapon ใช้ช่อง Pact เพิ่มดาเมจ Force 1d8 + 1d8 ต่อระดับช่อง · เป้าหมายขนาด Huge หรือเล็กกว่าต้องเซฟ STR (DC เวทของเธอ) ถ้าไม่ผ่านจะล้มลง (ปรับตามโลกนี้: ต้องมี save ไม่ล้มอัตโนมัติ)<br>ทอย: ทอยดาเมจ 1d8 + 1d8 ต่อระดับช่อง; ไม่มี save (เป้าหมายล้มถ้า Huge หรือเล็กกว่า)<br>การใช้: 1 ช่อง Pact Magic ต่อการใช้<br>เงื่อนไข: ตีโดนด้วยดาบ Pact (Stage 1–2); ต้องมีช่อง Pact; หนึ่งครั้งต่อเทิร์น<br>ใช้ไม่ได้เมื่อ: ไม่มีช่อง Pact; ตีพลาด<br><i>(พิเศษ)</i>",
     "uses": null,
     "per": null,
     "id": "eldritch_smite",
     "cat": "pact_blade"
    },
    {
     "name": "Beam Clash",
     "desc": "ใช้ Counterspell หรือ Ready Eldritch Blast ปะทะลำแสงศัตรูกลางอากาศ แล้วทอย Spellcasting Check (d20 + CHA) วัดลำแสงใครดันกว่า<br>ทอย: ทอย Spellcasting Check (d20 + CHA) เทียบศัตรู<br>เงื่อนไข: ใช้ Counterspell หรือ Ready Eldritch Blast; ต้องเห็นศัตรูกำลังยิงลำแสง<br>ใช้ไม่ได้เมื่อ: Incapacitated; Mental Break<br><i>(Reaction)</i>",
     "uses": null,
     "per": null,
     "id": "beam_clash",
     "cat": "hadar_mechanic"
    }
   ],
   "spells": [
    {
     "name": "Counterspell",
     "th": "Reaction ยับยั้งเวทศัตรู ผู้ร่ายทอย CON save (DC ของเรา) พลาด เวทล้มเหลว ใช้เป็น Beam Clash ได้",
     "method": "pact",
     "level": 3,
     "id": "counterspell"
    },
    {
     "name": "Blink",
     "th": "(Archfey) ปลายเทิร์นทอย d6 ถ้าได้ 4-6 หายเข้า Ethereal Plane ไปปรากฏเทิร์นถัดไป",
     "method": "pact",
     "level": 3,
     "id": "blink"
    },
    {
     "name": "Plant Growth",
     "th": "(Archfey) เร่งพืชโตบริเวณกว้างเป็นภูมิประเทศยากต่อการเคลื่อนที่ (ประโยชน์ในสนามนอกเมือง)",
     "method": "pact",
     "level": 3,
     "id": "plant_growth"
    }
   ]
  }
 }
};
