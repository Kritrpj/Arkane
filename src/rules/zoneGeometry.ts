// เรขาคณิตของ Zone (ฟุต). pure ไม่แตะ Foundry
import type { Point, Shape } from "../model/zone";

export interface Box { x0: number; y0: number; x1: number; y1: number }

const rectPoly = (s: { x: number; y: number; w: number; h: number }): Point[] =>
  [{ x: s.x, y: s.y }, { x: s.x + s.w, y: s.y }, { x: s.x + s.w, y: s.y + s.h }, { x: s.x, y: s.y + s.h }];
const polyOf = (s: Shape): Point[] | null => s.type === "rect" ? rectPoly(s) : s.type === "polygon" ? s.points : null;

export function pointInPolygon(p: Point, poly: readonly Point[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > p.y) !== (b.y > p.y) && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

export function inShape(s: Shape, p: Point): boolean {
  if (s.type === "circle") return Math.hypot(p.x - s.x, p.y - s.y) <= s.r;
  if (s.type === "rect") return p.x >= s.x && p.x <= s.x + s.w && p.y >= s.y && p.y <= s.y + s.h;
  return pointInPolygon(p, s.points);
}

// อยู่ในรูปร่างที่ไม่ใช่รู และไม่ตกในรู
export function inShapes(shapes: readonly Shape[], p: Point): boolean {
  let inside = false;
  for (const s of shapes) if (!s.hole && inShape(s, p)) { inside = true; break; }
  if (!inside) return false;
  for (const s of shapes) if (s.hole && inShape(s, p)) return false;
  return true;
}

export function boxOfShape(s: Shape): Box {
  if (s.type === "circle") return { x0: s.x - s.r, y0: s.y - s.r, x1: s.x + s.r, y1: s.y + s.r };
  const pts = polyOf(s)!;
  return {
    x0: Math.min(...pts.map((p) => p.x)), y0: Math.min(...pts.map((p) => p.y)),
    x1: Math.max(...pts.map((p) => p.x)), y1: Math.max(...pts.map((p) => p.y)),
  };
}
export function boxOfShapes(shapes: readonly Shape[]): Box {
  const bs = shapes.map(boxOfShape);
  return {
    x0: Math.min(...bs.map((b) => b.x0)), y0: Math.min(...bs.map((b) => b.y0)),
    x1: Math.max(...bs.map((b) => b.x1)), y1: Math.max(...bs.map((b) => b.y1)),
  };
}

const cross = (a: Point, b: Point, c: Point) => (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
const onSeg = (a: Point, b: Point, p: Point) =>
  Math.min(a.x, b.x) <= p.x && p.x <= Math.max(a.x, b.x) && Math.min(a.y, b.y) <= p.y && p.y <= Math.max(a.y, b.y);
// เส้น ab กับ cd แตะกันไหม (แตะที่ปลายก็นับ)
function segTouch(a: Point, b: Point, c: Point, d: Point): boolean {
  const d1 = cross(c, d, a), d2 = cross(c, d, b), d3 = cross(a, b, c), d4 = cross(a, b, d);
  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) return true;
  return (d1 === 0 && onSeg(c, d, a)) || (d2 === 0 && onSeg(c, d, b)) || (d3 === 0 && onSeg(a, b, c)) || (d4 === 0 && onSeg(a, b, d));
}
function segDist(p: Point, a: Point, b: Point): number {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}
function circleTouchesPoly(c: { x: number; y: number; r: number }, poly: readonly Point[]): boolean {
  if (pointInPolygon(c, poly)) return true;
  return poly.some((a, i) => segDist(c, a, poly[(i + 1) % poly.length]) <= c.r);
}
function polyTouch(a: readonly Point[], b: readonly Point[]): boolean {
  if (a.some((p) => pointInPolygon(p, b)) || b.some((p) => pointInPolygon(p, a))) return true;
  return a.some((p, i) => b.some((q, j) => segTouch(p, a[(i + 1) % a.length], q, b[(j + 1) % b.length])));
}

// สองรูปร่างซ้อนหรือติดกันไหม (รูถือเป็นของทึบ: แค่ใช้ตัดสินว่าควร merge)
export function shapesTouch(a: Shape, b: Shape): boolean {
  if (a.type === "circle" && b.type === "circle") return Math.hypot(a.x - b.x, a.y - b.y) <= a.r + b.r;
  if (a.type === "circle") return circleTouchesPoly(a, polyOf(b)!);
  if (b.type === "circle") return circleTouchesPoly(b, polyOf(a)!);
  return polyTouch(polyOf(a)!, polyOf(b)!);
}
export const anyTouch = (xs: readonly Shape[], ys: readonly Shape[]): boolean =>
  xs.some((x) => !x.hole && ys.some((y) => !y.hole && shapesTouch(x, y)));
