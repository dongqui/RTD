import { CombatEntity } from "../fsm/CombatEntity";
import Base from "../Base";

export class Projectile {
  private scene: Phaser.Scene;
  private sprite: Phaser.GameObjects.Image;
  private target: CombatEntity | Base;
  private attacker: CombatEntity;
  private damage: number;
  private speed: number;
  private active: boolean = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    target: CombatEntity | Base,
    attacker: CombatEntity,
    damage: number,
    textureKey: string = "Arrow",
    speed: number = 600,
    scale: number = 1
  ) {
    this.scene = scene;
    this.target = target;
    this.attacker = attacker;
    this.damage = damage;
    this.speed = speed;

    this.sprite = scene.add.image(x, y, textureKey);
    this.sprite.setScale(scale);
    this.sprite.setDepth(100);

    const angle = Phaser.Math.Angle.Between(x, y, target.getX(), target.getY());
    this.sprite.setRotation(angle);
  }

  update(delta: number): boolean {
    if (!this.active) {
      return false;
    }
    const targetX = this.target.getX();
    const targetY = this.target.getY();

    const distance = Phaser.Math.Distance.Between(
      this.sprite.x,
      this.sprite.y,
      targetX,
      targetY
    );

    if (distance < 10) {
      this.target.takeDamage(this.damage, this.attacker);
      this.destroy();
      return false;
    }

    const moveDistance = (this.speed * delta) / 1000;

    if (moveDistance >= distance) {
      this.sprite.x = targetX;
      this.sprite.y = targetY;
    } else {
      const angle = Phaser.Math.Angle.Between(
        this.sprite.x,
        this.sprite.y,
        targetX,
        targetY
      );

      this.sprite.x += Math.cos(angle) * moveDistance;
      this.sprite.y += Math.sin(angle) * moveDistance;
      this.sprite.setRotation(angle);
    }

    return true;
  }

  destroy(): void {
    this.active = false;
    if (this.sprite) {
      this.sprite.destroy();
    }
  }

  isActive(): boolean {
    return this.active;
  }
}
