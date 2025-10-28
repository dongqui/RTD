import { BaseUnit } from "./BaseUnit";
import { UnitSpec } from "./UnitRegistry";
import { CombatEntity } from "../fsm/CombatEntity";
import Base from "../Base";
import { Projectile } from "../objects/Projectile";

export class ArcherUnit extends BaseUnit {
  private projectiles: Projectile[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, cardId: string = "") {
    super(scene, x, y, "archer", cardId);
  }

  attack(target: CombatEntity | Base): void {
    const currentTime = this.scene.time.now;

    if (currentTime - this.getLastAttackTime() >= this.getAttackSpeed()) {
      this.setLastAttackTime(currentTime);

      const projectile = new Projectile(
        this.scene,
        this.spineObject.x,
        this.spineObject.y - 52,
        target,
        this.getAttackDamage(),
        "Arrow",
        600
      );

      this.projectiles.push(projectile);
      this.playAttackAnimation();
    }
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
}

export const archerSpec: UnitSpec = {
  id: "archer",
  name: "궁수",
  cost: 3,
  description: "원거리 공격",
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
      "bottom/bottom_f_1",
      "eyes/eyes_f_9",
      "gear_right/gear_right_f_25",
      "hair_short/hair_short_f_1",
      "mouth/mouth_f_2",
      "skin/skin_1",
      "top/top_f_56",
    ],
    attackAnimKey: "Attack_Bow",
  },
  unitClass: ArcherUnit,
};
