import { BaseEnemy } from "../units/enemies/BaseEnemy";
import { EnemyRegistry } from "../units/enemies";

export type { EnemyType } from "../units/enemies";

export class EnemyManager {
  private scene: Phaser.Scene;
  private activeEnemies: BaseEnemy[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.scene.data.set("enemies", this.activeEnemies);
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.scene.events.on(
      "enemy-killed",
      (enemy: BaseEnemy, reward: number) => {
        this.removeEnemy(enemy);
        this.scene.events.emit("enemy-manager-killed", enemy, reward);
      }
    );
  }

  spawnEnemy(type: string, x: number, y: number): BaseEnemy | null {
    if (!EnemyRegistry.hasSpec(type)) {
      console.error(`Unknown enemy type: ${type}`);
      return null;
    }

    const spec = EnemyRegistry.getSpec(type);
    const EnemyClass = spec.enemyClass as any;
    const enemy = new EnemyClass(this.scene, x, y) as BaseEnemy;

    this.addEnemy(enemy);
    return enemy;
  }

  addEnemy(enemy: BaseEnemy): void {
    this.activeEnemies.push(enemy);
    this.scene.data.set("enemies", this.activeEnemies);
    this.scene.events.emit("enemy-added", enemy);
  }

  removeEnemy(enemy: BaseEnemy): void {
    const index = this.activeEnemies.indexOf(enemy);
    if (index > -1) {
      this.activeEnemies.splice(index, 1);
      this.scene.data.set("enemies", this.activeEnemies);
      this.scene.events.emit("enemy-removed", enemy);
    }
  }

  getActiveEnemies(): BaseEnemy[] {
    return [...this.activeEnemies];
  }

  getAliveEnemies(): BaseEnemy[] {
    return this.activeEnemies.filter(enemy => !enemy.isDead());
  }

  getActiveEnemyCount(): number {
    return this.activeEnemies.length;
  }

  findNearestEnemy(x: number, y: number, range: number): BaseEnemy | null {
    let nearestEnemy: BaseEnemy | null = null;
    let nearestDistance = Infinity;

    for (const enemy of this.activeEnemies) {
      if (enemy.isDead()) continue;

      const distance = Phaser.Math.Distance.Between(
        x,
        y,
        enemy.spineObject.x,
        enemy.spineObject.y
      );

      if (distance <= range && distance < nearestDistance) {
        nearestEnemy = enemy;
        nearestDistance = distance;
      }
    }

    return nearestEnemy;
  }

  update(): void {
    for (const enemy of this.activeEnemies) {
      if (!enemy.isDead()) {
        enemy.update(this.scene.time.now, this.scene.game.loop.delta);
      }
    }
  }

  clear(): void {
    for (const enemy of this.activeEnemies) {
      enemy.spineObject.destroy();
    }
    this.activeEnemies = [];
  }
}
