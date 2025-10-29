import { SpineGameObject } from "@esotericsoftware/spine-phaser-v3";
import { Skin } from "@esotericsoftware/spine-core";
import { CombatEntity } from "../fsm/CombatEntity";
import { StateMachine } from "../fsm/StateMachine";
import { StatusEffectManager } from "../fsm/effects/StatusEffectManager";
import { BehaviorState } from "../fsm/StateTypes";
import { MovingState } from "../fsm/states/MovingState";
import { AttackingState } from "../fsm/states/AttackingState";
import { DeadState } from "../fsm/states/DeadState";
import Base from "../Base";
import { HealthBar } from "../ui/HealthBar";
import { UnitRegistry, UnitType, UnitSpec } from "./UnitRegistry";

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

  protected spec: UnitSpec;
  protected cardId: string;

  protected maxHealth: number;
  protected currentHealth: number;
  protected speed: number;
  protected cost: number;
  protected scene: Phaser.Scene;
  public spineObject: SpineGameObject;
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

  constructor(scene: Phaser.Scene, x: number, y: number, unitType: UnitType, cardId: string = "") {
    this.scene = scene;
    this.spec = UnitRegistry.getSpec(unitType);
    this.cardId = cardId;

    this.maxHealth = this.spec.stats.health;
    this.currentHealth = this.spec.stats.health;
    this.speed = this.spec.stats.speed;
    this.cost = this.spec.cost;

    this.attackRange = this.spec.stats.attackRange;
    this.attackDamage = this.spec.stats.attackDamage;
    this.attackSpeed = this.spec.stats.attackSpeed;

    this.spineObject = this.scene.add.spine(
      x,
      y,
      "fantasy_character",
      "fantasy_character-atlas"
    );

    this.healthBar = new HealthBar(this.scene, x, y - 100);
    this.healthBar.setVisible(false);

    this.setupAnimations();

    this.stateMachine = new StateMachine<CombatEntity>(this);
    this.statusEffects = new StatusEffectManager(this);

    this.stateMachine.registerState(BehaviorState.MOVING, new MovingState());
    this.stateMachine.registerState(BehaviorState.ATTACKING, new AttackingState());
    this.stateMachine.registerState(BehaviorState.DEAD, new DeadState());

    this.stateMachine.changeState(BehaviorState.MOVING);
  }

  protected setupAnimations(): void {
    const initSkin = new Skin("custom");

    this.spec.visual.skinKeys.forEach((key) => {
      const skin = this.spineObject.skeleton.data.findSkin(key);
      if (skin) {
        initSkin.addSkin(skin);
      }
    });
    this.spineObject.skeleton.setSkin(initSkin);

    const skinSlots = ["arm_r", "leg_l", "leg_r", "body", "head", "arm_l"];
    const hairSlots = ["hair", "hair_back", "hair_front"];

    const skinRgb = this.hexToRgb(this.spec.visual.skinColor);
    skinSlots.forEach((slotName) => {
      const slot = this.spineObject.skeleton.findSlot(slotName);
      if (slot) {
        slot.color.r = skinRgb.r / 255;
        slot.color.g = skinRgb.g / 255;
        slot.color.b = skinRgb.b / 255;
        slot.color.a = 1;
      }
    });

    const hairRgb = this.hexToRgb(this.spec.visual.hairColor);
    hairSlots.forEach((slotName) => {
      const slot = this.spineObject.skeleton.findSlot(slotName);
      if (slot) {
        slot.color.r = hairRgb.r / 255;
        slot.color.g = hairRgb.g / 255;
        slot.color.b = hairRgb.b / 255;
        slot.color.a = 1;
      }
    });

    this.spineObject.setScale(-0.5, 0.5);
    this.playRunAnimation();
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 50, g: 60, b: 70 };
  }

  playAttackAnimation(): void {
    this.spineObject.animationState.setAnimation(
      0,
      this.spec.visual.attackAnimKey,
      false
    );

    const listener = {
      complete: () => {
        const currentState = this.stateMachine.getCurrentStateType();
        if (currentState === BehaviorState.ATTACKING) {
          this.playIdleAnimation();
        } else {
          this.playRunAnimation();
        }
        this.spineObject.animationState.removeListener(listener);
      },
    };

    this.spineObject.animationState.addListener(listener);
  }

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
    const skeleton = this.spineObject.skeleton;
    if (skeleton) {
      skeleton.color.r = 1;
      skeleton.color.g = 0.67;
      skeleton.color.b = 0.67;
    }
    this.healthBar.setVisible(true);

    this.scene.time.delayedCall(150, () => {
      if (!this.isDead() && this.spineObject) {
        const skeleton = this.spineObject.skeleton;
        if (skeleton) {
          skeleton.color.r = 1;
          skeleton.color.g = 1;
          skeleton.color.b = 1;
        }
      }
    });

    this.scene.time.delayedCall(2000, () => {
      if (!this.isDead() && this.healthBar) {
        this.healthBar.setVisible(false);
      }
    });
  }

  playDeadAnimation(): void {
    this.spineObject.animationState.setAnimation(
      0,
      BaseUnit.DIE_ANIM_KEY,
      false
    );

    this.healthBar.destroy();
    this.scene.events.emit("unit-killed", this);
    this.scene.events.emit("unit-died", this.cardId);

    this.scene.time.delayedCall(1000, () => {
      if (this.spineObject) {
        this.spineObject.destroy();
      }
    });
  }

  update(_time: number, delta: number): void {
    this.statusEffects.update(delta);
    this.stateMachine.update(delta);
    this.healthBar.update(
      this.currentHealth,
      this.maxHealth,
      this.spineObject.x,
      this.spineObject.y - 100
    );
  }

  move(delta: number): void {
    const speed = this.getSpeed();
    const moveDistance = (speed * delta) / 1000;
    this.spineObject.x += moveDistance;
  }

  moveTowards(targetX: number, targetY: number, delta: number): void {
    const speed = this.getSpeed();
    const moveDistance = (speed * delta) / 1000;

    if (this.spec.isRanged) {
      this.spineObject.x += moveDistance;
    } else {
      const angle = Phaser.Math.Angle.Between(
        this.spineObject.x,
        this.spineObject.y,
        targetX,
        targetY
      );

      this.spineObject.x += Math.cos(angle) * moveDistance;
      this.spineObject.y += Math.sin(angle) * moveDistance;
    }
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
    const currentAnim = this.spineObject.animationState.getCurrent(0);
    if (currentAnim && currentAnim.animation?.name === this.spec.visual.idleAnimKey) {
      return;
    }
    this.spineObject.animationState.setAnimation(
      0,
      this.spec.visual.idleAnimKey,
      true
    );
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

  getLastAttackTime(): number {
    return this.lastAttackTime;
  }

  setLastAttackTime(time: number): void {
    this.lastAttackTime = time;
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
