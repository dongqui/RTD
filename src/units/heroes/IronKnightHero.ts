import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";

export class IronKnightHero extends BaseHero {
  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "iron_knight", cardId);
  }
}

export const ironKnightSpec: HeroSpec = {
  id: "iron_knight",
  name: "강철 기사",
  cost: 3,
  rate: 1,
  description: "",
  cardColor: 0x8888ff,
  stats: {
    health: 450,
    speed: 60,
    attackRange: 50,
    attackDamage: 15,
    attackSpeed: 1000,
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#212121",
    skinKeys: [
      "back/back_f_23",
      "beard/beard_f_3",
      "boots/boots_f_2",
      "bottom/bottom_f_32",
      "brow/brow_f_1",
      "eyewear/eyewear_f_25",
      "gear_left/gear_left_f_8",
      "gear_right/gear_right_f_35",
      "gloves/gloves_f_39",
      "helmet/helmet_f_7",
      "skin/skin_1",
      "top/top_f_47",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: IronKnightHero,
};

// Register the hero spec
HeroRegistry.registerSpec(ironKnightSpec);
