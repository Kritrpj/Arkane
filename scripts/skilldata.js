// Thai easy-reading text + example + image prompt for every class feature / species trait / feat.
// Icons: put <slug>.webp into modules/arkane-1920s/skills/ (slug = name lowercase, non-letters -> '-').
export const SKILLS = {
"Rage": {
"th": "คลั่ง",
"d": "ใช้ Bonus Action เข้าสู่ความคลั่ง 10 นาที ตีแรงขึ้น และเจ็บน้อยลงจากอาวุธ ใส่เกราะหนักหรือร่ายเวทไม่ได้",
"e": "เจอแก๊งมือปืน กดคลั่งแล้วฟาดขวานโดนเต็มๆ ดาเมจ +2 ถูกยิงก็เจ็บแค่ครึ่งเดียว",
"p": "a roaring soldier in torn WW1 uniform, red aura, clenched fists, fire in eyes"
},
"Unarmored Defense": {
"th": "ป้องกันตัวไม่ใส่เกราะ",
"d": "ถ้าไม่ใส่เกราะ ค่า AC = 10 + DEX + CON (บาร์บาเรียน) หรือ + WIS (มังค์) ไม่ต้องซื้อเกราะ",
"e": "ใส่แค่เสื้อกล้ามก็ AC สูงเท่าคนใส่เกราะหนัง",
"p": "a bare-chested fighter with a faint glowing shield outline around the body"
},
"Weapon Mastery": {
"th": "เชี่ยวชาญอาวุธ",
"d": "อาวุธที่เลือกไว้มีเทคนิคพิเศษ เช่น ผลักศัตรู ล้มศัตรู หรือโจมตีซ้ำ",
"e": "ถือขวาน Cleave ตีศัตรูคนแรกโดนแล้ว คนที่ยืนติดกันโดนอีกฝ่าย",
"p": "crossed rifle bayonet and hand axe over a leather scroll"
},
"Danger Sense": {
"th": "สัมผัสอันตราย",
"d": "ได้เปรียบ (ทอย 2 ลูกเอาสูง) เวลาเซฟ DEX เช่นหลบระเบิดหรือกับดัก",
"e": "ระเบิดมือกลิ้งมาที่เท้า ทอยหลบ 2 ครั้งเอาค่าสูง",
"p": "a man leaping aside from an explosion, exclamation spark above head"
},
"Reckless Attack": {
"th": "โจมตีไม่ห่วงตัว",
"d": "ได้เปรียบตอนตี แต่ศัตรูก็ได้เปรียบตอนตีคุณจนถึงเทิร์นหน้า",
"e": "พุ่งชนเต็มแรงตีโดนง่ายขึ้น แต่ปล่อยตัวโล่ง",
"p": "a berserker lunging forward with arms wide open, motion blur"
},
"Path of the Berserker": {
"th": "สายคลั่ง",
"d": "สายของบาร์บาเรียนที่ความคลั่งมาจากบาดแผลสงคราม",
"e": "ทหารผ่านศึกที่ยังได้ยินเสียงปืนใหญ่ในหัว",
"p": "a gas mask and trench helmet with glowing red eyes"
},
"Frenzy": {
"th": "คลั่งหนัก",
"d": "ระหว่างคลั่ง ถ้าใช้ Reckless Attack การตีโดนครั้งแรกของเทิร์นเพิ่ม 2d6",
"e": "คลั่ง + Reckless Attack ตีโดนทีเดียวเจ็บอีก 2d6",
"p": "two swords crossing in a blazing red burst"
},
"Primal Knowledge": {
"th": "ความรู้สัญชาตญาณ",
"d": "ได้ทักษะเพิ่ม 1 อย่าง และบางเช็คใช้ STR แทนได้ตอนคลั่ง",
"e": "คลั่งอยู่แล้วต้องข่มขู่ ใช้ STR ทอย Intimidation",
"p": "a wolf paw print glowing on a bleeding palm"
},
"Ability Score Improvement": {
"th": "เพิ่มค่าสถานะ",
"d": "เลเวลอัพแล้วเพิ่มค่าสถานะ +2 (หรือ +1 สองตัว)",
"e": "STR 16 → 18 ตีและเช็คแรงดีขึ้นทุกอย่าง",
"p": "an upward arrow made of brass gears over six glowing stat marks"
},
"Extra Attack": {
"th": "โจมตีเพิ่ม",
"d": "ตอนใช้ Attack action โจมตีได้ 2 ครั้ง แทนที่จะเป็น 1",
"e": "ยิงปืนสองนัดติดในเทิร์นเดียว",
"p": "a pistol firing twice, two muzzle flashes with ghost afterimage"
},
"Fast Movement": {
"th": "วิ่งเร็ว",
"d": "ถ้าไม่ใส่เกราะหนัก ความเร็วเดิน +10 ฟุต",
"e": "วิ่งไล่ตามคนร้ายทันก่อนมันขึ้นรถ",
"p": "running boots with motion lines and wings"
},
"Bardic Inspiration": {
"th": "ดลใจ",
"d": "Bonus Action ให้เพื่อนหนึ่งคนได้ลูกเต๋า d6 เอาไปบวกเช็ค โจมตี หรือเซฟ 1 ครั้งภายใน 1 ชม.",
"e": "เพื่อนทอยพลาดไปนิดเดียว บวก d6 ทันที ผ่านพอดี",
"p": "a vintage microphone and glowing musical notes rising"
},
"Expertise": {
"th": "ชำนาญเป็นพิเศษ",
"d": "ทักษะที่เลือกไว้บวกโปรฟิเชียนซีเป็น 2 เท่า",
"e": "เลือก Stealth บวกโบนัสเยอะเป็นพิเศษ แอบเงียบกริบ",
"p": "a magnifying glass with a gold star, two layered rings"
},
"Jack of All Trades": {
"th": "เก่งรอบด้าน",
"d": "เช็คที่ไม่มีทักษะ บวกครึ่งหนึ่งของโปรฟิเชียนซี",
"e": "ไม่เคยเรียนซ่อมเครื่องยนต์ แต่ก็ยังเดาถูกบ้าง",
"p": "a jester's hat with many tool icons around it"
},
"College of Lore": {
"th": "วิทยาลัยแห่งความรู้",
"d": "สายบาร์ดที่สะสมความลับและเรื่องต้องห้าม",
"e": "นักเล่าเรื่องที่รู้ตำนานลับของเมืองอาร์คเคน",
"p": "an old book with a quill, strange runes glowing on the pages"
},
"Bonus Proficiencies": {
"th": "ทักษะโบนัส",
"d": "ได้ทักษะเพิ่ม 3 อย่างทันที",
"e": "เลือก Investigation, Insight, Persuasion เพิ่มสบายๆ",
"p": "three small badges: magnifier, eye, speech bubble"
},
"Cutting Words": {
"th": "คำพูดบั่นทอน",
"d": "Reaction ใช้ลูกเต๋าดลใจลบค่าทอยของศัตรู ตอนมันโจมตีหรือเช็ค",
"e": "มือปืนทอยยิงจะโดนเพื่อน ใช้เสียงเยาะเยย ลบ d6 จนยิงพลาด",
"p": "a sharp tongue as a dagger with an angry speech bubble"
},
"Font of Inspiration": {
"th": "แหล่งดลใจไม่หมด",
"d": "ลูกเต๋าดลใจกลับคืนหลังพักสั้น (Short Rest) ด้วย",
"e": "ใช้ดลใจไปหมดแล้ว พักสั้นแล้วได้คืนครบ",
"p": "a glowing fountain pen pouring light into a cup"
},
"Divine Order: Protector": {
"th": "คำบัญชาแห่งการปกป้อง",
"d": "ใส่เกราะหนักและใช้อาวุธทหารได้",
"e": "นักบวชใส่เกราะเหล็กยืนหน้าเพื่อนได้",
"p": "a kite shield with a holy cross and a small mace"
},
"Channel Divinity": {
"th": "ช่องทางพลังศักดิ์สิทธิ์",
"d": "ใช้พลังจากเทพโดยไม่ต้องใช้ช่องเวท พักสั้นได้คืน",
"e": "ใช้ปราบอันเดดหรือเสริมตัวเองตามสาย",
"p": "a hand raised with a ring of holy light and a cross"
},
"Light Domain": {
"th": "สายแสงสว่าง",
"d": "สายนักบวชแห่งแสงที่เผาความมืดและเงาประหลาด",
"e": "ขับไล่สิ่งที่มากับความมืดของเมือง",
"p": "a lit oil lantern with sunbeams radiating"
},
"Warding Flare": {
"th": "แสงวาบป้องกัน",
"d": "Reaction ใช้เมื่อถูกโจมตี ทำให้ผู้โจมตีเสียเปรียบ",
"e": "มือปืนเล็งมา แสงวาบตาพร่า ยิงพลาด",
"p": "a blinding white flash from a raised palm"
},
"Radiance of the Dawn": {
"th": "รัศมีอรุณ",
"d": "Channel Divinity ปล่อยแสงตัดเวทมืด และสร้างดาเมจแสงรอบตัว",
"e": "แสงวาบสว่างจ้า ทำลายหมอกดำและเผาสัตว์ประหลาดรอบๆ",
"p": "a dawn sun bursting over the horizon, rays cutting black fog"
},
"Sear Undead": {
"th": "แผดเผาผี",
"d": "Channel Divinity ดาเมจแสงใส่อันเดดรอบตัว",
"e": "ผีหรือซอมบี้รอบตัวไหม้เกรียม",
"p": "a skull burning in white light"
},
"Druidic": {
"th": "ภาษาดรูอิด",
"d": "ภาษาลับของดรูอิด ฝากข้อความซ่อนไว้ในธรรมชาติได้",
"e": "เขียนสัญลักษณ์ในใบไม้บอกพวกเดียวกัน คนอื่นไม่เห็น",
"p": "a leaf with strange glowing glyphs"
},
"Primal Order: Warden": {
"th": "คำบัญชาผู้พิทักษ์",
"d": "ใส่เกราะกลางและใช้อาวุธทหารได้",
"e": "ดรูอิดใส่เกราะหนังหนาและถืออาวุธเข้าสนามได้",
"p": "a leather chest armor with leaf patterns"
},
"Wild Shape": {
"th": "แปลงร่างสัตว์",
"d": "เปลี่ยนเป็นสัตว์ได้ Bonus Action ใช้สอดแนม สู้ หรือหนี",
"e": "แปลงเป็นนกเล็กบินข้ามกำแพงดูข้างใน",
"p": "a human silhouette morphing into a wolf shape in green mist"
},
"Wild Companion": {
"th": "เพื่อนป่า",
"d": "ใช้ Wild Shape แลกเรียกพวกสัตว์วิญญาณมาช่วย",
"e": "เรียกสัตว์เล็กมาช่วยแกะรอยหรือเฝ้ายาม",
"p": "a spirit fox sitting next to a glowing rune"
},
"Circle of the Sea": {
"th": "วงน้ำทะเล",
"d": "สายดรูอิดแห่งทะเลและพายุ",
"e": "ทหารเรือที่ได้ยินเสียงเรียกจากทะเลลึก",
"p": "a wave curling into a crest with a tentacle shadow below"
},
"Wrath of the Sea": {
"th": "พิโรธทะเล",
"d": "สร้างหมอกและคลื่นรอบตัว ดาเมจเย็นใส่ศัตรูใกล้ๆ",
"e": "คลื่นกระแทกศัตรูและผลักออกไป",
"p": "a crashing wave around a person, foam and lightning"
},
"Wild Resurgence": {
"th": "พลังป่าคืนกลับ",
"d": "แลกช่องเวทกับ Wild Shape ไปมาได้ในจังหวะเหมาะ",
"e": "หมดแรงแปลงร่าง แลกช่องเวทเอาพลังกลับมาใช้ต่อ",
"p": "a circular arrow swapping a leaf and a star"
},
"Fighting Style: Archery": {
"th": "สไตล์นักธนู",
"d": "ได้บวก +2 ตอนโจมตีด้วยอาวุธระยะไกล",
"e": "ยิงปืนไรเฟิลหรือธนูแม่นขึ้นอย่างเห็นได้ชัด",
"p": "a crosshair over a hunting rifle with +2"
},
"Second Wind": {
"th": "ฮึดสู้",
"d": "Bonus Action ฟื้น HP (d10 + เลเวล) พักสั้นได้คืน",
"e": "ถูกยิงจนเลือดไหล กลั้นใจฮึดสู้ได้ฟื้น HP",
"p": "a man catching his breath with steam, glowing heart"
},
"Action Surge": {
"th": "พุ่งทำเพิ่ม",
"d": "ได้ Action เพิ่ม 1 ครั้งในเทิร์นนี้ พักสั้นได้คืน",
"e": "ตีสองรอบ (4 ครั้งถ้ามี Extra Attack) ในเทิร์นเดียว",
"p": "a lightning bolt through a hourglass, extra card glowing"
},
"Tactical Mind": {
"th": "ใจเยือกวางแผน",
"d": "เช็คทักษะที่พลาด เสียค่า Second Wind แล้วบวก d10 ได้",
"e": "ทอยข่มขู่พลาดนิดเดียว ใช้ Second Wind บวกจนผ่าน",
"p": "a chess knight piece with a thinking gear"
},
"Battle Master": {
"th": "ปรมาจารย์สนามรบ",
"d": "สายนักรบเทคนิคสูง ใช้ลูกเต๋า Superiority ทำท่าพิเศษ",
"e": "เหมือนนายทหารที่เรียนยุทธวิธีมา",
"p": "a general's officer cap with crossed swords and a map"
},
"Combat Superiority": {
"th": "ลูกเต๋ายุทธวิธี",
"d": "มีลูกเต๋า d8 ไว้ใช้กับท่า Maneuvers ได้คืนหลังพักสั้น",
"e": "ใช้ลูกเต๋าเพิ่มดาเมจหรือเอาไปบวกค่า AC",
"p": "a polished d8 die with sword emblem"
},
"Maneuvers": {
"th": "ท่าพิเศษ",
"d": "เลือกท่า เช่น ผลักศัตรู ล้มศัตรู ใช้ลูกเต๋ายุทธวิธีจ่าย",
"e": "ตีโดนแล้วผลักศัตรูตกบันไดหรือพุ่งออกนอกรถ",
"p": "three combat stance icons: push, trip, parry"
},
"Student of War": {
"th": "ศิษย์สงคราม",
"d": "ได้ทักษะเครื่องมือ 1 อย่าง และทักษะนักรบเพิ่ม",
"e": "ซ่อมปืนใหญ่หรือเขียนแผนที่ได้",
"p": "a field desk with map, compass and a rifle"
},
"Tactical Shift": {
"th": "เปลี่ยนตำแหน่งทันที",
"d": "ตอน Second Wind ขยับได้ครึ่งหนึ่งของความเร็วโดยไม่ถูกโจมตีซ้ำ",
"e": "ฮึดสู้แล้ววิ่งเข้าหลังที่กำบังทันที",
"p": "a runner dashing behind a barrel with a heal cross"
},
"Martial Arts": {
"th": "ศิลปะการต่อสู้",
"d": "ตีมือเปล่าแรงขึ้น ใช้ DEX ได้ และตีเพิ่มหนึ่งครั้งเป็น Bonus Action",
"e": "ซัดหมัดแล้วเตะตามติดเทิร์นเดียว",
"p": "a fist with a spark and a kick silhouette"
},
"Monk's Focus": {
"th": "สมาธิมังค์",
"d": "ใช้แต้ม Focus ทำท่าพิเศษ เช่น วิ่งเร็ว หลบ ตีรัว",
"e": "กดแต้มแล้วใช้ Patient Defense หลบทุกคม",
"p": "a yin-yang symbol with swirling air"
},
"Unarmored Movement": {
"th": "วิ่งไวไร้เกราะ",
"d": "ไม่ใส่เกราะ ความเร็ว +10 ฟุต",
"e": "วิ่งไวกว่าคนใส่เสื้อสูท",
"p": "bare feet leaving glowing footprints"
},
"Uncanny Metabolism": {
"th": "ระบบร่างกายพิเศษ",
"d": "ตอนทอยลำดับการต่อสู้ ฟื้น Focus และ HP ได้หนึ่งครั้ง",
"e": "เริ่มสู้ก็ได้แต้มกลับและอุดแผลทันที",
"p": "a heart with flowing energy lines"
},
"Deflect Attacks": {
"th": "ปัดกระสุน",
"d": "Reaction ลดดาเมจที่โดนอาวุธ และถ้าเหลือ 0 ตีสวนได้",
"e": "ปัดกระสุนด้วยมือ ลดดาเมจเกือบทั้งหมด",
"p": "a palm stopping a bullet with ripple"
},
"Warrior of Shadow": {
"th": "นักรบเงา",
"d": "สายมังค์ที่ใช้เงาเป็นอาวุธ",
"e": "หายตัวในซอยมืด โผล่หลังศัตรู",
"p": "a monk silhouette stepping through a shadow ripple"
},
"Shadow Arts": {
"th": "วิชาเงา",
"d": "ใช้แต้มร่าย Darkness หรือ Darkvision ได้ ง่ายๆ ในสนามรบ",
"e": "สร้างความมืดครอบหน้าตำรวจ แล้วเดินหนี",
"p": "a hand with black mist swirling and a crescent moon"
},
"Slow Fall": {
"th": "ตกช้าลง",
"d": "Reaction ลดดาเมจตกจากที่สูง",
"e": "กระโดดลงจากหลังคารถไฟ ไม่เจ็บ",
"p": "a falling figure with a feather trail"
},
"Stunning Strike": {
"th": "หมัดมึนงง",
"d": "ตีโดนแล้วเสียแต้ม Focus ให้ศัตรูเซฟ CON ไม่ผ่านโดนมึนงง",
"e": "ชกโดนมือปืนแล้วมันหยุดนิ่งไปหนึ่งเทิร์น",
"p": "a fist impact with stars circling"
},
"Lay on Hands": {
"th": "วางมือรักษา",
"d": "มี HP สำรองไว้รักษาเพื่อนเท่าไหร่ก็ได้จากกองกลาง พักยาวได้คืน",
"e": "เพื่อนล้มเลือดไหล แตะมือรักษาฟื้นขึ้นมา",
"p": "two glowing hands over a heart with a cross"
},
"Fighting Style: Defense": {
"th": "สไตล์ป้องกัน",
"d": "ใส่เกราะอยู่ AC +1",
"e": "ยืนหน้าเพื่อนแล้วโดนยิงยากขึ้นนิดหน่อย",
"p": "a shield with +1 and a stone border"
},
"Paladin's Smite": {
"th": "ฟาดศักดิ์สิทธิ์",
"d": "ตีโดนแล้วใช้ช่องเวทเพิ่มดาเมจแสง",
"e": "ตีโดนปีศาจแล้วใช้ช่องเวทเพิ่มดาเมจเต็มๆ",
"p": "a sword striking down with golden light burst"
},
"Oath of Vengeance": {
"th": "สาบานล้างแค้น",
"d": "สายพาลาดินที่ตามล่าศัตรูหนึ่งคนจนวาระสุดท้าย",
"e": "ตามล่าแก๊งผู้ปล่อยปีศาจในอาร์คเคน",
"p": "a knight's helm with red eyes and a broken chain"
},
"Vow of Enmity": {
"th": "คำสาบานศัตรู",
"d": "Channel Divinity ได้เปรียบทุกครั้งที่ตีศัตรูที่เลือก 1 นาที",
"e": "ล็อกเป้าหัวหน้ากลุ่ม ตีโดนง่ายทุกครั้ง",
"p": "a red target mark glowing on an enemy silhouette"
},
"Faithful Steed": {
"th": "พาหนะศรัทธา",
"d": "เรียกพาหนะศักดิ์สิทธิ์ 1 ครั้งต่อ Long Rest",
"e": "เรียกม้าขาวมาขี่ไล่ล่า",
"p": "a white horse with golden mane aura"
},
"Favored Enemy": {
"th": "ศัตรูที่ตามล่า",
"d": "ร่าย Hunter's Mark ได้โดยไม่ใช้ช่องเวท จำนวนจำกัดต่อวัน",
"e": "ปักหมายตัวผู้ร้าย ตีเจ็บขึ้นและตามกลิ่นได้ง่าย",
"p": "a red crosshair with a paw print"
},
"Deft Explorer": {
"th": "นักสำรวจชำนาญ",
"d": "ได้ทักษะ Expertise หนึ่งอย่าง และภาษาเพิ่ม 2 ภาษา",
"e": "เดินป่าไม่หลง อ่านป้ายแปลกๆ ได้",
"p": "a compass over a map with a feather"
},
"Gloom Stalker": {
"th": "นักล่าแห่งความมืด",
"d": "สายเรนเจอร์ที่ล่าในที่มืด",
"e": "ออกล่าในตรอกกลางคืน",
"p": "a hooded hunter with glowing eyes in a dark alley"
},
"Dread Ambusher": {
"th": "ซุ่มโจมตีสะพรึง",
"d": "เทิร์นแรกของการสู้ ขยับเพิ่มและตีเพิ่มดาเมจ",
"e": "เริ่มสู้พุ่งออกมาจากเงา ยิงเพิ่มอีก 1 ที",
"p": "a hunter leaping from shadow with a flash"
},
"Umbral Sight": {
"th": "ตาเงา",
"d": "เห็นในที่มืดไกลขึ้น และคนอื่นมองไม่เห็นคุณในความมืด",
"e": "เดินในคืนไร้ดาวไม่มีใครเห็นเรา",
"p": "a pair of glowing silver eyes in darkness"
},
"Sneak Attack": {
"th": "โจมตีลับ",
"d": "ตีโดนแล้วเพิ่มดาเมจพิเศษถ้าได้เปรียบหรือมีเพื่อนข้างศัตรู",
"e": "แทงตำรวจจากข้างหลังได้ดาเมจหนัก",
"p": "a dagger in shadow with a small glint"
},
"Thieves' Cant": {
"th": "ภาษาโจร",
"d": "ภาษาลับของนักล่วง ใช้สัญลักษณ์และคำพูดแฝง",
"e": "เห็นสัญลักษณ์ชอล์กบนกำแพงเข้าใจว่ามีกับดัก",
"p": "a chalk symbol on a brick wall"
},
"Cunning Action": {
"th": "เล่ห์เหลี่ยม",
"d": "Bonus Action สำหรับ Dash, Disengage หรือ Hide",
"e": "ยิงแล้ววิ่งหนีเข้าหลังกำแพงในเทิร์นเดียว",
"p": "a rogue silhouette vanishing with a swirl of smoke"
},
"Thief": {
"th": "โจรจอมขโมย",
"d": "สายโจรที่มือไว และปีนกำแพงเก่ง",
"e": "ปีนท่อเข้าหน้าต่างชั้นสองหยิบของไว",
"p": "a hand pulling a pocket watch with a chain"
},
"Fast Hands": {
"th": "มือไว",
"d": "Cunning Action ใช้ Use Object หรือ Sleight of Hand ได้",
"e": "เปิดตู้เซฟหรือล้วงกระเป๋าในพริบตา",
"p": "a blurred hand lifting a key"
},
"Second-Story Work": {
"th": "ปีนกำแพงเข้าบ้าน",
"d": "ปีนได้เร็ว และกระโดดไกลขึ้น",
"e": "ปีนขึ้นระเบียงสวยๆ ก่อนยามมาเห็น",
"p": "a rope and grapnel hanging from a window"
},
"Steady Aim": {
"th": "เล็งนิ่ง",
"d": "ถ้าไม่ได้ขยับ ตีได้เปรียบ (Bonus Action)",
"e": "นั่งเล็งปืนบนหลังคา ยิงแม่นขึ้น",
"p": "a rifle scope with a calm breathing icon"
},
"Cunning Strike": {
"th": "ตีเล่ห์",
"d": "แลกดาเมจลับ ไปทำให้ศัตรูโดนเอฟเฟกต์ เช่น ล้ม พิษ ถอย",
"e": "ตีลับ แล้วทำให้มันลื่นล้มกับพื้น",
"p": "a dagger with a branching decision arrow"
},
"Uncanny Dodge": {
"th": "หลบเหลือเชื่อ",
"d": "Reaction ลดดาเมจที่โดนครึ่งหนึ่ง",
"e": "ถูกยิงเข้าตัวแต่เบี่ยงทัน เจ็บครึ่งเดียว",
"p": "a figure twisting away from a bullet with afterimage"
},
"Innate Sorcery": {
"th": "เวทในสายเลือด",
"d": "Bonus Action เปิดโหมดเวท 1 นาที ทำให้ DC เวทเพิ่มและได้เปรียบเวทโจมตี",
"e": "ปลุกพลังในตัว ร่ายเวทเจ็บและหลบยากขึ้น",
"p": "a person with swirling blue aura rising from the chest"
},
"Font of Magic": {
"th": "บ่อพลังเวท",
"d": "มีแต้ม Sorcery Points แลกเป็นช่องเวท หรือใช้ทำ Metamagic",
"e": "เปลี่ยนแต้มเป็นช่องเวทเมื่อหมด",
"p": "a glowing blue fountain made of coins"
},
"Metamagic: Subtle Spell": {
"th": "เวทเงียบ",
"d": "ร่ายเวทไม่มีเสียงและท่าทาง ไม่มีใครรู้",
"e": "ร่ายเวทกลางงานสังสรรค์โดยไม่มีใครรู้",
"p": "a hand casting with a muted ring, a finger on lips"
},
"Metamagic: Quickened Spell": {
"th": "เวทเร็ว",
"d": "เปลี่ยนเวทที่ใช้ Action ให้เป็น Bonus Action",
"e": "ร่ายเวทและยิงปืนในเทิร์นเดียว",
"p": "a spell icon with a stopwatch and speed lines"
},
"Aberrant Sorcery": {
"th": "เวทผิดธรรมชาติ",
"d": "สายเวทที่ได้พลังจากสิ่งนอกโลก",
"e": "พลังที่รั่วออกมาตอนมองดวงดาวมากเกินไป",
"p": "a human head with tentacle shadows and violet eyes"
},
"Telepathic Speech": {
"th": "สื่อสารทางจิต",
"d": "พูดกับเป้าหมายในใจได้ภายในระยะ ไม่ต้องใช้เสียง",
"e": "กระซิบแผนโดยไม่มีใครได้ยินในห้อง",
"p": "two heads connected with a purple thread"
},
"Sorcerous Restoration": {
"th": "คืนพลังเวท",
"d": "พักสั้นแล้วได้แต้ม Sorcery กลับมาบางส่วน",
"e": "พักสั้นแล้วได้แต้มกลับมาบ้าง",
"p": "a glowing crystal refilling with blue light"
},
"Eldritch Invocation: Armor of Shadows": {
"th": "ชุดเกราะเงา",
"d": "ร่าย Mage Armor ใส่ตัวเองได้ไม่ต้องใช้ช่องเวท",
"e": "เงารอบตัวเป็นเกราะบางๆ AC สูงขึ้น",
"p": "a silhouette wrapped in black armor shadow"
},
"Pact Magic": {
"th": "เวทสัญญา",
"d": "ช่องเวทมีน้อยแต่แรง และได้คืนหลังพักสั้น",
"e": "ร่ายเวทหนักแล้วพักสั้นก็ได้ช่องคืน",
"p": "a black pact book with a glowing seal"
},
"Magical Cunning": {
"th": "เล่ห์เวท",
"d": "พิธีกรรม 1 นาที ได้ช่องเวทคืนครึ่งหนึ่ง",
"e": "ทำพิธีสั้นๆ ได้ช่องเวทกลับมา",
"p": "a candle circle with a glowing eye"
},
"Eldritch Invocation: Agonizing Blast": {
"th": "ระเบิดทรมาน",
"d": "Eldritch Blast บวก CHA เพิ่มทุกลำแสง",
"e": "ยิงลำแสงเจ็บขึ้นชัดเจน",
"p": "a purple energy blast with jagged lightning"
},
"Eldritch Invocation: Devil's Sight": {
"th": "ตาปีศาจ",
"d": "เห็นในที่มืดและความมืดเวทได้ 120 ฟุต",
"e": "เห็นคนซ่อนอยู่ในความมืดชัดเจน",
"p": "a red eye glowing in black fog"
},
"Great Old One Patron": {
"th": "เทพโบราณ",
"d": "เจ้าสัญญาเป็นสิ่งนอกมิติจากเมืองใต้ทะเล",
"e": "ได้เสียงกระซิบจากสิ่งนอกมิติ",
"p": "a giant eye behind a curtain of tentacles"
},
"Awakened Mind": {
"th": "จิตตื่น",
"d": "สื่อสารทางจิตกับคนที่เห็นภายใน 30 ฟุต",
"e": "คุยกับเพื่อนอีกฝั่งถนนไม่ต้องตะโกน",
"p": "a glowing brain with waves flowing to another head"
},
"Psychic Spells": {
"th": "เวทจิต",
"d": "ร่ายเวทโดยไม่ต้องใช้เสียงหรือท่า และดาเมจเปลี่ยนเป็นพลังจิตได้",
"e": "ร่ายเวทต่อหน้าตำรวจโดยไม่ถูกจับได้",
"p": "a purple spiral over a silhouette head"
},
"Eldritch Invocation: Repelling Blast": {
"th": "ระเบิดผลัก",
"d": "Eldritch Blast ที่โดนผลักศัตรู 10 ฟุต",
"e": "ยิงผลักมือปืนตกจากรถวิ่ง",
"p": "a blast pushing a figure back with shockwave"
},
"Ritual Adept": {
"th": "นักพิธี",
"d": "ร่ายเวทพิธีกรรมจากหนังสือได้โดยไม่ต้องเตรียมไว้",
"e": "ร่ายเวทตรวจกับดักโดยไม่เสียช่องเวท",
"p": "an open spellbook with a ritual circle"
},
"Arcane Recovery": {
"th": "ฟื้นพลังเวท",
"d": "พักสั้นแล้วได้ช่องเวทกลับมาบางส่วน",
"e": "พักสั้นแล้วได้ช่องเวทกลับมา",
"p": "a book with a glowing arrow circling back into it"
},
"Scholar": {
"th": "นักวิชาการ",
"d": "ได้ Expertise ทักษะวิชา เช่น Arcana หรือ History",
"e": "เดาหาความหมายสัญลักษณ์โบราณได้แม่นขึ้น",
"p": "a scholar's reading glasses over a scroll"
},
"Diviner": {
"th": "นักทำนาย",
"d": "สายพ่อมดแห่งการเห็นอนาคต",
"e": "เห็นภาพแว่บๆ ของสิ่งที่จะเกิด",
"p": "a crystal ball with a flickering vision"
},
"Portent": {
"th": "ลางบอกเหตุ",
"d": "ทอย d20 ไว้ 2 ลูกตอนเช้า ใช้แทนค่าทอยของใครก็ได้ในวันนั้น",
"e": "เช้าทอยได้ 20 ไว้ แล้วเอาไปแทนผลทอยพลาดของเพื่อน",
"p": "two glowing d20 dice floating above a crystal ball"
},
"Divination Savant": {
"th": "ผู้เชี่ยวชาญการทำนาย",
"d": "คัดลอกเวททำนายลงหนังสือได้ถูกและเร็ว",
"e": "คัดลอกเวทเร็วกว่าคนอื่น",
"p": "a book with a copying eye symbol"
},
"Memorize Spell": {
"th": "จดจำเวท",
"d": "สลับเวทที่เตรียมไว้หลังพักสั้น",
"e": "เปลี่ยนเวทที่เตรียมโดยไม่ต้องรอพักยาว",
"p": "a page flipping with a lightbulb"
},
"Tinkerer's Magic": {
"th": "เวทช่างประดิษฐ์",
"d": "ร่าย Mending, Prestidigitation และ Mage Hand ได้เพิ่ม",
"e": "ซ่อมของเล็กๆ หรือมีมือผีหยิบเครื่องมือ",
"p": "a gear with a magic wand and sparks"
},
"Magical Tinkering": {
"th": "ประดิษฐ์เวท",
"d": "ใส่เวทเล็กๆ ลงของ เช่น เรืองแสง เสียงเตือน",
"e": "ติดเสียงกระซิบไว้ในกุญแจ",
"p": "a pocket watch with faint glowing runes"
},
"Replicate Magic Item": {
"th": "ทำสำเนาของเวท",
"d": "เลือกแผนสร้างไอเท็มเวทจากแผนที่รู้",
"e": "ทำแสงนำทางหรือถุงเก็บของเวท",
"p": "a blueprint of an enchanted item with gears"
},
"Artillerist": {
"th": "พลปืนใหญ่",
"d": "สายช่างที่ใช้ปืนเวทและแท่นปืนใหญ่",
"e": "ติดตั้งแท่นปืนเวทกลางสนาม",
"p": "a small brass cannon with magical glyphs"
},
"Eldritch Cannon": {
"th": "ปืนเวทตั้งพื้น",
"d": "สร้างปืนเวทเล็กๆ ตั้งโจมตีหรือป้องกันได้ ใช้ได้ 1 ครั้งต่อ Long Rest",
"e": "วางปืนไฟไว้หลังกำแพง ยิงไฟใส่ศัตรู",
"p": "a tiny steampunk turret emitting blue fire"
},
"Arcane Firearm": {
"th": "ปืนเวทเสริมพลัง",
"d": "ปืนที่คุณสลักเวทไว้ เพิ่มดาเมจเวทเมื่อร่ายผ่านปืน",
"e": "ยิงเวทไฟผ่านปืนพกให้เจ็บขึ้น",
"p": "a revolver engraved with glowing runes"
},
"Lucky": {
"th": "โชคดี",
"d": "มีแต้มโชค (เท่าโปรฟิเชียนซี) ทอยเช็ค โจมตี หรือเซฟพลาดแล้วใช้แต้มทอยใหม่ได้ คืนหลัง Long Rest",
"e": "ทอยหลบกระสุนได้ 3 ลูกเต๋าไม่ผ่าน ใช้แต้มโชคทอยใหม่",
"p": "a golden four-leaf clover coin"
},
"Crafter": {
"th": "ช่างฝีมือ",
"d": "ได้เครื่องมือช่าง และส่วนลดซื้อของ 20% เวลาซื้ออุปกรณ์",
"e": "ซื้อชุดเครื่องมือถูกลงและทำของพื้นฐานได้",
"p": "a leather toolbelt with pliers and a wrench"
},
"Darkvision": {
"th": "มองในที่มืด",
"d": "เห็นในที่มืดได้ 60 ฟุต",
"e": "เดินในตรอกมืดได้แม้ไม่มีไฟ",
"p": "a pair of eyes glowing in dark with a ring"
},
"Darkvision (Drow)": {
"th": "มองในที่มืด (ดรอว์)",
"d": "เห็นในที่มืดได้ไกลถึง 120 ฟุต",
"e": "เห็นศัตรูแอบในความมืดล่วงหน้าก่อนใคร",
"p": "a drow eye glowing violet in blackness"
},
"Drow Magic": {
"th": "เวทดรอว์",
"d": "ร่าย Dancing Lights และเวทอื่นๆ ตามเลเวล",
"e": "ปล่อยแสงลอยเป็นตัวล่อ",
"p": "a floating dancing violet light"
},
"Eerie Token (Hexblood)": {
"th": "เครื่องรางหลอน",
"d": "Bonus Action ถอดเล็บหรือผมทำเป็นเครื่องราง ส่งข้อความหรือมองผ่านมัน",
"e": "ซ่อนเครื่องรางไว้ในโรงแรม แล้วมองผ่านตามันดูข้างใน",
"p": "a lock of hair tied with thread with a glowing eye"
},
"Fey Ancestry": {
"th": "สายเลือดนางฟ้า",
"d": "ได้เปรียบเซฟกันโดนสะกดจิต และหลับไม่ได้ด้วยเวท",
"e": "โดนมนตร์สะกดจิตก็ต้านได้ดีกว่า",
"p": "a pointed ear with a sparkle and a shield"
},
"Hare-Trigger (Harengon)": {
"th": "ไวเหมือนกระต่าย",
"d": "บวกโปรฟิเชียนซีให้ค่าอินิเชียทีฟ",
"e": "ทอยลำดับก่อนใครในการต่อสู้",
"p": "a rabbit with a pocket watch bolting"
},
"Hex Magic (Hexblood)": {
"th": "เวทแม่มด",
"d": "ร่าย Hex และ Disguise Self ได้ 1 ครั้งต่อ Long Rest ไม่ใช้ช่องเวท",
"e": "เสกใบหน้าปลอมเข้าไปในสถานีตำรวจ",
"p": "a witch hat, a purple hex sigil, and a face mask"
},
"Leporine Senses (Harengon)": {
"th": "ประสาทไว",
"d": "ได้เปรียบเช็ค Perception",
"e": "ได้ยินเสียงกระซิบจากอีกฟากถนน",
"p": "long rabbit ears with sound waves"
},
"Lucky Footwork (Harengon)": {
"th": "เท้าโชคดี",
"d": "ทอยพลาดเซฟ DEX ใช้ Reaction ทอยใหม่ บวก d4",
"e": "ลื่นนิดหนึ่งแต่ทอยใหม่รอดได้",
"p": "a four-leaf clover on a boot"
},
"Magic Initiate (Druid)": {
"th": "ผู้เริ่มต้นเวท (ดรูอิด)",
"d": "ได้ Cantrip 2 อย่าง และเวทเลเวล 1 อย่าง ร่ายฟรี 1 ครั้ง/Long Rest",
"e": "ร่าย Guidance เพิ่มเพื่อนเช็คในทุกเช้า",
"p": "a small apprentice book with a leaf glow"
},
"Resourceful (Human)": {
"th": "เฉลียวฉลาด (มนุษย์)",
"d": "ได้ Heroic Inspiration ทุกครั้งหลัง Long Rest",
"e": "ทอยพลาดแล้วใช้ Inspiration ทอยใหม่ได้",
"p": "a human hand holding a glowing star"
},
"Skillful (Human)": {
"th": "ชำนาญหลายอย่าง (มนุษย์)",
"d": "ได้ทักษะเพิ่ม 1 อย่าง",
"e": "เลือก Investigation เพิ่มสบายๆ",
"p": "a handy multitool with a star"
},
"Tavern Brawler": {
"th": "นักเลงโรงเตี๊ยม",
"d": "หมัดมือเปล่าแรงขึ้น และทอยดาเมจ 1 ครั้งทอยใหม่ได้ ผลักศัตรูได้",
"e": "ต่อยกลางผับ ผลักศัตรูตกโต๊ะ",
"p": "a fist with a beer mug and a broken chair"
},
"Tough": {
"th": "ทนทาน",
"d": "HP สูงสุดเพิ่ม 2 ต่อเลเวล",
"e": "โดนยิงพรุนแต่ยังยืนอยู่ได้",
"p": "a thick leather vest with bullet dents"
},
"Trance & Keen Senses": {
"th": "สมาธิและประสาทไว",
"d": "พักผ่อนด้วยสมาธิ 4 ชม. แทนการนอนหลับ และได้ทักษะเพิ่ม",
"e": "ยืนยามตลอดคืนโดยไม่ง่วง",
"p": "a meditating elf with open glowing eyes"
},
"Versatile (Human)": {
"th": "หลากหลาย (มนุษย์)",
"d": "ได้ Origin Feat เพิ่ม 1 อย่าง",
"e": "ได้ความสามารถเสริมเพิ่มตั้งแต่เริ่ม",
"p": "a human silhouette with three glowing icons"
},
"Versatile: Origin Feat เพิ่ม": {
"th": "Origin Feat เพิ่ม",
"d": "ได้ Origin Feat เพิ่ม 1 อย่าง",
"e": "ได้ความสามารถเสริมเพิ่มตั้งแต่เริ่ม",
"p": "a human silhouette with three glowing icons"
}
};
export const slugOf = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
