import { BaseHero } from "./BaseHero";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { SoundManager } from "../../managers/SoundManager";

export class FireWizardHero extends BaseHero {
  private static fireAnimCreated: boolean = false;
  private aoeRadius: number = 150;

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "fire_wizard", cardId);

    if (!FireWizardHero.fireAnimCreated && this.scene.anims) {
      this.scene.anims.create({
        key: "fire_attack",
        frames: this.scene.anims.generateFrameNumbers("fire", {
          start: 0,
          end: 10,
        }),
        frameRate: 15,
        repeat: 0,
      });
      FireWizardHero.fireAnimCreated = true;
    }
  }

  protected performAttack(target: CombatEntity | Base): void {
    this.showFireEffect(target);
    this.dealAoeDamage(target);
  }

  protected onAttack(_target: CombatEntity | Base): void {
    SoundManager.getInstance().play("fire", { volume: 0.6 });
  }

  private showFireEffect(target: CombatEntity | Base): void {
    const targetX = target.getX();
    const targetY = target.getY();

    for (let i = 0; i < 4; i++) {
      this.scene.time.delayedCall(i * 150, () => {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * this.aoeRadius;
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        const finalX = targetX + offsetX;
        const finalY = targetY + offsetY;
        const startY = finalY - 100;

        const fire = this.scene.add.sprite(finalX, startY, "fire");
        fire.setScale(1.5);

        fire.setBlendMode(Phaser.BlendModes.ADD);
        fire.setOrigin(0.5, 0.5);

        this.scene.tweens.add({
          targets: fire,
          y: finalY,
          duration: 300,
          ease: "Cubic.easeIn",
        });

        fire.play("fire_attack");

        fire.on("animationcomplete", () => {
          fire.destroy();
        });
      });
    }
  }

  private dealAoeDamage(target: CombatEntity | Base): void {
    const targetX = target.getX();
    const targetY = target.getY();
    const enemies = this.scene.data.get("enemies") || [];

    // target이 Base인 경우 Base에도 데미지 적용
    const isTargetBase =
      (target as any).isActive !== undefined &&
      (target as any).getTeam !== undefined;
    if (isTargetBase && (target as Base).isActive()) {
      target.takeDamage(this.getAttackDamage());
    }

    for (const enemy of enemies) {
      if (enemy.isDead && enemy.isDead()) continue;

      const distance = Phaser.Math.Distance.Between(
        targetX,
        targetY,
        enemy.spineObject.x,
        enemy.spineObject.y
      );

      if (distance <= this.aoeRadius) {
        enemy.takeDamage(this.getAttackDamage());
      }
    }
  }
}

export const fireWizardSpec: HeroSpec = {
  id: "fire_wizard",
  name: "화염 마도사",
  cost: 6,
  rate: 2,
  description: "강력한 범위 공격",
  cardColor: 0xff4444,
  stats: {
    health: 30,
    speed: 50,
    attackRange: 300,
    attackDamage: 30,
    attackSpeed: 2000,
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#f5cd05",
    skinKeys: [
      "back/back_f_15",
      "boots/boots_f_11",
      "bottom/bottom_f_51",
      "eyes/eyes_f_19",
      "gear_right/gear_right_f_32",
      "gloves/gloves_f_12",
      "hair_hat/hair_hat_f_8",
      "helmet/helmet_f_28",
      "mouth/mouth_f_9",
      "skin/skin_1",
      "top/top_f_12",
    ],
    attackAnimKey: "Attack_Magic",
    idleAnimKey: "Idle",
  },
  heroClass: FireWizardHero,
  isRanged: true,
};

// Register the hero spec
HeroRegistry.registerSpec(fireWizardSpec);
