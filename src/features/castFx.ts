// Feature "castFx": the spell's effect (JB2A / Sequencer / our own file / plain line) plays when a token casts, from the spell catalog's fx. See SPELLS.md.
//   game.arkane.core.castFx.enable(false)             turn off on THIS computer (remembered)
//   game.arkane.core.castFx.plan("Fire Bolt","vivian")  which ref would be used, and why (✓/✗ per ref)
//   game.arkane.core.castFx.play("Fire Bolt")         try it: select the caster token, target someone
//   game.arkane.core.castFx.audit()                   every catalog spell: has a JB2A/scanned effect (✓) or only the line (✗)
//   game.arkane.core.castFx.db("jb2a.fire_bolt")      names that exist in Sequencer's database (copy them into fx.refs)
import { auditFx, castFxEnabled, dbPaths, planByHand, playByHand, registerCastFx, setCastFxEnabled } from "../foundry/castFx";

export function register(core: any): void {
  registerCastFx();
  core.castFx = { enable: setCastFxEnabled, enabled: castFxEnabled, plan: planByHand, play: playByHand, db: dbPaths, audit: auditFx };
}
