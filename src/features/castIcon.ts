// Feature "castIcon": the used item/spell icon fades up above the caster's token.
//   game.arkane.core.castIcon.enable(false)   // turn off on THIS computer (remembered)
//   game.arkane.core.castIcon.show(token, "icons/svg/aura.svg")   // try it by hand
import { castIconEnabled, onCast, onChatMessage, setCastIconEnabled, showCastIcon } from "../foundry/castIcon";

export function register(core: any): void {
  Hooks.on("createChatMessage", onChatMessage);
  core.castIcon = { enable: setCastIconEnabled, enabled: castIconEnabled, show: showCastIcon, onCast };
}
