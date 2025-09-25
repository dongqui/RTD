import { BaseTower } from '../BaseTower';
import { BaseMonster } from '../monsters/BaseMonster';

export class CannonTower extends BaseTower {
  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    super(
      scene,
      gridX,
      gridY,
      'archer_idle',  // idleTexture - 임시로 archer 사용
      'archer_shoot', // shootTexture - 임시로 archer 사용
      80,     // damage
      120,    // range
      2000,   // attackSpeed (ms)
      150,    // cost
      1,      // width
      1       // height
    );

    this.sprite.setTint(0x8B4513);
  }

  performAttack(target: Phaser.GameObjects.GameObject): void {
    if (target instanceof BaseMonster) {
      target.takeDamage(this.damage);
      console.log(`Cannon Tower at (${this.gridX}, ${this.gridY}) attacks target for ${this.damage} damage`);
    }
  }
}