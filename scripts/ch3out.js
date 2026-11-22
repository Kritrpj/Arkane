// Chapter 3 opening scene: the hospital grounds (arrival road, front gate, forest path round the back).
// Map is 4500x2250 px, 1 cell = 50 px (same scale as the chase map).
const MOD = "arkane-1920s";
const NAME = "Chapter 3: ลานหน้าโรงพยาบาล (ทางเข้า)";
const IN_NAME = "Chapter 3: โรงพยาบาลทหารผ่านศึก (ชั้นล่าง)";
const W = 4500, H = 2250, G = 50;
const rc = (x, y, w, h) => ({ type: "rectangle", x, y, width: w, height: h, rotation: 0, hole: false });
const wl = (a, b, c, d, o = {}) => ({ c: [a, b, c, d], ...o });
const SEE = { sight: 0, light: 0, sound: 0 };   // fence: blocks movement, not sight

function walls() {
  const w = [];
  // main block + the two ward wings, one outline (south wall has the front door at x 2210-2290)
  const pts = [[1400, 360], [3100, 360], [3100, 695], [3800, 695], [3800, 1195], [3100, 1195], [3100, 1560], [2290, 1560]];
  for (let i = 0; i < pts.length - 1; i++) w.push(wl(...pts[i], ...pts[i + 1]));
  w.push(wl(2290, 1560, 2210, 1560, { door: 1 }));
  const pts2 = [[2210, 1560], [1400, 1560], [1400, 1195], [700, 1195], [700, 695], [1400, 695], [1400, 360]];
  for (let i = 0; i < pts2.length - 1; i++) w.push(wl(...pts2[i], ...pts2[i + 1]));
  // rear annex (staff entrance), side door on the west
  w.push(wl(2060, 95, 2480, 95), wl(2480, 95, 2480, 360), wl(2060, 95, 2060, 235), wl(2060, 235, 2060, 290, { door: 1 }), wl(2060, 290, 2060, 360));
  // front fence + iron gate (gate gap 2100-2400)
  w.push(wl(1300, 1930, 2100, 1930, SEE), wl(2100, 1930, 2400, 1930, { door: 1, ...SEE }), wl(2400, 1930, 3200, 1930, SEE));
  return w;
}
const lamp = (x, y) => ({ x, y, config: { dim: 14, bright: 5, color: "#ffc070", alpha: 0.4, animation: { type: "torch", speed: 2, intensity: 2 } } });
const LIGHTS = [lamp(2211, 1574), lamp(2291, 1574)];

async function folder(type, name, color = "#9A6B2C") {
  return game.folders.find((f) => f.name === name && f.type === type) ?? Folder.create({ name, type, color });
}
export async function createCh3Start() {
  if (!game.user.isGM) { ui.notifications.warn("เฉพาะ GM"); return null; }
  let sc = game.scenes.getName(NAME);
  if (sc) return sc;
  sc = await Scene.create({ name: NAME, folder: (await folder("Scene", "Arkane 1920s · Chapter 3")).id, navigation: false, navName: "ลานหน้าโรงพยาบาล",
    background: { src: `modules/${MOD}/maps/ch3-start.webp` }, width: W, height: H, padding: 0, backgroundColor: "#0b0b0d",
    grid: { type: 1, size: G, distance: 5, units: "ft", alpha: 0.12 }, tokenVision: true, fog: { exploration: true },
    environment: { darknessLevel: 0.5 }, walls: walls(), lights: LIGHTS });
  try { const { setBackground } = await import("./ch1maps.js?v=21"); await setBackground(sc, "ch3-start.webp"); } catch (e) { console.warn(MOD, e); }
  const regions = [
    { name: "▶ จุดมาถึง (ต่อจากถนนเชิงเนิน)", color: "#3a7bd5", shapes: [rc(60, 2040, 300, 130)] },
    { name: "◇ ประตูข้างอาคารหลัง (ยังไม่ต่อกับภายใน)", color: "#d58a3a", shapes: [rc(2020, 235, 70, 55)] }
  ];
  const inSc = game.scenes.getName(IN_NAME);
  if (inSc) {
    const arriveName = "⤓ ปลายทาง: เข้าประตูหน้า";
    let arrive = inSc.regions.getName(arriveName);
    if (!arrive) [arrive] = await inSc.createEmbeddedDocuments("Region", [{ name: arriveName, color: "#3a7bd5", shapes: [{ type: "rectangle", x: 3000, y: 2200, width: 100, height: 100, rotation: 0, hole: false }] }]);
    regions.push({ name: "↪ เข้าประตูหน้า → ล็อบบี้", color: "#d58a3a", shapes: [rc(2180, 1545, 140, 50)],
      behaviors: [{ name: "เข้าประตูหน้า", type: "teleportToken", system: { destination: arrive.uuid, choice: true } }] });
  } else regions.push({ name: "↪ เข้าประตูหน้า (สร้าง Chapter 3 ชั้นล่างก่อนแล้วรันอีกครั้ง)", color: "#d58a3a", shapes: [rc(2180, 1545, 140, 50)] });
  try { await sc.createEmbeddedDocuments("Region", regions); } catch (e) { console.warn(MOD, "regions", e); }
  return sc;
}
