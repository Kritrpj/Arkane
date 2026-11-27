// The form for the focused thing: change mass, size, STR, material, conditions... and see the sidebar react.
import type { Creature, SizeKey } from "../src/model/creature";
import { SIZES } from "../src/model/creature";
import type { Prop } from "../src/model/thing";
import { BODY } from "../src/data/bodies";
import { MATERIALS } from "../src/data/props";
import { resolvePropMass } from "../src/rules/propMass";
import { S, fits, isProp, remember, thingById } from "./state";

const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const FOOTPRINT: Record<SizeKey, number> = { tiny: 1, sm: 1, med: 1, lg: 2, huge: 3, grg: 4 };
const CONDITIONS = ["prone", "restrained", "paralyzed", "unconscious"];

const field = (label: string, name: string, value: unknown, type = "number", extra = "") =>
  `<label>${label}<input data-f="${name}" type="${type}" value="${esc(value)}" ${extra}></label>`;
const check = (label: string, name: string, on: boolean) => `<label class="chk"><input data-f="${name}" type="checkbox" ${on ? "checked" : ""}>${label}</label>`;
const select = (label: string, name: string, value: string, options: string[]) =>
  `<label>${label}<select data-f="${name}">${options.map((o) => `<option ${o === value ? "selected" : ""}>${o}</option>`).join("")}</select></label>`;

export function renderInspector(host: HTMLElement): void {
  const t = thingById(S.focus);
  if (!t) { host.innerHTML = `<p class="hint">คลิกตัวละครหรือของบนกระดานเพื่อแก้ค่า</p>`; return; }
  const role = t.id === S.actor ? "ผู้ผลัก" : t.id === S.target ? "เป้าหมาย" : "";
  if (isProp(t)) {
    host.innerHTML = `<h4>${esc(t.name)} <small>ของ (prop) ${role}</small></h4><div class="grid">
      ${field("ชื่อ", "name", t.name, "text")}
      ${select("วัสดุ", "material", t.material, Object.keys(MATERIALS))}
      ${field("สูง (ฟุต)", "heightFt", t.heightFt, "number", 'min="1"')}
      ${field("ขนาด (ช่อง)", "footprint", t.footprint, "number", 'min="1" max="4"')}
      ${field(`มวล lb <em>(${t.massSource === "override" ? "ตั้งเอง" : "จากวัสดุ"})</em>`, "mass", Math.round(t.mass * 10) / 10, "number", 'min="1"')}
      ${check("ตรึงอยู่กับที่ (immovable)", "immovable", t.tags.includes("immovable"))}
    </div><button data-act="resetMass">คืนมวลตามวัสดุ</button>`;
    return;
  }
  const c = t as Creature;
  host.innerHTML = `<h4>${esc(c.name)} <small>ตัวละคร ${role}</small></h4><div class="grid">
    ${field("ชื่อ", "name", c.name, "text")}
    ${select("ขนาด", "size", c.size, [...SIZES])}
    ${field("ขนาด (ช่อง)", "footprint", c.footprint, "number", 'min="1" max="4"')}
    ${field(`มวล lb <em>(${c.massSource === "size" ? "ตามตาราง size" : "ตั้งเอง"})</em>`, "mass", Math.round(c.mass * 10) / 10, "number", 'min="1"')}
    ${field("STR mod", "strMod", c.mod.str)}
    ${field("STR save", "saveStr", c.save.str)}
    ${field("DEX save", "saveDex", c.save.dex)}
    ${field("HP", "hp", c.hp.value, "number", 'min="0"')}
    ${field("prof", "prof", c.prof)}
  </div><div class="checks">
    ${CONDITIONS.map((k) => check(k, `cond:${k}`, c.conditions.includes(k))).join("")}
    ${check("flying (บิน)", "flying", c.tags.includes("flying"))}
  </div><button data-act="resetMass">คืนมวลตาม size</button>`;
}

// returns true when something really changed (so the caller redraws and re-explains)
export function applyEdit(name: string, raw: string | boolean): boolean {
  const t = thingById(S.focus); if (!t) return false;
  const num = Number(raw), good = Number.isFinite(num);
  remember();
  if (name === "name") t.name = String(raw).slice(0, 24) || t.name;
  else if (name === "footprint") { if (good && num >= 1 && fits({ ...t, footprint: Math.round(num) }, t.pos)) t.footprint = Math.round(num); }
  else if (isProp(t)) editProp(t, name, raw, num, good);
  else editCreature(t as Creature, name, raw, num, good);
  return true;
}

function refreshPropMass(p: Prop) {
  if (p.massSource === "override") return;
  p.mass = resolvePropMass({ material: p.material, heightFt: p.heightFt, footprint: p.footprint, cellFt: S.world.cellFt }).mass;
}

function editProp(p: Prop, name: string, raw: string | boolean, num: number, good: boolean) {
  if (name === "material") p.material = String(raw);
  else if (name === "heightFt" && good && num > 0) p.heightFt = num;
  else if (name === "mass" && good && num > 0) { p.mass = num; p.massSource = "override"; }
  else if (name === "immovable") p.tags = raw ? ["prop", "immovable"] : ["prop"];
  else if (name === "resetMass") { p.massSource = "material"; }
  refreshPropMass(p);
}

function editCreature(c: Creature, name: string, raw: string | boolean, num: number, good: boolean) {
  if (name === "size") {
    c.size = String(raw) as SizeKey; c.footprint = FOOTPRINT[c.size];
    if (!fits(c, c.pos)) c.footprint = 1;
    if (c.massSource === "size") c.mass = BODY[c.size].massLb;
  } else if (name === "mass" && good && num > 0) { c.mass = num; c.massSource = "override"; }
  else if (name === "resetMass") { c.mass = BODY[c.size].massLb; c.massSource = "size"; }
  else if (name === "strMod" && good) c.mod.str = num;
  else if (name === "saveStr" && good) c.save.str = num;
  else if (name === "saveDex" && good) c.save.dex = num;
  else if (name === "prof" && good) c.prof = num;
  else if (name === "hp" && good) { c.hp.value = Math.max(0, num); c.hp.max = Math.max(c.hp.max, c.hp.value); }
  else if (name === "flying") c.tags = raw ? [...new Set([...c.tags, "flying"])] : c.tags.filter((x) => x !== "flying");
  else if (name.startsWith("cond:")) {
    const k = name.slice(5);
    c.conditions = raw ? [...new Set([...c.conditions, k])] : c.conditions.filter((x) => x !== k);
  }
}

