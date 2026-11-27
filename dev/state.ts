// The harness' one piece of mutable state: the board (a Stage), the World built over it, who is selected,
// and an undo stack. Everything else (drawing, mouse tools, sidebar) reads from here.
// GridWorld keeps the SAME arrays/objects as the Stage, so moving a creature in the stage moves it in the world.
import type { Creature } from "../src/model/creature";
import type { Effect } from "../src/model/effect";
import type { Prop, Thing } from "../src/model/thing";
import type { Cell } from "../src/model/world";
import type { Point } from "../src/model/zone";
import type { Report } from "../src/rules/turnReport";
import { GridWorld } from "../src/world/gridWorld";
import { cellsOf } from "../src/rules/reach";
import { emptyStage, RULEBOOKS, type RulesKey, type Stage } from "./stage";
import type { Scenario } from "./scenarios";

export const S = {
  stage: emptyStage(), world: undefined as unknown as GridWorld,
  actor: "", target: "", focus: "",             // focus = the thing shown in the inspector
  rulesKey: "2024" as RulesKey,
  scenario: undefined as Scenario | undefined,
  dirty: false,                                  // true once the board was edited after loading a scenario
  preview: [] as Effect[],
  report: undefined as Report | undefined,       // สรุปให้ DM ล่าสุด
  round: 0,                                      // นาฬิกา combat ของ harness (ไว้ลองหมดอายุ)
  probe: undefined as Point | undefined,         // จุดที่ส่องอยู่ (ฟุต)
  coverage: "center" as "center" | "fraction",   // ช่องนับว่าถูกคลุมแบบไหน
};

export const isProp = (t: Thing): t is Prop => "material" in t;
export const rules = () => RULEBOOKS[S.rulesKey].make();
export const things = (): Thing[] => [...S.stage.creatures, ...S.stage.props];
export const thingById = (id: string): Thing | undefined => things().find((t) => t.id === id);
export const creatureById = (id: string): Creature | undefined => S.stage.creatures.find((c) => c.id === id);

export function rebuild(): void {
  const s = S.stage;
  S.world = new GridWorld({ cols: s.cols, rows: s.rows, walls: s.walls, heights: s.heights, surfaces: s.surfaces, creatures: s.creatures, props: s.props,
    zones: s.zones ?? [], coverage: S.coverage === "fraction" ? { mode: "fraction", min: 0.5 } : { mode: "center" } });
  if (!creatureById(S.actor)) S.actor = S.stage.creatures[0]?.id ?? "";
  if (!creatureById(S.target)) S.target = S.stage.creatures.find((c) => c.id !== S.actor)?.id ?? S.actor;
  if (!thingById(S.focus)) S.focus = S.target;
  S.preview = [];
}

export function loadScenario(sc: Scenario): void {
  S.scenario = sc; S.dirty = false; S.rulesKey = sc.rules; S.stage = sc.build();
  S.actor = sc.actor; S.target = sc.target; S.focus = sc.target; hist.length = 0; S.round = 0; S.probe = undefined; S.report = undefined;
  rebuild();
}

// ---- undo
const hist: string[] = [];
export const remember = (): void => { hist.push(JSON.stringify(S.stage)); if (hist.length > 50) hist.shift(); };
export const canUndo = (): boolean => hist.length > 0;
export function undo(): boolean {
  const j = hist.pop();
  if (!j) return false;
  S.stage = JSON.parse(j); rebuild();
  return true;
}

// ---- placing things
export function fits(t: Thing, pos: Cell): boolean {
  return cellsOf(t, pos).every((c) => {
    if (c.col < 0 || c.row < 0 || c.col >= S.stage.cols || c.row >= S.stage.rows) return false;
    const o = S.world.occupant(c), p = S.world.propAt(c);
    return (!o || o.id === t.id) && (!p || p.id === t.id);
  });
}
export function freeCell(footprint: number): Cell | undefined {
  const probe = { id: "?", pos: { col: 0, row: 0 }, footprint };
  for (let r = 0; r < S.stage.rows; r++) for (let c = 0; c < S.stage.cols; c++) if (fits(probe as Thing, { col: c, row: r })) return { col: c, row: r };
  return undefined;
}
export function newId(prefix: string): string {
  let n = 1; while (thingById(`${prefix}${n}`)) n++;
  return `${prefix}${n}`;
}
export function thingAt(cell: Cell): Thing | undefined { return S.world.occupant(cell) ?? S.world.propAt(cell); }
