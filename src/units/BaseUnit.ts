import { SpineGameObject } from "@esotericsoftware/spine-phaser-v3";

export interface UnitConfig {
  health: number;
  speed: number;
  cost: number;
  scale?: number;
  attackRange?: number;
  attackDamage?: number;
  attackSpeed?: number;
}

export enum UnitState {
  MOVING = "moving",
  ATTACKING = "attacking",
  DEAD = "dead",
}

export abstract class BaseUnit {
  protected maxHealth: number;
  protected currentHealth: number;
  protected speed: number;
  protected cost: number;
  protected state: UnitState;
  protected scene: Phaser.Scene;
  public spineObject: SpineGameObject;

  protected attackRange: number;
  protected attackDamage: number;
  protected attackSpeed: number;
  private lastAttackTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, config: UnitConfig) {
    this.scene = scene;
    this.maxHealth = config.health;
    this.currentHealth = config.health;
    this.speed = config.speed;
    this.cost = config.cost;
    this.state = UnitState.MOVING;

    this.attackRange = config.attackRange || 100;
    this.attackDamage = config.attackDamage || 10;
    this.attackSpeed = config.attackSpeed || 1000;

    this.spineObject = this.scene.add.spine(
      x,
      y,
      "fantasy_character",
      "fantasy_character-atlas"
    );

    // const scale = config.scale || 0.3;
    // this.spineObject.setScale(scale);

    this.setupAnimations();
  }

  protected abstract setupAnimations(): void;
  protected playAttackAnimation?(): void;
  protected playRunAnimation?(): void;

  update(_time: number, delta: number): void {
    if (this.state === UnitState.DEAD) return;

    const nearbyMonster = this.findNearbyMonster();

    if (nearbyMonster) {
      if (this.state !== UnitState.ATTACKING) {
        this.state = UnitState.ATTACKING;
      }
      this.attackMonster(nearbyMonster);
    } else {
      if (this.state === UnitState.ATTACKING) {
        this.state = UnitState.MOVING;
        if (this.playRunAnimation) {
          this.playRunAnimation();
        }
      }
      this.moveRight(delta);
    }
  }

  private findNearbyMonster(): any | null {
    const monsters = this.scene.data.get("monsters") || [];

    for (const monster of monsters) {
      if (monster.getState() === "dead") continue;

      const distance = Phaser.Math.Distance.Between(
        this.spineObject.x,
        this.spineObject.y,
        monster.sprite.x,
        monster.sprite.y
      );

      if (distance <= this.attackRange) {
        return monster;
      }
    }

    return null;
  }

  private attackMonster(monster: any): void {
    const currentTime = this.scene.time.now;

    if (currentTime - this.lastAttackTime >= this.attackSpeed) {
      this.lastAttackTime = currentTime;
      monster.takeDamage(this.attackDamage);

      if (this.playAttackAnimation) {
        this.playAttackAnimation();
      }

      this.spineObject.alpha = 0.5;
      this.scene.time.delayedCall(100, () => {
        if (this.state !== UnitState.DEAD) {
          this.spineObject.alpha = 1;
        }
      });
    }
  }

  private moveRight(delta: number): void {
    const moveDistance = (this.speed * delta) / 1000;
    this.spineObject.x += moveDistance;

    const gameWidth = this.scene.cameras.main.width;
    if (this.spineObject.x > gameWidth + 100) {
      this.reachEnemyBase();
    }
  }

  takeDamage(damage: number): void {
    if (this.state === UnitState.DEAD) {
      return;
    }

    this.currentHealth -= damage;

    this.spineObject.alpha = 0.5;
    this.scene.time.delayedCall(100, () => {
      if (this.state !== UnitState.DEAD) {
        this.spineObject.alpha = 1;
      }
    });

    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.state = UnitState.DEAD;
    this.scene.events.emit("unit-killed", this);

    this.spineObject.setAlpha(0.5);

    this.scene.time.delayedCall(500, () => {
      this.spineObject.destroy();
    });
  }

  private reachEnemyBase(): void {
    this.scene.events.emit("unit-reached-enemy-base", this);
    this.spineObject.destroy();
    this.state = UnitState.DEAD;
  }

  getCurrentHealth(): number {
    return this.currentHealth;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getCost(): number {
    return this.cost;
  }

  getState(): UnitState {
    return this.state;
  }
}
