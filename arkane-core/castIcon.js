/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  castIconEnabled,
  onCast,
  onChatMessage,
  setCastIconEnabled,
  showCastIcon
} from "./chunks/chunk-NYGZWKVM.js";
import "./chunks/chunk-VELQ4LWX.js";
import "./chunks/chunk-FIVJTHGI.js";
import "./chunks/chunk-H7JZCNPB.js";

// src/features/castIcon.ts
function register(core) {
  Hooks.on("createChatMessage", onChatMessage);
  core.castIcon = { enable: setCastIconEnabled, enabled: castIconEnabled, show: showCastIcon, onCast };
}
export {
  register
};
