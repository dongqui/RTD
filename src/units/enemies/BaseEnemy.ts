import { CombatEntity } from "../../fsm/CombatEntity";
import Base from "../../Base";
import { EnemyRegistry, EnemyType, EnemySpec } from "./EnemyRegistry";
import { BaseUnit, UnitVisual } from "../BaseUnit";

export abstract class BaseEnemy extends BaseUnit {
  protected spec: EnemySpec;
  protected reward: number;

  constructor(scene: Phaser.Scene, x: number, y: number, enemyType: EnemyType) {
    super(scene);

    this.spec = EnemyRegistry.getSpec(enemyType);

    this.maxHealth = this.spec.stats.health;
    this.currentHealth = this.spec.stats.health;
    this.speed = this.spec.stats.speed;
    this.reward = this.spec.reward;

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
    return 0.5; // Enemies face left (no flip)
  }

  getScaleY(): number {
    return 0.5;
  }

  protected getMoveDirection(): number {
    return -1; // Enemies move left
  }

  findTarget(): CombatEntity | Base | null {
    const heroes = this.scene.data.get("heroes") || [];
    const playerBase = this.scene.data.get("playerBase");

    let nearestTarget: any = null;
    let nearestDistance = Infinity;

    for (const hero of heroes) {
      if (hero.isDead && hero.isDead()) continue;

      const distance = Phaser.Math.Distance.Between(
        this.spineObject.x,
        this.spineObject.y,
        hero.spineObject.x,
        hero.spineObject.y
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = hero;
      }
    }

    if (nearestTarget) {
      return nearestTarget;
    }

    if (playerBase && playerBase.isActive()) {
      return playerBase;
    }

    return null;
  }

  protected onDeath(): void {
    this.scene.events.emit("enemy-killed", this, this.reward);
  }

  setHealthMultiplier(multiplier: number): void {
    const healthRatio = this.currentHealth / this.maxHealth;
    this.maxHealth = Math.floor(this.maxHealth * multiplier);
    this.currentHealth = Math.floor(this.maxHealth * healthRatio);
  }

  setSpeedMultiplier(multiplier: number): void {
    this.speedMultiplier = multiplier;
  }

  setRewardMultiplier(multiplier: number): void {
    this.reward = Math.floor(this.reward * multiplier);
  }

  getReward(): number {
    return this.reward;
  }
}
