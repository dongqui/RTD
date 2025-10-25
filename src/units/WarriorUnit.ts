import { BaseUnit } from "./BaseUnit";

export class WarriorUnit extends BaseUnit {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "warrior");
  }
}
