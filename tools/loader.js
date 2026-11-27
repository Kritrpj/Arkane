// arkane-core/loader.js  (copied here by tools/build.mjs, hand-written, almost never changes)
// The ONLY file Foundry is pointed at (one line in module.json "esmodules"). It reads manifest.json (never cached),
// then imports core.js and every feature listed there with ?v=<version> (cache-buster lives here, not in arkane.js).
// One feature failing to load is logged and skipped; the others still run.

export async function loadCore({ base, fetchJson, load, log = { warn: (...a) => console.warn(...a) } }) {
  const m = await fetchJson(new URL("manifest.json", base).href);
  const url = (id) => new URL(`${id}.js?v=${encodeURIComponent(m.version)}`, base).href;
  const core = (await load(url("core"))).createCore();
  const loaded = [], failed = [];
  for (const id of m.features) {
    try { (await load(url(id))).register(core); loaded.push(id); }
    catch (e) { failed.push(id); log.warn("arkane-1920s | core feature", id, "failed:", e); }
  }
  core.features = { loaded, failed };
  return core;
}

// Foundry side. Skipped when there is no Foundry (tests import loadCore directly).
if (typeof Hooks !== "undefined" && typeof game !== "undefined") {
  const run = () => loadCore({
    base: import.meta.url,
    fetchJson: (u) => fetch(u, { cache: "no-store" }).then((r) => { if (!r.ok) throw new Error(`${u} ${r.status}`); return r.json(); }),
    load: (u) => import(u),
  }).catch((e) => console.warn("arkane-1920s | core failed to load", e));
  if (game.ready) run(); else Hooks.once("ready", run);
}
