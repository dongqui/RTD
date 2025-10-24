import { SpineGameObject } from "@esotericsoftware/spine-phaser-v3";
import { CombatEntity } from "../fsm/CombatEntity";
import { StateMachine } from "../fsm/StateMachine";
import { StatusEffectManager } from "../fsm/effects/StatusEffectManager";
import { BehaviorState } from "../fsm/StateTypes";
import { MovingState } from "../fsm/states/MovingState";
import { AttackingState } from "../fsm/states/AttackingState";
import { DeadState } from "../fsm/states/DeadState";
import Base from "../Base";

export interface UnitConfig {
  health: number;
  speed: number;
  cost: number;
  scale?: number;
  attackRange?: number;
  attackDamage?: number;
  attackSpeed?: number;
}


export abstract class BaseUnit implements CombatEntity {
  protected static readonly HIT_ANIM_KEY = "Hit";
  protected static readonly DIE_ANIM_KEY = "Die";
  protected static readonly RUN_ANIM_KEY = "Run";

  protected maxHealth: number;
  protected currentHealth: number;
  protected speed: number;
  protected cost: number;
  protected scene: Phaser.Scene;
  public spineObject: SpineGameObject;

  protected attackRange: number;
  protected attackDamage: number;
  protected attackSpeed: number;
  private lastAttackTime: number = 0;

  public stateMachine: StateMachine<CombatEntity>;
  public statusEffects: StatusEffectManager;
  public speedMultiplier: number = 1;
  public attackDamageMultiplier: number = 1;
  public attackSpeedMultiplier: number = 1;

  constructor(scene: Phaser.Scene, x: number, y: number, config: UnitConfig) {
    this.scene = scene;
    this.maxHealth = config.health;
    this.currentHealth = config.health;
    this.speed = config.speed;
    this.cost = config.cost;

    this.attackRange = config.attackRange || 100;
    this.attackDamage = config.attackDamage || 10;
    this.attackSpeed = config.attackSpeed || 1000;

    this.spineObject = this.scene.add.spine(
      x,
      y,
      "fantasy_character",
      "fantasy_character-atlas"
    );

    this.setupAnimations();

    this.stateMachine = new StateMachine<CombatEntity>(this);
    this.statusEffects = new StatusEffectManager(this);

    this.stateMachine.registerState(BehaviorState.MOVING, new MovingState());
    this.stateMachine.registerState(BehaviorState.ATTACKING, new AttackingState());
    this.stateMachine.registerState(BehaviorState.DEAD, new DeadState());

    this.stateMachine.changeState(BehaviorState.MOVING);
  }

  protected abstract setupAnimations(): void;
  abstract playAttackAnimation(): void;

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
    if (this.stateMachine.isInState(BehaviorState.ATTACKING)) {
      return;
    }

    this.spineObject.animationState.setAnimation(
      0,
      BaseUnit.HIT_ANIM_KEY,
      false
    );

    const listener = {
      complete: () => {
        if (!this.isDead()) {
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

  playDeadAnimation(): void {
    this.spineObject.animationState.setAnimation(
      0,
      BaseUnit.DIE_ANIM_KEY,
      false
    );

    this.scene.events.emit("unit-killed", this);

    this.scene.time.delayedCall(1000, () => {
      if (this.spineObject) {
        this.spineObject.destroy();
      }
    });
  }

  update(_time: number, delta: number): void {
    this.statusEffects.update(delta);
    this.stateMachine.update(delta);
  }

  move(delta: number): void {
    const speed = this.getSpeed();
    const moveDistance = (speed * delta) / 1000;
    this.spineObject.x += moveDistance;
  }

  findTarget(): CombatEntity | Base | null {
    const monsters = this.scene.data.get("monsters") || [];
    const enemyBase = this.scene.data.get("enemyBase");

    let nearestTarget: any = null;
    let nearestDistance = Infinity;

    for (const monster of monsters) {
      if (monster.getState && monster.getState() === "dead") continue;

      const distance = Phaser.Math.Distance.Between(
        this.spineObject.x,
        this.spineObject.y,
        monster.sprite.x,
        monster.sprite.y
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = monster;
      }
    }

    if (nearestTarget) {
      return nearestTarget;
    }

    if (enemyBase && enemyBase.isActive()) {
      return enemyBase;
    }

    return null;
  }

  attack(target: CombatEntity | Base): void {
    const currentTime = this.scene.time.now;

    if (currentTime - this.lastAttackTime >= this.getAttackSpeed()) {
      this.lastAttackTime = currentTime;
      target.takeDamage(this.getAttackDamage());
      this.playAttackAnimation();
    }
  }

  heal(amount: number): void {
    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
  }

  playIdleAnimation(): void {
    this.playRunAnimation();
  }

  playMoveAnimation(): void {
    this.playRunAnimation();
  }

  playStunAnimation(): void {
    this.playHitAnimation();
  }

  getSpeed(): number {
    return this.speed * this.speedMultiplier;
  }

  getAttackDamage(): number {
    return this.attackDamage * this.attackDamageMultiplier;
  }

  getAttackSpeed(): number {
    return this.attackSpeed / this.attackSpeedMultiplier;
  }

  getAttackRange(): number {
    return this.attackRange;
  }

  isDead(): boolean {
    return this.currentHealth <= 0;
  }

  getScene(): Phaser.Scene {
    return this.scene;
  }

  getX(): number {
    return this.spineObject.x;
  }

  getY(): number {
    return this.spineObject.y;
  }

  takeDamage(damage: number): void {
    if (this.isDead()) {
      return;
    }

    this.currentHealth -= damage;
    this.playHitAnimation();

    if (this.currentHealth <= 0) {
      this.stateMachine.changeState(BehaviorState.DEAD);
    }
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
}
