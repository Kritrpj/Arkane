// Who can cast: key (used in byCaster and in icon file names) -> how to recognise the actor by name.
// `defaults` (optional) = how this character casts EVERYTHING, written as a spell patch, e.g.
//   perry: { match: "^perry", defaults: { casting: { medium: "wand" } } }
// A spell's own byCaster[key] is applied after it, so it wins.
import type { CasterInfo } from "../spells/types";

export const CASTERS: Record<string, CasterInfo> = {
  vivian: { match: "^vivian" },
  mozxorion: { match: "^mozxorion" },
  windows: { match: "^windows?" },
  nincolas: { match: "^nincolas" },
  perry: { match: "^perry" },
};

const RX = Object.entries(CASTERS).map(([k, v]) => [k, new RegExp(v.match, "i")] as const);
export const casterKeyOf = (actorName?: string): string | undefined => (actorName ? RX.find(([, rx]) => rx.test(actorName))?.[0] : undefined);
