import { CombatEntity } from "../CombatEntity";
import { EffectIconConfig } from "./StatusEffectIconManager";

export enum EffectType {
  ATTACK_SPEED = "attack_speed",
  ATTACK_DAMAGE = "attack_damage",
  MOVE_SPEED = "move_speed",
  HEAL_OVER_TIME = "heal_over_time",
  DAMAGE_OVER_TIME = "damage_over_time",
}

export abstract class StatusEffect {
  protected type: EffectType;
  protected duration: number;
  protected remainingTime: number;
  protected id: string;

  constructor(type: EffectType, duration: number) {
    this.type = type;
    this.duration = duration;
    this.remainingTime = duration;
    this.id = `${type}_${Date.now()}_${Math.random()}`;
  }

  abstract apply(entity: CombatEntity): void;
  abstract remove(entity: CombatEntity): void;

  // 아이콘 설정을 반환하는 메서드 (옵션)
  getIconConfig(): EffectIconConfig | null {
    return null;
  }

  update(delta: number): void {
    this.remainingTime = Math.max(0, this.remainingTime - delta);
  }

  isExpired(): boolean {
    return this.remainingTime <= 0;
  }

  getType(): EffectType {
    return this.type;
  }

  getId(): string {
    return this.id;
  }

  getRemainingTime(): number {
    return this.remainingTime;
  }

  getDuration(): number {
    return this.duration;
  }
}
