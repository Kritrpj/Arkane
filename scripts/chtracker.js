// DM tracker for Chapters 2, 2.5/2.6, 3 and 4 (same idea as the Chapter 1 helper): where are we, what the players did, what that unlocks,
// and a one-click session summary (chat + journal) so the DM can write the session log easily.
const MOD = "arkane-1920s";
const KEY = "chTrackers";
const R = (c, k) => !!c[k];

// phase: { id, time, title, read, tips[], checks[[id,label]], choice:[id,label,[[v,text]]], cons:(c,ch,all)=>[[kind,text]] }
const CHAPTERS = {
  "2": { title: "Chapter 2 · โกดังหมายเลข 4", phases: [
    { id: "morning", time: "วันที่ 2 · เช้า", title: "เช้าที่โรงเตี๊ยม + เตรียมไปท่าเรือ",
      read: "แสงแดดลอดผ้าม่าน เสียงรถรางดังมาจากถนน คืนที่ผ่านมาเหมือนฝันร้าย แต่ตั๋วรับของใบนั้นยังอยู่จริง",
      tips: ["มาโคร \"Chapter 2: เช้าวันที่ 2 (โรงเตี๊ยม)\": ย้ายทุกคนไปห้องแยก พักยาว Dread −1 และส่งทอยสังเกตชายสูทเทา (DC 13)",
        "ไฮนซ์เข้าตี้: ฉากที่แผงฟินช์ (ซอยระหว่างโกดัง 2 กับ 4) ไฮนซ์ถามหาเกียร์หัวใจที่ฟินช์ขายให้ซินดิเคทไปแล้ว ฟินช์ชี้ตี้ ไฮนซ์เสนอเปิดตู้คอนเทนเนอร์ที่ผูกกลไกเต้นตุบให้ ดูสมุดเนื้อเรื่อง DM หน้า \"ไฮนซ์: เข้าบท Ch2 และออกจากตี้\" · แล้วกดมาโคร \"Chapter 2: ไฮนซ์เข้าตี้\"",
        "มาโคร \"Chapter 2: ไฮนซ์เข้าตี้\" เมื่อฉาก C.A.A.M. จบ · \"จ่ายรางวัล C.A.A.M.\" ถ้าตี้ร่วมมือ (+25 gp ทุกคน)",
        "ร้านฟินช์: ตั้งด่านสินค้าด้วยมาโคร \"ร้านฟินช์: ตั้งด่านสินค้า\" ก่อนผู้เล่นไปซื้อของ"],
      checks: [["watcher", "ใครทอยเห็นชายสูทเทาฝั่งตรงข้ามถนน"], ["heinzIn", "ไฮนซ์เข้าตี้แล้ว"], ["caamPaid", "จ่ายรางวัล C.A.A.M. แล้ว"], ["finch", "ไปร้านฟินช์ซื้อของ"], ["harvey", "ฮาร์วีย์เล่าเรื่องคืนก่อนให้ฟัง"]],
      cons: (c) => [[c.watcher ? "ok" : "info", c.watcher ? "ตี้รู้ว่ามีคนสะกดรอย (C.A.A.M.) · Stealth DC 13 สลัดได้" : "ไม่มีใครเห็นสายสะกดรอย ปล่อยให้ตามไปท่าเรือได้"], [c.heinzIn ? "ok" : "info", c.heinzIn ? "ไฮนซ์ช่วยถอดกลไกกล่องเหล็กในโกดังได้" : "ยังไม่มีไฮนซ์ ฉากถอดกลไกจะต้องใช้ Arcana/Tinker's Tools ของคนอื่น"]] },
    { id: "approach", time: "วันที่ 2 · สาย", title: "ลานหน้าโกดัง 4",
      read: "กลิ่นปลาและน้ำมันเครื่องปะทะหน้า รถบรรทุกจอดนิ่งรอขนของ ยามสองคนเดินตรวจรอบลาน เสียงเต้นตุบๆ ดังมาจากข้างในเหมือนหัวใจขนาดยักษ์",
      tips: ["วางฉากด้วยมาโคร \"Chapter 2: โกดัง 4 วาง NPC\" (ยามหน้า/ในโกดังเรียงตามจุดบนแมพ)", "Stealth DC 13 ผ่านลานได้ · ยื่นตั๋ว: Deception DC 12 หรือยามจำได้ว่าเจ้าของตั๋วตายแล้ว", "ประตูม้วนเปิดเสียงดัง = คนในรู้ตัว ทอย Initiative"],
      checks: [["stealthOk", "แอบผ่านลานได้"], ["ticketShown", "ยื่นตั๋วสำเร็จ"], ["alarm", "ยามรู้ตัว/เสียงดัง"]],
      choice: ["entry", "ตี้เข้าโกดังทางไหน", [["ticket", "ตั๋วรับของ (ประตูม้วน) · 10 นาทีก่อนถูกล้อม"], ["water", "ตะแกรงใต้น้ำ → ห้องแท็งก์ (เจอคนงานมีเหงือก หวาดผวา DC 13)"], ["shoot", "บุกยิงจากลาน (ซินดิเคทขนลงเรือภายใน 5 รอบ)"], ["captain", "ผ่านกัปตันเอซรา (ท่าเทียบเรือ)"]]],
      cons: (c, ch) => [[ch.entry === "shoot" ? "warn" : "info", ch.entry === "shoot" ? "นาฬิกาห้วงนิทรา +1 (ซินดิเคทเร่งขนลังขึ้นเรือแมรี่ แอนน์ ภายใน 5 รอบ)" : "ตัวเลือกทางเข้าที่ยังไม่ใช้ยังเป็นทางหนีได้"], [c.alarm ? "warn" : "ok", c.alarm ? "ยามกลุ่มแรกตื่น มือปืนในโกดังตั้งแถว" : "ยังไม่มีใครตื่น"]] },
    { id: "inside", time: "วันที่ 2 · ในโกดัง", title: "ห้องทำงาน · ตู้คอนเทนเนอร์ · ชิ้นส่วนที่เต้นตุบ",
      read: "ตู้คอนเทนเนอร์เรียงเป็นเขาวงกตเหล็ก เสียงตุบๆ ดังจากตู้ใบหนึ่งที่เปิดแง้มอยู่ ผนังเย็นชื้นเหมือนเหงื่อของสัตว์ใหญ่",
      tips: ["ตู้เซฟห้องทำงาน (Thieves' Tools DC 15 / Athletics DC 18): จดหมายสั่งการจากเซนต์อัลดริก บัญชีลับ $40", "ชิ้นส่วนเครื่องจักร: แตะครั้งแรกหวาดผวา DC 10 · หนัก 20 ปอนด์ ต้องมีคนแบก", "คนงานมีเหงือก 2 คนตรวจตู้คอนเทนเนอร์ ใช้ตู้เป็นที่กำบังเต็มตัวได้"],
      checks: [["safeOpen", "เปิดตู้เซฟ (ได้จดหมายสั่งการ)"], ["ledger", "ได้บัญชีลับของรอสโซ"], ["part", "ได้ชิ้นส่วนเครื่องจักร"], ["fearPart", "ใครทอยหวาดผวาไม่ผ่านตอนแตะชิ้นส่วน"], ["gillFight", "สู้กับคนงานมีเหงือก"], ["heinzDisassemble", "ไฮนซ์ถอดกลไกชิ้นส่วนดู"]],
      cons: (c) => [[c.safeOpen ? "ok" : "warn", c.safeOpen ? "มีจดหมายสั่งการ: ชนะบทได้ + หลักฐานใน Chapter 3 (Advantage ตอนลงทะเบียนผู้ป่วยกับพยาบาล)" : "ยังไม่ได้จดหมาย: ได้จากปากรอสโซ/มือปืน/กัปตันแทน"], [c.part ? "info" : "info", c.part ? "ชิ้นส่วนอยู่กับตี้: ขึ้นรถไล่ล่าด้วย (เหตุการณ์ข้อ 8 ในตารางไล่ล่า)" : "ไม่ได้ชิ้นส่วน: ไม่มีเหตุการณ์ข้อ 8 ในฉากไล่ล่า"], [c.heinzDisassemble, "ok", "ไฮนซ์รู้ว่าเครื่องนี้เป็นเครื่องจักรของรอยแยกที่ถูกประกอบด้วยฝีมือคนจริง (ต่อ Chapter 3: ลายเซ็นช่าง)"]].filter((x) => x[0]).map((x) => x.length === 3 ? [x[1], x[2]] : x) },
    { id: "boss", time: "วันที่ 2 · ห้องแท็งก์", title: "ดอน รอสโซ (บอส)",
      read: "สระน้ำเค็มกลางห้องนิ่งสนิท รอสโซนั่งไขว่ห้างบนเก้าอี้แดง นิ้วเขามีพังผืดระหว่างข้อ \"ผมไม่ชอบเสียเวลา คุณก็คงไม่ชอบ มาคุยเรื่องราคากันดีไหม\"",
      tips: ["รอสโซเสนอดีลก่อนเสมอ · HP ต่ำกว่าครึ่ง: ดำหนีลงแท็งก์ ออกตะแกรงใต้น้ำ (2 รอบ)", "ไฟคือจุดอ่อน (ถังน้ำมัน/กระสุนเพลิง): เกล็ดหลุด AC เหลือ 12", "เพลงบอส: boss-rosso เล่นเองเมื่อเริ่ม Combat"],
      checks: [["deal", "ตี้ฟังดีลของรอสโซ"], ["fireUsed", "ใช้ไฟกับรอสโซ"], ["rossoFled", "รอสโซหนีลงแท็งก์"], ["rossoDead", "รอสโซตาย"], ["gillRing", "ได้แหวนเหงือกของรอสโซ"], ["partyDown", "ตี้ล้มลงกลางสู้"]],
      cons: (c) => [[c.rossoFled ? "warn" : "ok", c.rossoFled ? "รอสโซหนีรอด: ซินดิเคทยังมีหัวหน้าอยู่ ระวังตามมาแก้แค้น" : c.rossoDead ? "รอสโซตาย ซินดิเคทส่งคนมาแก้แค้น" : "ยังไม่จบการสู้"], [c.deal ? "info" : "info", c.deal ? "ตี้ฟังดีล: ได้ข้อมูลจากปากเขาเพิ่ม (ชื่อ นพ. เครน)" : "ยังไม่ฟังดีล"], [c.gillRing ? "ok" : "info", c.gillRing ? "แหวนเหงือก: มีของวิเศษใหม่ (ตรวจชีทไอเทม)" : "ยังไม่มีแหวน"]] },
    { id: "captain", time: "วันที่ 2 · ท่าเทียบเรือ", title: "กัปตันเอซรา ฮอลล์ · เรือแมรี่ แอนน์",
      read: "กัปตันยืนสูบบุหรี่ริมท่า เรือแมรี่ แอนน์จอดนิ่งตามน้ำ เขามองตี้นิ่งๆ แล้วถอนหายใจ \"ฉันแค่ขับเรือ ไม่เคยถามว่าในลังมีอะไร จนคืนนี้\"",
      tips: ["เอซราคือกัปตันของ Mozxorion (จ้างให้คุ้มกันสินค้าเที่ยวนี้) รู้จักกันอยู่แล้ว · ถ้า Mozxorion ทักก่อน คุยได้โดยไม่ต้องทอย · คนอื่นใช้ Persuasion DC 12", "เอซรายอมรับว่ารู้เรื่องบาร์ ขอโทษที่ไม่บอกเรื่องลัง เสนอพาตี้ขึ้นเรือดูสมุดบันทึกการขนส่ง · ลูกเรือรุ่นพี่ที่ส่ง Mozxorion ไปบาร์คือคนของเอซรา (สมุดเนื้อเรื่อง DM หน้า \"กัปตันเอซรา ↔ Mozxorion\")", "เรือนี้คือเรือที่ใช้เดินทางหลัง Chapter 4 (ถามผู้เล่น Mozxorion ว่าเรือลำนี้เป็นเรือของเขาไหม)"],
      checks: [["ezraTalk", "คุยกับกัปตัน"], ["ezraHelped", "ช่วยกัปตัน (เขาเป็นพันธมิตร)"], ["ezraHostile", "กัปตันเป็นศัตรู"], ["mozxorionCrew", "Mozxorion ยืนยันเป็นลูกเรือ"]],
      cons: (c) => [[c.ezraHelped ? "ok" : "info", c.ezraHelped ? "ใช้เรือแมรี่ แอนน์เดินทางหลัง Chapter 4 ได้ (กัปตันเป็นพันธมิตร)" : "ยังไม่ผูกมิตรกับกัปตัน: ชวนก่อนจบบท"], [c.mozxorionCrew ? "ok" : "info", c.mozxorionCrew ? "Mozxorion เป็นลูกเรือ: กัปตันเปิดห้องเก็บของและแผนที่ให้" : "ยังไม่ผูกเรื่อง Mozxorion กับเรือ"], [c.ezraHostile ? "warn" : "info", c.ezraHostile ? "เรือลำนี้ใช้ไม่ได้ ต้องหาเรือใหม่หลังบท 4" : "—"]] },
    { id: "end", time: "จบบท", title: "สรุป → ไล่ล่าบนถนน (2.5)",
      read: "", tips: ["ให้ XP/เลเวลอัพเป็น 3 (มาโคร \"ให้ XP\" / \"เลเวลอัพ\")", "ชนะและยึดชิ้นส่วน: นาฬิกา −1 · C.A.A.M. จ่าย $150 · ได้แค่จดหมาย: นาฬิกาไม่เปลี่ยน · แพ้หรือหนี: นาฬิกา +1", "ต่อด้วยมาโคร \"Chapter 2.5: วางรถและศัตรู\" (มือปืนซินดิเคทตามมา)"],
      checks: [["won", "ชนะบท (ยึดชิ้นส่วน)"], ["letterOnly", "ได้แค่จดหมาย"], ["lost", "แพ้/หนี"], ["levelUp", "เลเวลอัพเป็น 3 แล้ว"]],
      cons: (c) => [[c.won ? "ok" : "info", c.won ? "นาฬิกา −1 · C.A.A.M. จ่าย $150" : c.letterOnly ? "นาฬิกาไม่เปลี่ยน" : c.lost ? "นาฬิกา +1 · ตี้รู้แค่ชื่อโรงพยาบาลบนลัง" : "ยังไม่ระบุผลบท"]] }
  ] },
  "25": { title: "Chapter 2.5–2.6 · ไล่ล่า + จุดพัก", phases: [
    { id: "setup", time: "วันที่ 2 · บ่ายแก่", title: "เตรียมฉากไล่ล่า",
      read: "เครื่องยนต์ดังกระหึ่มข้างหลัง ไฟหน้ารถสีเหลืองสองคู่ปรากฏที่ปลายถนน \"มันตามมาแล้ว!\"",
      tips: ["ฉากไล่ล่าเป็นฉากใหญ่ฉากเดียวตามเส้นทางที่ DM ขีด: โกดัง → ถนนใหญ่ → สะพานอาร์คเคน → ศาลาว่าการ/สวน → ถนนเฉียงผ่านสถานีรถไฟ → ทางรถไฟ → ลานจอดโรงเตี๊ยม (มาโคร \"Chapter 2.5: วาร์ปไล่ล่า\" ลัดไปจุดเริ่ม/ลานจอด หรือสลับกลางวัน-กลางคืน)", "มาโคร \"Chapter 2.5: สร้างฉากไล่ล่า\" แล้ว \"วางรถและศัตรู\" · เลือกรถ (เก๋ง 4 ที่นั่ง / รถตู้ 6) และคนขับ", "ใส่ตัวละครกับมือปืนเข้า Combat (ไม่ต้องใส่รถ) · เพลง chase-fight เล่นเองเมื่อเริ่ม Combat · เฉพาะคนขับขับรถ", "ทอย 1d8 เหตุการณ์ตอนต้นทุกรอบ (ตารางในสมุด \"ไล่ล่าบนถนน (DM)\")"],
      checks: [["placed", "วางรถ+ศัตรูแล้ว"], ["driver", "เลือกคนขับแล้ว"], ["combatStarted", "เริ่ม Combat แล้ว"], ["partInCar", "ชิ้นส่วนเครื่องจักรอยู่บนรถ"]],
      cons: (c) => [[c.partInCar ? "warn" : "info", c.partInCar ? "เหตุการณ์ข้อ 8 (ชิ้นส่วนเต้นแรง) ใช้ได้" : "ถ้าทอยได้ข้อ 8 ให้ทอยใหม่"]] },
    { id: "rounds", time: "ไล่ล่า · 5–6 รอบ", title: "ไล่ล่าบนถนน",
      read: "กระสุนกระทบตัวถังดังเป็นชุด กระจกร้านค้าข้างทางแตกกระจาย รถรางจอดขวางเลนใต้ คนขับหักพวงมาลัยเต็มแรง",
      tips: ["แต่ละช่วงมีเหตุการณ์ต่างกัน: ถนนโกดัง · สะพาน (คอขวด) · ศาลา/สวน (ฝูงชน ตัดสวน) · ถนนเฉียงสถานีรถไฟ · ทางรถไฟ (ทอย d6: 1 = รถไฟผ่าน)  ดูสมุด \"เส้นทางไล่ล่า (DM)\" · ทอยตารางเหตุการณ์ 1d8 ตอนต้นรอบและตอนวาร์ป", "(เดิม) สิ่งกีดขวาง 8 จุดตามแมพ (รถเข็น น้ำมัน รถม้าล้ม รถราง ด่านก่อสร้าง ซอยลัด ท่อประปา) · DEX DC 10–12", "รถ AC 14 HP 40 (รถตู้ 55) · ยางแตก: ความเร็วลดครึ่ง ทอยขับ DC 12", "ศัตรู: คันที่ 1 พุ่งชน · คันที่ 2 ยิงคนขับ + ตะขอฉมวก (ตัดสาย DC 12)", "ห้ามยิงโดนผู้บริสุทธิ์: ถ้าพลาด 1 ตกใส่คนเดินถนน"],
      checks: [["tireShot", "ยิงยางศัตรูแตก"], ["hookCut", "ตัดสายตะขอ"], ["rammed", "พุ่งชนศัตรู"], ["carA", "รถศัตรูคันที่ 1 ดับ"], ["carB", "รถศัตรูคันที่ 2 ดับ"], ["civilian", "ชนคนเดินถนน/ยิงผู้บริสุทธิ์"], ["policeNotice", "ตำรวจเริ่มสนใจ"], ["partyCrash", "รถปาร์ตี้พัง"], ["ambush", "ล่อศัตรูเข้าซอยลัดและซุ่มสำเร็จ"]],
      choice: ["chaseEnd", "การไล่ล่าจบแบบไหน", [["alley", "ถึงลานจอดโรงเตี๊ยม → จุดพัก"], ["destroyed", "ทำลายรถศัตรูหมด"], ["crash", "รถปาร์ตี้พัง วิ่งต่อด้วยเท้า"]]],
      cons: (c, ch) => [[ch.chaseEnd === "gate" ? "warn" : "ok", ch.chaseEnd === "gate" ? "ยามเห็น เครนรู้ตัว: ใน Chapter 3 ผู้คุมทั้งตึกตื่น เครนชาร์จเครื่องทันที นาฬิกา +1" : ch.chaseEnd === "alley" ? "ซินดิเคทถอนตัว ตี้ไปจุดพักได้ ใช้มาโคร \"Chapter 2.6: จุดพักเชิงเนิน\"" : "จบการสู้ ซินดิเคทไม่ลืม (คนที่รอดจะรายงาน)"], [c.civilian ? "warn" : "info", c.civilian ? "มีผู้บริสุทธิ์ถูกยิง: ตำรวจสนใจ" : "ไม่มีเหยื่อผู้บริสุทธิ์"], [c.partyCrash ? "warn" : "info", c.partyCrash ? "ไม่มีรถไปต่อ: ซินดิเคทตามทันที ต้องหาที่พักด้วยเท้า" : "รถยังใช้ได้ (ทิ้งไว้หลังโรงเตี๊ยม)"], [c.hookCut || c.tireShot, "info", "ศัตรูหนักลงมาก: คนที่ถอนตัวเหลือน้อย"]].filter((x) => x.length === 2 || x[0]).map((x) => x.length === 3 ? [x[1], x[2]] : x) },
    { id: "rest", time: "วันที่ 2 · ค่ำ", title: "จุดพักเชิงเนิน (โรงเตี๊ยมสาขา)",
      read: "เสียงปืนเงียบลงเบื้องหลัง คุณเลี้ยวเข้าซอยแคบที่มีป้ายไม้ \"โรงเตี๊ยมนายทหารผ่านศึก\" เหนือขึ้นไปบนเนินมีอาคารอิฐซีดยืนมืดในหมอกบางๆ",
      tips: ["มาโคร \"Chapter 2.6: จุดพักเชิงเนิน\" → ปุ่ม 1 มาถึงจุดพัก", "ไฮนซ์ลาตี้ที่นี่: กดมาโคร \"ไฮนซ์ลาตี้ (ส่งต่อ Perry)\" หลังปุ่ม 1 (เขาให้คำใบ้แผงตัดไฟ: Advantage ทอยแผงควบคุมครั้งแรกใน Ch3)", "เพอร์รี่เข้าตี้ที่นี่ (เอาธง later ออก แล้วกดปุ่ม 1 ซ้ำ) · มาโคร \"เพอร์รี่: ทอยล่ากลางคืน (ลับ)\" ก่อนนอน", "คนอื่นเห็นว่าเพอร์รี่หายไปครู่หนึ่ง ถ้า Passive Perception สูงพอ (ระบบแนะนำให้)"],
      checks: [["arrived", "ตี้มาถึงจุดพักแล้ว"], ["perryJoined", "เพอร์รี่เข้าตี้แล้ว"], ["huntRolled", "ทอยล่ากลางคืนแล้ว"], ["huntFail", "เพอร์รี่ทอยล่าไม่ผ่าน"], ["noticed", "มีผู้เล่นสังเกตเห็นเพอร์รี่หายไป"], ["hadarSkip", "ข้ามเพราะ Hadar กินแล้ววันนี้"]],
      cons: (c) => [[c.perryJoined ? "ok" : "info", c.perryJoined ? "เพอร์รี่อยู่ในตี้: ใช้ sheet ลับ (ข้อมูล DM เท่านั้น)" : "เพอร์รี่ยังไม่มา: เอาธง later ออกแล้วกดปุ่ม 1 ซ้ำ"], [c.huntFail ? "warn" : "info", c.huntFail ? "ล่าไม่ผ่าน: HP ลดเล็กน้อย/คราบเลือก/ความเย็นตกค้าง · เสี่ยง Exhaustion ถ้าหมดโอกาสกิน 3–4 วัน" : c.huntRolled ? "ล่าผ่าน ไม่มีร่องรอย" : "ยังไม่ทอย"], [c.noticed ? "warn" : "info", c.noticed ? "ผู้เล่นที่เห็นจะสงสัย: ใช้ฉากพูดคุยกับเพอร์รี่ (อย่าบังคับเปิดเผย)" : "ไม่มีใครสงสัย"]] },
    { id: "morning", time: "วันที่ 3 · เช้า", title: "พักยาว + สอดแนมโรงพยาบาล",
      read: "หมอกบางๆ ลอยเหนือเนิน จากหน้าต่างทางเดินเห็นหลังคาโรงพยาบาลอยู่ไกลขึ้นไป ควันจากปล่องลอยตรงเกินไป เหมือนไม่มีลมมาเลย",
      tips: ["ปุ่ม 2 \"ขึ้นเช้าวันที่ 3\" = พักยาว Dread −1 · สอดแนมตามตารางในสมุด \"จุดพักก่อน Chapter 3 (DM)\" หน้า 4", "ปุ่ม 3 \"ไปหน้าโรงพยาบาล\" เมื่อตัดสินใจทางเข้าแล้ว"],
      checks: [["longRest", "พักยาวแล้ว"], ["scoutPerc", "Perception DC 12: ยามหน้าประตู 1 คน/พยาบาลยิ้มค้าง"], ["scoutInv", "Investigation DC 13: รถผ้าซักรีดประตูข้าง 8 โมง"], ["scoutInsight", "Insight/Medicine DC 12: คนไข้ใหม่รับเข้าตอนเช้า"], ["asked", "ถามเจ้าของโรงเตี๊ยม"]],
      choice: ["entry3", "ตี้เลือกทางเข้าโรงพยาบาล", [["front", "ประตูหน้า (ทั้งตี้เป็นผู้ป่วย ตามใบส่งตัวจากโรงเตี๊ยม)"], ["forest", "อ้อมป่าไปหลังโรงพยาบาล"]]],
      cons: (c, ch) => [[c.scoutInv ? "ok" : "info", c.scoutInv ? "รู้เรื่องประตูข้างที่รถซักรีดมา: เป็นเบาะแสสำหรับทางอ้อมป่า" : "ยังไม่รู้เรื่องประตูข้าง"], [c.scoutInsight ? "ok" : "info", c.scoutInsight ? "รู้ว่าเข้าทางประตูหน้าเป็นผู้ป่วยได้ (ทั้งตี้ถูกฉีดยา: เซฟ WIS Disadvantage จนกว่าจะพัก)" : "ยังไม่รู้ช่องคนไข้"], [ch.entry3 === "front" ? "warn" : "ok", ch.entry3 === "front" ? "ประตูหน้า: ทั้งตี้เป็นผู้ป่วย ถูกฉีดยา (Disadvantage เซฟ WIS จนกว่าจะพัก)" : ch.entry3 === "forest" ? "อ้อมป่า: ไม่มีอุปสรรค เริ่มเข้าตึกจากด้านหลัง (ไป Chapter 3)" : "ยังไม่เลือกทางเข้า"]] }
  ] },
  "3": { title: "Chapter 3 · โรงพยาบาลทหารผ่านศึกเซนต์อัลดริก", phases: [
    { id: "entry", time: "วันที่ 3 · เช้า", title: "ทางเข้า",
      read: "ประตูไม้โอ๊กคู่เปิดออกพร้อมเสียงเอี๊ยด กลิ่นยาฆ่าเชื้อลอยปนกลิ่นเหล็กสนิม เสียงตุบๆ ดังมาจากใต้พื้นอย่างสม่ำเสมอ เหมือนหัวใจเต้นช้าๆ",
      tips: ["ฉาก \"Chapter 3: โรงพยาบาลทหารผ่านศึก (ชั้นล่าง)\" · ตี้เริ่มหน้าประตู (มาโคร จุดพัก ปุ่ม 3 ย้ายให้)", "ยามกะดึก 1 คน · ลงทะเบียนผู้ป่วย Deception DC 13 ต่อพยาบาล (Advantage ถ้ามีจดหมายรอสโซ/เครนหรือบัตรตำรวจ)", "ได้ยินเสียงหัวใจเต้นตุบที่ระเบียง: Perception DC 15"],
      checks: [["disguiseOk", "ลงทะเบียนผู้ป่วยผ่าน"], ["noisy", "ส่งเสียงดัง/ถูกจับได้"], ["guard", "ยามหน้าประตูถูกจัดการ"]],
      choice: ["how", "เข้าทางไหน", [["front", "ประตูหน้า (ผู้ป่วยทั้งตี้ ถูกฉีดยา)"], ["forest", "อ้อมป่า (หลังโรงพยาบาล)"]]],
      cons: (c, ch) => [[c.noisy ? "warn" : "ok", c.noisy ? "ผู้คุมทั้งตึกตื่น เครนเริ่มชาร์จเครื่อง นาฬิกา +1 (ทางลอบหายไป)" : "ผู้คุมไม่รู้ตัว ลอบเข้าได้"], [ch.how === "front" ? "warn" : "info", ch.how === "front" ? "ถูกฉีดยา: Disadvantage เซฟ WIS จนกว่าจะพักยาว" : "—"]] },
    { id: "ground", time: "วันที่ 3", title: "ชั้นล่าง: ล็อบบี้ · หอผู้ป่วย A · ห้องพยาบาล",
      read: "ทหารแปดคนนอนนิ่งบนเตียง ตาเปิดค้างจ้องเพดาน แขนทุกคนมีรอยเข็ม พยาบาลที่เคาน์เตอร์ยิ้มตลอดเวลา ไม่กะพริบตา",
      tips: ["หอผู้ป่วย A: สิบโททอมมี่ เรย์ มีสติ บอกทางลงใต้ดิน", "ห้องพยาบาล: เข็มกล่อมประสาท ×3, กุญแจห้องใต้ดินอยู่กับพยาบาลหัวหน้า", "สมุดเยี่ยมไข้: ชื่ออาเธอร์ เพนเดิลตัน มาเยี่ยม \"ผู้ป่วย 17\" ทุกเดือน", "ห้องช็อตไฟฟ้า: ถ้าถูกจับ 2d6 ฟ้าผ่าต่อรอบ หลุดด้วย Athletics DC 14"],
      checks: [["tommy", "คุยกับทอมมี่ เรย์"], ["tommyFreed", "ช่วยทอมมี่ออกมา"], ["syringe", "ได้เข็มกล่อมประสาท"], ["keyB", "ได้กุญแจห้องใต้ดิน"], ["guestBook", "เห็นสมุดเยี่ยมไข้ (อาเธอร์)"], ["caught", "ถูกจับ/ส่งห้องช็อตไฟฟ้า"], ["nurseFight", "สู้พยาบาลลัทธิ"]],
      cons: (c) => [[c.tommy ? "ok" : "info", c.tommy ? "ทอมมี่บอกทางลงใต้ดิน (ประตูลับหลังห้องเก็บของ) และบอกว่าเครนอยู่ข้างล่าง" : "ยังไม่รู้ทางลงใต้ดิน: ต้องหาเอง (Investigation DC 15)"], [c.tommyFreed ? "ok" : "info", c.tommyFreed ? "ทอมมี่เป็นพันธมิตรของตี้" : "—"], [c.keyB ? "ok" : "info", c.keyB ? "กุญแจ B: ห้องขังและบันไดใต้ดินเปิดได้" : "ไม่มีกุญแจ: Thieves' Tools DC 16"], [c.caught ? "warn" : "info", c.caught ? "ถูกจับ: ผู้คุมตื่น ต้องหาทางหลุดจากห้องช็อตไฟฟ้า" : "—"]] },
    { id: "clues", time: "วันที่ 3", title: "เบาะแส: เวชระเบียน · ห้อง ผอ.",
      read: "โหลดองชิ้นส่วนเต้นตุบเรียงเต็มผนัง พรมแดงปูทับพื้นไม้ที่ทำเสียงกลวง",
      tips: ["ห้องเวชระเบียน: ตู้เอกสาร Investigation DC 12 → รายชื่อแบตเตอรี่สังเวย", "ห้อง ผอ.: ช่องลับใต้พรม Perception DC 14 → บันทึกของ นพ. เครน + $35 (เบาะแสไป Chapter 4)", "หอผู้ป่วย B: ผู้คุมกลายพันธุ์ 1 ตัว Stealth DC 13 ผ่านไปได้"],
      checks: [["list", "ได้รายชื่อแบตเตอรี่สังเวย"], ["notes", "ได้บันทึกของ นพ. เครน"], ["fearJar", "ใครทอยหวาดผวาไม่ผ่านที่โหลดอวัยวะ"], ["wardB", "ผ่านหอผู้ป่วย B (Stealth)"], ["wardBFight", "สู้ผู้คุมกลายพันธุ์"], ["heinzSig", "ไฮนซ์จำลายเซ็นช่างเครื่องได้"]],
      cons: (c) => [[c.notes ? "ok" : "warn", c.notes ? "รู้ว่าพลังงานไหลไปเสา Magitech ใต้อาร์คเคนผ่านเหมืองร้างและท่อระบายน้ำ (ต่อ Chapter 4)" : "ไม่รู้ทางไป Chapter 4: เครนใต้ดินจะบอกเองก่อนตาย/มีบันทึกในเครื่อง"], [c.list ? "ok" : "info", c.list ? "รู้ว่าทหารคนไหนเป็นแบตเตอรี่ (ช่วยตัดสินใจช่วยก่อน)" : "ไม่รู้รายชื่อ"], [c.heinzSig ? "ok" : "info", c.heinzSig ? "ไฮนซ์รู้ว่าเครื่องออกแบบโดยเพื่อนร่วมงานเก่า (ผูกเข้าเรื่องไฮนซ์/Perry)" : "—"]] },
    { id: "basement", time: "วันที่ 3", title: "ใต้ดิน: ทางเดินไม่สิ้นสุด · ห้องขัง · หอผู้ป่วยเนื้อ",
      read: "บันไดเหล็กลงไปไม่รู้จบ อากาศชื้นเหมือนลมหายใจ ผนังเต้นเป็นจังหวะเดียวกับหัวใจที่ได้ยินมาตลอด",
      tips: ["ทางเดินไม่สิ้นสุด: หวาดผวา DC 16 · หันหลังกลับเซฟ WIS DC 13", "ห้องขัง: ทหารมีสติ 4 คน ลูกกรง Athletics DC 15 / กุญแจ B · ปล่อยแล้วปลดทหารจากเครื่องอัตโนมัติ 1 คนต่อรอบ", "หอผู้ป่วยเนื้อ: พื้นที่ลำบาก ผนังจับ (เซฟ STR DC 12) · ผู้คุมฟื้น 5 HP ต่อรอบ"],
      checks: [["fear16", "ผ่านทางเดินไม่สิ้นสุด"], ["backed", "ใครหันหลังกลับถูกดึงกลับต้นทาง"], ["cells", "ปล่อยทหารในห้องขัง"], ["restrained", "ใครติดผนัง (Restrained)"], ["orderly", "สู้ผู้คุมกลายพันธุ์"]],
      cons: (c) => [[c.cells ? "ok" : "info", c.cells ? "ทหาร 4 คนช่วยปลดแบตเตอรี่ 1 คนต่อรอบ ตอนสู้กับเครน" : "ปลดแบตเตอรี่เองเท่านั้น (ดูวิธีปลดในชีทเครื่อง)"], [c.fear16 ? "ok" : "warn", c.fear16 ? "ตี้ผ่านทางเดิน" : "ยังไม่ผ่านทางเดิน: ติดอยู่ที่ต้นทาง/Dread +1"]] },
    { id: "boss", time: "วันที่ 3", title: "นพ. เครน และเครื่องแบตเตอรี่สังเวย",
      read: "เครื่องจักรวงกลมหมุนช้าๆ เก้าอี้หกตัวเรียงรอบ ทหารต่อสายครบทุกคน กลางห้อง นพ. กาเบรียล เครนยืนยิ้มบางๆ \"ผมไม่ได้ฆ่าพวกเขาหรอก ผมแค่ให้พวกเขามีความหมาย\"",
      tips: ["แผงควบคุม: Arcana DC 15 (1 Action) ตัดพลังเครื่อง 1 รอบ (ครั้งแรกได้ Advantage เพราะคำใบ้ของไฮนซ์) · ทำสำเร็จ 3 ครั้ง เครื่องดับถาวร", "เครนมีไม้เท้าบิดพื้นที่ (Misty Step 1 ครั้งต่อพัก)", "ถ้าบุกเข้าไป: เครนชาร์จเครื่องแล้ว นาฬิกา +1"],
      checks: [["panel1", "ตัดพลังเครื่อง ครั้งที่ 1"], ["panel2", "ครั้งที่ 2"], ["panel3", "ครั้งที่ 3 (เครื่องดับถาวร)"], ["released", "ปลดทหารครบ 6 คน"], ["craneDead", "เครนตาย"], ["craneCaptured", "จับเครนไว้"], ["cane", "ได้ไม้เท้าบิดพื้นที่"], ["machineLeft", "ปล่อยเครื่องไว้ (ฆ่าเครนอย่างเดียว)"]],
      choice: ["outcome", "ผลจบบท", [["saved", "ช่วยทหารและหยุดเครื่องกลางคัน (นาฬิกา −1)"], ["killed", "ฆ่าเครนแต่ปล่อยเครื่อง (นาฬิกา +1)"], ["failed", "ล้มเหลว/หนี (นาฬิกา +2 · รุ่งเช้าหมอกเขียวลอยจากท่อระบายน้ำ)"]]],
      cons: (c, ch) => [[ch.outcome === "saved" ? "ok" : ch.outcome === "failed" ? "warn" : "info", ch.outcome === "saved" ? "นาฬิกา −1 · ทหารที่ปลดอยู่เป็นพันธมิตรของตี้" : ch.outcome === "killed" ? "นาฬิกา +1 · เครื่องยังชาร์จอยู่" : ch.outcome === "failed" ? "นาฬิกา +2 · Chapter 4 เริ่มด้วยหมอกเขียวเต็มเมือง" : "ยังไม่ระบุผลจบบท"], [c.cane ? "info" : "info", c.cane ? "ไม้เท้า: Uncommon ต้อง Attune · ได้ยินเสียงคลื่นทุกครั้งที่ใช้" : "—"], [c.panel3 ? "ok" : "info", c.panel3 ? "เครื่องดับถาวร: ปลดแบตเตอรี่ปลอดภัย" : "—"]].filter((x) => x[1] !== "—") },
    { id: "end", time: "จบบท", title: "สรุป → Chapter 4",
      read: "", tips: ["ให้ XP · เลเวลอัพเป็น 5 (มาโคร \"เลเวลอัพ\")", "ถ้ามี c3-notes: ผู้เล่นรู้ทางไป Chapter 4 (เหมืองร้าง/ท่อระบายน้ำ)", "รุ่งเช้าหมอกเขียวลอยจากท่อระบายน้ำ (ถ้าล้มเหลว)"],
      checks: [["levelUp5", "เลเวลอัพเป็น 5"], ["notesKept", "ตี้ถือบันทึกเครน"], ["tommyAlly", "ทอมมี่ติดตามตี้"]],
      cons: (c) => [[c.notesKept ? "ok" : "warn", c.notesKept ? "ไป Chapter 4 รู้ทาง: ท่อระบายน้ำ (เร็ว/ซุ่ม) หรือเหมืองร้าง (ช้า/ได้ไดนาไมต์)" : "ไม่รู้ทาง: ให้ทอมมี่ หรือ C.A.A.M. บอกแทน"]] }
  ] },
  "4": { title: "Chapter 4 · ห้วงนิทราใต้อาร์คเคน", phases: [
    { id: "descent", time: "วันที่ 4", title: "ทางลง: ท่อระบายน้ำ / เหมืองร้าง",
      read: "หมอกเขียวพิษปกคลุมถนน สาวกในชุดขาวเดินเกลื่อน เงียบเกินไป เหมือนทุกคนกำลังฟังเสียงเดียวกันอยู่ใต้ดิน",
      tips: ["ท่อระบายน้ำ: เร็ว แต่สาวกซุ่มทุกทางแยก · น้ำเชี่ยว Athletics DC 13 · หมอก CON DC 12 ทุก 10 นาที (1d6 พิษ)", "เหมืองร้าง: ช้ากว่า แต่เจอไดนาไมต์ 6 แท่ง หน้ากากกันหมอก 3 อัน และเครื่องจักรไอน้ำ", "ฉาก \"Chapter 4: ใต้เมืองอาร์คเคน (รอยแยก)\" · เพลง abyss-horror"],
      checks: [["fogSave", "ทอยเซฟหมอกพิษ"], ["maskTaken", "ได้หน้ากากกันหมอก"], ["dynamiteTaken", "ได้ไดนาไมต์"], ["ambushed", "ถูกสาวกซุ่ม"], ["drifted", "ใครถูกน้ำพัด"]],
      choice: ["route", "ตี้ลงทางไหน", [["sewer", "ท่อระบายน้ำ (เร็ว ซุ่มเยอะ)"], ["mine", "เหมืองร้าง (ช้า ได้ของ)"]]],
      cons: (c, ch) => [[ch.route === "mine" ? "ok" : "info", ch.route === "mine" ? "ได้ไดนาไมต์ หน้ากาก และเครื่องจักรไอน้ำ: ได้ทั้งสองวิธีปิดรอยแยก" : ch.route === "sewer" ? "เร็วกว่า แต่ยังไม่มีไดนาไมต์ ต้องหาเพิ่ม" : "ยังไม่เลือกทาง"], [c.maskTaken ? "ok" : "info", c.maskTaken ? "หน้ากาก: ไม่ต้องเซฟหมอกพิษ Advantage CON จากพิษ" : "—"]].filter((x) => x[1] !== "—") },
    { id: "prep", time: "วันที่ 4", title: "เตรียมปิดรอยแยก: ไดนาไมต์ หรือ ไอน้ำ",
      read: "ลังไดนาไมต์เก่าๆ เรียงเป็นแถว หม้อต้มไอน้ำสนิมเขรอะต่อท่อไปทางถ้ำ ใครบางคนสั่งไว้นานแล้วว่า \"ถ้าถึงวันนั้น\"",
      tips: ["ไดนาไมต์ 6 แท่ง: เก่าแต่ใช้ได้ (ทอย d6 ได้ 1 = ด้าน)", "เครื่องจักรไอน้ำ: จุดไฟหม้อต้ม 2 Action รอ 1 รอบให้แรงดันขึ้น · วาล์ว 3 ตัว Athletics DC 14 ตัวละ 1 Action", "ผู้เล่นต้องรู้ว่า Herald ฆ่าด้วยเวทไม่ได้ ต้องใช้กลไกในฉาก"],
      checks: [["dudFound", "ไดนาไมต์ด้านอยู่"], ["boilerLit", "จุดหม้อต้มแล้ว"], ["valves", "เปิดวาล์วแล้ว (จำนวน 1–3 ในแชท)"], ["knowsHerald", "ตี้รู้ว่า Herald ฆ่าด้วยเวทไม่ได้"]],
      cons: (c) => [[c.knowsHerald ? "ok" : "warn", c.knowsHerald ? "ตี้วางแผนใช้กลไกได้" : "ยังไม่รู้จุดอ่อน Herald: ให้ Arcana/Religion DC 15 หรือบันทึกเครนบอก"], [c.boilerLit ? "ok" : "info", c.boilerLit ? "ทางไอน้ำพร้อม (ปิดได้ นาฬิกา −1 แต่ Cthulhu รู้ตัว)" : "—"]].filter((x) => x[1] !== "—") },
    { id: "rift", time: "วันที่ 4 · ถ้ำรอยแยก", title: "รอยแยก · นักบวช · Herald",
      read: "รอยแยกเรืองเขียวหายใจเข้าออก เสา Magitech สี่ต้นส่งเสียงฮัม หมอกรวมตัวเป็นร่างที่ยังไม่ตัดสินใจว่าเป็นอะไร",
      tips: ["Herald โผล่รอบที่ 3 (เร็วขึ้นถ้านักบวชสวด) · หนวด 3 เส้นซ่อนอยู่", "เสา: AC 15 HP 25 หรือไดนาไมต์ที่วางติด · พังครบ 4 ต้น = รอยแยกปิด", "วาล์วไอน้ำ 3 ตัว (ริมผนังตะวันออก) อัดรอยแยก", "เพลง boss ใช้ combat/abyss-horror ตามฉาก"],
      checks: [["priest", "จัดการนักบวชที่แท่นบูชา"], ["pillars", "เสาพังกี่ต้น (ระบุในแชท)"], ["heraldOut", "Herald โผล่แล้ว"], ["tentacleCut", "ตัดหนวด"], ["shardTaken", "เก็บเศษหินจากรอยแยก"], ["partyDown", "ตี้ล้มระหว่างสู้"]],
      choice: ["ending", "จบแคมเปญแบบไหน", [["dynamite", "ระเบิดเครื่องด้วยไดนาไมต์ (นาฬิกา −2)"], ["steam", "อัดไอน้ำปิดรอยแยก (นาฬิกา −1)"], ["fail", "ล้มเหลว (นาฬิกา +3)"]]],
      cons: (c, ch) => [[ch.ending === "dynamite" ? "ok" : ch.ending === "steam" ? "ok" : ch.ending === "fail" ? "warn" : "info", ch.ending === "dynamite" ? "นาฬิกา −2 · แผ่นดินไหวใต้เมือง หมอกพิษจางหายในชั่วข้ามคืน" : ch.ending === "steam" ? "นาฬิกา −1 · ปิดได้ แต่ Cthulhu รู้ว่ามนุษย์สู้ได้ (ทางไปภาคต่อ)" : ch.ending === "fail" ? "นาฬิกา +3 · วันสิ้นโลกมาถึงอาร์คเคน" : "ยังไม่ระบุตอนจบ"], [c.shardTaken ? "info" : "info", c.shardTaken ? "เศษหินจากรอยแยก: C.A.A.M. ขอเก็บ หรือขายฟินช์ $200 (ฟินช์จะหายตัวไป 1 สัปดาห์)" : "—"]].filter((x) => x[1] !== "—") },
    { id: "end", time: "จบแคมเปญ", title: "สรุป → เดินทางต่อ (เรือ)",
      read: "", tips: ["ถ้านาฬิกาห้วงนิทราถึง 12 ก่อนจบบท: Herald ไม่ใช่ร่างจำแลงอีกต่อไป", "เดินทางต่อด้วยเรือแมรี่ แอนน์ (ถ้ากัปตันเอซราเป็นพันธมิตร) · ถามผู้เล่น Mozxorion ก่อน", "ให้ XP ตามที่ตกลง"],
      checks: [["levelUp", "ให้ XP/เลเวลอัพแล้ว"], ["shipReady", "ตกลงเรือเดินทางต่อแล้ว"], ["mozxorion", "Mozxorion ยืนยันเรือ"]],
      cons: (c, ch, all) => [[all["4"]?.choice?.ending ? "ok" : "info", "ผลจบแคมเปญดูในหน้ารอยแยก"], [c.shipReady ? "ok" : "info", c.shipReady ? "ออกเรือต่อ (ออกแบบ Chapter 5 เมื่อพร้อม)" : "ยังไม่ตกลงเส้นทางต่อ"]] }
  ] }
};

const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));
const all = () => foundry.utils.deepClone(game.settings.get(MOD, KEY) ?? {}) ?? {};
const st = (ch) => { const a = all(); a[ch] ??= { phase: 0, checks: {}, choice: {} }; a[ch].checks ??= {}; a[ch].choice ??= {}; a[ch].phase ??= 0; return a[ch]; };
async function save(ch, s) { const a = all(); a[ch] = s; await game.settings.set(MOD, KEY, a); }
export function registerChTracker() { game.settings.register(MOD, KEY, { scope: "world", config: false, type: Object, default: {} }); }

const CSS = `
.ark-tr{display:grid;grid-template-columns:200px 1fr;gap:10px;height:100%;font-size:13px}
.ark-tr .side{overflow:auto;border-right:1px solid #9A6B2C55;padding-right:6px}
.ark-tr .ph{display:block;width:100%;text-align:left;padding:5px 7px;margin:0 0 3px;border:1px solid transparent;border-radius:4px;background:none;cursor:pointer;color:inherit;line-height:1.3}
.ark-tr .ph small{display:block;opacity:.65;font-size:11px}
.ark-tr .ph,.ark-tr .nav button{height:auto !important;min-height:0 !important;max-height:none !important;white-space:normal !important;overflow:visible !important;align-items:flex-start;flex-direction:column;justify-content:flex-start;gap:0}
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

const consOf = (ch, p, s) => { try { return (p.cons?.(s.checks, s.choice, all()) ?? []).filter((x) => x && x[1]); } catch (e) { console.warn(MOD, "chTracker cons", e); return []; } };

function html(ch) {
  const C = CHAPTERS[ch], s = st(ch), p = C.phases[s.phase] ?? C.phases[0];
  const side = C.phases.map((q, i) => `<button class="ph ${i === s.phase ? "on" : i < s.phase ? "done" : ""}" data-go="${i}">${esc(q.title)}<small>${esc(q.time)}</small></button>`).join("");
  const checks = (p.checks ?? []).map(([id, label]) => `<label><input type="checkbox" data-check="${id}" ${s.checks[id] ? "checked" : ""}> <span>${esc(label)}</span></label>`).join("");
  const choice = p.choice ? `<p><b>${esc(p.choice[1])}</b></p><select data-choice="${p.choice[0]}"><option value="">— ยังไม่เลือก —</option>${p.choice[2].map(([v, t]) => `<option value="${v}" ${s.choice[p.choice[0]] === v ? "selected" : ""}>${esc(t)}</option>`).join("")}</select>` : "";
  const cons = consOf(ch, p, s).map(([k, t]) => `<div class="${k}">${esc(t)}</div>`).join("") || `<div class="info">ติ๊กสิ่งที่เกิดขึ้น แล้วผลจะขึ้นตรงนี้</div>`;
  return `<style>${CSS}</style><div class="ark-tr"><div class="side">${side}</div><div class="main">
    <h2>${esc(p.title)}</h2><div class="time">🕰 ${esc(p.time)}</div>
    ${p.read ? `<div class="read">${esc(p.read)}</div>` : ""}
    ${p.tips?.length ? `<ul class="tips">${p.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}
    <div class="checks">${checks}${choice}</div>
    <div class="cons"><b>ผลที่ตามมา</b>${cons}</div>
    <div class="nav"><button data-nav="-1">◀ ก่อนหน้า</button>${p.read ? `<button data-read="1">📢 อ่านให้ผู้เล่น (แชท)</button>` : ""}<button data-nav="1">ถัดไป ▶</button></div>
    <div class="nav"><button data-sum="1">📝 สรุปบทนี้ (แชท DM + สมุดสรุป)</button><button data-reset="1">ล้างทั้งหมด</button></div>
  </div></div>`;
}

// plain-text summary of what happened so far in this chapter (for the session log)
function summary(ch) {
  const C = CHAPTERS[ch], s = st(ch);
  const rows = [];
  for (const p of C.phases) {
    const done = (p.checks ?? []).filter(([id]) => s.checks[id]).map(([, l]) => l);
    const sel = p.choice && s.choice[p.choice[0]] ? [`${p.choice[1]}: ${p.choice[2].find(([v]) => v === s.choice[p.choice[0]])?.[1] ?? s.choice[p.choice[0]]}`] : [];
    const tmp = { ...s };
    const cons = consOf(ch, p, tmp).filter(([k]) => k !== "info").map(([, t]) => t);
    if (done.length || sel.length || cons.length) rows.push({ title: `${p.title} (${p.time})`, done, sel, cons });
  }
  return rows;
}
const sumHtml = (ch) => {
  const rows = summary(ch);
  return `<h2>${esc(CHAPTERS[ch].title)} · สรุป</h2>` + (rows.map((r) => `<h3>${esc(r.title)}</h3>${[...r.sel, ...r.done].length ? `<ul>${[...r.sel, ...r.done].map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}${r.cons.length ? `<p><b>ผลที่ตามมา:</b></p><ul>${r.cons.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : ""}`).join("") || "<p>ยังไม่ได้ติ๊กอะไร</p>");
};
async function makeSummary(ch) {
  const body = sumHtml(ch);
  await ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card">${body}</div>` });
  const name = "สรุปเซสชัน (ตัวช่วย DM)", pageName = `สรุป ${CHAPTERS[ch].title}`;
  let j = game.journal.getName(name);
  const stamp = new Date().toLocaleString("th-TH");
  const content = `<p><i>บันทึกเมื่อ ${esc(stamp)}</i></p>${body}`;
  if (!j) j = await JournalEntry.create({ name, ownership: { default: 0 }, pages: [{ name: pageName, type: "text", text: { content, format: 1 } }] });
  else { const pg = j.pages.getName(pageName); if (pg) await pg.update({ "text.content": content }); else await j.createEmbeddedDocuments("JournalEntryPage", [{ name: pageName, type: "text", text: { content, format: 1 } }]); }
  ui.notifications.info(`สรุป ${CHAPTERS[ch].title} ส่งแชท DM และบันทึกใน "${name}" แล้ว`);
}

const APPS = {};
export function openChTracker(ch = "2") {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  ch = String(ch);
  if (!CHAPTERS[ch]) return ui.notifications.warn("มีตัวช่วย Chapter 2, 25 (ไล่ล่า+จุดพัก), 3, 4");
  const AppV2 = foundry.applications?.api?.ApplicationV2;
  if (!AppV2) return ui.notifications.error("ต้องใช้ Foundry v12 ขึ้นไป");
  if (!APPS[ch]) {
    const refresh = () => APPS[ch]?.render();
    class ChTracker extends AppV2 {
      static DEFAULT_OPTIONS = { id: `arkane-tracker-${ch}`, window: { title: `${CHAPTERS[ch].title} · ตัวช่วย DM`, resizable: true, icon: "fas fa-clock" }, position: { width: 780, height: 640 } };
      async _renderHTML() { return html(ch); }
      _replaceHTML(result, content) {
        content.innerHTML = result; content.style.overflow = "hidden";
        const root = content.querySelector(".ark-tr");
        root?.addEventListener("click", async (ev) => {
          const t = ev.target.closest("[data-go],[data-nav],[data-read],[data-reset],[data-sum]"); if (!t) return;
          const s = st(ch), n = CHAPTERS[ch].phases.length;
          if (t.dataset.go) s.phase = Number(t.dataset.go);
          if (t.dataset.nav) s.phase = Math.max(0, Math.min(n - 1, s.phase + Number(t.dataset.nav)));
          if (t.dataset.read) { const p = CHAPTERS[ch].phases[s.phase]; return ChatMessage.create({ content: `<div class="rw-card"><div class="rw-title">${esc(p.title)} · ${esc(p.time)}</div><p><i>${esc(p.read)}</i></p></div>` }); }
          if (t.dataset.sum) return makeSummary(ch);
          if (t.dataset.reset) { const D = foundry.applications?.api?.DialogV2; const ok = D ? await D.confirm({ window: { title: "ล้างตัวช่วย DM" }, content: "<p>ล้างทุกช่องที่ติ๊กไว้ของบทนี้ และกลับไปเริ่มบท?</p>" }) : true; if (!ok) return; await save(ch, { phase: 0, checks: {}, choice: {} }); return refresh(); }
          await save(ch, s); refresh();
        });
        root?.addEventListener("change", async (ev) => {
          const el = ev.target, s = st(ch);
          if (el.dataset.check) s.checks[el.dataset.check] = el.checked;
          if (el.dataset.choice) s.choice[el.dataset.choice] = el.value;
          await save(ch, s); refresh();
        });
      }
    }
    APPS[ch] = new ChTracker();
  }
  APPS[ch].render({ force: true });
  return APPS[ch];
}
