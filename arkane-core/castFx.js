/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  onCast
} from "./chunks/chunk-NYGZWKVM.js";
import {
  MOD
} from "./chunks/chunk-VELQ4LWX.js";
import {
  SPELLS,
  casterKeyOf
} from "./chunks/chunk-FIVJTHGI.js";
import "./chunks/chunk-H7JZCNPB.js";

// src/spells/fxPlan.ts
var DEFAULT_STYLE = { self: "on-caster", target: "projectile", area: "at-point", ray: "projectile", point: "at-point" };
var LAST_RESORT = { line: "#e8d9a8" };
var refName = (r) => "seq" in r ? `seq:${r.seq}` : "file" in r ? `file:${r.file}` : `line:${r.line}`;
function stagesOf(s) {
  const fx = s.fx ?? {};
  if (fx.stages?.length) return fx.stages.map((st) => ({ ...st, refs: st.refs?.length ? st.refs : fx.refs }));
  return [{ style: fx.style ?? DEFAULT_STYLE[s.delivery], refs: fx.refs, scale: fx.scale }];
}
async function planFx(s, probe2, auto) {
  const out = [];
  for (const st of stagesOf(s)) {
    const tried = [];
    let pick;
    const own = st.refs ?? [], refs = [...own.filter((r) => !("line" in r)), ...auto?.(st.style) ?? [], ...own.filter((r) => "line" in r)];
    for (const r of refs) {
      let ok = false;
      try {
        ok = await probe2(r);
      } catch {
      }
      tried.push(`${refName(r)} ${ok ? "\u2713" : "\u2717"}`);
      if (ok) {
        pick = r;
        break;
      }
    }
    out.push({ style: st.style, when: st.when ?? "cast", ref: pick ?? LAST_RESORT, scale: st.scale ?? s.fx?.scale, tried });
  }
  return out;
}
var describePlan = (steps) => steps.map((s, i) => `${i + 1}. ${s.when} \xB7 ${s.style} \u2192 ${refName(s.ref)}${s.tried.length ? `   (\u0E25\u0E2D\u0E07: ${s.tried.join(", ")})` : "   (\u0E44\u0E21\u0E48\u0E21\u0E35 refs \u0E43\u0E0A\u0E49\u0E40\u0E2A\u0E49\u0E19\u0E2A\u0E33\u0E23\u0E2D\u0E07)"}`);

// src/spells/fxAuto.ts
var feetOf = (p) => Number(/_(\d+)ft_/i.exec(p)?.[1] ?? 0);
var ranged = (files) => files.some((f) => feetOf(f) > 0);
function autoRefs(id, man, o) {
  const fams = Object.entries(man[id] ?? {});
  if (!fams.length) return [];
  const want = o.color?.toLowerCase();
  const score = ([fam, files]) => {
    const f = fam.toLowerCase();
    return (want && f.split("_").includes(want) ? 100 : 0) + (o.style === "projectile" === ranged(files) ? 20 : 0) + (f.includes("regular") ? 3 : 0) + (f.includes("01") ? 2 : 0);
  };
  return fams.sort((a, b) => score(b) - score(a)).slice(0, 3).map(([, files]) => {
    const by = [...files].sort((a, b) => feetOf(a) - feetOf(b));
    return { file: by.find((f) => feetOf(f) >= (o.ft ?? 0)) ?? by[by.length - 1] };
  });
}
var autoFor = (s, man, ft) => (style) => s.fx?.auto === false ? [] : autoRefs(s.id, man, { style, color: s.fx?.color, ft });

// src/data/spellFx.generated.ts
var FX_MANIFEST = {};

// src/foundry/castFx.ts
var KEY = `${MOD}.castFx`;
var START_DELAY_MS = 600;
var FALLBACK_MS = 900;
var MAX_WAIT_MS = 8e3;
var castFxEnabled = () => {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
};
var setCastFxEnabled = (on) => {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
  }
  return on;
};
var hasSeq = () => typeof Sequence === "function" && !!Sequencer?.Database;
var distFt = (a, b) => {
  const A = ptOf(a), B = ptOf(b);
  return Math.hypot(A.x - B.x, A.y - B.y) / (canvas.grid?.size || 100) * (canvas.grid?.distance || 5);
};
var ptOf = (t) => t?.center ? { x: t.center.x, y: t.center.y } : { x: t.x, y: t.y };
var fileOk = /* @__PURE__ */ new Map();
async function probe(ref) {
  if ("line" in ref) return true;
  if (!hasSeq()) return false;
  if ("seq" in ref) return !!Sequencer.Database.entryExists(ref.seq);
  if (!fileOk.has(ref.file)) fileOk.set(ref.file, await (foundry.utils?.srcExists ?? globalThis.srcExists)(ref.file).catch(() => false));
  return fileOk.get(ref.file);
}
function drawFallback(style, from, at, colour) {
  return new Promise((done) => {
    if (!canvas?.interface || !canvas.app) return done();
    const grid = canvas.grid?.size ?? 100, col = parseInt(String(colour).replace("#", ""), 16) || 15260072;
    const B = ptOf(at), A = from ? ptOf(from) : void 0;
    const g = new PIXI.Graphics();
    g.eventMode = "none";
    g.zIndex = 999;
    canvas.interface.addChild(g);
    const start = performance.now(), ticker = canvas.app.ticker;
    const tick = () => {
      const t = (performance.now() - start) / FALLBACK_MS;
      if (t >= 1 || g.destroyed) {
        ticker.remove(tick);
        if (!g.destroyed) g.destroy();
        return done();
      }
      g.clear();
      const ring = (p, u, r) => {
        g.lineStyle(3, col, 1 - u);
        g.beginFill(col, (1 - u) * 0.25);
        g.drawCircle(p.x, p.y, r * (0.3 + 0.7 * (1 - Math.pow(1 - u, 3))));
        g.endFill();
      };
      if (A) {
        const u = Math.min(1, t / 0.6), e = 1 - Math.pow(1 - u, 3), head = { x: A.x + (B.x - A.x) * e, y: A.y + (B.y - A.y) * e };
        g.lineStyle(3, col, t < 0.6 ? 1 : 1 - (t - 0.6) / 0.4);
        g.moveTo(A.x, A.y);
        g.lineTo(head.x, head.y);
        if (t >= 0.6) ring(B, (t - 0.6) / 0.4, grid * 0.6);
      } else ring(B, t, grid * (style === "at-point" ? 1.6 : 0.8));
    };
    ticker.add(tick);
  });
}
async function playOne(step, job) {
  const ref = step.ref;
  if ("line" in ref) return drawFallback(step.style, job.from, job.at, ref.line);
  const e = new Sequence().effect().file("seq" in ref ? ref.seq : ref.file);
  if (job.from) e.atLocation(job.from).stretchTo(job.at);
  else if (job.at?.document) e.atLocation(job.at).scaleToObject(step.scale ?? 1.5);
  else e.atLocation(job.at).scale(step.scale ?? 1);
  await e.play();
}
async function playStep(step, caster, targets) {
  const mid = targets.length ? { x: targets.reduce((s, t) => s + ptOf(t).x, 0) / targets.length, y: targets.reduce((s, t) => s + ptOf(t).y, 0) / targets.length } : ptOf(caster);
  const jobs = step.style === "projectile" ? targets.map((t) => ({ from: caster, at: t })) : step.style === "on-target" ? targets.map((t) => ({ at: t })) : step.style === "on-caster" ? [{ at: caster }] : [{ at: mid }];
  await Promise.allSettled(jobs.map((j) => playOne(step, j)));
}
var viaOf = (item) => [item?.system?.method, item?.getFlag?.(MOD, "via")].flat().filter((v) => typeof v === "string" && v);
async function playCast(token, item, targets = []) {
  if (!token || !item || !canvas?.ready || token.visible === false) return null;
  const caster = casterKeyOf(token.actor?.name ?? token.name);
  const r = SPELLS.resolve(item.name, { caster, via: viaOf(item) });
  if (!r) return null;
  const steps = await planFx(r.spell, probe, autoFor(r.spell, FX_MANIFEST, targets[0] ? distFt(token, targets[0]) : void 0));
  await new Promise((ok) => setTimeout(ok, START_DELAY_MS));
  const pending = [];
  for (const st of steps) {
    if (st.when === "hit") await Promise.race([Promise.allSettled(pending), new Promise((ok) => setTimeout(ok, MAX_WAIT_MS))]);
    pending.push(playStep(st, token, targets).catch((e) => console.warn(MOD, "castFx step", st.style, e)));
  }
  return steps;
}
function onCastFx(c) {
  if (!castFxEnabled()) return;
  playCast(c.token, c.item, c.targets).catch((e) => console.warn(MOD, "castFx", e));
}
var registerCastFx = () => onCast(onCastFx);
var selected = () => canvas?.tokens?.controlled?.[0];
async function playByHand(name, caster, targets) {
  const tok = caster ?? selected();
  if (!tok) {
    ui.notifications?.warn("\u0E40\u0E25\u0E37\u0E2D\u0E01 token \u0E1C\u0E39\u0E49\u0E23\u0E48\u0E32\u0E22\u0E01\u0E48\u0E2D\u0E19");
    return null;
  }
  return playCast(tok, { name }, targets ?? [...game.user?.targets ?? []]);
}
async function planByHand(name, casterKey, via) {
  const r = SPELLS.resolve(name, { caster: casterKey, via });
  if (!r) {
    console.log(`\u0E44\u0E21\u0E48\u0E1E\u0E1A\u0E2A\u0E01\u0E34\u0E25 "${name}"`);
    return null;
  }
  const steps = await planFx(r.spell, probe, autoFor(r.spell, FX_MANIFEST));
  console.log([`${r.spell.name} (${hasSeq() ? "Sequencer \u0E1E\u0E23\u0E49\u0E2D\u0E21" : "\u0E44\u0E21\u0E48\u0E21\u0E35 Sequencer: \u0E43\u0E0A\u0E49\u0E40\u0E2A\u0E49\u0E19\u0E2A\u0E33\u0E23\u0E2D\u0E07"})`, ...describePlan(steps)].join("\n"));
  return steps;
}
function dbPaths(prefix = "jb2a") {
  try {
    return hasSeq() ? Sequencer.Database.getPathsUnder(prefix) ?? [] : [];
  } catch {
    return [];
  }
}
async function auditFx() {
  const rows = [];
  for (const d of SPELLS.list()) {
    const r = SPELLS.resolve(d.id);
    if (!r) continue;
    const st = (await planFx(r.spell, probe, autoFor(r.spell, FX_MANIFEST)))[0];
    rows.push({ id: d.id, style: st.style, \u0E40\u0E25\u0E48\u0E19: refName(st.ref), \u0E1C\u0E25: "line" in st.ref ? "\u2717 \u0E40\u0E2A\u0E49\u0E19\u0E2A\u0E33\u0E23\u0E2D\u0E07" : "\u2713" });
  }
  console.table(rows);
}

// src/features/castFx.ts
function register(core) {
  registerCastFx();
  core.castFx = { enable: setCastFxEnabled, enabled: castFxEnabled, plan: planByHand, play: playByHand, db: dbPaths, audit: auditFx };
}
export {
  register
};
