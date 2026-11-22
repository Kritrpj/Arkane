// Nexus-event timeline for the Arkane 1920s campaign (DM only)
const MOD = "arkane-1920s";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const gmIds = () => game.users.filter((u) => u.isGM).map((u) => u.id);

/* ---------- example data: Chapter 1 (ideas, edit freely) ---------- */
export const EXAMPLE = {
 "version": 1,
 "events": [
  {
   "id": "c1-death",
   "chapter": 1,
   "day": 1,
   "time": "evening",
   "type": "nexus",
   "title": "อาเธอร์ เพนเดิลตันกระอักเลือดดำ",
   "desc": "กลางบาร์ The Rusty Wand สิบเอก อาเธอร์ เพนเดิลตัน ล้มลง ของเหลวสีดำไหลออกจากปาก ในซับในเสื้อมี \"ตั๋วรับของโกดัง 4\" ซ่อนอยู่ อีกราว 10 นาทีเจ้าหน้าที่ C.A.A.M. จะบุกทลายบาร์",
   "requires": [],
   "mode": "all",
   "options": [
    {
     "key": "search",
     "label": "ค้นศพทันที",
     "clock": 0,
     "result": "เจอตั๋วรับของโกดัง 4 และหลอดยาเปล่ากลิ่นคาวปลา (ยาวิปลาส) ทุกคนที่เห็นเลือดดำขยับเองทอยตรวจความหวาดผวา ระดับรบกวนจิตใจ",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "aid",
     "label": "พยายามช่วยชีวิต",
     "clock": 0,
     "result": "อาเธอร์กระซิบ \"โกดัง 4... อย่าให้พวกมันเปิด\" ก่อนตาย ผู้ช่วยได้ตั๋วจากมือเขา แต่ทอยตรวจความหวาดผวา ระดับน่าสะพรึง เพราะเห็นเลือดดำคลานขึ้นแขน",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "back",
     "label": "ถอยออกห่าง",
     "clock": 0,
     "result": "ลูกกระจ๊อกมาเฟียข้างบาร์ฉวยตั๋วจากศพแล้วหายไปในฝูงคน ผู้เล่นเห็นแค่รอยสักเหรียญจมน้ำที่ข้อมือมัน",
     "news": "",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c1-bartender",
   "chapter": 1,
   "day": 1,
   "time": "evening",
   "type": "nexus",
   "title": "ถามบาร์เทนเดอร์",
   "desc": "เกรกอร์ บาร์เทนเดอร์ร่างอ้วน รู้จักอาเธอร์ดี เขาจะคุยเฉพาะก่อนการบุก",
   "requires": [
    "c1-death"
   ],
   "mode": "all",
   "options": [
    {
     "key": "ask",
     "label": "ถามดีๆ",
     "clock": 0,
     "result": "อาเธอร์มาที่นี่ทุกคืนเพื่อรับเงินจากชายถือกระเป๋าแพทย์ และช่วงนี้ซื้อ \"ยาวิปลาส\" จากลูกน้องซินดิเคทเหรียญจมน้ำ",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "threat",
     "label": "ข่มขู่ / ติดสินบน",
     "clock": 0,
     "result": "ได้ข้อมูลเดียวกัน แต่เกรกอร์แจ้งซินดิเคทว่ามีคนถามเรื่องอาเธอร์",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "skip",
     "label": "ไม่ถาม / ปล่อยผ่าน",
     "clock": 0,
     "result": "เกรกอร์ถูกจับไปพร้อมการบุก และเบาะแสเรื่องชายถือกระเป๋าแพทย์หายไป",
     "news": "",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c1-raid",
   "chapter": 1,
   "day": 1,
   "time": "evening",
   "type": "nexus",
   "title": "C.A.A.M. บุกทลายบาร์",
   "desc": "ชายในชุดตำรวจที่สวมถุงมือยางและหน้ากากกรองอากาศพังประตูเข้ามา เป้าหมายแรกคือศพของอาเธอร์ ไม่ใช่คนในบาร์",
   "requires": [
    "c1-death"
   ],
   "mode": "all",
   "options": [
    {
     "key": "escape",
     "label": "หนีทางลับใต้ห้องเก็บเหล้า",
     "clock": 0,
     "result": "หนีพ้นพร้อมของที่ติดตัว แต่ทิ้งรอยเท้าไว้ในฝุ่น",
     "news": "อาร์คเคนเดลี่: ตำรวจทลายบาร์เถื่อนย่านท่าเรือ ยึดสุราเถื่อนได้จำนวนมาก \"ไม่มีผู้เสียชีวิต\"",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "caught",
     "label": "ถูกจับ",
     "clock": 0,
     "result": "ถูกพาขึ้นรถตู้ไม่มีตรา ของทุกอย่างถูกค้น ถ้ามีตั๋ว ให้ทอย Sleight of Hand DC 13 เพื่อซ่อนไว้",
     "news": "อาร์คเคนเดลี่: ตำรวจทลายบาร์เถื่อนย่านท่าเรือ ยึดสุราเถื่อนได้จำนวนมาก \"ไม่มีผู้เสียชีวิต\"",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "fight",
     "label": "สู้ฝ่าออกไป",
     "clock": 0,
     "result": "หนีออกมาได้แต่ทำเจ้าหน้าที่บาดเจ็บ ตำรวจทั้งเมืองได้รูปพรรณของผู้เล่น ใช้เวทในเมืองแล้วตำรวจมาทันที",
     "news": "อาร์คเคนเดลี่: กลุ่มอันธพาลทำร้ายเจ้าหน้าที่ระหว่างทลายบาร์เถื่อน ตำรวจเร่งล่าตัว",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c1-thief",
   "chapter": 1,
   "day": 1,
   "time": "night",
   "type": "nexus",
   "title": "ตามลูกกระจ๊อกที่ฉกตั๋ว",
   "desc": "ตามรอยสักเหรียญจมน้ำไปตามตรอกท่าเรือ มันกำลังจะส่งตั๋วให้หัวหน้า",
   "requires": [
    "c1-death:back"
   ],
   "mode": "all",
   "options": [
    {
     "key": "catch",
     "label": "ตามทัน",
     "clock": 0,
     "result": "แย่งตั๋วคืนได้ มันขู่ว่า \"พี่ใหญ่จะมาเอาคืนพรุ่งนี้\" แล้วหนีไป",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "lose",
     "label": "คลาดกัน",
     "clock": 0,
     "result": "ตั๋วไปถึงมือหัวหน้าลูกกระจ๊อกแล้ว ต้องบุกรังมันพรุ่งนี้",
     "news": "",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c1-interrog",
   "chapter": 1,
   "day": 2,
   "time": "morning",
   "type": "nexus",
   "title": "ห้องสอบสวนของ C.A.A.M.",
   "desc": "ห้องใต้ดินไร้หน้าต่าง เจ้าหน้าที่ถามแค่เรื่องเดียว: อาเธอร์พูดอะไรก่อนตาย",
   "requires": [
    "c1-raid:caught"
   ],
   "mode": "all",
   "options": [
    {
     "key": "cooperate",
     "label": "ร่วมมือ",
     "clock": 0,
     "result": "ถูกปล่อยตัวตอนสาย เจ้าหน้าที่หนุ่มแอบกระซิบว่า \"อย่าไปท่าเรือ\" (ได้ NPC ที่อาจเป็นพันธมิตร)",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "silent",
     "label": "ปิดปาก",
     "clock": 0,
     "result": "ถูกปล่อยตัวตอนเที่ยงพร้อมคนสะกดรอยตาม ต้องสลัดให้หลุดก่อนทำอะไรต่อ",
     "news": "",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c1-drug",
   "chapter": 1,
   "day": 2,
   "time": "afternoon",
   "type": "nexus",
   "title": "ตามหาที่มาของยาวิปลาส",
   "desc": "ยาเม็ดสีเขียวขุ่นกลิ่นคาวปลา ขายในหมู่ทหารผ่านศึกว่า \"ช่วยให้ลืมสนามเพลาะ\"",
   "requires": [
    "c1-death"
   ],
   "mode": "all",
   "options": [
    {
     "key": "dealer",
     "label": "ตามหาพ่อค้ายา",
     "clock": 0,
     "result": "รู้ว่ายามาจากโกดังท่าเรือของซินดิเคทเหรียญจมน้ำ และคนเสพบางคนเริ่มมีเกล็ดขึ้นที่คอ",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "vets",
     "label": "คุยกับทหารผ่านศึก",
     "clock": 0,
     "result": "ได้ยินว่าทหารที่เสพหนักถูกส่งไป \"รักษา\" ที่โรงพยาบาลทหารผ่านศึกแล้วไม่กลับมา (ปูทางบทที่ 3)",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "skip",
     "label": "ไม่สืบเรื่องนี้",
     "clock": 0,
     "result": "ไม่ได้ข้อมูลเพิ่ม เข้าบทที่ 2 โดยไม่รู้ว่าศัตรูเป็นอะไร",
     "news": "",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c1-ambush",
   "chapter": 1,
   "day": 2,
   "time": "evening",
   "type": "nexus",
   "title": "ลูกกระจ๊อกเสพยาวิปลาสบุกมาเอาตั๋ว (บอส)",
   "desc": "หัวหน้าลูกกระจ๊อกเสพยาจนกลายพันธุ์เบื้องต้น ผิวลอกเป็นเกล็ด ข้อต่อบิดผิดทาง มันบุกมาหาผู้เล่นที่ถือตั๋ว",
   "requires": [
    "c1-death:search",
    "c1-death:aid",
    "c1-thief:catch"
   ],
   "mode": "any",
   "options": [
    {
     "key": "win",
     "label": "ชนะ",
     "clock": 0,
     "result": "ได้ตัวอย่างยาวิปลาสและรู้รหัสผ่านโกดัง 4 จากศพมัน",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "capture",
     "label": "จับเป็น",
     "clock": 0,
     "result": "สอบปากคำได้ว่าของในโกดังจะถูกส่งออกคืนพรุ่งนี้ ผู้เล่นได้เปรียบตอนเข้าบทที่ 2",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "lose",
     "label": "แพ้ / หนี",
     "clock": 1,
     "result": "ตั๋วถูกชิงไป ซินดิเคทรู้หน้าผู้เล่นแล้ว บทที่ 2 จะยากขึ้น",
     "news": "",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c1-den",
   "chapter": 1,
   "day": 2,
   "time": "evening",
   "type": "nexus",
   "title": "บุกรังลูกกระจ๊อกเพื่อเอาตั๋วคืน (บอส)",
   "desc": "รังใต้ร้านซ่อมเรือร้าง หัวหน้าลูกกระจ๊อกเสพยาวิปลาสจนกลายพันธุ์เบื้องต้น",
   "requires": [
    "c1-thief:lose"
   ],
   "mode": "all",
   "options": [
    {
     "key": "win",
     "label": "ชนะ",
     "clock": 0,
     "result": "ได้ตั๋วคืนพร้อมตัวอย่างยาวิปลาส",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "lose",
     "label": "แพ้ / หนี",
     "clock": 1,
     "result": "ไม่ได้ตั๋ว ต้องหาทางเข้าโกดัง 4 แบบอื่นในบทที่ 2",
     "news": "",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c1-end",
   "chapter": 1,
   "day": 2,
   "time": "night",
   "type": "fixed",
   "title": "จบ Chapter 1: เสียงกระซิบในบาร์ลับ",
   "desc": "ผู้เล่นขึ้นเลเวล 2 (Milestone) สรุปว่าใครถือตั๋ว และใครรู้หน้าผู้เล่นบ้าง",
   "requires": [
    "c1-ambush",
    "c1-den"
   ],
   "mode": "any",
   "options": []
  },
  {
   "id": "c2-warehouse",
   "chapter": 2,
   "day": 1,
   "time": "night",
   "type": "nexus",
   "title": "โกดังหมายเลข 4",
   "desc": "เขตท่าเรือของซินดิเคทเหรียญจมน้ำ ในตู้คอนเทนเนอร์มีชิ้นส่วนเครื่องจักร Magitech โบราณที่เต้นตุบๆ ราวกับมีชีวิต และจดหมายสั่งการจากโรงพยาบาลทหาร",
   "requires": [
    "c1-end"
   ],
   "mode": "all",
   "options": [
    {
     "key": "ticket",
     "label": "ใช้ตั๋วรับของเข้าไปตรงๆ",
     "clock": 0,
     "result": "เข้าได้เงียบๆ แต่ยามจำได้ว่าตั๋วนี้เป็นของคนตาย มีเวลาไม่มากก่อนถูกล้อม",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "sneak",
     "label": "แอบเข้าทางน้ำ",
     "clock": 0,
     "result": "เจอคนงานที่มีเหงือกที่คอทำงานใต้ท่าเรือ (ทอยตรวจความหวาดผวา ระดับน่าสะพรึง)",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "assault",
     "label": "บุกยิง",
     "clock": 1,
     "result": "เปิดฉากปะทะ ซินดิเคทส่งตู้คอนเทนเนอร์ออกทางเรือก่อนผู้เล่นไปถึง",
     "news": "อาร์คเคนเดลี่: ดวลปืนกลางเขตท่าเรือ ทางการชี้ \"ความขัดแย้งระหว่างแก๊ง\"",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c2-boss",
   "chapter": 2,
   "day": 1,
   "time": "night",
   "type": "nexus",
   "title": "หัวหน้ามาเฟียท่าเรือ Deep One (บอส)",
   "desc": "ใบหน้าผิดรูป ดวงตาโปน ผิวหนังเป็นเกล็ดปลา เขาไม่ได้เป็นแค่มาเฟียอีกต่อไป",
   "requires": [
    "c2-warehouse"
   ],
   "mode": "all",
   "options": [
    {
     "key": "win",
     "label": "ชนะและยึดชิ้นส่วนเครื่องจักร",
     "clock": -1,
     "result": "ได้จดหมายสั่งการครบ รู้ว่าผู้รับคือผู้อำนวยการโรงพยาบาลทหารผ่านศึก",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "letter",
     "label": "ได้แค่จดหมาย",
     "clock": 0,
     "result": "ชิ้นส่วนถูกส่งไปโรงพยาบาลแล้ว แต่ผู้เล่นรู้ปลายทาง",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "lose",
     "label": "แพ้ / หนี",
     "clock": 1,
     "result": "ผู้เล่นรอด แต่ไม่ได้อะไรนอกจากชื่อโรงพยาบาลบนลังไม้",
     "news": "",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c2-end",
   "chapter": 2,
   "day": 1,
   "time": "night",
   "type": "fixed",
   "title": "จบ Chapter 2: ควันปืนและกลิ่นคาวปลา",
   "desc": "ขึ้นเลเวล และมุ่งหน้าสู่โรงพยาบาลทหารผ่านศึก",
   "requires": [
    "c2-boss"
   ],
   "mode": "all",
   "options": []
  },
  {
   "id": "c3-infiltrate",
   "chapter": 3,
   "day": 1,
   "time": "evening",
   "type": "nexus",
   "title": "แทรกซึมโรงพยาบาลทหารผ่านศึก",
   "desc": "ตึกอิฐสีหม่นชานเมือง เสียงครางดังจากชั้นใต้ดินทุกคืน",
   "requires": [
    "c2-end"
   ],
   "mode": "all",
   "options": [
    {
     "key": "front",
     "label": "ประตูหน้า (ทั้งตี้เป็นผู้ป่วย)",
     "clock": 0,
     "result": "ทุกคนเข้าเป็นผู้ป่วยตามใบส่งตัวจากโรงเตี๊ยม ถือของครบ แต่ถูกฉีดยากล่อมประสาท (Disadvantage เซฟ WIS จนกว่าจะพัก)",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "forest",
     "label": "อ้อมป่าไปหลังโรงพยาบาล",
     "clock": 0,
     "result": "ไม่มีอุปสรรคระหว่างทาง เริ่มเข้าตึกจากด้านหลัง",
     "news": "",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c3-ward",
   "chapter": 3,
   "day": 1,
   "time": "night",
   "type": "fixed",
   "title": "หอผู้ป่วยที่กำแพงกลายเป็นเนื้อ",
   "desc": "มิติบิดเบี้ยว ทางเดินยาวไม่สิ้นสุด กำแพงเต้นเป็นจังหวะเดียวกับชิ้นส่วนเครื่องจักร ทุกคนทอยตรวจความหวาดผวา ระดับเกินจะรับไหว",
   "requires": [
    "c3-infiltrate"
   ],
   "mode": "all",
   "options": []
  },
  {
   "id": "c3-boss",
   "chapter": 3,
   "day": 1,
   "time": "night",
   "type": "nexus",
   "title": "ผู้อำนวยการลัทธิและผู้คุมกลายพันธุ์ (บอส)",
   "desc": "ผู้อำนวยการบิดพื้นที่ได้ เครื่องจักรกำลังดูดพลังจากทหารที่ป่วย PTSD",
   "requires": [
    "c3-ward"
   ],
   "mode": "all",
   "options": [
    {
     "key": "save",
     "label": "ช่วยทหารและหยุดเครื่องกลางคัน",
     "clock": -1,
     "result": "ทหารบางส่วนรอด เครื่องจักรทำงานแค่บางส่วน",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "kill",
     "label": "สังหารผู้อำนวยการ ปล่อยเครื่องไว้",
     "clock": 1,
     "result": "บอสตาย แต่เครื่องจักรทำงานต่อเองด้วยพลังที่เก็บไว้",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "fail",
     "label": "ล้มเหลว",
     "clock": 2,
     "result": "เครื่องจักรชาร์จเต็ม รอยแยกใต้เมืองเปิดกว้างกว่าที่ควร",
     "news": "อาร์คเคนเดลี่: ไฟไหม้ปริศนาที่โรงพยาบาลทหารผ่านศึก ไม่พบผู้รอดชีวิต",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c3-end",
   "chapter": 3,
   "day": 1,
   "time": "night",
   "type": "fixed",
   "title": "จบ Chapter 3: หอผู้ป่วยจิตเวชที่ถูกลืม",
   "desc": "ขึ้นเลเวล รุ่งเช้าหมอกสีเขียวเริ่มลอยขึ้นจากท่อระบายน้ำ",
   "requires": [
    "c3-boss"
   ],
   "mode": "all",
   "options": []
  },
  {
   "id": "c4-fog",
   "chapter": 4,
   "day": 1,
   "time": "morning",
   "type": "fixed",
   "title": "หมอกเขียวพิษปกคลุมอาร์คเคน",
   "desc": "รอยแยกมิติเปิดใต้เมือง หมอกพิษลอยขึ้นปกคลุมถนน Cultist ออกมาเดินเกลื่อน",
   "requires": [
    "c3-end"
   ],
   "mode": "all",
   "options": []
  },
  {
   "id": "c4-descent",
   "chapter": 4,
   "day": 1,
   "time": "afternoon",
   "type": "nexus",
   "title": "ลงสู่ใต้ดิน",
   "desc": "ต้องฝ่าดง Cultist ลงไปถึงเครื่องจักรใต้เมือง",
   "requires": [
    "c4-fog"
   ],
   "mode": "all",
   "options": [
    {
     "key": "sewer",
     "label": "ทางท่อระบายน้ำ",
     "clock": 0,
     "result": "เร็วกว่าแต่ต้องสู้กับ Cultist ทุกทางแยก",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "mine",
     "label": "ทางเหมืองร้าง",
     "clock": 0,
     "result": "ช้ากว่า แต่เจอไดนาไมต์และเครื่องจักรไอน้ำเก่าที่ใช้ได้ในฉากบอส",
     "news": "",
     "unlocks": [],
     "blocks": []
    }
   ]
  },
  {
   "id": "c4-herald",
   "chapter": 4,
   "day": 1,
   "time": "night",
   "type": "nexus",
   "title": "The Herald of the Abyss (บอสสุดท้าย)",
   "desc": "ร่างจำแลงขนาดยักษ์ของ Cthulhu โผล่จากรอยแยก เวทของมนุษย์ไร้ผลกับมัน ต้องใช้กลไกในฉากเท่านั้น",
   "requires": [
    "c4-descent"
   ],
   "mode": "all",
   "options": [
    {
     "key": "dynamite",
     "label": "ระเบิดเครื่องจักรด้วยไดนาไมต์",
     "clock": -2,
     "result": "เครื่องจักร Magitech พัง รอยแยกปิดลง",
     "news": "อาร์คเคนเดลี่: แผ่นดินไหวใต้เมือง หมอกพิษจางหายในชั่วข้ามคืน",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "steam",
     "label": "ใช้เครื่องจักรไอน้ำอัดรอยแยก",
     "clock": -1,
     "result": "ปิดรอยแยกได้ชั่วคราว แต่ Cthulhu รู้แล้วว่ามนุษย์ต่อสู้ได้",
     "news": "",
     "unlocks": [],
     "blocks": []
    },
    {
     "key": "fail",
     "label": "ล้มเหลว",
     "clock": 3,
     "result": "รอยแยกเปิดเต็มที่ วันสิ้นโลกมาถึงอาร์คเคน",
     "news": "",
     "unlocks": [],
     "blocks": []
    }
   ]
  }
 ],
 "log": []
};

/* ---------- state ---------- */
const getData = () => foundry.utils.deepClone(game.settings.get(MOD, "timeline") ?? { events: [], log: [] });
async function setData(d) { await game.settings.set(MOD, "timeline", d); render(); }
const resolved = (d) => Object.fromEntries(d.log.map((l) => [l.id, l.key]));

function condOk(cond, res) {
  const [id, key] = String(cond).split(":");
  if (!(id in res)) return false;
  return key ? res[id] === key : true;
}
function blockedBy(ev, d) {
  for (const l of d.log) {
    const src = d.events.find((e) => e.id === l.id);
    const opt = src?.options?.find((o) => o.key === l.key);
    if (opt?.blocks?.includes(ev.id)) return src.title;
  }
  return null;
}
function unlockedBy(ev, d) {
  for (const l of d.log) {
    const src = d.events.find((e) => e.id === l.id);
    const opt = src?.options?.find((o) => o.key === l.key);
    if (opt?.unlocks?.includes(ev.id)) return true;
  }
  return false;
}
function status(ev, d) {
  const res = resolved(d);
  if (ev.id in res) return "done";
  if (blockedBy(ev, d)) return "blocked";
  const req = ev.requires ?? [];
  const ok = !req.length || (ev.mode === "any" ? req.some((c) => condOk(c, res)) : req.every((c) => condOk(c, res)));
  return ok || unlockedBy(ev, d) ? "open" : "locked";
}

/* ---------- actions ---------- */
async function choose(evId, key) {
  const d = getData();
  const ev = d.events.find((e) => e.id === evId);
  if (!ev || status(ev, d) !== "open") return;
  const opt = ev.type === "fixed" ? { key: "done", label: "เกิดขึ้นแล้ว", clock: 0, result: ev.desc } : ev.options.find((o) => o.key === key);
  if (!opt) return;
  const before = Number(game.settings.get(MOD, "clock") ?? 3);
  const after = Math.max(0, Math.min(12, before + Number(opt.clock || 0)));
  if (after !== before) await game.settings.set(MOD, "clock", after);
  d.log.push({ id: ev.id, key: opt.key, delta: after - before, at: Date.now() });
  await setData(d);
  const clockLine = after !== before ? `<br>นาฬิกาห้วงนิทรา ${before} → <b>${after}</b>/12` : "";
  ChatMessage.create({ whisper: gmIds(), content: `<div class="rw-card"><div class="rw-title">Nexus: ${esc(ev.title)}</div><b>${esc(opt.label)}</b><br>${esc(opt.result)}${clockLine}</div>` });
  if (opt.news) ChatMessage.create({ content: `<div class="rw-news"><div class="rw-news-head">ARKHEN DAILY</div>${esc(opt.news)}</div>` });
  if (after >= 12) ui.notifications.error("นาฬิกาห้วงนิทราครบ 12 ช่อง: Cthulhu ตื่นเต็มตัว");
}

async function undo(evId) {
  const d = getData();
  const idx = d.log.findIndex((l) => l.id === evId);
  if (idx < 0) return;
  const later = d.log.slice(idx + 1).map((l) => d.events.find((e) => e.id === l.id)?.title).filter(Boolean);
  if (later.length) return ui.notifications.warn(`ย้อนไม่ได้ ต้องย้อนเหตุการณ์ที่เกิดทีหลังก่อน: ${later.join(", ")}`);
  const [l] = d.log.splice(idx, 1);
  if (l.delta) {
    const c = Number(game.settings.get(MOD, "clock") ?? 3);
    await game.settings.set(MOD, "clock", Math.max(0, Math.min(12, c - l.delta)));
  }
  await setData(d);
}

/* ---------- panel ---------- */
let panel = null;
let filterCh = "all";
let editing = null; // event id being edited, or "new"
let draft = null;   // unsaved copy shown in the editor
const blankEv = () => ({ id: "", chapter: 1, day: 1, type: "nexus", title: "", desc: "", requires: [], mode: "all", options: [{ key: "a", label: "", clock: 0, result: "", news: "", unlocks: [], blocks: [] }] });

const STATUS = { open: ["พร้อมเกิด", "open"], done: ["เกิดแล้ว", "done"], locked: ["ยังล็อก", "locked"], blocked: ["ถูกปิดทาง", "blocked"] };

function evCard(ev, d) {
  const st = status(ev, d);
  const res = resolved(d);
  const chosen = ev.options?.find((o) => o.key === res[ev.id]);
  const req = (ev.requires ?? []).map((c) => {
    const [id, key] = c.split(":");
    const e = d.events.find((x) => x.id === id);
    const o = e?.options?.find((x) => x.key === key);
    return `${esc(e?.title ?? id)}${o ? ` → ${esc(o.label)}` : ""}`;
  });
  let body = "";
  if (st === "open") {
    body = ev.type === "fixed"
      ? `<button data-act="choose" data-ev="${esc(ev.id)}" data-key="done">เกิดขึ้นแล้ว</button>`
      : ev.options.map((o) => `<button class="rw-opt" data-act="choose" data-ev="${esc(ev.id)}" data-key="${esc(o.key)}">
          <b>${esc(o.label)}</b>${o.clock ? ` <span class="rw-delta ${o.clock > 0 ? "up" : "down"}">นาฬิกา ${o.clock > 0 ? "+" : ""}${o.clock}</span>` : ""}
          <small>${esc(o.result)}</small></button>`).join("");
  } else if (st === "done") {
    body = `<div class="rw-chosen">${chosen ? `<b>${esc(chosen.label)}</b>: ${esc(chosen.result)}` : "เกิดขึ้นแล้ว"}</div>
      <button class="rw-small" data-act="undo" data-ev="${esc(ev.id)}">ย้อนกลับ</button>`;
  } else if (st === "blocked") {
    body = `<div class="rw-hint">ทางนี้ถูกปิดโดย: ${esc(blockedBy(ev, d))}</div>`;
  } else {
    body = `<div class="rw-hint">ต้องเกิดก่อน (${ev.mode === "any" ? "อย่างใดอย่างหนึ่ง" : "ทั้งหมด"}): ${req.join(", ") || "–"}</div>`;
  }
  return `<div class="rw-ev st-${STATUS[st][1]}">
    <div class="rw-ev-top"><span class="rw-chip ${STATUS[st][1]}">${STATUS[st][0]}</span>
      <span class="rw-day">Ch.${esc(ev.chapter)} · วันที่ ${esc(ev.day)}</span>
      ${ev.type === "nexus" ? '<span class="rw-nexus">NEXUS</span>' : ""}
      <a class="rw-edit" data-act="edit" data-ev="${esc(ev.id)}" title="แก้ไข">แก้ไข</a></div>
    <div class="rw-ev-title">${esc(ev.title)}</div>
    <div class="rw-ev-desc">${esc(ev.desc)}</div>
    ${body}</div>`;
}

function editorHtml() {
  const ev = draft;
  if (!ev) return "";
  const optRow = (o, i) => `<fieldset class="rw-optrow" data-i="${i}"><legend>ทางเลือก ${i + 1}</legend>
    <div class="rw-grid2"><label>คีย์ <input name="okey" value="${esc(o.key)}"></label><label>นาฬิกา +/− <input name="oclock" type="number" min="-3" max="3" value="${Number(o.clock || 0)}"></label></div>
    <label>ชื่อทางเลือก <input name="olabel" value="${esc(o.label)}"></label>
    <label>ผลที่เกิด <textarea name="oresult" rows="2">${esc(o.result)}</textarea></label>
    <label>พาดหัวข่าวที่ผู้เล่นเห็น (เว้นว่างได้) <input name="onews" value="${esc(o.news)}"></label>
    <div class="rw-grid2"><label>ปลดล็อก (id คั่นด้วย ,) <input name="ounlocks" value="${esc((o.unlocks ?? []).join(", "))}"></label>
    <label>ปิดทาง (id คั่นด้วย ,) <input name="oblocks" value="${esc((o.blocks ?? []).join(", "))}"></label></div>
    <button class="rw-small" data-act="delopt" data-i="${i}">ลบทางเลือกนี้</button></fieldset>`;
  return `<form class="rw-editor" autocomplete="off">
    <div class="rw-grid3"><label>id <input name="id" value="${esc(ev.id)}" ${editing !== "new" ? "readonly" : ""} placeholder="เช่น c2-library"></label>
    <label>Chapter <input name="chapter" type="number" min="0" value="${esc(ev.chapter)}"></label>
    <label>วันในเกม <input name="day" type="number" min="0" value="${esc(ev.day)}"></label></div>
    <label>ชื่อเหตุการณ์ <input name="title" value="${esc(ev.title)}"></label>
    <label>รายละเอียด (DM อ่าน) <textarea name="desc" rows="3">${esc(ev.desc)}</textarea></label>
    <div class="rw-grid2"><label>ชนิด <select name="type"><option value="nexus" ${ev.type === "nexus" ? "selected" : ""}>Nexus (มีทางแยก)</option><option value="fixed" ${ev.type === "fixed" ? "selected" : ""}>เหตุการณ์ตายตัว</option></select></label>
    <label>เงื่อนไข <select name="mode"><option value="all" ${ev.mode !== "any" ? "selected" : ""}>ต้องครบทุกข้อ</option><option value="any" ${ev.mode === "any" ? "selected" : ""}>ข้อใดข้อหนึ่ง</option></select></label></div>
    <label>ต้องเกิดก่อน (id หรือ id:คีย์ทางเลือก คั่นด้วย ,) <input name="requires" value="${esc((ev.requires ?? []).join(", "))}"></label>
    <div class="rw-opts">${(ev.options ?? []).map(optRow).join("")}</div>
    <div class="rw-row"><button class="rw-small" data-act="addopt">+ เพิ่มทางเลือก</button></div>
    <div class="rw-row"><button data-act="save">บันทึก</button><button class="rw-small" data-act="cancel">ยกเลิก</button>
    ${editing !== "new" ? '<button class="rw-small rw-danger" data-act="delete">ลบเหตุการณ์</button>' : ""}</div></form>`;
}

function readEditor(form) {
  const v = (n) => form.querySelector(`[name=${n}]`)?.value?.trim() ?? "";
  const list = (s) => s.split(",").map((x) => x.trim()).filter(Boolean);
  const options = [...form.querySelectorAll(".rw-optrow")].map((r, i) => {
    const g = (n) => r.querySelector(`[name=${n}]`)?.value?.trim() ?? "";
    return { key: g("okey") || `o${i + 1}`, label: g("olabel"), clock: Math.max(-3, Math.min(3, Number(g("oclock")) || 0)),
      result: g("oresult"), news: g("onews"), unlocks: list(g("ounlocks")), blocks: list(g("oblocks")) };
  });
  return { id: v("id").replace(/[^\w-]/g, "-"), chapter: Number(v("chapter")) || 0, day: Number(v("day")) || 0, type: v("type") || "nexus",
    title: v("title"), desc: v("desc"), requires: list(v("requires")), mode: v("mode") || "all", options };
}

function render() {
  if (!panel) return;
  const d = getData();
  const clock = Number(game.settings.get(MOD, "clock") ?? 3);
  const chapters = [...new Set(d.events.map((e) => e.chapter))].sort((a, b) => a - b);
  const evs = d.events.filter((e) => filterCh === "all" || String(e.chapter) === String(filterCh))
    .sort((a, b) => a.chapter - b.chapter || a.day - b.day);
  const cells = Array.from({ length: 12 }, (_, i) => `<span class="${i < clock ? "on" : ""}"></span>`).join("");
  const body = panel.querySelector(".rw-body");
  body.innerHTML = editing ? editorHtml() : `
    <div class="rw-clockbar"><span>นาฬิกาห้วงนิทรา <b>${clock}</b>/12</span><div class="rw-clock mini">${cells}</div></div>
    <div class="rw-row rw-tabs">
      <button class="${filterCh === "all" ? "on" : ""}" data-act="ch" data-ch="all">ทั้งหมด</button>
      ${chapters.map((c) => `<button class="${String(filterCh) === String(c) ? "on" : ""}" data-act="ch" data-ch="${esc(c)}">Ch.${esc(c)}</button>`).join("")}
      <span style="flex:1"></span><button class="rw-small" data-act="new">+ เพิ่มเหตุการณ์</button>
    </div>
    ${evs.map((e) => evCard(e, d)).join("") || '<p class="rw-hint">ยังไม่มีเหตุการณ์ กด "+ เพิ่มเหตุการณ์" หรือ "โหลดตัวอย่าง Chapter 1"</p>'}
    <div class="rw-row rw-foot">
      <button class="rw-small" data-act="export">ส่งออก JSON</button><button class="rw-small" data-act="import">นำเข้า JSON</button>
      <button class="rw-small" data-act="example">โหลดตัวอย่าง Chapter 1</button><button class="rw-small rw-danger" data-act="reset">ล้างผลทั้งหมด</button>
    </div>
    <p class="rw-hint">กดทางเลือกเมื่อผู้เล่นทำสิ่งนั้นจริงในเกม ระบบจะปรับนาฬิกา ปลดล็อกเหตุการณ์ต่อไป กระซิบผลให้ DM และโพสต์พาดหัวข่าวให้ผู้เล่นเห็น (ถ้ามี)</p>`;
}

async function onClick(e) {
  const t = e.target.closest("[data-act]");
  if (!t) return;
  e.preventDefault();
  const a = t.dataset.act;
  const d = getData();
  if (a === "close") { panel.remove(); panel = null; return; }
  if (a === "ch") { filterCh = t.dataset.ch; return render(); }
  if (a === "choose") return choose(t.dataset.ev, t.dataset.key);
  if (a === "undo") return undo(t.dataset.ev);
  if (a === "edit") { editing = t.dataset.ev; draft = foundry.utils.deepClone(d.events.find((x) => x.id === editing)); return render(); }
  if (a === "new") { editing = "new"; draft = blankEv(); return render(); }
  if (a === "cancel") { editing = null; draft = null; return render(); }
  const form = panel.querySelector(".rw-editor");
  if (a === "addopt" || a === "delopt") {
    const ev = readEditor(form);
    if (a === "addopt") ev.options.push({ key: `o${ev.options.length + 1}`, label: "", clock: 0, result: "", news: "", unlocks: [], blocks: [] });
    else ev.options.splice(Number(t.dataset.i), 1);
    draft = ev;
    render();
    return;
  }
  if (a === "save") {
    const ev = readEditor(form);
    if (!ev.id || !ev.title) return ui.notifications.warn("ใส่ id และชื่อเหตุการณ์ก่อนบันทึก");
    if (editing === "new" && d.events.some((x) => x.id === ev.id)) return ui.notifications.warn(`มี id "${ev.id}" อยู่แล้ว ใช้ id อื่น`);
    if (ev.type === "nexus" && !ev.options.length) return ui.notifications.warn("Nexus ต้องมีทางเลือกอย่างน้อย 1 ทาง");
    if (editing === "new") d.events.push(ev); else d.events = d.events.map((x) => (x.id === editing ? ev : x));
    editing = null; draft = null;
    return setData(d);
  }
  if (a === "delete") {
    if (d.log.some((l) => l.id === editing)) return ui.notifications.warn("เหตุการณ์นี้เกิดไปแล้ว ย้อนกลับก่อนแล้วค่อยลบ");
    d.events = d.events.filter((x) => x.id !== editing);
    editing = null; draft = null;
    return setData(d);
  }
  if (a === "export") {
    const json = JSON.stringify(d, null, 2);
    const fn = `arkane-1920s-timeline.json`;
    if (foundry.utils?.saveDataToFile) foundry.utils.saveDataToFile(json, "application/json", fn);
    else if (typeof saveDataToFile === "function") saveDataToFile(json, "application/json", fn);
    return;
  }
  if (a === "import") return importJson();
  if (a === "example") return confirmAct("แทนที่เส้นเวลาปัจจุบันด้วยตัวอย่าง Chapter 1? ผลที่เลือกไว้จะหาย (นาฬิกาไม่เปลี่ยน)", () => setData(foundry.utils.deepClone(EXAMPLE)));
  if (a === "reset") return confirmAct("ล้างผลที่เลือกไว้ทั้งหมด และคืนนาฬิกาตามที่เหตุการณ์เคยปรับ?", async () => {
    const total = d.log.reduce((s, l) => s + (l.delta || 0), 0);
    if (total) await game.settings.set(MOD, "clock", Math.max(0, Math.min(12, Number(game.settings.get(MOD, "clock")) - total)));
    d.log = [];
    return setData(d);
  });
}

async function confirmAct(text, fn) {
  const D = foundry.applications?.api?.DialogV2;
  const ok = D ? await D.confirm({ window: { title: "ยืนยัน" }, content: `<p>${esc(text)}</p>`, rejectClose: false }) : true;
  if (ok) await fn();
}

async function importJson() {
  const D = foundry.applications?.api?.DialogV2;
  if (!D) return;
  const txt = await D.wait({
    window: { title: "นำเข้าเส้นเวลา (JSON)" },
    content: `<p class="rw-hint">วางข้อความจากไฟล์ที่ส่งออกไว้</p><textarea name="j" rows="12" style="width:100%"></textarea>`,
    buttons: [{ action: "ok", label: "นำเข้า", default: true, callback: (ev, btn) => btn.form.querySelector("[name=j]").value }, { action: "cancel", label: "ยกเลิก" }],
    rejectClose: false
  });
  if (!txt || txt === "cancel") return;
  try {
    const d = JSON.parse(txt);
    if (!Array.isArray(d.events)) throw new Error("ไม่มี events");
    d.log = Array.isArray(d.log) ? d.log : [];
    await setData(d);
    ui.notifications.info("นำเข้าเส้นเวลาแล้ว");
  } catch (e) { ui.notifications.error(`นำเข้าไม่ได้: ${e.message}`); }
}

export function openTimeline() {
  if (!game.user.isGM) return ui.notifications.warn("เส้นเวลาใช้ได้เฉพาะ DM");
  if (panel) { panel.style.display = ""; return render(); }
  panel = document.createElement("section");
  panel.className = "rw-panel";
  panel.innerHTML = `<header class="rw-head"><span>เส้นเวลา · Nexus Events</span><a data-act="close" title="ปิด">✕</a></header><div class="rw-body"></div>`;
  document.body.appendChild(panel);
  panel.addEventListener("click", onClick);
  // drag by header
  const head = panel.querySelector(".rw-head");
  head.addEventListener("pointerdown", (e) => {
    if (e.target.closest("[data-act]")) return;
    const r = panel.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
    const mv = (m) => { panel.style.left = `${Math.max(0, m.clientX - ox)}px`; panel.style.top = `${Math.max(0, m.clientY - oy)}px`; panel.style.right = "auto"; };
    const up = () => { window.removeEventListener("pointermove", mv); window.removeEventListener("pointerup", up); };
    window.addEventListener("pointermove", mv); window.addEventListener("pointerup", up);
  });
  render();
}

export function registerTimeline() {
  game.settings.register(MOD, "timeline", { scope: "world", config: false, type: Object, default: { events: [], log: [] }, onChange: () => render() });
  game.settings.register(MOD, "timelineSeeded", { scope: "world", config: false, type: Boolean, default: false });
}

export async function seedTimeline() {
  if (!game.user.isGM || game.settings.get(MOD, "timelineSeeded")) return;
  const cur = game.settings.get(MOD, "timeline");
  if (!cur?.events?.length) await game.settings.set(MOD, "timeline", foundry.utils.deepClone(EXAMPLE));
  try {
    const mf = game.folders.find((f) => f.name === "Arkane 1920s" && f.type === "Macro");
    if (!game.macros.getName("เส้นเวลา (Nexus)")) await Macro.create({ name: "เส้นเวลา (Nexus)", type: "script", command: "game.arkane.timeline();", img: "icons/svg/clockwork.svg", folder: mf?.id });
  } catch (e) { console.error(MOD, "timeline macro", e); }
  await game.settings.set(MOD, "timelineSeeded", true);
}

export const _test = { status, choose, undo, getData, render, onClick };
