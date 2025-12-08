import { SpineGameObject } from "@esotericsoftware/spine-phaser-v3";
import { Skin } from "@esotericsoftware/spine-core";
import { CombatEntity } from "../fsm/CombatEntity";
import { StateMachine } from "../fsm/StateMachine";
import { StatusEffectManager } from "../fsm/effects/StatusEffectManager";
import { BehaviorState } from "../fsm/StateTypes";
import { MovingState } from "../fsm/states/MovingState";
import { AttackingState } from "../fsm/states/AttackingState";
import { DeadState } from "../fsm/states/DeadState";
import { RevivingState } from "../fsm/states/RevivingState";
import { StunnedState } from "../fsm/states/StunnedState";
import Base from "../Base";
import { HealthBar } from "../ui/HealthBar";
import { SoundManager } from "../managers/SoundManager";

/**
 * Visual configuration interface for unit appearance
 */
export interface UnitVisual {
  skinColor: string;
  hairColor: string;
  skinKeys: string[];
  idleAnimKey: string;
  attackAnimKey: string;
}

/**
 * BaseUnit - Abstract base class for all combat entities (both heroes and enemies)
 * Contains common properties and methods shared between heroes and enemies
 */
export abstract class BaseUnit implements CombatEntity {
  protected maxHealth: number;
  protected currentHealth: number;
  protected speed: number;
  protected scene: Phaser.Scene;

  protected attackRange: number;
  protected attackDamage: number;
  protected attackSpeed: number;
  protected lastAttackTime: number = 0;

  public stateMachine: StateMachine<CombatEntity>;
  public statusEffects: StatusEffectManager;
  public speedMultiplier: number = 1;
  public attackDamageMultiplier: number = 1;
  public attackSpeedMultiplier: number = 1;

  public spineObject: SpineGameObject;
  protected healthBar: HealthBar;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.stateMachine = new StateMachine<CombatEntity>(this);
    this.statusEffects = new StatusEffectManager(this);

    this.stateMachine.registerState(BehaviorState.MOVING, new MovingState());
    this.stateMachine.registerState(
      BehaviorState.ATTACKING,
      new AttackingState()
    );
    this.stateMachine.registerState(BehaviorState.DEAD, new DeadState());
    this.stateMachine.registerState(
      BehaviorState.REVIVING,
      new RevivingState()
    );
    this.stateMachine.registerState(BehaviorState.STUNNED, new StunnedState());

    // Don't initialize state here - let subclass finish construction first
  }

  protected initializeState(): void {
    this.stateMachine.changeState(BehaviorState.MOVING);
  }

  // Animation key constants
  protected static readonly HIT_ANIM_KEY = "Hit";
  protected static readonly DIE_ANIM_KEY = "Die";
  protected static readonly RUN_ANIM_KEY = "Run";

  // Abstract methods that must be implemented by subclasses
  abstract findTarget(): CombatEntity | Base | null;
  abstract getVisualConfig(): UnitVisual;
  abstract getScaleX(): number;
  abstract getScaleY(): number;

  /**
   * Returns whether this unit is ranged (moves forward only) or melee (moves towards target)
   * Override in subclasses to specify unit type
   */
  protected isRanged(): boolean {
    return false; // Default: melee
  }

  update(_time: number, delta: number): void {
    this.statusEffects.update(delta);
    this.stateMachine.update(delta);
    if (this.healthBar && this.spineObject) {
      this.healthBar.update(
        this.currentHealth,
        this.maxHealth,
        this.spineObject.x,
        this.spineObject.y - 100
      );
    }
  }

  move(delta: number): void {
    const speed = this.getSpeed();
    const moveDistance = (speed * delta) / 1000;
    this.spineObject.x += this.getMoveDirection() * moveDistance;
  }

  moveTowards(targetX: number, targetY: number, delta: number): void {
    const speed = this.getSpeed();
    const moveDistance = (speed * delta) / 1000;

    if (this.isRanged()) {
      // Ranged units move forward only (direction-based)
      this.spineObject.x += this.getMoveDirection() * moveDistance;
    } else {
      // Melee units: prioritize horizontal movement, minimal vertical adjustment
      const xDistance = targetX - this.spineObject.x;
      const yDistance = targetY - this.spineObject.y;

      // Move primarily on X axis
      const xDirection = Math.sign(xDistance);
      this.spineObject.x += xDirection * moveDistance;

      // Only adjust Y if difference is significant (more than 30 pixels)
      const yThreshold = 30;
      if (Math.abs(yDistance) > yThreshold) {
        // Move Y slowly (20% of normal speed) to gradually align
        const yDirection = Math.sign(yDistance);
        this.spineObject.y += yDirection * moveDistance * 0.2;
      }
    }
  }

  /**
   * Returns the move direction multiplier (-1 for left, 1 for right)
   * Override in subclasses if needed
   */
  protected getMoveDirection(): number {
    return 1; // Default: move right
  }

  attack(target: CombatEntity | Base): void {
    const currentTime = this.scene.time.now;

    if (currentTime - this.lastAttackTime >= this.getAttackSpeed()) {
      this.lastAttackTime = currentTime;
      this.performAttack(target);
      this.playAttackAnimation();
      this.onAttack(target);
    }
  }

  /**
   * Called after attack is performed
   * Override in subclasses to add custom behavior (e.g., play sound)
   */
  protected onAttack(target: CombatEntity | Base): void {
    // Override in subclasses to add attack effects
    SoundManager.getInstance().playDelayed("sound_hit", 50, { volume: 0.3 });
  }

  protected performAttack(target: CombatEntity | Base): void {
    target.takeDamage(this.getAttackDamage(), this);
  }

  takeDamage(damage: number, attacker?: CombatEntity): void {
    if (this.isDead()) {
      return;
    }

    this.currentHealth -= damage;
    this.playHitAnimation();

    if (this.currentHealth <= 0) {
      this.onHPZero();
    }
  }

  onHPZero(): void {
    this.stateMachine.changeState(BehaviorState.DEAD);
  }

  protected playHitAnimation(): void {
    const skeleton = this.spineObject.skeleton;
    if (skeleton) {
      skeleton.color.r = 1;
      skeleton.color.g = 0.67;
      skeleton.color.b = 0.67;
    }
    if (this.healthBar) {
      this.healthBar.setVisible(true);
    }

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

  playStunAnimation(): void {
    // Hit 애니메이션 재생
    this.playHitAnimation();

    // Hit 스파인 애니메이션도 재생
    if (this.spineObject) {
      this.spineObject.animationState.setAnimation(
        0,
        BaseUnit.HIT_ANIM_KEY,
        false
      );
    }
  }

  heal(amount: number): void {
    this.currentHealth = Math.min(this.currentHealth + amount, this.maxHealth);
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

  getCurrentHealth(): number {
    return this.currentHealth;
  }

  getMaxHealth(): number {
    return this.maxHealth;
  }

  getX(): number {
    return this.spineObject.x;
  }

  getY(): number {
    return this.spineObject.y;
  }

  /**
   * Initialize spine object and health bar
   * Should be called by subclasses after setting up stats
   */
  protected initializeSpineObject(x: number, y: number): void {
    this.spineObject = this.scene.add.spine(
      x,
      y,
      "fantasy_character",
      "fantasy_character-atlas"
    );

    this.healthBar = new HealthBar(this.scene, x, y - 100);
    this.healthBar.setVisible(false);

    // Initialize status effect icon manager
    this.statusEffects.initialize(this.scene);
  }

  /**
   * Setup animations based on visual config
   * Should be called by subclasses after initializing spine object
   */
  protected setupAnimations(): void {
    const visual = this.getVisualConfig();
    const initSkin = new Skin("custom");

    visual.skinKeys.forEach((key) => {
      const skin = this.spineObject.skeleton.data.findSkin(key);
      if (skin) {
        initSkin.addSkin(skin);
      }
    });
    this.spineObject.skeleton.setSkin(initSkin);

    const skinSlots = ["arm_r", "leg_l", "leg_r", "body", "head", "arm_l"];
    const hairSlots = [
      "hair",
      "hair_back",
      "hair_front",
      "helmet_hair",
      "hair_hat",
      "beard",
      "brow",
    ];

    const skinRgb = this.hexToRgb(visual.skinColor);
    skinSlots.forEach((slotName) => {
      const slot = this.spineObject.skeleton.findSlot(slotName);
      if (slot) {
        slot.color.r = skinRgb.r / 255;
        slot.color.g = skinRgb.g / 255;
        slot.color.b = skinRgb.b / 255;
        slot.color.a = 1;
      }
    });

    const hairRgb = this.hexToRgb(visual.hairColor);
    hairSlots.forEach((slotName) => {
      const slot = this.spineObject.skeleton.findSlot(slotName);
      if (slot) {
        slot.color.r = hairRgb.r / 255;
        slot.color.g = hairRgb.g / 255;
        slot.color.b = hairRgb.b / 255;
        slot.color.a = 1;
      }
    });

    this.spineObject.setScale(this.getScaleX(), this.getScaleY());
    this.playMoveAnimation();
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

  playMoveAnimation(): void {
    this.spineObject.animationState.setAnimation(
      0,
      BaseUnit.RUN_ANIM_KEY,
      true
    );
  }

  playAttackAnimation(): void {
    const visual = this.getVisualConfig();
    this.spineObject.animationState.setAnimation(
      0,
      visual.attackAnimKey,
      false
    );

    const listener = {
      complete: () => {
        this.onAttackAnimationComplete();
        this.spineObject.animationState.removeListener(listener);
      },
    };

    this.spineObject.animationState.addListener(listener);
  }

  /**
   * Called when attack animation completes
   * Override in subclasses to customize behavior
   */
  protected onAttackAnimationComplete(): void {
    // Only play idle if we're still in attacking state
    if (this.stateMachine.getCurrentStateType() === BehaviorState.ATTACKING) {
      this.playIdleAnimation();
    }
  }

  playIdleAnimation(): void {
    const visual = this.getVisualConfig();
    const currentAnim = this.spineObject.animationState.getCurrent(0);
    if (currentAnim && currentAnim.animation?.name === visual.idleAnimKey) {
      return;
    }
    this.spineObject.animationState.setAnimation(0, visual.idleAnimKey, true);
  }

  playDeadAnimation(): void {
    this.spineObject.animationState.setAnimation(
      0,
      BaseUnit.DIE_ANIM_KEY,
      false
    );
  }

  /**
   * Called when unit dies
   * Override in subclasses to emit custom events
   */
  onDeath(): void {
    this.healthBar.destroy();
    if (this.spineObject) {
      this.spineObject.destroy();
    }
  }
}
