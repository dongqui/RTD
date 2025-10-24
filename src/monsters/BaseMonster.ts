import { CombatEntity } from "../fsm/CombatEntity";
import { StateMachine } from "../fsm/StateMachine";
import { StatusEffectManager } from "../fsm/effects/StatusEffectManager";
import { BehaviorState } from "../fsm/StateTypes";
import { MovingState } from "../fsm/states/MovingState";
import { AttackingState } from "../fsm/states/AttackingState";
import { DeadState } from "../fsm/states/DeadState";
import Base from "../Base";
import { HealthBar } from "../ui/HealthBar";

export interface MonsterConfig {
  health: number;
  speed: number;
  reward: number;
  textureKey: string;
  scale?: number;
  attackRange?: number;
  attackDamage?: number;
  attackSpeed?: number;
}

export abstract class BaseMonster implements CombatEntity {
  protected maxHealth: number;
  protected currentHealth: number;
  protected speed: number;
  protected reward: number;
  protected scene: Phaser.Scene;
  public sprite: Phaser.GameObjects.Sprite;
  protected healthBar: HealthBar;

  protected attackRange: number;
  protected attackDamage: number;
  protected attackSpeed: number;
  private lastAttackTime: number = 0;

  public stateMachine: StateMachine<CombatEntity>;
  public statusEffects: StatusEffectManager;
  public speedMultiplier: number = 1;
  public attackDamageMultiplier: number = 1;
  public attackSpeedMultiplier: number = 1;

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

    this.attackRange = config.attackRange || 100;
    this.attackDamage = config.attackDamage || 10;
    this.attackSpeed = config.attackSpeed || 1000;

    this.sprite = this.scene.add
      .sprite(x, y, config.textureKey)
      .setDisplaySize(128, 128)
      .setFlipX(true);

    this.healthBar = new HealthBar(this.scene, x, y - 80);
    this.healthBar.setVisible(false);

    this.stateMachine = new StateMachine<CombatEntity>(this);
    this.statusEffects = new StatusEffectManager(this);

    this.stateMachine.registerState(BehaviorState.MOVING, new MovingState());
    this.stateMachine.registerState(BehaviorState.ATTACKING, new AttackingState());
    this.stateMachine.registerState(BehaviorState.DEAD, new DeadState());

    this.stateMachine.changeState(BehaviorState.MOVING);
  }

  update(_time: number, delta: number): void {
    this.statusEffects.update(delta);
    this.stateMachine.update(delta);
    this.healthBar.update(
      this.currentHealth,
      this.maxHealth,
      this.sprite.x,
      this.sprite.y - 80
    );
  }

  move(delta: number): void {
    const speed = this.getSpeed();
    const moveDistance = (speed * delta) / 1000;
    this.sprite.x -= moveDistance;
  }

  findTarget(): CombatEntity | Base | null {
    const units = this.scene.data.get("units") || [];
    const playerBase = this.scene.data.get("playerBase");

    let nearestTarget: any = null;
    let nearestDistance = Infinity;

    for (const unit of units) {
      if (unit.isDead && unit.isDead()) continue;

      const distance = Phaser.Math.Distance.Between(
        this.sprite.x,
        this.sprite.y,
        unit.spineObject.x,
        unit.spineObject.y
      );

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestTarget = unit;
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

  attack(target: CombatEntity | Base): void {
    const currentTime = this.scene.time.now;

    if (currentTime - this.lastAttackTime >= this.getAttackSpeed()) {
      this.lastAttackTime = currentTime;
      target.takeDamage(this.getAttackDamage());
      this.playAttackAnimation();
    }
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

  heal(amount: number): void {
    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
  }

  playIdleAnimation(): void {
    this.sprite.clearTint();
  }

  playMoveAnimation(): void {
    this.sprite.clearTint();
  }

  playAttackAnimation(): void {
    this.sprite.setTint(0xff8800);
    this.scene.time.delayedCall(100, () => {
      if (!this.isDead()) {
        this.sprite.clearTint();
      }
    });
  }

  playStunAnimation(): void {
    this.playHitAnimation();
  }

  playHitAnimation(): void {
    this.sprite.setTint(0xffaaaa);
    this.healthBar.setVisible(true);

    this.scene.time.delayedCall(150, () => {
      if (!this.isDead() && this.sprite) {
        this.sprite.clearTint();
      }
    });

    this.scene.time.delayedCall(2000, () => {
      if (!this.isDead() && this.healthBar) {
        this.healthBar.setVisible(false);
      }
    });
  }

  playDeadAnimation(): void {
    this.scene.events.emit("monster-killed", this, this.reward);

    this.sprite.setTint(0x666666);
    this.sprite.setAlpha(0.7);
    this.healthBar.destroy();

    this.scene.time.delayedCall(500, () => {
      if (this.sprite) {
        this.sprite.destroy();
      }
    });
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
    return this.sprite.x;
  }

  getY(): number {
    return this.sprite.y;
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
}
