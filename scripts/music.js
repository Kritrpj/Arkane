// Background music: one playlist made from the module's own tracks, scene music that starts when a scene is activated,
// and combat music that takes over during a fight and hands back when it ends.
const MOD = "arkane-1920s";
const PL = "Arkane 1920s · เพลงประกอบ";
const VER = 1;
const TRACKS = [
  ["bar-jazz", "บาร์ The Rusty Wand (แจ๊สใต้ดิน)", 0.45],
  ["alley-rain", "ตรอกฝนตก", 0.5],
  ["harbor-fog", "ท่าเรือในหมอก", 0.5],
  ["abyss-horror", "ห้วงลึก (สยองขวัญ)", 0.45],
  ["combat", "การต่อสู้", 0.45]
];
// optional tracks: made with Suno, dropped into modules/arkane-1920s/music/<key>.mp3 (or .ogg). They are added to the playlist only once the file exists.
const OPTIONAL = [
  ["inn-morning", "เช้าที่โรงเตี๊ยม (ชั้นพัก)", 0.4],
  ["harbor-morning", "ย่านท่าเรือยามเช้า", 0.45],
  ["interrogation", "ห้องสอบสวน C.A.A.M.", 0.45],
  ["warehouse-tension", "โกดังหมายเลข 4 (แอบเข้า)", 0.45],
  ["boss-rosso", "บอส: รอสโซ ปลาเงิน", 0.5],
  ["chase-road", "ไล่ล่าบนถนน (ก่อนสู้)", 0.45],
  ["chase-fight", "ไล่ล่าบนถนน (ยิงต่อสู้)", 0.5]
];
// scene name pattern → track
const SCENE_MUSIC = [[/Chapter 2\.5|ไล่ล่าบนถนน/, "chase-road"], [/Chapter 2\.5|ไล่ล่าบนถนน/, "combat"], [/ชั้นพัก|โรงเตี๊ยม/, "inn-morning"], [/Chapter 2|โกดังหมายเลข/, "warehouse-tension"], [/Rusty Wand|บาร์/, "bar-jazz"], [/แมพใหญ่|ตรอก|ย่านท่าเรือ/, "alley-rain"], [/ท่าเรือ|พ่อค้ายา|โกดัง/, "harbor-fog"],
  [/อู่ซ่อมเรือ|รังบอส|โรงพยาบาล|ใต้ดิน|รอยแยก|Chapter 3|Chapter 4/, "abyss-horror"]];

const playlist = () => game.playlists.getName(PL);
const soundOf = (key) => playlist()?.sounds.find((s) => s.getFlag(MOD, "track") === key);

async function addOptional(p) {
  if (!p) return;
  const V40 = foundry.audio?.AudioHelper?.inputToVolume?.(0.6) ?? AudioHelper.inputToVolume(0.6);
  const have = new Set(p.sounds.map((s) => s.getFlag(MOD, "track")));
  const add = [];
  for (const [key, name, vol] of OPTIONAL) {
    if (have.has(key)) continue;
    for (const ext of ["mp3", "ogg", "wav"]) {
      const path = `modules/${MOD}/music/${key}.${ext}`;
      let ok = false; try { ok = await foundry.utils.srcExists(path); } catch {}
      if (ok) { add.push({ name, path, repeat: true, volume: V40, fade: 2000, flags: { [MOD]: { track: key } } }); break; }
    }
  }
  if (add.length) { await p.createEmbeddedDocuments("PlaylistSound", add); ui.notifications.info(`เพลงใหม่เข้าเพลย์ลิสต์: ${add.map((a) => a.name).join(", ")}`); }
}
export async function playTrack(key) {
  if (!game.users.activeGM?.isSelf && !game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  if (!soundOf(key)) return ui.notifications.warn(`ยังไม่มีไฟล์เพลง "${key}" (วางไฟล์ใน music/ แล้วรีโหลด)`);
  return play(key);
}
export async function pickTrack() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const p = playlist(); if (!p?.sounds.size) return ui.notifications.warn("ยังไม่มีเพลย์ลิสต์เพลงประกอบ");
  const opts = p.sounds.contents.map((s) => `<option value="${s.getFlag(MOD, "track")}">${foundry.utils.escapeHTML(s.name)}${s.playing ? " (กำลังเล่น)" : ""}</option>`).join("");
  const r = await foundry.applications.api.DialogV2.wait({ window: { title: "เล่นเพลงประกอบ" }, content: `<div class="rw-form"><div class="form-group"><label>เพลง</label><select name="t">${opts}</select></div></div>`,
    buttons: [{ action: "play", label: "เล่น", default: true, callback: (e, b) => new FormDataExtended(b.form).object.t }, { action: "stop", label: "หยุดทั้งหมด" }, { action: "cancel", label: "ปิด" }], rejectClose: false });
  if (r === "stop") { for (const o of p.sounds.filter((x) => x.playing)) await o.update({ playing: false }); return; }
  if (r && r !== "cancel") return play(r);
}
export async function ensureMusic() {
  if (!game.users.activeGM?.isSelf) return;
  let p = playlist();
  if (p && (p.getFlag(MOD, "volVer") ?? 0) < 3) {   // every track at 60% on the volume slider
    const v = foundry.audio?.AudioHelper?.inputToVolume?.(0.6) ?? AudioHelper.inputToVolume(0.6);
    await p.updateEmbeddedDocuments("PlaylistSound", p.sounds.map((s) => ({ _id: s.id, volume: v })));
    await p.setFlag(MOD, "volVer", 3);
  }
  if (p && (p.getFlag(MOD, "ver") ?? 0) >= VER) { await addOptional(p).catch((e) => console.warn(MOD, "optional music", e)); return p; }
  const sounds = TRACKS.map(([key, name, vol]) => ({ name, path: `modules/${MOD}/music/${key}.ogg`, repeat: true, volume: vol, fade: 2000, flags: { [MOD]: { track: key } } }));
  if (!p) p = await Playlist.create({ name: PL, mode: CONST.PLAYLIST_MODES.DISABLED, fade: 2000, sounds, flags: { [MOD]: { ver: VER } } });
  else {
    const have = new Set(p.sounds.map((s) => s.getFlag(MOD, "track")));
    const add = sounds.filter((s) => !have.has(s.flags[MOD].track));
    if (add.length) await p.createEmbeddedDocuments("PlaylistSound", add);
    await p.setFlag(MOD, "ver", VER);
  }
  await addOptional(p).catch((e) => console.warn(MOD, "optional music", e));
  return p;
}

async function play(key) {
  const p = playlist(), s = soundOf(key);
  if (!p || !s) return;
  for (const o of p.sounds) if (o.playing && o.id !== s.id && o.getFlag(MOD, "track") !== "combat") await o.update({ playing: false });
  if (!s.playing) await s.update({ playing: true });
}
async function stop(key) { const s = soundOf(key); if (s?.playing) await s.update({ playing: false }); }
const on = () => game.settings.get(MOD, "autoMusic") && game.users.activeGM?.isSelf;
const trackFor = (scene) => SCENE_MUSIC.find(([re, k]) => re.test(scene?.name ?? "") && soundOf(k))?.[1];

export function registerMusic() {
  game.settings.register(MOD, "autoMusic", { name: "เพลงประกอบอัตโนมัติ", hint: "เปิดฉากแล้วเล่นเพลงที่เข้ากับฉาก · เริ่มต่อสู้แล้วเปลี่ยนเป็นเพลงต่อสู้ จบแล้วกลับเพลงเดิม (ปรับเสียงที่แถบ Playlists)",
    scope: "world", config: true, type: Boolean, default: false });
  Hooks.on("updateScene", (scene, ch) => { if (ch.active && on() && !game.combat?.started) { const k = trackFor(scene); if (k) play(k); } });
  Hooks.on("combatStart", (combat) => {
    if (!on()) return;
    const p = playlist(); p?.sounds.filter((s) => s.playing).forEach((s) => s.update({ playing: false }));
    const boss = combat?.combatants?.some((c) => c.actor?.getFlag(MOD, "npc") === "rosso") && soundOf("boss-rosso");
    const chase = /Chapter 2\.5|ไล่ล่าบนถนน/.test(game.scenes.active?.name ?? "") && soundOf("chase-fight");
    play(boss ? "boss-rosso" : chase ? "chase-fight" : "combat");
  });
  Hooks.on("deleteCombat", async () => {
    if (!on()) return;
    await stop("combat"); await stop("boss-rosso"); await stop("chase-fight");
    const k = trackFor(game.scenes.active); if (k) play(k);
  });
}
