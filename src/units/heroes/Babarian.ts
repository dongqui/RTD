import Base from "../../Base";
import { CombatEntity } from "../../fsm/CombatEntity";
import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";

export class BarbarianHero extends BaseHero {
  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "barbarian", cardId);
  }

  protected performAttack(target: CombatEntity | Base): void {
    super.performAttack(target);
    this.dealSplashDamage(target);
  }

  private dealSplashDamage(target: CombatEntity | Base): void {
    if (target instanceof Base) {
      return;
    }

    const splashConfig = barbarianSpec.stats.aoe;
    if (!splashConfig) {
      return;
    }

    const enemies = (this.scene.data.get("enemies") as CombatEntity[]) || [];
    const originX = target.getX();
    const originY = target.getY();
    const splashDamage = Math.floor(this.getAttackDamage() * 0.6);

    let hits = 0;
    for (const enemy of enemies) {
      if (enemy === target) {
        continue;
      }
      if (enemy.isDead()) {
        continue;
      }

      const distance = Phaser.Math.Distance.Between(
        originX,
        originY,
        enemy.getX(),
        enemy.getY()
      );

      if (distance <= splashConfig.radius) {
        enemy.takeDamage(splashDamage);
        hits += 1;
        if (splashConfig.maxTargets && hits >= splashConfig.maxTargets) {
          break;
        }
      }
    }
  }
}

export const barbarianSpec: HeroSpec = {
  id: "barbarian",
  name: "바바리안",
  cost: 4,
  rate: 2,
  description: "광역 피해를 주는 근접 전사.",
  cardColor: 0xb36a3c,
  stats: {
    health: 360,
    speed: 65,
    attackRange: 60,
    attackDamage: 28,
    attackSpeed: 900,
    aoe: {
      radius: 80,
      maxTargets: 3,
    },
  },
  visual: {
    skinColor: "#9d715c",
    hairColor: "#727272",
    skinKeys: [
      "back/back_f_18",
      "beard/beard_f_6",
      "boots/boots_f_6",
      "bottom/bottom_f_30",
      "brow/brow_f_1",
      "eyes/eyes_f_3",
      "gear_left/gear_left_f_40",
      "gear_right/gear_right_f_19",
      "gloves/gloves_f_18",
      "hair_hat/hair_hat_f_18",
      "helmet/helmet_f_3",
      "mouth/mouth_f_9",
      "skin/skin_1",
      "top/top_f_10",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: BarbarianHero,
};

HeroRegistry.registerSpec(barbarianSpec);
