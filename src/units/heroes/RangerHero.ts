import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { Projectile } from "../../objects/Projectile";
import { SoundManager } from "../../managers/SoundManager";

export class RangerHero extends BaseHero {
  private projectiles: Projectile[] = [];
  private attackCount: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "ranger", cardId);
  }

  protected performAttack(target: CombatEntity | Base): void {
    // 4번 공격할 때마다 공격력 1 상승
    this.attackCount++;
    if (this.attackCount >= 4) {
      this.attackCount = 0;
      this.attackDamage += 1;
    }

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

    this.projectiles.push(projectile);
  }

  protected onAttack(_target: CombatEntity | Base): void {
    // Play arrow sound immediately when shooting
    SoundManager.getInstance().play("sound_hit_arrow", { volume: 0.4 });
  }

  update(time: number, delta: number): void {
    super.update(time, delta);

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      const isActive = projectile.update(delta);

      if (!isActive) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  destroy(): void {
    // 모든 투사체 정리
    this.projectiles.forEach((projectile) => {
      projectile.destroy();
    });
    this.projectiles = [];
    super.destroy();
  }
}

export const rangerSpec: HeroSpec = {
  id: "ranger",
  name: "레인저",
  cost: 3,
  rate: 1,
  description: "4번 공격할 때마다 공격력이 1 상승합니다",
  cardColor: 0x4a7c59,
  stats: {
    health: 30,
    speed: 50,
    attackRange: 300,
    attackDamage: 10,
    attackSpeed: 800,
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#212121",
    skinKeys: [
      "back/back_f_21",
      "boots/boots_f_5",
      "bottom/bottom_f_41",
      "brow/brow_f_6",
      "eyes/eyes_f_9",
      "gear_right/gear_right_f_27",
      "hair_hat/hair_hat_f_8",
      "helmet/helmet_f_11",
      "mouth/mouth_f_1",
      "skin/skin_1",
      "top/top_f_8",
    ],
    idleAnimKey: "Idle_Bow",
    attackAnimKey: "Attack_Bow",
  },
  heroClass: RangerHero,
  isRanged: true,
};

// Register the hero spec
HeroRegistry.registerSpec(rangerSpec);
