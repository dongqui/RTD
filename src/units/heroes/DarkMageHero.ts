import { BaseHero } from "./BaseHero";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { SoundManager } from "../../managers/SoundManager";
import { AttackDamageEffect } from "../../fsm/effects/AttackDamageEffect";

export class DarkMageHero extends BaseHero {
  private static darkAnimCreated: boolean = false;
  private aoeRadius: number = 150;

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "dark_mage", cardId);

    if (!DarkMageHero.darkAnimCreated && this.scene.anims) {
      this.scene.anims.create({
        key: "dark_attack",
        frames: this.scene.anims.generateFrameNumbers("dark", {
          start: 0,
          end: 10,
        }),
        frameRate: 15,
        repeat: 0,
      });
      DarkMageHero.darkAnimCreated = true;
    }
  }

  protected performAttack(target: CombatEntity | Base): void {
    this.showDarkEffect(target);
    this.dealAoeDamage(target);
  }

  protected onAttack(_target: CombatEntity | Base): void {
    SoundManager.getInstance().play("dark", { volume: 0.6 });
  }

  private showDarkEffect(target: CombatEntity | Base): void {
    const targetX = target.getX();
    const targetY = target.getY();
    const enemies = this.scene.data.get("enemies") || [];

    // 범위 안에 있는 적들에게 어둠 이펙트 표시
    for (const enemy of enemies) {
      if (enemy.isDead && enemy.isDead()) continue;

      const distance = Phaser.Math.Distance.Between(
        targetX,
        targetY,
        enemy.spineObject.x,
        enemy.spineObject.y
      );

      if (distance <= this.aoeRadius) {
        const dark = this.scene.add.sprite(
          enemy.spineObject.x,
          enemy.spineObject.y,
          "dark"
        );
        dark.setScale(1.5);
        dark.setAlpha(0.9);
        dark.setBlendMode(Phaser.BlendModes.ADD);
        dark.setOrigin(0.5, 1);
        dark.setDepth(enemy.spineObject.depth + 1);

        dark.play("dark_attack");

        dark.on("animationcomplete", () => {
          dark.destroy();
        });
      }
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
        // 공격력 10% 감소 효과 적용 (2초간)
        this.applyAttackDamageReduction(enemy);
      }
    }
  }

  private applyAttackDamageReduction(target: CombatEntity): void {
    // 공격력 10% 감소 = multiplier 0.9
    const effect = new AttackDamageEffect(2000, 0.9);
    target.statusEffects.addEffect(effect);
  }
}

export const darkMageSpec: HeroSpec = {
  id: "dark_mage",
  name: "어둠 마법사",
  cost: 6,
  rate: 2,
  description: "범위 공격 및 공격력 감소",
  cardColor: 0x6600cc,
  stats: {
    health: 30,
    speed: 50,
    attackRange: 300,
    attackDamage: 30,
    attackSpeed: 2000,
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#212121",
    skinKeys: [
      "bottom/bottom_f_26",
      "brow/brow_f_5",
      "eyes/eyes_f_2",
      "gear_left/gear_left_f_36",
      "gear_right/gear_right_f_33",
      "hair_short/hair_short_f_16",
      "mouth/mouth_f_2",
      "skin/skin_1",
      "top/top_f_21",
    ],
    attackAnimKey: "Attack_Magic",
    idleAnimKey: "Idle",
  },
  heroClass: DarkMageHero,
  isRanged: true,
};

// Register the hero spec
HeroRegistry.registerSpec(darkMageSpec);
