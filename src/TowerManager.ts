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
  }

  placeTower(gridX: number, gridY: number, towerType: TowerType): boolean {
    if (!this.gameManager.canPlaceTower()) {
      console.log(
        "Cannot place tower: game state does not allow tower placement"
      );
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
      if (target && tower.isInRange(target.x, target.y)) {
        tower.attack(target);
      }
    });
  }

  private setupTowerDragHandlers(tower: BaseTower): void {
    let isDragging = false;

    tower.sprite.on("dragstart", () => {
      isDragging = true;
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
        )
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

      // 마우스 포인터 위치를 기준으로 그리드 좌표 계산
      if (pointer?.worldX && pointer?.worldY) {
        const pointerGridPos = this.gridSystem.worldToGrid(
          pointer?.worldX,
          pointer.worldY
        );

        // 포인터 위치가 유효한지 확인
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
          )
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
}
