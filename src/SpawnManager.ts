import GameManager from "./GameManager";
import { UnitManager, UnitType } from "./UnitManager";
import { MonsterManager } from "./MonsterManager";

export class SpawnManager {
  private scene: Phaser.Scene;
  private gameManager: GameManager;
  private unitManager: UnitManager;
  private monsterManager: MonsterManager;

  private enemySpawnX: number;
  private spawnY: number;

  private enemySpawnInterval: number = 5000;

  private enemySpawnTimer: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    gameManager: GameManager,
    unitManager: UnitManager,
    monsterManager: MonsterManager
  ) {
    this.scene = scene;
    this.gameManager = gameManager;
    this.unitManager = unitManager;
    this.monsterManager = monsterManager;

    this.enemySpawnX = this.scene.cameras.main.width - 100;
    this.spawnY = this.scene.cameras.main.height / 2;

    this.setupAutoSpawn();
  }

  private setupAutoSpawn(): void {
    this.enemySpawnTimer = this.scene.time.addEvent({
      delay: this.enemySpawnInterval,
      callback: () => this.spawnEnemyMonster(),
      loop: true,
    });
  }

  private spawnEnemyMonster(): void {
    this.monsterManager.spawnMonster("basic", this.enemySpawnX, this.spawnY);
  }

  stop(): void {
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.destroy();
    }
  }

  setEnemySpawnInterval(interval: number): void {
    this.enemySpawnInterval = interval;
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.destroy();
    }
    this.enemySpawnTimer = this.scene.time.addEvent({
      delay: this.enemySpawnInterval,
      callback: () => this.spawnEnemyMonster(),
      loop: true,
    });
  }
}
