// The catalog: every spell definition + icon manifest + known casters, with lookups by id or item name.
import type { CasterInfo, Category, IconManifest, ResolveCtx, SpellResolved, SpellDef } from "./types";
import { resolveFrom } from "./resolve";
import { slugOf } from "./slug";

export interface CatalogOpts { icons?: IconManifest; casters?: Record<string, CasterInfo> }

export class Catalog {
  readonly byId = new Map<string, SpellDef>();
  private byKey = new Map<string, string>();     // slug of a name or alias -> id
  readonly dupes: string[] = [];                 // ids / names defined twice (reported by validateCatalog)
  readonly icons: IconManifest; readonly casters: Record<string, CasterInfo>;

  constructor(defs: SpellDef[], opts: CatalogOpts = {}) {
    this.icons = opts.icons ?? {}; this.casters = opts.casters ?? {};
    for (const d of defs) {
      if (this.byId.has(d.id)) { this.dupes.push(d.id); continue; }
      this.byId.set(d.id, d);
    }
    for (const d of this.byId.values()) for (const n of [d.name, ...(d.aliases ?? [])]) {
      if (!n) continue;
      const k = slugOf(n), prev = this.byKey.get(k);
      if (prev && prev !== d.id) this.dupes.push(`${n} (${prev} / ${d.id})`); else this.byKey.set(k, d.id);
    }
  }

  // by id ("fire-bolt") or by item name ("Fire Bolt")
  get(ref: string): SpellDef | undefined { return this.byId.get(ref) ?? this.byId.get(this.byKey.get(slugOf(ref)) ?? ""); }
  has(ref: string): boolean { return !!this.get(ref); }
  list(f: { category?: Category; level?: number; tag?: string } = {}): SpellDef[] {
    return [...this.byId.values()].filter((d) => (!f.category || d.category === f.category) && (f.level === undefined || d.level === f.level) && (!f.tag || (Array.isArray(d.tags) && d.tags.includes(f.tag))));
  }

  // null when unknown or broken (validateCatalog says why)
  resolve(ref: string, ctx: ResolveCtx = {}): SpellResolved | null {
    const d = this.get(ref); if (!d) return null;
    try { return resolveFrom(this.byId, d.id, ctx, ctx.caster ? this.casters[ctx.caster.toLowerCase()]?.defaults : undefined); } catch { return null; }
  }

  // the icon for this caster: his/her own file, else the spell's default, else null (caller keeps the item's own picture)
  icon(ref: string, caster?: string, via?: string | string[]): string | undefined {
    const c = caster?.toLowerCase(), r = this.resolve(ref, { caster: c, via });
    const chain = r?.chain ?? [slugOf(ref)];       // not in the catalog yet: an icon file alone is enough
    const first = (pick: (id: string) => string | undefined) => chain.map(pick).find(Boolean);
    return (c ? r?.spell.icons?.byCaster?.[c] ?? first((id) => this.icons[id]?.byCaster?.[c]) : undefined)
      ?? r?.spell.icons?.default ?? first((id) => this.icons[id]?.default);
  }
}
