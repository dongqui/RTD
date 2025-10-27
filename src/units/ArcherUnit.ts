import { BaseUnit } from "./BaseUnit";
import { UnitSpec } from "./UnitRegistry";
export class ArcherUnit extends BaseUnit {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "archer");
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
    attackRange: 150,
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
