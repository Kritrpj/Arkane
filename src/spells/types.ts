// Spell catalog: plain data that says HOW each spell works and looks. No Foundry in here, so the harness can use it too.
// Layers, bottom to top (each one only writes what it changes):
//   1. a core spell                         category "core"   (the central rules: SRD / 2024)
//   2. spells built on another (`extends`)  category "house" (house-rule version) or "custom" (made for the table)
//   3. caster defaults  (CASTERS[x].defaults)   how this character casts everything
//   4. byCaster[x]                              how THIS spell looks/works for this character
//   5. variants[v]                              what/how it is cast right now (wand, palm, pact slot, a broken lens...)
// See SPELLS.md for the recipe and examples.

export type Category = "core" | "house" | "custom";
export type Delivery = "self" | "target" | "area" | "ray" | "point";        // where the result lands (point = a spot on the map: Misty Step, Fog Cloud)
export type FxStyle = "projectile" | "on-target" | "on-caster" | "at-point"; // how the effect is drawn
export type Activation = "action" | "bonus" | "reaction" | "minute" | "hour" | "free";
export type Medium = "hands" | "wand" | "focus" | "voice" | "item" | "none"; // what the caster uses
export type Ability = "str" | "dex" | "con" | "int" | "wis" | "cha";
export type School = "abj" | "con" | "div" | "enc" | "evo" | "ill" | "nec" | "trs"; // dnd5e codes

// what a cast spends
export type SpellCost =
  | { kind: "slot"; pool: "spell" | "pact"; level?: number }              // level = minimum slot (default: the spell's level)
  | { kind: "free"; uses: number; per: "short" | "long" | "day" }         // innate / feat: free uses
  | { kind: "resource"; id: string; amount: number };                     // a campaign resource (hunger gauge, sanity ...)

// one way to draw the effect. The resolver tries them in order and uses the first one that exists
export type FxRef =
  | { seq: string }      // a Sequencer database path (JB2A, BLFX ...), e.g. "jb2a.fire_bolt.orange"
  | { file: string }     // an effect file we ship ourselves
  | { line: string };    // plain glowing line in this colour: the fallback that always works

// one beat of the effect. A spell with no `stages` has exactly one (fx.style + fx.refs).
// `when`: "cast" (default) plays at the moment of casting; "hit" plays after the earlier stages finish (v1: it does NOT look at the attack roll yet)
export interface FxStage { style: FxStyle; when?: "cast" | "hit"; refs?: FxRef[]; scale?: number }   // refs missing = the spell's fx.refs

// fx.color = the colour to look for in the scanned JB2A files (a caster can change it in byCaster); fx.auto = false: never add scanned files for this spell

export interface Damage { dice: string; type: string }                    // dice may include a bonus: "1d4+1"

export interface SpellEffect {
  roll?: { kind: "attack" | "save" | "auto"; range?: "ranged" | "melee"; ability?: Ability; onSave?: "none" | "half" };
  damage?: Damage[];
  heal?: { dice: string; addMod?: boolean };
  count?: number;                                  // beams / darts / targets of one cast
  countByLevel?: Record<number, number>;           // by character level: { 1: 1, 5: 2, 11: 3, 17: 4 }
  area?: { shape: "sphere" | "cone" | "line" | "cube" | "cylinder"; ft: number; widthFt?: number };
  conditions?: string[];                           // dnd5e status ids it can apply
  scaling?: { cantrip?: boolean; perSlot?: { damage?: string; heal?: string; count?: number; radiusFt?: number } };
  text?: string[];                                 // extra rules in words, shown to the DM
}

export interface Casting {
  medium?: Medium;                                 // what the caster uses to cast
  style?: "instant" | "beam";                      // the look of casting itself (Skillbook: cast_style)
  gesture?: string;
  incantation?: string;
}

export interface Components { v?: boolean; s?: boolean; m?: string; mConsumed?: boolean; mCostGp?: number }

export interface SpellFields {
  name?: string; nameTh?: string; summaryTh?: string;
  level?: number;                                  // 0 = cantrip
  school?: School; tags?: string[];
  activation?: Activation;
  range?: number | "self" | "touch";               // feet
  duration?: { unit: "instant" | "turn" | "round" | "minute" | "hour" | "day" | "rest"; n?: number };
  concentration?: boolean;
  cost?: SpellCost[];                                   // empty / missing = free (cantrips)
  components?: Components;
  casting?: Casting;
  requires?: { seeTarget?: boolean; freeHand?: boolean; notConditions?: string[]; text?: string[] };
  delivery?: Delivery;
  targets?: { max?: number; allow?: "any" | "enemy" | "ally" | "self" };
  effect?: SpellEffect;
  fx?: { style?: FxStyle; refs?: FxRef[]; scale?: number; stages?: FxStage[]; color?: string; auto?: boolean };   // stages: several beats, e.g. [{style:"projectile"}, {style:"on-target", when:"hit"}]
  icons?: { default?: string; byCaster?: Record<string, string> };
  flags?: Record<string, unknown>;                 // free bag for campaign-specific things; the backend can read them later
  verify?: string;                                 // "check this against the book" reminder
}

// ---- patches: what a layer may write. `null` removes a field; an object merges key by key;
// an array replaces, unless written as { $append: [...] } / { $prepend: [...] }; { $set: value } replaces an object whole.
type ArrayOp<U> = { $append?: U[]; $prepend?: U[] };
export type Patch<T> = {
  [K in keyof T]?: NonNullable<T[K]> extends readonly (infer U)[] ? U[] | ArrayOp<U> | null
    : NonNullable<T[K]> extends Record<string, any> ? Patch<NonNullable<T[K]>> | { $set: NonNullable<T[K]> } | null
    : T[K] | null;
};
export type SpellPatch = Patch<SpellFields>;

export interface SpellMeta {
  id: string;                                      // slug of the name: "fire-bolt"
  category: Category;
  extends?: string;                                // id of the spell this one is built on (then the fields below are only the changes)
  aliases?: string[];                              // other item names that mean this spell
  byCaster?: Record<string, SpellPatch>;           // key = a key of CASTERS ("vivian")
  variants?: Record<string, SpellPatch>;           // key = a "via" state ("wand", "palm", "pact", "innate" ...)
}
export type SpellDef = SpellPatch & SpellMeta;

// the answer of resolve(): every layer already applied
export type Spell = SpellFields & Required<Pick<SpellFields, "name" | "level" | "activation" | "range" | "delivery">> & { id: string; category: Category };
export interface SpellResolved { spell: Spell; chain: string[]; trace: string[] }
export interface ResolveCtx { caster?: string; via?: string | string[] }

export interface CasterInfo { match: string; defaults?: SpellPatch }       // match = regex source tested against the actor name
export type IconManifest = Record<string, { default?: string; byCaster?: Record<string, string> }>;

export interface Issue { id: string; level: "error" | "warn" | "info"; text: string }
