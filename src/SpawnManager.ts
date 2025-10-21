import GameManager from "./GameManager";
import { UnitManager, UnitType } from "./UnitManager";
import { MonsterManager } from "./MonsterManager";

export class SpawnManager {
  private scene: Phaser.Scene;
  private gameManager: GameManager;
  private unitManager: UnitManager;
  private monsterManager: MonsterManager;

  private playerSpawnX: number = 100;
  private enemySpawnX: number;
  private spawnY: number;

  private playerSpawnInterval: number = 3000;
  private enemySpawnInterval: number = 2000;

  private playerSpawnTimer: Phaser.Time.TimerEvent;
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
    this.playerSpawnTimer = this.scene.time.addEvent({
      delay: this.playerSpawnInterval,
      callback: () => this.spawnPlayerUnit(),
      loop: true,
    });

    this.enemySpawnTimer = this.scene.time.addEvent({
      delay: this.enemySpawnInterval,
      callback: () => this.spawnEnemyMonster(),
      loop: true,
    });
  }

  private spawnPlayerUnit(): void {
    this.unitManager.spawnUnit("archer", this.playerSpawnX, this.spawnY);
  }

  private spawnEnemyMonster(): void {
    const monsterTypes = ["basic", "fast", "tank"];
    const randomType = monsterTypes[Math.floor(Math.random() * monsterTypes.length)] as "basic" | "fast" | "tank";

    this.monsterManager.spawnMonster(randomType, this.enemySpawnX, this.spawnY);
  }

  stop(): void {
    if (this.playerSpawnTimer) {
      this.playerSpawnTimer.destroy();
    }
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.destroy();
    }
  }

  setPlayerSpawnInterval(interval: number): void {
    this.playerSpawnInterval = interval;
    if (this.playerSpawnTimer) {
      this.playerSpawnTimer.destroy();
    }
    this.playerSpawnTimer = this.scene.time.addEvent({
      delay: this.playerSpawnInterval,
      callback: () => this.spawnPlayerUnit(),
      loop: true,
    });
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
