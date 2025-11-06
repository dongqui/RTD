import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";

export class ThiefHero extends BaseHero {
  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "thief", cardId);
  }

  playDeadAnimation(): void {
    super.playDeadAnimation();
    // 죽으면 리소스 3 충전
    this.scene.events.emit("add-resource", 3);
  }
}

export const thiefSpec: HeroSpec = {
  id: "thief",
  name: "도둑",
  cost: 2,
  rate: 1,
  description: "사망시 룬(3) 충전",
  cardColor: 0x888888,
  stats: {
    health: 20,
    speed: 50,
    attackRange: 50,
    attackDamage: 6,
    attackSpeed: 1000,
  },
  visual: {
    skinColor: "#ffd9bd",
    hairColor: "#212121",
    skinKeys: [
      "back/back_f_8",
      "boots/boots_f_2",
      "bottom/bottom_f_7",
      "brow/brow_f_1",
      "eyes/eyes_f_8",
      "gear_left/gear_left_f_37",
      "hair_short/hair_short_f_23",
      "mouth/mouth_f_4",
      "skin/skin_1",
      "top/top_f_16",
    ],
    idleAnimKey: "Idle2",
    attackAnimKey: "Attack1",
  },
  heroClass: ThiefHero,
};

// Register the hero spec
HeroRegistry.registerSpec(thiefSpec);
