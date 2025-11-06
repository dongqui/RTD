import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";

export class WarriorHero extends BaseHero {
  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "warrior", cardId);
  }
}

export const warriorSpec: HeroSpec = {
  id: "warrior",
  name: "수습 전사",
  cost: 2,
  rate: 1,
  description: "",
  cardColor: 0xff4444,
  stats: {
    health: 300,
    speed: 60,
    attackRange: 50,
    attackDamage: 15,
    attackSpeed: 1000,
  },
  visual: {
    skinColor: "#f5cfb3",
    hairColor: "#f9fd17",
    skinKeys: [
      "boots/boots_f_2",
      "bottom/bottom_f_1",
      "eyes/eyes_f_9",
      "gear_right/gear_right_f_11",
      "gear_left/gear_left_f_16",
      "hair_short/hair_short_f_1",
      "mouth/mouth_f_2",
      "skin/skin_1",
      "top/top_f_56",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: WarriorHero,
};

// Register the hero spec
HeroRegistry.registerSpec(warriorSpec);
