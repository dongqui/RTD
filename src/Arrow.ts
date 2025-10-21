import { BaseMonster } from "./monsters/BaseMonster";

export class Arrow extends Phaser.GameObjects.Sprite {
  private speed: number;
  private damage: number;
  private target: BaseMonster;
  private targetX: number;
  private targetY: number;

  constructor(scene: Phaser.Scene, x: number, y: number, target: BaseMonster, damage: number) {
    super(scene, x, y, "arrow");

    this.target = target;
    this.damage = damage;
    this.speed = 300;

    this.targetX = target.sprite.x;
    this.targetY = target.sprite.y;

    const angle = Phaser.Math.Angle.Between(x, y, this.targetX, this.targetY);
    this.setRotation(angle);

    scene.add.existing(this);

    this.setDepth(10);

    this.startMovement();
  }

  private startMovement(): void {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);
    const duration = (distance / this.speed) * 1000;

    this.scene.tweens.add({
      targets: this,
      x: this.targetX,
      y: this.targetY,
      duration: duration,
      ease: 'Linear',
      onComplete: () => {
        this.hitTarget();
      }
    });
  }

  private hitTarget(): void {
    if (this.target && this.target.sprite && !this.target.sprite.destroyed) {
      console.log(`Arrow hitting target, dealing ${this.damage} damage`);
      this.target.takeDamage(this.damage);
    }
    this.destroy();
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);

    if (!this.target || !this.target.sprite || this.target.sprite.destroyed) {
      this.destroy();
      return;
    }

    const currentDistance = Phaser.Math.Distance.Between(this.x, this.y, this.target.sprite.x, this.target.sprite.y);
    if (currentDistance < 8) {
      this.hitTarget();
    }
  }
}