import { BaseHero } from "./BaseHero";
import { HeroSpec, HeroRegistry } from "./HeroRegistry";

export class BarbarianMercenaryHero extends BaseHero {
  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "barbarian_mercenary", cardId);
  }

  onDeath(): void {
    // 사망 시 전용 이벤트를 먼저 알리고, 일반 영웅 사망 흐름(super)으로 마무리
    this.scene.events.emit("barbarian-mercenary-died", this.cardId);
    super.onDeath();
  }
}

export const barbarianMercenarySpec: HeroSpec = {
  id: "barbarian_mercenary",
  name: "야만 용병",
  cost: 5,
  rate: 3,
  description: "사망 시 덱에서 사라지는 강력한 일회용 전사.",
  cardColor: 0xc37a4e,
  stats: {
    health: 520,
    speed: 75,
    attackRange: 60,
    attackDamage: 42,
    attackSpeed: 800,
  },
  visual: {
    skinColor: "#c08e68",
    hairColor: "#705c5c",
    skinKeys: [
      "bottom/bottom_f_31",
      "brow/brow_f_3",
      "eyes/eyes_f_12",
      "gear_left/gear_left_f_34",
      "gear_right/gear_right_f_21",
      "gloves/gloves_f_19",
      "helmet/helmet_f_21",
      "mouth/mouth_f_2",
      "skin/skin_1",
      "top/top_f_48",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  heroClass: BarbarianMercenaryHero,
};

HeroRegistry.registerSpec(barbarianMercenarySpec);
