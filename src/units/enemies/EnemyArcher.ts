import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { Projectile } from "../../objects/Projectile";
import { BaseEnemy } from "./BaseEnemy";
import { EnemySpec, EnemyRegistry } from "./EnemyRegistry";

export class EnemyArcher extends BaseEnemy {
  private projectiles: Projectile[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "enemy_archer");
  }

  protected isRanged(): boolean {
    return true;
  }

  protected performAttack(target: CombatEntity | Base): void {
    const projectile = new Projectile(
      this.scene,
      this.spineObject.x - 25,
      this.spineObject.y - 52,
      target,
      this.getAttackDamage(),
      "arrow",
      600
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
    this.projectiles.forEach((projectile) => {
      projectile.destroy();
    });
    this.projectiles = [];
  }
}

export const enemyArcherSpec: EnemySpec = {
  id: "enemy_archer",
  name: "적 궁수",
  reward: 12,
  stats: {
    health: 160,
    speed: 55,
    attackRange: 320,
    attackDamage: 12,
    attackSpeed: 900,
  },
  visual: {
    skinColor: "#b5aaa1",
    hairColor: "#212121",
    skinKeys: [
      "back/back_f_21",
      "eyewear/eyewear_f_12",
      "gear_right/gear_right_f_29",
      "skin/skin_1",
      "top/top_f_32",
    ],
    idleAnimKey: "Idle_Bolt",
    attackAnimKey: "Attack_Bolt",
  },
  enemyClass: EnemyArcher,
};

EnemyRegistry.registerSpec(enemyArcherSpec);
