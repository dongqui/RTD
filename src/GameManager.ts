export enum GameState {
  BATTLE = "battle",
  GAME_OVER = "game_over",
  GAME_CLEAR = "game_clear"
}

export default class GameManager {
  private scene: Phaser.Scene;
  private currentState: GameState;
  private playerBaseHealth: number;
  private enemyBaseHealth: number;
  private gold: number;
  private cameraManager: any;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.currentState = GameState.BATTLE;
    this.playerBaseHealth = 100;
    this.enemyBaseHealth = 100;
    this.gold = 100;
  }

  getCurrentState(): GameState {
    return this.currentState;
  }

  startBattle(): void {
    this.currentState = GameState.BATTLE;
    this.scene.events.emit('battle-started');
  }

  damagePlayerBase(damage: number = 1): void {
    this.playerBaseHealth -= damage;
    this.scene.events.emit('player-base-damaged', this.playerBaseHealth);

    if (this.playerBaseHealth <= 0) {
      this.currentState = GameState.GAME_OVER;
      this.scene.events.emit('game-over');
    }
  }

  damageEnemyBase(damage: number = 1): void {
    this.enemyBaseHealth -= damage;
    this.scene.events.emit('enemy-base-damaged', this.enemyBaseHealth);

    if (this.enemyBaseHealth <= 0) {
      this.currentState = GameState.GAME_CLEAR;
      this.scene.events.emit('game-clear');
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

  getPlayerBaseHealth(): number {
    return this.playerBaseHealth;
  }

  getEnemyBaseHealth(): number {
    return this.enemyBaseHealth;
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
