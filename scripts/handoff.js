// Dr. Heinz leaves the party after "his" quest to open a fried-chicken shop; his daughter Perry Platypus joins.
const MOD = "arkane-1920s";
const D = () => foundry.applications?.api?.DialogV2;
const esc = (s) => foundry.utils.escapeHTML(String(s ?? ""));

export async function heinzFarewell() {
  if (!game.user.isGM) return ui.notifications.warn("เฉพาะ GM");
  const heinz = game.actors.find((a) => a.getFlag(MOD, "pc") === "heinz");
  const r = await D().prompt({ window: { title: "ไฮนซ์ลาตี้ · ส่งต่อ Perry" }, ok: { label: "ฉากอำลา", callback: (e, b) => new FormDataExtended(b.form ?? b.closest("form")).object },
    content: `<div class="rw-form"><p class="rw-hint">ฉากอำลา: ไฮนซ์ปิดโครงการ ปิดปุ่มแดงของงานนี้ ย้ายไปเปิดร้านไก่ทอด แล้วฝากลูกสาวให้ตี้ดูแล · ตัวละครไฮนซ์จะถูกเก็บ (ไม่ลบ) และถอดโทเคนออกจากฉากปัจจุบัน</p>
      <div class="form-group"><label>เมืองที่เปิดร้าน</label><input name="town" type="text" value="" placeholder="เช่น ชื่อเมืองริมทะเลของคุณ"></div>
      <div class="form-group"><label>ชื่อร้าน</label><input name="shop" type="text" value="ไก่ทอดดูเฟนชเมิร์ตซ์ (Doofenshmirtz Fried Chicken)"></div></div>` }).catch(() => null);
  if (!r) return;
  const town = esc(r.town || "เมืองที่เงียบสงบ"), shop = esc(r.shop);
  await ChatMessage.create({ speaker: { alias: "ฉากอำลา" }, content: `<div class="rw-card"><div class="rw-title">ไฮนซ์ขอลา</div>
    ไฮนซ์วางประแจลงบนโต๊ะ ถอดแว่นกันลมออกเช็ดช้าๆ "งานนี้จบแล้ว และครั้งแรกในชีวิต เครื่องของผมไม่ต้องกดปุ่มแดงสักเครื่อง" เขายิ้มเหนื่อยๆ "ผมไม่ได้เกิดมาเพื่อหนีสงครามไปตลอด ผมเกิดมาเพื่อทำให้คนอิ่มท้อง... ผมจะไปเปิดร้านไก่ทอดที่ <b>${town}</b> ชื่อ <b>${shop}</b> สูตรลับเสร็จแล้ว กลไกพลิกไก่ก็เสร็จแล้ว"<br><br>
    เขาควักซองจดหมายเปื้อนน้ำมันออกมา "แต่ผมฝากอะไรไว้อย่างหนึ่ง ลูกสาวผมกำลังเดินทางมาหา เธอฝีมือกว่าผมเยอะ แล้วเธอไม่ชอบอยู่เฉย" </div>` });
  await ChatMessage.create({ speaker: { alias: "จดหมายจากไฮนซ์" }, content: `<div class="rw-card"><div class="rw-title">จดหมายของ ดร. ไฮนซ์ ดูเฟนชเมิร์ตซ์</div>
    <p><i>ถึงเพื่อนร่วมทางทุกคน,</i></p>
    <p>ขอบคุณที่ไม่ปล่อยให้ผมกดปุ่มนั้น ผมฝาก <b>เพอร์รี่ (Perry Platypus)</b> ลูกสาวผมไว้ด้วย เธอเป็นคนที่สงบ พูดน้อย แต่ถ้าเห็นอะไรผิดปกติจะไม่ปล่อยไว้ เธอรู้เรื่องที่พวกคุณเจอเกินกว่าที่ผมกล้าเล่า เพราะเธอเป็นคนแรกที่ผมส่งไปสืบเรื่องรอยแยกกลิ่นสนิมนี้ก่อนผมจะมาที่ The Rusty Wand</p>
    <p>ถ้าผ่าน ${town} แวะกินไก่ทอดฟรีที่ร้าน บอกว่าคุณมากับเพอร์รี่</p>
    <p>— ไฮนซ์ <small>(ป.ล. ห้ามกดปุ่มแดงบนเครื่องในกระเป๋า มันยังทำงานอยู่)</small></p></div>` });
  if (heinz) {
    await heinz.setFlag(MOD, "retired", true);
    for (const sc of game.scenes) {
      const ids = sc.tokens.filter((t) => t.actorId === heinz.id).map((t) => t.id);
      if (ids.length) await sc.deleteEmbeddedDocuments("Token", ids);
    }
  }
  await game.settings.set(MOD, "perryReady", true).catch(() => {});
  await ChatMessage.create({ whisper: [game.user.id], content: `<div class="rw-card"><div class="rw-title">DM · ฉากอำลาเสร็จแล้ว</div>
    ไฮนซ์ถูกเก็บ (flag retired) และถอดโทเคนออกจากทุกฉาก · ตัวละคร Perry ยังไม่ถูกสร้าง ส่งชีตมาให้ผมแล้วค่อยกด "สร้างตัวละครผู้เล่น" · ดูแนวเปิดตัวเพอร์รี่ที่หน้า "ไฮนซ์ → เพอร์รี่" ในสมุดเนื้อเรื่อง DM</div>` });
}
