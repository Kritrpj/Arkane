// npm run build : bundles src/ into arkane-core/ (our own folder, nothing else in the project is touched):
//   loader.js        entry for Foundry (copied from tools/loader.js)
//   manifest.json    version + list of features (what loader.js reads)
//   core.js          base (game.arkane.core)
//   <feature>.js     one file per src/features/<feature>.ts  (shove.js, charge.js, zones.js, ...)
//   chunks/          code shared between them (content-hashed names)
// Add a feature = add src/features/<name>.ts exporting register(core); the build finds it by itself.
import { build } from "esbuild";
import { copyFileSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { manifestFor } from "./version.mjs";

export const OUT = "arkane-core";

export function featureIds(srcDir = "src/features") {
  return readdirSync(srcDir).filter((f) => f.endsWith(".ts")).map((f) => f.slice(0, -3)).sort();
}

export async function buildCore(version, outdir = OUT) {
  const features = featureIds();
  rmSync(outdir, { recursive: true, force: true });            // stale chunks from older releases must not pile up
  mkdirSync(outdir, { recursive: true });
  const entryPoints = { core: "src/core.ts", ...Object.fromEntries(features.map((f) => [f, `src/features/${f}.ts`])) };
  await build({
    entryPoints, bundle: true, splitting: true, format: "esm", target: "es2022",
    outdir, chunkNames: "chunks/[name]-[hash]",
    define: { __CORE_VERSION__: JSON.stringify(version) },
    banner: { js: `/* arkane-core ${version} - generated from src/, do not edit by hand */` },
  });
  copyFileSync("tools/loader.js", join(outdir, "loader.js"));
  writeFileSync(join(outdir, "manifest.json"), JSON.stringify(manifestFor(version, features), null, 2) + "\n");
  return { outdir, features };
}

if (resolve(fileURLToPath(import.meta.url)) === resolve(process.argv[1] ?? "")) {
  const v = JSON.parse(readFileSync("package.json", "utf8")).version;
  const { features } = await buildCore(v);
  console.log(`built ${OUT}/ v${v}: core + ${features.join(", ")}`);
}
