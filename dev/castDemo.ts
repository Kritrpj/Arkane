// Harness demo of the cast icon (+ a simple bolt): pick a spell, press "ร่ายสกิล".
// Uses the same iconFrame() timing as the real Foundry feature (src/foundry/castIcon.ts). Cosmetic only.
import { S, thingById } from "./state";
import { draw, CELL } from "./draw";
import { iconFrame } from "../src/foundry/castIcon";
import { SPELLS as CATALOG } from "../src/data/spells";
import { casterKeyOf } from "../src/data/casters";
import { planFx, describePlan, type FxStep } from "../src/spells/fxPlan";
import { autoFor } from "../src/spells/fxAuto";
import { FX_MANIFEST } from "../src/data/spellFx.generated";
import { drawPreview, STEP_MS } from "../src/spells/fxPreview";
import type { FxRef } from "../src/spells/types";

// Real spell icons: any  <something>/spells/<character>/<character>-<spell>.webp  in the project is picked up by itself
// (no path to configure). Found nothing = the emoji below is used.
const found = import.meta.glob(["../**/spells/*/*.webp", "!../node_modules/**", "!../dev-dist/**"], { eager: true, query: "?url", import: "default" }) as Record<string, string>;
const FILES = Object.entries(found).map(([path, url]) => {
  const file = path.split("/").pop()!.replace(/\.webp$/i, ""), who = path.split("/").slice(-2)[0].toLowerCase();
  return { url, who, slug: file.startsWith(who + "-") ? file.slice(who.length + 1) : file };
});
const slugOf = (name: string) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
// the caster's own icon first (Vivian's Fire Bolt for Vivian), otherwise anyone's icon for that spell
const pickIcon = (spell: string, caster: string) => { const sl = slugOf(spell), c = caster.toLowerCase(); return (FILES.find((f) => f.slug === sl && f.who === c) ?? FILES.find((f) => f.slug === sl))?.url; };

// Real effect files (JB2A etc.) you own: anything in dev/fx/, or any folder with "jb2a" in its name or called "fx" anywhere in the project
// (git ignores dev/fx, see dev/fx/README.md). Matched by spell name in the file name OR any folder name:
// "FireBolt_01_Regular_Orange_30ft.webp" or "Fire_Bolt/xxx.webm" serve "Fire Bolt". Spell ICONS (…/spells/…) are never used as effects.
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const fxFound = import.meta.glob(
  ["./fx/**/*.{webm,webp,png}", "../**/*jb2a*/**/*.{webm,webp}", "../**/fx/**/*.{webm,webp}", "!../node_modules/**", "!../dev-dist/**", "!../**/spells/**"],
  { eager: true, query: "?url", import: "default" }) as Record<string, string>;
type FxFile = { url: string; file: string; key: string; video: boolean };
const FX: FxFile[] = Object.entries(fxFound).map(([path, url]) => {
  const rel = path.replace(/^\.\.?\//, "");
  return { url, file: rel, key: norm(rel.replace(/\.[a-z0-9]+$/i, "")), video: /\.webm$/i.test(path) };
}).filter((f) => !f.key.endsWith("thumb")).sort((a, b) => a.file.localeCompare(b.file)).filter((f, i, all) => all.findIndex((g) => g.url === f.url) === i);   // *_Thumb.webp are only JB2A preview pictures
// many files can match one spell (JB2A: colours, and 05ft/15ft/30ft/60ft/90ft = the range the file is made for, like Sequencer's range pick):
// first the best "family" (01, Regular, ...), then inside it the smallest range that still reaches the target (else the longest one)
const family = (f: FxFile) => f.key.replace(/\d+ft\d+x\d+/, "");
const feetOf = (f: FxFile) => Number(/(\d+)ft/.exec(f.key)?.[1] ?? 0);
const famScore = (f: FxFile) => (f.key.includes("regular") ? 10 : 0) + (f.key.includes("01") ? 5 : 0) + (f.video ? 1 : 0);
const pickFrom = (all: FxFile[], ft = 5): FxFile | undefined => {
  if (!all.length) return undefined;
  const best = family([...all].sort((a, b) => famScore(b) - famScore(a))[0]);
  const same = all.filter((f) => family(f) === best).sort((a, b) => feetOf(a) - feetOf(b));
  return same.find((f) => feetOf(f) >= ft) ?? same[same.length - 1];
};
const pickFx = (slug: string, ft = 5): FxFile | undefined => pickFrom(FX.filter((f) => f.key.includes(norm(slug))), ft);
// a catalog ref -> the local file standing in for it. The harness has no Sequencer, so a JB2A name is matched against file/folder names:
// "jb2a.fire_bolt.orange" = a file whose path has "firebolt" and "orange". No such file = the ref counts as missing, like in Foundry without JB2A.
const localFor = (ref: FxRef, ft = 5): FxFile | undefined => {
  if ("line" in ref) return undefined;
  if ("file" in ref) { const base = norm(ref.file.split("/").pop()!.replace(/\.[a-z0-9]+$/i, "")); return pickFrom(FX.filter((f) => f.key.endsWith(base)), ft); }
  const needs = ref.seq.split(".").filter((p) => p.toLowerCase() !== "jb2a" && !/^\d+$/.test(p)).map(norm).filter(Boolean);
  return needs.length ? pickFrom(FX.filter((f) => needs.every((n) => f.key.includes(n))), ft) : undefined;
};
// a loaded effect: at(ms) = what to draw ms after the cast started (null = nothing yet), durMs = how long it lasts
type Fx = { w: number; h: number; durMs: number; at: (ms: number) => CanvasImageSource | null; stop: () => void; kind: string; video?: HTMLVideoElement };
// one line next to the button says what was found / why not (also in the browser console, and on the board for a few seconds)
let notice = "";
const info = (msg: string) => { notice = msg; const el = document.getElementById("castInfo"); if (el) el.textContent = msg; console.info("[castDemo]", msg); };

const imgs = new Map<string, Promise<HTMLImageElement | null>>();
const loadImg = (url?: string) => url ? (imgs.get(url) ?? (imgs.set(url, new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = url; })), imgs.get(url)!)) : Promise.resolve(null);

// animated .webp: decoded frame by frame (WebCodecs ImageDecoder, Chrome/Edge) so it plays from its first frame every cast.
// A plain Image drawn on a canvas would only give one frame. Frames are shrunk to <=800px wide to keep memory small.
async function decodeAnim(url: string): Promise<Fx | null> {
  const ID = (globalThis as any).ImageDecoder;
  if (!ID) return null;
  const buf = await (await fetch(url)).arrayBuffer();
  const dec = new ID({ data: buf, type: "image/webp" });
  await dec.tracks.ready;
  const n: number = dec.tracks.selectedTrack.frameCount;
  if (!(n > 1)) { dec.close(); return null; }                        // a still picture: the normal image path handles it
  const frames: { bmp: ImageBitmap; end: number }[] = [];
  let t = 0, w = 0, h = 0;
  for (let i = 0; i < n; i++) {
    const { image } = await dec.decode({ frameIndex: i });
    w = image.displayWidth; h = image.displayHeight;
    const k = Math.min(1, 800 / w);
    const bmp = await createImageBitmap(image, { resizeWidth: Math.round(w * k), resizeHeight: Math.round(h * k) });
    t += (image.duration ?? 40000) / 1000; frames.push({ bmp, end: t });
    image.close();
  }
  dec.close();
  return { w, h, durMs: t, kind: `webp ${n} เฟรม`, at: (ms) => (frames.find((f) => ms < f.end) ?? frames[n - 1]).bmp, stop: () => frames.forEach((f) => f.bmp.close()) };
}

async function loadFx(f?: FxFile): Promise<{ fx?: Fx; err?: string }> {
  if (!f) return {};
  if (!f.video) {
    try { const a = await decodeAnim(f.url); if (a) return { fx: a }; } catch (e) { console.warn("[castDemo] ImageDecoder failed, using <img>", e); }
    const i = new Image();
    const ok = await new Promise<boolean>((res) => { i.onload = () => res(true); i.onerror = () => res(false); i.src = f.url; });
    if (!ok) return { err: "โหลดรูปไม่ได้" };
    // browsers without ImageDecoder: an <img> that is in the page keeps animating, so draw from it (starts at frame 0 as it is new)
    i.style.cssText = "position:fixed;left:-9999px;top:0;width:4px;height:4px;pointer-events:none"; document.body.appendChild(i);
    return { fx: { w: i.naturalWidth, h: i.naturalHeight, durMs: 2000, kind: "รูป", at: () => i, stop: () => i.remove() } };
  }
  // the video is put in the page (off-screen): a detached <video> may not decode transparency (alpha .webm) in every browser
  return new Promise((ok) => {
    const v = document.createElement("video"); v.muted = true; v.playsInline = true; v.preload = "auto";
    v.style.cssText = "position:fixed;left:-9999px;top:0;width:4px;height:4px;pointer-events:none";
    const done = (r: { fx?: Fx; err?: string }) => { clearTimeout(timer); if (!r.fx) v.remove(); ok(r); };
    const timer = setTimeout(() => done({ err: "โหลดเกิน 10 วิ (ไฟล์ใหญ่ไป หรือ codec ที่ browser ไม่รองรับ)" }), 10000);
    v.onloadeddata = () => done({ fx: { w: v.videoWidth, h: v.videoHeight, kind: "วิดีโอ", video: v, durMs: Number.isFinite(v.duration) ? v.duration * 1000 : DURATION, at: () => (v.ended ? null : v), stop: () => { v.pause(); v.remove(); } } });
    v.onerror = () => done({ err: `browser เปิดวิดีโอไม่ได้ (${v.error?.message || "codec/ไฟล์เสีย"})` });
    document.body.appendChild(v); v.src = f.url; v.load();
  });
}

const BOLTS = new Set(["fire-bolt", "eldritch-blast", "magic-missile", "shocking-grasp", "ray-of-frost"]);
const SPELLS: Record<string, { icon: string; color: string; bolt: boolean }> = {
  "Fire Bolt": { icon: "🔥", color: "#ff7a2a", bolt: true },
  "Eldritch Blast": { icon: "🌀", color: "#d02a4a", bolt: true },
  "Shield": { icon: "🛡️", color: "#5aa9ff", bolt: false },
};
const DURATION = 1800;
const START_MS = 600;     // the effect starts a moment after the icon, like castFx in Foundry (START_DELAY_MS)

export function initCastDemo(cv: HTMLCanvasElement): void {
  const sel = document.getElementById("spell") as HTMLSelectElement;
  const icons = FILES.map((f) => `<option value="file:${f.who}|${f.slug}">${f.who} · ${f.slug.replace(/-/g, " ")}</option>`).join("");
  // every file in dev/fx can also be tried directly (to check a file plays even when its name does not match a spell)
  const fxOpts = FX.map((f) => `<option value="fx:${FX.indexOf(f)}">${f.file}</option>`).join("");
  const cat = CATALOG.list().map((d) => `<option value="cat:${d.id}">${d.name ?? d.id}</option>`).join("");
  sel.innerHTML = Object.keys(SPELLS).map((n) => `<option>${n}</option>`).join("") + `<optgroup label="สกิลใน catalog (JB2A อัตโนมัติ)">${cat}</optgroup>` + icons + (fxOpts ? `<optgroup label="ไฟล์ FX (ลองตรง ๆ)">${fxOpts}</optgroup>` : "");
  info(`ไอคอนในโปรเจกต์ ${FILES.length} ไฟล์ · ไฟล์ FX ${FX.length} ไฟล์${FX.length ? "" : " (ไม่เจอ: วางไฟล์ .webp/.webm ใน dev/fx แล้วรีโหลดหน้า)"}`);

  (document.getElementById("cast") as HTMLButtonElement).onclick = async () => {
    const a = thingById(S.actor), t = thingById(S.target);
    if (!a) return;
    const caster = (S.stage.creatures.find((c) => c.id === a.id)?.name) ?? "";
    const v = sel.value;
    let sp = SPELLS[v], url: string | undefined, slug = "", direct: FxFile | undefined;
    if (v.startsWith("fx:")) {                                       // a file picked straight from dev/fx
      direct = FX[Number(v.slice(3))]; sp = { icon: "✨", color: "#8fd1ff", bolt: false };
    } else if (v.startsWith("file:")) {                              // an icon file found in the project
      const [who, sl] = v.slice(5).split("|"); slug = sl;
      url = FILES.find((f) => f.who === who && f.slug === sl)?.url;
      sp = { icon: "✨", color: BOLTS.has(sl) ? "#ff7a2a" : "#8fd1ff", bolt: BOLTS.has(sl) };
    } else if (v.startsWith("cat:")) {                               // a spell of the catalog
      slug = v.slice(4); url = pickIcon(slug, caster); sp = { icon: "✨", color: "#8fd1ff", bolt: false };
    } else if (sp) { slug = slugOf(v); url = pickIcon(v, caster); }
    if (!sp) return;
    const cc = (th: NonNullable<typeof a>) => ({ x: th.pos.col + th.footprint / 2, y: th.pos.row + th.footprint / 2 });
    const ft = t && t.id !== a.id ? Math.hypot(cc(t).x - cc(a).x, cc(t).y - cc(a).y) * 5 : 5;   // 1 square = 5 ft

    // the plan: the spell's catalog entry run through the same planFx as Foundry (a ref counts as present when a local file matches it).
    // Not in the catalog (or a file picked by hand) = the old behaviour: one effect found by the spell name in the file path.
    let steps: FxStep[], preset: FxFile | undefined, fromCatalog = false;
    const r = !direct && slug ? CATALOG.resolve(slug, { caster: casterKeyOf(caster) ?? caster.toLowerCase() }) : null;
    if (r) { steps = await planFx(r.spell, (ref) => "line" in ref || !!localFor(ref, ft), autoFor(r.spell, FX_MANIFEST, ft)); fromCatalog = true; }
    else {
      preset = direct ?? (slug ? pickFx(slug, ft) : undefined);
      steps = [{ style: sp.bolt ? "projectile" : "on-caster", when: "cast", ref: preset ? { file: preset.file } : { line: sp.color }, tried: [] }];
    }

    const img = await loadImg(url);
    type Beat = { step: FxStep; fx?: Fx; start: number; dur: number; played?: boolean };
    const beats: Beat[] = [], notes: string[] = []; let end = START_MS;
    for (const [i, step] of steps.entries()) {
      const file = i === 0 && preset ? preset : localFor(step.ref, ft);
      if (file) info(`กำลังโหลด FX ${file.file} ...`);
      const { fx, err } = await loadFx(file);
      // a hand-picked file: a wide one (JB2A bolts are 1600x400) flies caster -> target, a squarer one plays on the caster
      const st = direct && fx ? { ...step, style: fx.w / fx.h >= 2.5 ? "projectile" as const : "on-caster" as const } : step;
      const start = st.when === "hit" ? end : START_MS, dur = fx?.durMs ?? STEP_MS;
      end = Math.max(end, start + dur);
      beats.push({ step: st, fx, start, dur });
      notes.push(fx ? `FX ✓ ${file!.file} (${fx.kind} ${fx.w}×${fx.h}, ${(fx.durMs / 1000).toFixed(1)}s)` : file ? `FX ✗ ${file.file}: ${err}` : "ref: เส้น/วงสำรอง");
    }
    info([
      url ? "ไอคอน ✓" : "ไอคอน: ไม่เจอไฟล์ (ใช้ emoji)",
      fromCatalog ? `catalog: ${r!.spell.name}` : "ไม่อยู่ใน catalog (หาไฟล์จากชื่อ)",
      ...describePlan(steps).map((l, i) => `${l} · ${notes[i]}`),
      ...(FX.length ? [] : [`ไฟล์ FX ทั้งหมด 0 (วางไฟล์ใน dev/fx แล้วรีโหลด)`]),
    ].join("  |  "));

    const total = Math.max(DURATION, end), start0 = performance.now();
    const center = (th: NonNullable<typeof a>) => ({ x: (th.pos.col + th.footprint / 2) * CELL, y: (th.pos.row + th.footprint / 2) * CELL, r: (th.footprint * CELL) / 2 });
    const tick = () => {
      const ms = performance.now() - start0;
      draw(cv);                                                          // board first, then the effects on top
      if (ms >= total) { beats.forEach((b) => b.fx?.stop()); return; }
      const g = cv.getContext("2d")!, c = center(a), tc = t && t.id !== a.id ? center(t) : undefined;
      if (ms < 5000 && notice) { g.save(); g.font = "12px sans-serif"; g.fillStyle = "rgba(0,0,0,.6)"; g.fillRect(0, 0, cv.width, 18); g.fillStyle = "#cfe"; g.textBaseline = "top"; g.fillText(notice, 6, 3); g.restore(); }
      for (const b of beats) {
        const lt = ms - b.start; if (lt < 0 || lt > b.dur) continue;
        const st = b.step;
        if (b.fx) {                                                      // the real file
          if (b.fx.video && !b.played) { b.played = true; b.fx.video.currentTime = 0; b.fx.video.play().catch((e) => info(`FX: เล่นวิดีโอไม่ได้ (${e?.name ?? e})`)); }
          const src = b.fx.at(lt); if (!src) continue;
          g.save();
          if (st.style === "projectile" && tc) {                         // stretched caster -> target
            const len = Math.hypot(tc.x - c.x, tc.y - c.y), h = Math.min(len * (b.fx.h / b.fx.w), CELL * 2.5);
            g.translate(c.x, c.y); g.rotate(Math.atan2(tc.y - c.y, tc.x - c.x)); g.drawImage(src, 0, -h / 2, len, h);
          } else {                                                       // on the caster, or on the target / point (the target when there is one)
            const at = st.style === "on-caster" || !tc ? c : tc, w = CELL * 2 * (st.scale ?? 1), h = w * (b.fx.h / b.fx.w);
            g.drawImage(src, at.x - w / 2, at.y - h / 2, w, h);
          }
          g.restore();
        } else drawPreview(g, [st], { caster: { x: c.x, y: c.y }, targets: tc ? [{ x: tc.x, y: tc.y }] : [] }, lt, CELL);   // line ref: the plain glow
      }
      if (ms < DURATION) {                                               // the cast icon, same timing as Foundry
        const f = iconFrame(ms / DURATION), c2 = center(a), size = Math.max(CELL * 0.7, c2.r * 0.9), x = c2.x, y = c2.y - c2.r - size * 0.1 - f.rise * CELL * 0.7;
        g.save(); g.globalAlpha = f.alpha; g.translate(x, y); g.scale(f.scale, f.scale);
        g.fillStyle = "rgba(17,17,17,.85)"; g.strokeStyle = "#e8d9a8"; g.lineWidth = 2;
        g.beginPath(); g.arc(0, 0, size / 2 + 3, 0, 7); g.fill(); g.stroke();
        if (img) { g.save(); g.beginPath(); g.arc(0, 0, size / 2, 0, 7); g.clip(); g.drawImage(img, -size / 2, -size / 2, size, size); g.restore(); }
        else { g.font = `${size * 0.6}px sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#fff"; g.fillText(sp.icon, 0, 2); }
        g.restore();
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
}
