/// <reference types="vite/client" />
// Dev harness: runs the REAL rules + Shove action on a board you can rearrange, in the browser, no Foundry.
// This file only wires things together: toolbar <-> state <-> canvas <-> sidebar. The rules live in ../src.
import { makeCreature, makeProp } from "../src/model/make";
import { randomDice, fixedDice, type Dice } from "../src/rules/dice";
import { ACTIONS } from "../src/actions";
import type { Action } from "../src/actions/types";
import { SCENARIOS, type Scenario } from "./scenarios";
import { emptyStage, RULEBOOKS, type RulesKey } from "./stage";
import { S, canUndo, creatureById, freeCell, loadScenario, newId, rebuild, remember, rules, things, thingById, undo } from "./state";
import { draw } from "./draw";
import { attachTools, tool, type Tool } from "./tools";
import { applyEdit, renderInspector } from "./inspector";
import { initZoneUI, renderZonePanel } from "./zonePanel";
import { initCastDemo } from "./castDemo";
import { collector, describeCreature, renderResult, renderTable, renderTrace } from "./sidebar";

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const cv = $<HTMLCanvasElement>("cv");

// ---------- the module's real chapter maps (scripts/chmaps.js) are optional extras for the scenario list
const found = import.meta.glob("../scripts/chmaps.js", { eager: true }) as Record<string, { CHMAPS?: Record<string, any> }>;
const realMaps: Scenario[] = Object.entries(Object.values(found)[0]?.CHMAPS ?? {}).map(([id, d]) => ({
  id: `map:${id}`, group: "แมพจริง (scripts/chmaps.js)", label: id, unchecked: true, rules: "physics", d20: 1, die: 3, actor: "hero", target: "gob",
  note: "กำแพงจริงของแมพนี้ ลองลากตัวละคร/ของมาวางแล้วผลัก (ไม่มีข้อมูลความสูงในแมพจริง)",
  build: () => emptyStage({ cols: d.W, rows: d.H, walls: JSON.parse(JSON.stringify(d.walls ?? [])),
    creatures: [makeCreature({ id: "hero", name: "Hero", pos: { col: 2, row: 3 }, mod: { str: 3 }, save: { str: 3, dex: 1 } }), makeCreature({ id: "gob", name: "Goblin", pos: { col: 3, row: 3 }, size: "sm", save: { str: -1, dex: 2 } })] }),
  verify: () => true,
}));
const ALL = [...SCENARIOS, ...realMaps];

// ---------- toolbar helpers
const force = $<HTMLInputElement>("force"), dmg = $<HTMLInputElement>("dmg"), mode = $<HTMLSelectElement>("mode"), actionSel = $<HTMLSelectElement>("action");
// every action takes {actor, target}; shove also reads `mode`. The scenarios were written for shove
const action = (): Action<any> => ACTIONS[actionSel.value as keyof typeof ACTIONS];
const num = (el: HTMLInputElement) => { const n = parseInt(el.value, 10); return Number.isFinite(n) ? n : undefined; };

function makeDice(): Dice {
  const d20 = num(force), die = num(dmg), real = randomDice();
  if (d20 !== undefined && die !== undefined) return fixedDice(d20, die);
  return { d20: d20 !== undefined ? () => ({ natural: d20, rolls: [d20] }) : real.d20, roll: die !== undefined ? (n) => n * die : real.roll };
}
const deterministic = () => num(force) !== undefined && num(dmg) !== undefined;

// the scenario's own check only makes sense while the board and the toolbar still match what it set up
const matches = (sc: Scenario) => (sc.action ?? "shove") === actionSel.value && !S.dirty && !sc.unchecked && S.rulesKey === sc.rules && S.actor === sc.actor && S.target === sc.target
  && mode.value === (sc.mode ?? "push") && num(force) === sc.d20 && num(dmg) === sc.die;

// ---------- run the action
function evaluate(apply: boolean): void {
  const a = creatureById(S.actor), t = creatureById(S.target), out = $("out");
  if (!a || !t || a.id === t.id) { renderResult(out, [], "เลือกผู้ผลักและเป้าหมายให้เป็นคนละตัว"); renderTrace($("why"), []); S.preview = []; draw(cv); return; }
  const { groups, trace } = collector();
  const ctx = { world: S.world, rules: rules(), dice: makeDice(), trace };
  const input = { actor: a, target: t, mode: mode.value as "push" | "prone" };

  trace("ตัวที่เกี่ยวข้อง", `ผู้ผลัก — ${describeCreature(a)}`);
  trace("ตัวที่เกี่ยวข้อง", `เป้าหมาย — ${describeCreature(t)}`);
  trace("ตัวที่เกี่ยวข้อง", `พื้นใต้ผู้ผลัก: ${S.world.surfaceAt(a.pos) ?? "ปกติ"} · ใต้เป้าหมาย: ${S.world.surfaceAt(t.pos) ?? "ปกติ"} · ${S.world.cellFt} ฟุต/ช่อง · ชุดกฎ: ${ctx.rules.name}`);

  const can = action().canUse(ctx, input);
  if (!can.ok) {
    trace("ตรวจว่าผลักได้ไหม", `ไม่ได้: ${can.reason}`);
    renderResult(out, [], `ใช้ไม่ได้: ${can.reason}`, S.scenario && matches(S.scenario) ? S.scenario.verify({ can, fx: [], stage: S.stage }) : undefined);
    renderTrace($("why"), groups); S.preview = []; draw(cv); return;
  }
  if (actionSel.value === "shove") trace("ตรวจว่าผลักได้ไหม", "ผ่าน: ติดกัน (รวมทแยง), ขนาดเป้าหมายไม่เกิน 1 ระดับ, ผู้ผลักยังทำอะไรได้");

  const fx = action().resolve(ctx, input);
  for (const l of ctx.rules.explainDamage()) trace("สูตรดาเมจกระแทก (ดาเมจคิดยังไง)", l);
  const verdict = S.scenario && matches(S.scenario) ? S.scenario.verify({ can, fx, stage: S.stage }) : undefined;
  if (apply) { remember(); S.world.apply(fx); S.preview = []; S.dirty = true; } else S.preview = fx;
  renderResult(out, fx, apply ? "(ผลักจริงแล้ว: กดผลักซ้ำได้ หรือ Undo)" : "(Preview: ยังไม่เปลี่ยนอะไรบนกระดาน)", verdict);
  renderTrace($("why"), groups);
  draw(cv); renderTable($("table")); renderInspector($("inspector"));
  if (apply) { fillSelects(); $<HTMLButtonElement>("undo").disabled = !canUndo(); }
}

// ---------- redraw everything after a change; explain again when the dice are fixed (so it does not flicker)
function refresh(explain: boolean): void {
  fillSelects();
  $<HTMLInputElement>("cols").value = String(S.stage.cols); $<HTMLInputElement>("rows").value = String(S.stage.rows);
  $<HTMLButtonElement>("undo").disabled = !canUndo();
  renderInspector($("inspector")); renderTable($("table")); renderZonePanel($("zonePanel"));
  if (explain && deterministic()) evaluate(false); else { S.preview = []; draw(cv); }
}

function fillSelects(): void {
  for (const [id, cur] of [["actor", S.actor], ["target", S.target]] as const) {
    const el = $<HTMLSelectElement>(id);
    el.innerHTML = S.stage.creatures.map((c) => `<option value="${c.id}">${c.name}</option>`).join("");
    el.value = cur;
  }
}

function setScenario(sc: Scenario): void {
  loadScenario(sc);
  $<HTMLSelectElement>("rules").value = sc.rules; force.value = String(sc.d20); dmg.value = String(sc.die); mode.value = sc.mode ?? "push"; actionSel.value = sc.action ?? "shove";
  $("scNote").innerHTML = `<b>${sc.label}</b><br>${sc.note}`;
  $<HTMLSelectElement>("scenario").value = sc.id;
  refresh(true);
}

// ---------- wiring
const scSel = $<HTMLSelectElement>("scenario");
for (const grp of [...new Set(ALL.map((s) => s.group))]) {
  scSel.insertAdjacentHTML("beforeend", `<optgroup label="${grp}">${ALL.filter((s) => s.group === grp).map((s) => `<option value="${s.id}">${s.label}</option>`).join("")}</optgroup>`);
}
$<HTMLSelectElement>("rules").innerHTML = (Object.entries(RULEBOOKS) as [RulesKey, { label: string }][]).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("");

scSel.onchange = () => setScenario(ALL.find((s) => s.id === scSel.value)!);
$<HTMLSelectElement>("rules").onchange = (e) => { S.rulesKey = (e.target as HTMLSelectElement).value as RulesKey; refresh(true); };
$<HTMLSelectElement>("actor").onchange = (e) => { S.actor = (e.target as HTMLSelectElement).value; refresh(true); };
$<HTMLSelectElement>("target").onchange = (e) => { S.target = S.focus = (e.target as HTMLSelectElement).value; refresh(true); };
for (const el of [actionSel, mode, force, dmg]) el.onchange = () => refresh(true);
$("preview").onclick = () => evaluate(false);
$("go").onclick = () => evaluate(true);
$("undo").onclick = () => { if (undo()) { S.dirty = true; refresh(true); } };
$("reset").onclick = () => setScenario(S.scenario ?? ALL[0]);

for (const r of document.querySelectorAll<HTMLInputElement>('input[name="tool"]')) r.onchange = () => { tool.kind = r.value as Tool; cv.style.cursor = r.value === "move" ? "grab" : "crosshair"; };
$<HTMLInputElement>("heightFt").onchange = (e) => { tool.height = Number((e.target as HTMLInputElement).value) || 0; };
$<HTMLSelectElement>("surface").onchange = (e) => { tool.surface = (e.target as HTMLSelectElement).value; };
attachTools(cv, (kind) => { if (kind === "edit") S.dirty = true; refresh(true); });

// add / delete things
function add(make: (pos: { col: number; row: number }) => void, footprint = 1): void {
  const pos = freeCell(footprint);
  if (!pos) { alert("ไม่มีช่องว่างเหลือ"); return; }
  remember(); make(pos); S.dirty = true; rebuild(); refresh(true);
}
$("addCreature").onclick = () => add((pos) => { const id = newId("n"); S.stage.creatures.push(makeCreature({ id, name: `NPC ${id.slice(1)}`, pos, save: { str: 0, dex: 0 } })); S.focus = id; });
$("addCrate").onclick = () => add((pos) => { const id = newId("p"); S.stage.props.push(makeProp({ id, name: "Crate", pos })); S.focus = id; });
$("addStatue").onclick = () => add((pos) => { const id = newId("p"); S.stage.props.push(makeProp({ id, name: "Statue", material: "stone", heightFt: 6, pos })); S.focus = id; });
$("del").onclick = () => {
  const t = thingById(S.focus); if (!t) return;
  remember(); S.stage.creatures = S.stage.creatures.filter((c) => c.id !== t.id); S.stage.props = S.stage.props.filter((p) => p.id !== t.id);
  S.dirty = true; rebuild(); refresh(true);
};
for (const id of ["cols", "rows"]) $<HTMLInputElement>(id).onchange = () => {
  const ext = things().reduce((m, t) => ({ c: Math.max(m.c, t.pos.col + t.footprint), r: Math.max(m.r, t.pos.row + t.footprint) }), { c: 4, r: 4 });
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v || lo));
  remember(); S.stage.cols = clamp(Number($<HTMLInputElement>("cols").value), ext.c, 30); S.stage.rows = clamp(Number($<HTMLInputElement>("rows").value), ext.r, 20);
  S.dirty = true; rebuild(); refresh(true);
};

// inspector: one listener for every field
const insp = $("inspector");
insp.onchange = (e) => {
  const el = e.target as HTMLInputElement; if (!el.dataset.f) return;
  if (applyEdit(el.dataset.f, el.type === "checkbox" ? el.checked : el.value)) { S.dirty = true; refresh(true); }
};
insp.onclick = (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>("[data-act]"); if (!b) return;
  if (applyEdit(b.dataset.act!, true)) { S.dirty = true; refresh(true); }
};

initZoneUI(() => { S.dirty = true; refresh(true); });
cv.style.cursor = "grab";
initCastDemo(cv);
setScenario(ALL[0]);
