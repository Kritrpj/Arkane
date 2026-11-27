/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  MOD
} from "./chunks/chunk-VELQ4LWX.js";

// src/foundry/heights.ts
async function setHeightArea(col1, row1, col2, row2, ft) {
  if (!game.user.isGM) {
    ui.notifications.warn("\u0E40\u0E09\u0E1E\u0E32\u0E30 GM");
    return 0;
  }
  const h = {};
  for (let r = Math.min(row1, row2); r <= Math.max(row1, row2); r++)
    for (let c = Math.min(col1, col2); c <= Math.max(col1, col2); c++) h[`${c},${r}`] = ft;
  await canvas.scene.setFlag(MOD, "heights", h);
  return Object.keys(h).length;
}

// src/features/heights.ts
function register(core) {
  core.setHeightArea = setHeightArea;
}
export {
  register
};
