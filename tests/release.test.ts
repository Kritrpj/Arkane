import { describe, expect, it } from "vitest";
import { bump, changelogEntry, manifestFor } from "../tools/version.mjs";

describe("bump", () => {
  it("patch / minor / major", () => {
    expect(bump("0.1.0", "patch")).toBe("0.1.1");
    expect(bump("1.4.7", "minor")).toBe("1.5.0");        // minor resets patch
    expect(bump("1.4.7", "major")).toBe("2.0.0");        // major resets both
  });
  it("rejects anything else", () => { expect(() => bump("1.0.0", "huge")).toThrow(); });
});

describe("manifestFor", () => {
  it("carries the version and a copy of the feature list", () => {
    const f = ["shove", "zones"];
    const m = manifestFor("0.8.0", f);
    expect(m).toEqual({ version: "0.8.0", features: ["shove", "zones"] });
    expect(m.features).not.toBe(f);
  });
});

describe("changelogEntry", () => {
  it("formats version, date and note", () => {
    expect(changelogEntry("0.2.0", "เพิ่ม throw", "2026-11-24")).toBe("## 0.2.0 - 2026-11-24\n- เพิ่ม throw\n\n");
  });
});
