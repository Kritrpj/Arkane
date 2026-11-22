// Dinner mini-game (before the long rest): everyone secretly picks Appetizer / Main / Dessert / Beverage, the GM reveals,
// the dishes float beside every token on the map for the whole table, players chat, and the GM ends the dinner.
//   combos: the same theme on 2 dishes = good (+1d6), on 3+ dishes = excellent (+2d6); finishing all 4 courses = 4 Temp HP
//   beer: 3+ glasses = hangover next morning (Temp HP halved + Disadvantage on INT/WIS checks until the first short rest)
//   Temp HP is given while eating and is KEPT through the long rest (DM's choice): a snapshot is taken just before the rest and put back right after it
// State lives in the world setting "dinner" (GM writes; players send picks to the GM by socket). Everything here runs on every client.
// NOTE: written against dnd5e 6.x / Foundry v14 but NOT yet tested in a live world; every call is wrapped defensively.
const MOD = "arkane-1920s", SOCK = `module.${MOD}`;
const esc = (s) => foundry.utils.escapeHTML(String(s ?? ""));
const IMG = (n) => `modules/${MOD}/food/${n}.webp`;

const COURSES = [
  { title: "ออเดิร์ฟ", note: "Appetizer", dishes: [
    { id: "oysters", name: "หอยนางรมสด", themes: ["ทะเล"] }, { id: "bone-soup", name: "ซุปกระดูก", themes: ["เนื้อ"] },
    { id: "garlic-bread", name: "ขนมปังกระเทียม", themes: ["อบ"] }, { id: "seaweed-salad", name: "สลัดสาหร่าย", themes: ["ทะเล"] }] },
  { title: "จานหลัก", note: "Main Course", dishes: [
    { id: "grilled-fish", name: "ปลาย่าง", themes: ["ทะเล"] }, { id: "mustard-steak", name: "สเต็กมัสตาร์ด", themes: ["เนื้อ"] },
    { id: "meat-pie", name: "พายเนื้อ", themes: ["อบ", "เนื้อ"] }, { id: "squid-stew", name: "สตูหมึก", themes: ["ทะเล"] }] },
  { title: "ของหวาน", note: "Dessert", dishes: [
    { id: "fruit-pudding", name: "พุดดิ้งผลไม้", themes: ["นึ่ง"] }, { id: "chocolate-cake", name: "เค้กช็อกโกแลต", themes: ["อบ"] },
    { id: "preserved-peaches", name: "พีชดอง", themes: ["ผลไม้"] }, { id: "cheese-jam", name: "ชีสแยม", themes: ["นม"] }] },
  { title: "เครื่องดื่ม", note: "Beverage", dishes: [
    { id: "beer", name: "เบียร์", themes: ["แอลกอฮอล์"] }, { id: "cider", name: "ไซเดอร์อุ่น", themes: ["ผลไม้", "อุ่น"] },
    { id: "coffee", name: "กาแฟดำ", themes: ["อุ่น"] }, { id: "lemon-soda", name: "โซดามะนาว", themes: ["ซ่า"] }] }
];
const IDS = ["oysters", "bone-soup", "garlic-bread", "seaweed-salad", "grilled-fish", "mustard-steak", "meat-pie", "squid-stew", "fruit-pudding", "chocolate-cake", "preserved-peaches", "cheese-jam", "beer", "cider", "coffee", "lemon-soda"];
const DISH = {}; COURSES.forEach((c, ci) => c.dishes.forEach((d) => { d.img = IMG(({ "oysters": "appetizer-oysters", "bone-soup": "appetizer-bone-soup", "garlic-bread": "appetizer-garlic-bread", "seaweed-salad": "appetizer-seaweed-salad", "grilled-fish": "main-grilled-fish", "mustard-steak": "main-mustard-steak", "meat-pie": "main-meat-pie", "squid-stew": "main-squid-stew", "fruit-pudding": "dessert-fruit-pudding", "chocolate-cake": "dessert-chocolate-cake", "preserved-peaches": "dessert-preserved-peaches", "cheese-jam": "dessert-cheese-jam", "beer": "drink-beer", "cider": "drink-cider", "coffee": "drink-coffee", "lemon-soda": "drink-lemon-soda" })[d.id]); d.cut = d.img.replace("/food/", "/food/round/"); d.course = ci; DISH[d.id] = d; }));

// table-talk cards (only the two shown in the mock-up for now; the full list waits for the GM's approval)
// table-talk: every player gets ONE personal question about their own character (approved by the DM); anyone without a written card (e.g. Heinz) gets the open "tell a story" prompt
const PERSONAL = [[/mozxorion/i, "ตอนหนีออกจากบ้านครั้งนั้น คุณพกอะไรไปบ้าง และใครรู้ว่าคุณไป"], [/nincolas/i, "ของที่ขโมยมาได้ชิ้นแรกที่จำได้ไม่ลืมคืออะไร"], [/vivian/i, "คุณจำหมู่บ้านเดิมได้ด้วยกลิ่นหรือเสียงอะไร"], [/window/i, "ตราตำรวจนั้นยังบอกอะไรกับคุณในตอนนี้"]];
const STORY = "เล่าเรื่องหนึ่งจากชีวิตของตัวละครคุณที่คนในโต๊ะนี้ยังไม่เคยได้ฟัง จะเรื่องตลก เรื่องเศร้า หรือเรื่องน่าอายก็ได้";
const cardFor = (name) => PERSONAL.find(([re]) => re.test(name ?? ""))?.[1] ?? STORY;
const talkHtml = (st) => (st.seats ?? []).map((s, i) => { const on = i === (st.turn ?? 0); return `<div style="opacity:${on ? 1 : 0.5};padding:2px 0"><b style="color:${on ? "#e2bc5a" : "#ecdcb8"}">${on ? "▶ " : ""}${esc(s.name)}</b><span style="${on ? "font-size:17px;font-weight:bold" : "font-size:14px"}"> · ${esc(cardFor(s.name))}</span></div>`; }).join("");

const PER_DISH = 1;   // Temp HP for each dish eaten from the tray; eating all four adds the combo dice (1d6 / 2d6)
const partyActors = () => game.actors.filter((a) => a.type === "character" && a.getFlag(MOD, "pc") && !a.getFlag(MOD, "later") && !a.getFlag(MOD, "retired"));
const getState = () => foundry.utils.deepClone(game.settings.get(MOD, "dinner") ?? { phase: "idle" });
const setState = (s) => game.settings.set(MOD, "dinner", s);
const gm = () => game.users.activeGM?.isSelf;

// ---------------------------------------------------------------- cloches in the kitchen (one covered tray per player; Sarge carries it to the table)
const LODGE = "Chapter 2.6: ลอดจ์ชั้น 1 (โรงเตี๊ยมสาขา)", CLOCHE_IMG = `modules/${MOD}/food/cloche.webp`, TRAY_IMG = `modules/${MOD}/food/tray.webp`;
const KITCHEN = [[2030, 205], [2100, 205], [2170, 205], [2030, 265], [2100, 265], [2170, 265]];   // top-left of 60 px tokens inside the kitchen of lodge-ground-night
const lodgeScene = () => game.scenes.getName(LODGE);
const clochesOf = (sc) => sc?.tokens.filter((t) => t.getFlag(MOD, "cloche")) ?? [];
const mugsOf = (sc) => sc?.tokens.filter((t) => t.getFlag(MOD, "mug")) ?? [];   // an extra beer waiting in the kitchen for Sarge
const carriedOf = (sc, id) => [...clochesOf(sc), ...mugsOf(sc)].filter((c) => (c.getFlag(MOD, "cloche") ?? c.getFlag(MOD, "mug"))?.carriedBy === id);
const dishesOf = (sc) => sc?.tokens.filter((t) => t.getFlag(MOD, "dish")) ?? [];
const isSarge = (t) => t?.actor?.getFlag(MOD, "npc") === "innkeeper";
async function addCloche(seat, idx) {
  try {
    const sc = lodgeScene(); if (!sc || clochesOf(sc).some((t) => t.getFlag(MOD, "cloche")?.actorId === seat.actorId)) return;
    const [x, y] = KITCHEN[idx % KITCHEN.length];
    await sc.createEmbeddedDocuments("Token", [{ name: `ถาดของ ${seat.name}`, texture: { src: CLOCHE_IMG }, x, y, width: 0.6, height: 0.6, lockRotation: true, disposition: 0, displayName: 30, sort: 50, flags: { [MOD]: { cloche: { actorId: seat.actorId } } } }]);
  } catch (e) { console.warn(MOD, "cloche add", e); }
}
async function addMug(seat) {
  try {
    const sc = lodgeScene(); if (!sc) return;
    const used = [...clochesOf(sc), ...mugsOf(sc)], slot = KITCHEN.find(([x, y]) => !used.some((t) => Math.abs(t.x - x) < 45 && Math.abs(t.y - y) < 45)) ?? KITCHEN[0];
    await sc.createEmbeddedDocuments("Token", [{ name: `เบียร์ของ ${seat.name}`, texture: { src: DISH.beer.cut }, x: slot[0], y: slot[1], width: 0.5, height: 0.5, lockRotation: true, disposition: 0, displayName: 30, sort: 55, flags: { [MOD]: { mug: { actorId: seat.actorId } } } }]);
  } catch (e) { console.warn(MOD, "mug add", e); }
}
async function drinkBeer(actorId, tokenId, byId = actorId) {
  const st = getState(); if (st.phase !== "table") return;
  const o = st.seats.find((x) => x.actorId === actorId), s = st.seats.find((x) => x.actorId === byId); if (!o || !s) return;
  for (const sc of game.scenes) {
    const dt = sc.tokens.get(tokenId); if (!dt) continue;
    const mf = dt.getFlag(MOD, "mug"), f = mf ?? dt.getFlag(MOD, "dish"); if ((!mf && !f?.beer) || f?.actorId !== actorId || mf?.carriedBy) return;
    const g = sc.grid?.size || 100, size = dt.width * g, fx = { t: "fx-eat", actorId: byId, dish: "beer", sceneId: sc.id, sx: dt.x + size / 2, sy: dt.y + size / 2, size };
    game.socket.emit(SOCK, fx); flyDish(fx); await dt.delete().catch(() => {});
    s.beers = (s.beers ?? 0) + 1; o.mugs = Math.max(0, (o.mugs ?? 0) - 1); await setState(st);
    const a = game.actors.get(byId);
    ChatMessage.create({ speaker: a ? ChatMessage.getSpeaker({ actor: a }) : undefined, content: `<div class="rw-card"><b>${esc(s.name)}</b> ดื่มเบียร์${byId !== actorId ? ` <i>(ของ ${esc(o.name)})</i>` : ""}แก้วที่ <b>${s.beers}</b>${s.beers >= 3 ? ` <span style="color:#f0b9a6">· เช้าพรุ่งนี้เมาค้าง</span>` : ""}</div>` });
    return;
  }
}
async function clearCloches(actorId) {
  try {
    for (const sc of game.scenes) { const ids = [...clochesOf(sc).filter((t) => !actorId || t.getFlag(MOD, "cloche")?.actorId === actorId), ...dishesOf(sc).filter((t) => !actorId || t.getFlag(MOD, "dish")?.actorId === actorId), ...mugsOf(sc).filter((t) => !actorId || t.getFlag(MOD, "mug")?.actorId === actorId)].map((t) => t.id); if (ids.length) await sc.deleteEmbeddedDocuments("Token", ids); }
  } catch (e) { console.warn(MOD, "cloche clear", e); }
}
const dist = (a, b) => { const g = a.parent?.grid?.size || 100, ca = { x: a.x + a.width * g / 2, y: a.y + a.height * g / 2 }, cb = { x: b.x + b.width * g / 2, y: b.y + b.height * g / 2 }; return Math.hypot(ca.x - cb.x, ca.y - cb.y) / g; };
async function serveSeat(actorId) {
  const st = getState(); if (st.phase !== "table") return;
  const s = st.seats.find((x) => x.actorId === actorId); if (!s || s.served !== false) return;
  s.served = true; s.eaten = [false, false, false, false]; await setState(st);
  try {
    for (const sc of game.scenes) for (const t of clochesOf(sc).filter((q) => q.getFlag(MOD, "cloche")?.actorId === actorId)) {
      const g = sc.grid?.size || 100, cx = t.x + t.width * g / 2, cy = t.y + t.height * g / 2, sz = 0.5, o = 0.27 * g, sign = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
      await sc.createEmbeddedDocuments("Token", s.picks.map((id, k) => ({ name: DISH[id]?.name ?? "", texture: { src: DISH[id].cut }, x: Math.round(cx + sign[k][0] * o - sz * g / 2), y: Math.round(cy + sign[k][1] * o - sz * g / 2), width: sz, height: sz, lockRotation: true, disposition: 0, displayName: 20, sort: 60, flags: { [MOD]: { dish: { actorId, idx: k } } } })));
      await sc.deleteEmbeddedDocuments("Token", [t.id]);   // the lid comes off: the tray gives way to the four dishes
    }
  } catch (e) { console.warn(MOD, "serve dishes", e); }
  ChatMessage.create({ content: `<div class="rw-card"><b>ซาร์จ</b> เปิดฝาครอบให้ <b>${esc(s.name)}</b> · คลิกขวาที่อาหารบนโต๊ะเพื่อกิน</div>` });
}
async function eatDish(ownerId, idx, byId = ownerId) {
  const st = getState(); if (st.phase !== "table") return;
  const o = st.seats.find((x) => x.actorId === ownerId), e = st.seats.find((x) => x.actorId === byId); if (!o || !e || o.served !== true) return;
  o.eaten ??= [false, false, false, false]; if (!(idx >= 0 && idx < 4) || o.eaten[idx]) return;
  o.eaten[idx] = true;
  const dishId = o.picks[idx]; e.ate ??= []; e.ate.push(dishId); if (dishId === "beer") e.beers = (e.beers ?? 0) + 1;
  for (const sc of game.scenes) {
    const dt = dishesOf(sc).find((t) => t.getFlag(MOD, "dish")?.actorId === ownerId && t.getFlag(MOD, "dish")?.idx === idx); if (!dt) continue;
    const g = sc.grid?.size || 100, size = dt.width * g, fx = { t: "fx-eat", actorId: byId, dish: dishId, sceneId: sc.id, sx: dt.x + size / 2, sy: dt.y + size / 2, size };
    game.socket.emit(SOCK, fx); flyDish(fx); dt.delete().catch(() => {});
  }
  const n = e.ate.length, four = n % 4 === 0, cb = comboOf(e.ate.slice(Math.max(0, n - 4), n)); let rolled = "";   // every full set of 4 dishes eaten is judged as its own combo
  if (four) { e.combos ??= []; e.combos.push(cb.label); }
  if (four && cb.dice) { const r = await new Roll(cb.dice).evaluate(); e.bonus = (e.bonus ?? 0) + r.total; rolled = r.dice[0]?.results?.map((x) => x.result).join(", "); }
  const total = n * PER_DISH + (e.bonus ?? 0), a = game.actors.get(byId);
  await setState(st);
  if (a) { try { const cur = Number(a.system?.attributes?.hp?.temp) || 0; await a.update({ "system.attributes.hp.temp": Math.max(cur, total) }); } catch (err) { console.warn(MOD, "eat temp hp", err); } }
  ChatMessage.create({ speaker: a ? ChatMessage.getSpeaker({ actor: a }) : undefined, content: `<div class="rw-card"><b>${esc(e.name)}</b> กิน <b>${esc(DISH[dishId]?.name)}</b>${byId !== ownerId ? ` <i>(แย่งจานของ ${esc(o.name)})</i>` : ""} · Temp HP <b>${total}</b>${four ? `<br>กินครบชุดที่ ${n / 4} (${n} จาน) · ${esc(cb.label)}${cb.dice ? ` +${cb.dice} → ${rolled}` : ""}` : ""}</div>` });
}

function comboOf(picks) {
  const cnt = {};
  for (const id of picks) for (const t of DISH[id]?.themes ?? []) cnt[t] = (cnt[t] ?? 0) + 1;
  let best = null, n = 0;
  for (const [t, c] of Object.entries(cnt)) if (c > n) { best = t; n = c; }
  const tier = n >= 3 ? 2 : n === 2 ? 1 : 0;
  return { theme: tier ? best : null, n, tier, hits: tier ? picks.filter((id) => DISH[id].themes.includes(best)) : [], dice: tier === 2 ? "2d6" : tier === 1 ? "1d6" : "", label: tier === 2 ? "คอมโบเยี่ยม" : tier === 1 ? "คอมโบดี" : "ไม่มีคอมโบ" };
}

// ---------------------------------------------------------------- GM actions
async function startDinner() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  if (getState().phase !== "idle" && !(await foundry.applications.api.DialogV2.confirm({ window: { title: "มื้อค่ำ" }, content: "<p>มีมื้อค่ำค้างอยู่ เริ่มใหม่ไหม (ของเดิมจะหายไป)</p>", rejectClose: false }).catch(() => false))) return;
  const list = partyActors();
  if (!list.length) return ui.notifications.warn("ไม่เจอตัวละครของผู้เล่น");
  const content = `<form><p>ใครอยู่ที่โต๊ะนี้บ้าง</p>${list.map((a) => `<label style="display:flex;gap:8px;align-items:center;margin:4px 0"><input type="checkbox" name="${a.id}" checked> ${esc(a.name)}</label>`).join("")}</form>`;
  const ids = await foundry.applications.api.DialogV2.wait({ window: { title: "มื้อค่ำ · เลือกคนที่ร่วมโต๊ะ" }, content, rejectClose: false,
    buttons: [{ action: "go", label: "เปิดโต๊ะ ให้ทุกคนเลือกเมนู", default: true, callback: (ev, btn) => [...btn.form.querySelectorAll("input:checked")].map((i) => i.name) }, { action: "x", label: "ยกเลิก", callback: () => null }] }).catch(() => null);
  if (!Array.isArray(ids) || !ids.length) return;
  await clearCloches();
  await setState({ phase: "pick", sceneId: canvas.scene?.id ?? null, card: null, seats: ids.map((id) => ({ actorId: id, name: game.actors.get(id)?.name ?? "?", confirmed: false, picks: [], beers: 0 })) });
}
async function reveal(force) {
  const st = getState(); if (st.phase !== "pick") return;
  if (st.seats.some((s) => !s.confirmed)) {
    if (!force) return ui.notifications.warn("ยังมีคนไม่ยืนยัน (กด 'เปิดเลย' เพื่อข้ามคนที่ยังไม่เลือก)");
    for (const s of st.seats.filter((x) => !x.confirmed)) await clearCloches(s.actorId);
    st.seats = st.seats.filter((s) => s.confirmed);
  }
  if (!st.seats.length) return ui.notifications.warn("ยังไม่มีใครยืนยันเมนู");
  st.phase = "table"; st.turn = Math.floor(Math.random() * st.seats.length);   // whose personal card is highlighted
  const sc = lodgeScene();   // a covered tray waits in the kitchen for each player; without the lodge scene everyone is served at once (old behaviour)
  for (const [i, s] of st.seats.entries()) { await addCloche(s, i); s.served = !clochesOf(sc).some((t) => t.getFlag(MOD, "cloche")?.actorId === s.actorId); }
  await setState(st);
  const waiting = st.seats.some((s) => !s.served);
  ChatMessage.create({ content: waiting ? `<div class="rw-card"><div class="rw-title">ออเดอร์เข้าครัวแล้ว</div>ซาร์จกำลังยกถาดครอบฝามาเสิร์ฟทีละโต๊ะ คุยกันรอได้เลย</div>` : `<div class="rw-card"><div class="rw-title">จานของทุกคนขึ้นโต๊ะแล้ว!</div>ทุกคนเห็นจานของกันและกัน คุยกันที่โต๊ะได้เลย</div>` });
}
async function newCard() {   // highlight the next speaker
  const st = getState(); if (st.phase !== "table" || !st.seats?.length) return;
  st.turn = ((st.turn ?? 0) + 1) % st.seats.length; await setState(st);
}
async function finish() {
  const st = getState(); if (st.phase !== "table") return;
  const rows = [];
  for (const s of st.seats) {
    const a = game.actors.get(s.actorId); if (!a) continue;
    const cb = { label: (s.combos ?? []).join(" + ") || "ไม่มีคอมโบ" }, n = (s.ate ?? []).length, got = n * PER_DISH + (s.bonus ?? 0), hang = (s.beers ?? 0) >= 3;
    try { if (hang || got > 0) await a.setFlag(MOD, "dinnerBuff", { temp: got, hang, beers: s.beers ?? 0, combo: cb.label }); else await a.unsetFlag(MOD, "dinnerBuff"); } catch (e) { console.warn(MOD, "dinner flag", e); }
    rows.push(`<div style="border-bottom:1px solid #3d2f1c;padding:6px 0"><div style="display:flex;justify-content:space-between"><b>${esc(s.name)}</b><b>${esc(cb.label)}</b></div>
      <div style="opacity:.8;font-size:.9em">${(s.ate ?? []).map((id) => esc(DISH[id]?.name)).join(" · ") || "ยังไม่ได้กินอะไร"}${s.beers > 1 ? ` · เบียร์ × ${s.beers}` : ""}</div>
      <div>กินแล้ว ${n} จาน · Temp HP <b>${got}</b>${hang ? ` · <span style="color:#f0b9a6">ดื่มเบียร์ ${s.beers} แก้ว เช้าพรุ่งนี้เมาค้าง</span>` : ""}</div></div>`);
  }
  await ChatMessage.create({ content: `<div class="rw-card"><div class="rw-title">มื้อค่ำเสร็จแล้ว</div>${rows.join("")}<small>Temp HP ได้ตอนกินและเก็บไว้แม้พักยาว · เมาค้างมีผลตอนพักยาวจบ</small></div>` });
  await clearCloches();
  await setState({ phase: "idle" });
}
const cancelDinner = async () => { await clearCloches(); await setState({ phase: "idle" }); };

const okFrom = (d, uid) => !uid || game.users.get(uid)?.isGM || !!game.actors.get(d.by ?? d.actorId)?.testUserPermission(game.users.get(uid), "OWNER");
function handleGM(d, uid) {   // messages from players, handled on the GM's client only
  if (!okFrom(d, uid)) return;
  const st = getState();
  if (d.t === "d-pick" && st.phase === "pick") {
    const s = st.seats.find((x) => x.actorId === d.actorId); if (!s || !Array.isArray(d.picks) || d.picks.length !== 4) return;
    if (!d.picks.every((id, i) => COURSES[i].dishes.some((x) => x.id === id))) return;
    s.picks = d.picks; s.confirmed = true; s.beers = 0; setState(st);
    addCloche(s, st.seats.indexOf(s));   // the order becomes a covered tray in the kitchen as soon as the player confirms
  } else if (d.t === "d-beer" && st.phase === "table") {
    const s = st.seats.find((x) => x.actorId === d.actorId); if (!s || s.served === false || (s.beers ?? 0) + (s.mugs ?? 0) >= 6) return;
    if (!lodgeScene()) { s.beers = (s.beers ?? 0) + 1; setState(st); return; }   // no lodge scene: counted at once (old behaviour)
    s.mugs = (s.mugs ?? 0) + 1; setState(st); addMug(s);   // the extra beer waits in the kitchen until Sarge brings it
    ChatMessage.create({ content: `<div class="rw-card"><b>${esc(s.name)}</b> สั่งเบียร์เพิ่ม · รอซาร์จไปเอาจากครัว</div>` });
  } else if (d.t === "d-drink" && st.phase === "table") drinkBeer(d.actorId, d.tokenId, d.by ?? d.actorId).catch((e) => console.warn(MOD, "drink", e));
  else if (d.t === "d-eat" && st.phase === "table") eatDish(d.actorId, Number(d.idx), d.by ?? d.actorId).catch((e) => console.warn(MOD, "eat", e));
}
const toGM = (m) => { if (gm()) handleGM(m); else game.socket.emit(SOCK, m); };

// ---------------------------------------------------------------- panels
const pickSel = {};
function css() {
  if (document.getElementById("adn-css")) return;
  const s = document.createElement("style"); s.id = "adn-css";
  s.textContent = `.adn-pan{position:fixed;z-index:70;background:#1a130d;border:2px solid #7a5f2a;border-radius:12px;color:#ecdcb8;box-shadow:0 8px 30px #000a;font-size:15px}
.adn-pan h2{margin:0;border:0;font-size:24px;color:#e2bc5a}.adn-sub{color:#a8977a}
.adn-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px}
.adn-card{all:unset;box-sizing:border-box;cursor:pointer;background:#261c13;border:3px solid #3d2f1c;border-radius:10px;padding:8px;display:flex;flex-direction:column;align-items:center;gap:4px;text-align:center}
.adn-card img{width:92px;height:92px;border-radius:8px;border:0;object-fit:cover}.adn-card.sel{border-color:#e2bc5a;background:#3a2c14}.adn-card:hover{border-color:#a8873a}
.adn-btn{all:unset;box-sizing:border-box;cursor:pointer;background:#e2bc5a;color:#1a130d;font-weight:700;border-radius:8px;padding:10px 16px;text-align:center}.adn-btn:hover{background:#f0cd75}
.adn-btn.ghost{background:#3d2f1c;color:#ecdcb8}.adn-btn[disabled]{opacity:.4;cursor:not-allowed}
.adn-seat{background:#261c13;border:2px solid #7a5f2a;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:6px}
.adn-dish{display:flex;gap:8px;align-items:center;background:#1f1710;border:2px solid #3d2f1c;border-radius:8px;padding:4px}.adn-dish.hit{border-color:#e2bc5a;background:#3a2c14}
.adn-dish img{width:44px;height:44px;border-radius:6px;object-fit:cover}`;
  document.head.appendChild(s);
}
const place = (id, cls, style, html) => {
  let el = document.getElementById(id);
  if (!el) { el = document.createElement("div"); el.id = id; document.body.appendChild(el); }
  el.className = `adn-pan ${cls ?? ""}`; el.setAttribute("style", style); el.innerHTML = html; return el;
};
const drop = (id) => document.getElementById(id)?.remove();
const mySeat = (st, pending) => st.seats?.find((s) => game.actors.get(s.actorId)?.isOwner && (!pending || !s.confirmed));

function pickWindow(st) {
  const seat = game.user.isGM ? null : mySeat(st, true);
  if (st.phase !== "pick" || !seat) return drop("adn-pick");
  const sel = (pickSel[seat.actorId] ??= {});
  const el = place("adn-pick", "", "left:50%;top:50%;transform:translate(-50%,-50%);width:min(980px,94vw);max-height:92vh;overflow:auto;padding:18px;display:flex;flex-direction:column;gap:12px",
    `<div><h2>มื้อค่ำ · เลือกให้ ${esc(seat.name)}</h2><div class="adn-sub">เลือกครบ 4 คอร์ส เลือกจากชื่อเมนูอย่างเดียว หน้าตาอาหารจะรู้ตอนซาร์จเปิดฝาครอบ</div></div>
    ${COURSES.map((c, ci) => `<div><div style="margin-bottom:4px"><b style="color:#e2bc5a;font-size:18px">${c.title}</b> <span class="adn-sub">${c.note}</span></div><div class="adn-grid">${c.dishes.map((d) => `<button class="adn-card ${sel[ci] === d.id ? "sel" : ""}" data-c="${ci}" data-id="${d.id}" style="min-height:64px;justify-content:center"><b style="font-size:17px">${esc(d.name)}</b></button>`).join("")}</div></div>`).join("")}
    <button class="adn-btn" id="adn-ok" ${[0, 1, 2, 3].every((i) => sel[i]) ? "" : "disabled"}>ยืนยันเมนูของฉัน</button>`);
  el.querySelectorAll(".adn-card").forEach((b) => b.addEventListener("click", () => {
    sel[b.dataset.c] = b.dataset.id;
    el.querySelectorAll(`.adn-card[data-c="${b.dataset.c}"]`).forEach((x) => x.classList.toggle("sel", x === b));
    el.querySelector("#adn-ok").disabled = ![0, 1, 2, 3].every((i) => sel[i]);
  }));
  el.querySelector("#adn-ok").addEventListener("click", () => {
    if (![0, 1, 2, 3].every((i) => sel[i])) return;
    toGM({ t: "d-pick", actorId: seat.actorId, picks: [0, 1, 2, 3].map((i) => sel[i]) }); delete pickSel[seat.actorId];
    drop("adn-pick"); ui.notifications.info("ยืนยันเมนูแล้ว รอเพื่อน ๆ");
  });
}
function statusBar(st) {
  const done = st.seats?.filter((s) => s.confirmed).length ?? 0, total = st.seats?.length ?? 0;
  if (st.phase === "pick" && game.user.isGM) {
    const el = place("adn-gm", "", "left:50%;bottom:170px;transform:translateX(-50%);padding:12px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;max-width:94vw",
      `<div><b style="color:#e2bc5a">มื้อค่ำ · รอเลือกเมนู ${done}/${total}</b><div class="adn-sub">${st.seats.map((s) => `${esc(s.name)} ${s.confirmed ? "✓" : "…"}`).join(" · ")}</div></div>
      <button class="adn-btn" id="adn-reveal">เริ่มเสิร์ฟ (ส่งออเดอร์เข้าครัว)</button><button class="adn-btn ghost" id="adn-force">เริ่มเสิร์ฟเลย (ข้ามคนที่ยังไม่เลือก)</button><button class="adn-btn ghost" id="adn-cancel">ยกเลิก</button>`);
    el.querySelector("#adn-reveal").onclick = () => reveal(false); el.querySelector("#adn-force").onclick = () => reveal(true); el.querySelector("#adn-cancel").onclick = cancelDinner;
  } else if (st.phase === "pick" && !pickWindowOpen()) {
    place("adn-gm", "", "left:50%;bottom:170px;transform:translateX(-50%);padding:10px 16px", `<b style="color:#e2bc5a">มื้อค่ำ</b> · ยืนยันแล้ว ${done}/${total} · รอ GM เปิดโต๊ะ`);
  } else if (st.phase === "table" && game.user.isGM) {
    const el = place("adn-gm", "", "left:50%;bottom:170px;transform:translateX(-50%);padding:12px 16px;display:flex;gap:12px;align-items:center",
      `<b style="color:#e2bc5a">มื้อค่ำ · เสิร์ฟแล้ว ${st.seats.filter((x) => x.served !== false).length}/${total}${st.seats.some((x) => x.served === false) ? " (คลิกขวาถาดในครัว)" : ""}</b><button class="adn-btn ghost" id="adn-card">คนถัดไป</button><button class="adn-btn" id="adn-end">จบมื้อค่ำ</button><button class="adn-btn ghost" id="adn-cancel">ยกเลิก</button>`);
    el.querySelector("#adn-card").onclick = newCard; el.querySelector("#adn-end").onclick = finish; el.querySelector("#adn-cancel").onclick = cancelDinner;
  } else drop("adn-gm");
}
const pickWindowOpen = () => !!document.getElementById("adn-pick");
let collapsed = false;
function tablePanel(st) {
  if (st.phase !== "table") return drop("adn-table");
  if (canvas.scene?.id === lodgeScene()?.id) {   // in the lodge the dishes are tokens on the table; only the talk card is shown on screen
    if (!st.seats?.length) return drop("adn-table");
    place("adn-table", "", "left:50%;top:8px;transform:translateX(-50%);width:min(820px,94vw);padding:8px 14px;pointer-events:none", `<div class="adn-sub" style="margin-bottom:2px">ไพ่ชวนคุย · คนละใบ</div>${talkHtml(st)}`);
    return;
  }
  if (collapsed) {
    const el = place("adn-table", "", "left:50%;top:8px;transform:translateX(-50%);padding:6px 14px;cursor:pointer", `<b style="color:#e2bc5a">มื้อค่ำ · แสดงโต๊ะอาหาร</b>`);
    el.onclick = () => { collapsed = false; sync(); }; return;
  }
  const seats = st.seats.map((s) => {
    const cb = comboOf(s.picks), mine = game.actors.get(s.actorId)?.isOwner;
    if (s.served === false) return `<div class="adn-seat"><b style="color:#e2bc5a;font-size:17px">${esc(s.name)}</b><div class="adn-sub" style="padding:18px 0;text-align:center">🍽️ ฝาครอบยังปิดอยู่<br>รอซาร์จเสิร์ฟ</div></div>`;
    return `<div class="adn-seat"><b style="color:#e2bc5a;font-size:17px">${esc(s.name)}</b>
      ${s.picks.map((id, di) => { const ate = !!s.eaten?.[di]; return `<div class="adn-dish ${cb.hits.includes(id) ? "hit" : ""}" style="${ate ? "opacity:.38" : ""}"><img src="${DISH[id].img}"><span style="flex:1">${esc(DISH[id].name)}${ate ? " · กินแล้ว" : ""}</span>${mine && !ate ? `<button class="adn-btn" style="padding:4px 10px" data-eat="${s.actorId}" data-i="${di}">กิน</button>` : ""}</div>`; }).join("")}
      <div class="adn-sub">${cb.theme ? `ธีมซ้ำ: ${esc(cb.theme)} × ${cb.n}` : "ไม่มีธีมซ้ำ"}</div><b style="color:${cb.tier === 2 ? "#8fd18a" : "#e2bc5a"}">${cb.label}</b>
      ${(s.beers ?? 0) > 0 ? `<div>เบียร์ ${s.beers} แก้ว${s.beers >= 3 ? ` <span style="color:#f0b9a6">· เช้าพรุ่งนี้เมาค้าง</span>` : ""}</div>` : ""}
      ${mine ? `<button class="adn-btn ghost" data-beer="${s.actorId}">+ สั่งเบียร์เพิ่ม</button>` : ""}</div>`;
  }).join("");
  const el = place("adn-table", "", "left:50%;top:8px;transform:translateX(-50%);width:min(1000px,96vw);max-height:60vh;overflow:auto;padding:12px 14px;display:flex;flex-direction:column;gap:10px",
    `<div style="display:flex;justify-content:space-between;align-items:center;gap:12px"><h2>จานของทุกคนขึ้นโต๊ะแล้ว</h2><button class="adn-btn ghost" id="adn-hide">ซ่อน</button></div>
    <div style="border:2px dashed #5b4a2a;border-radius:8px;padding:8px 12px"><div class="adn-sub">ไพ่ชวนคุย · คนละใบ (ปุ่ม "คนถัดไป" ไฮไลต์คนที่ถึงตาเล่า)</div>${talkHtml(st)}</div>
    <div class="adn-grid">${seats}</div>`);
  el.querySelector("#adn-hide").onclick = () => { collapsed = true; sync(); };
  el.querySelectorAll("[data-beer]").forEach((b) => b.onclick = () => toGM({ t: "d-beer", actorId: b.dataset.beer }));
  el.querySelectorAll("[data-eat]").forEach((b) => b.onclick = () => toGM({ t: "d-eat", actorId: b.dataset.eat, idx: Number(b.dataset.i) }));
}

// ---------------------------------------------------------------- dishes floating beside the tokens
const texCache = new Map();
const tex = (url) => { if (!texCache.has(url)) texCache.set(url, (foundry.canvas?.loadTexture ?? globalThis.loadTexture)(url)); return texCache.get(url); };
const v8 = () => Number(String(globalThis.PIXI?.VERSION ?? "7").split(".")[0]) >= 8;
function box(g, x, y, w, h, color, bg) {
  if (v8()) g.roundRect(x, y, w, h, 5).fill({ color: bg, alpha: 0.92 }).stroke({ width: 2, color });
  else { g.lineStyle(2, color); g.beginFill(bg, 0.92); g.drawRoundedRect(x, y, w, h, 5); g.endFill(); }
}
const PLATE = [[0.31, 0.31], [0.69, 0.31], [0.31, 0.69], [0.69, 0.69]];   // 2x2 plate centres as a fraction of the tray box
const boxOf = (tok) => { const b = tok.bounds; return { w: b?.width || tok.w || canvas.grid.size, h: b?.height || tok.h || canvas.grid.size, x: b?.x ?? tok.x, y: b?.y ?? tok.y }; };
// the dish flies from its plate on the tray into the eater's token (runs on every client)
async function flyDish(d) {
  try {
    if (!canvas?.ready || canvas.scene?.id !== d.sceneId || !DISH[d.dish]) return;
    const eater = canvas.scene.tokens.find((t) => t.actor?.id === d.actorId && !t.getFlag(MOD, "cloche") && !t.getFlag(MOD, "dish"))?.object; if (!eater) return;
    const B = boxOf(eater), tx = B.x + B.w / 2, ty = B.y + B.h / 2, sx = d.sx, sy = d.sy, size = d.size;
    const sp = new PIXI.Sprite(await tex(DISH[d.dish].cut)); sp.anchor.set(0.5); sp.width = sp.height = size; sp.position.set(sx, sy); sp.eventMode = "none";
    (canvas.interface ?? canvas.stage).addChild(sp);
    const T = 750, t0 = performance.now(), tick = () => {
      const k = Math.min(1, (performance.now() - t0) / T), e = k * k * (3 - 2 * k);
      sp.position.set(sx + (tx - sx) * e, sy + (ty - sy) * e - Math.sin(Math.PI * e) * canvas.grid.size * 0.45);
      sp.width = sp.height = size * (1 - 0.65 * e); sp.alpha = k > 0.75 ? (1 - k) / 0.25 : 1;
      if (k >= 1) { canvas.app.ticker.remove(tick); sp.destroy(); }
    };
    canvas.app.ticker.add(tick);
  } catch (e) { console.warn(MOD, "dish fx", e); }
}
async function paintToken(tok, st) {
  try {
    for (const old of tok.children.filter((c) => c.name === "adnPlates")) { tok.removeChild(old); old.destroy({ children: true }); }
    if (st.phase !== "table" || canvas.scene?.id !== st.sceneId) return;
    const aid = tok.document?.getFlag(MOD, "cloche")?.actorId; if (!aid) return;   // only on the cloche/tray token
    const seat = st.seats.find((s) => s.actorId === aid); if (!seat || seat.served !== true) return;
    const { w, h } = boxOf(tok), cell = Math.round(Math.min(w, h) * 0.34);
    const row = new PIXI.Container(); row.name = "adnPlates"; row.eventMode = "none"; row.zIndex = 60;
    tok.addChild(row);
    for (let i = 0; i < seat.picks.length; i++) {
      if (seat.eaten?.[i]) continue;   // an eaten dish leaves the tray
      const t = await tex(DISH[seat.picks[i]].img); if (row.destroyed) return;
      const sp = new PIXI.Sprite(t); sp.anchor.set(0.5); sp.width = sp.height = cell; sp.position.set(w * PLATE[i][0], h * PLATE[i][1]); row.addChild(sp);
    }
    if ((seat.beers ?? 0) > 1) {
      const st2 = { fontFamily: "Signika, sans-serif", fontSize: Math.round(cell * 0.5), fontWeight: "bold", fill: 0xffffff, stroke: v8() ? { color: 0x000000, width: 3 } : 0x000000, strokeThickness: 3 };
      const tx = v8() ? new PIXI.Text({ text: `×${seat.beers}`, style: st2 }) : new PIXI.Text(`×${seat.beers}`, st2);
      tx.anchor.set(1, 1); tx.position.set(w - 2, h - 2); row.addChild(tx);
    }
  } catch (e) { console.warn(MOD, "dinner plates", e); }
}
const paintAll = (st) => { for (const t of canvas?.tokens?.placeables ?? []) paintToken(t, st); };

// ---------------------------------------------------------------- sync + rest hook
function sync() {
  try {
    css(); const st = getState();
    if (st.phase === "idle" || !st.phase) { drop("adn-pick"); drop("adn-table"); drop("adn-gm"); collapsed = false; paintAll(st); return; }
    pickWindow(st); statusBar(st); tablePanel(st); paintAll(st);
  } catch (e) { console.warn(MOD, "dinner sync", e); }
}
const HANG_AE = () => ({ name: "เมาค้าง (มื้อค่ำเมื่อคืน)", img: "icons/consumables/drinks/alcohol-spirits-bottle-blue.webp", origin: null, transfer: false,
  description: "เบียร์เยอะเมื่อคืน · Disadvantage เช็ค INT และ WIS จนกว่าจะพักสั้นครั้งแรก",
  changes: [{ key: "system.abilities.int.check.roll.mode", mode: 2, value: "-1" }, { key: "system.abilities.wis.check.roll.mode", mode: 2, value: "-1" }],
  flags: { [MOD]: { hangover: true } } });
const TEMP_SNAP = new Map();   // actor id -> Temp HP just before a long rest (the dnd5e long rest sets Temp HP to 0)
function onPreRest(actor, result, config) {
  try {
    const type = config?.type ?? result?.type, long = result?.longRest || type === "long" || config?.longRest;
    if (!long || !actor?.getFlag?.(MOD, "dinnerBuff")) return;
    const cur = Number(actor.system?.attributes?.hp?.temp) || 0;
    TEMP_SNAP.set(actor.id, cur);
    if (result?.updateData && "system.attributes.hp.temp" in result.updateData) result.updateData["system.attributes.hp.temp"] = cur;   // keep it in the rest update itself when dnd5e offers it
  } catch (e) { console.warn(MOD, "dinner preRest", e); }
}
async function onRest(actor, result, config) {
  try {
    const type = config?.type ?? result?.type, long = result?.longRest || type === "long";
    if (!long) { const old = actor.effects.filter((e) => e.getFlag(MOD, "hangover")).map((e) => e.id); if (old.length) await actor.deleteEmbeddedDocuments("ActiveEffect", old); return; }
    const b = actor.getFlag(MOD, "dinnerBuff"); if (!b) return;
    const snap = TEMP_SNAP.get(actor.id); TEMP_SNAP.delete(actor.id);
    const temp = Math.max(0, Number(snap ?? b.temp) || 0);   // what the character still had just before the long rest (falls back to the dinner total)
    if (temp > (Number(actor.system?.attributes?.hp?.temp) || 0)) await actor.update({ "system.attributes.hp.temp": temp });
    if (b.hang) await actor.createEmbeddedDocuments("ActiveEffect", [HANG_AE()]);
    await actor.unsetFlag(MOD, "dinnerBuff");
    if (!temp && !b.hang) return;
    await ChatMessage.create({ speaker: ChatMessage.getSpeaker({ actor }), content: `<div class="rw-card"><b>${esc(actor.name)}</b> ตื่นเช้า${temp ? ` · Temp HP <b>${temp}</b> จากมื้อค่ำเมื่อคืน` : ""}${b.hang ? `<br><span style="color:#c0553a">เมาค้างจากเบียร์ ${b.beers} แก้ว · Disadvantage เช็ค INT/WIS จนพักสั้นครั้งแรก</span>` : ""}</div>` });
  } catch (e) { console.warn(MOD, "dinner rest", e); }
}

export function registerDinner() {
  game.arkane ??= {};
  game.arkane.dinner = { start: startDinner, reveal, finish, cancel: cancelDinner, newCard, sync };
  game.arkane.dinnerSync = sync;
  game.socket.on(SOCK, (d, uid) => { if (d?.t === "fx-eat") flyDish(d); else if (d?.t?.startsWith?.("d-") && gm()) handleGM(d, uid); });
  Hooks.on("canvasReady", () => setTimeout(sync, 400));
  // cloche token HUD (GM): pick up with Sarge / put down / lift the cover when it stands next to its owner
  Hooks.on("renderTokenHUD", (hud, html) => {
    try {
      const t = hud.object?.document, c = t?.getFlag(MOD, "cloche"); if (!c || !game.user.isGM || getState().seats?.find((x) => x.actorId === c.actorId)?.served === true) return;
      const el = html instanceof HTMLElement ? html : html[0], col = el?.querySelector(".col.right"); if (!col) return;
      const add = (icon, tip, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = "control-icon arkane-keep"; b.dataset.tooltip = tip; b.innerHTML = `<i class="fa-solid ${icon}"></i>`; b.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); hud.close?.(); fn(); }); col.append(b); };
      const sarge = t.parent.tokens.find(isSarge), g = t.parent.grid?.size || 100;
      if (!c.carriedBy) add("fa-hand", "ซาร์จหยิบถาดนี้", async () => {
        if (!sarge) return ui.notifications.warn("ไม่เจอโทเคนซาร์จในฉากนี้");
        if (dist(t, sarge) > 2.5) return ui.notifications.warn("ลากซาร์จมายืนใกล้ถาดก่อน (ไม่เกิน 2 ช่อง)");
        await t.update({ "flags.arkane-1920s.cloche.carriedBy": sarge.id, x: sarge.x + g * 0.55, y: sarge.y + g * 0.45 }, { arkaneCarry: true });
      });
      else add("fa-arrow-down-long", "วางถาดลง", () => t.update({ "flags.arkane-1920s.cloche.carriedBy": null }));
      add("fa-bell-concierge", "เปิดฝา เสิร์ฟให้เจ้าของถาด (ต้องวางถาดหน้าโต๊ะเขา)", async () => {
        const seatName = getState().seats?.find((x) => x.actorId === c.actorId)?.name ?? "?";
        const owner = t.parent.tokens.find((x) => x.actorId === c.actorId);
        if (!owner) return ui.notifications.warn(`ไม่เจอโทเคนของ ${seatName} ในฉากนี้`);
        if (dist(t, owner) > 2.5) return ui.notifications.warn(`ถาดนี้ของ ${seatName}: วางไว้ใกล้โทเคนเขาก่อน (ไม่เกิน 2 ช่อง)`);
        await serveSeat(c.actorId);
      });
    } catch (e) { console.warn(MOD, "cloche HUD", e); }
  });
  // beer mug token HUD (GM): pick up with Sarge / put down / serve it to the owner (it then becomes a drinkable beer on the table)
  Hooks.on("renderTokenHUD", (hud, html) => {
    try {
      const t = hud.object?.document, c = t?.getFlag(MOD, "mug"); if (!c || !game.user.isGM) return;
      const el = html instanceof HTMLElement ? html : html[0], col = el?.querySelector(".col.right"); if (!col) return;
      const add = (icon, tip, fn) => { const b = document.createElement("button"); b.type = "button"; b.className = "control-icon arkane-keep"; b.dataset.tooltip = tip; b.innerHTML = `<i class="fa-solid ${icon}"></i>`; b.addEventListener("click", (ev) => { ev.preventDefault(); ev.stopPropagation(); hud.close?.(); fn(); }); col.append(b); };
      const sarge = t.parent.tokens.find(isSarge), g = t.parent.grid?.size || 100;
      if (!c.carriedBy) add("fa-hand", "ซาร์จหยิบเบียร์แก้วนี้", async () => {
        if (!sarge) return ui.notifications.warn("ไม่เจอโทเคนซาร์จในฉากนี้");
        if (dist(t, sarge) > 2.5) return ui.notifications.warn("ลากซาร์จมายืนใกล้เบียร์ก่อน (ไม่เกิน 2 ช่อง)");
        await t.update({ "flags.arkane-1920s.mug.carriedBy": sarge.id, x: sarge.x + g * 0.55, y: sarge.y + g * 0.45 }, { arkaneCarry: true });
      });
      else add("fa-arrow-down-long", "วางเบียร์ลง", () => t.update({ "flags.arkane-1920s.mug.carriedBy": null }));
      add("fa-beer-mug-empty", "เสิร์ฟเบียร์ให้เจ้าของ (ต้องวางไว้หน้าโต๊ะเขา)", async () => {
        const seatName = getState().seats?.find((x) => x.actorId === c.actorId)?.name ?? "?";
        const owner = t.parent.tokens.find((x) => x.actorId === c.actorId && !x.getFlag(MOD, "dish") && !x.getFlag(MOD, "cloche") && !x.getFlag(MOD, "mug"));
        if (!owner) return ui.notifications.warn(`ไม่เจอโทเคนของ ${seatName} ในฉากนี้`);
        if (dist(t, owner) > 2.5) return ui.notifications.warn(`เบียร์นี้ของ ${seatName}: วางไว้ใกล้โทเคนเขาก่อน (ไม่เกิน 2 ช่อง)`);
        await t.update({ "flags.arkane-1920s.-=mug": null, [`flags.${MOD}.dish`]: { actorId: c.actorId, beer: true }, name: "เบียร์", displayName: 20, sort: 60 });
        ChatMessage.create({ content: `<div class="rw-card"><b>ซาร์จ</b> เสิร์ฟเบียร์ให้ <b>${esc(seatName)}</b> · คลิกขวาที่แก้วเพื่อดื่ม</div>` });
      });
    } catch (e) { console.warn(MOD, "mug HUD", e); }
  });
  // right-click a dish token on the table: eat it (owner of that seat and the GM; players cannot select actorless tokens, so this reads the click itself)
  document.addEventListener("contextmenu", (ev) => {
    try {
      if (ev.target?.tagName !== "CANVAS" || !canvas?.ready) return;
      const st = getState(); if (st.phase !== "table") return;
      const p = canvas.canvasCoordinatesFromClient?.({ x: ev.clientX, y: ev.clientY }); if (!p) return;
      const g = canvas.scene.grid.size || 100;
      const under = [...dishesOf(canvas.scene), ...mugsOf(canvas.scene)].find((t) => { const z = t.width * g; return p.x >= t.x - 6 && p.x <= t.x + z + 6 && p.y >= t.y - 6 && p.y <= t.y + z + 6; });   // a dish or beer on top of Sarge wins over Sarge himself
      if (!game.user.isGM && !under) {   // players cannot open a HUD on Sarge, so right-clicking him offers the extra beer (works even after every dish is eaten)
        const sg = canvas.scene.tokens.find(isSarge);
        if (sg && p.x >= sg.x && p.x <= sg.x + sg.width * g && p.y >= sg.y && p.y <= sg.y + sg.height * g) {
          const mine = st.seats.filter((x) => x.served !== false && game.actors.get(x.actorId)?.isOwner && (x.beers ?? 0) + (x.mugs ?? 0) < 6);
          if (mine.length) {
            ev.preventDefault(); ev.stopPropagation(); drop("adn-eat");
            const el = place("adn-eat", "", `left:${Math.min(ev.clientX, innerWidth - 270)}px;top:${Math.min(ev.clientY, innerHeight - 70 - mine.length * 50)}px;padding:8px;display:flex;flex-direction:column;gap:6px;width:250px`,
              `<b style="color:#e2bc5a">${esc(sg.name)} · สั่งเบียร์เพิ่ม</b>${mine.map((x) => `<button class="adn-btn" data-a="${x.actorId}">🍺 สั่งเบียร์ให้ ${esc(x.name)}${(x.beers ?? 0) + (x.mugs ?? 0) > 0 ? ` (ตอนนี้ ${(x.beers ?? 0) + (x.mugs ?? 0)})` : ""}</button>`).join("")}`);
            el.querySelectorAll("button[data-a]").forEach((b) => b.onclick = () => { drop("adn-eat"); toGM({ t: "d-beer", actorId: b.dataset.a }); });
            setTimeout(() => document.addEventListener("pointerdown", function once(e2) { if (!document.getElementById("adn-eat")?.contains(e2.target)) { drop("adn-eat"); } document.removeEventListener("pointerdown", once, true); }, true), 0);
            return;
          }
        }
      }
      const dt = under; if (!dt) return;
      const mugF = dt.getFlag(MOD, "mug"), f = mugF ? { ...mugF, beer: true } : dt.getFlag(MOD, "dish"), seat = st.seats.find((x) => x.actorId === f.actorId); if (!seat || seat.eaten?.[f.idx]) return;
      const eaters = st.seats.filter((x) => game.actors.get(x.actorId)?.isOwner); if (!eaters.length) return;
      if (mugF) {   // a beer that has been put down within reach of an eater can be drunk straight away (the serve button is optional)
        if (mugF.carriedBy) return;
        const near = eaters.some((x) => { const tk = canvas.scene.tokens.find((y) => y.actor?.id === x.actorId && !y.getFlag(MOD, "dish") && !y.getFlag(MOD, "cloche") && !y.getFlag(MOD, "mug")); return tk && dist(dt, tk) <= 3; });
        if (!near) return;
      }
      ev.preventDefault(); ev.stopPropagation();
      drop("adn-eat");
      const d = f.beer ? DISH.beer : DISH[seat.picks[f.idx]], verb = f.beer ? "ดื่ม" : "กิน";
      const solo = eaters.length === 1, me = eaters[0];
      const el = place("adn-eat", "", `left:${Math.min(ev.clientX, innerWidth - 260)}px;top:${Math.min(ev.clientY, innerHeight - 90 - eaters.length * 56)}px;padding:8px;display:flex;flex-direction:column;gap:6px;width:240px`,
        `<b style="color:#e2bc5a">${esc(d.name)} · ของ ${esc(seat.name)}</b>${eaters.map((x) => `<button class="adn-btn" data-by="${x.actorId}" style="display:flex;gap:8px;align-items:center;justify-content:center"><img src="${d.img}" style="width:40px;height:40px;border-radius:6px;object-fit:cover"><span>${verb}${solo ? (x.actorId === seat.actorId ? "" : " (แย่งกิน)") : ` ในนาม ${esc(x.name)}`}</span></button>`).join("")}${solo ? `<button class="adn-btn ghost" data-beer="1">+ สั่งเบียร์เพิ่ม${(me.beers ?? 0) + (me.mugs ?? 0) > 0 ? ` (ตอนนี้ ${(me.beers ?? 0) + (me.mugs ?? 0)})` : ""}</button>` : ""}`);
      el.querySelectorAll("[data-by]").forEach((b) => b.onclick = () => { drop("adn-eat"); toGM(f.beer ? { t: "d-drink", actorId: seat.actorId, tokenId: dt.id, by: b.dataset.by } : { t: "d-eat", actorId: seat.actorId, idx: f.idx, by: b.dataset.by }); });
      el.querySelector("[data-beer]")?.addEventListener("click", () => { drop("adn-eat"); toGM({ t: "d-beer", actorId: me.actorId }); });
      setTimeout(() => document.addEventListener("pointerdown", function once(e2) { if (!document.getElementById("adn-eat")?.contains(e2.target)) { drop("adn-eat"); } document.removeEventListener("pointerdown", once, true); }, true), 0);
    } catch (e) { console.warn(MOD, "dish menu", e); }
  }, true);
  Hooks.on("updateToken", (t, ch) => {   // the carried cloche follows Sarge
    if (!gm() || !("x" in ch || "y" in ch) || !isSarge(t)) return;
    const g = t.parent.grid?.size || 100;
    for (const c of carriedOf(t.parent, t.id)) c.update({ x: t.x + g * 0.55, y: t.y + g * 0.45 }, { arkaneCarry: true }).catch(() => {});
  });
  Hooks.on("refreshToken", (tok) => { const st = getState(); if (st.phase === "table" && tok.document?.getFlag(MOD, "cloche") && !tok.children.some((c) => c.name === "adnPlates")) paintToken(tok, st); });
  const carryFollow = () => {
    if (!gm() || !canvas?.ready) return;
    const sc = canvas.scene, sarge = sc?.tokens?.find(isSarge); if (!sarge) return;
    const g = sc.grid?.size || 100;
    for (const c of carriedOf(sc, sarge.id)) {
      const nx = sarge.x + g * 0.55, ny = sarge.y + g * 0.45;
      if (Math.abs(c.x - nx) > 2 || Math.abs(c.y - ny) > 2) c.update({ x: nx, y: ny }, { arkaneCarry: true }).catch(() => {});
    }
  };
  setInterval(carryFollow, 400);
  Hooks.on("dnd5e.preRestCompleted", onPreRest);
  Hooks.on("dnd5e.restCompleted", onRest);
  sync();
}
