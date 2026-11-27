/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  awayFrom,
  cellsOf,
  gap,
  groundOf,
  n1,
  no,
  resolveMotion,
  yes
} from "./chunk-VSXCXXY3.js";
import {
  Fx
} from "./chunk-HNCV3QLI.js";

// src/actions/charge.ts
function willHit(a, t) {
  const step = awayFrom(a, t), theirs = cellsOf(t).map((c) => `${c.col},${c.row}`);
  for (let k = 1; k <= gap(a, t) + 1; k++) {
    const at = { col: a.pos.col + step.col * k, row: a.pos.row + step.row * k };
    if (cellsOf(a, at).some((c) => theirs.includes(`${c.col},${c.row}`))) return true;
  }
  return false;
}
var Charge = {
  id: "charge",
  label: "\u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19 (Charge)",
  canUse({ world, rules }, { actor, target }) {
    if (actor.id === target.id) return no("\u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19\u0E15\u0E31\u0E27\u0E40\u0E2D\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
    if (!rules.canAct(actor)) return no("\u0E15\u0E2D\u0E19\u0E19\u0E35\u0E49\u0E17\u0E33\u0E2D\u0E30\u0E44\u0E23\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
    if (actor.conditions.includes("prone") || actor.tags.includes("flying")) return no("\u0E25\u0E49\u0E21\u0E2D\u0E22\u0E39\u0E48\u0E2B\u0E23\u0E37\u0E2D\u0E1A\u0E34\u0E19\u0E2D\u0E22\u0E39\u0E48 \u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49");
    const run = gap(actor, target);
    if (run < 1) return no("\u0E15\u0E34\u0E14\u0E01\u0E31\u0E19\u0E2D\u0E22\u0E39\u0E48\u0E41\u0E25\u0E49\u0E27 \u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35\u0E23\u0E30\u0E22\u0E30\u0E27\u0E34\u0E48\u0E07\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22 1 \u0E0A\u0E48\u0E2D\u0E07");
    if (!willHit(actor, target)) return no("\u0E1E\u0E38\u0E48\u0E07\u0E15\u0E23\u0E07\u0E44\u0E1B\u0E41\u0E25\u0E49\u0E27\u0E44\u0E21\u0E48\u0E42\u0E14\u0E19\u0E40\u0E1B\u0E49\u0E32\u0E2B\u0E21\u0E32\u0E22 \u0E15\u0E49\u0E2D\u0E07\u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E41\u0E19\u0E27\u0E15\u0E23\u0E07 (\u0E41\u0E16\u0E27 \u0E04\u0E2D\u0E25\u0E31\u0E21\u0E19\u0E4C \u0E2B\u0E23\u0E37\u0E2D\u0E17\u0E41\u0E22\u0E07)");
    if (run * world.cellFt > actor.speed) return no(`\u0E44\u0E01\u0E25\u0E40\u0E01\u0E34\u0E19\u0E23\u0E30\u0E22\u0E30\u0E27\u0E34\u0E48\u0E07 (${run * world.cellFt} \u0E1F\u0E38\u0E15 > speed ${actor.speed} \u0E1F\u0E38\u0E15)`);
    return yes;
  },
  resolve(ctx, { actor, target }) {
    const { world, rules } = ctx, t = ctx.trace ?? (() => {
    });
    const ground = groundOf(world, actor, target);
    const runCells = gap(actor, target), runFt = runCells * world.cellFt;
    for (const line of rules.explainRun(actor, runFt, ground)) t("\u0E41\u0E23\u0E07\u0E1E\u0E38\u0E48\u0E07", line);
    const out = resolveMotion(ctx, {
      body: actor,
      step: awayFrom(actor, target),
      cells: runCells + 1,
      // one cell more than the gap, so the last step runs into the target
      energyAt: (x) => rules.runEnergy(actor, x, ground),
      describe: (r, note) => Fx.log(`${actor.name} \u0E1E\u0E38\u0E48\u0E07\u0E0A\u0E19 \u0E27\u0E34\u0E48\u0E07 ${n1(r.moved * world.cellFt)} \u0E1F\u0E38\u0E15${note}`)
    });
    return [Fx.spendCost(actor.id, rules.costOf("charge")), ...out.fx];
  }
};

export {
  Charge
};
