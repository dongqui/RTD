import { GridSystem } from "../GridSystem";

export interface MonsterConfig {
  health: number;
  speed: number;
  reward: number;
  textureKey: string;
  scale?: number;
}

export enum MonsterState {
  MOVING = "moving",
  ATTACKING = "attacking",
  DEAD = "dead",
}

export abstract class BaseMonster {
  protected maxHealth: number;
  protected currentHealth: number;
  protected speed: number;
  protected reward: number;
  protected state: MonsterState;
  protected scene: Phaser.Scene;
  public sprite: Phaser.GameObjects.Sprite;

  protected currentPath: Array<{ x: number; y: number }>;
  protected currentPathIndex: number;
  protected targetPosition: { x: number; y: number };
  protected isMoving: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: MonsterConfig
  ) {
    this.scene = scene;
    this.maxHealth = config.health;
    this.currentHealth = config.health;
    this.speed = config.speed;
    this.reward = config.reward;
    this.state = MonsterState.MOVING;

    this.currentPath = [];
    this.currentPathIndex = 0;
    this.isMoving = false;

    // Sprite 생성 및 설정
    this.sprite = this.scene.add
      .sprite(x, y, config.textureKey)
      .setDisplaySize(256, 256);
  }

  setPath(path: Array<{ x: number; y: number }>): void {
    this.currentPath = [...path];
    this.currentPathIndex = 0;
    if (this.currentPath.length > 0) {
      this.startMoving();
    }
  }

  private startMoving(): void {
    if (this.currentPathIndex >= this.currentPath.length) {
      this.reachCore();
      return;
    }

    const nextGridPos = this.currentPath[this.currentPathIndex];
    const worldPos = GridSystem.gridToWorldStatic(
      nextGridPos.x,
      nextGridPos.y,
      80
    );

    this.targetPosition = worldPos;
    this.isMoving = true;
    this.currentPathIndex++;
  }

  update(_time: number, delta: number): void {
    if (this.state === MonsterState.DEAD) return;

    if (this.isMoving && this.targetPosition) {
      this.moveTowardsTarget(delta);
    }
  }

  private moveTowardsTarget(delta: number): void {
    const dx = this.targetPosition.x - this.sprite.x;
    const dy = this.targetPosition.y - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 2) {
      this.sprite.x = this.targetPosition.x;
      this.sprite.y = this.targetPosition.y;
      this.isMoving = false;
      this.startMoving();
    } else {
      const moveDistance = (this.speed * delta) / 1000;
      this.sprite.x += (dx / distance) * moveDistance;
      this.sprite.y += (dy / distance) * moveDistance;
    }
  }

  takeDamage(damage: number): void {
    if (this.state === MonsterState.DEAD) return;

    this.currentHealth -= damage;

    this.sprite.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.state !== MonsterState.DEAD) {
        this.sprite.clearTint();
      }
    });

    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.state = MonsterState.DEAD;
    this.scene.events.emit("monster-killed", this, this.reward);

    this.sprite.setTint(0x666666);
    this.sprite.setAlpha(0.7);

    this.scene.time.delayedCall(500, () => {
      this.sprite.destroy();
    });
  }

  private reachCore(): void {
    this.scene.events.emit("monster-reached-core", this);
    this.sprite.destroy();
  }

  getCurrentHealth(): number {
    return this.currentHealth;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getReward(): number {
    return this.reward;
  }

  getState(): MonsterState {
    return this.state;
  }
}
