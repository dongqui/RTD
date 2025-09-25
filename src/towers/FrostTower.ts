import { BaseTower } from '../BaseTower';
import { BaseMonster } from '../monsters/BaseMonster';

export class FrostTower extends BaseTower {
  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    super(
      scene,
      gridX,
      gridY,
      'archer_idle',  // idleTexture - 임시로 archer 사용
      'archer_shoot', // shootTexture - 임시로 archer 사용
      15,     // damage
      100,    // range
      800,    // attackSpeed (ms)
      75,     // cost
      1,      // width
      1       // height
    );

    this.sprite.setTint(0x00BFFF);
  }

  performAttack(target: Phaser.GameObjects.GameObject): void {
    if (target instanceof BaseMonster) {
      target.takeDamage(this.damage);
      console.log(`Frost Tower at (${this.gridX}, ${this.gridY}) attacks target for ${this.damage} damage`);
    }
  }
}