// Perry · Hadar Hunger Gauge + RSF (rests since fed) + a small "Lens" panel (Gauge, RSF, Sanity, Dread, Lens Stage) — Dossier v8.2, section 3 and 11.
// The program owns the numbers. Phase 1 = Gauge, RSF, Satiated, Finishing Blow, long-rest accounting, Midnight Hunt result, panel.
// Not here yet (phase 2): Fear Check rolls, Sanity loss, Mental Break, Glitch, Stage 3 effects.
// State lives in actor flag  flags.arkane-1920s.lens  (scalar fields + two JSON strings so resets really replace).
const MOD = "arkane-1920s";
const esc = (s) => foundry.utils.escapeHTML(String(s ?? ""));
const isGM = () => !!game.users.activeGM?.isSelf;
export const isPerry = (a) => a?.getFlag?.(MOD, "pc") === "perry";
const perryActor = () => game.actors.find((a) => isPerry(a));

const DEF = { gx2: 0, rsf: 0, fedSince: false, huntFed: false, satiated: false, sanity: 10, starve: false, cap: "{}", fin: "[]" };
export const getLens = (a) => ({ ...DEF, ...(a.getFlag(MOD, "lens") ?? {}) });
const putLens = (a, patch) => a.update({ [`flags.${MOD}.lens`]: { ...getLens(a), ...patch } });
const pb = (a) => a.system.attributes?.prof ?? 2;
export const maxGauge = (a) => 10 * pb(a);                       // points; gx2 is stored in half-points
export const stageOf = (sanity) => (sanity >= 7 ? 1 : sanity >= 4 ? 2 : sanity >= 1 ? 3 : 4);
const STAGE_TXT = { 1: "เลนส์ยังอยู่", 2: "เลนส์ร้าว", 3: "เลนส์แตก (Hadar Unbound)", 4: "Mental Break" };
const rsfState = (r) => (r >= 3 ? ["Starving", "อดอาหาร", "#a33"] : r >= 1 ? ["Hungry", "หิว", "#b8860b"] : ["Satiated", "อิ่ม", "#3a7"]);
const warlockLevel = (a) => a.items.find((i) => i.type === "class" && /warlock/i.test(i.name))?.system.levels ?? a.system.details?.level ?? 1;

const toGM = (html) => ChatMessage.create({ whisper: ChatMessage.getWhisperRecipients("GM").map((u) => u.id), content: `<div class="rw-card">${html}</div>` });

// ---------------- core state changes
async function setExhaustion(a, up) {                            // Starving = Exhaustion 1 until fed
  try {
    const lens = getLens(a);
    const cur = a.system.attributes?.exhaustion ?? 0;
    if (up && !lens.starve) { await a.update({ "system.attributes.exhaustion": Math.min(6, cur + 1) }); return true; }
    if (!up && lens.starve) { await a.update({ "system.attributes.exhaustion": Math.max(0, cur - 1) }); return false; }
  } catch (e) { console.warn(MOD, "exhaustion", e); }
  return getLens(a).starve;
}

export async function feed(a, src) {
  const lens = getLens(a);
  const thp = a.system.abilities.cha.mod;                          // balanced for this world: CHA mod only (Dossier: level + CHA)
  const temp = Math.max(a.system.attributes.hp.temp ?? 0, thp);
  const wasStarving = lens.starve;
  if (wasStarving) await setExhaustion(a, false);
  await a.update({ "system.attributes.hp.temp": temp, [`flags.${MOD}.lens`]: { ...lens, gx2: 0, rsf: 0, fedSince: true, huntFed: src === "hunt" ? true : lens.huntFed, satiated: true, starve: false } });
  await toGM(`<b>${esc(a.name)}</b> กินอิ่ม (${esc(src)}) · RSF 0 · Gauge 0 · Temp HP ${temp}${wasStarving ? " · หาย Exhaustion จากอดอาหาร" : ""}${getLens(a).sanity <= 0 ? "<br><b>Sanity 0: ถ้าอยู่ใน Mental Break B จบได้แล้ว (DM ตัดสิน)</b>" : ""}`);
}

export async function addGauge(a, gain, tag, extra = "") {
  const lens = getLens(a), max = maxGauge(a);
  const gx2 = Math.min(2 * max, lens.gx2 + Math.round(gain * 2));
  if (gx2 === lens.gx2) return;
  await putLens(a, { gx2 });
  const half = lens.gx2 < max && gx2 >= max;
  await toGM(`<b>${esc(a.name)}</b> Gauge +${(gain).toFixed(1)} (${esc(tag)}) → ${(gx2 / 2).toFixed(1)}/${max}${half ? " · ผ่านครึ่ง (พักครั้งนี้ไม่นับ RSF)" : ""}${extra}`);
  if (gx2 >= 2 * max) await feed(a, "gauge");
}

// ---------------- damage -> gauge
const HADAR = /arms of hadar|hunger of hadar|vampiric touch|chill touch|circle of death|^hex$|lifedrinker/i;
function rateFor(item, type, stage) {
  const n = item?.name ?? "";
  if (HADAR.test(n)) return 1;
  if (type === "necrotic") return 1;                             // pact blade, Hex rider, anything necrotic she makes
  if (/eldritch blast/i.test(n)) return stage >= 3 ? 1 : 0.5;
  return 0;
}
const lastTargets = new Map();                                    // actor id -> {t, uuids}
const recentHit = new Map();                                      // target key -> {t, tag, tok}
const keyOf = (ac) => ac.token?.uuid ?? ac.uuid;
function targetsOf(msg, a) {
  const f = msg.flags?.dnd5e?.targets;
  if (Array.isArray(f) && f.length) { lastTargets.set(a.id, { t: Date.now(), uuids: f.map((x) => x.uuid) }); return f.map((x) => x.uuid); }
  const l = lastTargets.get(a.id);
  return l && Date.now() - l.t < 5 * 60 * 1000 ? l.uuids : [];
}

async function onMessage(msg) {
  if (!isGM()) return;
  const a = game.actors.get(msg.speaker?.actor);
  if (!isPerry(a)) return;
  const kind = msg.flags?.dnd5e?.roll?.type;
  if (kind !== "damage") { if (msg.flags?.dnd5e?.targets) targetsOf(msg, a); return; }
  const rolls = (msg.rolls ?? []).filter((r) => Number.isFinite(r.total));
  if (!rolls.length) return;
  const lens = getLens(a), stage = stageOf(lens.sanity);
  const item = msg.flags?.dnd5e?.item?.uuid ? fromUuidSync(msg.flags.dnd5e.item.uuid) : a.items.get(msg.flags?.dnd5e?.item?.id);
  let raw = 0, weighted = 0, hadarTag = false;
  for (const r of rolls) {
    const type = r.options?.type ?? r.options?.types?.[0];
    const rate = rateFor(item, type, stage);
    raw += r.total; weighted += r.total * rate;
    if (rate > 0 && (HADAR.test(item?.name ?? "") || type === "necrotic")) hadarTag = true;
  }
  if (weighted <= 0) return;
  const tag = item?.name ?? "damage";
  const uuids = targetsOf(msg, a);
  let counted = 0;
  const ledger = JSON.parse(lens.cap || "{}");
  if (!uuids.length) counted = weighted;                         // no target info: count the roll (GM can fix with the − button)
  for (const u of uuids) {
    const doc = fromUuidSync(u); const ta = doc?.actor ?? doc; if (!ta?.system?.attributes?.hp) continue;
    const typ = ta.system.details?.type?.value;
    if (["construct", "undead"].includes(typ)) continue;
    if (ta.hasPlayerOwner && !ta.getFlag(MOD, "later")) continue;      // friendly fire only counts in Break B (DM adds by hand)
    const id = ta.token?.id ?? ta.id, room = Math.max(0, ta.system.attributes.hp.max - (ledger[id] ?? 0));
    const lost = Math.min(raw, ta.system.attributes.hp.value, room);
    if (lost <= 0) continue;
    ledger[id] = (ledger[id] ?? 0) + lost;
    counted += weighted * (lost / raw);
    recentHit.set(keyOf(ta), { t: Date.now(), tag: hadarTag && !/eldritch blast/i.test(tag) ? "hadar" : "other", ta });
  }
  if (counted <= 0) return;
  await putLens(a, { cap: JSON.stringify(ledger) });
  await addGauge(a, counted, tag);
}

// kill -> Finishing Blow (CR >= 1/4 by pact blade necrotic or Hadar spell = +50% of capacity, once per target)
async function onHp(ta, changes) {
  if (!isGM()) return;
  const hp = changes?.system?.attributes?.hp?.value;
  if (hp === undefined || hp > 0) return;
  const rec = recentHit.get(keyOf(ta));
  if (!rec || Date.now() - rec.t > 90 * 1000 || rec.tag !== "hadar") return;
  recentHit.delete(keyOf(ta));
  const cr = ta.system.details?.cr ?? 0;
  if (cr < 0.25) return;
  const a = perryActor(); if (!a) return;
  const lens = getLens(a), fin = JSON.parse(lens.fin || "[]"), id = ta.token?.id ?? ta.id;
  if (fin.includes(id)) return;
  fin.push(id); await putLens(a, { fin: JSON.stringify(fin) });
  await addGauge(a, maxGauge(a) / 2, "Finishing Blow");
}

// ---------------- long rest accounting (Dossier 3.3 / 11.3)
async function onRest(a, result) {
  if (!isGM() || !isPerry(a) || (result?.type ?? "long") !== "long") return;
  const lens = getLens(a), max = maxGauge(a), stage = stageOf(lens.sanity);
  const notes = [];
  let rsf = lens.rsf;
  if (lens.rsf >= 1 && !lens.fedSince) notes.push("ไม่ได้ทำ Midnight Hunt ก่อนพัก ถือว่าเธอไม่ได้ล่า");
  if (lens.huntFed) notes.push("กินอิ่มจาก Hunt พักครั้งนี้ไม่นับ RSF");
  else if (lens.gx2 >= max) notes.push("Gauge ≥ 50% พักครั้งนี้ไม่นับ RSF");
  else rsf += stage === 3 ? 2 : 1;
  const ate = lens.fedSince;
  let sanity = lens.sanity;
  if (rsf < 3 && (stage <= 2 || (stage === 3 && ate))) sanity = Math.min(10, sanity + 1);
  const starve = rsf >= 3;
  if (starve && !lens.starve) { await setExhaustion(a, true); notes.push("Starving: ติด Exhaustion 1 ระดับจนกว่าจะอิ่ม · พักนี้ไม่ฟื้น Sanity"); }
  await putLens(a, { gx2: 0, cap: "{}", fin: "[]", fedSince: false, huntFed: false, satiated: false, rsf, sanity, starve: starve || lens.starve });
  const [en, th] = rsfState(rsf);
  const sym = rsf >= 3 ? "ตัวเย็น ปากซีด อาหารจืดสนิท หงุดหงิดง่าย · Fear Check ตอนเริ่มสู้" : rsf >= 1 ? "ตัวเย็น ปากซีด อาหารจืดสนิท · ต้องทอย Midnight Hunt ก่อน Long Rest ถัดไป" : "";
  await toGM(`<b>${esc(a.name)}</b> พักยาว: RSF ${rsf} (${en} · ${th}) · Gauge 0${sanity !== lens.sanity ? ` · Sanity ${sanity}` : ""}${notes.length ? "<br>" + notes.map(esc).join("<br>") : ""}${sym ? `<br><i>${esc(sym)}</i>` : ""}`);
}

// ---------------- Midnight Hunt result (called from session.js)
export async function huntOutcome(a, margin) {                    // margin = total - DC
  const out = margin >= 0 ? "pass" : margin >= -4 ? "minor" : "major";
  if (out !== "major") await feed(a, "hunt");
  return out;                                                       // major: no feed; Fear Check is phase 2
}

// ---------------- panel (Gauge, RSF, Sanity, Dread, Lens Stage)
const AppV2 = () => foundry.applications.api.ApplicationV2;
const panels = new Map();
function render(a) {
  const lens = getLens(a), max = maxGauge(a), g = lens.gx2 / 2, pct = Math.min(100, Math.round((g / max) * 100));
  const [en, th, col] = rsfState(lens.rsf), stage = stageOf(lens.sanity), dread = a.getFlag(MOD, "dread") ?? 0;
  const bar = `<div style="background:#222;border:1px solid #555;height:16px;border-radius:3px;overflow:hidden"><div style="width:${pct}%;height:100%;background:linear-gradient(90deg,#5a1a1a,#a02828)"></div></div>`;
  const gmb = (k, v) => game.user.isGM ? ` <span style="float:right">${[-1, 1].map((d) => `<button type="button" data-act="${k}" data-d="${d}" style="width:22px;line-height:16px;padding:0">${d > 0 ? "+" : "−"}</button>`).join("")}</span>` : "";
  const row = (label, val, k) => `<div style="margin:6px 0"><b>${label}</b>: ${val}${k ? gmb(k) : ""}</div>`;
  return `<div style="padding:6px 8px;font-size:13px">
    <div><b>Hunger Gauge</b> ${g.toFixed(1)} / ${max} ${game.user.isGM ? `<span style="float:right">${[-5, 5].map((d) => `<button type="button" data-act="gauge" data-d="${d}" style="width:28px;line-height:16px;padding:0">${d > 0 ? "+5" : "−5"}</button>`).join("")}</span>` : ""}</div>${bar}
    ${row("RSF", `<b style="color:${col}">${lens.rsf} · ${en} (${th})</b>${lens.satiated ? " · อิ่มอยู่" : ""}`, "rsf")}
    ${row("Lens Stage", `<b>${stage}</b> · ${STAGE_TXT[stage]}`, "")}
    ${row("Sanity", `<b>${lens.sanity}</b> / 10`, "sanity")}
    ${row("Dread", `<b>${dread}</b> / 5`, "dread")}
    ${game.user.isGM ? `<div style="margin-top:8px"><button type="button" data-act="feed">กินอิ่มทันที</button></div>` : ""}</div>`;
}
function openPanel(a) {
  const id = `arkane-lens-${a.id}`;
  const old = panels.get(a.id); if (old?.rendered) return old.bringToFront?.();
  const App = class extends AppV2() {
    static DEFAULT_OPTIONS = { id, classes: ["arkane-lens"], window: { title: `Lens · ${a.name}`, icon: "fa-solid fa-moon", resizable: false }, position: { width: 300, height: "auto" } };
    async _renderHTML() { return render(a); }
    _replaceHTML(html, content) {
      content.innerHTML = html;
      content.querySelectorAll("button[data-act]").forEach((b) => b.addEventListener("click", () => act(a, b.dataset.act, Number(b.dataset.d))));
    }
  };
  const app = new App(); panels.set(a.id, app); app.render({ force: true });
}
async function act(a, k, d) {
  if (!game.user.isGM) return;
  const lens = getLens(a), max = maxGauge(a);
  if (k === "gauge") await putLens(a, { gx2: Math.max(0, Math.min(2 * max, lens.gx2 + d * 2)) }).then(() => lens.gx2 + d * 2 >= 2 * max ? feed(a, "gm") : 0);
  else if (k === "rsf") { const rsf = Math.max(0, lens.rsf + d); await putLens(a, { rsf, starve: lens.starve }); if (rsf >= 3 && !lens.starve) { await setExhaustion(a, true); await putLens(a, { starve: true }); } if (rsf < 3 && lens.starve) { await setExhaustion(a, false); await putLens(a, { starve: false }); } }
  else if (k === "sanity") await putLens(a, { sanity: Math.max(0, Math.min(10, lens.sanity + d)) });
  else if (k === "dread") await a.setFlag(MOD, "dread", Math.max(0, Math.min(5, (a.getFlag(MOD, "dread") ?? 0) + d)));
  else if (k === "feed") await feed(a, "gm");
}
export const openLens = (a) => openPanel(a ?? perryActor());

export function registerGauge() {
  game.arkane ??= {};
  game.arkane.lens = { open: openLens, get: (a) => getLens(a ?? perryActor()), feed: (a, s) => feed(a ?? perryActor(), s ?? "gm") };
  Hooks.on("createChatMessage", (m) => { onMessage(m).catch((e) => console.warn(MOD, "gauge msg", e)); });
  Hooks.on("updateActor", (ac, ch) => {
    onHp(ac, ch).catch((e) => console.warn(MOD, "gauge hp", e));
    if (isPerry(ac)) { const p = panels.get(ac.id); if (p?.rendered) p.render(); }
  });
  Hooks.on("dnd5e.restCompleted", (ac, result) => { onRest(ac, result).catch((e) => console.warn(MOD, "gauge rest", e)); });
  Hooks.on("renderTokenHUD", (hud, html) => {
    const a = hud.object?.actor ?? hud.document?.actor; if (!isPerry(a) || !a.testUserPermission(game.user, "OWNER")) return;
    const root = html instanceof HTMLElement ? html : html[0]; const col = root.querySelector(".col.right") ?? root.querySelector(".right");
    if (!col || col.querySelector(".arkane-lens-btn")) return;
    const b = document.createElement("div"); b.className = "control-icon arkane-keep arkane-lens-btn"; b.title = "Lens · Hunger Gauge / RSF / Sanity / Dread";
    b.innerHTML = '<i class="fa-solid fa-moon"></i>'; b.addEventListener("click", () => openPanel(a)); col.appendChild(b);
  });
  Hooks.on("renderActorSheet", () => {});
}
