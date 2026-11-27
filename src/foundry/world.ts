// The real map as the rules see it. Walls are asked from Foundry's own collision test (same call the
// old shove() used), tokens come from the scene, oil comes from the oil templates combatx.js creates.
import type { Creature } from "../model/creature";
import type { Prop } from "../model/thing";
import type { Cell, World } from "../model/world";
import type { Point, Resolved, Zone } from "../model/zone";
import type { ZoneField } from "../rules/zones";
import { MOD, centerOf, cellOf, gridFt, toCreature, toProp } from "./snapshot";
import { fieldOf } from "./zones";

export class FoundryWorld implements World {
  readonly cellFt: number;
  private scene: any;
  private list: Creature[];
  private propList: Prop[];
  private heights: Record<string, number>;
  private field: ZoneField;

  constructor(scene: any = canvas.scene) {
    this.scene = scene;
    this.cellFt = gridFt(scene);
    const toks: any[] = scene.tokens?.contents ?? [...scene.tokens.values()];
    this.list = toks.map(toCreature).filter((c): c is Creature => !!c);
    this.propList = toks.map(toProp).filter((p): p is Prop => !!p);

    let h: unknown; try { h = scene.getFlag?.(MOD, "heights"); } catch { /* none */ }
    this.heights = (h && typeof h === "object" ? h : {}) as Record<string, number>;

    // Zone = Scene Region ที่ติดป้ายของเรา + เทมเพลตน้ำมันเดิม (แปลงเป็นวงกลมในหน่วยฟุต)
    this.field = fieldOf(scene);
  }

  creature(id: string): Creature | undefined { return this.list.find((c) => c.id === id); }
  creatures(): readonly Creature[] { return this.list; }
  props(): readonly Prop[] { return this.propList; }
  propAt(cell: Cell): Prop | undefined {
    return this.propList.find((p) => cell.col >= p.pos.col && cell.col < p.pos.col + p.footprint
      && cell.row >= p.pos.row && cell.row < p.pos.row + p.footprint);
  }

  occupant(cell: Cell): Creature | undefined {
    return this.list.find((c) => cell.col >= c.pos.col && cell.col < c.pos.col + c.footprint
      && cell.row >= c.pos.row && cell.row < c.pos.row + c.footprint);
  }

  blocked(from: Cell, to: Cell): boolean {
    const a = centerOf(this.scene, from), b = centerOf(this.scene, to);
    const r = this.scene.dimensions?.sceneRect;
    if (r && (b.x < r.x || b.y < r.y || b.x > r.x + r.width || b.y > r.y + r.height)) return true;   // off the map
    try { return !!CONFIG.Canvas.polygonBackends.move.testCollision(a, b, { type: "move", mode: "any" }); }
    catch (e) { console.warn(MOD, "collision", e); return false; }
  }

  // ground height in ft: GM-painted via core.setHeightArea(); the module has no height data yet
  heightAt(cell: Cell): number { return Number(this.heights[`${cell.col},${cell.row}`]) || 0; }

  // พื้นผิวของช่อง: ถามจาก Zone (จุดกลางช่องอยู่ในรูปร่าง หรือคลุมเกินสัดส่วน ตั้งที่ flag zoneCoverage ของฉาก)
  surfaceAt(cell: Cell): string | undefined { return this.field.surfaceAtCell(cell); }
  zones(): readonly Zone[] { return this.field.zones(); }
  propertiesAt(p: Point): Resolved { return this.field.propertiesAt(p); }

  cellOfToken(tok: any): Cell { return cellOf(this.scene, tok.x, tok.y); }
}
