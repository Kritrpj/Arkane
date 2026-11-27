// The result of any d20 test (save, attack, contest). Carries the breakdown so the UI can show
// "DC 13 = 8 + STR 3 + prof 2" and so tests can see WHY it passed.
export interface Part { label: string; value: number }

export interface CheckResult {
  ok: boolean;
  total: number;
  dc: number;                // DC, or the target's AC for an attack
  natural: number;           // the die that counted (after advantage / disadvantage)
  crit: boolean;             // natural 20 on an attack
  fumble: boolean;           // natural 1 on an attack
  roll: Part[];              // what was added to the die
  dcParts: Part[];           // how the DC was built
}
