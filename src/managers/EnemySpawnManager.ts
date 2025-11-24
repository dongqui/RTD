import GameManager from "./GameManager";
import { HeroManager, HeroType } from "./HeroManager";
import { EnemyManager } from "./EnemyManager";
import { WaveConfig, SpawnGroup } from "../WaveConfig";

export class EnemySpawnManager {
  private scene: Phaser.Scene;
  private gameManager: GameManager;
  private heroManager: HeroManager;
  private enemyManager: EnemyManager;

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
    heroManager: HeroManager,
    enemyManager: EnemyManager
  ) {
    this.scene = scene;
    this.gameManager = gameManager;
    this.heroManager = heroManager;
    this.enemyManager = enemyManager;

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
    this.enemyManager.spawnEnemy("enemy_warrior", this.enemySpawnX, spawnY);
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
      callback: () => this.spawnEnemyFromGroup(group),
      repeat: group.count - 1,
    });
  }

  private spawnEnemyFromGroup(group: SpawnGroup): void {
    const randomYOffset = Phaser.Math.Between(-150, 150);
    const spawnY = this.spawnY + randomYOffset;

    const enemy = this.enemyManager.spawnEnemy(
      group.enemyType as any,
      this.enemySpawnX,
      spawnY
    );

    if (enemy) {
      if (group.healthMultiplier !== 1.0) {
        enemy.setHealthMultiplier(group.healthMultiplier);
      }

      if (group.speedMultiplier && group.speedMultiplier !== 1.0) {
        enemy.setSpeedMultiplier(group.speedMultiplier);
      }

      if (group.rewardMultiplier && group.rewardMultiplier !== 1.0) {
        enemy.setRewardMultiplier(group.rewardMultiplier);
      }

      this.scene.events.emit("wave-enemy-spawned");
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
