import { StateMachine } from "./StateMachine";
import { StatusEffectManager } from "./effects/StatusEffectManager";
import Base from "../Base";

export interface CombatEntity {
  stateMachine: StateMachine<CombatEntity>;
  statusEffects: StatusEffectManager;

  speedMultiplier: number;
  attackDamageMultiplier: number;
  attackSpeedMultiplier: number;

  move(delta: number): void;
  moveTowards(targetX: number, targetY: number, delta: number): void;
  findTarget(): CombatEntity | Base | null;
  attack(target: CombatEntity | Base): void;
  takeDamage(damage: number): void;
  heal(amount: number): void;

  playIdleAnimation(): void;
  playMoveAnimation(): void;
  playAttackAnimation(): void;
  playStunAnimation(): void;
  playDeadAnimation(): void;

  getSpeed(): number;
  getAttackDamage(): number;
  getAttackSpeed(): number;
  getAttackRange(): number;

  getCurrentHealth(): number;
  getMaxHealth(): number;
  isDead(): boolean;

  getScene(): Phaser.Scene;
  getX(): number;
  getY(): number;
}
