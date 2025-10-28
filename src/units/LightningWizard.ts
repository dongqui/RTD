import { BaseUnit } from "./BaseUnit";
import { CombatEntity } from "../fsm/CombatEntity";
import Base from "../Base";
import { UnitSpec } from "./UnitRegistry";
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
        frames: this.scene.anims.generateFrameNumbers("lightning", {
          start: 0,
          end: 4,
        }),
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

    const lightning = this.scene.add.sprite(targetX, targetY, "lightning");
    // lightning.setScale(0.5);
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
    this.attackSpeedMultiplier =
      1 + this.attackStack * this.attackSpeedPerStack;
  }

  getAttackStack(): number {
    return this.attackStack;
  }
}

export const lightningWizardSpec: UnitSpec = {
  id: "lightning_wizard",
  name: "전격 마도사",
  cost: 6,
  description: "공격할수록 공속 증가, 이동 시 초기화",
  cardColor: 0xffff44,
  stats: {
    health: 30,
    speed: 50,
    attackRange: 300,
    attackDamage: 10,
    attackSpeed: 800,
  },
  visual: {
    skinColor: "#f5cfb3",
    hairColor: "#f9fd17",
    skinKeys: [
      "boots/boots_f_12",
      "bottom/bottom_f_29",
      "eyewear/eyewear_f_26",
      "gear_left/gear_left_f_24",
      "gloves/gloves_f_14",
      "hair_short/hair_short_f_15",
      "mouth/mouth_f_9",
      "skin/skin_1",
      "top/top_f_41",
    ],
    attackAnimKey: "Attack3",
  },
  unitClass: LightningWizard,
};
