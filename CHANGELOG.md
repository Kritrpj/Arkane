# Changelog

## 0.10.0 - 2026-11-27
- Effect spell casting

## Unreleased
- `jb2aNames.ts`: ชื่อ JB2A (Sequencer) ของทุกสกิลที่ตัวละครมี ที่เดียว ผสมเข้า fx.refs ตอนสร้าง catalog (ชื่อที่ยังไม่ยืนยันมี // เดา)
- `npm run fx -- <โฟลเดอร์ JB2A>`: สแกนไฟล์ JB2A จริงที่มี จับคู่กับสกิลตามชื่อ -> src/data/spellFx.generated.ts สกิลไม่ต้องเขียน ref เอง (`fx.color` เลือกสี, `fx.auto: false` ปิด) · catalog เพิ่ม 32 สกิลของตัวละคร (coreMore.ts) · `castFx.audit()`
- castFx: เอฟเฟกต์สกิลตอนร่าย (JB2A/Sequencer → ไฟล์เรา → เส้นสำรอง) จาก catalog `fx`, `fx.stages` หลายจังหวะ, delivery `point`, targets อ่านจากข้อความแชทของ dnd5e, `fxPreview` สำหรับ harness · ปิด castIcon ไม่ปิด castFx แล้ว
- Spell catalog (src/spells, SPELLS.md): สกิลกลาง + house/custom (extends) + byCaster + variants, ไอคอนต่อผู้ร่าย (npm run icons), game.arkane.core.spells (check/explain), castIcon เลือกไอคอนจาก catalog

## 0.9.0 - 2026-11-27
- Shove, Push, Zone features

## 0.8.0 - 2026-11-27
- แยก release เป็น module ต่อ feature ใน folder arkane-core/ (core.js, shove.js, charge.js, zones.js, props.js, heights.js + loader.js + manifest.json) ไม่ต้องแก้ scripts/arkane.js อีก; cache-buster อยู่ใน loader

## 0.7.0 - 2026-11-27
- รวมงาน Zone (พื้นที่ที่ระบบรู้ว่าเป็นอะไร: วัสดุ/สาร ซ้อนชั้น รวมก้อน สรุปให้ DM และจบรอบ) เข้ากับ 0.6.0 (ดาเมจกระแทกต่อเนื่อง, พุ่งชน, ระบบเคลื่อนที่กลาง); แก้เทสต์ zones ที่รูปร่างขัดกับตัวเอง; เพิ่มเทสต์ zones x physics

## 0.6.0 - 2026-11-27
- ดาเมจกระแทกแบบต่อเนื่อง (ชนคน/ของ/กำแพง: d6 เต็มต่อ 10 ฟุต + เศษเป็นสัดส่วนของ d6 ขั้นต่ำ 1 ฟุต; ตกขอบยังเป็นกฎ 5e) พร้อมคำอธิบายสูตรใน harness, สวิตช์ปิดกฎขนาดของกฎ physics (RulesetPhysics sizeRule:false), เคส harness ตัวเล็กแรงสูง/พุ่งชน

## 0.5.0 - 2026-11-26
- ระบบเคลื่อนที่/ชนกลาง (actions/motion.ts) ที่ Shove และ Charge ใช้ร่วมกัน + action ใหม่ พุ่งชน (Charge): game.arkane.core.charge() พลังงานจากแรงเกาะพื้น/ความเร็ว/น้ำหนัก; harness เลือกท่าได้

## 0.4.1 - 2026-11-25
- แก้อ่านน้ำหนักจากชีต: 1,200 lb เคยอ่านเป็น 1.2 (ตอนนี้ถูก), ค่าน้ำหนัก/ส่วนสูงที่ผิดปกติถูกข้ามพร้อมหมายเหตุใน inspect, ใช้ค่า STR จริงแทนค่าที่ปัดจาก mod

## 0.4.0 - 2026-11-25
- harness: ลากย้าย/วางทุกตัว, วาดพื้น-กำแพง, 28 เคสทดสอบพร้อมป้ายตรวจ, sidebar อธิบายการคิดทีละขั้น (ctx.trace), inspector แก้มวล/STR/วัสดุ ฯลฯ, Undo

## 0.3.0 - 2026-11-24
- ชนคน/ของ (Prop: มวลจากวัสดุ×ปริมาตร), ชนเป็นลูกโซ่ (inelastic), ดันของไปด้วย, ของตกขอบ, game.arkane.core.setProp(), harness มีลัง/รูปปั้น/ยักษ์ + สลับกฎ 2024/physics

## 0.2.0 - 2026-11-24
- RulesetPhysics: ระยะผลักจากแรง/มวล/แรงเสียดทาน (work-energy), ชนกำแพงมีดาเมจตามตารางตก, มวลอ่านจากชีต (override > weight > height > size), game.arkane.core.useRules()/inspect() (ค่าเริ่มต้นยังเป็นกฎ 2024)

## 0.1.0 - 2026-11-24
- Shove (กฎ 2024) + adapter ต่อ Foundry: game.arkane.core.shove()

