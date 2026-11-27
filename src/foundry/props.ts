// GM helpers to mark tokens as props. The flag lives on the TOKEN (not the actor), so one "Barrel" actor
// can be a heavy iron drum in one place and a light wooden one in another.
//   game.arkane.core.setProp({ material: "stone", heightFt: 6 })        // every selected token
//   game.arkane.core.setProp({ immovable: true })                       // bolted down: acts like a wall
//   game.arkane.core.setProp(null)                                      // back to a normal token
// options: material (wood | stone | iron | water), heightFt, fill (0..1 how solid), mass (lb, wins over everything), immovable
import { MATERIALS } from "../data/props";
import { MOD } from "./snapshot";

export interface PropOptions { material?: string; heightFt?: number; fill?: number; mass?: number; immovable?: boolean }

export async function setProp(opts: PropOptions | null = {}, tokens?: any[]): Promise<number> {
  if (!game.user.isGM) { ui.notifications.warn("เฉพาะ GM"); return 0; }
  const docs: any[] = tokens ?? (canvas.tokens?.controlled ?? []).map((t: any) => t.document);
  if (!docs.length) { ui.notifications.warn("เลือก token ก่อน"); return 0; }
  if (opts?.material && !MATERIALS[opts.material]) {
    ui.notifications.warn(`ไม่มีวัสดุ "${opts.material}" (ใช้ได้: ${Object.keys(MATERIALS).join(", ")})`);
    return 0;
  }
  for (const d of docs) {
    if (opts === null) await d.unsetFlag(MOD, "prop");
    else await d.setFlag(MOD, "prop", Object.keys(opts).length ? opts : true);
  }
  return docs.length;
}

