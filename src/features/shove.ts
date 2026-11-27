// Feature "shove": game.arkane.core.shove()
import { shove } from "../foundry/shove";
export function register(core: any): void { core.shove = shove; }
