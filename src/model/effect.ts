// What an action decides should happen. Actions never change the world themselves,
// they return a list of effects; the adapter (Foundry) or the harness applies them.
// Because Effect is a union, the compiler complains if an applier forgets a kind.
import type { Cell } from "./world";
import type { CheckResult } from "./check";

export type Cost = "action" | "bonus" | "reaction";

export type Effect =
  | { kind: "log"; text: string; check?: CheckResult }            // chat message / combat log line
  | { kind: "push"; target: string; to: Cell }                    // move a creature (already validated)
  | { kind: "prone"; target: string }
  | { kind: "damage"; target: string; amount: number; type: string }
  | { kind: "spendItem"; owner: string; itemId: string; qty: number }
  | { kind: "spendCost"; actor: string; cost: Cost };

// short constructors so action code reads like a sentence
export const Fx = {
  log: (text: string, check?: CheckResult): Effect => ({ kind: "log", text, check }),
  push: (target: string, to: Cell): Effect => ({ kind: "push", target, to }),
  prone: (target: string): Effect => ({ kind: "prone", target }),
  damage: (target: string, amount: number, type: string): Effect => ({ kind: "damage", target, amount, type }),
  spendItem: (owner: string, itemId: string, qty = 1): Effect => ({ kind: "spendItem", owner, itemId, qty }),
  spendCost: (actor: string, cost: Cost): Effect => ({ kind: "spendCost", actor, cost }),
};
