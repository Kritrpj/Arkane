// Put Chapter 1 NPC tokens where the story has them waiting (bar, docks, boat shed, C.A.A.M. office).
// Positions are in painted map cells (100 px each), so they work at any grid scale.
const MOD = "arkane-1920s";
const G = 100;
// [npc key, x, y, hidden?, note]
const BAR = [
  ["jack", 21, 7], ["ricky", 23, 6], ["winnie", 25, 11], ["harvey", 27, 9], ["lola", 31, 4],
  ["arthur", 32, 9], ["scout", 30, 11], ["thug", 24, 3]
];
const SCENES = {
  "Chapter 1: บาร์ The Rusty Wand (2 ชั้น)": [
    ...BAR, ["bruno", 10, 14],
    ["leader", 6, 5, true], ["agent", 7, 5, true], ["young", 8, 5, true]   // C.A.A.M. arrives round 4 (reveal then)
  ],
  // the big-map cellar has its own layout (counter left, stage top-right, rug in the middle)
  "Chapter 1: บาร์ The Rusty Wand ชั้นใต้ดิน": [
    ["jack", 2.25, 7], ["ricky", 3.7, 5.9], ["winnie", 4.2, 10.24], ["harvey", 6.76, 7.74], ["lola", 11, 4],
    ["arthur", 12.24, 7.74], ["scout", 9.24, 10.24], ["thug", 4.2, 2.8]
  ],
  "Chapter 1: ย่านท่าเรือ (แมพใหญ่)": [
    ["bruno", 12, 12],
    ["dealer", 37, 25], ["thug", 39, 27, true], ["thug", 40, 27, true], ["addict", 33, 31],
    null, null, null   // the boat-shed crew now waits inside "อู่ซ่อมเรือร้าง (ภายใน)"
  ],
  "Chapter 1: ห้องสอบสวน C.A.A.M. (ฉาก 4)": [["leader", 14, 2], ["agent", 9, 1], ["young", 15, 5]],
  "Chapter 1: ท่าเรือ พ่อค้ายาวิปลาส (ฉาก 5)": [["dealer", 18, 6], ["thug", 19, 8, true], ["thug", 20, 8, true], ["addict", 14, 12]],
  "Chapter 1: อู่ซ่อมเรือร้าง รังของแม็ค (ฉาก 6)": [["mack", 6, 12], ["thug", 10, 9], ["thug", 12, 4]]
};

export async function placeNpcs(quiet = false, reset = false) {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const actor = (key) => game.actors.find((a) => a.getFlag(MOD, "npc") === key);
  let placed = 0, scenes = 0;
  const missing = new Set();
  for (const [name, list] of Object.entries(SCENES)) {
    const sc = game.scenes.getName(name);
    if (!sc) continue;
    const already = new Set(sc.tokens.map((t) => t.getFlag(MOD, "spot")).filter(Boolean));
    const add = [], moves = [];
    for (const [i, entry] of list.entries()) {
      if (!entry) continue;
      const [key, x, y, hidden] = entry;
      const spot = `${key}@${i}`;
      if (already.has(spot)) {
        if (reset) for (const t of sc.tokens.filter((t) => t.getFlag(MOD, "spot") === spot)) {
          const size = sc.grid?.size ?? G, w = (t.width ?? 1) * size, h = (t.height ?? 1) * size;
          moves.push({ _id: t.id, x: x * G + (G - w) / 2, y: y * G + (G - h) / 2 });
        }
        continue;
      }
      const a = actor(key);
      if (!a) { missing.add(key); continue; }
      const td = (await a.getTokenDocument()).toObject();
      const size = sc.grid?.size ?? G;
      // centre the token inside the painted cell whatever the grid scale
      const w = (td.width ?? 1) * size, h = (td.height ?? 1) * size;
      add.push({ ...td, x: x * G + (G - w) / 2, y: y * G + (G - h) / 2, hidden: !!hidden, flags: { ...(td.flags ?? {}), [MOD]: { ...(td.flags?.[MOD] ?? {}), spot } } });
    }
    if (moves.length) { await sc.updateEmbeddedDocuments("Token", moves, { animate: false, teleport: true }); placed += moves.length; }
    if (add.length) { await sc.createEmbeddedDocuments("Token", add); placed += add.length; }
    if (add.length || moves.length) scenes++;
  }
  if (missing.size) console.warn(MOD, "placeNpcs: missing NPC actors", [...missing]);
  if (!quiet || placed) ui.notifications.info(`วาง NPC ลงฉากแล้ว ${placed} ตัว ใน ${scenes} ฉาก${missing.size ? ` · ยังไม่มีตัวละคร ${missing.size} ตัว (กดมาโคร "สร้าง NPC Chapter 1" ก่อน)` : ""} · โทเคนที่ซ่อนไว้ (C.A.A.M., อันธพาลหลังลัง) กด Toggle Visibility ตอนเปิดเผย`);
  return placed;
}

// v3: the boat-shed crew moved from the big map into the shed interior scene
export async function clearDistrictLair() {
  const sc = game.scenes.getName("Chapter 1: ย่านท่าเรือ (แมพใหญ่)");
  if (!sc) return 0;
  const ids = sc.tokens.filter((t) => ["mack@5", "thug@6", "thug@7"].includes(t.getFlag(MOD, "spot"))).map((t) => t.id);
  if (ids.length) await sc.deleteEmbeddedDocuments("Token", ids);
  return ids.length;
}
