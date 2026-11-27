// Feature "spells": game.arkane.core.spells = the spell catalog (what each spell is, how it looks, per caster). See SPELLS.md.
//   spells.get("Fire Bolt")                       the raw definition (by id or item name)
//   spells.resolve("fire-bolt", { caster: "vivian", via: "wand" })   every layer applied + a trace of where each value came from
//   spells.explain("fire-bolt", "vivian")         same, printed
//   spells.icon("Fire Bolt", "vivian")            the icon path for this caster
//   spells.check()                                what is wrong / missing in the catalog, in words
import { CASTERS, casterKeyOf } from "../data/casters";
import { SPELLS } from "../data/spells";
import { validateCatalog } from "../spells/validate";

export function register(core: any): void {
  core.spells = {
    catalog: SPELLS,
    get: (ref: string) => SPELLS.get(ref),
    list: (f?: any) => SPELLS.list(f),
    resolve: (ref: string, ctx?: any) => SPELLS.resolve(ref, ctx),
    icon: (ref: string, caster?: string, via?: string | string[]) => SPELLS.icon(ref, caster, via),
    casterOf: casterKeyOf,
    explain: (ref: string, caster?: string, via?: string | string[]) => {
      const r = SPELLS.resolve(ref, { caster, via });
      console.log(r ? r.trace.join("\n") : `ไม่พบสกิล "${ref}" (หรือรวมชั้นไม่ได้ ลอง spells.check())`);
      return r;
    },
    check: () => {
      const issues = validateCatalog(SPELLS, Object.keys(CASTERS));
      const n = (l: string) => issues.filter((i) => i.level === l).length;
      console.log(`spells.check: error ${n("error")} · warn ${n("warn")} · info ${n("info")}`);
      if (issues.length) console.table(issues);
      return issues;
    },
  };
}
