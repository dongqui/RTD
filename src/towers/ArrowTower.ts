import { BaseTower } from '../BaseTower';
import { Arrow } from '../Arrow';
import { BaseMonster } from '../monsters/BaseMonster';

export class ArrowTower extends BaseTower {
  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    super(
      scene,
      gridX,
      gridY,
      'archer_idle',  // idleTexture
      'archer_shoot', // shootTexture
      25,     // damage
      150,    // range
      1000,   // attackSpeed (ms)
      50,     // cost
      1,      // width
      1       // height
    );
  }

  performAttack(target: Phaser.GameObjects.GameObject): void {
    if (target instanceof BaseMonster) {
      const arrow = new Arrow(this.scene, this.sprite.x, this.sprite.y, target, this.damage);
      console.log(`Arrow Tower at (${this.gridX}, ${this.gridY}) fires arrow at target`);
    }
  }
}