// npm run release -- <patch|minor|major> "what changed"
// 1) checks (typecheck + tests, stops if red)  2) bumps the version in package.json
// 3) rebuilds arkane-core/ (core.js + one .js per feature + manifest.json, version = cache-buster)
// 4) adds a line to CHANGELOG.md.   Nothing outside our own folders is touched (no scripts/arkane.js).
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { buildCore } from "./build.mjs";
import { bump, changelogEntry } from "./version.mjs";

const [kind, ...words] = process.argv.slice(2);
if (!["patch", "minor", "major"].includes(kind ?? "")) {
  console.error('usage: npm run release -- <patch|minor|major> "what changed"');
  process.exit(1);
}

execSync("npm run check", { stdio: "inherit" });                  // throws (and stops) when red

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const prev = pkg.version, next = bump(prev, kind);
pkg.version = next;
writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
if (existsSync("package-lock.json")) {
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  lock.version = next; if (lock.packages?.[""]) lock.packages[""].version = next;
  writeFileSync("package-lock.json", JSON.stringify(lock, null, 2) + "\n");
}

const { features } = await buildCore(next);

const log = existsSync("CHANGELOG.md") ? readFileSync("CHANGELOG.md", "utf8") : "# Changelog\n\n";
const head = "# Changelog\n\n";
writeFileSync("CHANGELOG.md", head + changelogEntry(next, words.join(" ").trim()) + log.replace(head, ""));

console.log(`\nrelease ${prev} -> ${next}\nbuilt: core + ${features.join(", ")}\ncommit: src/ arkane-core/ CHANGELOG.md package.json`);
