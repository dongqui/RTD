import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { MoveSpeedEffect } from "../../fsm/effects/MoveSpeedEffect";

export class RushKnightHero extends BaseHero {
  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "rush_knight", cardId);
    this.applyRushBoost();
  }

  private applyRushBoost(): void {
    // 3초간 이동속도 50% 증가 (multiplier 1.5)
    const rushBoost = new MoveSpeedEffect(3000, 1.5);
    this.statusEffects.addEffect(rushBoost);
  }
}

export const rushKnightSpec: HeroSpec = {
  id: "rush_knight",
  name: "돌격 기사",
  cost: 3,
  rate: 2,
  description: "리스폰 시 3초간 이동속도 50% 향상",
  cardColor: 0xff8844,
  stats: {
    health: 400,
    speed: 90, // 기본 속도가 높음 (일반 60 대비)
    attackRange: 50,
    attackDamage: 20,
    attackSpeed: 1000,
  },
  visual: {
    skinColor: "#815736",
    hairColor: "#212121",
    skinKeys: [
      "boots/boots_f_10",
      "bottom/bottom_f_7",
      "eyewear/eyewear_f_18",
      "gear_left/gear_left_f_6",
      "gear_right/gear_right_f_12",
      "gloves/gloves_f_10",
      "helmet/helmet_f_2",
      "skin/skin_1",
      "top/top_f_11",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: RushKnightHero,
};

// Register the hero spec
HeroRegistry.registerSpec(rushKnightSpec);
