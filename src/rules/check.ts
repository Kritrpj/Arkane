// Executes a saving throw. WHAT to roll (bonus, advantage, auto-fail) is decided by the Ruleset;
// this file only rolls it and builds the breakdown.
import type { CheckResult, Part } from "../model/check";
import type { Adv, Dice } from "./dice";

export const sum = (parts: Part[]): number => parts.reduce((n, p) => n + p.value, 0);

export interface SaveInput {
  label: string;           // "STR save"
  bonus: number;
  adv: Adv;
  autoFail?: string;       // condition name that makes it fail without rolling
  dcParts: Part[];
}

export function rollSave(i: SaveInput, dice: Dice): CheckResult {
  const dc = sum(i.dcParts);
  if (i.autoFail) {
    return { ok: false, total: 0, dc, natural: 0, crit: false, fumble: false, dcParts: i.dcParts,
      roll: [{ label: `ล้มเหลวอัตโนมัติ (${i.autoFail})`, value: 0 }] };
  }
  const r = dice.d20(i.adv);
  const roll: Part[] = [
    { label: i.adv === "normal" ? "d20" : `d20 (${i.adv})`, value: r.natural },
    { label: i.label, value: i.bonus },
  ];
  const total = sum(roll);
  return { ok: total >= dc, total, dc, natural: r.natural, crit: false, fumble: false, roll, dcParts: i.dcParts };
}

// "d20 5 + STR save 0 = 5 vs DC 13 (8 + STR 3 + prof 2)"  (used by the chat card and the harness)
const parts = (p: Part[]) => p.map((x) => `${x.label} ${x.value}`).join(" + ");
export const formatCheck = (c: CheckResult) => `${parts(c.roll)} = ${c.total} vs DC ${c.dc} (${parts(c.dcParts)})`;
