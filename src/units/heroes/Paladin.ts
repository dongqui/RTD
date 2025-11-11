import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";

export class PaladinHero extends BaseHero {
  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "paladin", cardId);
  }

  protected performAttack(target: CombatEntity | Base): void {
    super.performAttack(target);
  }
}

export const paladinSpec: HeroSpec = {
  id: "paladin",
  name: "성기사",
  cost: 7,
  rate: 3,
  description: "",
  cardColor: 0xffd27f,
  stats: {
    health: 420,
    speed: 55,
    attackRange: 60,
    attackDamage: 22,
    attackSpeed: 1000,
    heal: {
      amount: 45,
      range: 220,
      speed: 1500,
    },
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#d98138",
    skinKeys: [
      "back/back_f_16",
      "boots/boots_f_14",
      "bottom/bottom_f_9",
      "eyes/eyes_f_12",
      "gear_left/gear_left_f_10",
      "gear_right/gear_right_f_38",
      "gloves/gloves_f_14",
      "hair_hat/hair_hat_f_12",
      "helmet/helmet_f_23",
      "mouth/mouth_f_1",
      "skin/skin_1",
      "top/top_f_23",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: PaladinHero,
};

HeroRegistry.registerSpec(paladinSpec);
