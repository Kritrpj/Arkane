// More CORE spells: the ones the table's characters carry (scripts/spells.js) that core.ts does not describe yet.
// Short on purpose: just what the effect layer needs (where it lands = delivery, how it is drawn = fx.style, area size).
// Fill in damage / save / text later, like the spells in core.ts; the JB2A files are found by name (npm run fx), no refs needed here.
import { spell } from "../../spells/define";
import type { Activation, Delivery, FxStyle, School, SpellDef, SpellFields } from "../../spells/types";

type Area = NonNullable<NonNullable<SpellFields["effect"]>["area"]>;   // SpellFields (plain values), not SpellDef (a patch: its fields may also be { $set } / null)
const q = (id: string, name: string, level: number, school: School, activation: Activation, range: number | "self" | "touch", delivery: Delivery, style: FxStyle, area?: Area): SpellDef =>
  spell({ id, category: "core", name, level, school, activation, range, delivery, fx: { style }, ...(area ? { effect: { area } } : {}), verify: "stub: ยังไม่ได้ใส่กฎ (ดาเมจ/เซฟ/ข้อความ) ตรวจกับหนังสือก่อนใช้" });

export const CORE_MORE: SpellDef[] = [
  // cantrips
  q("message", "Message", 0, "trs", "action", 120, "target", "projectile"),
  q("minor-illusion", "Minor Illusion", 0, "ill", "action", 30, "point", "at-point"),
  q("guidance", "Guidance", 0, "div", "action", "touch", "target", "on-target"),
  q("druidcraft", "Druidcraft", 0, "trs", "action", 30, "point", "at-point"),
  q("dancing-lights", "Dancing Lights", 0, "evo", "action", 120, "point", "at-point"),
  q("mending", "Mending", 0, "trs", "minute", "touch", "target", "on-target"),
  q("mind-sliver", "Mind Sliver", 0, "enc", "action", 60, "target", "on-target"),
  q("prestidigitation", "Prestidigitation", 0, "trs", "action", 10, "point", "at-point"),
  // level 1
  q("disguise-self", "Disguise Self", 1, "ill", "action", "self", "self", "on-caster"),
  q("hunters-mark", "Hunter's Mark", 1, "div", "bonus", 90, "target", "on-target"),
  q("ensnaring-strike", "Ensnaring Strike", 1, "con", "bonus", "self", "self", "on-caster"),
  q("grease", "Grease", 1, "con", "action", 60, "area", "at-point", { shape: "cube", ft: 10 }),
  q("faerie-fire", "Faerie Fire", 1, "evo", "action", 60, "area", "at-point", { shape: "cube", ft: 20 }),
  q("detect-magic", "Detect Magic", 1, "div", "action", "self", "area", "on-caster", { shape: "sphere", ft: 30 }),
  q("arms-of-hadar", "Arms of Hadar", 1, "con", "action", "self", "area", "on-caster", { shape: "sphere", ft: 10 }),
  q("dissonant-whispers", "Dissonant Whispers", 1, "enc", "action", 60, "target", "on-target"),
  q("speak-with-animals", "Speak with Animals", 1, "div", "action", "self", "self", "on-caster"),
  q("fog-cloud", "Fog Cloud", 1, "con", "action", 120, "area", "at-point", { shape: "sphere", ft: 20 }),
  q("alarm", "Alarm", 1, "abj", "minute", 30, "point", "at-point"),
  // level 2
  q("calm-emotions", "Calm Emotions", 2, "enc", "action", 60, "area", "at-point", { shape: "sphere", ft: 20 }),
  q("detect-thoughts", "Detect Thoughts", 2, "div", "action", "self", "self", "on-caster"),
  q("mirror-image", "Mirror Image", 2, "ill", "action", "self", "self", "on-caster"),
  q("misty-step", "Misty Step", 2, "con", "bonus", "self", "point", "at-point"),
  q("hold-person", "Hold Person", 2, "enc", "action", 60, "target", "on-target"),
  q("rope-trick", "Rope Trick", 2, "trs", "action", "touch", "target", "on-target"),
  q("darkness", "Darkness", 2, "evo", "action", 60, "area", "at-point", { shape: "sphere", ft: 15 }),
  q("pass-without-trace", "Pass without Trace", 2, "abj", "action", "self", "area", "on-caster", { shape: "sphere", ft: 30 }),
  q("spike-growth", "Spike Growth", 2, "trs", "action", 150, "area", "at-point", { shape: "sphere", ft: 20 }),
  // level 3
  q("hunger-of-hadar", "Hunger of Hadar", 3, "con", "action", 150, "area", "at-point", { shape: "sphere", ft: 20 }),
  q("sending", "Sending", 3, "evo", "action", 5280, "target", "on-target"),
  q("fireball", "Fireball", 3, "evo", "action", 150, "area", "at-point", { shape: "sphere", ft: 20 }),
  q("counterspell", "Counterspell", 3, "abj", "reaction", 60, "target", "on-target"),
];
