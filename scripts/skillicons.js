// Skill icons + easy Thai text: for every feat item on a character whose name is in skilldata.js
//  - img  -> modules/arkane-1920s/skills/<slug>.webp  (only if the file exists)
//  - description -> a short "easy explanation + example" block on top of the original rules text (added once)
import { SKILLS, slugOf } from "./skilldata.js?v=21";
const MOD = "arkane-1920s", DIR = `modules/${MOD}/skills`;
let files = null;
async function listFiles(force) {
  if (files && !force) return files;
  files = new Set();
  try {
    const FP = foundry.applications?.apps?.FilePicker?.implementation ?? FilePicker;
    const r = await FP.browse("data", DIR);
    for (const f of r.files ?? []) files.add(decodeURIComponent(f.split("/").pop()).toLowerCase());
  } catch (e) { /* folder not made yet */ }
  return files;
}
const block = (s) => `<div class="rw-easy" style="border-left:3px solid #9A6B2C;padding:2px 8px;margin-bottom:6px"><p><b>${s.th}</b> — ${s.d}</p><p><i>ตัวอย่าง:</i> ${s.e}</p></div>`;
// Spell icons are per owner: modules/arkane-1920s/spells/<char>/<char>-<spell-slug>.webp (only if the file exists)
const CHARS = { vivian: /^vivian/i, mozxorion: /^mozxorion/i, windows: /^windows?/i, nincolas: /^nincolas/i };
const spellFiles = {};
async function listSpells(ch, force) {
  if (spellFiles[ch] && !force) return spellFiles[ch];
  const set = (spellFiles[ch] = new Set());
  try {
    const FP = foundry.applications?.apps?.FilePicker?.implementation ?? FilePicker;
    const r = await FP.browse("data", `modules/${MOD}/spells/${ch}`);
    for (const f of r.files ?? []) set.add(decodeURIComponent(f.split("/").pop()).toLowerCase());
  } catch (e) { /* folder not made yet */ }
  return set;
}
async function applySpellIcon(item) {
  if (!["spell", "feat"].includes(item?.type) || !item.parent) return false;
  const ch = Object.keys(CHARS).find((k) => CHARS[k].test(item.parent.name ?? ""));
  if (!ch) return false;
  const file = `${ch}-${slugOf(String(item.name).replace(/['\u2019\u2018`]/g, ""))}.webp`, path = `modules/${MOD}/spells/${ch}/${file}`;
  if (!(await listSpells(ch)).has(file) || item.img === path) return false;
  await item.update({ img: path }); return true;
}
export async function applyItem(item, force = false) {
  const sp = await applySpellIcon(item);
  const s = SKILLS[item?.name];
  if (!s && sp) return true;
  if (!s || !["feat", "spell"].includes(item.type)) return false;
  const fl = await listFiles();
  const upd = {}, file = `${slugOf(item.name)}.webp`;
  if (fl.has(file) && item.img !== `${DIR}/${file}`) upd.img = `${DIR}/${file}`;
  if (force || !item.getFlag(MOD, "easy")) {
    const old = (item.system?.description?.value ?? "").replace(/<div class="rw-easy"[\s\S]*?<\/div>/, "");
    upd["system.description.value"] = block(s) + old;
    upd[`flags.${MOD}.easy`] = true;
  }
  if (!Object.keys(upd).length) return false;
  await item.update(upd); return true;
}
export async function applySkills(force = false) {
  await listFiles(true);
  await applySpellIcons();
  let n = 0, img = 0;
  for (const a of game.actors.filter((x) => x.type === "character"))
    for (const it of a.items) { const before = it.img; if (await applyItem(it, force)) { n++; if (it.img !== before) img++; } }
  ui.notifications.info(`สกิล: อัปเดต ${n} รายการ (ใส่รูปใหม่ ${img}) · ไฟล์รูปที่เจอในโฟลเดอร์ skills = ${files.size}`);
}
// Quiet pass for the GM: put owner-specific spell icons on every character's spells (only changes mismatches)
export async function applySpellIcons() {
  for (const k of Object.keys(CHARS)) await listSpells(k, true);
  let n = 0;
  for (const a of game.actors.filter((x) => x.type === "character"))
    for (const it of a.items.filter((i) => i.type === "spell")) { try { if (await applySpellIcon(it)) n++; } catch (e) { console.warn(MOD, "spell icon", e); } }
  if (n) console.log(MOD, `spell icons applied: ${n}`);
  return n;
}
export function registerSkills() {
  const run = () => { if (game.user.isGM) setTimeout(() => applySpellIcons().catch((e) => console.warn(MOD, "spell icons", e)), 3000); };
  if (game.ready) run(); else Hooks.once("ready", run);
  Hooks.on("createItem", async (item) => { if (game.user.isGM && item.parent?.type === "character") { try { await applyItem(item); } catch (e) { console.warn(MOD, "skills", e); } } });
}
