import { BaseUnit } from "./BaseUnit";

export class ArcherUnit extends BaseUnit {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "archer");
  }
}
