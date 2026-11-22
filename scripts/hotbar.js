// Puts the module's macros on the GM's hotbar (3 pages of 10), with an icon per macro.
// Runs once per GM user (flag), and again any time from the macro "จัดแถบมาโคร GM".
const MOD = "arkane-1920s";
const GM_NAME = "b522010249";
const VER = 23;
const I = (n) => `icons/svg/${n}.svg`;

// [macro name, icon]
const PAGES = [
  // หน้า 1: เดินเรื่องตามบท (กดไล่ตามลำดับ)
  [["เริ่มฉากซ้อม", "combat"], ["เริ่ม Chapter 1: ล้างของจากฉากซ้อม", "sun"], ["Chapter 2: เช้าวันที่ 2 (โรงเตี๊ยม)", "house"], ["Chapter 2: โกดัง 4 วาง NPC", "mystery-man"],
   ["Chapter 2: ไฮนซ์เข้าตี้", "mystery-man"], ["Chapter 2.5: สร้างฉากไล่ล่า", "target"], ["Chapter 2.5: วางรถและศัตรู", "hazard"], ["สร้าง Chapter 3: โรงพยาบาลทหารผ่านศึก", "temple"], ["สร้าง Chapter 4: รอยแยกใต้เมือง", "cave"], ["Chapter 2.6: จุดพักเชิงเนิน", "house"]],
  // หน้า 2: ใช้ระหว่างเล่น
  [["พาผู้เล่นไปฉาก", "direction"], ["ขอให้ผู้เล่นทอยเช็ค", "d20-grey"], ["ตรวจความหวาดผวา", "terror"], ["สถานะหวาดผวา", "eye"], ["ลด Dread", "regen"],
   ["นาฬิกาห้วงนิทรา", "clockwork"], ["ให้ XP", "upgrade"], ["เลเวลอัพ", "up"], ["จ่ายรางวัล C.A.A.M. (+25 gp ทุกคน)", "coins"], ["สรุปตี้ & เป้าหมาย (โน้ต)", "book"]],
  // หน้า 3: ของประกอบฉาก
  [["ตลาดมืด: สร้าง/เติมของร้านฟินช์", "coins"], ["ร้านฟินช์: ตั้งด่านสินค้า", "coins"], ["วางด่าน C.A.A.M. + แผงฟินช์ + ประตูเหล็ก", "hazard"], ["วางรถลงฉาก (เก๋ง / รถตู้)", "hazard"],
   ["ให้ทุกคนลงจากรถ", "door-exit"], ["ย่านท่าเรือ: สลับเช้า/กลางคืน", "sun"], ["เล่นเพลงประกอบ (เลือกเอง)", "sound"], ["เนื้อเรื่องผู้เล่น (DM)", "book"], ["ไฮนซ์ลาตี้ (ส่งต่อ Perry)", "door-exit"]],
  // หน้า 4: เตรียมระบบ (นานๆ ครั้ง)
  [["สร้างตัวละครผู้เล่น", "angel"], ["นำเข้าตัวละครจาก Character Ledger", "item-bag"], ["ใส่รูปไอเทม", "chest"], ["ซ่อมปืน (เพิ่มปุ่มยิง)", "sword"], ["สร้างฉาก: Chapter 1 ครบทุกแมพ", "village"],
   ["เชื่อมแมพ Chapter 1", "bridge"], ["วาง NPC ลงฉาก Chapter 1", "mystery-man"], ["สร้างฉาก: อู่ซ่อมเรือร้าง (ภายใน)", "ruins"], ["ส่งข้อความเปิดเรื่องให้ผู้เล่น", "hanging-sign"], ["เปิด/ปิดจำกัดระยะเดินใน combat", "lock"]],
  // หน้า 5: ตัวช่วย DM ทุกบท (ติ๊กสิ่งที่เกิด + สรุปเซสชัน)
  [["Chapter 1: ตัวช่วย DM", "castle"], ["Chapter 2: ตัวช่วย DM", "book"], ["Chapter 2.5–2.6: ตัวช่วย DM (ไล่ล่า+จุดพัก)", "target"], ["Chapter 2.5: วาร์ปไล่ล่า", "door-exit"], ["Chapter 3: ตัวช่วย DM", "temple"], ["Chapter 4: ตัวช่วย DM", "ruins"]]
];

export async function setupGmHotbar(force = false) {
  const u = game.user;
  if (!u.isGM) return ui.notifications.warn("เฉพาะ GM");
  if (!force && (u.getFlag(MOD, "hotbarVer") ?? 0) >= VER && Object.keys(u.hotbar ?? {}).length) return;
  const hotbar = {}, missing = [];
  for (const [p, page] of PAGES.entries()) {
    for (const [i, [name, icon]] of page.entries()) {
      const m = game.macros.getName(name);
      if (!m) { missing.push(name); continue; }
      if (m.img !== I(icon)) { try { await m.update({ img: I(icon) }); } catch {} }
      hotbar[p * 10 + i + 1] = m.id;
    }
  }
  await u.update({ hotbar });
  await u.setFlag(MOD, "hotbarVer", VER);
  ui.hotbar?.render?.();
  ui.notifications.info(`จัดแถบมาโคร GM แล้ว: หน้า 1 เดินเรื่องตามบท · หน้า 2 ระหว่างเล่น · หน้า 3 ของประกอบฉาก · หน้า 4 เตรียมระบบ${missing.length ? ` (ไม่พบ ${missing.length} มาโคร)` : ""}`);
  if (missing.length) console.warn(MOD, "hotbar: missing macros", missing);
}

// called at the end of the module's ready hook, after all macros exist
export async function initHotbar() {
  try {
    if (!game.user.isGM) return;
    if (!game.macros.getName("จัดแถบมาโคร GM")) {
      const mf = game.folders.find((f) => f.name === "Arkane 1920s" && f.type === "Macro");
      await Macro.create({ name: "จัดแถบมาโคร GM", type: "script", command: "game.arkane.setupGmHotbar(true);", img: I("dice-target"), folder: mf?.id });
    }
    await setupGmHotbar(false);
    // players: reload + hand light in their first empty slots (once)
    for (const u of game.users.filter((x) => !x.isGM)) {
      if (u.getFlag(MOD, "playerHotbar")) continue;
      const ids = ["บรรจุกระสุน", "เปิด/ปิดไฟฉาย"].map((n) => game.macros.getName(n)).filter(Boolean);
      for (const m of ids) { try { if (!m.testUserPermission(u, "OBSERVER")) await m.update({ "ownership.default": 2 }); } catch {} }
      const bar = { ...(u.hotbar ?? {}) }, used = new Set(Object.values(bar));
      let slot = 1;
      for (const m of ids) { if (used.has(m.id)) continue; while (bar[slot]) slot++; bar[slot] = m.id; }
      await u.update({ hotbar: bar }); await u.setFlag(MOD, "playerHotbar", true);
    }
    // v2: the "give money" macro goes on every player's hotbar too (once)
    for (const u of game.users.filter((x) => !x.isGM)) {
      if (u.getFlag(MOD, "playerHotbar2")) continue;
      const m = game.macros.getName("ส่งเงินให้เพื่อน"); if (!m) break;
      try { if (!m.testUserPermission(u, "OBSERVER")) await m.update({ "ownership.default": 2 }); } catch {}
      const bar = { ...(u.hotbar ?? {}) };
      if (!Object.values(bar).includes(m.id)) { let slot = 1; while (bar[slot]) slot++; bar[slot] = m.id; await u.update({ hotbar: bar }); }
      await u.setFlag(MOD, "playerHotbar2", true);
    }
    // v3: coin purse + dash on every player's hotbar (once)
    for (const u of game.users.filter((x) => !x.isGM)) {
      if (u.getFlag(MOD, "playerHotbar3")) continue;
      const ms = ["กระเป๋าเงิน (ลากเหรียญ)", "วิ่ง (Dash) / เร่งเครื่อง"].map((n) => game.macros.getName(n)).filter(Boolean);
      if (!ms.length) break;
      for (const m of ms) { try { if (!m.testUserPermission(u, "OBSERVER")) await m.update({ "ownership.default": 2 }); } catch {} }
      const bar = { ...(u.hotbar ?? {}) };
      for (const m of ms) if (!Object.values(bar).includes(m.id)) { let slot = 1; while (bar[slot]) slot++; bar[slot] = m.id; }
      await u.update({ hotbar: bar }); await u.setFlag(MOD, "playerHotbar3", true);
    }
    // v4: ram macro on every player's hotbar (once)
    for (const u of game.users.filter((x) => !x.isGM)) {
      if (u.getFlag(MOD, "playerHotbar4")) continue;
      const m = game.macros.getName("พุ่งชน (รถ)"); if (!m) break;
      try { if (!m.testUserPermission(u, "OBSERVER")) await m.update({ "ownership.default": 2 }); } catch {}
      const bar = { ...(u.hotbar ?? {}) };
      if (!Object.values(bar).includes(m.id)) { let slot = 1; while (bar[slot]) slot++; bar[slot] = m.id; await u.update({ hotbar: bar }); }
      await u.setFlag(MOD, "playerHotbar4", true);
    }
    // v5: board/leave macro on every player's hotbar (once)
    for (const u of game.users.filter((x) => !x.isGM)) {
      if (u.getFlag(MOD, "playerHotbar5")) continue;
      const m = game.macros.getName("ขึ้น/ลงรถ (เลือกที่นั่ง)"); if (!m) break;
      try { if (!m.testUserPermission(u, "OBSERVER")) await m.update({ "ownership.default": 2 }); } catch {}
      const bar = { ...(u.hotbar ?? {}) };
      if (!Object.values(bar).includes(m.id)) { let slot = 1; while (bar[slot]) slot++; bar[slot] = m.id; await u.update({ hotbar: bar }); }
      await u.setFlag(MOD, "playerHotbar5", true);
    }
    // v6 undo: the "ask the GM" macro no longer lives on player hotbars (it is asked from the Argon Skills panel)
    const ask = game.macros.getName("ขอทอยเช็ค");
    if (ask) for (const u of game.users.filter((x) => !x.isGM)) {
      if (u.getFlag(MOD, "playerHotbar6off")) continue;
      const slots = Object.entries(u.hotbar ?? {}).filter(([, id]) => id === ask.id).map(([k]) => k);
      if (slots.length) await u.update(Object.fromEntries(slots.map((k) => [`hotbar.-=${k}`, null])));
      await u.setFlag(MOD, "playerHotbar6off", true);
    }
  } catch (e) { console.error(MOD, "hotbar", e); }
}
