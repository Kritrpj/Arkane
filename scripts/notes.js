// Map note pins (the book icons) placed by the module are for the GM only: players never see them on the canvas.
// The GM tags them once (flag) and every client hides tagged notes for non-GM users.
const MOD = "arkane-1920s";

function moduleJournal(entry) {
  let f = entry?.folder;
  while (f) { if (/^Arkane 1920s/.test(f.name)) return true; f = f.folder; }
  return /^(แผนที่|Chapter|สอนเล่น|เนื้อเรื่องผู้เล่น)/.test(entry?.name ?? "");
}
const hideFor = (doc) => !game.user.isGM && game.settings.get(MOD, "dmNotes") && doc?.getFlag(MOD, "dm");

function hide(note) {
  if (!hideFor(note.document)) return;
  note.visible = false;
  note.renderable = false;
}

export async function tagDmNotes() {
  if (!game.users.activeGM?.isSelf) return 0;
  let n = 0;
  for (const s of game.scenes) {
    const ups = s.notes.filter((d) => !d.getFlag(MOD, "dm") && moduleJournal(d.entry)).map((d) => ({ _id: d.id, [`flags.${MOD}.dm`]: true }));
    if (ups.length) { await s.updateEmbeddedDocuments("Note", ups); n += ups.length; }
  }
  return n;
}

export function registerDmNotes() {
  game.settings.register(MOD, "dmNotes", { name: "หมุดหนังสือบนแมพ: GM เห็นคนเดียว", hint: "ซ่อนหมุดหนังสือ (คำอธิบายจุดต่างๆ บนแมพ) ที่โมดูลวางไว้จากผู้เล่น",
    scope: "world", config: true, type: Boolean, default: true, onChange: () => canvas.notes?.placeables.forEach((p) => p.refresh?.()) });
  for (const h of ["drawNote", "refreshNote"]) Hooks.on(h, hide);
  // notes created later by the module's scene builders get tagged too
  Hooks.on("createNote", (doc) => { if (game.users.activeGM?.isSelf && !doc.getFlag(MOD, "dm") && moduleJournal(doc.entry)) doc.setFlag(MOD, "dm", true); });
}
