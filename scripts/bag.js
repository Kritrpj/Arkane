// "กระเป๋า" : our own RPG-style inventory window (paper doll + item grid). Drag items onto the slots to equip them, drag them back to the bag to take them off.
// Independent of the character sheet module in use. Written against dnd5e 6.0.6 / Foundry v14 (ApplicationV2).
// Equipped state: item.system.equipped is true exactly for items that sit in a slot; the slot map is kept in the actor flag arkane-1920s.slots.
// The weapon + off-hand slots are mirrored into Argon's weapon set 1 so the combat HUD shows what the character is holding.
import { gunLevel, gunXp, GUN_XP, syncReloadSpell } from "./items.js?v=21";
const MOD = "arkane-1920s";
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const num = (v) => Number(v) || 0;
const fmt = (n) => (Math.round(n * 10) / 10).toString();

// ---------------------------------------------------------------- slots
export const SLOTS = {
  head: ["HEAD", "หมวก"], shoulder: ["SHOULDER", "ไหล่"], chest: ["CHEST", "ลำตัว"], hands: ["HANDS", "มือ"], feet: ["FEET", "เท้า"],
  neck: ["NECK", "คอ"], cape: ["CAPE", "ผ้าคลุม"], ring1: ["RING", "แหวน"], ring2: ["RING", "แหวน"], charm: ["CHARM", "ของติดตัว"],
  weapon: ["WEAPON", "อาวุธ"], shield: ["OFF-HAND", "มืออีกข้าง"]
};
const LEFT = ["head", "shoulder", "chest", "hands", "feet"], RIGHT = ["neck", "cape", "ring1", "ring2", "charm"];
const KEYWORDS = [
  ["head", /หมวก|ผ้าโพก|กระบัง|แว่น|ครอบหัว|hat|cap\b|helm|hood|goggle|mask|หน้ากาก/i],
  ["neck", /สร้อย|ผ้าพันคอ|จี้|amulet|necklace|neck|scarf|locket|collar/i],
  ["shoulder", /บ่า|ไหล่|epaulet|shoulder|pauldron/i],
  ["cape", /ผ้าคลุม|ผ้าห่ม|เสื้อคลุม|cloak|cape\b|mantle/i],
  ["hands", /ถุงมือ|สนับมือ|glove|gauntlet|bracer/i],
  ["feet", /รองเท้า|บูท|บู๊ต|boot|shoe|sandal/i],
  ["ring", /แหวน|\bring\b/i],
  ["chest", /เสื้อ|เกราะ|โค้ท|แจ็กเก็ต|เสื้อกั๊ก|ชุด|vest|coat|jacket|armou?r|shirt|robe|tunic|suit/i],
  ["charm", /เครื่องราง|ตะกรุด|ตรา|นาฬิกา|charm|talisman|pendant|badge|watch|trinket/i]
];
const ACCESSORY = ["head", "neck", "shoulder", "cape", "hands", "feet", "ring1", "ring2", "charm"];
const BODY = ["light", "medium", "heavy", "natural"];

export function allowedSlots(item) {
  const t = item?.system?.type?.value;
  if (item.type === "weapon") return ["weapon", "shield"];
  if (item.type !== "equipment") return [];
  if (BODY.includes(t)) return ["chest"];
  const hit = KEYWORDS.find(([, re]) => re.test(item.name))?.[0];
  if (hit === "ring" || t === "ring") return ["ring1", "ring2"];
  if (hit) return [hit];
  if (t === "clothing") return ["chest"];
  return ACCESSORY;
}

// proficiency check (warn only): can this character use the item without a penalty?
const ARMOR_PROF = { light: ["lgt", "ไม่ชำนาญเกราะเบา"], medium: ["med", "ไม่ชำนาญเกราะกลาง"], heavy: ["hvy", "ไม่ชำนาญเกราะหนัก"] };
export function profWarn(actor, item) {
  try {
    if (!actor || !item) return "";
    const T = actor.system?.traits ?? {};
    const has = (set, k) => (set?.value?.has ? set.value.has(k) : (set?.value ?? []).includes?.(k));
    if (item.system?.proficient === 1 || item.system?.proficient === true) return "";
    if (item.type === "equipment") {
      const e = ARMOR_PROF[item.system?.type?.value];
      if (e && !has(T.armorProf, e[0])) return `${e[1]}: เสียเปรียบทอย STR/DEX และร่ายเวทไม่ได้`;
      return "";
    }
    if (item.type === "weapon" && item.getFlag?.(MOD, "capacity")) {
      const lvl = gunLevel(actor), xp = gunXp(actor);
      if (lvl === 0) return `ยังไม่ชำนาญปืน (ฝึก ${xp}/${GUN_XP.trained}): โจมตี −2 และต้องร่ายสเปลล์บรรจุกระสุน (1 Action)`;
      if (lvl === 1) return `ฝึกปืนอยู่ (${xp}/${GUN_XP.expert}): ยังต้องร่ายสเปลล์บรรจุกระสุน`;
      return "";
    }
    if (item.type === "weapon") {
      const ty = String(item.system?.type?.value ?? ""), base = item.system?.type?.baseItem;
      const need = ty.startsWith("martial") ? "mar" : ty.startsWith("simple") ? "sim" : null;
      if (!need || has(T.weaponProf, need) || (base && has(T.weaponProf, base))) return "";
      return `ไม่ชำนาญอาวุธ${need === "mar" ? "สงคราม" : "ธรรมดา"}: ไม่บวก Proficiency Bonus ตอนโจมตี`;
    }
  } catch (e) { console.warn(MOD, "profWarn", e); }
  return "";
}
const CATS = [["all", "ทั้งหมด"], ["weapon", "อาวุธ"], ["armor", "เกราะ/สวมใส่"], ["use", "ของใช้"], ["tool", "เครื่องมือ"], ["misc", "อื่นๆ"], ["box", "ภาชนะ"]];
const catOf = (i) => (i.type === "weapon" ? "weapon" : i.type === "equipment" ? "armor" : i.type === "consumable" ? "use" : i.type === "tool" ? "tool" : i.type === "container" ? "box" : "misc");
const INV = ["weapon", "equipment", "consumable", "tool", "loot", "container"];

const ABIL = { str: "STR (พละกำลัง)", dex: "DEX (ความคล่องแคล่ว)", con: "CON (ความทนทาน)", int: "INT (สติปัญญา)", wis: "WIS (การรับรู้)", cha: "CHA (เสน่ห์)" };
const sgn = (n) => (n >= 0 ? "+" : "−") + Math.abs(Math.round(n));
// explanations shown when the mouse is over a number: what it is, and where it comes from
function tips(a, weapon, enc) {
  const A = a.system?.attributes ?? {}, ac = A.ac ?? {}, ab = a.system?.abilities ?? {}, lvl = num(a.system?.details?.level);
  const t = {};
  const armorName = ac.equippedArmor?.name;
  const parts = [`${armorName ? `เกราะ ${armorName}` : (ac.label || "ไม่ได้สวมเกราะ")} = ${num(ac.base)}${ac.formula && !armorName ? ` (สูตร ${ac.formula.replace(/@abilities\.(\w+)\.mod/g, (_, k) => k.toUpperCase()).replace(/@\S+/g, "…")})` : ""}`];
  if (num(ac.dex) && armorName) parts.push(`DEX ที่นับกับเกราะ ${sgn(ac.dex)} (รวมอยู่ในค่าข้างบนแล้ว)`);
  if (num(ac.bonus)) parts.push(`โบนัสจากไอเท็ม/เวท/เอฟเฟกต์ ${sgn(ac.bonus)}`);
  if (num(ac.cover)) parts.push(`ที่กำบัง ${sgn(ac.cover)}`);
  t.ac = `AC · Armor Class (ค่าเกราะ)\nศัตรูต้องทอยโจมตีได้ ${ac.value ?? "?"} ขึ้นไป ถึงจะโดนตัวละครนี้\n\nมาจาก:\n• ${parts.join("\n• ")}\n= ${ac.value ?? "?"}\n\nเปลี่ยนได้โดยสวม/ถอดเกราะในช่องลำตัว\nเกมนี้ไม่มีโล่ ให้ใช้ที่กำบัง (Cover) ซ่อนหลังสิ่งกีดขวางแทน`;
  const ia = A.init?.ability || "dex", im = num(ab[ia]?.mod), it = num(A.init?.total ?? im);
  t.init = `INITIATIVE · ลำดับการลงมือ\nตอนเริ่มคอมแบตให้ทอย d20 ${sgn(it)} ใครได้สูงสุดเล่นก่อน\n\nมาจาก:\n• ${ABIL[ia] ?? ia} ${sgn(im)}${Math.round(it - im) ? `\n• โบนัสอื่น (ฟีท/ไอเท็ม/เอฟเฟกต์) ${sgn(it - im)}` : ""}`;
  const mv = A.movement ?? {}, others = ["fly", "swim", "climb", "burrow"].filter((k) => num(mv[k])).map((k) => `${{ fly: "บิน", swim: "ว่ายน้ำ", climb: "ปีน", burrow: "ขุด" }[k]} ${num(mv[k])}`);
  const sp = a.items.find((i) => i.type === "race");
  t.speed = `SPEED · ความเร็วเดิน\nเดินได้ ${num(mv.walk)} ${mv.units || "ft"} ต่อเทิร์น (≈ ${Math.floor(num(mv.walk) / 5)} ช่อง ช่องละ 5 ฟุต)\n\nมาจาก:\n• ความเร็วพื้นฐานของ${sp ? ` ${sp.name}` : "สายพันธุ์"}\n• บวก/ลบจากไอเท็ม เอฟเฟกต์ และสถานะ (เช่น โดนจับ ล้ม หนักเกินไป)${others.length ? `\nความเร็วอื่น: ${others.join(", ")}` : ""}\n\nเดินแล้วดูที่แถบเดินใน HUD ว่าเหลือกี่ฟุต`;
  const pb = num(A.prof ?? 2);
  t.prof = `PROFICIENCY · โบนัสความเชี่ยวชาญ\nบวกเพิ่มทุกครั้งที่ทอยทักษะ อาวุธ เซฟ หรือเครื่องมือที่ตัวละครเชี่ยวชาญ\n\nมาจาก:\n• เลเวลรวม ${lvl} → ${sgn(pb)}\n  (เลเวล 1–4 = +2 · 5–8 = +3 · 9–12 = +4 · 13–16 = +5 · 17–20 = +6)`;
  const hp = A.hp ?? {}, cm = num(ab.con?.mod), hdn = a.items.filter((i) => i.type === "class").map((i) => `${i.name} ${i.system?.hd?.denomination ?? i.system?.hitDice ?? ""}`.trim()).join(", ");
  t.hp = `HIT POINTS · พลังชีวิต\nตอนนี้ ${num(hp.value)} จากสูงสุด ${num(hp.max)}${num(hp.temp) ? `\nHP ชั่วคราว ${num(hp.temp)} (โดนก่อน หายเมื่อพัก)` : ""}\nถึง 0 = ล้มสลบ\n\nHP สูงสุดมาจาก:\n• ลูกเต๋า HP ของคลาส (${hdn || "—"}) ต่อเลเวล\n• CON ${sgn(cm)} × เลเวล ${lvl}${num(hp.bonuses?.overall) ? `\n• โบนัสอื่น ${sgn(hp.bonuses.overall)}` : ""}\nฟื้นได้จากพักยาว พักสั้น (ใช้ Hit Dice) และเวทรักษา`;
  const hd = A.hd ?? {};
  t.hd = `HIT DICE · ลูกเต๋าฟื้นพลัง\nเหลือ ${num(hd.value)} จากทั้งหมด ${num(hd.max)} ลูก (${hdn || "ตามคลาส"})\nใช้ตอน "พักสั้น" ให้ DM เป็นคนสั่งพัก: ทอยลูกเต๋า + CON ${sgn(cm)} เพื่อฟื้น HP\nได้ลูกกลับครึ่งหนึ่ง (ปัดขึ้น) ของทั้งหมดเมื่อพักยาว\n\nจำนวนลูก = เลเวลรวม ${lvl}`;
  t.dmg = weapon ? `DAMAGE · ดาเมจต่อการโจมตี\nอาวุธ: ${weapon.name} (ช่องอาวุธ)\nสูตร: ${weapon.labels?.damage || "—"}\n\nมาจาก:\n• ลูกเต๋าดาเมจของอาวุธ (ข้อมูลไอเท็ม)\n• บวกค่า STR หรือ DEX ของตัวละคร และโบนัสอื่นที่มี รวมไว้ในสูตรแล้ว\nคริติคอลจะทอยลูกเต๋าเพิ่มเป็น 2 เท่า` : `DAMAGE · ดาเมจต่อการโจมตี\nยังไม่ได้ใส่อาวุธในช่อง "อาวุธ"\nลากอาวุธจากกระเป๋ามาวางเพื่อดูสูตรดาเมจ`;
  const th = enc.thresholds ?? {};
  t.wt = `น้ำหนักที่พก\nรวมน้ำหนักของทุกชิ้นในตัวละคร (รวมที่สวมอยู่) และเหรียญ\n• เกิน ${fmt(num(th.encumbered))} lb = เริ่มหนัก (ความเร็วลด)\n• เกิน ${fmt(num(th.heavilyEncumbered))} lb = หนักมาก\n• สูงสุด ${fmt(num(enc.max))} lb = ยกไม่ไหว\nคำนวณจากค่า STR (${num(ab.str?.value)}) ของตัวละคร และขนาดตัว`;
  return t;
}

const apps = new Map();
const { ApplicationV2 } = foundry.applications.api;

const slotMap = (a) => { const raw = a.getFlag(MOD, "slots") ?? {}; const out = {}; for (const [k, id] of Object.entries(raw)) if (SLOTS[k] && a.items.get(id)) out[k] = id; return out; };
const writeSlots = (a, m) => { const FR = foundry.data?.operators?.ForcedReplacement; return a.update(FR ? { [`flags.${MOD}.slots`]: new FR(m) } : { [`flags.${MOD}.==slots`]: m }); };   // v14: ForcedReplacement replaces the old "==slots" key

// first time for a character: whatever is equipped becomes slotted, everything else is put away
export async function initSlots(a, force = false) {
  if (!force && a.getFlag(MOD, "slots")) return false;
  const m = {}, used = new Set();
  const put = (slot, it) => { if (it && !m[slot] && !used.has(it.id)) { m[slot] = it.id; used.add(it.id); } };
  const set1 = a.getFlag("enhancedcombathud", "weaponSets")?.[a.getFlag("enhancedcombathud", "activeWeaponSet") || "1"];   // whatever set the HUD is showing now
  const byUuid = (u) => (u ? a.items.find((i) => i.uuid === u) : null);
  const eqW = a.items.filter((i) => i.type === "weapon" && i.system?.equipped);
  put("weapon", byUuid(set1?.primary) ?? eqW[0]);
  const sec = byUuid(set1?.secondary); if (sec?.type === "weapon") put("shield", sec);
  for (const i of a.items.filter((x) => x.type === "equipment" && x.system?.equipped)) {
    const al = allowedSlots(i); const s = al.find((k) => !m[k]); if (s) put(s, i);
  }
  const ups = [];
  for (const i of a.items) if ((i.type === "weapon" || i.type === "equipment") && !!i.system?.equipped !== used.has(i.id)) ups.push({ _id: i.id, "system.equipped": used.has(i.id) });
  if (ups.length) await a.updateEmbeddedDocuments("Item", ups);
  await writeSlots(a, m);
  await syncArgon(a, m);
  return true;
}
// mirror weapon + off-hand weapon into Argon weapon set 1
async function syncArgon(a, m) {
  try {
    const w = a.items.get(m.weapon), o = a.items.get(m.shield);
    const sets = foundry.utils.deepClone(a.getFlag("enhancedcombathud", "weaponSets") ?? {});
    sets["1"] = { primary: w?.uuid ?? null, secondary: o?.type === "weapon" ? o.uuid : null };
    await a.setFlag("enhancedcombathud", "weaponSets", sets);
    await a.setFlag("enhancedcombathud", "activeWeaponSet", "1");
    ui.ARGON?.refresh?.();
  } catch (e) { console.warn(MOD, "argon sync", e); }
  try { if (game.user.isGM) await syncReloadSpell(a); else if (game.users.activeGM) game.socket.emit(SOCK, { t: "x-gunspell", actor: a.uuid }); } catch (e) { console.warn(MOD, "reload spell", e); }
}

const CUP = (full) => `<svg class="cup ${full ? "full" : "empty"}" viewBox="0 0 24 24" aria-hidden="true"><path class="st" d="M8 1.5c-1 1.2 1 2 0 3.2M12 1.5c-1 1.2 1 2 0 3.2M16 1.5c-1 1.2 1 2 0 3.2"/><path class="bd" d="M4 8h14v6.5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path class="hl" d="M18 9.5h1.5a2.5 2.5 0 0 1 0 5H18"/><path class="sc" d="M3 21.5h16"/></svg>`;
const cups = (hd) => { const mx = Math.max(0, Math.min(40, Math.trunc(num(hd.max)))), v = Math.max(0, Math.trunc(num(hd.value))); return Array.from({ length: mx }, (_, i) => CUP(i < v)).join(""); };

let allowSheet = false;
export const sheetLocked = () => { try { return !game.user.isGM && game.settings.get(MOD, "sheetMode") === "bag"; } catch { return false; } };

const GL = {
  head: '<path d="M3 16h18M6 16c0-6 2-10 6-10s6 4 6 10M6.5 12.5h11"/>', neck: '<path d="M5 4c0 9 3 13 7 13s7-4 7-13"/><path d="M12 17l-2.2 2.5L12 23l2.2-3.5z"/>',
  shoulder: '<path d="M3 17c0-6 4-11 9-11s9 5 9 11z"/><path d="M7 17v3M17 17v3M12 6v11"/>', cape: '<path d="M8 3h8l4 18H4z"/><path d="M8 3c1 3 7 3 8 0"/>',
  chest: '<path d="M8 3L3 7l3 4 2-1v11h8V10l2 1 3-4-5-4c-1 2-5 2-6 0z"/>', hands: '<path d="M7 21v-6l-2-4 2-1 1 2V4h2v7V3h2v8V4h2v8l1-3 2 1-2 9v2z"/>',
  feet: '<path d="M8 3h6v9l6 3v5H5v-3l3-1z"/><path d="M8 17h12"/>', ring1: '<circle cx="12" cy="15" r="6"/><path d="M9 6h6l-1.5 3h-3z"/>', ring2: '<circle cx="12" cy="15" r="6"/><path d="M9 6h6l-1.5 3h-3z"/>',
  charm: '<path d="M12 2l8 5v10l-8 5-8-5V7z"/><path d="M12 8v8M8 12h8"/>', weapon: '<path d="M20 4L10 14M15 3h6v6M8 12l4 4M6 18l-3 3M5 14l5 5"/>', shield: '<path d="M12 2v13M9 15h6M12 15v6M10.5 4.5L12 2l1.5 2.5"/>'
};
const ASSET = "modules/arkane-1920s/assets/bag";
// which optional art files exist (so missing ones are never requested → no 404 spam); if the folder cannot be listed, request them all
let ASSETS = null, assetLoad = null;
const loadAssets = () => assetLoad ??= (async () => {
  try { const FP = foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker; const r = await FP.browse("data", ASSET); ASSETS = new Set(r.files.map((f) => decodeURIComponent(String(f).split("/").pop()))); } catch { ASSETS = null; }
})();
const hasArt = (f) => !ASSETS || ASSETS.has(f);
// purse: 1920s money (dnd5e currency keys re-labelled in items.js)
const PURSE = [["pp", 10], ["gp", 1], ["ep", 0.5], ["sp", 0.1], ["cp", 0.01]];
const money = (n) => `$${(Math.round(n * 100) / 100).toFixed(2)}`;
function purse(a) {
  const cur = a.system?.currency ?? {}, C = CONFIG.DND5E?.currencies ?? {};
  let total = 0;
  const chips = PURSE.map(([k, v]) => {
    const n = num(cur[k]); total += n * v;
    const lab = C[k]?.label ?? k, ab = C[k]?.abbreviation ?? k;
    const tip = `${lab} (${ab})\nหนึ่งชิ้นมีค่า ${money(v)}\nมี ${n} ชิ้น = ${money(n * v)}`;
    return `<div class="pc ${k}${n ? "" : " zero"}" data-tip="${esc(tip)}"><i class="ic">${hasArt(`coin-${k}.webp`) ? `<img src="${ASSET}/coin-${k}.webp" alt="" onerror="this.remove()">` : ""}<u>${esc(ab)}</u></i><b>${n}</b></div>`;
  }).join("");
  return `<div class="purse"><div class="pcs">${chips}</div><div class="ptot" data-tip="${esc(`เงินทั้งหมดรวมเป็นดอลลาร์\nธนบัตร $10 = 10 · ดอลลาร์ = 1 · ครึ่งดอลลาร์ = 0.50 · ไดม์ = 0.10 · เซนต์ = 0.01`)}"><small>เงินรวม</small><b>${money(total)}</b></div></div>`;
}

export class BagApp extends ApplicationV2 {
  static DEFAULT_OPTIONS = { classes: ["arkane-bag"], window: { icon: "fa-solid fa-suitcase", resizable: true }, position: { width: 980, height: 700 } };

  constructor(actor, options = {}) {
    super({ id: `arkane-bag-${actor.id}`, ...options });
    this.actor = actor; this.cat = "all"; this.q = ""; this.sel = null; this.drag = null;
  }
  get title() { return `กระเป๋า · ${this.actor.name}`; }

  // ------------------------------------------------ render
  tile(i, extra = "") {
    const q = num(i.system?.quantity ?? 1), w = num(i.system?.weight?.value ?? i.system?.weight);
    const pw = profWarn(this.actor, i);
    const tip = `${i.name}${q > 1 ? ` ×${q}` : ""}${w ? ` · ${fmt(w * q)} lb` : ""}${pw ? `\n⚠ ${pw}` : ""}`;
    return `<div class="tile${this.sel === i.id ? " sel" : ""}${pw ? " np" : ""}${extra}" draggable="true" data-id="${i.id}" data-cat="${catOf(i)}" data-name="${esc(i.name.toLowerCase())}" data-label="${esc(i.name.replace(/\s*·.*$/,""))}" title="${esc(tip)}"><img src="${esc(i.img)}" alt="">${q > 1 ? `<span class="q">${q}</span>` : ""}${pw ? `<span class="npb">!</span>` : ""}</div>`;
  }
  slotHtml(k, map, big = false) {
    const it = map[k] ? this.actor.items.get(map[k]) : null;
    return `<div class="slot${big ? " big" : ""}${it ? " full" : ""}" data-slot="${k}">${it ? this.tile(it) : `<svg class="gl" viewBox="0 0 24 24" aria-hidden="true">${GL[k] ?? ""}</svg>${hasArt(`slot-${k.replace(/\d$/, "")}.webp`) ? `<img class="phi" src="${ASSET}/slot-${k.replace(/\d$/, "")}.webp" alt="" onerror="this.remove()">` : ""}<span class="ph">${SLOTS[k][0]}</span>`}<em>${SLOTS[k][1]}</em></div>`;
  }

  async _renderHTML() {
    const a = this.actor;
    await loadAssets();
    await initSlots(a).catch((e) => console.warn(MOD, "initSlots", e));
    const map = slotMap(a), slotted = new Set(Object.values(map));
    const enc = a.system?.attributes?.encumbrance ?? {};
    const val = num(enc.value), max = num(enc.max), pct = max ? Math.min(100, (val / max) * 100) : 0, th = enc.thresholds ?? {};
    const state = max && val > num(th.heavilyEncumbered) ? ["หนักมาก", "bad"] : max && val > num(th.encumbered) ? ["เริ่มหนัก", "warn"] : ["พกสบาย", "ok"];
    const coins = purse(a);
    const pack = a.items.filter((i) => INV.includes(i.type) && !slotted.has(i.id)).sort((x, y) => CATS.findIndex((c) => c[0] === catOf(x)) - CATS.findIndex((c) => c[0] === catOf(y)) || x.name.localeCompare(y.name, "th"));
    const cells = Math.max(30, Math.ceil(pack.length / 6) * 6 + 6);
    const grid = pack.map((i) => this.tile(i, i.system?.equipped ? " eqx" : "")).join("") + Array.from({ length: Math.max(0, cells - pack.length) }, () => `<div class="cell"></div>`).join("");

    const w = a.items.get(map.weapon);
    const dmg = (() => { try { return w?.labels?.damage || w?.labels?.damages?.map?.((d) => d.label)?.join(" + ") || "—"; } catch { return "—"; } })();
    const A = a.system?.attributes ?? {}, ac = A.ac?.value ?? "—", hp = A.hp, lvl = a.system?.details?.level;
    const ini = Math.round(num(A.init?.total ?? A.init?.mod)), spd = A.movement?.walk ?? "—", prof = num(A.prof ?? 2);
    const hd = A.hd && Number.isFinite(Number(A.hd.max)) ? { value: A.hd.value ?? 0, max: A.hd.max } : null;
    const cls = a.items.filter((i) => i.type === "class").map((i) => i.name).join(" / ");

    const T = tips(a, w, enc), tp = (k) => ` data-tip="${esc(T[k])}"`;
    // selected item strip
    let detail = `<div class="det-empty">เลือกของเพื่อดูรายละเอียด · ลากใส่ช่องเพื่อสวม · ดับเบิลคลิกเพื่อสวม/ใช้<br>ลากออกไปปล่อยบน<b>โทเคนคนอื่น</b>เพื่อมอบให้ · ปล่อยบน<b>พื้น</b>เพื่อวางทิ้ง</div>`;
    const s = a.items.get(this.sel);
    if (s) {
      const q = num(s.system?.quantity ?? 1), uw = num(s.system?.weight?.value ?? s.system?.weight), inSlot = Object.entries(map).find(([, id]) => id === s.id)?.[0];
      const TE = foundry.applications.ux?.TextEditor?.implementation ?? globalThis.TextEditor; let desc = s.system?.description?.value ?? "";
      try { desc = await TE.enrichHTML(desc, { relativeTo: s, rollData: s.getRollData?.() ?? {} }); } catch {}
      const equipable = allowedSlots(s).length > 0, usable = s.type === "consumable" || (!equipable && [...(s.system?.activities ?? [])].length > 0);
      detail = `<button type="button" class="det-x" data-act="close" title="ปิด">✕</button><div class="det"><img src="${esc(s.img)}" alt=""><div class="det-h"><b>${esc(s.name)}</b><small>${esc(CATS.find((c) => c[0] === catOf(s))?.[1])}${uw ? ` · ${fmt(uw)} lb ต่อชิ้น` : ""}${inSlot ? ` · ${SLOTS[inSlot][1]}` : ""}</small></div>
<div class="det-q"><button type="button" data-act="dec">−</button><span>${q}</span><button type="button" data-act="inc">+</button></div>
<div class="det-b">${equipable ? `<button type="button" data-act="${inSlot ? "off" : "on"}">${inSlot ? "ถอดออก" : (s.type === "weapon" ? "ถือ" : "สวมใส่")}</button>` : ""}${usable ? `<button type="button" data-act="use" class="pri">ใช้</button>` : ""}<button type="button" data-act="del" class="dng">ทิ้ง</button></div></div>
<div class="det-d">${desc || "<i>ไม่มีคำอธิบาย</i>"}</div>`;
    }

    let gunBar = "";
    if (a.items.some((i) => i.type === "weapon" && i.getFlag?.(MOD, "capacity")) || gunXp(a) > 0) {
      const lv = gunLevel(a), xp = gunXp(a), goal = lv === 0 ? GUN_XP.trained : GUN_XP.expert, pc = lv === 2 ? 100 : Math.min(100, (xp / goal) * 100);
      const name = ["มือใหม่", "คุ้นมือ", "ชำนาญ"][lv];
      const tipG = lv === 2 ? "ชำนาญปืน: ยิงแม่นและไม่ต้องบรรจุกระสุน" : `ยิงปืนอีก ${Math.max(0, goal - xp)} นัดเพื่อขึ้นเป็น${lv === 0 ? "คุ้นมือ (หายโดน −2)" : "ชำนาญ (ไม่ต้องบรรจุ)"} · ตอนนี้${lv === 0 ? "โจมตีด้วยปืน −2 และ" : ""}ต้องร่ายสเปลล์บรรจุกระสุน`;
      gunBar = `<div class="hpb gunxp lv${lv}" title="${esc(tipG)}"><small>ประสบการณ์ปืน · ${name}</small><div class="hpbar"><i style="width:${pc}%"></i><span>${lv === 2 ? "ชำนาญ ✓" : `${xp} / ${goal} นัด`}</span></div></div>`;
    }
    return `<div class="bag2">
  <section class="doll">
    <div class="doll-title">${esc(a.name)}<small>${esc(cls)}${lvl ? ` · Level ${lvl}` : ""}</small></div>
    <div class="doll-body">
      <div class="col">${LEFT.map((k) => this.slotHtml(k, map)).join("")}</div>
      <div class="portrait">
        <div class="pframe"><img src="${esc(a.img)}" alt=""><div class="ac"${tp("ac")}><b>${esc(ac)}</b><small>AC</small></div></div>
        <div class="hexes"><div class="hex"${tp("init")}><b>${ini >= 0 ? "+" : ""}${ini}</b><small>INITIATIVE</small></div><div class="hex mid"${tp("speed")}><b>${esc(spd)}</b><small>SPEED</small></div><div class="hex"${tp("prof")}><b>+${prof}</b><small>PROFICIENCY</small></div></div>
        ${hp ? `<div class="hpb"${tp("hp")}><small>HIT POINTS</small><div class="hpbar"><i style="width:${Math.max(0, Math.min(100, (num(hp.value) / Math.max(1, num(hp.max))) * 100))}%"></i><span>${num(hp.value)} / ${num(hp.max)}${num(hp.temp) ? ` (+${num(hp.temp)})` : ""}</span></div></div>` : ""}
        ${hd ? `<div class="hpb"${tp("hd")}><small>HIT DICE · ถ้วยกาแฟพักผ่อน</small><div class="cups">${cups(hd)}<em>${num(hd.value)} / ${num(hd.max)}</em></div></div>` : ""}
        ${gunBar}
      </div>
      <div class="col">${RIGHT.map((k) => this.slotHtml(k, map)).join("")}</div>
    </div>
    <div class="doll-foot">
      ${this.slotHtml("weapon", map, true)}
      <div class="stats"><div class="stat"${tp("dmg")}><small>DAMAGE</small><b>${esc(dmg)}</b></div>
        <div class="shint">เอาเมาส์ชี้ที่ตัวเลขเพื่อดูว่าค่ามาจากไหน</div><div class="sbtns"><button type="button" data-act="alloff">ถอดทั้งหมด</button>${sheetLocked() ? "" : '<button type="button" data-act="sheet">เปิดชีต</button>'}</div></div>
      ${this.slotHtml("shield", map, true)}
    </div>
  </section>
  <section class="pack">
    <div class="pack-title">กระเป๋า</div>
    <input type="search" class="search" placeholder="ค้นหาของ…" value="${esc(this.q)}">
    <div class="tabs">${CATS.map(([k, l]) => `<button type="button" data-cat="${k}" class="${this.cat === k ? "on" : ""}">${l}</button>`).join("")}</div>
    <div class="grid" data-drop="bag">${grid}</div>
    <div class="detail">${detail}</div>
    <div class="wt"${tp("wt")}><div class="wl">น้ำหนัก ${fmt(val)} / ${fmt(max)} lb <span class="st ${state[1]}">${state[0]}</span></div><div class="bar"><i class="${state[1]}" style="width:${pct}%"></i></div>${coins}</div>
  </section>
</div>`;
  }

  _replaceHTML(result, content) {
    content.innerHTML = result;
    if (!this._bound) {
      this._bound = true;
      content.addEventListener("click", (ev) => this.#click(ev, content));
      content.addEventListener("dblclick", (ev) => this.#dbl(ev));
      content.addEventListener("input", (ev) => { if (ev.target.matches(".search")) { this.q = ev.target.value.trim().toLowerCase(); this.#filter(content); } });
      content.addEventListener("mouseover", (ev) => this.#tip(ev));
      content.addEventListener("mousemove", (ev) => this.#tipMove(ev));
      content.addEventListener("mouseleave", () => this.#tipHide());
      content.addEventListener("dragstart", (ev) => { this.#tipHide(); this.#dragStart(ev); });
      content.addEventListener("dragend", () => { this.drag = null; this.#clear(content); this.#fit(content); });
      content.addEventListener("dragover", (ev) => this.#dragOver(ev, content));
      content.addEventListener("dragleave", (ev) => ev.target.closest?.(".slot")?.classList.remove("ok", "bad"));
      content.addEventListener("drop", (ev) => { this.#drop(ev, content); this.#fit(content); });
      content.addEventListener("scroll", () => { content.scrollTop = 0; content.scrollLeft = 0; });
    }
    this.#filter(content);
    if (!this._ro) { this._ro = new ResizeObserver(() => this.#fit(content)); this._ro.observe(content); }
    this.#fit(content);
  }

  // The layout is designed for 980×650; shrink/grow it as one piece so resizing the window never breaks it
  #fit(content) {
    content.scrollTop = 0; content.scrollLeft = 0;
    const b = content.querySelector(".bag2"); if (!b) return;
    const W = 980, H = 650, cw = content.clientWidth, ch = content.clientHeight; if (!cw || !ch) return;
    const k = Math.max(0.3, Math.min(cw / W, ch / H, 1.6));
    b.style.transform = `scale(${k})`; b.style.left = `${Math.max(0, (cw - W * k) / 2)}px`; b.style.top = `${Math.max(0, (ch - H * k) / 2)}px`;
  }

  #tip(ev) {
    const el = ev.target.closest?.("[data-tip]");
    if (!el) return this.#tipHide();
    if (!this._tip) { this._tip = document.createElement("div"); this._tip.className = "arkane-tip"; document.body.appendChild(this._tip); }
    if (this._tipFor !== el) { this._tipFor = el; this._tip.textContent = el.dataset.tip; }
    this._tip.style.display = "block"; this.#tipMove(ev);
  }
  #tipMove(ev) {
    const t = this._tip; if (!t || t.style.display !== "block") return;
    const r = t.getBoundingClientRect(); let x = ev.clientX + 16, y = ev.clientY + 14;
    if (x + r.width > innerWidth - 8) x = ev.clientX - r.width - 16;
    if (y + r.height > innerHeight - 8) y = Math.max(8, innerHeight - r.height - 8);
    t.style.left = `${Math.max(8, x)}px`; t.style.top = `${y}px`;
  }
  #tipHide() { this._tipFor = null; if (this._tip) this._tip.style.display = "none"; }

  #filter(content) {
    for (const t of content.querySelectorAll(".grid .tile")) t.style.display = (this.cat === "all" || t.dataset.cat === this.cat) && (!this.q || t.dataset.name.includes(this.q)) ? "" : "none";
    content.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.cat === this.cat));
  }
  #clear(content) { content.querySelectorAll(".slot.ok,.slot.bad,.grid.over").forEach((e) => e.classList.remove("ok", "bad", "over")); }

  // ------------------------------------------------ drag & drop
  #dragStart(ev) {
    const t = ev.target.closest?.(".tile"); if (!t) return;
    const from = t.closest(".slot")?.dataset.slot ?? "bag";
    this.drag = { id: t.dataset.id, from };
    ev.dataTransfer.setData("text/plain", t.dataset.id); ev.dataTransfer.effectAllowed = "move";
    const it = this.actor.items.get(t.dataset.id); if (it) ev.dataTransfer.setData("application/json", JSON.stringify({ type: "Item", uuid: it.uuid, arkaneBag: this.actor.id, item: it.id }));
  }
  #dragOver(ev, content) {
    if (!this.drag) return;
    const slot = ev.target.closest?.(".slot"), grid = ev.target.closest?.(".pack");
    const item = this.actor.items.get(this.drag.id);
    if (slot && item) { const ok = allowedSlots(item).includes(slot.dataset.slot); slot.classList.add(ok ? "ok" : "bad"); if (ok) { ev.preventDefault(); ev.dataTransfer.dropEffect = "move"; } }
    else if (grid && this.drag.from !== "bag") { ev.preventDefault(); content.querySelector(".grid")?.classList.add("over"); }
  }
  async #drop(ev, content) {
    if (!this.drag) return;
    const { id, from } = this.drag; this.drag = null; this.#clear(content);
    const item = this.actor.items.get(id); if (!item) return;
    const slot = ev.target.closest?.(".slot")?.dataset.slot;
    ev.preventDefault();
    try {
      if (slot) { if (allowedSlots(item).includes(slot)) { await this.place(item, slot, from); const pw = profWarn(this.actor, item); if (pw) ui.notifications.warn(`${item.name}: ${pw}`); } else ui.notifications.warn(`${item.name} ใส่ช่องนี้ไม่ได้`); }
      else if (ev.target.closest?.(".pack") && from !== "bag") await this.take(item);
    } catch (e) { console.warn(MOD, "drop", e); ui.notifications.warn("ทำรายการไม่สำเร็จ ดู Console (F12)"); }
  }

  // ------------------------------------------------ equip logic
  async place(item, slot, from = "bag") {
    const a = this.actor, m = slotMap(a);
    for (const k of Object.keys(m)) if (m[k] === item.id) delete m[k];
    const prev = m[slot] ? a.items.get(m[slot]) : null, ups = [{ _id: item.id, "system.equipped": true }];
    if (prev && prev.id !== item.id) {
      // dragged from another slot onto an occupied one: swap if the other item may sit there, otherwise it goes back to the bag
      if (from !== "bag" && SLOTS[from] && allowedSlots(prev).includes(from)) m[from] = prev.id;
      else ups.push({ _id: prev.id, "system.equipped": false });
    }
    m[slot] = item.id;
    await a.updateEmbeddedDocuments("Item", ups); await writeSlots(a, m); await syncArgon(a, m);
  }
  async take(item) {
    const a = this.actor, m = slotMap(a);
    for (const k of Object.keys(m)) if (m[k] === item.id) delete m[k];
    await a.updateEmbeddedDocuments("Item", [{ _id: item.id, "system.equipped": false }]); await writeSlots(a, m); await syncArgon(a, m);
  }
  async autoEquip(item) {
    const m = slotMap(this.actor), al = allowedSlots(item); if (!al.length) return;
    const cur = Object.entries(m).find(([, id]) => id === item.id)?.[0];
    if (cur) return this.take(item);
    await this.place(item, al.find((k) => !m[k]) ?? al[0]);
    const pw = profWarn(this.actor, item); if (pw) ui.notifications.warn(`${item.name}: ${pw}`);
  }

  // ------------------------------------------------ clicks
  async #dbl(ev) {
    const t = ev.target.closest(".tile"); if (!t) return;
    const item = this.actor.items.get(t.dataset.id); if (!item) return;
    try {
      if (allowedSlots(item).length) return await this.autoEquip(item);
      if (item.type === "consumable" || [...(item.system?.activities ?? [])].length) return await item.use({ event: ev });
    } catch (e) { console.warn(MOD, "dbl", e); }
  }
  async #click(ev, content) {
    const tab = ev.target.closest(".tabs button");
    if (tab) { this.cat = tab.dataset.cat; return this.#filter(content); }
    const btn = ev.target.closest("[data-act]");
    if (btn) return this.#act(btn.dataset.act, ev);
    const tile = ev.target.closest(".tile");
    if (tile) { this.sel = this.sel === tile.dataset.id ? null : tile.dataset.id; return this.render(); }
  }
  async #act(act, ev) {
    const a = this.actor, item = a.items.get(this.sel);
    try {
      if (act === "sheet") { if (sheetLocked()) return; allowSheet = true; try { return a.sheet?.render(true); } finally { setTimeout(() => (allowSheet = false), 800); } }
      if (act === "alloff") {
        const ups = a.items.filter((i) => (i.type === "weapon" || i.type === "equipment") && i.system?.equipped).map((i) => ({ _id: i.id, "system.equipped": false }));
        if (ups.length) await a.updateEmbeddedDocuments("Item", ups);
        await writeSlots(a, {}); return await syncArgon(a, {});
      }
      if (act === "close") { this.sel = null; return this.render(); }
      if (!item) return;
      if (act === "inc" || act === "dec") return await item.update({ "system.quantity": Math.max(1, num(item.system.quantity ?? 1) + (act === "inc" ? 1 : -1)) });
      if (act === "on") return await this.autoEquip(item);
      if (act === "off") return await this.take(item);
      if (act === "use") return await item.use({ event: ev });
      if (act === "del") {
        const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: "ทิ้งของ" }, content: `<p>ทิ้ง <b>${esc(item.name)}</b> ออกจากกระเป๋าใช่ไหม? (${num(item.system.quantity ?? 1)} ชิ้น)</p>`, rejectClose: false });
        if (ok) { const m = slotMap(a); for (const k of Object.keys(m)) if (m[k] === item.id) delete m[k]; this.sel = null; await item.delete(); await writeSlots(a, m); await syncArgon(a, m); }
      }
    } catch (e) { console.warn(MOD, "bag act", e); ui.notifications.warn("ทำรายการไม่สำเร็จ ดู Console (F12)"); }
  }

  async close(options) { this._ro?.disconnect(); this._ro = null; apps.delete(this.actor.id); this._tip?.remove(); this._tip = null; return super.close(options); }
}

export function openBag(actor) {
  actor ??= canvas.tokens?.controlled?.[0]?.actor ?? game.user.character;
  if (!actor || !actor.isOwner) return ui.notifications.warn("เลือกตัวละครของตัวเองก่อน (คลิกโทเคน) แล้วกด B");
  let app = apps.get(actor.id);
  if (!app) { app = new BagApp(actor); apps.set(actor.id, app); }
  app.render({ force: true }).then(() => { try { app.bringToFront?.(); } catch {} }).catch((e) => console.warn(MOD, "bag render", e));
  return app;
}

// GM macro: slot every player character from what they currently have equipped (only those not slotted yet unless force)
export async function autoSlotAll(force = false) {
  if (!game.user.isGM) return 0;
  let n = 0;
  for (const a of game.actors.filter((x) => x.type === "character" && x.getFlag(MOD, "pc"))) { try { if (await initSlots(a, force)) n++; } catch (e) { console.warn(MOD, "autoSlot", a.name, e); } }
  return n;
}


// ------------------------------------------------ drag an item out of the bag: onto a token = give, onto the floor = drop
const SOCK = `module.${MOD}`;
const toGM = (d) => { if (game.user.isGM) return d.t === "x-ground" ? gmGround(d) : gmGive(d); if (!game.users.activeGM) return ui.notifications.warn("ไม่มี GM ออนไลน์ ย้ายของให้ไม่ได้ ให้ DM ทำเอง"); game.socket.emit(SOCK, d); };
async function askQty(title, line, q) {
  const D = foundry.applications.api.DialogV2;
  if (q <= 1) return (await D.confirm({ window: { title }, content: `<p>${line}</p>`, yes: { label: "ตกลง" }, no: { label: "ยกเลิก" }, rejectClose: false })) ? 1 : 0;
  return (await D.prompt({ window: { title }, content: `<p>${line}</p><div class="form-group"><label>จำนวน (มี ${q})</label><input type="number" name="qty" min="1" max="${q}" value="${q}" autofocus></div>`,
    ok: { label: "ตกลง", callback: (ev, btn) => Math.max(1, Math.min(q, Math.floor(Number(btn.form.elements.qty.value) || 1))) }, rejectClose: false })) || 0;
}
async function dropOut(data) {
  const from = game.actors.get(data.arkaneBag), it = from?.items.get(data.item);
  if (!from?.isOwner || !it) return;
  if (it.type === "container") return ui.notifications.warn("ย้ายกล่อง/กระเป๋าที่มีของข้างในยังไม่ได้ ให้ DM จัดการ");
  const q = Math.max(1, num(it.system?.quantity ?? 1));
  const at = canvas.tokens?.placeables?.filter((t) => t.actor && t.actor.id !== from.id && t.visible !== false && t.bounds.contains(data.x, data.y)).sort((a, b) => (a.document.sort ?? 0) - (b.document.sort ?? 0)).pop();
  if (at) {
    const n = await askQty("มอบของ", `มอบ <b>${esc(it.name)}</b> ให้ <b>${esc(at.name)}</b> ?`, q); if (!n) return;
    return toGM({ t: "x-give", from: from.uuid, item: it.id, to: at.actor.uuid, qty: n, by: game.user.id });
  }
  if (!game.modules.get("item-piles")?.active) return ui.notifications.info("วางของลงพื้นต้องเปิดโมดูล Item Piles · ลากไปปล่อยบนโทเคนเพื่อมอบให้แทนได้");
  const n = await askQty("วางของลงพื้น", `วาง <b>${esc(it.name)}</b> ไว้ตรงนี้ ? (คนอื่นเก็บได้)`, q); if (!n) return;
  return toGM({ t: "x-ground", from: from.uuid, item: it.id, scene: canvas.scene.id, x: data.x, y: data.y, qty: n });
}
export const takeCopy = async (from, it, qty) => {
  const have = Math.max(1, num(it.system?.quantity ?? 1)), n = Math.max(1, Math.min(have, Math.floor(qty || 1)));
  const o = it.toObject(); delete o._id; delete o.folder; delete o.sort; if (o.system) { o.system.quantity = n; if ("equipped" in o.system) o.system.equipped = false; if ("attuned" in o.system) o.system.attuned = false; }
  return { o, n, have };
};
export const removeFrom = async (from, it, n, have) => {
  if (n >= have) {
    const m = slotMap(from); let hit = false; for (const k of Object.keys(m)) if (m[k] === it.id) { delete m[k]; hit = true; }
    await it.delete(); if (hit) { await writeSlots(from, m); await syncArgon(from, m); }
  } else await it.update({ "system.quantity": have - n });
};
const say = (alias, html) => ChatMessage.create({ speaker: { alias }, content: html }).catch(() => {});
// runs on the GM client (players cannot edit other actors)
export async function gmGive(d) {
  try {
    const from = await fromUuid(d.from), to = await fromUuid(d.to), it = from?.items?.get(d.item); if (!from || !to || !it) return;
    const { o, n, have } = await takeCopy(from, it, d.qty);
    const same = to.items.find((i) => i.type === it.type && i.name === it.name && i.img === it.img && i.system?.quantity !== undefined && !i.system?.equipped);
    if (same) await same.update({ "system.quantity": num(same.system.quantity) + n }); else await to.createEmbeddedDocuments("Item", [o]);
    await removeFrom(from, it, n, have);
    await say(from.name, `<b>${esc(from.name)}</b> มอบ <b>${esc(it.name)}</b>${n > 1 ? ` ×${n}` : ""} ให้ <b>${esc(to.name)}</b>`);
  } catch (e) { console.warn(MOD, "give", e); ui.notifications.warn("ย้ายของไม่สำเร็จ ดู Console (F12)"); }
}
export async function gmGround(d) {
  try {
    const from = await fromUuid(d.from), it = from?.items?.get(d.item); if (!from || !it) return;
    const API = game.itempiles?.API; if (!API?.createItemPile) return ui.notifications.warn("ต้องเปิดโมดูล Item Piles");
    const { o, n, have } = await takeCopy(from, it, d.qty);
    await API.createItemPile({ position: { x: d.x, y: d.y }, sceneId: d.scene, items: [o], createActor: true, pileActorName: `${it.name} (ที่ถูกวางไว้)`, tokenOverrides: { name: it.name, texture: { src: it.img } } });
    await removeFrom(from, it, n, have);
    await say(from.name, `<b>${esc(from.name)}</b> วาง <b>${esc(it.name)}</b>${n > 1 ? ` ×${n}` : ""} ลงบนพื้น`);
  } catch (e) { console.warn(MOD, "ground", e); ui.notifications.warn("วางของไม่สำเร็จ ดู Console (F12)"); }
}

export function registerBag() {
  Hooks.on("dropCanvasData", (cv, data) => { if (data?.arkaneBag) { dropOut(data).catch((e) => console.warn(MOD, "dropOut", e)); return false; } });
  let t = null;
  const refresh = (actorId) => { const app = apps.get(actorId); if (!app) return; clearTimeout(t); t = setTimeout(() => app.render(), 120); };
  for (const h of ["createItem", "updateItem", "deleteItem"]) Hooks.on(h, (item) => item.parent && refresh(item.parent.id));
  Hooks.on("updateActor", (actor) => refresh(actor.id));
  // Players: opening their own character sheet (token double-click, sidebar, etc.) opens the bag instead
  Hooks.on("renderApplicationV2", (app) => {
    try {
      const a = app.document;
      if (!sheetLocked() || allowSheet || app instanceof BagApp || a?.documentName !== "Actor" || a.type !== "character" || !a.isOwner) return;
      if (!(app.constructor?.name !== "BagApp" && app.options?.classes?.some?.((c) => /sheet/i.test(c)) || a.sheet === app)) return;
      app.close({ animate: false }); openBag(a);
    } catch (e) { console.warn(MOD, "sheet lock", e); }
  });
  Hooks.on("getHeaderControlsApplicationV2", (app, controls) => {
    const a = app.document ?? app.actor;
    if (a?.documentName === "Actor" && a.type === "character" && a.isOwner && !(app instanceof BagApp)) controls.push({ icon: "fa-solid fa-suitcase", label: "กระเป๋า (Arkane)", action: "arkaneBag", onClick: () => openBag(a) });
  });
}
