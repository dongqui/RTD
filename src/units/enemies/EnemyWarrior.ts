import { BaseEnemy } from "./BaseEnemy";
import { EnemySpec, EnemyRegistry } from "./EnemyRegistry";

export class EnemyWarrior extends BaseEnemy {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemy_warrior");
  }
}

export const enemyWarriorSpec: EnemySpec = {
  id: "enemy_warrior",
  name: "야만 전사",
  reward: 10,
  stats: {
    health: 300,
    speed: 60,
    attackRange: 50,
    attackDamage: 15,
    attackSpeed: 1000,
  },
  visual: {
    skinColor: "#b5aaa1",
    hairColor: "#212121",
    skinKeys: [
      "eyewear/eyewear_f_12",
      "gear_left/gear_left_f_4",
      "gear_right/gear_right_f_21",
      "skin/skin_1",
      "top/top_f_32"
    ],
    idleAnimKey: "Idle",
    attackAnimKey: "Attack3",
  },
  enemyClass: EnemyWarrior,
};

// Register the enemy spec
EnemyRegistry.registerSpec(enemyWarriorSpec);
