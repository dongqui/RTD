import { WaveConfig, WaveConfigManager } from "./WaveConfig";
import { SpawnManager } from "./SpawnManager";
import { MonsterManager } from "./MonsterManager";

export enum WaveState {
  PREPARING = "preparing",
  ACTIVE = "active",
  COMPLETED = "completed",
  REWARD = "reward",
}

export class WaveManager {
  private static instance: WaveManager | null = null;

  private scene: Phaser.Scene | null = null;
  private spawnManager: SpawnManager | null = null;
  private monsterManager: MonsterManager | null = null;

  private currentWave: number = 0;
  private totalWaves: number;
  private waveState: WaveState = WaveState.PREPARING;

  private monstersSpawnedThisWave: number = 0;
  private monstersKilledThisWave: number = 0;
  private allMonstersSpawned: boolean = false;

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
    spawnManager: SpawnManager,
    monsterManager: MonsterManager
  ): void {
    this.scene = scene;
    this.spawnManager = spawnManager;
    this.monsterManager = monsterManager;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.scene) return;

    this.scene.events.on("monster-manager-killed", () => {
      this.onMonsterKilled();
    });

    this.scene.events.on("wave-spawn-completed", () => {
      this.allMonstersSpawned = true;
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
    this.monstersSpawnedThisWave = 0;
    this.monstersKilledThisWave = 0;
    this.allMonstersSpawned = false;

    this.scene.events.emit("wave-started", this.currentWave, config);

    this.spawnManager.startWave(config);
  }

  onMonsterSpawned(): void {
    this.monstersSpawnedThisWave++;
  }

  private onMonsterKilled(): void {
    if (this.waveState !== WaveState.ACTIVE) return;

    this.monstersKilledThisWave++;
  }

  onWaveCompleted(): void {
    if (!this.scene) return;

    this.waveState = WaveState.COMPLETED;
    console.log(
      `Wave ${this.currentWave} completed! Killed: ${this.monstersKilledThisWave}`
    );

    this.scene.events.emit(
      "wave-completed",
      this.currentWave,
      this.monstersKilledThisWave
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

    console.log("All waves completed! Victory!");
    this.scene.events.emit("all-waves-completed");
  }

  onWaveFailed(): void {
    if (!this.scene) return;

    console.log(`Wave ${this.currentWave} failed!`);
    this.scene.events.emit("wave-failed", this.currentWave);
  }

  reset(): void {
    this.currentWave = 0;
    this.waveState = WaveState.PREPARING;
    this.monstersSpawnedThisWave = 0;
    this.monstersKilledThisWave = 0;
    this.allMonstersSpawned = false;
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

  getMonstersSpawned(): number {
    return this.monstersSpawnedThisWave;
  }

  getMonstersKilled(): number {
    return this.monstersKilledThisWave;
  }

  getMonstersRemaining(): number {
    if (!this.monsterManager) return 0;
    return this.monsterManager.getAliveMonsters().length;
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
