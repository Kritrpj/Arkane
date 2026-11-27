// Right-hand panel: what happened, WHY (the rules' own reasoning with numbers), and a table of everything on the board.
import type { Effect } from "../src/model/effect";
import { formatCheck } from "../src/rules/check";
import type { Creature } from "../src/model/creature";
import { S, isProp, things } from "./state";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

export interface TraceGroup { title: string; lines: string[] }

// collects trace lines; consecutive lines with the same title become one numbered group
export function collector() {
  const groups: TraceGroup[] = [];
  return { groups, trace: (step: string, text: string) => {
    const last = groups[groups.length - 1];
    if (last && last.title === step) last.lines.push(text); else groups.push({ title: step, lines: [text] });
  } };
}

export function describeCreature(c: Creature): string {
  const cond = c.conditions.length ? ` · ${c.conditions.join(", ")}` : "";
  const tags = c.tags.length ? ` · ${c.tags.join(", ")}` : "";
  return `${c.name}: ขนาด ${c.size} · มวล ${Math.round(c.mass)} lb (${c.massSource}) · STR mod ${c.mod.str >= 0 ? "+" : ""}${c.mod.str} (score ${Math.max(1, 10 + 2 * c.mod.str)}) · save STR ${c.save.str} / DEX ${c.save.dex} · prof ${c.prof}${cond}${tags}`;
}

export function renderResult(host: HTMLElement, fx: Effect[], note: string, verdict?: boolean): void {
  const rows = fx.filter((e) => e.kind === "log").map((e) => e.kind === "log"
    ? `<div class="line ${e.check ? (e.check.ok ? "bad" : "good") : ""}">${esc(e.text)}${e.check ? `<small>${esc(formatCheck(e.check))}</small>` : ""}</div>` : "").join("");
  const badge = verdict === undefined ? "" : verdict
    ? `<div class="badge ok">✓ ผลตรงกับที่เคสนี้ระบุไว้ (ตรวจด้วยเทสต์เดียวกัน)</div>`
    : `<div class="badge bad">✗ ผลไม่ตรงกับที่เคสนี้ระบุ</div>`;
  host.innerHTML = badge + rows + (note ? `<div class="line"><small>${esc(note)}</small></div>` : "");
}

export function renderTrace(host: HTMLElement, groups: TraceGroup[]): void {
  host.innerHTML = groups.length ? `<ol class="trace">${groups.map((g) =>
    `<li><b>${esc(g.title)}</b>${g.lines.map((l) => `<div class="step">${esc(l)}</div>`).join("")}</li>`).join("")}</ol>`
    : `<p class="hint">ยังไม่มีขั้นตอน (เลือกผู้ผลักและเป้าหมายที่ต่างกัน)</p>`;
}

export function renderTable(host: HTMLElement): void {
  const rows = things().map((t) => {
    const prop = isProp(t), c = prop ? undefined : (t as Creature);
    const role = t.id === S.actor ? "ผู้ผลัก" : t.id === S.target ? "เป้าหมาย" : "";
    const extra = prop ? `${(t as typeof t & { material: string }).material}${t.tags.includes("immovable") ? " · ตรึง" : ""}` : `${c!.size}${c!.conditions.length ? " · " + c!.conditions.join(",") : ""}${c!.tags.includes("flying") ? " · บิน" : ""}`;
    return `<tr class="${t.id === S.focus ? "sel" : ""}"><td>${esc(t.name)}</td><td>${role || (prop ? "ของ" : "")}</td><td>${t.pos.col},${t.pos.row}</td><td>${t.footprint}</td><td>${Math.round(t.mass)}</td><td>${esc(extra)}</td></tr>`;
  }).join("");
  host.innerHTML = `<table><thead><tr><th>ชื่อ</th><th></th><th>ช่อง</th><th>fp</th><th>lb</th><th>อื่นๆ</th></tr></thead><tbody>${rows}</tbody></table>`;
}
