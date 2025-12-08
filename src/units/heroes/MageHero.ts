import { BaseHero } from "./BaseHero";
import { HeroRegistry, HeroSpec } from "./HeroRegistry";
import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { Projectile } from "../../objects/Projectile";

export class MageHero extends BaseHero {
  private projectiles: Projectile[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "mage", cardId);
  }

  protected performAttack(target: CombatEntity | Base): void {
    const projectile = new Projectile(
      this.scene,
      this.spineObject.x + 25,
      this.spineObject.y - 52,
      target,
      this.getAttackDamage(),
      "energyball",
      550,
      0.5
    );

    this.projectiles.push(projectile);
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
    this.projectiles.forEach((projectile) => projectile.destroy());
    this.projectiles = [];
    super.destroy();
  }
}

export const mageSpec: HeroSpec = {
  id: "mage",
  name: "견습 마법사",
  cost: 3,
  rate: 1,
  description: "마력 구슬을 던지는 초급 마법사",
  cardColor: 0x6f7dff,
  stats: {
    health: 40,
    speed: 50,
    attackRange: 280,
    attackDamage: 14,
    attackSpeed: 1100,
  },
  visual: {
    skinColor: "#ffc294",
    hairColor: "#212121",
    skinKeys: [
      "boots/boots_f_2",
      "bottom/bottom_f_1",
      "brow/brow_f_8",
      "eyes/eyes_f_9",
      "gear_left/gear_left_f_24",
      "hair_short/hair_short_f_1",
      "mouth/mouth_f_2",
      "skin/skin_1",
      "top/top_f_56",
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack_Magic",
  },
  heroClass: MageHero,
  isRanged: true,
};

HeroRegistry.registerSpec(mageSpec);
