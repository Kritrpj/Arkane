// Feature "props": game.arkane.core.setProp(...)  (GM marks tokens as props)
import { setProp } from "../foundry/props";
export function register(core: any): void { core.setProp = setProp; }
