# Spell catalog (`src/spells`, ข้อมูลใน `src/data/spells`)

ที่เดียวที่บอกว่า "สกิลนี้คืออะไร ทำงานยังไง หน้าตายังไง" ทั้งกฎกลาง, house rule, และของเฉพาะตัวละคร ระบบหลังบ้าน (ไอคอน, เอฟเฟกต์ ต่อไป: กติกา) อ่านจากที่นี่ที่เดียว
ยังไม่ได้ลองกับ Foundry v13 + dnd5e จริง ส่วนที่แตะ Foundry มีจุดเดียว คือ `castIcon` เลือกไอคอนจาก catalog (ไม่เจอ = ใช้รูปเดิมของไอเท็ม)

## ชั้นของข้อมูล (ล่าง → บน แต่ละชั้นเขียนเฉพาะที่ต่าง)
1. **core**: สกิลกฎกลาง (`data/spells/core.ts`) เหมือนกันทุกคน
2. **house / custom**: สกิลที่ต่อจากอีกสกิลด้วย `extends` (`data/spells/house.ts`) `house` = กฎบ้านที่ปรับสกิลกลาง, `custom` = สกิลที่โต๊ะเราสร้าง
3. **ค่าตั้งต้นของผู้ร่าย**: `CASTERS[x].defaults` (`data/casters.ts`) วิธีร่ายของตัวละครนี้ทุกสกิล
4. **`byCaster[x]`**: สกิลนี้เมื่อตัวละคร x ร่าย (ดาเมจ ความกว้าง เอฟเฟกต์ ไอคอน ฯลฯ ต่างจากคนอื่น)
5. **`variants[v]`**: ร่ายด้วยอะไร/แบบไหน ณ ตอนนั้น (`wand`, `palm`, `pact`, `innate` ...) ใครกำหนดคีย์ `v` ดูหัวข้อ "ร่ายด้วยอะไร"

ผลรวมดูได้ด้วย `game.arkane.core.spells.explain("fire-bolt", "vivian", "palm")` พิมพ์ว่าแต่ละค่ามาจากชั้นไหน

## เพิ่มสกิลใหม่ ตอบ 6 ข้อ
1. **ชื่ออะไร id อะไร**: `name` ตรงกับชื่อไอเท็มใน Foundry, `id` = ชื่อพิมพ์เล็กคั่น `-` (`"hunters-mark"`) ชื่อเรียกอื่นใส่ `aliases`
2. **เป็นสกิลกลางไหม**: ใช่ → `core.ts` · ปรับจากสกิลกลาง → `house.ts` + `extends` · สร้างเอง → `house.ts` category `custom`
3. **ร่ายยังไง**: `level` (0 = cantrip) · `activation` · `range` (ฟุต / `"self"` / `"touch"`) · `duration` · `concentration` · `components` · `cost`
4. **ผลลงที่ไหน**: `delivery` = `self` (ตัวเอง) · `target` (เป้ารายตัว) · `area` (วงที่จุด) · `ray` (กรวย/เส้นจากตัวร่าย) ถ้า area/ray ต้องมี `effect.area`
5. **ทำอะไร**: `effect` = `roll` (attack/save/auto) · `damage` · `heal` · `count`/`countByLevel` (ลำแสง ลูกดอก) · `conditions` · `scaling` · `text` (กฎที่เขียนเป็นคำ)
6. **หน้าตา**: `fx.style` + `fx.refs` (เรียงตามความชอบ ตัวแรกที่มีของจริงชนะ: `{ seq }` ชื่อใน Sequencer เช่น JB2A/BLFX → `{ file }` ไฟล์ของเรา → `{ line }` เส้นสี ควรมีไว้เป็นตัวสำรอง) ไอคอนวางไฟล์ แล้วรัน `npm run icons`

เขียนเสร็จ รัน `game.arkane.core.spells.check()` จะบอกเป็นภาษาคนว่าขาดอะไร ผิดตรงไหน (ขาด level, extends ไม่เจอ, byCaster ชื่อผิด, ชื่อซ้ำ ...) และรายชื่อสกิลที่มีไอคอนแล้วแต่ยังไม่ได้ใส่ catalog

## ฟิลด์ที่รองรับ
| ฟิลด์ | ความหมาย |
|---|---|
| `name` `nameTh` `summaryTh` | ชื่อ ชื่อไทย คำอธิบายสั้น |
| `level` `school` `tags` | เลเวล (0=cantrip) · โรงเรียน (`abj con div enc evo ill nec trs`) · แท็กอิสระ (`fire`, `hadar`, `fey` ...) |
| `activation` | `action bonus reaction minute hour free` |
| `range` | ฟุต หรือ `"self"` `"touch"` |
| `duration` `concentration` | `{ unit: instant/turn/round/minute/hour/day/rest, n }` |
| `cost` | `{kind:"slot",pool:"spell"/"pact",level?}` · `{kind:"free",uses,per:"short"/"long"/"day"}` · `{kind:"resource",id,amount}` (ของแคมเปญ เช่น hunger) · ว่าง = ฟรี |
| `components` | `{ v, s, m, mConsumed, mCostGp }` |
| `casting` | `{ medium: hands/wand/focus/voice/item/none, style: instant/beam, gesture, incantation }` |
| `requires` | `{ seeTarget, freeHand, notConditions: [...], text: [...] }` |
| `delivery` `targets` | ผลลงที่ไหน · `{ max, allow: any/enemy/ally/self }` |
| `effect` | ดูข้อ 5 |
| `fx` `icons` | `{ style: projectile/on-target/on-caster/at-point, refs, scale }` · `{ default, byCaster }` |
| `flags` | ถุงอิสระสำหรับของเฉพาะแคมเปญ (เช่น `{ hunger: 0.5 }`) เขียนไว้ได้เลย หลังบ้านค่อยมาอ่านทีหลังโดยไม่ต้องแก้โครง |
| `verify` | ข้อความเตือนว่า "ต้องตรวจกับหนังสือ" |

## กติกาการเขียนทับ (ใน `byCaster` / `variants` / สกิลที่ `extends`)
- เขียนเฉพาะที่เปลี่ยน อ็อบเจกต์รวมทีละคีย์ (`effect: { area: {...} }` ไม่ลบ `effect.damage`)
- อาร์เรย์ **แทนที่ทั้งก้อน** ถ้าจะเพิ่ม: `damage: { $append: [...] }` หรือ `{ $prepend: [...] }`
- ลบค่าที่สืบมา: `null` (เช่น `concentration: null`) · แทนอ็อบเจกต์ทั้งก้อน: `{ $set: {...} }`

## ตัวอย่าง
```ts
// 1) ตัวละครร่าย Fire Bolt ต่างจากคนอื่น (อยู่ในสกิลเดียว)
spell({ id: "fire-bolt", category: "core", /* ...ของเดิม... */
  byCaster: { vivian: { effect: { damage: { $append: [{ dice: "1d4", type: "radiant" }] } }, fx: { refs: [{ seq: "..." }, { line: "#ffd27a" }] } } } })

// 2) กฎบ้านปรับสกิลกลาง (house.ts) เขียนแค่ส่วนต่าง
spell({ id: "fire-bolt-wide", category: "house", extends: "fire-bolt", name: "Fire Bolt (กว้าง)",
  delivery: "area", effect: { area: { shape: "sphere", ft: 5 } } })

// 3) ร่ายด้วยอะไร: ปกติใช้ไม้ แต่ตอนเลนส์แตกใช้ฝ่ามือ
spell({ id: "eldritch-blast", /* ... */ casting: { medium: "wand", style: "beam" },
  variants: { palm: { casting: { medium: "hands", style: "instant" } } } })

// 4) ทุกสกิลของตัวละครคนนี้ร่ายด้วยไม้ (data/casters.ts)
perry: { match: "^perry", defaults: { casting: { medium: "wand" } } }
```

## ร่ายด้วยอะไร (`variants` / `via`)
`via` = ชุดคำที่บอกสถานะตอนร่าย ตอนนี้ `castIcon` ส่งให้ 2 อย่าง: `item.system.method` ของ dnd5e (`spell` / `pact` / `innate` ...) และ flag `arkane-1920s.via` บนไอเท็ม (ที่ DM ตั้งเองได้) เรียกจากโค้ดเอง: `spells.resolve(id, { caster, via: ["palm"] })`
คีย์ใน `variants` ตั้งชื่อเองได้ตามเรื่องราว (ชื่อ dnd5e method ใช้ได้เลย) ยังไม่มีอะไรตั้ง `via` ให้อัตโนมัติจากสถานะเกมในนี้ เช่น เลนส์แตก

## ไอคอน
- โฟลเดอร์รองรับ 2 แบบ ปนกันได้:
  - ตามสกิล (แนะนำ): `spells/<สกิล>/_default.webp` และ `spells/<สกิล>/<ตัวละคร>.webp`
  - ตามตัวละคร (แบบเดิมของเพื่อน): `spells/<ตัวละคร>/<ตัวละคร>-<สกิล>.webp`
- วางไฟล์แล้วรัน `npm run icons` (เริ่มที่โฟลเดอร์ `spells` ข้างโปรเจกต์ หรือ `npm run icons -- <โฟลเดอร์> [url prefix]`) ได้ `src/data/spellIcons.generated.ts` แล้วคอมมิต ตอนเล่นไม่มีใครต้องเปิด File Browser
- ลำดับเลือก: รูปของผู้ร่าย → รูป default ของสกิล → รูปเดิมของไอเท็ม ถ้าสกิลยังไม่อยู่ใน catalog แค่มีไฟล์ไอคอนตามชื่อก็ใช้ได้
- ไฟล์เริ่มต้นสร้างจากรายชื่อไฟล์ใน screenshot ของโฟลเดอร์ `spells/` (Mozxorion, Vivian, Windows) รัน `npm run icons` ซ้ำเพื่ออัปเดตให้ครบจริง (รวมของ Nincolas ถ้ามี)

## เอฟเฟกต์ตอนร่าย (`castFx`)
- เกาะ `castIcon.onCast`: ไอคอนขึ้นก่อน แล้วอีก ~0.6 วิ เอฟเฟกต์เล่น (ทุกเครื่องเล่นเอง ไม่ใช้ socket)
- แต่ละ stage เลือก `refs` ตัวแรกที่ **มีจริง** ตามลำดับที่เขียน (วาง `{ file }` ไว้หน้า `{ seq }` = ของเราก่อน JB2A) `seq` เช็คใน Sequencer DB, `file` เช็คว่าไฟล์อยู่, `line` ได้เสมอ ไม่มี Sequencer/JB2A ก็ได้เส้นสี สกิลที่ไม่มี `refs` เลยได้เส้นสีอ่อน, สกิลที่ไม่อยู่ใน catalog ไม่เล่นอะไร
- หลายจังหวะ: `fx: { stages: [{ style: "projectile" }, { style: "on-target", when: "hit", refs: [{ seq: "jb2a.explosion.01.orange" }] }], refs: [...] }` stage ที่ไม่ใส่ `refs` ใช้ `fx.refs` ของสกิล · `when: "hit"` = เล่นหลัง stage ก่อนหน้าจบ (v1 ยังไม่ดูผลทอยโจมตี)
- self + debuff เป้า / ยิงเป้าแล้วบัฟตัวเอง = `delivery` ตามจุดหลัก + stage เพิ่ม `on-caster` หรือ `on-target`
- `at-point` v1 = กลางของเป้าที่เล็งไว้ ไม่มีเป้า = ที่ตัวร่าย (ยังไม่อ่านตำแหน่ง template)
- ลองใน console: `game.arkane.core.castFx.plan("Fire Bolt","vivian")` / `.play("Fire Bolt")` / `.db("jb2a.fire_bolt")`
- harness (`dev/castDemo.ts`): ใช้ catalog + `planFx` ตัวเดียวกับ Foundry `seq` ของ JB2A ถือว่า "มี" เมื่อมีไฟล์ใน `dev/fx` ที่ path มีคำจากชื่อ (`jb2a.fire_bolt.orange` ↔ ไฟล์ที่มี firebolt และ orange) ไม่มีไฟล์ก็ตกไป ref ถัดไป/เส้นสีเหมือน Foundry ที่ไม่มี JB2A · ปุ่มร่ายเล่นหลาย stage ได้ (`when: "hit"` ต่อท้าย) · `src/spells/fxPreview.ts` วาดเส้น/วงสำรองบน canvas
## ชื่อ JB2A ของทุกสกิล (`src/data/spells/jb2aNames.ts`)
- ตารางเดียว: id สกิล -> ชื่อ Sequencer ที่จะลอง (เรียงตามลำดับ ตัวที่ไม่มีจริงข้ามเอง) + สีเส้นสำรอง ครบทุกสกิลของตัวละครในสคริปต์ (41 ตัว) แก้ชื่อที่นี่ที่เดียว ไม่ต้องไปแก้ทีละสกิล
- ชื่อเขียนจากความจำ ที่มี `// เดา` คือยังไม่มั่นใจ ตรวจด้วย `castFx.audit()` / `castFx.db("jb2a.xxx")` / Database Viewer ใน Foundry แล้วแก้ตามจริง
- ลำดับตอนเล่น: refs ของสกิลเอง (custom ก่อน) -> ชื่อใน jb2aNames -> ไฟล์ที่สแกน -> เส้นสำรอง
## JB2A อัตโนมัติ (`npm run fx`, ไม่บังคับ: ใช้เสริมเมื่อชื่อใน jb2aNames ไม่ตรง)
- โหลด JB2A ฟรีมาไว้ในเครื่อง (ต้องมีโครง `Library/<Level>/<Spell>/` ตามเดิม) แล้วรัน `npm run fx -- <โฟลเดอร์ที่มี Library อยู่ข้างใน>` ได้ `src/data/spellFx.generated.ts`
- มันจับคู่ **ชื่อโฟลเดอร์** (`Fire_Bolt`) กับชื่อสกิลของเรา (ใน `src/data/spells/*.ts` + `scripts/spells.js`) ไม่เดาชื่อ Sequencer: เก็บ path ไฟล์จริงที่คุณมี (`modules/JB2A_DnD5e/Library/...`) และบอกรายชื่อสกิลที่ไม่เจอ
- ตอนเล่น: refs ของสกิลเอง (custom/seq) ก่อน → ไฟล์ที่สแกนได้ → เส้นสำรอง เลือกกลุ่มไฟล์ตามสี (`fx.color`, ใส่ใน `byCaster` ให้ตัวละครสีต่างกันได้) และตามชนิด (bolt ใช้ไฟล์ที่มีระยะ ...ft) ใช้ไฟล์ระยะที่สั้นที่สุดที่ยังถึงเป้า
- ดูว่าสกิลไหนได้ JB2A แล้ว: `game.arkane.core.castFx.audit()` (ใน harness เลือกสกิลจากกลุ่ม "สกิลใน catalog")
- ต้องมี module JB2A_DnD5e ใน Foundry ของเครื่องที่เปิดเกมด้วย (path ใน Patreon เป็น `jb2a_patreon` ต้องสแกนใหม่ด้วย `--prefix modules/jb2a_patreon/`)
## ยังไม่ได้ทำ
- เดา `delivery` จาก activity ของ dnd5e (ตอนนี้ต้องเขียนเอง)
- ย้ายข้อมูลสกิลใน `scripts/spells.js` กับ `Perry - Skillbook` เข้า catalog (`ไอคอนที่มีแต่ยังไม่อยู่ใน catalog` ใน `spells.check()` คือรายการที่ต้องเพิ่ม)
- ให้ DM สร้างสกิลผ่านหน้าจอ (ตอนนี้แก้ไฟล์ข้อมูล)
