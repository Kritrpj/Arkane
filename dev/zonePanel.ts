// ฝั่ง harness ของระบบ Zone: เครื่องมือวาง/ส่อง, แถบตั้งค่า, แผงด้านขวา. กฎจริงอยู่ที่ ../src/rules/zones.ts
import { CATALOG, MAX_ZONES } from "../src/data/zones";
import type { Zone } from "../src/model/zone";
import type { Cell } from "../src/model/world";
import type { Point } from "../src/model/zone";
import { ZoneField, expiryAfter, makeZone, zoneFromVolume } from "../src/rules/zones";
import { turnReport } from "../src/rules/turnReport";
import { S, rebuild, remember } from "./state";

export const zoneTool = { kind: "water", shape: "circle" as "circle" | "cell", radius: 5, gallons: 0, depth: 0.05, rounds: 0 };
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const val = (id: string) => Number($<HTMLInputElement>(id).value) || 0;

// วาง Zone ที่จุด p (ฟุตต่อเนื่อง). สารชนิดเดียวกันที่ติดกันถูก merge ให้เอง
export function placeZone(p: Point, cell: Cell): void {
  const t = zoneTool, cellFt = S.world.cellFt;
  if (t.kind === "") {                                              // ลบทุก Zone ที่ครอบจุดนี้
    const ids = S.world.field.zonesAt(p).map((z) => z.id);
    S.stage.zones = S.stage.zones.filter((z) => !ids.includes(z.id)); return;
  }
  const isMat = !!CATALOG.materials[t.kind];
  const base: Partial<Zone> = { permanent: isMat };
  if (!isMat && t.rounds > 0) base.expires = expiryAfter(t.rounds, { round: S.round, worldTime: 0 });
  const z: Zone = !isMat && t.gallons > 0 && t.shape === "circle"
    ? zoneFromVolume({ ...base, kind: t.kind, center: p, gallons: t.gallons, depth: t.depth })       // โหมดตามปริมาตร
    : makeZone({ ...base, kind: t.kind, shapes: [t.shape === "cell"
      ? { type: "rect", x: cell.col * cellFt, y: cell.row * cellFt, w: cellFt, h: cellFt }
      : { type: "circle", x: p.x, y: p.y, r: t.radius }] });
  const field = new ZoneField(S.stage.zones, { cellFt });
  const r = field.add(z);
  if (!r.ok) alert(r.warning);
  S.stage.zones = [...field.zones()];
}

export function renderZonePanel(host: HTMLElement): void {
  const zs = S.stage.zones;
  let probe = `<p class="hint">เลือกเครื่องมือ "ส่องจุด" แล้วคลิกบนแมพ เพื่อดูว่าตรงนั้นมีอะไรซ้อนอยู่และทำไมถึงได้ค่านั้น</p>`;
  if (S.probe) {
    const r = S.world.propertiesAt(S.probe), p = r.props;
    probe = `<div class="zinfo"><b>จุด (${S.probe.x.toFixed(2)}, ${S.probe.y.toFixed(2)}) ฟุต</b> · ชั้น: ${r.layers.map(esc).join(" → ") || "พื้นเปล่า"}<br>`
      + `mu ${p.mu} · ติดไฟ ${p.flammability.toFixed(2)} · เชื้อเพลิง ${p.fuel} · นำไฟฟ้า ${p.conductivity.toFixed(2)} · แข็ง ${p.hardness}`
      + ` · difficult ${p.difficult ? "ใช่" : "ไม่"} · บัง ${p.obscured} · surface ที่กฎ push ใช้: <b>${esc(r.surface ?? "ปกติ")}</b>`
      + (r.hazards.length ? `<br>ดาเมจ: ${r.hazards.map((h) => esc(`${h.name ?? h.type} ${h.amount} (${h.trigger})`)).join(", ")}` : "")
      + `<ol class="trace">${r.trace.map((l) => `<li><div class="step">${esc(l)}</div></li>`).join("")}</ol></div>`;
  }
  const rows = zs.map((z) => {
    const e = z.expires?.kind === "round" ? `หมดในอีก ${Math.max(0, z.expires.at - S.round)} รอบ` : z.expires ? "หมดตามเวลาโลก" : z.permanent ? "ถาวร" : "ไม่หมดอายุ";
    const v = z.volume !== undefined ? ` · ${z.volume.toFixed(3)} ft³` : "";
    return `<div class="zrow"><b>${esc(z.kind)}</b> (${esc(z.id)}) · ${z.shapes.length} รูปร่าง${v} · ${e} <button data-zdel="${esc(z.id)}">ลบ</button></div>`;
  }).join("");
  const li = (xs: { text: string; source: string; proposal?: unknown }[]) => xs.map((i) => `<li>${esc(i.text)} <small>[${i.source}]${i.proposal ? " · ข้อเสนอ" : ""}</small></li>`).join("");
  const act = S.report?.items.filter((i) => i.level === "act") ?? [], info = S.report?.items.filter((i) => i.level !== "act") ?? [];
  const rep = S.report
    ? `<div class="zinfo"><b>${esc(S.report.title)}</b> <small>(${S.report.mode === "combat" ? "ในเทิร์น" : "นอก combat"} · ข้อเสนอ ยังไม่ apply)</small>`
      + (act.length ? `<div>ต้องให้ DM ตัดสิน ${act.length} ข้อ</div><ul>${li(act)}</ul>` : "")
      + (info.length ? `<details><summary>รู้ไว้ ${info.length} ข้อ</summary><ul>${li(info)}</ul></details>` : "") + `</div>` : "";
  host.innerHTML = rep + `<div class="zrow">รอบที่ <b>${S.round}</b> <button data-zact="round">+1 รอบ (6 วิ)</button> <button data-zact="clear">ล้าง Zone</button>
    <button data-zact="reportTurn" title="สรุปว่า Zone ทำอะไรกับผู้ผลัก ถ้าตอนนี้ถึงเทิร์นเขา">สรุปเทิร์นของผู้ผลัก</button> <button data-zact="reportTick" title="จบรอบ: ไฟลาม/น้ำดับไฟ/น้ำแข็งละลาย (สุ่มใหม่ทุกครั้งที่กด)">จบรอบ: Zone ทำอะไร</button> <button data-zact="reportBoard">สรุปทั้งกระดาน</button> <button data-zact="reportOut">สรุปนอก combat</button> <small>Zone ${zs.length}/${MAX_ZONES}</small></div>`
    + probe + (rows || `<p class="hint">ยังไม่มี Zone: เลือกเครื่องมือ "วาง Zone" แล้วคลิกบนแมพ</p>`);
}

// ต่อแถบเครื่องมือและแผงเข้ากับ state (เรียกครั้งเดียวตอนเริ่ม)
export function initZoneUI(onChange: () => void): void {
  const opts = (m: Record<string, { label: string }>) => Object.entries(m).map(([k, v]) => `<option value="${k}">${v.label} (${k})</option>`).join("");
  $<HTMLSelectElement>("zKind").innerHTML = `<optgroup label="สาร (ชั่วคราว)">${opts(CATALOG.substances)}</optgroup><optgroup label="วัสดุ (ถาวร)">${opts(CATALOG.materials)}</optgroup><option value="">(ลบ Zone ตรงจุด)</option>`;
  const read = () => {
    zoneTool.kind = $<HTMLSelectElement>("zKind").value; zoneTool.shape = $<HTMLSelectElement>("zShape").value as "circle" | "cell";
    zoneTool.radius = val("zRadius") || 5; zoneTool.gallons = val("zGallons"); zoneTool.depth = val("zDepth") || 0.05; zoneTool.rounds = Math.max(0, Math.floor(val("zRounds")));
  };
  for (const id of ["zKind", "zShape", "zRadius", "zGallons", "zDepth", "zRounds"]) $(id).onchange = read;
  read();
  $<HTMLSelectElement>("zCover").onchange = (e) => { S.coverage = (e.target as HTMLSelectElement).value === "fraction" ? "fraction" : "center"; rebuild(); onChange(); };
  $("zonePanel").onclick = (e) => {
    const el = e.target as HTMLElement, act = el.dataset.zact, del = el.dataset.zdel;
    if (act === "round") {
      remember(); S.round++;
      const f = new ZoneField(S.stage.zones, { cellFt: S.world.cellFt }); f.sweep({ round: S.round, worldTime: 0 }); S.stage.zones = [...f.zones()];
    } else if (act === "reportTurn") { S.report = turnReport(S.world, { round: S.round, worldTime: 0 }, { whose: S.actor }); }
    else if (act === "reportTick") { S.report = turnReport(S.world, { round: S.round, worldTime: 0 }, { tick: true }); }
    else if (act === "reportBoard") { S.report = turnReport(S.world, { round: S.round, worldTime: 0 }); }
    else if (act === "reportOut") { S.report = turnReport(S.world, { worldTime: S.round * 6 }); }
    else if (act === "clear") { remember(); S.stage.zones = []; }
    else if (del) { remember(); S.stage.zones = S.stage.zones.filter((z) => z.id !== del); }
    else return;
    rebuild(); onChange();
  };
}
