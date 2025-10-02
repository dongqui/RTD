import { BaseTower } from "./BaseTower";
import { GridSystem } from "./GridSystem";
import { ArrowTower } from "./towers/ArrowTower";
import { CannonTower } from "./towers/CannonTower";
import { FrostTower } from "./towers/FrostTower";
import GameManager from "./GameManager";
import { MonsterManager } from "./MonsterManager";

export type TowerType = "arrow" | "cannon" | "frost";

export class TowerManager {
  private towers: BaseTower[] = [];
  private gridSystem: GridSystem;
  private scene: Phaser.Scene;
  private gameManager: GameManager;
  private monsterManager: MonsterManager;
  private placementMode: boolean = false;
  private placementTowerType: TowerType | null = null;

  constructor(
    scene: Phaser.Scene,
    gridSystem: GridSystem,
    gameManager: GameManager,
    monsterManager: MonsterManager
  ) {
    this.scene = scene;
    this.gridSystem = gridSystem;
    this.gameManager = gameManager;
    this.monsterManager = monsterManager;

    this.setupPlacementModeEvents();
  }

  placeTower(gridX: number, gridY: number, towerType: TowerType): boolean {
    if (!this.gameManager.canPlaceTower()) {
      console.log(
        "Cannot place tower: game state does not allow tower placement"
      );
      return false;
    }

    // 위치 유효성 및 점유 상태 확인
    if (!this.gridSystem.isValidPosition(gridX, gridY)) {
      console.log(`Invalid position: (${gridX}, ${gridY})`);
      return false;
    }

    if (this.gridSystem.isTileOccupied(gridX, gridY)) {
      console.log(`Position already occupied: (${gridX}, ${gridY})`);
      return false;
    }

    if (this.getTowerAt(gridX, gridY)) {
      console.log(`Tower already exists at: (${gridX}, ${gridY})`);
      return false;
    }

    // 킹과 겹치는지 확인
    if (this.isOverlappingWithKing(gridX, gridY)) {
      console.log(`Cannot place tower: overlaps with king at (${gridX}, ${gridY})`);
      return false;
    }

    const tower = this.createTower(gridX, gridY, towerType);
    if (!tower) {
      return false;
    }

    this.setupTowerDragHandlers(tower);
    this.towers.push(tower);

    // 타워가 점유하는 영역을 그리드에 설정
    this.gridSystem.setAreaOccupied(
      tower.gridX,
      tower.gridY,
      tower.width,
      tower.height,
      true
    );

    return true;
  }

  removeTower(gridX: number, gridY: number): boolean {
    const tower = this.getTowerAt(gridX, gridY);
    if (!tower) {
      return false;
    }

    const towerIndex = this.towers.indexOf(tower);

    this.towers.splice(towerIndex, 1);
    this.gridSystem.setAreaOccupied(
      tower.gridX,
      tower.gridY,
      tower.width,
      tower.height,
      false
    );
    return true;
  }

  getTowerAt(gridX: number, gridY: number): BaseTower | null {
    return (
      this.towers.find((tower) => {
        return (
          gridX >= tower.gridX &&
          gridX < tower.gridX + tower.width &&
          gridY >= tower.gridY &&
          gridY < tower.gridY + tower.height
        );
      }) || null
    );
  }

  getAllTowers(): BaseTower[] {
    return [...this.towers];
  }

  update(): void {
    this.towers.forEach((tower) => {
      const target = this.monsterManager.findNearestMonster(
        tower.sprite.x,
        tower.sprite.y,
        tower.range
      );
      if (target) {
        const distance = Phaser.Math.Distance.Between(
          tower.sprite.x, tower.sprite.y,
          target.sprite.x, target.sprite.y
        );
        console.log(`Tower at (${tower.sprite.x}, ${tower.sprite.y}), Target at (${target.sprite.x}, ${target.sprite.y}), Distance: ${distance}, Range: ${tower.range}`);

        if (tower.isInRange(target.sprite.x, target.sprite.y)) {
          console.log(`Attacking!`);
          tower.attack(target);
        }
      }
    });
  }

  private setupTowerDragHandlers(tower: BaseTower): void {
    let isDragging = false;

    // 타워는 항상 드래그 가능 상태로 생성됨 (dragstart에서 상태 체크)

    tower.sprite.on("dragstart", (pointer: Phaser.Input.Pointer, gameObject: Phaser.GameObjects.GameObject) => {
      // 타워 배치 가능한 상태인지 확인
      if (!this.gameManager.canPlaceTower()) {
        console.log("Tower dragging not allowed in current game state");
        // 드래그를 즉시 중단
        tower.sprite.input!.enabled = false;
        tower.sprite.input!.enabled = true;
        return;
      }

      isDragging = true;

      // 카메라 드래그 차단
      const cameraManager = this.gameManager.getCameraManager();
      if (cameraManager) {
        cameraManager.blockDrag();
      }

      // 드래그 시작 시 현재 타워가 점유하던 영역을 해제
      this.gridSystem.setAreaOccupied(
        tower.gridX,
        tower.gridY,
        tower.width,
        tower.height,
        false
      );
    });

    tower.onDrag((pointer, dragX, dragY) => {
      const gridPos = this.gridSystem.worldToGrid(dragX, dragY);

      this.gridSystem.clearHighlights();

      const dragTargetTower = this.getTowerAt(gridPos.x, gridPos.y);

      if (
        this.gridSystem.isValidArea(
          gridPos.x,
          gridPos.y,
          tower.width,
          tower.height
        ) &&
        !this.gridSystem.isAreaOccupied(
          gridPos.x,
          gridPos.y,
          tower.width,
          tower.height
        ) &&
        (!dragTargetTower || dragTargetTower === tower) && // 자기 자신이거나 다른 타워가 없어야 함
        !this.isOverlappingWithKing(gridPos.x, gridPos.y) // 킹과 겹치지 않아야 함
      ) {
        this.gridSystem.highlightAreaValidPlacement(
          gridPos.x,
          gridPos.y,
          tower.width,
          tower.height
        );
      } else {
        this.gridSystem.highlightAreaInvalidPlacement(
          gridPos.x,
          gridPos.y,
          tower.width,
          tower.height
        );
      }

      tower.sprite.setPosition(dragX, dragY);
    });

    tower.onDragEnd((pointer) => {
      this.gridSystem.clearHighlights();
      isDragging = false;

      // 카메라 드래그 차단 해제
      const cameraManager = this.gameManager.getCameraManager();
      if (cameraManager) {
        cameraManager.unblockDrag();
      }

      // 마우스 포인터 위치를 기준으로 그리드 좌표 계산
      if (pointer?.worldX && pointer?.worldY) {
        const pointerGridPos = this.gridSystem.worldToGrid(
          pointer?.worldX,
          pointer.worldY
        );

        // 포인터 위치가 유효한지 확인
        const targetTower = this.getTowerAt(pointerGridPos.x, pointerGridPos.y);

        if (
          this.gridSystem.isValidArea(
            pointerGridPos.x,
            pointerGridPos.y,
            tower.width,
            tower.height
          ) &&
          !this.gridSystem.isAreaOccupied(
            pointerGridPos.x,
            pointerGridPos.y,
            tower.width,
            tower.height
          ) &&
          (!targetTower || targetTower === tower) && // 자기 자신이거나 다른 타워가 없어야 함
          !this.isOverlappingWithKing(pointerGridPos.x, pointerGridPos.y) // 킹과 겹치지 않아야 함
        ) {
          // 유효한 위치면 새 위치로 이동
          const worldPos = this.gridSystem.gridToWorld(
            pointerGridPos.x,
            pointerGridPos.y
          );
          tower.sprite.setPosition(worldPos.x, worldPos.y);
          tower.gridX = pointerGridPos.x;
          tower.gridY = pointerGridPos.y;

          // 새 위치를 점유 상태로 설정
          this.gridSystem.setAreaOccupied(
            tower.gridX,
            tower.gridY,
            tower.width,
            tower.height,
            true
          );
        } else {
          // 유효하지 않은 위치면 원래 위치로 되돌림
          const originalWorldPos = this.gridSystem.gridToWorld(
            tower.gridX,
            tower.gridY
          );
          tower.sprite.setPosition(originalWorldPos.x, originalWorldPos.y);

          // 원래 위치를 다시 점유 상태로 설정
          this.gridSystem.setAreaOccupied(
            tower.gridX,
            tower.gridY,
            tower.width,
            tower.height,
            true
          );
        }
      }
    });
  }

  private createTower(
    gridX: number,
    gridY: number,
    towerType: TowerType
  ): BaseTower | null {
    switch (towerType) {
      case "arrow":
        return new ArrowTower(this.scene, gridX, gridY);
      case "cannon":
        return new CannonTower(this.scene, gridX, gridY);
      case "frost":
        return new FrostTower(this.scene, gridX, gridY);
      default:
        return null;
    }
  }

  private setupPlacementModeEvents(): void {
    this.scene.events.on('enter-placement-mode', (reward: any) => {
      this.autoPlaceTowerNearKing(reward.towerType);
    });
  }

  enterPlacementMode(towerType: TowerType): void {
    this.placementMode = true;
    this.placementTowerType = towerType;

    // 그리드 클릭 이벤트 설정
    this.scene.input.on('pointerdown', this.handlePlacementClick, this);

    console.log(`Placement mode activated for ${towerType} tower`);
  }

  private handlePlacementClick = (pointer: Phaser.Input.Pointer) => {
    if (!this.placementMode || !this.placementTowerType) return;

    const worldPos = this.scene.cameras.main.getWorldPoint(pointer.x, pointer.y);
    const gridPos = this.gridSystem.worldToGrid(worldPos.x, worldPos.y);

    // 유효한 위치인지 확인
    if (this.gridSystem.isValidPosition(gridPos.x, gridPos.y) &&
        !this.gridSystem.isTileOccupied(gridPos.x, gridPos.y)) {

      // 타워 배치
      const success = this.placeTower(gridPos.x, gridPos.y, this.placementTowerType);

      if (success) {
        this.exitPlacementMode();
        this.gameManager.completeTowerPlacement();
      }
    }
  };

  exitPlacementMode(): void {
    this.placementMode = false;
    this.placementTowerType = null;

    // 클릭 이벤트 제거
    this.scene.input.off('pointerdown', this.handlePlacementClick, this);

    console.log('Placement mode deactivated');
  }

  isInPlacementMode(): boolean {
    return this.placementMode;
  }

  autoPlaceTowerNearKing(towerType: TowerType): void {
    const kingGridX = 15; // 킹의 그리드 위치 (31x31 그리드의 중앙)
    const kingGridY = 15;

    console.log(`Auto-placing ${towerType} tower near king at (${kingGridX}, ${kingGridY})`);

    // 킹 주변에서 빈 공간 찾기 (거리순으로 정렬)
    const possiblePositions = [];

    // 킹 주변 3x3 영역부터 확장해서 찾기
    for (let radius = 1; radius <= 5; radius++) {
      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          // 킹의 1x1 영역은 제외
          if (dx === 0 && dy === 0) continue;

          const gridX = kingGridX + dx;
          const gridY = kingGridY + dy;

          if (this.gridSystem.isValidPosition(gridX, gridY) &&
              !this.gridSystem.isTileOccupied(gridX, gridY) &&
              !this.getTowerAt(gridX, gridY) &&
              !this.isOverlappingWithKing(gridX, gridY)) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            possiblePositions.push({ gridX, gridY, distance });
          }
        }
      }

      // 이 radius에서 위치를 찾았다면 더 이상 확장하지 않음
      if (possiblePositions.length > 0) break;
    }

    if (possiblePositions.length === 0) {
      console.log('No available positions near king for tower placement');
      this.gameManager.completeTowerPlacement();
      return;
    }

    // 가장 가까운 위치 선택
    possiblePositions.sort((a, b) => a.distance - b.distance);
    const selectedPos = possiblePositions[0];

    console.log(`Selected position: (${selectedPos.gridX}, ${selectedPos.gridY})`);

    // 타워 설치
    const success = this.placeTower(selectedPos.gridX, selectedPos.gridY, towerType);

    if (success) {
      this.playPlacementEffect(selectedPos.gridX, selectedPos.gridY);
      console.log(`Successfully placed ${towerType} tower at (${selectedPos.gridX}, ${selectedPos.gridY})`);
    }

    this.gameManager.completeTowerPlacement();
  }

  private playPlacementEffect(gridX: number, gridY: number): void {
    const worldPos = this.gridSystem.gridToWorld(gridX, gridY);

    // fire.png 이펙트 생성
    const fireEffect = this.scene.add.image(worldPos.x, worldPos.y, 'fire');
    fireEffect.setScale(2);
    fireEffect.setDepth(1000);

    // 이펙트 애니메이션
    this.scene.tweens.add({
      targets: fireEffect,
      scale: { from: 0.5, to: 3 },
      alpha: { from: 1, to: 0 },
      duration: 800,
      ease: 'Power2.easeOut',
      onComplete: () => {
        fireEffect.destroy();
      }
    });

    console.log(`Playing fire effect at (${worldPos.x}, ${worldPos.y})`);
  }

  updateAllTowersDragState(): void {
    console.log(`Updating drag state for ${this.towers.length} towers. Can place: ${this.gameManager.canPlaceTower()}`);
    // 모든 타워의 드래그는 항상 활성화되어 있고, dragstart에서 상태를 체크함
    // 별도의 처리가 필요 없음
  }

  private isOverlappingWithKing(gridX: number, gridY: number): boolean {
    const kingGridX = 15;
    const kingGridY = 15;
    const kingWidth = 1;
    const kingHeight = 1;

    return (gridX >= kingGridX && gridX < kingGridX + kingWidth &&
            gridY >= kingGridY && gridY < kingGridY + kingHeight);
  }
}
