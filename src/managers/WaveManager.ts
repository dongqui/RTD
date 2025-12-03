import { WaveConfig, WaveConfigManager } from "../WaveConfig";
import { EnemySpawnManager } from "./EnemySpawnManager";
import { EnemyManager } from "./EnemyManager";

export enum WaveState {
  PREPARING = "preparing",
  ACTIVE = "active",
  COMPLETED = "completed",
  REWARD = "reward",
}

export class WaveManager {
  private static instance: WaveManager | null = null;

  private scene: Phaser.Scene | null = null;
  private spawnManager: EnemySpawnManager | null = null;
  private enemyManager: EnemyManager | null = null;

  private currentWave: number = 0;
  private totalWaves: number;
  private waveState: WaveState = WaveState.PREPARING;

  private enemiesSpawnedThisWave: number = 0;
  private enemiesKilledThisWave: number = 0;
  private allEnemiesSpawned: boolean = false;

  private constructor() {
    this.totalWaves = WaveConfigManager.getTotalWaves();
  }

  static getInstance(): WaveManager {
    if (!WaveManager.instance) {
      WaveManager.instance = new WaveManager();
    }
    return WaveManager.instance;
  }

  initialize(
    scene: Phaser.Scene,
    spawnManager: EnemySpawnManager,
    enemyManager: EnemyManager
  ): void {
    this.scene = scene;
    this.spawnManager = spawnManager;
    this.enemyManager = enemyManager;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.scene) return;

    this.scene.events.on("enemy-manager-killed", () => {
      this.onEnemyKilled();
    });

    this.scene.events.on("wave-spawn-completed", () => {
      this.allEnemiesSpawned = true;
    });
  }

  startWave(waveNumber?: number): void {
    if (!this.scene || !this.spawnManager) {
      console.error("WaveManager not initialized!");
      return;
    }

    if (waveNumber !== undefined) {
      this.currentWave = waveNumber;
    } else {
      this.currentWave++;
    }

    if (this.currentWave > this.totalWaves) {
      this.onAllWavesCompleted();
      return;
    }

    const config = WaveConfigManager.getWaveConfig(this.currentWave);
    if (!config) {
      console.error(`Wave ${this.currentWave} config not found!`);
      return;
    }

    this.waveState = WaveState.ACTIVE;
    this.enemiesSpawnedThisWave = 0;
    this.enemiesKilledThisWave = 0;
    this.allEnemiesSpawned = false;

    this.scene.events.emit("wave-started", this.currentWave, config);

    this.spawnManager.startWave(config);
  }

  onEnemySpawned(): void {
    this.enemiesSpawnedThisWave++;
  }

  private onEnemyKilled(): void {
    if (this.waveState !== WaveState.ACTIVE) return;

    this.enemiesKilledThisWave++;
  }

  onWaveCompleted(): void {
    if (!this.scene) return;

    this.waveState = WaveState.COMPLETED;

    this.scene.events.emit(
      "wave-completed",
      this.currentWave,
      this.enemiesKilledThisWave
    );

    if (this.currentWave >= this.totalWaves) {
      this.onAllWavesCompleted();
    } else {
      this.waveState = WaveState.REWARD;
    }
  }

  onRewardSelected(): void {
    if (!this.scene) return;

    this.waveState = WaveState.PREPARING;
    this.scene.events.emit("wave-reward-completed", this.currentWave);
  }

  private onAllWavesCompleted(): void {
    if (!this.scene) return;

    this.scene.events.emit("all-waves-completed");
  }

  onWaveFailed(): void {
    if (!this.scene) return;

    this.scene.events.emit("wave-failed", this.currentWave);
  }

  reset(): void {
    this.currentWave = 0;
    this.waveState = WaveState.PREPARING;
    this.enemiesSpawnedThisWave = 0;
    this.enemiesKilledThisWave = 0;
    this.allEnemiesSpawned = false;
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  getTotalWaves(): number {
    return this.totalWaves;
  }

  getWaveState(): WaveState {
    return this.waveState;
  }

  getEnemiesSpawned(): number {
    return this.enemiesSpawnedThisWave;
  }

  getEnemiesKilled(): number {
    return this.enemiesKilledThisWave;
  }

  getEnemiesRemaining(): number {
    if (!this.enemyManager) return 0;
    return this.enemyManager.getAliveEnemies().length;
  }

  isWaveActive(): boolean {
    return this.waveState === WaveState.ACTIVE;
  }

  isWaitingForReward(): boolean {
    return this.waveState === WaveState.REWARD;
  }

  isPreparing(): boolean {
    return this.waveState === WaveState.PREPARING;
  }
}
