// Registry: the UI builds its buttons from this list instead of hand-written buttons.
import { Charge } from "./charge";
import { Shove } from "./shove";

export const ACTIONS = { shove: Shove, charge: Charge } as const;
export type ActionId = keyof typeof ACTIONS;
export { Charge, Shove };
