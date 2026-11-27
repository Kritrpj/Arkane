# Arkane core (TypeScript)

โค้ดใหม่ของระบบ gameplay อยู่ใน `src/` (TS) แล้ว build เป็น folder `arkane-core/` (แยกเป็นไฟล์ .js ต่อ feature)
ไฟล์ของเพื่อนไม่ถูกแตะเลย รวมถึง `scripts/arkane.js` (ไม่ต้องแก้ ไม่ต้องมี `?v=` ในนั้น) ทุกอย่างของเราอยู่ใน `src/ arkane-core/` เท่านั้น

## โครง
- `src/model/`    ชนิดข้อมูล: Trace (เหตุผลของกฎ), Thing (ฐานของ Creature และ Prop), Creature, Prop, World, Effect, CheckResult (+ `make.ts` สร้างสำหรับ test)
- `src/data/`     ตารางตัวเลข (ดาเมจตก, condition, มวลตาม size, พื้นผิว, วัสดุของ, ค่าผลัก) ปรับบาลานซ์ที่นี่
- `src/rules/`    กฎกลาง: dice, size, reach, push, chain (ชนเป็นลูกโซ่), physics, mass, propMass, check, ruleset (สมุดกฎ เปลี่ยนกฎด้วย `extends Ruleset`)
- `src/actions/`  Action = canUse + resolve (คืน effect ไม่แก้อะไรเอง) + registry; `motion.ts` = ระบบเคลื่อนที่/ชนกลาง ที่ทุก action ใช้ร่วมกัน
- `src/world/`    GridWorld: World จากข้อมูลล้วน ใช้ใน test และ harness
- `src/foundry/`  adapter ต่อ Foundry (เฉพาะส่วนนี้ที่แตะ game/canvas):
  - `snapshot.ts` token -> Creature, แปลง px <-> ช่อง
  - `world.ts` World จริง (กำแพงจาก collision ของ Foundry, น้ำมันจาก template, ความสูงจาก flag)
  - `apply.ts` effect -> แชต (ผู้เล่นเขียนเอง) + แก้ token/actor (ส่งให้ GM ทาง socket `c-fx`)
  - `shove.ts` จุดเข้า: อ่านตัวที่เลือก/เป้าหมาย รัน action ถามผลัก/ล้มเมื่อ save พลาด
  - `register.ts` เรียกครั้งเดียวตอน ready: ตั้ง `game.arkane.core` + ฟัง socket
  - `heights.ts` GM วาดความสูงพื้น
  - `props.ts` GM ติดป้าย token ว่าเป็นของ (`setProp`)
  - `inspect.ts` พิมพ์ว่าระบบเห็น token เป็นอย่างไร
- `tests/`        vitest (173 ข้อ รวม Foundry ปลอมสำหรับ adapter และตรวจทุกเคสของ harness)
- `dev/`          harness ดูในเบราว์เซอร์ (ไม่ถูกโหลดโดย Foundry) ดูหัวข้อ "Harness" ด้านล่าง
- `src/core.ts`   ฐาน (สร้าง `game.arkane.core`, version, สลับกฎ, inspect, ฟัง socket) -> `arkane-core/core.js`
- `src/features/` 1 ไฟล์ = 1 feature = 1 module ที่ release: `shove.ts` `charge.ts` `zones.ts` `props.ts` `heights.ts` แต่ละไฟล์ export `register(core)` -> `arkane-core/<ชื่อ>.js`
- `arkane-core/` ไฟล์ที่ build แล้ว (folder ของเราเอง) คอมมิตไว้ เพื่อนไม่ต้องลง Node: `loader.js` (จุดเข้าเดียวที่ Foundry รู้จัก), `manifest.json` (เลขเวอร์ชัน + รายชื่อ feature), `core.js`, `<feature>.js`, `chunks/` (โค้ดที่ใช้ร่วมกัน ชื่อมี hash)
- `tools/`        สคริปต์ build และ release (เพิ่มเลขเวอร์ชัน, เขียน manifest, เขียน CHANGELOG) + `loader.js` ต้นฉบับ

## คำสั่ง (ฝั่งเรา)
    npm install        # ครั้งเดียว
    npm run check      # typecheck + test
    npm run dev        # harness (http://localhost:5173)
    npm run build      # สร้าง arkane-core/ ใหม่ทั้ง folder (ไม่เปลี่ยนเลขเวอร์ชัน)
    npm run release -- <patch|minor|major> "อะไรเปลี่ยน"   # ดูหัวข้อด้านล่าง

## ติดตั้งลงโปรเจกต์ (ทำครั้งเดียว)
แตก zip ทับที่รากโปรเจกต์ แล้วเพิ่ม 1 บรรทัดใน `module.json` (ไม่ใช่ `scripts/arkane.js`) ที่ `esmodules`:

    "esmodules": ["scripts/arkane.js", "arkane-core/loader.js"]

`loader.js` รอ hook `ready` เอง อ่าน `manifest.json` แล้วโหลด `core.js` กับทุก feature ตามลำดับ
(feature ไหนโหลดไม่ได้ จะ warn ใน Console แล้วข้าม ตัวอื่นยังทำงาน; ดูผลที่ `game.arkane.core.features`)
เลขเวอร์ชันกันแคช (`?v=`) ถูกใส่โดย loader ทุกครั้งที่ release จึงไม่ต้องแตะไฟล์ของเพื่อนอีก

**ย้ายจาก 0.7.0 หรือเก่ากว่า:** ลบ 2 บรรทัดที่เคยเพิ่มใน `scripts/arkane.js` (`import { registerCore } ...dist/arkane-core.js...` กับ `try { registerCore(); } ...`)
ให้ `arkane.js` กลับเป็นของเพื่อนเหมือนเดิม และลบ folder `dist/` กับ `patches/` เก่าทิ้ง ทำพร้อมกันกับที่เอา zip นี้ลง
(ถ้าลบ `dist/` แต่ยังเหลือบรรทัด import ใน `arkane.js` ทั้ง `arkane.js` จะโหลดไม่ขึ้น)

## ใช้งานในเกม
เลือก token ตัวเอง, ตั้งเป้าหมาย (คลิกเป้าหมายแล้วกด T), แล้วรันเป็น macro (Script):

    game.arkane.core.shove()      // ผลัก
    game.arkane.core.charge()     // พุ่งชน: เลือก token ตัวเอง ตั้งเป้าหมาย (T) ที่อยู่ในแนวตรงห่างอย่างน้อย 1 ช่อง

`game.arkane.shove()` ตัวเดิมยังอยู่ ไม่ถูกแทนที่ ใช้เทียบกันได้

วาดความสูงพื้น (GM): `game.arkane.core.setHeightArea(7, 2, 8, 4, -20)` = ช่องคอลัมน์ 7-8 แถว 2-4 ต่ำลง 20 ฟุต
(ตกจากขอบ = 1d6 ต่อ 10 ฟุต + ล้ม)

## กฎฟิสิกส์ (ผลักตามน้ำหนัก) - ปิดอยู่เป็นค่าเริ่มต้น
    game.arkane.core.useRules("physics")   // เปิด: ระยะผลักมาจากแรง/น้ำหนัก/พื้นผิว + ชนกำแพงมีดาเมจ
    game.arkane.core.useRules("2024")      // กลับกฎเดิม (ผลัก 5 ฟุตเสมอ)
    game.arkane.core.inspect()             // ดูว่าระบบ "เห็น" token ที่เลือกเป็นอย่างไร (มวลมาจากไหน)

สูตร (ตัวเลขทั้งหมดอยู่ `src/data/`: bodies, surfaces, push):
- แรงผลัก F = 30 x STR score x ตัวคูณขนาด (tiny 1/2, sm/med 1, lg 2, huge 4, grg 8)  [lb]
- ผู้ผลักส่งแรงได้ไม่เกิน traction = mu(พื้นใต้ผู้ผลัก) x bracing x มวลผู้ผลัก
- เป้าหมายต้านด้วย mu(พื้นใต้เป้า) x มวลเป้า ถ้า F <= นั้น = ขยับไม่ได้ (รูปปั้น)
- ระยะรวม d = s x F/(mu x W)  (s = ช่วงที่ถูกผลักขณะยังออกแรง 1.5 ฟุต)
- ชนกำแพง: พลังงานเหลือ / W = "ความสูงเทียบเท่า" แล้วคิดดาเมจกระแทกตามหัวข้อ "ดาเมจกระแทก" ด้านล่าง
- ปัดเป็นช่อง: ใกล้สุด (ครึ่งช่องพอดีปัดลง) ตั้งเป็น floor ได้ `new RulesetPhysics({ rounding: "floor" })`

มวล (lb) หาตามลำดับ: flag `arkane-1920s.mass` ของ actor -> `system.details.weight` -> `system.details.height`
(กฎกำลังสาม 180 lb ที่ 5.8 ft) -> ตารางตาม size ถ้าไม่มีข้อมูลเลยก็ใช้ตาราง ระบบไม่ error
ตั้งมวลเอง (GM): `await actor.setFlag("arkane-1920s", "mass", 5000)`

## ดาเมจกระแทก (ชนคน/ของ/กำแพง) และตัวเล็กแรงสูง
ดาเมจจากการชนเป็นแบบ "ต่อเนื่อง" ต่างจากการตกขอบที่ยังเป็นกฎ 5e ตรง ๆ (1d6 ต่อ 10 ฟุตเต็ม ปัดลง):

    h  = ความสูงเทียบเท่า (ฟุต) = พลังงานของฝ่ายนั้น / น้ำหนักตัวเอง
    n  = h / 10 ฟุต
    ดาเมจ = ทอย ⌊n⌋d6  +  เศษ (n - ⌊n⌋) ของ 1d6   (ทอย 1d6 คูณเศษ ปัดเป็นเลขเต็ม อย่างน้อย 1)
    h ต่ำกว่า 1 ฟุต = ไม่เจ็บ,  สูงสุด 20d6

ตัวอย่าง: h = 25 ฟุต -> 2d6 + 0.5 ของ d6; h = 5 ฟุต -> 0.5 ของ d6 (ทอย 4 -> เจ็บ 2)
เลข 10 ฟุต / 1 ฟุต / 20d6 อยู่ที่ `data/fall.ts` ฟังก์ชันคือ `Ruleset.bruise()` (ใช้ใน `actions/motion.ts`)
กฎ 2024 ไม่มีพลังงานชน จึงไม่มีดาเมจกระแทกเลย (ต้องเปิดกฎ physics)
ใน harness: sidebar "ทำไมถึงได้ผลนี้" มีกลุ่ม "ดาเมจคิดยังไง" อธิบายสูตรทุกครั้ง และบรรทัด "ดาเมจจากการชน/กระแทกกำแพง" แสดงตัวเลขจริง (h, n, ทอยได้เท่าไร)

**ตัวเล็กแต่แรงสูงผลักตัวใหญ่ได้ไหม**
- กฎขนาดของ 5e (ผลักได้ใหญ่กว่าไม่เกิน 1 ขนาด) ยังเปิดอยู่ในกฎ physics เป็นค่าเริ่มต้น
  ปิดได้ด้วย `new RulesetPhysics({ sizeRule: false })` (ใน harness เลือกกฎ "Physics (ไม่จำกัดขนาด)") ให้น้ำหนักและแรงเกาะตัดสินแทน
- แม้ปิดกฎขนาด STR สูงอย่างเดียวไม่พอ: แรงที่ส่งได้ = min(30 x STR, traction) โดย traction = μ x 5 x น้ำหนักตัวเอง
  Small STR 20 หนัก 60 lb ส่งแรงได้แค่ 180 lb (ผลักคน 180 lb ได้ 2.5 ฟุต ไม่ขยับ) แต่ถ้าหนัก 250 lb (ใส่เกราะ) ส่งได้เต็ม 600 lb (ผลักได้ 8.3 ฟุต = 2 ช่อง)
- พุ่งชนตัวใหญ่: ตัวเล็กเอาพลังงานการวิ่งไปชนของที่หนักกว่ามาก ตัวเบารับแรงกระแทกเกือบหมด (เจ็บเอง ตัวใหญ่ไม่ขยับ)
- ดูตัวอย่างทั้งหมดใน harness กลุ่ม "ตัวเล็กแรงสูง"

## ระบบเคลื่อนที่/ชนกลาง (`src/actions/motion.ts`) และการเพิ่ม action ใหม่
ทุกอย่างหลังจาก "มีของเริ่มไถล" ทำที่เดียว: เดินทีละช่อง -> ชนคน/ของ (ลูกโซ่ชน) -> ชนกำแพงแล้วเจ็บ -> ตกขอบ
action แต่ละตัวบอกแค่ 4 อย่างผ่าน `Motion`:

    resolveMotion(ctx, {
      body,                     // ใครเป็นฝ่ายเคลื่อนที่ (ผู้ถูกผลัก, คนที่พุ่ง, ลังที่ถูกขว้าง, ตัวที่ถูกระเบิดเหวี่ยง)
      step, cells,              // ทิศ และกี่ช่องที่ตั้งใจไป
      energyAt: (ft) => ...,    // พลังงาน (ft-lb) ที่ยังเหลือหลังเคลื่อนไป ft ฟุต: ตัวนี้แหละที่ต่างกันในแต่ละ action
      describe: (r, note) => Fx.log(...),   // บรรทัดแรกในแชต (ใส่ผลทอยของตัวเองได้)
    })

| action | ใครเป็น `body` | `energyAt` มาจาก |
|---|---|---|
| ผลัก (`shove`) | เป้าหมาย | แรงผลักเทียบแรงเสียดทาน (`rules.pushEnergy`) |
| พุ่งชน (`charge`) | คนที่วิ่ง | แรงเกาะพื้น + ความเร็วสูงสุด + น้ำหนักตัว (`rules.runEnergy`) |
| (ต่อไป) ขว้าง, ระเบิด | ของที่ถูกขว้าง / ตัวที่ถูกเหวี่ยง | แรงขว้าง / แรงระเบิด |

ตัวเลขกฎ (เสียดทาน ความเร็ว ตารางดาเมจตก) อยู่ใน `Ruleset`/`data/` ทั้งหมด เปลี่ยนที่เดียวมีผลกับทุก action
เพิ่ม action ใหม่ = สร้างไฟล์ใน `src/actions/` (canUse + resolve ที่เรียก `resolveMotion`) แล้วใส่ใน `actions/index.ts`
ถ้าต้องการให้ฝั่ง Foundry เรียกได้ ก็เพิ่มไฟล์สั้น ๆ ใน `src/foundry/` ตามแบบ `charge.ts`
ภายใต้กฎ 2024 `energyAt` เป็น 0 จึงไม่มีดาเมจชน/ลูกโซ่ (action ยังเดินและหยุดตามปกติ)

## Harness (`npm run dev` แล้วเปิด http://localhost:5173)
รัน "กฎจริง + Shove จริง" บนกระดานที่จัดเองได้ ไม่ต้องมี Foundry
- **เคสทดสอบ** (dropdown ซ้ายบน): 28 เคสแยกกลุ่ม (กฎ 2024, ระยะผลัก, กำแพง/ขอบ, ชนคน/ของ, กฎรอบๆ) กดแล้วจัดกระดาน ชุดกฎ และเต๋าให้เอง
  พร้อมโน้ต "ควรเห็นอะไร" และป้าย ✓/✗ ว่าผลตรงโน้ตไหม (ตรวจด้วยโค้ดเดียวกับ `tests/scenarios.test.ts` โน้ตกับโค้ดจึงไม่คลาดกัน)
  ถ้ามี `scripts/chmaps.js` ของเพื่อน จะมีกลุ่ม "แมพจริง" เพิ่ม (กำแพงจริง)
- **ลากย้ายได้ทุกตัว**: ลากตัวละคร/ของไปช่องว่าง, คลิก = เป้าหมาย, Shift+คลิก = ผู้ผลัก (ลากทับตัวอื่นไม่ได้)
- **วาดกระดาน**: เครื่องมือความสูง (ฟุต), พื้นผิว (oil/ice/mud/water), กำแพง (คลิกใกล้ขอบช่อง กดซ้ำเพื่อลบ), เพิ่ม/ลบตัวละคร/ลัง/รูปปั้น, ปรับขนาดแมพ
- **แก้ค่าตัวที่เลือก** (sidebar): มวล, ขนาด, STR, save, HP, prone/restrained/paralyzed, flying, วัสดุ/ความสูง/ตรึงของ แก้แล้วคำนวณใหม่ทันที
- **คิดอะไรยังไง** (sidebar): กฎรายงานเหตุผลทีละขั้นพร้อมตัวเลขที่ใช้จริง (save → แรง/traction/เสียดทาน → ระยะ → ปัดช่อง → เส้นทาง → ชนของแต่ละครั้ง → กำแพง → ตกขอบ → ทอยดาเมจ)
  เกิดจาก `ctx.trace` ที่ action/rules เรียกเมื่อมี ไม่ส่งมาก็ไม่เปลี่ยนผลลัพธ์ ใน Foundry ไม่ได้ใช้
- ใส่ d20 และเต๋าดาเมจไว้ = preview อัตโนมัติทุกครั้งที่แก้ (เต๋าตายตัว จึงไม่กระพริบ) เว้นว่าง = สุ่มจริง ต้องกด Preview เอง
- **Shove!** เปลี่ยนกระดานจริง **Undo** ย้อนได้ (รวมการลาก/วาด/แก้ค่า) **Reset เคส** โหลดเคสใหม่

เพิ่มเคสใหม่: เติมใน `dev/scenarios.ts` (build + verify) แล้ว `npm test` จะตรวจให้

## ของ (Prop) และการชน (เฟส B) - อยู่ในกฎ physics เท่านั้น
Prop = token ที่ GM ติดป้าย เป็นสิ่งกีดขวางที่ถูกดัน/ตกขอบได้ ไม่ใช่ตัวละคร (ผลักด้วย Shove ตรงๆ ไม่ได้ ถูกดันเมื่อมีคนชน)

ติดป้าย (GM เลือก token แล้วรันใน Console):

    game.arkane.core.setProp()                                  // ลังไม้ 5 ฟุต (ค่าเริ่มต้น)
    game.arkane.core.setProp({ material: "stone", heightFt: 6 }) // รูปปั้นหิน
    game.arkane.core.setProp({ mass: 300 })                      // กำหนดน้ำหนักเอง (ชนะทุกอย่าง)
    game.arkane.core.setProp({ immovable: true })                // ตรึงอยู่กับที่ = เป็นกำแพง
    game.arkane.core.setProp(null)                               // เอาป้ายออก

ตัวเลือก: `material` (wood, stone, iron, water), `heightFt`, `fill` (0-1 ความทึบ), `mass` (lb), `immovable`
มวล = ความหนาแน่น x (ช่อง x ฟุตต่อช่อง)^2 x สูง x fill ตารางอยู่ `src/data/props.ts`
(ลังไม้ 1 ช่อง สูง 5 ฟุต = 250 lb, รูปปั้นหิน = 10,000 lb) ค่า `fill` ของแต่ละวัสดุเป็นค่าที่ผมเดาให้ได้น้ำหนักสมเหตุสมผล ไม่ได้มาจากกฎ
flag เก็บบน token (ไม่ใช่ actor) ที่ `arkane-1920s.prop` ใช้ `game.arkane.core.inspect()` ดูว่าได้มวลเท่าไรและมาจากไหน

สูตรชน (inelastic: ชนแล้วไปด้วยกัน) ตัวผลัก มวล m1 พลังงาน E ชนของมวล m2:
- พลังงานที่เหลือให้ทั้งคู่ไถลต่อ = E x m1/(m1+m2), ที่เสียไปกลายเป็นดาเมจ = E x m2/(m1+m2)
- ฝั่งที่เบากว่ารับพลังงานที่เสียมากกว่า (ผู้ชนรับสัดส่วน m2/(m1+m2)) ส่วนของที่ถูกชนหนักมากๆ ผู้ชนจะเจ็บเท่าชนกำแพง (กำแพง = มวลอนันต์)
- พลังงานแปลงเป็น "ความสูงเทียบเท่า" h = พลังงาน / น้ำหนักตัวเอง แล้วคิดดาเมจกระแทกตามหัวข้อ "ดาเมจกระแทก" ด้านล่าง
- ทั้งคู่ไถลต่ออีก = พลังงานที่เหลือ / (mu x มวลรวม) ถ้าถูกขวางด้วยของอีกชิ้น = ชนต่อเป็นลูกโซ่ ตัดที่ `PUSH.maxChain` (3) ครั้ง
- ของที่ถูกดันตกขอบได้ (ของไม่เจ็บ ตัวละครเจ็บเหมือนตกขอบ) ของที่ถูกดันไปชนกำแพงจะไม่เสียหาย (ยังไม่มี HP ของ)
- กฎ 2024 ไม่เปลี่ยน: ชนของ/คนแล้วหยุดเฉยๆ

ข้อจำกัดที่ตั้งใจ: ของไม่มี HP, ไม่มีตู้สูงล้ม (เฟส C), ชนคนแล้วคนที่ถูกชนไม่ล้ม (prone) อัตโนมัติ, ผลักของด้วยตัวเองยังไม่มี action

## เลขเวอร์ชันและการปล่อยให้เพื่อน (อัตโนมัติ)
เลขเวอร์ชันอยู่ที่เดียวคือ `version` ใน `package.json` ใช้ `npm run release` แทนการ build เอง:

    npm run release -- patch "แก้บั๊กผลักชนกำแพง"      # 0.1.0 -> 0.1.1  แก้บั๊ก
    npm run release -- minor "เพิ่มขว้างของตามน้ำหนัก"   # 0.1.1 -> 0.2.0  ฟีเจอร์ใหม่
    npm run release -- major "เปลี่ยนโครง Ruleset"      # 0.2.0 -> 1.0.0  แก้แบบเข้ากับของเดิมไม่ได้

คำสั่งนี้ทำให้ครบ: เช็ก (typecheck + test ไม่ผ่านก็หยุด ไม่เปลี่ยนอะไร) -> เพิ่มเลขเวอร์ชัน ->
build `arkane-core/` ใหม่ทั้ง folder (ลบของเก่าก่อน chunk เก่าจึงไม่สะสม, เลขเวอร์ชันอยู่บรรทัดแรกของทุกไฟล์) ->
เขียน `manifest.json` -> เพิ่มบรรทัดใน `CHANGELOG.md` ไม่แตะไฟล์ของเพื่อนเลย

จากนั้นคอมมิต `src/ arkane-core/ CHANGELOG.md package.json` ลง branch แล้ว push
เพื่อน pull แล้วรีโหลด Foundry (F5) ไม่ต้อง npm ตรวจว่าได้ build ไหนด้วย `game.arkane.core.version` ใน Console

**เพิ่ม feature ใหม่** = สร้าง `src/features/<ชื่อ>.ts` ที่ export `register(core)` (ใส่ฟังก์ชันลง `core.<ชื่อ>`) แล้ว release
build หาไฟล์เองและใส่ใน manifest ให้ ได้ `arkane-core/<ชื่อ>.js` แยกต่างหาก ไม่ต้องแก้ loader
**ปิด feature ชั่วคราว** = เอาชื่อออกจาก `features` ใน `arkane-core/manifest.json` (ครั้งต่อไปที่ build จะกลับมา)

ให้เพื่อนดูว่าเปลี่ยนอะไร: อ่าน `CHANGELOG.md` แล้วดู git diff ของ `src/` (อ่านง่ายกว่าไฟล์ใน `arkane-core/`
ซึ่งเป็นไฟล์ที่ generate) ถ้า `arkane-core/` conflict ตอน merge ไม่ต้องแก้มือ: `npm run build` ใหม่ทับ
ถอนออก: เอา `arkane-core/loader.js` ออกจาก `esmodules` ใน `module.json` (src/ กับ arkane-core/ อยู่เฉย ๆ ไม่มีผล)

## เช็กลิสต์ให้เพื่อนทดสอบ
1. F12 Console: พิมพ์ `game.arkane.core` ต้องเห็น object และ `game.arkane.core.features` ต้องได้ `failed: []` (ถ้า undefined = `arkane-core/loader.js` ยังไม่อยู่ใน `esmodules` ของ `module.json`, หรือ `arkane.js` ของเพื่อนสร้าง `game.arkane` ใหม่ทับหลังเราโหลด; ถ้ามี feature ใน `failed` ให้ส่ง error ใน Console กลับมา)
2. ทดสอบกับ `game.arkane.shove()` ตัวเดิมก่อนหนึ่งครั้ง ถ้าตัวเดิมก็ error แสดงว่าปัญหาอยู่ที่สภาพแวดล้อม (เวอร์ชัน Foundry/dnd5e) ไม่ใช่ของใหม่
3. เล่นในฐานะ GM: ผลักเป้าหมายติดกัน, ผลักชนกำแพง, ผลักชนคน, เลือก "ล้ม"
4. เล่นในฐานะผู้เล่น (ให้ GM ออนไลน์อยู่): ผลักแล้วเป้าหมายต้องขยับ (ผ่าน socket)
5. พิมพ์ `game.arkane.core.inspect()` กับ token 1 ตัว ดูว่า `massSource` เป็น size/weight/height และชื่อ field ใน `sheetWeight`/`sheetHeight` ตรงกับ dnd5e ของเพื่อนไหม
6. `game.arkane.core.useRules("physics")` แล้วลองผลักคนทั่วไป (ควรไป 1 ช่อง), ผลักตัวเบากับตัวหนัก, ผลักชนกำแพง
7. (เฟส B) ติด prop: เลือก token ลัง รัน `game.arkane.core.setProp()` แล้ว `game.arkane.core.inspect()` ต้องเห็น `material: "wood"`, `mass: 250`
8. (เฟส B) กฎ physics: ตั้งตัวใหญ่ (str สูง) ผลักตัวเล็กไปทางลัง ลังต้องถูกดันไปด้วย ผลักไปทางรูปปั้นหิน (`setProp({material:"stone"})`) ต้องไม่ขยับและคนที่ถูกผลักเจ็บเหมือนชนกำแพง ลองลังที่ตรึง (`immovable`) และลังที่ถูกดันตกขอบความสูง
9. ส่ง screenshot แชต + error ใน Console กลับมา

## Zone (ขั้นที่ 1) - พื้นที่ที่ระบบรู้ว่าเป็นอะไร

Zone = ข้อมูลของเรา (`src/model/zone.ts`) Foundry Scene Region เป็นฝ่ายวาด/ลาก/ย้าย/ลบ. รูปร่างอ่านจาก Region ตรง ๆ ส่วนข้อมูลอื่นเก็บใน flag `arkane-1920s.zone`. หน่วยเป็นฟุตต่อเนื่องวัดจากมุมบนซ้ายของกริด ช่อง 5 ฟุตเป็นแค่จุดตัวอย่าง
- **วัสดุ** (ถาวร: ไม้ เหล็ก หิน ดิน หญ้า ทราย ป่า) กับ **สาร** (ชั่วคราว: น้ำ โคลน น้ำมัน น้ำแข็ง ไฟ) อยู่ใน `src/data/zones.ts` ตัวเลขคุณสมบัติทั้งหมดเป็น house rule ที่เสนอ (น้ำแข็งติด `unchecked`) ปรับทับทีละค่าได้ด้วย `overrides`
- **ซ้อนชั้น** (`resolveZones`): mu ชั้นบนสุดชนะ, ติดไฟ/นำไฟฟ้า/ความแข็ง = สูงสุด, fuel = บวก, difficult = OR, บัง = สูงสุด, ดาเมจชื่อเดียวกันไม่ทบ. ผลมี `trace` บอกที่มาทุกค่า
- **merge**: สารชนิดเดียวกันที่ซ้อน/ติดกันรวมเป็นก้อนเดียว (ปริมาตรบวก รูปร่างต่อกัน) ใช้ spatial hash เพดาน 200 Zone ต่อฉาก; ผูกสมาธิ = รวมเฉพาะของผู้เสกคนเดียวกัน
- **หมดอายุ**: 1 รอบ = 6 วิ ใน combat นับรอบ นอก combat ใช้ worldTime; hook `updateCombat`/`updateWorldTime` ฝั่ง GM ลบให้
- **ช่องนับว่าถูกคลุม**: ค่าเริ่มต้นจุดกลางช่องอยู่ในรูปร่าง; ตั้ง flag ฉาก `arkane-1920s.zoneCoverage = {mode:"fraction", min:0.5}` เพื่อใช้สัดส่วนที่คลุม
- **น้ำมันเดิม** (Measured Template ป้าย `oil`) ถูกแปลงเป็น Zone วงกลมอัตโนมัติ พฤติกรรมเดิม

ใช้ฝั่ง GM ใน console (`game.arkane.core.zones`): `create(zone)`, `label(regionId, "wood")`, `remove(ids)`, `sweep()`, `closeConcentration(casterId)`, `at(xPx, yPx)` ส่องจุดดูชั้นและเหตุผล. ยังไม่ผูก dnd5e concentration (ต้องตรวจวิธีฟังกับเวอร์ชันจริง) และ mu ของ "วัสดุ" ยังไม่ถูกส่งเข้า push (กฎ physics ใช้ชื่อสารกับ `FRICTION` อยู่)

### สรุปให้ DM (`src/rules/turnReport.ts`)
`turnReport(world, clock, { whose? })` อ่านอย่างเดียว ไม่แก้โลก คืนรายการข้อเสนอพร้อมที่มา (RAW/physics/house/unchecked) ว่า Zone ทำอะไรกับใคร
- **ในเทิร์น** (`clock.round` มีค่า, ใส่ `whose` = คนที่ถึงเทิร์น): difficult terrain, พื้นลื่น, ดาเมจปลายเทิร์น (แนบ `Effect` damage เป็นข้อเสนอ ยังไม่ apply), ดาเมจตอนเดินเข้า, พื้นนำไฟฟ้า/ติดไฟง่าย, Zone ที่หมดในรอบนี้, ผู้เสกที่ถือสมาธิ
- **นอก combat** (ไม่มี `round`): ไม่มีเทิร์น ดาเมจปลายเทิร์นไม่ทำงานเอง (ไม่มีข้อเสนอ) Zone นับเวลาโลกบอกวินาทีที่เหลือ Zone ที่ผูกรอบ combat จะไม่หมดเอง
- Foundry: `game.arkane.core.zones.report(tokenId?)` whisper หา GM; `zones.autoReport(true)` ส่งอัตโนมัติตอนเปลี่ยนเทิร์น (ปิดเป็นค่าเริ่มต้น) · harness: ปุ่ม "สรุป..." ในแผง Zone

### จบรอบ: Zone ทำอะไรกันเอง (`src/rules/zoneTick.ts`)
ทำ **ครั้งเดียวต่อรอบ** (ตอนเปลี่ยนรอบ ไม่ใช่ทุกเทิร์น ไม่งั้นไฟลามหลายรอบในรอบเดียว) คืนข้อเสนอ ยังไม่แก้อะไร ทั้งหมดเป็น house rule: ไฟเผาเชื้อเพลิงช่องละ 1/รอบ (หมด = ไหม้เกรียม), ลามช่องข้างเคียงด้วยโอกาส = flammability (สุ่มไว้ให้ DM เปลี่ยนได้), น้ำดับไฟ **ยกเว้นมีน้ำมันลอยอยู่**, ไฟละลายน้ำแข็ง, แจ้งคนที่ยืนในช่องไฟ (ดาเมจไฟรอ DM/compendium)
กันข้อความท่วม: รวมเป็นบรรทัดต่อชนิด (บอกจำนวนช่อง + ตัวอย่างไม่กี่ช่อง) แยก `act` (DM ต้องตัดสิน) กับ `info` (พับไว้) การ์ดแชทเดียวต่อครั้ง; `zones.autoReport("act")` = ส่งเฉพาะเมื่อมีข้อ act (ค่าแนะนำ) · `"all"` ทุกครั้ง · `false` ปิด

## ไอคอนสกิลลอยขึ้นเหนือ token (feature `castIcon`)
ใช้ไอเทม/สเปล/ฟีเจอร์ไหนก็ตาม (dnd5e ส่งข้อความ usage ลงแชต) ไอคอนของสิ่งนั้นจะ fade ขึ้นเหนือ token ผู้ใช้ ลอยขึ้นเล็กน้อยแล้วจางหาย (~1.8 วิ)
ทุกเครื่องเห็นเหมือนกัน (ฟังข้อความแชตเดียวกัน ไม่ใช้ socket) เป็นของตกแต่งล้วน ไม่มีผลกับกฎ
- ปิดบนเครื่องตัวเอง: `game.arkane.core.castIcon.enable(false)` (จำค่าไว้) เปิดคืน `enable(true)`
- ลองด้วยมือ: เลือก token แล้ว `game.arkane.core.castIcon.show(canvas.tokens.controlled[0], "icons/svg/aura.svg")`
- ไม่แสดงถ้า token ซ่อนอยู่จากผู้เล่นคนนั้น หรือใช้บนอีกซีน; ข้อความทอยโจมตี/ดาเมจของการใช้เดียวกันไม่ทำให้ไอคอนซ้ำ
- โค้ด: `src/foundry/castIcon.ts` (`iconFrame(t)` ปรับจังหวะ fade/ลอย, `DURATION_MS` ปรับความยาว) + `src/features/castIcon.ts`
- ต่อยอดเอฟเฟกต์ (ยังไม่ทำ): `core.castIcon.onCast(({ token, item, targets }) => ...)` ถูกเรียกทุกครั้งที่มีการร่าย พร้อมตัวร่าย ไอเทม และเป้าหมายที่ตั้งไว้ เป็นจุดเสียบลำแสงจากตัวร่ายไปเป้า (เช่น eldritch blast) ในอนาคต
- ยังไม่ได้ลองกับ Foundry v13 + dnd5e จริง: ชื่อฟิลด์ที่อ่าน (`flags.dnd5e.item`, `flags.dnd5e.messageType`, `getAssociatedItem`) มาจากความจำ ถ้าไอคอนไม่ขึ้นให้ส่ง error ใน Console กลับมา

## Spell catalog (`src/spells`, `src/data/spells`, feature `spells`)
ข้อมูลสกิลกลางที่เดียว: core → house/custom (`extends`) → ผู้ร่าย (`byCaster`) → ร่ายแบบไหน (`variants`) แต่ละชั้นเขียนเฉพาะส่วนต่าง · วิธีเพิ่มสกิล ฟิลด์ที่รองรับ กติกาเขียนทับ และไอคอน ดู **SPELLS.md**
- Foundry console: `game.arkane.core.spells` มี `get` `resolve` `explain` `icon` `list` `check`
- `castIcon` เลือกไอคอนจาก catalog (รูปของผู้ร่าย → default → รูปเดิมของไอเท็ม) ตัวละครรู้จากชื่อ actor ใน `src/data/casters.ts`
- ไฟล์ไอคอน → `npm run icons` → `src/data/spellIcons.generated.ts`
- ยังไม่ได้ลองกับ Foundry v13 + dnd5e จริง · `delivery`/`fx` ยังไม่ถูกใช้เล่นเอฟเฟกต์

