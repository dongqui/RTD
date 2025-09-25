import { GridSystem } from "./GridSystem";

export abstract class BaseTower {
  public gridX: number;
  public gridY: number;
  public width: number;
  public height: number;
  public damage: number;
  public range: number;
  public attackSpeed: number;
  private lastAttackTime: number = 0;
  protected cost: number;
  protected scene: Phaser.Scene;
  public sprite: Phaser.GameObjects.Sprite;
  protected isAttacking: boolean = false;

  constructor(
    scene: Phaser.Scene,
    gridX: number,
    gridY: number,
    texture: string,
    damage: number,
    range: number,
    attackSpeed: number,
    cost: number,
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
    this.damage = damage;
    this.range = range;
    this.attackSpeed = attackSpeed;
    this.cost = cost;

    this.sprite = this.scene.add
      .sprite(centerX, centerY, texture)
      .setDisplaySize(256 * width, 256 * height)
      .setInteractive({ draggable: true });

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
    this.sprite.on(
      "drag",
      (pointer: Phaser.Input.Pointer, dragX: number, dragY: number) => {
        callback(pointer, dragX, dragY);
      }
    );
  }

  onDragEnd(callback: (pointer: Phaser.Input.Pointer | null) => void) {
    this.sprite.on("dragend", (pointer: Phaser.Input.Pointer) => {
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
      this.sprite.x,
      this.sprite.y,
      targetX,
      targetY
    );
    return distance <= this.range;
  }

  getCost(): number {
    return this.cost;
  }
}
