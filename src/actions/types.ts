// An Action = "can this be used?" + "what happens?". resolve() is PURE: it reads the world and
// returns effects, it never changes anything. That is what makes previews and tests possible.
import type { Effect } from "../model/effect";
import type { World } from "../model/world";
import type { Ruleset } from "../rules/ruleset";
import type { Dice } from "../rules/dice";
import type { Trace } from "../model/trace";

export interface Ctx { world: World; rules: Ruleset; dice: Dice; trace?: Trace }

export type Usable = { ok: true } | { ok: false; reason: string };
export const yes: Usable = { ok: true };
export const no = (reason: string): Usable => ({ ok: false, reason });

export interface Action<Input> {
  id: string;
  label: string;
  canUse(ctx: Ctx, input: Input): Usable;
  resolve(ctx: Ctx, input: Input): Effect[];
}
