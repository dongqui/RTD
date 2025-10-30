import GameManager from "./GameManager";
import { UnitManager, UnitType } from "./UnitManager";
import { MonsterManager } from "./MonsterManager";
import { WaveConfig, SpawnGroup } from "./WaveConfig";

export class SpawnManager {
  private scene: Phaser.Scene;
  private gameManager: GameManager;
  private unitManager: UnitManager;
  private monsterManager: MonsterManager;

  private enemySpawnX: number;
  private spawnY: number;

  private enemySpawnInterval: number = 2000;

  private enemySpawnTimer: Phaser.Time.TimerEvent | null = null;

  private currentWaveConfig: WaveConfig | null = null;
  private currentGroupIndex: number = 0;
  private currentGroupSpawnCount: number = 0;
  private isSpawning: boolean = false;

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

    this.enemySpawnX = this.scene.cameras.main.width + 20;
    this.spawnY = this.scene.cameras.main.height / 2;
  }

  private setupAutoSpawn(): void {
    this.enemySpawnTimer = this.scene.time.addEvent({
      delay: this.enemySpawnInterval,
      callback: () => this.spawnEnemyMonster(),
      loop: true,
    });
  }

  private spawnEnemyMonster(): void {
    const randomYOffset = Phaser.Math.Between(-100, 100);
    const spawnY = this.spawnY + randomYOffset;
    this.monsterManager.spawnMonster("basic", this.enemySpawnX, spawnY);
  }

  startWave(config: WaveConfig): void {
    this.stop();

    this.currentWaveConfig = config;
    this.currentGroupIndex = 0;
    this.currentGroupSpawnCount = 0;
    this.isSpawning = true;

    this.spawnNextGroup();
  }

  private spawnNextGroup(): void {
    if (!this.currentWaveConfig || !this.isSpawning) return;

    if (this.currentGroupIndex >= this.currentWaveConfig.spawnGroups.length) {
      this.onAllGroupsSpawned();
      return;
    }

    const group = this.currentWaveConfig.spawnGroups[this.currentGroupIndex];

    if (group.delay && group.delay > 0) {
      this.scene.time.delayedCall(group.delay, () => {
        this.startSpawningGroup(group);
      });
    } else {
      this.startSpawningGroup(group);
    }
  }

  private startSpawningGroup(group: SpawnGroup): void {
    this.currentGroupSpawnCount = 0;

    this.enemySpawnTimer = this.scene.time.addEvent({
      delay: group.interval,
      callback: () => this.spawnMonsterFromGroup(group),
      repeat: group.count - 1,
    });
  }

  private spawnMonsterFromGroup(group: SpawnGroup): void {
    const randomYOffset = Phaser.Math.Between(-100, 100);
    const spawnY = this.spawnY + randomYOffset;

    const monster = this.monsterManager.spawnMonster(
      group.monsterType,
      this.enemySpawnX,
      spawnY
    );

    if (monster) {
      if (group.healthMultiplier !== 1.0) {
        monster.setHealthMultiplier(group.healthMultiplier);
      }

      if (group.speedMultiplier && group.speedMultiplier !== 1.0) {
        monster.setSpeedMultiplier(group.speedMultiplier);
      }

      if (group.rewardMultiplier && group.rewardMultiplier !== 1.0) {
        monster.setRewardMultiplier(group.rewardMultiplier);
      }

      this.scene.events.emit("wave-monster-spawned");
    }

    this.currentGroupSpawnCount++;

    if (this.currentGroupSpawnCount >= group.count) {
      this.currentGroupIndex++;
      this.scene.time.delayedCall(500, () => {
        this.spawnNextGroup();
      });
    }
  }

  private onAllGroupsSpawned(): void {
    this.isSpawning = false;
    this.stop();
    console.log("All spawn groups completed for this wave");
    this.scene.events.emit("wave-spawn-completed");
  }

  start(): void {
    this.setupAutoSpawn();
  }

  stop(): void {
    if (this.enemySpawnTimer) {
      this.enemySpawnTimer.destroy();
      this.enemySpawnTimer = null;
    }
    this.isSpawning = false;
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

  isCurrentlySpawning(): boolean {
    return this.isSpawning;
  }
}
