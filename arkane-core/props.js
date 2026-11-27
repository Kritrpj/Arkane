/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  MATERIALS,
  MOD
} from "./chunks/chunk-VELQ4LWX.js";

// src/foundry/props.ts
async function setProp(opts = {}, tokens) {
  if (!game.user.isGM) {
    ui.notifications.warn("\u0E40\u0E09\u0E1E\u0E32\u0E30 GM");
    return 0;
  }
  const docs = tokens ?? (canvas.tokens?.controlled ?? []).map((t) => t.document);
  if (!docs.length) {
    ui.notifications.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01 token \u0E01\u0E48\u0E2D\u0E19");
    return 0;
  }
  if (opts?.material && !MATERIALS[opts.material]) {
    ui.notifications.warn(`\u0E44\u0E21\u0E48\u0E21\u0E35\u0E27\u0E31\u0E2A\u0E14\u0E38 "${opts.material}" (\u0E43\u0E0A\u0E49\u0E44\u0E14\u0E49: ${Object.keys(MATERIALS).join(", ")})`);
    return 0;
  }
  for (const d of docs) {
    if (opts === null) await d.unsetFlag(MOD, "prop");
    else await d.setFlag(MOD, "prop", Object.keys(opts).length ? opts : true);
  }
  return docs.length;
}

// src/features/props.ts
function register(core) {
  core.setProp = setProp;
}
export {
  register
};
