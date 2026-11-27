// Feature "heights": game.arkane.core.setHeightArea(...)  (GM paints ground height)
import { setHeightArea } from "../foundry/heights";
export function register(core: any): void { core.setHeightArea = setHeightArea; }
