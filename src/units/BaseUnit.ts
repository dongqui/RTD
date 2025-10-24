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
  protected static readonly HIT_ANIM_KEY = "Hit";
  protected static readonly DIE_ANIM_KEY = "Die";
  protected static readonly RUN_ANIM_KEY = "Run";

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
  protected abstract playAttackAnimation(): void;

  protected playRunAnimation(): void {
    const currentAnim = this.spineObject.animationState.getCurrent(0);
    if (currentAnim && currentAnim.animation?.name === BaseUnit.RUN_ANIM_KEY) {
      return;
    }
    this.spineObject.animationState.setAnimation(
      0,
      BaseUnit.RUN_ANIM_KEY,
      true
    );
  }

  protected playHitAnimation(): void {
    if (this.state === UnitState.ATTACKING) {
      return;
    }

    this.spineObject.animationState.setAnimation(
      0,
      BaseUnit.HIT_ANIM_KEY,
      false
    );

    const listener = {
      complete: () => {
        if (this.state !== UnitState.DEAD) {
          this.spineObject.animationState.setAnimation(
            0,
            BaseUnit.RUN_ANIM_KEY,
            true
          );
        }
        this.spineObject.animationState.removeListener(listener);
      },
    };

    this.spineObject.animationState.addListener(listener);
  }

  protected playDieAnimation(): void {
    this.spineObject.animationState.setAnimation(
      0,
      BaseUnit.DIE_ANIM_KEY,
      false
    );
  }

  update(_time: number, delta: number): void {
    if (this.state === UnitState.DEAD) return;

    const target = this.findNearbyTarget();

    if (target) {
      if (this.state !== UnitState.ATTACKING) {
        this.state = UnitState.ATTACKING;
      }
      this.attackTarget(target);
    } else {
      if (this.state === UnitState.ATTACKING) {
        this.state = UnitState.MOVING;
        this.playRunAnimation();
      }
      this.moveRight(delta);
    }
  }

  private findNearbyTarget(): any | null {
    const monsters = this.scene.data.get("monsters") || [];
    const enemyBase = this.scene.data.get("enemyBase");

    let nearestTarget: any = null;
    let nearestDistance = Infinity;

    for (const monster of monsters) {
      if (monster.getState() === "dead") continue;

      const distance = Phaser.Math.Distance.Between(
        this.spineObject.x,
        this.spineObject.y,
        monster.sprite.x,
        monster.sprite.y
      );

      if (distance <= this.attackRange && distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = monster;
      }
    }

    if (nearestTarget) {
      return nearestTarget;
    }

    if (enemyBase && enemyBase.isActive()) {
      const baseDistance = Phaser.Math.Distance.Between(
        this.spineObject.x,
        this.spineObject.y,
        enemyBase.getX(),
        enemyBase.getY()
      );

      if (baseDistance <= this.attackRange) {
        return enemyBase;
      }
    }

    return null;
  }

  private attackTarget(target: any): void {
    const currentTime = this.scene.time.now;

    if (currentTime - this.lastAttackTime >= this.attackSpeed) {
      this.lastAttackTime = currentTime;
      target.takeDamage(this.attackDamage);

      this.playAttackAnimation();
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
    this.playHitAnimation();

    if (this.currentHealth <= 0) {
      this.die();
    }
  }

  private die(): void {
    this.state = UnitState.DEAD;
    this.scene.events.emit("unit-killed", this);

    this.playDieAnimation();

    this.scene.time.delayedCall(1000, () => {
      if (this.spineObject) {
        this.spineObject.destroy();
      }
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
