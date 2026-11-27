// GM helpers to paint ground height (ft) on the current scene. Stored as a scene flag.
//   game.arkane.core.setHeightArea(7, 2, 8, 4, -20)   // cols 7-8, rows 2-4 are 20 ft lower
import { MOD } from "./snapshot";

export async function setHeightArea(col1: number, row1: number, col2: number, row2: number, ft: number): Promise<number> {
  if (!game.user.isGM) { ui.notifications.warn("เฉพาะ GM"); return 0; }
  const h: Record<string, number> = {};
  for (let r = Math.min(row1, row2); r <= Math.max(row1, row2); r++)
    for (let c = Math.min(col1, col2); c <= Math.max(col1, col2); c++) h[`${c},${r}`] = ft;
  await canvas.scene.setFlag(MOD, "heights", h);          // merges with what is already there
  return Object.keys(h).length;
}
