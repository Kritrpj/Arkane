// Chapter 1 DM tracker: where are we in the night, what did the players do, and what that unlocks later.
const MOD = "arkane-1920s";
const KEY = "ch1Tracker";

// ---------- content: phases, read-aloud text, checks, consequences
// check: [id, label]   choice: [id, label, [[value, text]...]]
const PHASES = [
  { id: "prep", time: "ก่อนเริ่ม", title: "เตรียมเล่น",
    read: "",
    tips: ["เปิดฉาก \"บาร์ The Rusty Wand ชั้นใต้ดิน\" ไว้ให้ GM ดู แต่ Activate ฉากแมพใหญ่ (ตรอกหลังร้านตัดสูท) ให้ผู้เล่น",
      "กดมาโคร \"เริ่ม Chapter 1\" ผู้เล่นได้ข้อความส่วนตัวเอง (Vivian: จดหมาย A.P. · Mozxorion: รหัสจากลูกเรือ · Nincolas: ข่าวลือแต่ไม่รู้รหัส · Windowส์: ถามว่ามาทำไม)",
      "รอให้ <b>Windowส์ ตอบ</b> ว่าคืนนี้มาทำอะไร (เก็บค่าคุ้มครอง / สืบคดี / ได้ข่าวของมีค่า) ก่อนเปิดฉาก",
      "Pause เกม (Space) ไว้ แล้วให้ผู้เล่นเข้าฉากทีละคน ตามลำดับในหน้าถัดไป"],
    checks: [["passSent", "ผู้เล่นทุกคนรู้รหัสผ่าน (หรือรู้ว่าต้องเดาเอา)"], ["npcsReady", "NPC ในบาร์อยู่ตำแหน่งครบ"]] },
  { id: "door", time: "คืนที่ 1 · 20:30", title: "ประตูหลังร้านตัดสูท",
    read: "ฝนเพิ่งหยุด ตรอกหลังย่านโรงงานยังเปียกแฉะ ไฟนีออนของร้านตัดสูทที่ปิดแล้วกะพริบอยู่เหนือประตูไม้บานเล็ก ช่องตาแมวเลื่อนเปิด ดวงตาสีเหลืองคู่หนึ่งมองลงมา \"วัดตัวสูทสีอะไรครับ\"",
    tips: ["<b>ลำดับเข้าร้าน (คนละ 1–2 นาที):</b>",
      "<b>① Mozxorion</b> ขาประจำ ตอบรหัสถูก เข้าง่าย · ให้ทุกคนเห็นว่าต้องทำยังไง",
      "<b>② Windowส์</b> ไม่ต้องใช้รหัส บรูโน่เห็นตาผ่านช่องเลื่อน หยุดครู่หนึ่ง: <i>\"คุณตำรวจ... คืนนี้มาดื่ม หรือมาทำงาน?\"</i> · คำตอบบอกว่าเขามาทำอะไร",
      "<b>③ Nincolas</b> ไม่รู้รหัส ให้ลุ้น: แอบฟังคนก่อนหน้า (Perception DC 12) · ล้วงโน้ตจากคนรอคิว (Sleight of Hand DC 13) · ติดสินบน $2: <i>\"สูทสีไหนก็ได้ ขอแค่อย่าเปื้อนเลือดในร้าน\"</i>",
      "<b>④ Vivian</b> มาตามนัดในจดหมาย ตอบรหัสถูก · เข้าไปแล้วต้องหานายจ้างที่ไม่รู้จักหน้า (อาเธอร์นั่งชิดผนังตะวันออก มองประตูตลอด)",
      "บรูโน่ถาม: <i>\"มาวัดตัวสูทสีไหน\"</i> · ถูก: (ก๊อก ก๊อก) <i>\"เชิญ บันไดลื่น ระวังหัว\"</i> แล้วเดินลงบันไดในโถงหลังร้าน",
      "รหัส: \"สีดำ ไม่ต้องรีด\" · ตอบผิดยังเข้าได้ แต่บรูโน่บอกแจ็คให้จับตาดู (ใช้ตาราง \"ตอบรหัสผิด\" ในคู่มือ DM)",
      "ที่นั่งแนะนำ: Mozxorion เคาน์เตอร์ใกล้ฮาร์วีย์ · Nincolas โต๊ะไพ่วินนี่ · Vivian โต๊ะข้างอาเธอร์ · Windowส์ ให้ผู้เล่นเลือก"],
    checks: [["wrongPass", "มีคนตอบรหัสผิด"], ["friendBruno", "มีคนพูดดีกับบรูโน่ / ไม่ดูถูกที่เขาเป็นออค"], ["insultBruno", "มีคนดูถูกบรูโน่"]] },
  { id: "mingle", time: "คืนที่ 1 · 21:00", title: "เดินคุยอิสระในบาร์",
    read: "เสียงเปียโนแจ๊สลอยมาจากเวทีมุมห้อง ควันซิการ์ลอยเป็นชั้นใต้แสงเวทสีอำพันที่ลอยอยู่กลางอากาศ แก้วกระทบกันเป็นจังหวะ คนในห้องนี้ทุกคนมีเหตุผลที่ไม่อยากให้ใครรู้ว่ามาอยู่ที่นี่คืนนี้",
    tips: ["ปล่อยเดินอิสระ ไม่ต้องผลัดกัน · ช่วงนี้คือเวลาผูกมิตร (ปลดตัวช่วยตอน C.A.A.M. บุก)", "ประมาณ 20–40 นาทีจริง แล้วค่อยไปฉากไฟดับ"],
    checks: [["friendJack", "ผูกมิตรกับแจ็ค (ทิปดี / Persuasion DC 13 / ช่วยไล่คนเมา)"], ["talkArthur", "มีคนคุยกับอาเธอร์"], ["vivianArthur", "Vivian เจออาเธอร์ (นายจ้าง A.P.)"],
      ["friendHarvey", "ผูกมิตรกับฮาร์วีย์ (ดื่มแข่งชนะ / ฟังเรื่องสงครามจนจบ)"], ["friendLola", "ผูกมิตรกับโลล่า (ชมเพลง / ทิป / Charm)"],
      ["playWinnie", "เล่นไพ่กับวินนี่"], ["spotScout", "สังเกตคนแปลกหน้าสูทเทา (Perception DC 14)"], ["rickyDrink", "ริกกี้เลี้ยงเหล้าถามเรื่องเรือ"]] },
  { id: "collapse", time: "คืนที่ 1 · 21:40 · รอบ 0", title: "ไฟเวทีดับ อาเธอร์ล้ม",
    read: "เพลงขาดกลางท่อน แสงเวทเหนือเวทีดับวูบพร้อมกันทุกดวง ในความมืดมีเสียงแก้วแตกและเสียงหายใจครืดคราดเหมือนคนจมน้ำ พอไฟกลับมา สิบเอกอาเธอร์นอนชักอยู่บนพื้น มือข้างหนึ่งคว้าแขนคนที่อยู่ใกล้ที่สุดไว้แน่น \"อย่า... ให้พวกมัน... ได้ตั๋ว\"",
    tips: ["ทุกคนที่เห็นทอยเซฟ WIS DC 10 (ความหวาดผวา) ไม่ผ่าน +1 Dread", "เริ่มนับรอบ: ไซเรน C.A.A.M. ดังตอนรอบ 3"],
    checks: [["whisper", "อาเธอร์กระซิบกับผู้เล่นแล้ว"], ["dread1", "ทุกคนทอยความหวาดผวาแล้ว"]] },
  { id: "investigate", time: "รอบ 1–2", title: "สืบศพ · ตั๋วอยู่กับใคร",
    read: "ผิวของอาเธอร์ซีดเป็นสีเทาอมเขียว ที่มุมปากมีเมือกใสไหลเยิ้ม กลิ่นคาวทะเลลอยขึ้นมาทั้งที่บาร์นี้อยู่ห่างท่าเรือหลายช่วงตึก",
    tips: ["Investigation DC 12: รอยสักดวงตา+หนวดที่คอ · เหรียญเปียก · หลอดยาเปล่า", "Medicine/Arcana DC 13: หลอดลมพังจากข้างใน (ปรสิต)",
      "ริกกี้ทำทีเข้ามาช่วยพยุง แล้วล้วงตั๋ว: Sleight of Hand +5 vs Passive Perception"],
    checks: [["clueTattoo", "เจอรอยสักดวงตา+หนวด"], ["clueCoin", "เจอเหรียญที่เปียกตลอดเวลา"], ["clueVial", "เจอหลอดยาวิปลาสเปล่า"], ["clueThroat", "รู้ว่าหลอดลมพังจากข้างใน"],
      ["ticketPlayer", "ผู้เล่นเก็บตั๋วไว้เอง"], ["rickyCaught", "ริกกี้ล้วงไม่สำเร็จ (โดนจับได้)"]] },
  { id: "siren", time: "รอบ 3", title: "ไซเรน C.A.A.M.",
    read: "เสียงไซเรนแหลมเสียดหูดังมาจากถนนข้างบน บรูโน่ตะโกนลงบันได \"C.A.A.M.! ทุกคนออกไป!\" คนทั้งบาร์ลุกพรวด เก้าอี้ล้ม แก้วแตก",
    tips: ["C.A.A.M. ลงบันไดรอบที่ 4 (ช้าไป 1 รอบถ้าฮาร์วีย์ขวาง)", "เป้าหมาย C.A.A.M.: เก็บศพและปิดข่าว ไม่ได้มาฆ่า (ลูกดอกยาสลบก่อนเสมอ)"],
    checks: [["foundSecret", "มีคนหาประตูลับเจอเอง (Investigation DC 15)"]],
    choice: ["escape", "ผู้เล่นเลือกทางไหน", [["chase", "ตามริกกี้ (ช่องเทถ่านหิน)"], ["chute", "หนีทางช่องเทถ่านหินเอง"], ["tunnel", "หนีทางอุโมงค์ลับ"], ["stay", "อยู่กับศพ / ยอมให้จับ"], ["fight", "สู้กับ C.A.A.M."]]] },
  { id: "chase", time: "คืนที่ 1 · 21:50", title: "ฉาก 3 · ไล่ล่าในตรอก",
    read: "ริกกี้ปีนออกจากช่องเทถ่านหิน พุ่งเข้าตรอกที่มีราวตากผ้าพาดไปมา รองเท้าของเขาสาดน้ำขังกระเซ็น",
    tips: ["3 ด่าน DC 12 ผู้เล่นเลือกทักษะเอง: กำแพงต่ำ (Athletics/Acrobatics) · ทางแยก (Perception/Survival) · กองลังถล่ม (Acrobatics)", "ผ่าน 2 ใน 3 = ตามทัน"],
    checks: [["chase1", "ผ่านด่าน 1 กำแพงต่ำ"], ["chase2", "ผ่านด่าน 2 ทางแยก"], ["chase3", "ผ่านด่าน 3 กองลัง"]] },
  { id: "caam", time: "คืนที่ 1 · ดึก", title: "ฉาก 4 · ห้องสอบสวน C.A.A.M.",
    read: "ห้องสีเทาไม่มีหน้าต่าง หลอดไฟดวงเดียวส่ายไปมาเหนือโต๊ะเหล็ก ชายในสูทเทาวางแฟ้มตราประทับ \"ประเมินวินาศภัยและจัดการสินทรัพย์\" ลงตรงหน้า \"เขาพูดอะไรก่อนตาย\"",
    tips: ["ข้ามฉากนี้ได้ถ้าทุกคนหนีพ้น", "ร่วมมือ: ปล่อยตอนสาย เจ้าหน้าที่หนุ่มกระซิบ \"อย่าไปท่าเรือ\" · ปิดปาก: ปล่อยตอนเที่ยงพร้อมคนสะกดรอย"],
    checks: [["cooperate", "ผู้เล่นให้ความร่วมมือ"], ["hidTicket", "ซ่อนตั๋วไว้ได้ (Sleight of Hand DC 13)"], ["sawMorgue", "เห็นศพในถุงตะกั่วกระตุก (Dread DC 10)"], ["youngWhisper", "เจ้าหน้าที่หนุ่มกระซิบ \"อย่าไปท่าเรือ\""]] },
  { id: "day2", time: "วันที่ 2 · เช้า", title: "เบาะแสชี้ไปท่าเรือ",
    read: "หนังสือพิมพ์อาร์คเคนเดลี่ฉบับเช้าไม่มีข่าวบาร์ใต้ดินเลยสักบรรทัด มีแค่ข่าวเล็กๆ มุมล่างว่า C.A.A.M. กักเรือทุกลำในท่า \"เพื่อประเมินความเสียหาย\"",
    tips: ["ดูกล่อง \"ผลที่ตามมา\" ด้านล่างว่าผู้เล่นถือเบาะแสอะไรอยู่ ถ้าน้อยเกินไป ให้ตัวช่วยสำรอง (ฟินช์ขายข่าว / เจ้าหน้าที่หนุ่ม)"],
    checks: [["visitFinch", "ผู้เล่นไปหาฟินช์ (ตลาดมืด)"], ["readNews", "อ่านข่าวเรือถูกกัก"]] },
  { id: "docks", time: "วันที่ 2 · บ่าย–ค่ำ", title: "ฉาก 5 · ท่าเรือ พ่อค้ายาวิปลาส",
    read: "กลิ่นปลาเน่าและน้ำมันเครื่องปะทะหน้า ใต้กันสาดโกดังร้าง ชายผอมแห้งคนหนึ่งเรียงหลอดแก้วสีเขียวเรืองแสงบนลังไม้ ข้างสะพานไม้ มีคนนั่งเกาแขนจนเลือดซิบ ผิวตรงนั้นเป็นเกล็ด",
    tips: ["อันธพาล 2 ตัวซ่อนหลังลัง (โทเคนซ่อนไว้) เปิดเมื่อพ่อค้ายาเรียก", "คนเสพมีเกล็ด: เห็นครั้งแรก Dread DC 10"],
    checks: [["intimDealer", "ข่มขู่พ่อค้ายาสำเร็จ"], ["buyDrug", "ซื้อยาวิปลาส"], ["followAddict", "ตามคนเสพไป"], ["thugsFled", "อันธพาลหนีกลับอู่"]] },
  { id: "shed", time: "วันที่ 2 · คืน", title: "ฉาก 6 · อู่ซ่อมเรือร้าง",
    read: "ประตูไม้บวมน้ำล่ามโซ่สนิม จากข้างในมีเสียงฮัมเพลงทำนองแปลกๆ ลอยขึ้นมาจากใต้พื้น เพลงที่ลูกเรือเก่าร้องกันก่อนออกทะเลลึก",
    tips: ["ใช้ฉาก \"อู่ซ่อมเรือร้าง (ภายใน)\" · แม็คพุ่งหาคนถือตั๋วก่อน", "ไฟคือจุดอ่อน: AC แม็คเหลือ 11 · HP ต่ำกว่าครึ่ง แม็คกระโดดลงร่องน้ำหนี"],
    checks: [["quietDoor", "ปลดโซ่เงียบ (ได้เซอร์ไพรส์)"], ["safeOpen", "เปิดตู้เซฟในห้องทำงาน"], ["fireUsed", "ใช้ไฟกับแม็ค"], ["mackFled", "แม็คหนีลงทะเล"], ["mackDead", "แม็คตาย"],
      ["pearlTaken", "มีคนเก็บไข่มุกดำ"], ["letterFound", "เจอจดหมายสั่งของถึงโกดัง 4"], ["partyDown", "ปาร์ตี้แพ้ (ถูกลากออกมา)"]] },
  { id: "end", time: "จบบท", title: "สรุป → Chapter 2", read: "", tips: ["ดูกล่องผลที่ตามมา จดลง Session Log", "ให้ Long Rest และเลเวลอัพเป็น 2 (มาโคร \"เลเวลอัพ\")"], checks: [] }
];

// ---------- consequences per phase, from what is ticked so far
function consequences(id, c, ch) {
  const out = [];
  const add = (cond, text, kind = "ok") => { if (cond) out.push([kind, text]); };
  const friends = ["friendJack", "friendBruno", "friendHarvey", "friendLola", "playWinnie"].filter((k) => c[k]);
  switch (id) {
    case "door":
      add(c.friendBruno, "บรูโน่จำได้ ตอน C.A.A.M. บุกเขาจะชี้ช่องเทถ่านหินให้");
      add(c.insultBruno, "บรูโน่ไม่ถือสาตอนนี้ แต่ตอน C.A.A.M. บุกเขาจะไม่ช่วย และอาจชี้ตัวผู้เล่นให้เจ้าหน้าที่", "warn");
      break;
    case "mingle":
      add(c.talkArthur, "อาเธอร์กำกระเป๋าเสื้อแน่น หลุดคำว่า \"โกดังสี่\" ผู้เล่นรู้ก่อนว่ามีของสำคัญ");
      add(c.vivianArthur, "อาเธอร์บอก Vivian ว่าจะจ่ายครึ่งหนึ่งพรุ่งนี้ \"ของรออยู่ที่ท่าเรือ\"");
      add(c.spotScout, "เห็นคนแปลกหน้าสูทเทาลุกออกไป 1 นาทีก่อนไฟดับ (สาย C.A.A.M.)");
      add(c.rickyDrink, "ริกกี้รู้ว่า Mozxorion คุ้มกันเรือ เขาจะเล่าให้แม็คฟัง");
      add(c.playWinnie, "วินนี่จะตะโกนเรื่องริกกี้ทันทีในรอบที่ 3");
      add(!c.talkArthur, "ยังไม่มีใครคุยกับอาเธอร์ ผู้เล่นจะไม่รู้เรื่องโกดังสี่จนกว่าจะเจอตั๋ว", "info");
      break;
    case "collapse":
      add(c.friendLola, "โลล่าเปิดไฟคืนเร็ว ผู้เล่นได้เปรียบ Perception รอบแรก");
      add(c.spotScout, "ผู้เล่นที่เห็นคนสูทเทาออกไป ได้รู้ว่าเรื่องนี้ไม่ใช่อุบัติเหตุ");
      break;
    case "investigate": {
      const clues = ["clueTattoo", "clueCoin", "clueVial", "clueThroat"].filter((k) => c[k]).length;
      add(true, `เบาะแสที่ได้: ${clues}/4`, clues >= 2 ? "ok" : "info");
      add(c.ticketPlayer && !c.rickyCaught, "ริกกี้จะล้วงตั๋วคืน: ทอย Sleight of Hand +5 แข่ง Passive Perception คนถือ", "warn");
      add(c.ticketPlayer && c.rickyCaught, "ริกกี้หนีมือเปล่า คนถือตั๋วเป็นเป้าซินดิเคท (แม็คพุ่งหาคนนี้ในฉาก 6)", "warn");
      add(!c.ticketPlayer, "ริกกี้ได้ตั๋วไป เขาจะวิ่งไปช่องเทถ่านหินตอนไซเรนดัง");
      break;
    }
    case "siren":
      add(true, `ผูกมิตรไว้ ${friends.length} คน`, friends.length ? "ok" : "info");
      add(c.friendJack || c.foundSecret, "อุโมงค์ลับใช้ได้ (แจ็คบอก / หาเจอเอง) → ออกท่อระบายน้ำริมท่าเรือ");
      add(!c.friendJack && !c.foundSecret, "อุโมงค์ลับยังใช้ไม่ได้ ถ้าวิ่งไปทางนั้นจะเจอประตูตายแล้วโดนจับ", "warn");
      add(c.friendBruno, "บรูโน่ชี้ช่องเทถ่านหินให้");
      add(c.friendHarvey, "ฮาร์วีย์ขวางบันได C.A.A.M. ลงช้าไป 1 รอบ");
      add(c.friendLola, "โลล่าดับไฟทั้งร้าน ทุกคนซ่อน/หนีแบบได้เปรียบ");
      add(c.playWinnie, "วินนี่ตะโกน \"ไอ้ริกกี้มันล้วงของจากศพ!\" ทันที");
      add(!c.playWinnie, "วินนี่ตะโกนช้าไป 1 รอบ", "info");
      add(ch.escape === "chase", "ไปฉาก 3 ไล่ล่า");
      add(ch.escape === "stay" || ch.escape === "fight", "ไปฉาก 4 ห้องสอบสวน" + (ch.escape === "fight" ? " (ตื่นในห้องขัง ของถูกยึด)" : " (ในฐานะพยาน)"), "warn");
      add(ch.escape === "tunnel" && !(c.friendJack || c.foundSecret), "หนีทางอุโมงค์ไม่ได้ ประตูตาย → โดนจับ ไปฉาก 4", "warn");
      add((ch.escape === "tunnel" && (c.friendJack || c.foundSecret)) || ch.escape === "chute", "หนีพ้น ข้ามฉาก 4 ได้ แต่ C.A.A.M. จำหน้าไว้");
      break;
    case "chase": {
      const n = ["chase1", "chase2", "chase3"].filter((k) => c[k]).length;
      add(n >= 2, "ตามทัน! ริกกี้ยอมคืนตั๋ว บอกชื่อ \"แม็ค\" และ \"อู่ซ่อมเรือร้าง\"");
      add(n < 2 && n + (3 - ["chase1", "chase2", "chase3"].filter((k) => k in c).length) < 2, "คลาด ริกกี้ลงเรือหาย ทิ้งเกล็ดสีดำไว้ (เบาะแสไปท่าเรือ)", "warn");
      add(ch.escape !== "chase", "ผู้เล่นไม่ได้ไล่ตาม ข้ามฉากนี้ได้", "info");
      break;
    }
    case "caam":
      add(ch.escape === "chute" || (ch.escape === "tunnel" && (c.friendJack || c.foundSecret)) || ch.escape === "chase", "ผู้เล่นหนีพ้น ข้ามฉากนี้ได้ (เจ้าหน้าที่หนุ่มจะตามมากระซิบทีหลัง)", "info");
      add(c.hidTicket, "ยังมีตั๋วติดตัว");
      add(c.ticketPlayer && !c.hidTicket && (ch.escape === "stay" || ch.escape === "fight"), "ตั๋วโดนยึด แต่ผู้เล่นจำได้ว่าเขียน \"โกดัง 4 ท่าเรือ\"", "warn");
      add(c.cooperate, "ปล่อยตอนสาย มีคนสะกดรอย (Stealth DC 13 สลัด)");
      break;
    case "day2": {
      const n = (ch.escape === "chase" && ["chase1", "chase2", "chase3"].filter((k) => c[k]).length >= 2) || c.ticketPlayer;
      const clues = [[n, "ตั๋ว: \"โกดัง 4 ท่าเรือ\""], [c.clueCoin, "เหรียญเปียก มีกลิ่นคาวทะเล"], [c.clueVial, "หลอดยาวิปลาส ขายที่ท่าเรือ"],
        [ch.escape === "chase", "ริกกี้หนีไปทางท่าเรือ / เกล็ดสีดำ"], [c.youngWhisper, "\"อย่าไปท่าเรือ\""], [c.vivianArthur, "Vivian: ค่าจ้างรออยู่ที่ท่าเรือ"], [c.readNews, "เรือถูกกักที่ท่า (Mozxorion)"]];
      for (const [has, t] of clues) add(has, t);
      const total = clues.filter(([h]) => h).length;
      add(total < 2, "เบาะแสน้อย: ให้ฟินช์ขายข่าว $5 หรือให้เจ้าหน้าที่หนุ่มมาหา", "warn");
      break;
    }
    case "docks":
      add(c.intimDealer || c.buyDrug || c.followAddict, "รู้ที่ตั้งอู่ซ่อมเรือร้างแล้ว");
      add(c.thugsFled, "อันธพาลหนีกลับอู่ แม็ครู้ตัวว่ามีคนตามมา (ไม่มีเซอร์ไพรส์)", "warn");
      add(!(c.intimDealer || c.buyDrug || c.followAddict || c.thugsFled), "ยังไม่รู้ที่อู่: ตามอันธพาลที่หนี หรือฟินช์ขายข่าว", "info");
      break;
    case "shed":
      add(c.quietDoor && !c.thugsFled, "เซอร์ไพรส์: ศัตรูทอย Initiative เสียเปรียบ");
      add(c.ticketPlayer, "แม็คพุ่งหาคนถือตั๋วก่อน", "warn");
      add(c.fireUsed, "เกล็ดแม็คหลุด AC เหลือ 11");
      add(c.pearlTaken, "คนที่ใส่ไข่มุกดำ: ทุก Long Rest เซฟ CON DC 12 (คำสาป)", "warn");
      break;
    case "end":
      add(c.letterFound, "มีจดหมายสั่งของถึงโกดัง 4 → Chapter 2");
      add(!c.letterFound, "ยังไม่ได้จดหมาย: ให้ฟินช์หรือบัญชีในตู้เซฟพาไปโกดัง 4 แทน", "warn");
      add(c.mackFled, "แม็คหนีรอด จะกลับมาใน Chapter 2", "warn");
      add(c.mackDead, "แม็คตาย ซินดิเคทจะส่งคนมาแก้แค้น");
      add(c.pearlTaken, "ไข่มุกดำอยู่กับผู้เล่น (ตะขอลัทธิใต้น้ำ)");
      add(friends.length, `NPC ที่เป็นมิตร: ${friends.length} คน (กลับมาช่วยได้ในบทหลัง)`);
      add(c.partyDown, "ผู้เล่นติดหนี้บุญคุณฟินช์/ฮาร์วีย์", "info");
      break;
  }
  return out;
}

// ---------- state
const state = () => foundry.utils.deepClone(game.settings.get(MOD, KEY) ?? {}) ?? {};
async function save(s) { await game.settings.set(MOD, KEY, s); }
export function registerTracker() {
  game.settings.register(MOD, KEY, { scope: "world", config: false, type: Object, default: { phase: 0, checks: {}, choice: {} } });
}

const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const CSS = `
.ark-tr{display:grid;grid-template-columns:190px 1fr;gap:10px;height:100%;font-size:13px}
.ark-tr .side{overflow:auto;border-right:1px solid #9A6B2C55;padding-right:6px}
.ark-tr .ph{display:block;width:100%;text-align:left;padding:5px 7px;margin:0 0 3px;border:1px solid transparent;border-radius:4px;background:none;cursor:pointer;color:inherit;line-height:1.3}
.ark-tr .ph small{display:block;opacity:.65;font-size:11px}
.ark-tr .ph,.ark-tr .nav button{height:auto !important;min-height:0 !important;max-height:none !important;white-space:normal !important;overflow:visible !important;align-items:flex-start;flex-direction:column;justify-content:flex-start;gap:0}
.ark-tr .ph small{white-space:normal;line-height:1.2;margin-top:1px}
.ark-tr .ph.on{background:#173A38;color:#F3EAD6;border-color:#9A6B2C}
.ark-tr .ph.done{opacity:.6}
.ark-tr .main{overflow:auto;padding-right:6px}
.ark-tr h2{margin:0 0 2px;border:none;font-size:18px}
.ark-tr .time{color:#9A6B2C;font-weight:bold;margin-bottom:8px}
.ark-tr .read{background:#EFE4C9;color:#2B2620;border-left:4px solid #9A6B2C;padding:8px 10px;margin:6px 0 8px;font-style:italic;border-radius:3px}
.ark-tr .tips li{margin:2px 0}
.ark-tr .checks label{display:flex;gap:6px;align-items:flex-start;margin:3px 0}
.ark-tr .checks input{margin-top:2px;flex:none}
.ark-tr .cons{margin-top:8px;border:1px solid #9A6B2C66;border-radius:4px;padding:6px 8px}
.ark-tr .cons b{display:block;margin-bottom:4px}
.ark-tr .cons div{padding:2px 0 2px 18px;position:relative}
.ark-tr .cons div:before{position:absolute;left:2px}
.ark-tr .cons .ok:before{content:"✔";color:#3c9a5c}.ark-tr .cons .warn:before{content:"!";color:#c0392b;font-weight:bold}.ark-tr .cons .info:before{content:"•";color:#9A6B2C}
.ark-tr .nav{display:flex;gap:6px;margin-top:10px;flex-wrap:wrap}
.ark-tr .nav button{flex:1 1 auto;min-width:110px}
.ark-tr select{width:100%}`;

let APP = null;
function buildHTML() {
  const s = state(); s.checks ??= {}; s.choice ??= {}; s.phase ??= 0;
  const p = PHASES[s.phase] ?? PHASES[0];
  const side = PHASES.map((q, i) => `<button class="ph ${i === s.phase ? "on" : i < s.phase ? "done" : ""}" data-go="${i}">${esc(q.title)}<small>${esc(q.time)}</small></button>`).join("");
  const checks = (p.checks ?? []).map(([id, label]) => `<label><input type="checkbox" data-check="${id}" ${s.checks[id] ? "checked" : ""}> <span>${esc(label)}</span></label>`).join("");
  const choice = p.choice ? `<p><b>${esc(p.choice[1])}</b></p><select data-choice="${p.choice[0]}"><option value="">— ยังไม่เลือก —</option>${p.choice[2].map(([v, t]) => `<option value="${v}" ${s.choice[p.choice[0]] === v ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>` : "";
  const cons = consequences(p.id, s.checks, s.choice).map(([k, t]) => `<div class="${k}">${esc(t)}</div>`).join("") || `<div class="info">ติ๊กสิ่งที่เกิดขึ้น แล้วผลจะขึ้นตรงนี้</div>`;
  return `<style>${CSS}</style><div class="ark-tr"><div class="side">${side}</div><div class="main">
    <h2>${esc(p.title)}</h2><div class="time">🕰 ${esc(p.time)}</div>
    ${p.read ? `<div class="read">${esc(p.read)}</div>` : ""}
    ${p.tips?.length ? `<ul class="tips">${p.tips.map((t) => `<li>${esc(t).replace(/&lt;(\/?[bi])&gt;/g, "<$1>")}</li>`).join("")}</ul>` : ""}
    <div class="checks">${checks}${choice}</div>
    <div class="cons"><b>ผลที่ตามมา</b>${cons}</div>
    <div class="nav"><button data-nav="-1">◀ ก่อนหน้า</button>${p.read ? `<button data-read="1">📢 อ่านให้ผู้เล่น (แชท)</button>` : ""}<button data-nav="1">ถัดไป ▶</button></div>
    <div class="nav"><button data-reset="1">ล้างทั้งหมด (เริ่มบทใหม่)</button></div>
  </div></div>`;
}
async function onClick(ev) {
  const t = ev.target.closest("[data-go],[data-nav],[data-read],[data-reset]");
  if (!t) return;
  const s = state(); s.phase ??= 0;
  if (t.dataset.go) s.phase = Number(t.dataset.go);
  if (t.dataset.nav) s.phase = Math.max(0, Math.min(PHASES.length - 1, s.phase + Number(t.dataset.nav)));
  if (t.dataset.read) {
    const p = PHASES[s.phase];
    return ChatMessage.create({ content: `<div class="rw-card"><div class="rw-title">${esc(p.title)} · ${esc(p.time)}</div><p><i>${esc(p.read)}</i></p></div>` });
  }
  if (t.dataset.reset) {
    const D = foundry.applications?.api?.DialogV2;
    const ok = D ? await D.confirm({ window: { title: "ล้างตัวช่วย DM" }, content: "<p>ล้างทุกช่องที่ติ๊กไว้ และกลับไปเริ่มบท?</p>" }) : true;
    if (!ok) return;
    await save({ phase: 0, checks: {}, choice: {} }); return APP?.render();
  }
  await save(s); APP?.render();
}
async function onChange(ev) {
  const el = ev.target; const s = state(); s.checks ??= {}; s.choice ??= {};
  if (el.dataset.check) s.checks[el.dataset.check] = el.checked;
  if (el.dataset.choice) s.choice[el.dataset.choice] = el.value;
  await save(s); APP?.render();
}

export function openCh1Tracker() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const AppV2 = foundry.applications?.api?.ApplicationV2;
  if (!AppV2) return ui.notifications.error("ต้องใช้ Foundry v12 ขึ้นไป");
  if (!APP) {
    class Ch1Tracker extends AppV2 {
      static DEFAULT_OPTIONS = { id: "arkane-ch1-tracker", window: { title: "Chapter 1 · ตัวช่วย DM", resizable: true, icon: "fas fa-clock" }, position: { width: 760, height: 620 } };
      async _renderHTML() { return buildHTML(); }
      _replaceHTML(result, content) {
        content.innerHTML = result;
        content.style.overflow = "hidden";
        content.querySelector(".ark-tr")?.addEventListener("click", onClick);
        content.querySelector(".ark-tr")?.addEventListener("change", onChange);
      }
    }
    APP = new Ch1Tracker();
  }
  APP.render({ force: true });
  return APP;
}
