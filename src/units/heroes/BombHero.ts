import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { SoundManager } from "../../managers/SoundManager";

export class BombHero extends BaseHero {
  private static bombAnimCreated: boolean = false;
  private explosionRadius: number = 150;
  private explosionDamage: number = 50;

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "bomb", cardId);

    if (!BombHero.bombAnimCreated && this.scene.anims) {
      this.scene.anims.create({
        key: "bomb_explosion",
        frames: this.scene.anims.generateFrameNumbers("bomb", {
          start: 0,
          end: 8,
        }),
        frameRate: 20,
        repeat: 0,
      });
      BombHero.bombAnimCreated = true;
    }
  }

  protected performAttack(target: CombatEntity | Base): void {
    super.performAttack(target);
  }

  onDeath(): void {
    // 사망시 주변 적에게 범위 피해
    this.explodeOnDeath();
    super.onDeath();
  }

  private explodeOnDeath(): void {
    const explosionX = this.spineObject.x;
    const explosionY = this.spineObject.y;
    const enemies = this.scene.data.get("enemies") || [];

    // 폭발 사운드 재생
    SoundManager.getInstance().play("bomb", { volume: 0.5 });

    // 폭발 이펙트 표시
    this.showExplosionEffect(explosionX, explosionY);

    // 주변 적에게 데미지 적용
    for (const enemy of enemies) {
      if (enemy.isDead && enemy.isDead()) continue;

      const distance = Phaser.Math.Distance.Between(
        explosionX,
        explosionY,
        enemy.spineObject.x,
        enemy.spineObject.y
      );

      if (distance <= this.explosionRadius) {
        enemy.takeDamage(this.explosionDamage);
      }
    }
  }

  private showExplosionEffect(x: number, y: number): void {
    const explosionSprite = this.scene.add.sprite(x, y, "bomb");
    explosionSprite.setScale(2.0);
    explosionSprite.setOrigin(0.5, 0.5);
    explosionSprite.setDepth(this.spineObject.depth + 10);
    explosionSprite.setBlendMode(Phaser.BlendModes.ADD);

    // 확대 효과
    explosionSprite.setScale(0.5);
    this.scene.tweens.add({
      targets: explosionSprite,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 600,
      ease: "Power2",
    });

    // 애니메이션 재생
    explosionSprite.play("bomb_explosion");

    // 애니메이션 완료 시 제거
    explosionSprite.on("animationcomplete", () => {
      explosionSprite.destroy();
    });
  }
}

export const bombSpec: HeroSpec = {
  id: "bomb",
  name: "폭파병",
  cost: 3,
  rate: 1,
  description: "사망시 주변 적에게 범위 피해를 입힙니다",
  cardColor: 0xff6600,
  stats: {
    health: 200,
    speed: 60,
    attackRange: 50,
    attackDamage: 20,
    attackSpeed: 1000,
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#212121",
    skinKeys: [
      "back/back_f_18",
      "boots/boots_f_27",
      "bottom/bottom_f_41",
      "eyewear/eyewear_f_11",
      "gear_left/gear_left_f_29",
      "helmet/helmet_f_20",
      "mouth/mouth_f_10",
      "skin/skin_1",
      "top/top_f_26",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: BombHero,
};

// Register the hero spec
HeroRegistry.registerSpec(bombSpec);
