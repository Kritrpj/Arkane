// Pure helpers for releases (tested in tests/release.test.ts).

// patch = bug fix (0.1.0 -> 0.1.1) | minor = new feature (0.1.1 -> 0.2.0) | major = breaking change (0.2.0 -> 1.0.0)
export function bump(version, kind) {
  const [a, b, c] = version.split(".").map(Number);
  if (kind === "major") return `${a + 1}.0.0`;
  if (kind === "minor") return `${a}.${b + 1}.0`;
  if (kind === "patch") return `${a}.${b}.${c + 1}`;
  throw new Error(`unknown bump "${kind}" (use patch, minor or major)`);
}

// what arkane-core/loader.js reads: the version (cache-buster) and which feature files to load
export function manifestFor(version, features) {
  return { version, features: [...features] };
}

export function changelogEntry(version, note, date = new Date().toISOString().slice(0, 10)) {
  return `## ${version} - ${date}\n- ${note || "(no description)"}\n\n`;
}
