import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { Projectile } from "../../objects/Projectile";
import { SoundManager } from "../../managers/SoundManager";

export class CrossBowHero extends BaseHero {
  private projectiles: Array<{
    projectile: Projectile;
    target: CombatEntity | Base;
    shouldKnockback: boolean;
  }> = [];
  private knockbackDistance: number = 100;

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "crossbow", cardId);
  }

  protected performAttack(target: CombatEntity | Base): void {
    // 40% 확률로 넉백 적용
    const shouldKnockback = Math.random() < 0.4 && !(target instanceof Base);

    const projectile = new Projectile(
      this.scene,
      this.spineObject.x + 25,
      this.spineObject.y - 52,
      target,
      this,
      this.getAttackDamage(),
      "arrow",
      600
    );

    this.projectiles.push({ projectile, target, shouldKnockback });
  }

  protected onAttack(_target: CombatEntity | Base): void {
    // Play arrow sound immediately when shooting
    SoundManager.getInstance().play("sound_hit_arrow", { volume: 0.4 });
  }

  private applyKnockback(target: CombatEntity): void {
    // Hit 애니메이션 재생 (BaseUnit으로 캐스팅)
    if ((target as any).playHitAnimation) {
      (target as any).playHitAnimation();
    }

    // 적을 뒤로 이동 (오른쪽으로 이동, 적들이 왼쪽으로 이동하므로)
    const currentX = target.getX();
    const targetX = currentX + this.knockbackDistance;

    // 이동 제한 (화면 밖으로 나가지 않도록)
    const finalX = Math.min(this.scene.cameras.main.width - 50, targetX);

    // 넉백 애니메이션
    this.scene.tweens.add({
      targets: target.spineObject,
      x: finalX,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        // 넉백 후 잠시 멈춤 효과
        if (!target.isDead()) {
          target.speedMultiplier = 0;

          this.scene.time.delayedCall(200, () => {
            if (!target.isDead()) {
              target.speedMultiplier = 1;
            }
          });
        }
      },
    });
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const { projectile, target, shouldKnockback } = this.projectiles[i];
      const wasActive = projectile.isActive();
      const isActive = projectile.update(delta);

      // 투사체가 타겟에 도달했을 때 넉백 적용
      if (
        wasActive &&
        !isActive &&
        shouldKnockback &&
        !(target instanceof Base)
      ) {
        this.applyKnockback(target as CombatEntity);
      }

      if (!isActive) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  destroy(): void {
    // 모든 투사체 정리
    this.projectiles.forEach((item) => {
      item.projectile.destroy();
    });
    this.projectiles = [];
    super.destroy();
  }
}

export const crossbowSpec: HeroSpec = {
  id: "crossbow",
  name: "석궁병",
  cost: 4,
  rate: 1,
  description: "느린 공격속도, 40% 확률로 적을 뒤로 넉백시킵니다",
  cardColor: 0x8b4513,
  stats: {
    health: 120,
    speed: 50,
    attackRange: 320,
    attackDamage: 35,
    attackSpeed: 2000, // 느린 공격속도
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#212121",
    skinKeys: [
      "back/back_f_21",
      "boots/boots_f_25",
      "bottom/bottom_f_7",
      "brow/brow_f_8",
      "eyes/eyes_f_1",
      "eyes/eyes_f_15",
      "gear_right/gear_right_f_30",
      "hair_short/hair_short_f_28",
      "mouth/mouth_f_10",
      "skin/skin_1",
      "top/top_f_3",
    ],
    idleAnimKey: "Idle_Bow",
    attackAnimKey: "Attack_Bow",
  },
  heroClass: CrossBowHero,
  isRanged: true,
};

// Register the hero spec
HeroRegistry.registerSpec(crossbowSpec);
