export enum GameState {
  PREPARATION = "preparation",
  WAVE_ACTIVE = "wave_active",
  WAVE_COMPLETE = "wave_complete",
  REWARD_SELECTION = "reward_selection",
  GAME_OVER = "game_over",
  GAME_CLEAR = "game_clear"
}

export default class GameManager {
  private scene: Phaser.Scene;
  private currentState: GameState;
  private currentWave: number;
  private coreHealth: number;
  private gold: number;
  private cameraManager: any;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.currentState = GameState.PREPARATION;
    this.currentWave = 1;
    this.coreHealth = 20;
    this.gold = 100;
  }

  getCurrentState(): GameState {
    return this.currentState;
  }

  canPlaceTower(): boolean {
    return this.currentState === GameState.PREPARATION ||
           this.currentState === GameState.WAVE_COMPLETE;
  }

  canStartWave(): boolean {
    return this.currentState === GameState.PREPARATION;
  }

  startWave(): void {
    if (!this.canStartWave()) return;

    this.currentState = GameState.WAVE_ACTIVE;
    this.scene.events.emit('wave-started', this.currentWave);
  }

  completeWave(): void {
    if (this.currentState !== GameState.WAVE_ACTIVE) return;

    this.currentState = GameState.WAVE_COMPLETE;
    this.scene.events.emit('wave-completed', this.currentWave);

    if (this.currentWave >= 15) {
      this.currentState = GameState.GAME_CLEAR;
      this.scene.events.emit('game-clear');
    } else {
      this.prepareNextWave();
    }
  }

  private prepareNextWave(): void {
    this.currentWave++;
    this.currentState = GameState.PREPARATION;
    this.scene.events.emit('wave-prepared', this.currentWave);
  }

  takeDamage(damage: number = 1): void {
    this.coreHealth -= damage;
    this.scene.events.emit('core-damage', this.coreHealth);

    if (this.coreHealth <= 0) {
      this.currentState = GameState.GAME_OVER;
      this.scene.events.emit('game-over');
    }
  }

  addGold(amount: number): void {
    this.gold += amount;
    this.scene.events.emit('gold-changed', this.gold);
  }

  spendGold(amount: number): boolean {
    if (this.gold >= amount) {
      this.gold -= amount;
      this.scene.events.emit('gold-changed', this.gold);
      return true;
    }
    return false;
  }

  getCurrentWave(): number {
    return this.currentWave;
  }

  getCoreHealth(): number {
    return this.coreHealth;
  }

  getGold(): number {
    return this.gold;
  }

  setCameraManager(cameraManager: any): void {
    this.cameraManager = cameraManager;
  }

  getCameraManager(): any {
    return this.cameraManager;
  }
}