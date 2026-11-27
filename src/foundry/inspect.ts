// Debug helper for testers: game.arkane.core.inspect() prints what the core "sees" for the selected token,
// including WHERE each number came from (massSource: override | weight | height | size).
import { toCreature, toProp } from "./snapshot";

export function inspect(tok?: any) {
  const doc = tok ?? canvas.tokens.controlled[0]?.document;
  const prop = doc ? toProp(doc) : null;
  if (prop) {
    console.log("arkane-1920s | core inspect (prop)", prop.name, { material: prop.material, heightFt: prop.heightFt,
      footprint: prop.footprint, mass: prop.mass, massSource: prop.massSource, tags: prop.tags, elevation: prop.elevation });
    return prop;
  }
  const c = doc ? toCreature(doc) : null;
  if (!c) { ui.notifications.warn("เลือก token ก่อน"); return null; }
  console.log("arkane-1920s | core inspect", c.name, {
    size: c.size, footprint: c.footprint, mass: c.mass, massSource: c.massSource, massNote: c.massNote,
    strScore: c.strScore, strMod: c.mod.str, elevation: c.elevation, conditions: c.conditions, tags: c.tags,
    sheetWeight: doc.actor?.system?.details?.weight, sheetHeight: doc.actor?.system?.details?.height,
  });
  return c;
}
