import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { Projectile } from "../../objects/Projectile";
import { SoundManager } from "../../managers/SoundManager";

export class ArcherHero extends BaseHero {
  private projectiles: Projectile[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "archer", cardId);
  }

  protected performAttack(target: CombatEntity | Base): void {
    const projectile = new Projectile(
      this.scene,
      this.spineObject.x + 25,
      this.spineObject.y - 52,
      target,
      this.getAttackDamage(),
      "arrow",
      600
    );

    this.projectiles.push(projectile);
  }

  protected onAttack(target: CombatEntity | Base): void {
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

export const archerSpec: HeroSpec = {
  id: "archer",
  name: "수습 궁수",
  cost: 3,
  rate: 1,
  description: "",
  cardColor: 0x44ff44,
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
      "boots/boots_f_2",
      "brow/brow_f_8",
      "bottom/bottom_f_1",
      "eyes/eyes_f_9",
      "gear_right/gear_right_f_25",
      "hair_short/hair_short_f_1",
      "mouth/mouth_f_2",
      "skin/skin_1",
      "top/top_f_56",
    ],
    idleAnimKey: "Idle_Bow",
    attackAnimKey: "Attack_Bow",
  },
  heroClass: ArcherHero,
  isRanged: true,
};

// Register the hero spec
HeroRegistry.registerSpec(archerSpec);
