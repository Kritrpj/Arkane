// Party summary note (player-visible journal with live stats) + C.A.A.M. reward payout
const MOD = "arkane-1920s";
const NAME = "สรุปตี้ & เป้าหมาย (ล่าสุด)";
export const CAAM_REWARD = 25;

const pcs = () => game.actors.filter((a) => a.type === "character" && a.getFlag(MOD, "pc") && !a.getFlag(MOD, "retired") && !a.getFlag(MOD, "later"));

export async function partyNote(open = true) {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const rows = pcs().map((a) => {
    const s = a.system, cls = a.items.find((i) => i.type === "class");
    const hp = s.attributes.hp, dread = Number(a.getFlag(MOD, "dread") ?? 0);
    return `<tr><td><b>${foundry.utils.escapeHTML(a.name)}</b></td><td>${foundry.utils.escapeHTML(cls?.name ?? "")} ${cls?.system.levels ?? s.details.level ?? 1}</td><td>${hp.value}/${hp.max}</td><td>${s.attributes.ac?.value ?? "-"}</td><td>${s.currency?.gp ?? 0}</td><td>${dread}/3</td></tr>`;
  }).join("");
  const html = `<div class="rw-journal"><img src="modules/${MOD}/party-board.webp" style="width:100%;border:0">
<h3>แผนที่: ตอนนี้ตี้อยู่ไหน และทางไปโกดัง 4</h3><img src="modules/${MOD}/party-route.webp" style="width:100%;border:0">
<h3>สถานะล่าสุด (อัปเดตอัตโนมัติเมื่อ GM กดมาโคร)</h3>
<table><tr><th>ตัวละคร</th><th>คลาส/เลเวล</th><th>HP</th><th>AC</th><th>gp</th><th>Dread</th></tr>${rows}</table>
<h3>เป้าหมายตอนนี้</h3><ol><li>สืบเรื่อง "โกดังหมายเลข 4" จากตั๋วรับของที่ได้มาจากอาเธอร์</li><li>รับงานของ C.A.A.M. ตามดีลในห้องสอบสวน</li><li>ระวังสายสะกดรอยของ C.A.A.M. ที่คอยจับตาอยู่</li></ol>
<h3>ข้อเสนอ C.A.A.M.</h3><p>ทำภารกิจให้ C.A.A.M. สำเร็จ (สืบเรื่องโกดัง 4 ตามดีลในห้องสอบสวน) → รางวัล <b>${CAAM_REWARD} gp ต่อคน</b></p></div>`;
  let j = game.journal.getName(NAME);
  if (j) {
    const p = j.pages.contents[0];
    if (p) await p.update({ "text.content": html }); else await j.createEmbeddedDocuments("JournalEntryPage", [{ name: "สรุป", type: "text", text: { content: html } }]);
  } else {
    const jf = game.folders.find((f) => f.name === "Arkane 1920s" && f.type === "JournalEntry");
    j = await JournalEntry.create({ name: NAME, folder: jf?.id, ownership: { default: 2 }, pages: [{ name: "สรุป", type: "text", text: { content: html } }] });
  }
  if (open) j.sheet.render(true);
  return j;
}

export async function payCaamReward() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const list = pcs();
  const ok = await foundry.applications.api.DialogV2.confirm({ window: { title: "จ่ายรางวัล C.A.A.M." }, content: `<p>ภารกิจ C.A.A.M. สำเร็จ? จะแจก <b>${CAAM_REWARD} gp</b> ให้ ${list.length} คน (${list.map((a) => a.name).join(", ")})</p>` }).catch(() => false);
  if (!ok) return;
  for (const a of list) await a.update({ "system.currency.gp": (a.system.currency?.gp ?? 0) + CAAM_REWARD }, { arkaneInternal: true });
  await ChatMessage.create({ speaker: { alias: "C.A.A.M." }, content: `<div class="rw-card"><div class="rw-title">ค่าจ้างจาก C.A.A.M.</div>ซองสีน้ำตาลเรียบๆ วางตรงหน้าทุกคน ข้างในคือธนบัตรและเศษกระดาษพิมพ์ว่า "ขอบคุณสำหรับความร่วมมือ" · ได้คนละ <b>${CAAM_REWARD} gp</b></div>` });
  await partyNote(false);
}

// Dr. Heinz officially joins the party (he is held back until the C.A.A.M. interrogation scene is over)
export async function joinHeinz() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const a = game.actors.find((x) => x.getFlag(MOD, "pc") === "heinz");
  if (!a) return ui.notifications.warn("ยังไม่มีตัวละครไฮนซ์ · กดมาโคร 'สร้างตัวละครผู้เล่น' ก่อน");
  await a.unsetFlag(MOD, "later"); await a.setFlag(MOD, "joined", true);
  const sc = game.scenes.active;
  if (sc && !sc.tokens.find((t) => t.actorId === a.id)) await sc.createEmbeddedDocuments("Token", [{ ...(await a.getTokenDocument()).toObject(), x: 200, y: 200 }]);
  if (!a.getFlag(MOD, "introSent")) await (await import("./session.js?v=21")).sendIntros([a.id]).catch(() => null);
  await partyNote(false);
  ui.notifications.info("ดร. ไฮนซ์เข้าตี้แล้ว · ส่งข้อความเปิดเรื่องให้เจ้าของแล้ว");
}
