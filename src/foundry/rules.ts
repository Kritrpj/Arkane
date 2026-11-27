// The ruleset currently in force (shared by shove and charge). Switch in the console:  game.arkane.core.useRules("physics")
import { Ruleset } from "../rules/ruleset";
import { RulesetPhysics } from "../rules/physicsRuleset";

let ruleset = new Ruleset();
export const setRuleset = (r: Ruleset): void => { ruleset = r; };
export const currentRules = (): Ruleset => ruleset;

// named rulebooks
const RULEBOOKS: Record<string, () => Ruleset> = { "2024": () => new Ruleset(), physics: () => new RulesetPhysics() };
export function useRules(name: string): string {
  const make = RULEBOOKS[name];
  if (!make) { ui.notifications.warn(`ไม่มีชุดกฎ "${name}" (ใช้ได้: ${Object.keys(RULEBOOKS).join(", ")})`); return ruleset.name; }
  ruleset = make();
  return ruleset.name;
}
