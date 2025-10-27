import Base from "./Base";

export enum GameState {
  BATTLE = "battle",
  GAME_OVER = "game_over",
  GAME_CLEAR = "game_clear"
}

export default class GameManager {
  private scene: Phaser.Scene;
  private currentState: GameState;
  private gold: number;
  private cameraManager: any;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.currentState = GameState.BATTLE;
    this.gold = 100;
  }

  getCurrentState(): GameState {
    return this.currentState;
  }

  startBattle(): void {
    this.currentState = GameState.BATTLE;
    this.scene.events.emit('battle-started');
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
    const playerBase = this.scene.data.get("playerBase") as Base;
    return playerBase ? playerBase.getCurrentHealth() : 0;
  }

  getEnemyBaseHealth(): number {
    const enemyBase = this.scene.data.get("enemyBase") as Base;
    return enemyBase ? enemyBase.getCurrentHealth() : 0;
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

  reset(): void {
    this.gold = 100;
    this.currentState = GameState.BATTLE;

    const playerBase = this.scene.data.get("playerBase") as Base;
    const enemyBase = this.scene.data.get("enemyBase") as Base;

    if (playerBase) {
      playerBase.reset();
    }

    if (enemyBase) {
      enemyBase.reset();
    }

    this.scene.events.emit('gold-changed', this.gold);
  }
}
