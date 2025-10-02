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
  private gridSystem: any;
  private towerManager: any;
  private selectedReward: any = null;
  private pendingTowerPlacement: boolean = false;

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
    return this.currentState === GameState.PREPARATION && !this.pendingTowerPlacement;
  }

  startWave(): void {
    if (!this.canStartWave()) return;

    this.currentState = GameState.WAVE_ACTIVE;
    this.updateGridVisibility();
    this.scene.events.emit('wave-started', this.currentWave);
  }

  completeWave(): void {
    if (this.currentState !== GameState.WAVE_ACTIVE) return;

    this.currentState = GameState.WAVE_COMPLETE;
    this.updateGridVisibility();
    this.scene.events.emit('wave-completed', this.currentWave);

    if (this.currentWave >= 15) {
      this.currentState = GameState.GAME_CLEAR;
      this.updateGridVisibility();
      this.scene.events.emit('game-clear');
    } else {
      // 보상 선택 상태로 전환
      this.currentState = GameState.REWARD_SELECTION;
      this.updateGridVisibility();
      this.scene.events.emit('show-rewards', this.currentWave);
    }
  }

  private prepareNextWave(): void {
    this.currentWave++;
    this.currentState = GameState.PREPARATION;
    this.updateGridVisibility();
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

  setGridSystem(gridSystem: any): void {
    this.gridSystem = gridSystem;
  }

  setTowerManager(towerManager: any): void {
    this.towerManager = towerManager;
  }

  selectReward(reward: any): void {
    if (this.currentState !== GameState.REWARD_SELECTION) return;

    this.selectedReward = reward;

    console.log('Reward selected:', reward);
    console.log('Reward type:', reward.type);

    // 타워 보상인 경우 설치 모드로 전환
    if (reward.type === 'tower') {
      this.pendingTowerPlacement = true;
      this.currentState = GameState.PREPARATION;
      this.updateGridVisibility();
      this.scene.events.emit('reward-selected', reward);
      this.scene.events.emit('enter-placement-mode', reward);
      console.log('Entering tower placement mode for:', reward.name);
    }
  }

  completeTowerPlacement(): void {
    console.log('=== completeTowerPlacement called ===');
    console.log('Before: pendingTowerPlacement =', this.pendingTowerPlacement);
    this.pendingTowerPlacement = false;
    this.selectedReward = null;
    console.log('After: pendingTowerPlacement =', this.pendingTowerPlacement);
    console.log('Calling prepareNextWave...');
    this.prepareNextWave();

    // 타워 설치 완료 이벤트 추가
    this.scene.events.emit('tower-placement-completed');
  }

  getSelectedReward(): any {
    return this.selectedReward;
  }

  isPendingTowerPlacement(): boolean {
    return this.pendingTowerPlacement;
  }

  private updateGridVisibility(): void {
    if (!this.gridSystem) return;

    switch (this.currentState) {
      case GameState.PREPARATION:
      case GameState.WAVE_COMPLETE:
        this.gridSystem.showGrid();
        break;
      case GameState.WAVE_ACTIVE:
      case GameState.REWARD_SELECTION:
      case GameState.GAME_OVER:
      case GameState.GAME_CLEAR:
        this.gridSystem.hideGrid();
        break;
    }

    // 타워 드래그 상태도 업데이트
    if (this.towerManager) {
      this.towerManager.updateAllTowersDragState();
    }
  }
}