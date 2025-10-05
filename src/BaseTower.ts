import { GridSystem } from "./GridSystem";
import { TowerType } from "./TowerManager";
import { SpineGameObject } from "@esotericsoftware/spine-phaser-v3";

export abstract class BaseTower {
  public gridX: number;
  public gridY: number;
  public width: number;
  public height: number;
  public damage: number;
  public range: number;
  public attackSpeed: number;
  public level: number;
  public towerType: TowerType;
  private lastAttackTime: number = 0;
  protected cost: number;
  protected scene: Phaser.Scene;
  public spineObject: SpineGameObject;
  protected isAttacking: boolean = false;
  protected baseDamage: number;
  protected baseRange: number;
  protected baseAttackSpeed: number;

  constructor(
    scene: Phaser.Scene,
    gridX: number,
    gridY: number,
    towerType: TowerType,
    damage: number,
    range: number,
    attackSpeed: number,
    cost: number,
    level: number = 1,
    width: number = 1,
    height: number = 1
  ) {
    // 그리드 좌표를 월드 좌표로 변환
    const centerGridX = gridX + (width - 1) / 2;
    const centerGridY = gridY + (height - 1) / 2;
    const worldPos = GridSystem.gridToWorldStatic(centerGridX, centerGridY);
    const centerX = worldPos.x;
    const centerY = worldPos.y;

    this.scene = scene;
    this.gridX = gridX;
    this.gridY = gridY;
    this.width = width;
    this.height = height;
    this.towerType = towerType;
    this.level = level;
    this.baseDamage = damage;
    this.baseRange = range;
    this.baseAttackSpeed = attackSpeed;
    this.damage = damage;
    this.range = range;
    this.attackSpeed = attackSpeed;
    this.cost = cost;

    this.applyLevelStats();

    this.spineObject = this.scene.add.spine(
      centerX,
      centerY,
      "fantasy_character",
      "fantasy_character-atlas"
    );
    this.spineObject.setInteractive({ draggable: true });

    this.setupAnimations();
  }

  protected abstract setupAnimations(): void;
  onDrag(
    callback: (
      pointer: Phaser.Input.Pointer | null,
      dragX: number,
      dragY: number
    ) => void
  ) {
    this.spineObject.on(
      "drag",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        callback(pointer, dragX, dragY);
      }
    );
  }

  onDragEnd(callback: (pointer: Phaser.Input.Pointer | null) => void) {
    this.spineObject.on("dragend", (pointer: Phaser.Input.Pointer) => {
      callback(pointer);
    });
  }

  canAttack(): boolean {
    const currentTime = this.scene.time.now;
    return currentTime - this.lastAttackTime >= this.attackSpeed;
  }

  attack(target: Phaser.GameObjects.GameObject): void {
    if (!this.canAttack() || this.isAttacking) return;

    this.lastAttackTime = this.scene.time.now;
    this.playAttackAnimation();
    this.performAttack(target);
  }

  protected abstract playAttackAnimation(): void;
  protected abstract performAttack(target: Phaser.GameObjects.GameObject): void;

  isInRange(targetX: number, targetY: number): boolean {
    const distance = Phaser.Math.Distance.Between(
      this.spineObject.x,
      this.spineObject.y,
      targetX,
      targetY
    );
    return distance <= this.range;
  }

  getCost(): number {
    return this.cost;
  }

  canMergeWith(other: BaseTower): boolean {
    return (
      this.towerType === other.towerType &&
      this.level === other.level &&
      this.level < 4
    );
  }

  levelUp(): void {
    if (this.level >= 4) {
      return;
    }
    this.level++;
    this.applyLevelStats();
    this.updateVisualForLevel();
  }

  private applyLevelStats(): void {
    const levelMultiplier = 1 + (this.level - 1) * 0.5;
    this.damage = Math.floor(this.baseDamage * levelMultiplier);
    this.range = Math.floor(this.baseRange * (1 + (this.level - 1) * 0.2));
    this.attackSpeed = Math.max(
      100,
      Math.floor(this.baseAttackSpeed * (1 - (this.level - 1) * 0.1))
    );
  }

  protected abstract updateVisualForLevel(): void;
}
