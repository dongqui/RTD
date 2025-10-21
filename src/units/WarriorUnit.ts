import { BaseUnit } from "./BaseUnit";

export class WarriorUnit extends BaseUnit {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, {
      health: 50,
      speed: 60,
      cost: 50,
      scale: 0.3,
      attackRange: 80,
      attackDamage: 15,
      attackSpeed: 1000,
    });
  }

  protected setupAnimations(): void {
    if (this.spineObject.skeleton.data.findAnimation("walk")) {
      this.spineObject.play("walk", true);
    } else if (this.spineObject.skeleton.data.findAnimation("idle")) {
      this.spineObject.play("idle", true);
    }
  }
}
