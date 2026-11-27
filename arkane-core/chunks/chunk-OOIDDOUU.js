/* arkane-core 0.10.0 - generated from src/, do not edit by hand */
import {
  fieldOf
} from "./chunk-YYXYPINZ.js";
import {
  MOD,
  cellOf,
  centerOf,
  gridFt,
  toCreature,
  toProp
} from "./chunk-VELQ4LWX.js";

// src/foundry/world.ts
var FoundryWorld = class {
  cellFt;
  scene;
  list;
  propList;
  heights;
  field;
  constructor(scene = canvas.scene) {
    this.scene = scene;
    this.cellFt = gridFt(scene);
    const toks = scene.tokens?.contents ?? [...scene.tokens.values()];
    this.list = toks.map(toCreature).filter((c) => !!c);
    this.propList = toks.map(toProp).filter((p) => !!p);
    let h;
    try {
      h = scene.getFlag?.(MOD, "heights");
    } catch {
    }
    this.heights = h && typeof h === "object" ? h : {};
    this.field = fieldOf(scene);
  }
  creature(id) {
    return this.list.find((c) => c.id === id);
  }
  creatures() {
    return this.list;
  }
  props() {
    return this.propList;
  }
  propAt(cell) {
    return this.propList.find((p) => cell.col >= p.pos.col && cell.col < p.pos.col + p.footprint && cell.row >= p.pos.row && cell.row < p.pos.row + p.footprint);
  }
  occupant(cell) {
    return this.list.find((c) => cell.col >= c.pos.col && cell.col < c.pos.col + c.footprint && cell.row >= c.pos.row && cell.row < c.pos.row + c.footprint);
  }
  blocked(from, to) {
    const a = centerOf(this.scene, from), b = centerOf(this.scene, to);
    const r = this.scene.dimensions?.sceneRect;
    if (r && (b.x < r.x || b.y < r.y || b.x > r.x + r.width || b.y > r.y + r.height)) return true;
    try {
      return !!CONFIG.Canvas.polygonBackends.move.testCollision(a, b, { type: "move", mode: "any" });
    } catch (e) {
      console.warn(MOD, "collision", e);
      return false;
    }
  }
  // ground height in ft: GM-painted via core.setHeightArea(); the module has no height data yet
  heightAt(cell) {
    return Number(this.heights[`${cell.col},${cell.row}`]) || 0;
  }
  // พื้นผิวของช่อง: ถามจาก Zone (จุดกลางช่องอยู่ในรูปร่าง หรือคลุมเกินสัดส่วน ตั้งที่ flag zoneCoverage ของฉาก)
  surfaceAt(cell) {
    return this.field.surfaceAtCell(cell);
  }
  zones() {
    return this.field.zones();
  }
  propertiesAt(p) {
    return this.field.propertiesAt(p);
  }
  cellOfToken(tok) {
    return cellOf(this.scene, tok.x, tok.y);
  }
};

export {
  FoundryWorld
};
