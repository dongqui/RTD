import { CombatEntity } from "../../fsm/CombatEntity";
import { BehaviorState } from "../../fsm/StateTypes";
import Base from "../../Base";
import { HeroRegistry, HeroType, HeroSpec } from "./HeroRegistry";
import { SoundManager } from "../../utils/SoundManager";
import { BaseUnit, UnitVisual } from "../BaseUnit";

export interface HeroConfig {
  health: number;
  speed: number;
  cost: number;
  scale?: number;
  attackRange?: number;
  attackDamage?: number;
  attackSpeed?: number;
}

export abstract class BaseHero extends BaseUnit {
  protected spec: HeroSpec;
  protected cardId: string;
  protected cost: number;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    heroType: HeroType,
    cardId: string = ""
  ) {
    super(scene);

    this.spec = HeroRegistry.getSpec(heroType);
    this.cardId = cardId;

    this.maxHealth = this.spec.stats.health;
    this.currentHealth = this.spec.stats.health;
    this.speed = this.spec.stats.speed;
    this.cost = this.spec.cost;

    this.attackRange = this.spec.stats.attackRange;
    this.attackDamage = this.spec.stats.attackDamage;
    this.attackSpeed = this.spec.stats.attackSpeed;

    this.initializeSpineObject(x, y);
    this.setupAnimations();

    // Now that spineObject is initialized, we can start the state machine
    this.initializeState();
  }

  getVisualConfig(): UnitVisual {
    return this.spec.visual;
  }

  getScaleX(): number {
    return -0.5; // Heroes face right (flipped)
  }

  getScaleY(): number {
    return 0.5;
  }

  protected onAttackAnimationComplete(): void {
    const currentState = this.stateMachine.getCurrentStateType();
    if (currentState === BehaviorState.ATTACKING) {
      this.playIdleAnimation();
    } else {
      this.playMoveAnimation();
    }
  }

  protected onDeath(): void {
    this.scene.events.emit("hero-killed", this);
    this.scene.events.emit("hero-died", this.cardId);
  }

  protected isRanged(): boolean {
    return this.spec.isRanged ?? false;
  }

  findTarget(): CombatEntity | Base | null {
    const enemies = this.scene.data.get("enemies") || [];
    const enemyBase = this.scene.data.get("enemyBase");

    let nearestTarget: any = null;
    let nearestDistance = Infinity;

    for (const enemy of enemies) {
      if (enemy.isDead && enemy.isDead()) continue;

      const distance = Phaser.Math.Distance.Between(
        this.spineObject.x,
        this.spineObject.y,
        enemy.spineObject.x,
        enemy.spineObject.y
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = enemy;
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

  getCost(): number {
    return this.cost;
  }

  destroy(): void {
    // 기본 구현은 비어있음
    // 하위 클래스에서 override하여 리소스 정리
  }
}
