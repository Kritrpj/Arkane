// The released folder (arkane-core/): build into a temp dir, then load it the way Foundry does
// (loader.js -> manifest.json -> core.js + one file per feature). Catches a broken split before friends see it.
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { buildCore, featureIds } from "../tools/build.mjs";
import { loadCore } from "../tools/loader.js";

const G = globalThis as any;
let out: string, base: string;

beforeAll(async () => {
  out = mkdtempSync(join(tmpdir(), "arkane-core-"));
  await buildCore("9.9.9", out);
  base = pathToFileURL(out + "/").href;
});
afterAll(() => rmSync(out, { recursive: true, force: true }));

const fetchJson = async (u: string) => JSON.parse(readFileSync(new URL(u), "utf8"));
const load = (u: string) => import(/* @vite-ignore */ u);

describe("build output", () => {
  it("has loader, manifest, core and one file per feature", () => {
    const m = JSON.parse(readFileSync(join(out, "manifest.json"), "utf8"));
    expect(m.version).toBe("9.9.9");
    expect(m.features).toEqual(featureIds());
    expect(m.features).toEqual(expect.arrayContaining(["shove", "charge", "zones", "props", "heights"]));
    for (const f of ["loader", "core", ...m.features]) expect(existsSync(join(out, `${f}.js`))).toBe(true);
    expect(readdirSync(join(out, "chunks")).length).toBeGreaterThan(0);          // shared code is split out, not copied into each feature
    expect(readFileSync(join(out, "shove.js"), "utf8").startsWith("/* arkane-core 9.9.9")).toBe(true);
  });
  it("a rebuild removes chunks of older releases", async () => {
    const again = mkdtempSync(join(tmpdir(), "arkane-core-"));
    try { await buildCore("1.0.0", again); const first = readdirSync(join(again, "chunks")); await buildCore("1.0.1", again); expect(readdirSync(join(again, "chunks")).length).toBe(first.length); }
    finally { rmSync(again, { recursive: true, force: true }); }
  });
});

describe("loadCore (what loader.js does in Foundry)", () => {
  const fakeGame = () => { G.game = { socket: { on: vi.fn() }, users: { activeGM: { isSelf: true } }, arkane: { shove: "old" } }; G.Hooks = { on: vi.fn(), once: vi.fn() }; };

  it("builds game.arkane.core from core.js plus every feature, and leaves the friend's keys alone", async () => {
    fakeGame();
    const core = await loadCore({ base, fetchJson, load, log: { warn: vi.fn() } });
    expect(core.version).toBe("9.9.9");
    for (const k of ["shove", "charge", "setProp", "setHeightArea", "zones", "useRules", "inspect"]) expect(core[k], k).toBeTruthy();
    expect(core.features).toEqual({ loaded: featureIds(), failed: [] });
    expect(G.game.arkane.core).toBe(core);
    expect(G.game.arkane.shove).toBe("old");
  });

  it("one broken feature is skipped, the rest still load", async () => {
    fakeGame();
    const warn = vi.fn();
    const brokenLoad = (u: string) => (u.includes("/charge.js") ? Promise.reject(new Error("boom")) : load(u));
    const core = await loadCore({ base, fetchJson, load: brokenLoad, log: { warn } });
    expect(core.features.failed).toEqual(["charge"]);
    expect(core.charge).toBeUndefined();
    expect(typeof core.shove).toBe("function");
    expect(warn).toHaveBeenCalled();
  });

  it("asks for each file with ?v=<version> so a new release is never served from cache", async () => {
    fakeGame();
    const seen: string[] = [];
    await loadCore({ base, fetchJson, load: (u: string) => { seen.push(u); return load(u); }, log: { warn: vi.fn() } });
    expect(seen.length).toBe(featureIds().length + 1);
    expect(seen.every((u) => u.endsWith("?v=9.9.9"))).toBe(true);
  });
});
