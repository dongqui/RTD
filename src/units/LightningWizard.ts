import { BaseUnit } from "./BaseUnit";
import { CombatEntity } from "../fsm/CombatEntity";
import Base from "../Base";

export class LightningWizard extends BaseUnit {
  private attackStack: number = 0;
  private maxAttackStack: number = 10;
  private attackSpeedPerStack: number = 0.1;
  private static lightningAnimCreated: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "lightning_wizard");

    if (!LightningWizard.lightningAnimCreated && this.scene.anims) {
      this.scene.anims.create({
        key: "lightning_strike",
        frames: this.scene.anims.generateFrameNumbers("lightning", { start: 0, end: 4 }),
        frameRate: 15,
        repeat: 0,
      });
      LightningWizard.lightningAnimCreated = true;
    }
  }

  attack(target: CombatEntity | Base): void {
    const currentTime = this.scene.time.now;
    const attackSpeed = this.getAttackSpeed();

    if (currentTime - this.getLastAttackTime() >= attackSpeed) {
      this.setLastAttackTime(currentTime);
      target.takeDamage(this.getAttackDamage());
      this.playAttackAnimation();

      this.showLightningEffect(target);

      if (this.attackStack < this.maxAttackStack) {
        this.attackStack++;
        this.updateAttackSpeed();
      }
    }
  }

  private showLightningEffect(target: CombatEntity | Base): void {
    const targetX = target.getX();
    let targetY = target.getY();

    let targetHeight = 50;
    if ('spineObject' in target && target.spineObject) {
      targetHeight = 100;
    } else if ('sprite' in target && (target as any).sprite) {
      const sprite = (target as any).sprite;
      targetHeight = sprite.displayHeight || 50;
    }

    targetY -= targetHeight * 0.5;

    const lightning = this.scene.add.sprite(targetX, targetY, "lightning");
    lightning.setScale(0.5);
    lightning.setAlpha(0.9);
    lightning.setBlendMode(Phaser.BlendModes.ADD);

    lightning.setOrigin(0.5, 1);

    lightning.play("lightning_strike");

    lightning.on("animationcomplete", () => {
      lightning.destroy();
    });
  }

  move(delta: number): void {
    if (this.attackStack > 0) {
      this.attackStack = 0;
      this.updateAttackSpeed();
    }
    super.move(delta);
  }

  private updateAttackSpeed(): void {
    this.attackSpeedMultiplier = 1 + (this.attackStack * this.attackSpeedPerStack);
  }

  getAttackStack(): number {
    return this.attackStack;
  }
}
