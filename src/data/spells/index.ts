// The catalog the game uses: core + house/custom spells + the icon manifest + the casters.
import { Catalog } from "../../spells/catalog";
import { CASTERS } from "../casters";
import { ICON_MANIFEST } from "../spellIcons.generated";
import { CORE } from "./core";
import { CORE_MORE } from "./coreMore";
import { JB2A } from "./jb2aNames";
import type { FxRef, SpellDef } from "../../spells/types";
import { HOUSE } from "./house";

// jb2aNames.ts is merged into each spell's fx.refs: the spell's own refs (custom files first) -> JB2A names -> a plain line
const withJb2a = (d: SpellDef): SpellDef => {
  const j = JB2A[d.id]; if (!j) return d;
  const fx = d.fx as { refs?: FxRef[] } | undefined;   // d is a patch type: fx may be a { $set } form, a spell written in the catalog is always the plain form
  const own = (Array.isArray(fx?.refs) ? fx!.refs : []) as FxRef[];
  const seqs: FxRef[] = j.seq.filter((s) => !own.some((o) => "seq" in o && o.seq === s)).map((s) => ({ seq: s }));
  const lines: FxRef[] = own.some((o) => "line" in o) ? own.filter((o) => "line" in o) : j.line ? [{ line: j.line }] : [];
  return { ...d, fx: { ...d.fx, refs: [...own.filter((o) => !("line" in o)), ...seqs, ...lines] } } as SpellDef;
};

export const SPELLS = new Catalog([...CORE, ...CORE_MORE, ...HOUSE].map(withJb2a), { icons: ICON_MANIFEST, casters: CASTERS });
