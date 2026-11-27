// "Hunter's Mark" -> "hunters-mark" (same rule as the icon file names: apostrophes dropped, other non-letters -> "-")
export const slugOf = (name: string): string =>
  String(name ?? "").trim().toLowerCase().replace(/['\u2019\u2018`]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
