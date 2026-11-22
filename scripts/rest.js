// GM button: rest the whole party (short / long) with a centre-screen notice
import { banner } from "./stealth.js?v=21";
const MOD = "arkane-1920s", SOCK = `module.${MOD}`;
const pcs = () => game.actors.filter((a) => a.type === "character" && (a.hasPlayerOwner || a.getFlag(MOD, "pc") || /ผู้เล่น|player/i.test(a.folder?.name ?? "")));
const ownerOf = (a) => [...game.users].find((u) => u.active && !u.isGM && a.testUserPermission(u, "OWNER"));

export async function restAll() {
  if (!game.user.isGM) return;
  const kind = await foundry.applications.api.DialogV2.wait({
    window: { title: "พักทั้งตี้" }, content: `<p>เลือกชนิดการพักของผู้เล่นทุกคน</p>`, rejectClose: false,
    buttons: [{ action: "short", label: "พักสั้น", default: true }, { action: "long", label: "พักยาว" }]
  });
  if (!kind) return;
  const d = { t: "s-rest", kind, actors: pcs().map((a) => ({ uuid: a.uuid, roller: ownerOf(a)?.id ?? game.user.id })) };
  game.socket.emit(SOCK, d); onRest(d);
}
async function onRest(d) {
  banner(d.kind === "long" ? "พักยาว" : "พักสั้น", "ทั้งตี้ · ผู้เล่นเลือกใช้ Hit Dice ได้ในหน้าต่างพัก");
  for (const x of d.actors) {
    if (x.roller !== game.user.id) continue;
    try {
      const a = await fromUuid(x.uuid); if (!a) continue;
      if (d.kind === "long") await a.longRest({ dialog: false, newDay: true });
      else await a.shortRest({ dialog: !game.user.isGM });
    } catch (e) { console.warn(MOD, "rest", e); }
  }
}
// the Group actor: named "ตี้ Arkane" and filled with the player characters (once, or by hand: game.arkane.syncParty())
export async function ensureParty(force = false) {
  if (!game.user.isGM) return 0;
  let g = game.actors.find((a) => a.type === "group");
  if (!g) g = await Actor.create({ name: "ตี้ Arkane", type: "group" });
  if (!g) return 0;
  if (!force && g.getFlag(MOD, "partyInit")) return 0;
  if (g.name === "Group") await g.update({ name: "ตี้ Arkane" });
  const have = new Set((g.system.members ?? []).map((m) => m.actor?.id ?? m.actor));
  let n = 0;
  for (const a of pcs()) {
    if (have.has(a.id)) continue;
    try { await g.system.addMember(a); n++; } catch (e) { console.warn(MOD, "addMember", e); }
  }
  await g.setFlag(MOD, "partyInit", true);
  return n;
}
// a player character with no species item has a base walking speed of 0 (it normally comes from the species): give 30 ft
export async function fixSpeed() {
  if (!game.user.isGM) return [];
  const fixed = [];
  for (const a of pcs()) {
    const src = a._source?.system?.attributes?.movement?.walk;
    if (!Number(src)) { await a.update({ "system.attributes.movement.walk": 30 }); fixed.push(a.name); }
  }
  return fixed;
}
export function registerRest() {
  (game.arkane ??= {}).restAll = restAll;
  game.arkane.syncParty = () => ensureParty(true);
  Hooks.once("ready", () => fixSpeed().then((f) => f.length && ui.notifications.info(`ตั้งความเร็วเดิน 30 ฟุตให้ ${f.join(", ")}`)).catch((e) => console.warn(MOD, "speed", e)));
  Hooks.once("ready", () => ensureParty().then((n) => n && ui.notifications.info(`ใส่ตัวละครเข้า Group "ตี้ Arkane" แล้ว ${n} คน`)).catch((e) => console.warn(MOD, "party", e)));
  const attach = () => game.socket.on(SOCK, (d) => { if (d?.t === "s-rest") onRest(d); });
  if (game.ready) attach(); else Hooks.once("ready", attach);
  Hooks.on("renderActorDirectory", (app, html) => {
    try {
      if (!game.user.isGM) return;
      const el = html instanceof HTMLElement ? html : html[0]; if (!el || el.querySelector(".arkane-restall")) return;
      const box = el.querySelector(".header-actions, .directory-header .action-buttons") ?? el.querySelector(".directory-header"); if (!box) return;
      const b = document.createElement("button"); b.type = "button"; b.className = "arkane-restall"; b.innerHTML = `<i class="fa-solid fa-campground"></i> พักทั้งตี้`;
      b.addEventListener("click", () => restAll()); box.append(b);
    } catch (e) { console.warn(MOD, "rest button", e); }
  });
}
