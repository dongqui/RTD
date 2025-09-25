import { BaseMonster } from "./monsters/BaseMonster";

export class MonsterManager {
  private scene: Phaser.Scene;
  private activeMonsters: BaseMonster[] = [];

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.scene.events.on(
      "monster-killed",
      (monster: BaseMonster, reward: number) => {
        this.removeMonster(monster);
        this.scene.events.emit("monster-manager-killed", monster, reward);
      }
    );

    this.scene.events.on("monster-reached-core", (monster: BaseMonster) => {
      this.removeMonster(monster);
      this.scene.events.emit("monster-manager-reached-core", monster);
    });
  }

  addMonster(monster: BaseMonster): void {
    this.activeMonsters.push(monster);
    this.scene.events.emit("monster-added", monster);
  }

  removeMonster(monster: BaseMonster): void {
    const index = this.activeMonsters.indexOf(monster);
    if (index > -1) {
      this.activeMonsters.splice(index, 1);
      this.scene.events.emit("monster-removed", monster);
    }
  }

  getActiveMonsters(): BaseMonster[] {
    return [...this.activeMonsters];
  }

  getActiveMonsterCount(): number {
    return this.activeMonsters.length;
  }

  findNearestMonster(x: number, y: number, range: number): BaseMonster | null {
    let nearestMonster: BaseMonster | null = null;
    let nearestDistance = Infinity;

    for (const monster of this.activeMonsters) {
      if (monster.sprite.destroyed) continue;

      const distance = Phaser.Math.Distance.Between(
        x,
        y,
        monster.sprite.x,
        monster.sprite.y
      );

      if (distance <= range && distance < nearestDistance) {
        nearestMonster = monster;
        nearestDistance = distance;
      }
    }

    return nearestMonster;
  }

  update(): void {
    for (const monster of this.activeMonsters) {
      monster.update(this.scene.time.now, this.scene.game.loop.delta);
    }
  }

  clear(): void {
    for (const monster of this.activeMonsters) {
      if (!monster.sprite.destroyed) {
        monster.sprite.destroy();
      }
    }
    this.activeMonsters = [];
  }
}
