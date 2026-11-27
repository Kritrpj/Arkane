// Feature "charge": game.arkane.core.charge()
import { charge } from "../foundry/charge";
export function register(core: any): void { core.charge = charge; }
